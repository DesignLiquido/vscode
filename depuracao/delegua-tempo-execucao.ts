import * as Net from 'net';
import * as Path from 'path';

import { DebugProtocol } from '@vscode/debugprotocol';
import { EventEmitter } from 'events';
import { Subject } from 'await-notify';

import { DadosDepuracao } from './dados-depuracao';
import { ElementoPilhaVsCode } from './elemento-pilha';
import { DeleguaPontoParada } from './delegua-ponto-parada';

/**
 * Classe responsável por se comunicar com o depurador da linguagem Delégua, traduzindo as requisições do
 * Visual Studio Code para o depurador, e também recebendo instruções do depurador.
 */
export class DeleguaTempoExecucao extends EventEmitter {
    private static _instancia: DeleguaTempoExecucao;
    private _idInstancia = 0;

    private static _primeiraExecucao = true;

    private _conexaoDepurador = new Net.Socket();
    private _tipoConexao      = 'sockets';
	private _endereco         = '127.0.0.1';
	private _porta            = 7777;
	private _serverBase  = '';
	private _localBase   = '';

    private _conectado = false;
    private _inicializado = true;
    private _ehExcecao = false;
    private _ehValido = true;

    private _resultadoAvaliacao: string;
    private _avaliacaoFinalizada = new Subject();

    private _comandosEnfileirados = new Array<string>();

    private _mapaDeHovers = new Map<string, string>();
    private _mapaDeFuncoes = new Map<string, string>();
    private _mapaNomesArquivos = new Map<string, string>();

    // Estruturas de dados que guardam os pontos de parada definidos no VSCode.
    private _pontosParada = new Map<string, DeleguaPontoParada[]>();
    private _mapaPontosParada = new Map<string, Map<number, DeleguaPontoParada>>();

    // since we want to send breakpoint events, we will assign an id to every event
	// so that the frontend can match events with breakpoints.
	private _breakpointId    = 1;

    private _arquivoFonte = '';
    public get sourceFile() {
        return this._arquivoFonte;
    }

    // As linhas do arquivo sendo interpretado.
    private _conteudoFonte: string[];

    // A próxima linha a ser interpretada.
    private _originalLine = 0;

    private _variaveisLocais = new Array<DebugProtocol.Variable>();
    public get localVariables() {
        return this._variaveisLocais;
    }

    private _variaveisGlobais = new Array<DebugProtocol.Variable>();
    public get globalVariables() {
        return this._variaveisGlobais;
    }

    private _pilhaExecucao = new Array<ElementoPilhaVsCode>();

    public constructor() {
        super();

        this._idInstancia = DadosDepuracao.obterProximoId();
        let seSenao =
            'se (condicao) { ... } senao se (condicao) {} senao {}: Fluxo se-senaose-senao. Chaves {} são obrigatórias!';
        this._mapaDeFuncoes.set('se', seSenao);
        this._mapaDeFuncoes.set('senaose', seSenao);
        this._mapaDeFuncoes.set('senao', seSenao);
        this._mapaDeFuncoes.set(
            'enquanto',
            'enquanto (condicao) { ... }: Fluxo enquanto. Chaves {} são obrigatórias!'
        );
        this._mapaDeFuncoes.set(
            'para',
            'pata (i = 0; i < n; i++) { ... }: Fluxo para. Chaves {} são obrigatórias!'
        );

        this._mapaDeFuncoes.set(
            'funcao',
            'funcao f(arg1, arg2, ...) { ... } : Declaração de função'
        );

        this._pilhaExecucao = [];
    }

    public iniciar(program: string, stopOnEntry: boolean, connectType: string,
        host: string, port: number, serverBase = "") {

        this._tipoConexao = connectType;
        this._endereco = host;
        this._porta = port;
        this._serverBase = serverBase;

        if (host === "127.0.0.1") {
            this._serverBase = "";
        }

        // this.verificarPontosParada(this._arquivoFonte);
        this.conectarAoDepurador();

        if (stopOnEntry) {
            // we step once
            this.passo('stopOnEntry');
        } else {
            // we just start to run until we hit a breakpoint or an exception
            this.continuar();
        }
        //this.printDeléguaOutput('StartDebug ' + host + ":" + port + "(" + this._instanceId + ")");
    }

