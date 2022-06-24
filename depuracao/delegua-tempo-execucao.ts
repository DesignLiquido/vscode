import * as fs from 'fs';
import * as Net from 'net';
import * as Path from 'path';

import { DebugProtocol } from '@vscode/debugprotocol';
import { EventEmitter } from 'events';

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
    private _connectType = 'sockets';
	private _host        = '127.0.0.1';
	private _port        = 7777;
	private _serverBase  = '';
	private _localBase   = '';

    private _conectado = false;
    private _inicializado = true;
    private _continuar = false;
    private _ehExcecao = false;
    private _instanciaRepl = false;
    private _ehValido = true;

    private _gettingFile = false;
    private _fileTotal = 0;
    private _fileReceived = 0;
    private _dataFile = '';
    private _fileBytes: Buffer;

    private _obtendoDados = false;
    private _dataTotal = 0;
    private _dataReceived = 0;
    private _dataBytes: Buffer;

    private _lastReplSource = '';

    private _comandosEnfileirados = new Array<string>();

    private _mapaDeVariaveis = new Map<string, string>();
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

    public constructor(isRepl = false) {
        super();
        this._instanciaRepl = isRepl;
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

        this._connectType = connectType;
        this._host = host;
        this._port = port;
        this._serverBase = serverBase;

        if (host === "127.0.0.1") {
            this._serverBase = "";
        }

        this.carregarFonte(program);
        this._originalLine = this.obterPrimeiraLinha();

        this.verificarPontosParada(this._arquivoFonte);
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
        this._continuar = true;
        this.enviarParaServidorDepuracao('continuar');
    }

    public conectarAoDepurador() : void {
		if (this._conectado) {
			return;
		}

		if (this._connectType === "sockets") {
			this.imprimirSaida('Conectando a ' + this._host + ":" + this._port + '...', '', -1, ''); // no new line
			//console.log('Connecting to ' + this._host + ":" + this._port + '...');

			let timeout  = this._host === '127.0.0.1' || this._host === 'localhost' || this._host === '' ? 10 : 30;
			this._conexaoDepurador.setTimeout(timeout * 1000);

			this._conexaoDepurador.connect(this._port, this._host, () => {
				this._conectado = true;
				this.imprimirSaida('Conectado ao servidor de depuração Delégua.');
				//console.log('Connected to ' + this._host + ":" + this._port + '...');

				if (DeleguaTempoExecucao._primeiraExecucao) {
				    this.exibirMensagemInformacao('Delégua: Conectado a ' + this._host + ":" + this._port +
					    '. Verifique o Debug Console para mensagens relacionadas da comunicação entre essa extensão e Delégua.');
				}

				this.enviarEvento('onStatusChange', 'Delégua: Conectado a ' + this._host + ":" + this._port);
				DeleguaTempoExecucao._primeiraExecucao = false;
				this._inicializado = false;

				if (!this._instanciaRepl && this._arquivoFonte !== '') {
					let arquivoServidor = this.obterCaminhoServidor(this._arquivoFonte);
					if (arquivoServidor !== undefined && arquivoServidor !== '') {
						//console.log('Sending serverFilename: [' + serverFilename + ']');
						this.enviarParaServidorDepuracao("arquivo-atual", arquivoServidor);
					}
					this.enviarTodosPontosParadaParaServidorDepuracao();
				}

				for (let i = 0; i < this._comandosEnfileirados.length; i++) {
					//console.log('Sending queued: ' + this._queuedCommands[i]);
					this.enviarParaServidorDepuracao(this._comandosEnfileirados[i]);
				}
				this._comandosEnfileirados.length = 0;
                this.enviarEvento('pararEmEntrada');
			});

			this._conexaoDepurador.on('data', (data: any) => {
				if (!this._obtendoDados) {
					let ind = data.toString().indexOf('\n');
					this._dataTotal = this._dataReceived = 0;
					if (ind > 0) {
						this._dataTotal = Number(data.slice(0, ind));
						//this.printDeléguaOutput('  Received data size: ' + this._dataTotal);
						if (isNaN(this._dataTotal)) {
							this._dataTotal = 0;
						}
					}
					if (this._dataTotal === 0) {
						this.processarDoDepurador(data);
						return;
					}
					if (data.length > ind + 1) {
						data = data.slice(ind + 1);
					} else {
						data = '';
					}
					this._obtendoDados = true;
					//this.printDeléguaOutput('  Started collecting data: ' + data.toString().substring(0,4));
				}
				if (this._obtendoDados) {
					if (this._dataReceived === 0) {
						this._dataBytes = data;
						this._dataReceived = data.length;
					} else {
					  //this.printDeléguaOutput('  EXTRA. Currently: ' + this._dataReceived +
					  // ', total: ' + this._dataTotal + ', new: ' + data.length);
						const totalLength = this._dataBytes.length + data.length;
						this._dataBytes = Buffer.concat([this._dataBytes, data], totalLength);
						this._dataReceived = totalLength;
					}
					if (this._dataReceived >= this._dataTotal) {
						this._dataTotal = this._dataReceived = 0;
						this._obtendoDados = false;
						//this.printDeléguaOutput('  COLLECTED: ' + this._dataBytes.toString().substring(0, 4) + "...");
						this.processarDoDepurador(this._dataBytes);
					}
				}
			});

			this._conexaoDepurador.on('timeout', () => {
				if (!this._conectado) {
					this.imprimirSaida("Tempo esgotado conectando a " + this._host + ":" + this._port);
					//this.printErrorMsg('Timeout connecting to ' + this._host + ":" + this._port);
					//console.log('Timeout connecting to ' + this._host + ":" + this._port + '...');
					this._conexaoDepurador.destroy();
				}
  		    });

			this._conexaoDepurador.on('close', () => {
				if (this._inicializado) {
					this.imprimirSaida('Não foi possível conectar a ' + this._host + ":" + this._port);
					this.printErrorMsg('Não foi possível conectar a ' + this._host + ":" + this._port);
					this.enviarEvento('onStatusChange', "Delégua: Não foi possível conectar a " + this._host + ":" + this._port);
				}
				//console.log('Closed connection to ' + this._host + ":" + this._port + '...');
				this._conectado = false;
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
        this.enviarEvento('fim');
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
            let numeroLinha = Number(detalhesArquivo[1].trim());
            let arquivo = this.obterCaminhoArquivoLocal(detalhesArquivo[0].trim());

            this._pilhaExecucao.push(<ElementoPilhaVsCode>{
                id: ++id,
                line: numeroLinha,
                name: linha[0].trim(),
                file: arquivo,
            });

            console.log(this._pilhaExecucao);
        }
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

    public setBreakPoint(path: string, line: number) : DeleguaPontoParada {
		//path = Path.normalize(path);
		path = Path.resolve(path);
		this.cachearNomeArquivo(path);

		let lower = path.toLowerCase();

		const pontoParada = <DeleguaPontoParada> { verificado: false, linha: line, id: this._breakpointId++ };
		let bps = this._pontosParada.get(lower);
		if (!bps) {
			bps = new Array<DeleguaPontoParada>();
			this._pontosParada.set(lower, bps);
		}
		bps.push(pontoParada);

		let bpMap = this._mapaPontosParada.get(lower);
		if (!bpMap) {
			bpMap = new Map<number, DeleguaPontoParada>();
		}
		bpMap.set(line, pontoParada);
		this._mapaPontosParada.set(lower, bpMap);
		if (lower.includes('functions.Delégua')) {
			this.printDebugMsg("Verifying " + path);
		}

		this.verificarPontosParada(path);

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
            DeleguaTempoExecucao._instancia = new DeleguaTempoExecucao(false);
        }

        return DeleguaTempoExecucao._instancia;
    }

    public static obterNovaInstancia(isRepl = false): DeleguaTempoExecucao {
        return new DeleguaTempoExecucao(isRepl);
    }

    public setExceptionsFilters(namedException: string | undefined, otherExceptions: boolean): void {
		// this.namedException = namedException;
		// this.otherExceptions = otherExceptions;
	}

    /**
     * Exibe a pilha de execução vinda do depurador no VSCode.
     * @param startFrame 
     * @param endFrame 
     * @returns 
     */
    public pilhaExecucao(startFrame: number, endFrame: number): any {
        this.enviarParaServidorDepuracao('pilha-execucao');
		const elementos = new Array<any>();
		for (let i = 0; i < this._pilhaExecucao.length; i ++) {
			let entrada = this._pilhaExecucao[i];
			elementos.push({
				index: entrada.id,
				name:  entrada.name,
				file:  entrada.file,
				line:  entrada.line
			});
		}

		return {
			frames: elementos,
			count: this._pilhaExecucao.length
		};
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

    public enviarPontosParadaParaServidorDepuracao(path: string) {
		if (!this._conectado) {
			return;
		}

		let filename = this.getActualFilename(path);
		path = Path.resolve(path);
		let lower = path.toLowerCase();

		let data = filename;
		let bps = this._pontosParada.get(lower) || [];

		for (let i = 0; i < bps.length; i ++) {
			let entry = bps[i].linha;
			data += "|" + entry;
		}
		this.enviarParaServidorDepuracao('adicionar-ponto-parada', data);
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

    public obterValorPonteiroMouse(nome: string): string {
        let lower = nome.toLowerCase();
        let hover = this._mapaDeHovers.get(lower);

        if (hover) {
            return nome + '=' + hover;
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

        return nome;
    }

    public obterValorVariavel(nome: string): string {
        let lower = nome.toLowerCase();
        let val = this._mapaDeVariaveis.get(lower);

        if (val) {
            return val;
        }

        return '--- desconhecido ---';
    }

    private carregarFonte(nomeArquivo: string) {
        if (nomeArquivo === null || nomeArquivo === undefined) {
            return;
        }
        nomeArquivo = Path.resolve(nomeArquivo);
        if (
            this._arquivoFonte !== null &&
            this._arquivoFonte !== undefined &&
            this._arquivoFonte.toLowerCase() === nomeArquivo.toLowerCase()
        ) {
            return;
        }
        if (this.verificarDepuracao(nomeArquivo)) {
            this.cachearNomeArquivo(nomeArquivo);
            this._arquivoFonte = nomeArquivo;
            this._conteudoFonte = fs
                .readFileSync(this._arquivoFonte)
                .toString()
                .split('\n');
        }
    }

    private obterPrimeiraLinha() : number {
		let firstLine = 1;
		if (this._conteudoFonte === null || this._conteudoFonte === undefined || this._conteudoFonte.length <= 1) {
			return 1;
		}
		let inComments = false;
		for (let i = 0; i < this._conteudoFonte.length; i++) {
			let line = this._conteudoFonte[i].trim();
			if (line === '') {
				continue;
			}
			firstLine = i;

			if (inComments) {
				let index = line.indexOf('*/');
				if (index >= 0) {
					if (index < line.length - 2) {
						break;
					}
					inComments = false;					 
				}
				continue;
			}

			if (line.startsWith('/*')) {
				inComments = true;
				i--;
				continue;
			}
			if (!line.startsWith('//')) {
				break;
			}
		}
		return firstLine;
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
     * @param dados Dados enviados pelo depurador.
     * @returns 
     */
    protected processarDoDepurador(dados: any) {
        if (!this._ehValido) {
            return;
        }

        const linhas = dados.toString().split('\n');
        // A linha 0 normalmente é descartada por ser a confirmação do comando recebido e/ou outras informações de uso futuro.
        // O cabeçalho da resposta normalmente começa na linha 1.
        let linhaAtual = 1;
        const primeiraLinha = linhas[linhaAtual++].trim();
        // let startVarsData = 1;
        // let startStackData = 1;

        switch (primeiraLinha) {
            case '--- pilha-execucao-resposta ---':
                console.log('Resposta de Pilha de Execução');
                this.popularPilhaExecucao(linhas);
                break;
            case '--- variaveis-resposta ---':
                console.log('Resposta de Variáveis');
                this.popularVariaveis(linhas);
                break;
            case '--- mensagem-saida ---':
                console.log('Mensagem de saída');
                this.imprimirSaida(linhas[2]);
            default:
                break;
        }

        /* if (response === 'repl' || response === '_repl') {
            if (response === '_repl') {
                for (let i = 1; i < linhas.length - 1; i++) {
                    let line = linhas[i].trim();
                    if (line !== '') {
                        this.imprimirSaida(linhas[i]);
                    }
                }
            }

            if (response === 'repl' && this._instanciaRepl) {
                this.enviarEvento('onReplMessage', dados.toString());
                this.desconectarDoDepurador();
            }

            return;
        }

        if (response === 'send_file' && linhas.length > 2) {
            this._gettingFile = true;
            this._fileTotal = Number(linhas[currLine++]);
            this._dataFile = linhas[currLine++];
            this._fileReceived = 0;

            if (linhas.length <= currLine + 1) {
                return;
            }

            let ind = dados.toString().indexOf(this._dataFile);
            if (ind > 0 && dados.length > ind + this._dataFile.length + 1) {
                dados = dados.slice(ind + this._dataFile.length + 1);
                //this._fileBytes = data;
                //this._fileReceived = this._fileBytes.length;
            }
        }

        if (this._gettingFile) {
            if (this._fileReceived === 0) {
                this._fileBytes = dados;
                this._fileReceived = this._fileBytes.length;
            } else if (response !== 'send_file') {
                const totalLength = this._fileBytes.length + dados.length;
                this._fileBytes = Buffer.concat(
                    [this._fileBytes, dados],
                    totalLength
                );
                this._fileReceived = totalLength;
            }

            if (this._fileReceived >= this._fileTotal) {
                let buffer = Buffer.from(this._fileBytes);
                fs.writeFileSync(this._dataFile, buffer);

                this._fileTotal = this._fileReceived = 0;
                this._gettingFile = false;
                this.imprimirSaida('Saved remote file to: ' + this._dataFile);

                if (this._instanciaRepl) {
                    this.enviarEvento(
                        'onReplMessage',
                        'Saved remote file to: ' + this._dataFile
                    );
                }
            }
            return;
        }

        if (response === 'tchau') {
            this.desconectarDoDepurador();
            return;
        }

        if (response === 'vars' || response === 'next' || response === 'excecao') {
            this._variaveisLocais.length = 0;
            this._variaveisGlobais.length = 0;
        }

        if (response === 'excecao') {
            this.enviarEvento('pararEmExcecao');
            this._ehExcecao = true;
            startVarsData = 2;
            let nbVarsLines = Number(linhas[startVarsData]);
            this.popularVariaveis(linhas, startVarsData, nbVarsLines);

            startStackData = startVarsData + nbVarsLines + 1;
            this.popularPilhaExecucao(linhas, startStackData);

            let msg = linhas.length < 2 ? '' : linhas[1];
            let headerMsg = 'Exception thrown. ' + msg + ' ';

            if (this._pilhaExecucao.length < 1) {
                this.imprimirSaida(headerMsg);
            } else {
                let entry = this._pilhaExecucao[0];
                this.imprimirSaida(headerMsg, entry.file, entry.line);
            }

            return;
        }
        if (response === 'next' && linhas.length > 3) {
            let filename = this.getLocalPath(linhas[currLine++]);
            this.carregarFonte(filename);
            this._originalLine = Number(linhas[currLine++]);
            let nbOutputLines = Number(linhas[currLine++]);

            for (
                let i = 0;
                i < nbOutputLines && currLine < linhas.length - 1;
                i += 2
            ) {
                let line = linhas[currLine++].trim();
                if (i === nbOutputLines - 1) {
                    break;
                }
                let parts = line.split('\t');
                let linenr = Number(parts[0]);
                let filename = parts.length < 2 ? this._arquivoFonte : parts[1];
                line = linhas[currLine++].trim();

                if (i >= nbOutputLines - 2 && line === '') {
                    break;
                }
                this.imprimirSaida(line, filename, linenr);
            }

            startVarsData = currLine;
            this._variaveisGlobais.push({
                name: '__line',
                type: 'number',
                value: String(this._originalLine + 1).trimRight(),
                variablesReference: 0,
            });
            if (this._originalLine >= 0) {
                if (this._continuar) {
                    let pontoParada = this.obterPontoParada(this._originalLine);
                    this.printDebugMsg(
                        'breakpoint on ' +
                            this._originalLine +
                            ': ' +
                            (pontoParada !== undefined)
                    );
                    if (pontoParada) {
                        this.executarUmaVez('pararEmPasso');
                    } else {
                        this.enviarParaServidorDepuracao('continuar');
                    }
                } else {
                    this.executarUmaVez('pararEmPasso');
                }
            }
        }
        if (response === 'vars' || response === 'next') {
            let nbVarsLines = Number(linhas[startVarsData]);
            this.popularVariaveis(linhas, startVarsData, nbVarsLines);
            startStackData = startVarsData + nbVarsLines + 1;
        }
        if (response === 'stack' || response === 'next') {
            this.popularPilhaExecucao(linhas, startStackData);
        }
        if (this._originalLine === -3) {
            this.desconectarDoDepurador();
            return;
        }
        if (
            response !== 'stack' &&
            response !== 'next' &&
            response !== 'file'
        ) {
            this.imprimirSaida(
                'GOT ' +
                    response +
                    ': ' +
                    linhas.length +
                    ' lines.' +
                    ' LAST: ' +
                    linhas[linhas.length - 2] +
                    ' : ' +
                    linhas[linhas.length - 1]
            );
        } */
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
        /*if (isRepl && this._sourceFile != '') {
            let msg = 'Cannot execute REPL while debugging.';
            this.printWarningMsg(msg);
            return;
        }*/

        /* let toSend = comando;
        if (dados !== '' || comando.indexOf('|') < 0) {
            toSend += '|' + dados;
        }
        if (!this._conectado) {
            //console.log('Connection not valid. Queueing [' + toSend + '] when connected.');
            this._comandosEnfileirados.push(toSend);
            return;
        } */

        //this._replSent = isRepl;
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
        if (!this.verificarDepuracao(this._arquivoFonte)) {
            return;
        }

        this._continuar = false;

        if (this._inicializado) {
            this.executarUmaVez(evento);
        } else {
            this.enviarParaServidorDepuracao('proximo');
        }
    }

    public adentrarEscopo(evento: string = 'pararEmPasso') {
        if (!this.verificarDepuracao(this._arquivoFonte)) {
            return;
        }
        this._continuar = false;
        this.enviarParaServidorDepuracao('adentrar-escopo');
    }

    public sairEscopo(evento: string = 'pararEmPasso') {
        if (!this.verificarDepuracao(this._arquivoFonte)) {
            return;
        }
        this._continuar = false;
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

    private verificarPontosParada(path: string) : void {
		if (!this.verificarDepuracao(path)) {
			return;
		}

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
	}
}
