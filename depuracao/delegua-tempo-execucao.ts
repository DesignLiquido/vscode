import { EventEmitter } from 'events';
import * as Net from 'net';
import * as Path from 'path';
import { Data } from './dados-depuracao';
import { CscsBreakpoint } from './ponto-parada';

/**
 * Classe responsável por se comunicar com o motor da linguagem Delégua.
 */
export class DeleguaTempoExecucao extends EventEmitter {
    private static _instance: DeleguaTempoExecucao;
    private _instanceId  = 0;

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
	private _breakPoints     = new Map<string, CscsBreakpoint[]>();
	private _breakPointMap   = new Map<string, Map<number, CscsBreakpoint>>();

    private _serverBase  = '';
	private _localBase   = '';

    private _sourceFile = '';
    public get sourceFile() {
        return this._sourceFile;
    }

    // As linhas do arquivo sendo interpretado.
	private _sourceLines: string[];

    // A próxima linha a ser interpretada.
	private _originalLine = 0;

    public constructor(isRepl = false) {
		super();
		this._replInstance = isRepl;
		this._instanceId = Data.getNextId();
		let ifelse = "if(condition) { ... } elif (condition) {} else {}: if-elif-else control flow. Curly braces {} are mandatory!";
		this._mapaDeFuncoes.set("if", ifelse);
		this._mapaDeFuncoes.set("elif", ifelse);
		this._mapaDeFuncoes.set("else", ifelse);
		this._mapaDeFuncoes.set("while", "while(condition) { ... }: While control flow. Curly braces {} are mandatory!");
		this._mapaDeFuncoes.set("for", "for(i : array) OR for(i=0; i<n; i++) { ... }: For control flow statements. Curly braces {} are mandatory!");

		this._mapaDeFuncoes.set("function", "function f(arg1, arg2, ...) { ... } : CSCS custom interpreted function (use cfunction for pre-compiled functions)");
		this._mapaDeFuncoes.set("cfunction", "cfunction <retType> f(<type1> arg1, <type2> arg2, ...) { ... } : CSCS function to be precompiled");
		this._mapaDeFuncoes.set("print", "Print(arg1, arg2, ...): Prints passed arguments to console");
		this._mapaDeFuncoes.set("write", "Write(arg1, arg2, ...): Prints passed arguments to console on the same line");
		this._mapaDeFuncoes.set("test",  "Test(arg1, arg2): Tests if arg1 is equal to arg2");
		this._mapaDeFuncoes.set("isInteger", "IsInteger(arg): Tests if arg is an integer");
		this._mapaDeFuncoes.set("include", "include(filename): includes CSCS code from the filename");
		this._mapaDeFuncoes.set("substring", "Substring(arg, from, length): Returns a substring of arg");
		this._mapaDeFuncoes.set("pstime", "Returns process CPU time in milliseconds");
		this._mapaDeFuncoes.set("now", "Now(format='HH:mm:ss.fff'): Returns current date-time according to the format");

		this._mapaDeFuncoes.set("pow", "Pow(base, n): Returns base raised to the power of n");
		this._mapaDeFuncoes.set("exp", "Exp(x): Returns e (2.718281828...) raised to the power of x");
		this._mapaDeFuncoes.set("pi", "Pi: Pi constant (3.141592653589793...) ");
		this._mapaDeFuncoes.set("sin", "Sin(x): Returns sine of x");
		this._mapaDeFuncoes.set("cos", "Cos(x): Returns cosine of x");

		this._mapaDeFuncoes.set("size", "Returns number of elements in a list or number of characters in a string");
		this._mapaDeFuncoes.set("type",  "Returns variable type");
		this._mapaDeFuncoes.set("upper", "Converts to upper case");
		this._mapaDeFuncoes.set("lower", "Converts to lower case");
		this._mapaDeFuncoes.set("first", "Returns first element of a list or a first character of a string");
		this._mapaDeFuncoes.set("last",  "Returns last element of a list or a last character of a string");
		this._mapaDeFuncoes.set("tokenize",  "Returns list of tokens after separating the string according to a separator");
		this._mapaDeFuncoes.set("properties", "{Properties, Type, Size, String, First, Last, Upper, Lower}");
	}

    public continue() {
        if (!this.verificarDepuracao(this._sourceFile)) {
            return;
        }
        this._continue = true;
        this.sendToServer('continue');
    }

    disconnectFromDebugger() {
        if (!this._isValid) {
            return;
        }

        this.printCSCSOutput('Finished debugging.');
        this.sendToServer('bye');
        this._connected = false;
        this._sourceFile = '';
        this._debugger.end();
        this.sendEvent('end');
        this._isValid = false;
        Data.getNextId();
        DeleguaTempoExecucao._instance = DeleguaTempoExecucao.getInstance(true);
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

    private getBreakPoint(line: number) : CscsBreakpoint  | undefined {
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

    replace(str: string, search: string, replacement: string)
	{
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

    public printCSCSOutput(msg: string, file = "", line = -1, newLine = '\n') {
        //console.error('CSCS> ' + msg + ' \r\n');
        //console.error();
        file = file === "" ? this._sourceFile : file;
        file = this.getLocalPath(file);
        line = line >= 0 ? line : this._originalLine >= 0 ? this._originalLine : this._sourceFile.length - 1;
        //this.printDebugMsg("PRINT " + msg + " " + file + " " + line);
        this.sendEvent('output', msg, file, line, 0, newLine);
    }

    public printDebugMsg(msg : string) {
		//console.info('    _' + msg);
	}

    private runOnce(stepEvent?: string) {
		this.fireEventsForLine(this._originalLine, stepEvent);
	}

    private sendEvent(event: string, ... args: any[]) {
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

    setLocalBasePath(pathname: string)
	{
		if (this._localBase !== undefined && this._localBase !== null && this._localBase !== '') {
			return;
		}

		if (pathname === undefined || pathname === null ) {
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