    cachearNomeArquivo(nomeArquivo: string) {
        nomeArquivo = Path.resolve(nomeArquivo);
        let lower = nomeArquivo.toLowerCase();
        if (lower === nomeArquivo) {
            return;
        }
        this._mapaNomesArquivos.set(lower, nomeArquivo);
    }

    /**
     * Comanda o depurador para continuar a execução.
     */
    public continuar() {
        /* if (!this.verificarDepuracao(this._arquivoFonte)) {
            return;
        } */

        this.enviarParaServidorDepuracao('continuar');
    }

    public conectarAoDepurador() : void {
		if (this._conectado) {
			return;
		}

		if (this._tipoConexao === "sockets") {
			this.imprimirSaida('Conectando a ' + this._endereco + ":" + this._porta + '...', '', -1, ''); // no new line
			//console.log('Connecting to ' + this._host + ":" + this._port + '...');

            // TODO: Por enquanto não precisa ter timeout. Avaliar a possibilidade de remover esse código completamente.
			// let timeout  = this._endereco === '127.0.0.1' || this._endereco === 'localhost' || this._endereco === '' ? 10 : 30;
			// this._conexaoDepurador.setTimeout(timeout * 1000);

			this._conexaoDepurador.connect(this._porta, this._endereco, () => {
				this._conectado = true;
				this.imprimirSaida('Conectado ao servidor de depuração Delégua.');
				//console.log('Connected to ' + this._host + ":" + this._port + '...');

				if (DeleguaTempoExecucao._primeiraExecucao) {
				    this.exibirMensagemInformacao('Delégua: Conectado a ' + this._endereco + ":" + this._porta +
					    '. Verifique o Debug Console do VSCode para mensagens relacionadas da comunicação entre essa extensão e Delégua.');
				}

				this.enviarEvento('onStatusChange', 'Delégua: Conectado a ' + this._endereco + ":" + this._porta);
				DeleguaTempoExecucao._primeiraExecucao = false;
				this._inicializado = false;

                this.enviarTodosPontosParadaParaServidorDepuracao();

				for (let i = 0; i < this._comandosEnfileirados.length; i++) {
					//console.log('Sending queued: ' + this._queuedCommands[i]);
					this.enviarParaServidorDepuracao(this._comandosEnfileirados[i]);
				}
				this._comandosEnfileirados.length = 0;
                this.enviarEvento('pararEmEntrada');
			});

			this._conexaoDepurador.on('data', (data: any) => {                
                this.processarDoDepurador(data);
			});

			this._conexaoDepurador.on('timeout', () => {
				if (!this._conectado) {
					this.imprimirSaida("Tempo esgotado conectando a " + this._endereco + ":" + this._porta);
					//this.printErrorMsg('Timeout connecting to ' + this._host + ":" + this._port);
					//console.log('Timeout connecting to ' + this._host + ":" + this._port + '...');
					this._conexaoDepurador.destroy();
				}
  		    });

			this._conexaoDepurador.on('close', () => {
				if (this._inicializado) {
					this.imprimirSaida('Não foi possível conectar a ' + this._endereco + ":" + this._porta);
					this.printErrorMsg('Não foi possível conectar a ' + this._endereco + ":" + this._porta);
					this.enviarEvento('onStatusChange', "Delégua: Não foi possível conectar a " + this._endereco + ":" + this._porta);
				}

				this._conectado = false;
                this.enviarEvento('finalizar');
			});
		}
	}

    /**
	 * Return words of the given address range as "instructions"
	 */
	public disassemble(address: number, instructionCount: number): any[] {

		const instructions: any[] = [];

		/* for (let a = address; a < address + instructionCount; a++) {
			if (a >= 0 && a < this.instructions.length) {
				instructions.push({
					address: a,
					instruction: this.instructions[a].name,
					line: this.instructions[a].line
				});
			} else {
				instructions.push({
					address: a,
					instruction: 'nop'
				});
			}
		} */

		return instructions;
	}

    desconectarDoDepurador() {
        if (!this._ehValido) {
            return;
        }

        this.imprimirSaida('Fim da depuração.');
        this.enviarParaServidorDepuracao('tchau');
        this._conectado = false;
        this._arquivoFonte = '';
        this._conexaoDepurador.end();
        this.enviarEvento('finalizar');
        this._ehValido = false;
        DadosDepuracao.obterProximoId();
        DeleguaTempoExecucao._instancia = DeleguaTempoExecucao.obterInstancia(true);
    }

