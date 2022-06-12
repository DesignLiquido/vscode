import * as fs from 'fs';
import * as Net from 'net';
import * as Path from 'path';

import { DebugProtocol } from '@vscode/debugprotocol';
import { EventEmitter } from 'events';

import { DadosDepuracao } from './dados-depuracao';
import { ElementoPilha } from './elemento-pilha';
import { DeleguaPontoParada } from './delegua-ponto-parada';

/**
 * Classe responsável por se comunicar com o depurador da linguagem Delégua.
 */
export class DeleguaTempoExecucao extends EventEmitter {
    private static _instancia: DeleguaTempoExecucao;
    private _idInstancia = 0;

    private static _primeiraExecucao = true;

    private _conexaoDepurador = new Net.Socket();

    private _conectado = false;
    private _inicializar = true;
    private _continuar = false;
    private _ehExcecao = false;
    private _instanciaRepl = false;
    private _ehValido = true;

    private _gettingFile = false;
    private _fileTotal = 0;
    private _fileReceived = 0;
    private _dataFile = '';
    private _fileBytes: Buffer;

    private _gettingData = false;
    private _dataTotal = 0;
    private _dataReceived = 0;
    private _dataBytes: Buffer;

    private _lastReplSource = '';

    private _queuedCommands = new Array<string>();

    private _mapaDeVariaveis = new Map<string, string>();
    private _mapaDeHovers = new Map<string, string>();
    private _mapaDeFuncoes = new Map<string, string>();
    private _mapaNomesArquivos = new Map<string, string>();

    // Estruturas de dados que guardam os pontos de parada definidos no VSCode.
    private _pontosParada = new Map<string, DeleguaPontoParada[]>();
    private _mapaPontosParada = new Map<string, Map<number, DeleguaPontoParada>>();

    private _serverBase = '';
    private _localBase = '';

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

