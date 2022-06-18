import { basename } from 'path';
import {
    Logger,
    logger,
    LoggingDebugSession,
    InitializedEvent,
    TerminatedEvent,
    StoppedEvent,
    BreakpointEvent,
    OutputEvent,
    ProgressStartEvent,
    ProgressUpdateEvent,
    ProgressEndEvent,
    InvalidatedEvent,
    Thread,
    StackFrame,
    Scope,
    Source,
    Handles,
    Breakpoint,
    MemoryEvent,
} from '@vscode/debugadapter';
import { DebugProtocol } from '@vscode/debugprotocol';
import { Subject } from 'await-notify';

import { DeleguaTempoExecucao } from './delegua-tempo-execucao';
import { DeleguaPontoParada } from './delegua-ponto-parada';
import { LaunchRequestArguments } from './argumentos-inicio-depuracao';

/**
 * Classe responsável por traduzir para o VSCode eventos enviados pelo 
 * servidor de depuração da linguagem Delégua, bem como enviar 
 * instruções para o servidor de depuração.
 */
export class DeleguaSessaoDepuracao extends LoggingDebugSession {
    // Node.js não suporta várias _threads_, então podemos definir um 
    // valor único de _thread_.
    private static THREAD_ID = 1;
    private _tempoExecucao: DeleguaTempoExecucao;
    private _configurationDone = new Subject();

    public constructor() {
        super('delegua-debug.txt');

        // Linhas e colunas em Delégua começam em 1.
        this.setDebuggerLinesStartAt1(true);
        this.setDebuggerColumnsStartAt1(true);

        this._tempoExecucao = new DeleguaTempoExecucao();
        this._tempoExecucao.on('pararEmEntrada', () => {
            this.sendEvent(
                new StoppedEvent('entry', DeleguaSessaoDepuracao.THREAD_ID)
            );
        });

        this._tempoExecucao.on('pararEmExcecao', (exception) => {
			if (exception) {
				this.sendEvent(new StoppedEvent(`exception(${exception})`, DeleguaSessaoDepuracao.THREAD_ID));
			} else {
				this.sendEvent(new StoppedEvent('exception', DeleguaSessaoDepuracao.THREAD_ID));
			}
		});

        this._tempoExecucao.on('pararEmPasso', () => {
            this.sendEvent(
                new StoppedEvent('step', DeleguaSessaoDepuracao.THREAD_ID)
            );
        });

        this._tempoExecucao.on('pararEmPontoParada', () => {
            this.sendEvent(
                new StoppedEvent('breakpoint', DeleguaSessaoDepuracao.THREAD_ID)
            );
        });

        this._tempoExecucao.on('pararEmPontoParadaDados', () => {
			this.sendEvent(new StoppedEvent('data breakpoint', DeleguaSessaoDepuracao.THREAD_ID));
		});

        this._tempoExecucao.on('pararEmPontoParadaInstrucao', () => {
			this.sendEvent(new StoppedEvent('instruction breakpoint', DeleguaSessaoDepuracao.THREAD_ID));
		});

        this._tempoExecucao.on('pontoDeParadaValidado', (pontoParada: DeleguaPontoParada) => {
			this.sendEvent(new BreakpointEvent('changed', { verified: pontoParada.verificado, id: pontoParada.id } as DebugProtocol.Breakpoint));
		});

        this._tempoExecucao.on('saida', (text, filePath, line, column) => {
            const e: DebugProtocol.OutputEvent = new OutputEvent(`${text}\n`);
            e.body.source = this.createSource(filePath);
            e.body.line = this.convertDebuggerLineToClient(line);
            this.sendEvent(e);
        });

        this._tempoExecucao.on('finalizar', () => {
			this.sendEvent(new TerminatedEvent());
		});
    }

    /**
	 * 'initializeRequest' é a primeira requisição feita pelo VSCode para
     * descobrir quais funcionalidades o recurso de depuração tem.
	 */
    protected initializeRequest(
        response: DebugProtocol.InitializeResponse,
        args: DebugProtocol.InitializeRequestArguments
    ): void {
        response.body = response.body || {};
        response.body.supportsEvaluateForHovers = true;
        response.body.supportsStepBack = false;
        response.body.supportsSetVariable = false;
        response.body.supportsRestartRequest = false;
        response.body.supportsModulesRequest = false;

        this.sendResponse(response);
        this.sendEvent(new InitializedEvent());
    }

    protected async launchRequest(response: DebugProtocol.LaunchResponse, args: LaunchRequestArguments) {

		// make sure to 'Stop' the buffered logging if 'trace' is not set
		logger.setup(args.trace ? Logger.LogLevel.Verbose : Logger.LogLevel.Stop, false);

		// wait until configuration has finished (and configurationDoneRequest has been called)
		await this._configurationDone.wait(1000);

		let connectType = args.connectType ? args.connectType : "sockets";
		let host = args.serverHost ? args.serverHost : "127.0.0.1";
		let port = args.serverPort ? args.serverPort : 13337;
		let base = args.serverBase ? args.serverBase : "";
		// start the program in the runtime

		//let config = vscode.workspace.getConfiguration('mock-debug');
		//let hostConfig = config.get("serverHost");
		//host =  hostConfig ? hostConfig : "127.0.0.1";
		this._tempoExecucao.start(args.program, !!args.stopOnEntry, connectType, host, port, base);

		this.sendResponse(response);
	}

    protected continueRequest(
        response: DebugProtocol.ContinueResponse,
        args: DebugProtocol.ContinueArguments
    ): void {
        this._tempoExecucao.continuar();
        this.sendResponse(response);
    }

    protected nextRequest(
        response: DebugProtocol.NextResponse,
        args: DebugProtocol.NextArguments
    ): void {
        this._tempoExecucao.step();
        this.sendResponse(response);
    }

    protected evaluateRequest(
        response: DebugProtocol.EvaluateResponse,
        args: DebugProtocol.EvaluateArguments
    ): void {
        let reply: string | undefined = undefined;

        if (args.context === 'hover') {
            reply = this._tempoExecucao.obterValorPonteiroMouse(
                args.expression
            );
        } else if (args.context === 'watch') {
            reply = this._tempoExecucao.obterValorVariavel(args.expression);
        }

        response.body = { result: reply ? reply : '', variablesReference: 0 };
        this.sendResponse(response);
    }

    private createSource(filePath: string): Source {
        return new Source(
            basename(filePath),
            this.convertDebuggerPathToClient(filePath),
            undefined,
            undefined,
            'delegua-adapter-data'
        );
    }
}