    /**
     * Popula a pilha de execução vinda como resposta do depurador.
     * @param linhas As linhas devolvidas.
     */
    popularPilhaExecucao(linhas: string[]): void {
        let id = 0;
        this._pilhaExecucao = [];
        // As duas primeiras linhas são estruturas do cabeçalho da resposta. 
        // A última linha é o final da resposta. 
        for (let i = 2; i < linhas.length - 1; i++) {
            let linha: string[] = linhas[i].split('---');
            let detalhesArquivo = linha[1].split('::');
            let numeroLinha = Number(detalhesArquivo[2].trim());
            let arquivo = this.obterCaminhoArquivoLocal(detalhesArquivo[0].trim());
            const metodo = detalhesArquivo[1].trim();

            this._pilhaExecucao.push(<ElementoPilhaVsCode>{
                id: ++id,
                linha: numeroLinha,
                nome: linha[0].trim(),
                arquivo: arquivo,
                metodo: metodo
            });
        }

        console.log(this._pilhaExecucao);
    }

    /**
     * Popula variáveis de acordo com retorno do depurador.
     * @param linhas 
     */
    popularVariaveis(linhas: string[]) {
        this._variaveisGlobais = [];
        this._variaveisLocais = [];

        // As duas primeiras linhas são estruturas do cabeçalho da resposta. 
        // A última linha é o final da resposta. 
        for (let i = 2; i < linhas.length - 1; i++) {
            const informacoes: string[] = linhas[i].split('::');
            let item = {
                name: informacoes[0].trim(),
                type: informacoes[1].trim(),
                value: informacoes[2].trim(),
                variablesReference: 0,
            };
            this._variaveisLocais.push(item);
            /* counter++;
            let line = linhas[i];
            let tokens = line.split(':');

            if (tokens.length < 4) {
                continue;
            }

            let name = tokens[0];
            let globLoc = tokens[1];
            let type = tokens[2];
            let value = tokens.slice(3).join(':').trimRight();

            if (type === 'string') {
                value = '"' + value + '"';
            }

            if (globLoc === '1') {
                this._variaveisGlobais.push(item);
            } else {
                this._variaveisLocais.push(item);
            }

            let lower = name.toLowerCase();
            this._mapaDeHovers.set(lower, value);
            this._mapaDeVariaveis.set(lower, value); */
        }
    }

    private emitirEventosParaLinha(linha: number, stepEvent?: string): boolean {
        if (linha >= this._conteudoFonte.length) {
            return false;
        }

        const line = this._conteudoFonte[linha].trim();

        // Se a linha é um comentário, pula para a próxima linha.
        if (line.startsWith('//')) {
            this._originalLine++;
            return this.emitirEventosParaLinha(this._originalLine, stepEvent);
        }

        // É um ponto de parada?
        let pontoParada = this.obterPontoParada(linha);
        if (pontoParada) {
            this.enviarEvento('pararEmPontoParada');
            if (!pontoParada.verificado) {
                pontoParada.verificado = true;
                this.enviarEvento('pontoDeParadaValidado', pontoParada);
            }
            return true;
        }

        if (stepEvent && line.length > 0) {
            this.enviarEvento(stepEvent);
            this.printDebugMsg('sent event ' + stepEvent + ', ln:' + linha);
            return true;
        }

        return false;
    }

    public getLocalVariable(name: string): any {
		return null;
	}

    public clearAllDataBreakpoints(): void {
		// this.breakAddresses.clear();
	}

    public clearInstructionBreakpoints(): void {
		// this.instructionBreakpoints.clear();
	}

    public limparTodosPontosParada(path: string): void {
		let pathname = Path.resolve(path);
		let lower = pathname.toLowerCase();
		this._pontosParada.delete(lower);
		this._mapaPontosParada.delete(lower);
	}

    /*
	 * 
	 */
	public obterPontosParada(path: string, line: number): number[] {
        return [];
	}

    public setInstructionBreakpoint(address: number): boolean {
		// this.instructionBreakpoints.add(address);
		return true;
	}

