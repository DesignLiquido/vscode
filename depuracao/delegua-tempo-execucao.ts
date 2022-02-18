import { DebugProtocol } from '@vscode/debugprotocol';
import { EventEmitter } from 'events';
import * as fs from 'fs';
import * as Net from 'net';
import * as Path from 'path';

import { Data } from './dados-depuracao';
import { StackEntry } from './elemento-pilha';
import { CscsBreakpoint } from './ponto-parada';

/**
 * Classe responsável por se comunicar com o motor da linguagem Delégua.
 */
export class DeleguaTempoExecucao extends EventEmitter {
    private static _instance: DeleguaTempoExecucao;
    private _instanceId = 0;

    private static _firstRun = true;

    private _debugger = new Net.Socket();

    private _connected = false;
    private _init = true;
    private _continue = false;
    private _isException = false;
    private _replInstance = false;
    private _isValid = true;

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
    private _filenamesMap = new Map<string, string>();

    // Estruturas de dados que guardam os pontos de parada definidos no VSCode.
    private _breakPoints = new Map<string, CscsBreakpoint[]>();
    private _breakPointMap = new Map<string, Map<number, CscsBreakpoint>>();

    private _serverBase = '';
    private _localBase = '';

    private _sourceFile = '';
    public get sourceFile() {
        return this._sourceFile;
    }

    // As linhas do arquivo sendo interpretado.
    private _sourceLines: string[];

    // A próxima linha a ser interpretada.
    private _originalLine = 0;

    private _localVariables = new Array<DebugProtocol.Variable>();
	public get localVariables() {
		return this._localVariables;
	}

	private _globalVariables = new Array<DebugProtocol.Variable>();
	public get globalVariables() {
		return this._globalVariables;
	}

    private _stackTrace = new Array<StackEntry>();

    public constructor(isRepl = false) {
        super();
        this._replInstance = isRepl;
        this._instanceId = Data.getNextId();
        let ifelse = "se (condicao) { ... } senao se (condicao) {} senao {}: Fluxo se-senaose-senao. Chaves {} são obrigatórias!";
        this._mapaDeFuncoes.set("se", ifelse);
        this._mapaDeFuncoes.set("senao se", ifelse);
        this._mapaDeFuncoes.set("senao", ifelse);
        this._mapaDeFuncoes.set("enquanto", "enquanto (condicao) { ... }: Fluxo enquanto. Chaves {} são obrigatórias!");
        this._mapaDeFuncoes.set("para", "pata (i = 0; i < n; i++) { ... }: Fluxo para. Chaves {} são obrigatórias!");

        this._mapaDeFuncoes.set("funcao", "funcao f(arg1, arg2, ...) { ... } : Declaração de função");
    }

    cacheFilename(filename: string) {
		filename = Path.resolve(filename);
		let lower = filename.toLowerCase();
		if (lower === filename) {
			return;
		}
		this._filenamesMap.set(lower, filename);
	}

    public continue() {
        if (!this.verificarDepuracao(this._sourceFile)) {
            return;
        }
        this._continue = true;
        this.sendToServer('continuar');
    }

    disconnectFromDebugger() {
        if (!this._isValid) {
            return;
        }

        this.printCSCSOutput('Fim da depuração.');
        this.sendToServer('tchau');
        this._connected = false;
        this._sourceFile = '';
        this._debugger.end();
        this.sendEvent('fim');
        this._isValid = false;
        Data.getNextId();
        DeleguaTempoExecucao._instance = DeleguaTempoExecucao.getInstance(true);
    }

    fillStackTrace(lines : string[], start = 0) : void {
		let id = 0;
		this._stackTrace.length = 0;
		for (let i = start; i < lines.length; i += 3) {
			if (i >= lines.length - 2) {
				break;
			}
			let ln    = Number(lines[i]);
			let file  = this.getLocalPath(lines[i + 1].trim());
			let line  = lines[i + 2].trim();

			const entry = <StackEntry> { id: ++id, line : ln, name : line, file: file };
			this._stackTrace.push(entry);

			//this.printDebugMsg(file + ', line ' + ln + ':\t' + line);
		}
	}