    private _stackTrace = new Array<ElementoPilha>();

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
    }

    cachearNomeArquivo(nomeArquivo: string) {
        nomeArquivo = Path.resolve(nomeArquivo);
        let lower = nomeArquivo.toLowerCase();
        if (lower === nomeArquivo) {
            return;
        }
        this._mapaNomesArquivos.set(lower, nomeArquivo);
    }

    public continuar() {
        if (!this.verificarDepuracao(this._arquivoFonte)) {
            return;
        }
        this._continuar = true;
        this.enviarParaServidorDepuracao('continuar');
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

    popularPilhaExecucao(lines: string[], start = 0): void {
        let id = 0;
        this._stackTrace.length = 0;
        for (let i = start; i < lines.length; i += 3) {
            if (i >= lines.length - 2) {
                break;
            }
            let ln = Number(lines[i]);
            let file = this.getLocalPath(lines[i + 1].trim());
            let line = lines[i + 2].trim();

            const entry = <ElementoPilha>{
                id: ++id,
                line: ln,
                name: line,
                file: file,
            };
            this._stackTrace.push(entry);

            //this.printDebugMsg(file + ', line ' + ln + ':\t' + line);
        }
    }

    popularVariaveis(lines: string[], startVarsData: number, nbVarsLines: number) {
        let counter = 0;
        for (
            let i = startVarsData + 1;
            i < lines.length && counter < nbVarsLines;
            i++
        ) {
            counter++;
            let line = lines[i];
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

            let item = {
                name: name,
                type: type,
                value: value,
                variablesReference: 0,
            };

            if (globLoc === '1') {
                this._variaveisGlobais.push(item);
            } else {
                this._variaveisLocais.push(item);
            }

            let lower = name.toLowerCase();
            this._mapaDeHovers.set(lower, value);
            this._mapaDeVariaveis.set(lower, value);
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
            (!delegua._conectado && !delegua._inicializar) ||
            !DadosDepuracao.mesmaInstancia(delegua._idInstancia)
        ) {
            DeleguaTempoExecucao._instancia = new DeleguaTempoExecucao(false);
        }

        return DeleguaTempoExecucao._instancia;
    }

    public static obterNovaInstancia(isRepl = false): DeleguaTempoExecucao {
        return new DeleguaTempoExecucao(isRepl);
    }

    getLocalPath(pathname: string) {
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

    substituir(texto: string, separador: string, textoSubstituicao: string): string {
        texto = texto.split(separador).join(textoSubstituicao);
        return texto;
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

    public imprimirSaida(mensagem: string, arquivo = '', linha = -1, novaLinha = '\n') {
        //console.error('CSCS> ' + msg + ' \r\n');
        //console.error();
        arquivo = arquivo === '' ? this._arquivoFonte : arquivo;
        arquivo = this.getLocalPath(arquivo);
        linha = linha >= 0 ? linha : 
            this._originalLine >= 0 ? this._originalLine : this._arquivoFonte.length - 1;
        //this.printDebugMsg("PRINT " + msg + " " + file + " " + line);
        this.enviarEvento('saida', mensagem, arquivo, linha, 0, novaLinha);
    }

    public printDebugMsg(msg: string) {
        //console.info('    _' + msg);
    }

    protected processarDoDepurador(dados: any) {
        if (!this._ehValido) {
            return;
        }

        let lines = dados.toString().split('\n');
        let currLine = 0;
        let response = lines[currLine++].trim();
        let startVarsData = 1;
        let startStackData = 1;

        if (response === 'repl' || response === '_repl') {
            if (response === '_repl') {
                for (let i = 1; i < lines.length - 1; i++) {
                    let line = lines[i].trim();
                    if (line !== '') {
                        this.imprimirSaida(lines[i]);
                    }
                }
            }

            if (response === 'repl' && this._instanciaRepl) {
                this.enviarEvento('onReplMessage', dados.toString());
                this.desconectarDoDepurador();
            }

            return;
        }

        if (response === 'send_file' && lines.length > 2) {
            this._gettingFile = true;
            this._fileTotal = Number(lines[currLine++]);
            this._dataFile = lines[currLine++];
            this._fileReceived = 0;

            if (lines.length <= currLine + 1) {
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
            let nbVarsLines = Number(lines[startVarsData]);
            this.popularVariaveis(lines, startVarsData, nbVarsLines);

            startStackData = startVarsData + nbVarsLines + 1;
            this.popularPilhaExecucao(lines, startStackData);

            let msg = lines.length < 2 ? '' : lines[1];
            let headerMsg = 'Exception thrown. ' + msg + ' ';

            if (this._stackTrace.length < 1) {
                this.imprimirSaida(headerMsg);
            } else {
                let entry = this._stackTrace[0];
                this.imprimirSaida(headerMsg, entry.file, entry.line);
            }

            return;
        }
        if (response === 'next' && lines.length > 3) {
            let filename = this.getLocalPath(lines[currLine++]);
            this.carregarFonte(filename);
            this._originalLine = Number(lines[currLine++]);
            let nbOutputLines = Number(lines[currLine++]);

            for (
                let i = 0;
                i < nbOutputLines && currLine < lines.length - 1;
                i += 2
            ) {
                let line = lines[currLine++].trim();
                if (i === nbOutputLines - 1) {
                    break;
                }
                let parts = line.split('\t');
                let linenr = Number(parts[0]);
                let filename = parts.length < 2 ? this._arquivoFonte : parts[1];
                line = lines[currLine++].trim();

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
            let nbVarsLines = Number(lines[startVarsData]);
            this.popularVariaveis(lines, startVarsData, nbVarsLines);
            startStackData = startVarsData + nbVarsLines + 1;
        }
        if (response === 'stack' || response === 'next') {
            this.popularPilhaExecucao(lines, startStackData);
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
                    lines.length +
                    ' lines.' +
                    ' LAST: ' +
                    lines[lines.length - 2] +
                    ' : ' +
                    lines[lines.length - 1]
            );
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

    public enviarParaServidorDepuracao(comando: string, dados = '') {
        /*if (isRepl && this._sourceFile != '') {
            let msg = 'Cannot execute REPL while debugging.';
            this.printWarningMsg(msg);
            return;
        }*/

        let toSend = comando;
        if (dados !== '' || comando.indexOf('|') < 0) {
            toSend += '|' + dados;
        }
        if (!this._conectado) {
            //console.log('Connection not valid. Queueing [' + toSend + '] when connected.');
            this._queuedCommands.push(toSend);
            return;
        }

        //this._replSent = isRepl;
        this._conexaoDepurador.write(toSend + '\n');
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

    public step(evento = 'pararEmPasso') {
        if (!this.verificarDepuracao(this._arquivoFonte)) {
            return;
        }

        this._continuar = false;

        if (this._inicializar) {
            this.executarUmaVez(evento);
        } else {
            this.enviarParaServidorDepuracao('proximo');
        }
    }

    public adentrarEscopo(event = 'pararEmPasso') {
        if (!this.verificarDepuracao(this._arquivoFonte)) {
            return;
        }
        this._continuar = false;
        this.enviarParaServidorDepuracao('adentrar-escopo');
    }

    public sairEscopo(event = 'pararEmPasso') {
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

    private verificarExcecao(): boolean {
        if (this._ehExcecao) {
            this.desconectarDoDepurador();
            return false;
        }
        return true;
    }
}