    public definirPontoParada(path: string, line: number) : DeleguaPontoParada {
		//path = Path.normalize(path);
		path = Path.resolve(path);
		this.cachearNomeArquivo(path);

		let lower = path.toLowerCase();

        // Por enquanto não precisa verificar o ponto de parada.
		const pontoParada = <DeleguaPontoParada> { verificado: true, linha: line, id: this._breakpointId++ };
		let pontosParada = this._pontosParada.get(lower);
		if (!pontosParada) {
			pontosParada = new Array<DeleguaPontoParada>();
			this._pontosParada.set(lower, pontosParada);
		}
		pontosParada.push(pontoParada);

		let mapaPontosParada = this._mapaPontosParada.get(lower);
		if (!mapaPontosParada) {
			mapaPontosParada = new Map<number, DeleguaPontoParada>();
		}
		mapaPontosParada.set(line, pontoParada);
		this._mapaPontosParada.set(lower, mapaPontosParada);
		/* if (lower.includes('functions.Delégua')) {
			this.printDebugMsg("Verifying " + path);
		} */

		// this.verificarPontosParada(path);

		return pontoParada;
	}

    public setDataBreakpoint(address: string, accessType: 'read' | 'write' | 'readWrite'): boolean {

		/* const x = accessType === 'readWrite' ? 'read write' : accessType;

		const t = this.breakAddresses.get(address);
		if (t) {
			if (t !== x) {
				this.breakAddresses.set(address, 'read write');
			}
		} else {
			this.breakAddresses.set(address, x);
		} */
		return true;
	}

    private obterPontoParada(linha: number): DeleguaPontoParada | undefined {
        let pathname = Path.resolve(this._arquivoFonte);
        let lower = pathname.toLowerCase();
        let mapaPontosParada = this._mapaPontosParada.get(lower);
        if (!mapaPontosParada) {
            return undefined;
        }
        let pontoParada = mapaPontosParada.get(linha);
        return pontoParada;
    }

    public static obterInstancia(recarregar = false): DeleguaTempoExecucao {
        let delegua = DeleguaTempoExecucao._instancia;

        if (
            delegua === null ||
            recarregar ||
            (!delegua._conectado && !delegua._inicializado) ||
            !DadosDepuracao.mesmaInstancia(delegua._idInstancia)
        ) {
            DeleguaTempoExecucao._instancia = new DeleguaTempoExecucao();
        }

        return DeleguaTempoExecucao._instancia;
    }

    public static obterNovaInstancia(): DeleguaTempoExecucao {
        return new DeleguaTempoExecucao();
    }

    public setExceptionsFilters(namedException: string | undefined, otherExceptions: boolean): void {
		// this.namedException = namedException;
		// this.otherExceptions = otherExceptions;
	}

    /**
     * Exibe a pilha de execução vinda do depurador no VSCode.
     * @returns Objeto com os elementos da pilha e a contagem de elementos.
     */
    public pilhaExecucao(): any {
        this.enviarParaServidorDepuracao('pilha-execucao');
		const elementos = new Array<any>();
		for (let i = 0; i < this._pilhaExecucao.length; i ++) {
			let entrada = this._pilhaExecucao[i];
			elementos.push({
				index: entrada.id,
				name:  entrada.nome,
				file:  entrada.arquivo,
				line:  entrada.linha
			});
		}

		return elementos;
	}

    public variaveis() {
        this.enviarParaServidorDepuracao('variaveis');
    }

    obterCaminhoArquivoLocal(pathname: string) {
        if (pathname === undefined || pathname === null || pathname === '') {
            return '';
        }
        if (this._serverBase === '') {
            return pathname;
        }

        pathname = pathname.normalize();
        pathname = pathname.split('\\').join('/');
        let filename = Path.basename(pathname);
        this.setLocalBasePath(pathname);

        let localPath = Path.join(this._localBase, filename);
        return localPath;
    }

    obterCaminhoServidor(pathname: string)
	{
		if (this._serverBase === "") {
			return pathname;
		}

		pathname = pathname.normalize();
		this.setLocalBasePath(pathname);

		let filename = Path.basename(pathname);
		let serverPath = Path.join(this._serverBase, filename);
		serverPath = this.substituir(serverPath, "\\", "/");
		return serverPath;
	}

    enviarTodosPontosParadaParaServidorDepuracao() {
		let keys = Array.from(this._pontosParada.keys() );
		for (let i = 0; i < keys.length; i ++) {
			let path = keys[i];
			this.enviarPontosParadaParaServidorDepuracao(path);
		}
	}