    fillVars(lines : string[], startVarsData : number, nbVarsLines : number)  {
		let counter = 0;
		for (let i = startVarsData + 1; i < lines.length && counter < nbVarsLines; i++) {
			counter++;
			let line = lines[i];
			let tokens  = line.split(':');
			if (tokens.length < 4) {
				continue;
			}
			let name    = tokens[0];
			let globLoc = tokens[1];
			let type    = tokens[2];
			let value   = tokens.slice(3).join(':').trimRight();
			if (type === 'string') {
				value = '"' + value + '"';
			}
			let item = {
				name: name,
				type: type,
				value: value,
				variablesReference: 0
			}
			if (globLoc === '1') {
				this._globalVariables.push(item);
			} else {
				this._localVariables.push(item);
			}
			let lower = name.toLowerCase();
			this._mapaDeHovers.set(lower, value);
			this._mapaDeVariaveis.set(lower, value);
		}
	}

    private fireEventsForLine(ln: number, stepEvent?: string): boolean {
        if (ln >= this._sourceLines.length) {
            return false;
        }

        const line = this._sourceLines[ln].trim();

        // Se a linha é um comentário, pula para a próxima linha.
        if (line.startsWith('//')) {
            this._originalLine++;
            return this.fireEventsForLine(this._originalLine, stepEvent);
        }

        // É um ponto de parada?
        let bp = this.getBreakPoint(ln);
        if (bp) {
            this.sendEvent('stopOnBreakpoint');
            if (!bp.verified) {
                bp.verified = true;
                this.sendEvent('breakpointValidated', bp);
            }
            return true;
        }

        if (stepEvent && line.length > 0) {
            this.sendEvent(stepEvent);
            this.printDebugMsg('sent event ' + stepEvent + ', ln:' + ln);
            return true;
        }

        return false;
    }

    private getBreakPoint(line: number): CscsBreakpoint | undefined {
        let pathname = Path.resolve(this._sourceFile);
        let lower = pathname.toLowerCase();
        let bpMap = this._breakPointMap.get(lower);
        if (!bpMap) {
            return undefined;
        }
        let bp = bpMap.get(line);
        return bp;
    }

    public static getInstance(reload = false): DeleguaTempoExecucao {
        let cscs = DeleguaTempoExecucao._instance;

        if (cscs === null || reload ||
            (!cscs._connected && !cscs._init) ||
            !Data.sameInstance(cscs._instanceId)) {
            DeleguaTempoExecucao._instance = new DeleguaTempoExecucao(false);
        }

        return DeleguaTempoExecucao._instance;
    }

    public static getNewInstance(isRepl = false): DeleguaTempoExecucao {
        return new DeleguaTempoExecucao(isRepl);
    }

    getLocalPath(pathname: string) {
        if (pathname === undefined || pathname === null || pathname === "") {
            return '';
        }
        if (this._serverBase === "") {
            return pathname;
        }

        pathname = pathname.normalize();
        pathname = pathname.split("\\").join("/");
        let filename = Path.basename(pathname);
        this.setLocalBasePath(pathname);

        let localPath = Path.join(this._localBase, filename);
        return localPath;
    }

    replace(str: string, search: string, replacement: string) {
        str = str.split(search).join(replacement);
        return str;
    }