    public enviarPontosParadaParaServidorDepuracao(caminho: string) {
		const caminhoMinusculo = Path.resolve(caminho).toLowerCase();

		let pontosParada = this._pontosParada.get(caminhoMinusculo) || [];

		for (let i = 0; i < pontosParada.length; i ++) {
            this.enviarParaServidorDepuracao('adicionar-ponto-parada', 
                caminhoMinusculo + ' ' + pontosParada[i].linha);
		}
	}

    substituir(texto: string, separador: string, textoSubstituicao: string): string {
        texto = texto.split(separador).join(textoSubstituicao);
        return texto;
    }

    getActualFilename(filename: string): string {
		//filename = Path.normalize(filename);
		let pathname = Path.resolve(filename);
		let lower = pathname.toLowerCase();
		let result = this._mapaNomesArquivos.get(lower);
		if (result === undefined || result === null) {
			return filename;
		}
		return result;
	}

    public obterValorPonteiroMouse(expressao: string): string {
        let lower = expressao.toLowerCase();
        let hover = this._mapaDeHovers.get(lower);

        if (hover) {
            return expressao + '=' + hover;
        }

        hover = this._mapaDeFuncoes.get(lower);

        if (hover) {
            return hover;
        }

        let ind = lower.toString().indexOf('.');
        if (ind >= 0 && ind < lower.length - 1) {
            hover = this._mapaDeFuncoes.get(lower.substring(ind + 1));
            if (hover) {
                return hover;
            }
        }

        return expressao;
    }

    /**
     * Pede uma avaliação para o servidor de depuração de uma variável. 
     * Espera a finalizaão da avaliação e devolve `this._resultadoAvaliacao`.
     * @param nome O nome da variável
     * @returns Promise que devolve o resultado da avaliação.
     */
    public obterValorVariavel(nome: string): Promise<string> {
        this._resultadoAvaliacao = '';
        this._avaliacaoFinalizada = new Subject();
        this.enviarParaServidorDepuracao('avaliar ' + nome + '\n');
        return new Promise<string>((resolve, reject) => {
            this._avaliacaoFinalizada.wait(1000).then(() => {
                resolve(this._resultadoAvaliacao);
            });
        });
    }

    public imprimirSaida(mensagem: string, arquivo = '', linha = -1, novaLinha = '\n') {
        //console.error('Delégua> ' + msg + ' \r\n');
        //console.error();
        arquivo = arquivo === '' ? this._arquivoFonte : arquivo;
        arquivo = this.obterCaminhoArquivoLocal(arquivo);
        linha = linha >= 0 ? linha : 
            this._originalLine >= 0 ? this._originalLine : this._arquivoFonte.length - 1;
        //this.printDebugMsg("PRINT " + msg + " " + file + " " + line);
        this.enviarEvento('saida', mensagem, arquivo, linha, 0, novaLinha);
    }

    public printDebugMsg(msg: string) {
        //console.info('    _' + msg);
    }

    /**
     * Processa dados enviados pelo depurador para a extensão.
     * Pela natureza de `socket.write()`, o que pode acontecer aqui é receber mais de um comando por vez do depurador.
     * Quando isso ocorre, para cada comando enviado, é preciso achar o final da resposta, 
     * processar a resposta e excluir as linhas já processadas para o próximo comando. 
     * @param dados Dados enviados pelo depurador.
     * @returns 
     */
    protected processarDoDepurador(dados: any) {
        if (!this._ehValido) {
            return;
        }

        const linhas = dados.toString().split('\n');
        let linhaAtual = 0;
        while (linhaAtual < linhas.length) {
            // A primeira linha de cada comando normalmente é descartada por ser a confirmação do comando recebido 
            // e/ou outras informações de uso futuro.
            linhaAtual++;
            // O cabeçalho da resposta normalmente começa na segunda linha de cada comando.
            const primeiraLinhaComando = linhas[linhaAtual].trim();
            linhaAtual++;

            switch (primeiraLinhaComando) {
                case '--- avaliar-resposta ---':
                    this._resultadoAvaliacao = linhas[linhaAtual];
                    this._avaliacaoFinalizada.notify();
                    break;
                case '--- continuar-resposta ---':
                    console.log('Execução continou e parou em um ponto de parada');
                    this.enviarParaServidorDepuracao('pilha-execucao');
                    this.enviarParaServidorDepuracao('variaveis');
                    this.enviarEvento('pararEmEntrada');
                    break;
                case '--- finalizando ---':
                    this.enviarEvento('finalizar');
                    break;
                case '--- mensagem-saida ---':
                    // console.log('Mensagem de saída');
                    this.imprimirSaida(linhas[linhaAtual]);
                    break;
                case '--- proximo-resposta ---':
                    console.log('Execução do próximo comando');
                    this.enviarParaServidorDepuracao('pilha-execucao');
                    this.enviarParaServidorDepuracao('variaveis');
                    this.enviarEvento('pararEmEntrada');
                    break;
                case '--- pilha-execucao-resposta ---':
                    // console.log('Resposta de Pilha de Execução');
                    this.popularPilhaExecucao(linhas);
                    break;
                case '--- variaveis-resposta ---':
                    // console.log('Resposta de Variáveis');
                    this.popularVariaveis(linhas);
                    break;
                default:
                    break;
            }

            linhaAtual++;
        }
    }

    private executarUmaVez(stepEvent?: string) {
        this.emitirEventosParaLinha(this._originalLine, stepEvent);
    }

    /**
     * Efetivamente envia o evento para o objeto de sessão de depuração.
     * @param evento O nome do evento, conforme lista de eventos no construtor da sessão de depuração.
     * @param argumentos Vetor de argumentos adicionais.
     */
    private enviarEvento(evento: string, ...argumentos: any[]) {
        setImmediate((_) => {
            this.emit(evento, ...argumentos);
        });
    }

    /**
     * Envia para servidor de depuração um comando.
     * @param comando O nome do comando.
     * @param dados Dados adicionais, caso necessário.
     * @returns 
     */
    public enviarParaServidorDepuracao(comando: string, dados = '') {
        if (dados !== '') {
            comando += ' ' + dados;
        }
        this._conexaoDepurador.write(comando + '\n');
    }

    setLocalBasePath(pathname: string) {
        if (
            this._localBase !== undefined &&
            this._localBase !== null &&
            this._localBase !== ''
        ) {
            return;
        }

        if (pathname === undefined || pathname === null) {
            this._localBase = '';
            return;
        }

        pathname = Path.resolve(pathname);
        this._localBase = Path.dirname(pathname);
    }

    public passo(evento: string = 'pararEmPasso') {
        this.enviarParaServidorDepuracao('proximo');
    }

    public adentrarEscopo(evento: string = 'pararEmPasso') {
        this.enviarParaServidorDepuracao('adentrar-escopo');
    }

    public sairEscopo(evento: string = 'pararEmPasso') {
        this.enviarParaServidorDepuracao('sair-escopo');
    }

    public verificarDepuracao(arquivo: string): boolean {
        return (
            this.verificarExcecao() &&
            arquivo !== null &&
            typeof arquivo !== 'undefined' &&
            (arquivo.endsWith('cs') || arquivo.endsWith('mqs'))
        );
    }

    public printErrorMsg(mensagem: string) {
		this.enviarEvento('mensagemErro', mensagem);
	}

    public exibirMensagemInformacao(mensagem: string) {
		this.enviarEvento('mensagemInformacao', mensagem);
	}

    private verificarExcecao(): boolean {
        if (this._ehExcecao) {
            this.desconectarDoDepurador();
            return false;
        }
        return true;
    }

    /* private verificarPontosParada(path: string) : void {
		path = Path.resolve(path);
		let lower = path.toLowerCase();

		let mapaPontosParada = this._mapaPontosParada.get(lower);
		//this.printDebugMsg("Verifying " + path);
		let sourceLines = this._conteudoFonte;
		if (sourceLines === null) {
			this.carregarFonte(path);
			//sourceLines = readFileSync(path).toString().split('\n');
			sourceLines = this._conteudoFonte;
		}
		if (mapaPontosParada && mapaPontosParada.size > 0 && sourceLines) {
			mapaPontosParada.forEach(pontoParada => {
				if (!pontoParada.verificado && pontoParada.linha < sourceLines.length) {
					const srcLine = sourceLines[pontoParada.linha].trim();

					// if a line is empty or starts with '//' we don't allow to set a breakpoint but move the breakpoint down
					if (srcLine.length === 0 || srcLine.startsWith('//')) {
						pontoParada.linha++;
					}
					pontoParada.verificado = true;
					this.printDebugMsg("validated bp " + pontoParada.linha + ': ' + sourceLines[pontoParada.linha].trim());
					this.enviarEvento('breakpointValidated', pontoParada);
				}
			});
		}
	} */
}