    public getHoverValue(key: string): string {
        let lower = key.toLowerCase();
        let hover = this._mapaDeHovers.get(lower);

        if (hover) {
            return key + "=" + hover;
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

        return key;
    }

    public getVariableValue(key: string): string {
        let lower = key.toLowerCase();
        let val = this._mapaDeVariaveis.get(lower);

        if (val) {
            return val;
        }

        return "--- unknown ---";
    }

    private loadSource(filename: string) {
		if (filename === null || filename === undefined) {
			return;
		}
		filename = Path.resolve(filename);
		if (this._sourceFile !== null && this._sourceFile !== undefined &&
			  this._sourceFile.toLowerCase() === filename.toLowerCase()) {
			return;
		}
		if (this.verificarDepuracao(filename)) {
			this.cacheFilename(filename);
			this._sourceFile =  filename;
			this._sourceLines = fs.readFileSync(this._sourceFile).toString().split('\n');
		}
	}

    public printCSCSOutput(msg: string, file = "", line = -1, newLine = '\n') {
        //console.error('CSCS> ' + msg + ' \r\n');
        //console.error();
        file = file === "" ? this._sourceFile : file;
        file = this.getLocalPath(file);
        line = line >= 0 ? line : this._originalLine >= 0 ? this._originalLine : this._sourceFile.length - 1;
        //this.printDebugMsg("PRINT " + msg + " " + file + " " + line);
        this.sendEvent('output', msg, file, line, 0, newLine);
    }

    public printDebugMsg(msg: string) {
        //console.info('    _' + msg);
    }

    protected processFromDebugger(data: any) {
        if (!this._isValid) {
            return;
        }

        let lines = data.toString().split('\n');
        let currLine = 0;
        let response = lines[currLine++].trim();
        let startVarsData = 1;
        let startStackData = 1;

        if (response === 'repl' || response === '_repl') {
            if (response === '_repl') {
                for (let i = 1; i < lines.length - 1; i++) {
                    let line = lines[i].trim();
                    if (line !== '') {
                        this.printCSCSOutput(lines[i]);
                    }
                }
            }

            if (response === 'repl' && this._replInstance) {
                this.sendEvent('onReplMessage', data.toString());
                this.disconnectFromDebugger();
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

            let ind = data.toString().indexOf(this._dataFile);
            if (ind > 0 && data.length > ind + this._dataFile.length + 1) {
                data = data.slice(ind + this._dataFile.length + 1);
                //this._fileBytes = data;
                //this._fileReceived = this._fileBytes.length;
            }
        }

        if (this._gettingFile) {
            if (this._fileReceived === 0) {
                this._fileBytes = data;
                this._fileReceived = this._fileBytes.length;
            } else if (response !== 'send_file') {
                const totalLength = this._fileBytes.length + data.length;
                this._fileBytes = Buffer.concat([this._fileBytes, data], totalLength);
                this._fileReceived = totalLength;
            }

            if (this._fileReceived >= this._fileTotal) {
                let buffer = Buffer.from(this._fileBytes);
                fs.writeFileSync(this._dataFile, buffer);

                this._fileTotal = this._fileReceived = 0;
                this._gettingFile = false;
                this.printCSCSOutput('Saved remote file to: ' + this._dataFile);
                
                if (this._replInstance) {
                    this.sendEvent('onReplMessage', 'Saved remote file to: ' + this._dataFile);
                }
            }
            return;
        }

        if (response === 'end') {
            this.disconnectFromDebugger();
            return;
        }

        if (response === 'vars' || response === 'next' || response === 'exc') {
            this._localVariables.length = 0;
            this._globalVariables.length = 0;
        }

        if (response === 'exc') {
            this.sendEvent('stopOnException');
            this._isException = true;
            startVarsData = 2;
            let nbVarsLines = Number(lines[startVarsData]);
            this.fillVars(lines, startVarsData, nbVarsLines);

            startStackData = startVarsData + nbVarsLines + 1;
            this.fillStackTrace(lines, startStackData);

            let msg = lines.length < 2 ? '' : lines[1];
            let headerMsg = 'Exception thrown. ' + msg + ' ';

            if (this._stackTrace.length < 1) {
                this.printCSCSOutput(headerMsg);
            } else {
                let entry = this._stackTrace[0];
                this.printCSCSOutput(headerMsg, entry.file, entry.line);
            }

            return;
        }
        if (response === 'next' && lines.length > 3) {
            let filename = this.getLocalPath(lines[currLine++]);
            this.loadSource(filename);
            this._originalLine = Number(lines[currLine++]);
            let nbOutputLines = Number(lines[currLine++]);

            for (let i = 0; i < nbOutputLines && currLine < lines.length - 1; i += 2) {
                let line = lines[currLine++].trim();
                if (i === nbOutputLines - 1) {
                    break;
                }
                let parts = line.split('\t');
                let linenr = Number(parts[0]);
                let filename = parts.length < 2 ? this._sourceFile : parts[1];
                line = lines[currLine++].trim();

                if (i >= nbOutputLines - 2 && line === '') {
                    break;
                }
                this.printCSCSOutput(line, filename, linenr);
            }

            startVarsData = currLine;
            this._globalVariables.push({
                name: '__line',
                type: 'number',
                value: String(this._originalLine + 1).trimRight(),
                variablesReference: 0
            });
            if (this._originalLine >= 0) {
                if (this._continue) {
                    let bp = this.getBreakPoint(this._originalLine);
                    this.printDebugMsg('breakpoint on ' + this._originalLine + ': ' + (bp !== undefined));
                    if (bp) {
                        this.runOnce('stopOnStep');
                    } else {
                        this.sendToServer('continue');
                    }
                } else {
                    this.runOnce('stopOnStep');
                }
            }
        }
        if (response === 'vars' || response === 'next') {
            let nbVarsLines = Number(lines[startVarsData]);
            this.fillVars(lines, startVarsData, nbVarsLines);
            startStackData = startVarsData + nbVarsLines + 1;
        }
        if (response === 'stack' || response === 'next') {
            this.fillStackTrace(lines, startStackData);
        }
        if (this._originalLine === -3) {
            this.disconnectFromDebugger();
            return;
        }
        if (response !== 'stack' && response !== 'next' && response !== 'file') {
            this.printCSCSOutput('GOT ' + response + ": " + lines.length + " lines." +
                ' LAST: ' + lines[lines.length - 2] + " : " + lines[lines.length - 1]);
        }
    }

    private runOnce(stepEvent?: string) {
        this.fireEventsForLine(this._originalLine, stepEvent);
    }

    private sendEvent(event: string, ...args: any[]) {
        setImmediate(_ => {
            this.emit(event, ...args);
        });
    }

    public sendToServer(cmd: string, data = "") {
        /*if (isRepl && this._sourceFile != '') {
            let msg = 'Cannot execute REPL while debugging.';
            this.printWarningMsg(msg);
            return;
        }*/

        let toSend = cmd;
        if (data !== '' || cmd.indexOf('|') < 0) {
            toSend += '|' + data;
        }
        if (!this._connected) {
            //console.log('Connection not valid. Queueing [' + toSend + '] when connected.');
            this._queuedCommands.push(toSend);
            return;
        }

        //this._replSent = isRepl;
        this._debugger.write(toSend + "\n");
    }

    setLocalBasePath(pathname: string) {
        if (this._localBase !== undefined && this._localBase !== null && this._localBase !== '') {
            return;
        }

        if (pathname === undefined || pathname === null) {
            this._localBase = '';
            return;
        }

        pathname = Path.resolve(pathname);
        this._localBase = Path.dirname(pathname);
    }

    public step(event = 'stopOnStep') {
        if (!this.verificarDepuracao(this._sourceFile)) {
            return;
        }

        this._continue = false;

        if (this._init) {
            this.runOnce(event);
        } else {
            this.sendToServer('next');
        }
    }

    public stepIn(event = 'stopOnStep') {
        if (!this.verificarDepuracao(this._sourceFile)) {
            return;
        }
        this._continue = false;
        this.sendToServer('stepin');
    }

    public stepOut(event = 'stopOnStep') {
        if (!this.verificarDepuracao(this._sourceFile)) {
            return;
        }
        this._continue = false;
        this.sendToServer('stepout');
    }

    public verificarDepuracao(arquivo: string): boolean {
        return this.verificarExcecao() && arquivo !== null &&
            typeof arquivo !== 'undefined' &&
            (arquivo.endsWith('cs') ||
                arquivo.endsWith('mqs'));
    }

    private verificarExcecao(): boolean {
        if (this._isException) {
            this.disconnectFromDebugger();
            return false;
        }
        return true;
    }
}
