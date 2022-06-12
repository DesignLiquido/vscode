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

import { DeleguaTempoExecucao } from './delegua-tempo-execucao';

/**
 * Classe responsável por traduzir para o VSCode eventos enviados pelo motor da linguagem
 * Delégua, bem como enviar instruções para o motor.
 */
export class DeleguaSessaoDepuracao extends LoggingDebugSession {
    private static THREAD_ID = 1;
    private _tempoExecucao: DeleguaTempoExecucao;

    public constructor() {
        super('cscs-debug.txt');
        this.setDebuggerLinesStartAt1(false);
        this.setDebuggerColumnsStartAt1(false);

        this._tempoExecucao = new DeleguaTempoExecucao();
        this._tempoExecucao.on('stopOnStep', () => {
            this.sendEvent(
                new StoppedEvent('step', DeleguaSessaoDepuracao.THREAD_ID)
            );
        });

        this._tempoExecucao.on('stopOnBreakpoint', () => {
            this.sendEvent(
                new StoppedEvent('breakpoint', DeleguaSessaoDepuracao.THREAD_ID)
            );
        });

        this._tempoExecucao.on('output', (text, filePath, line, column) => {
            const e: DebugProtocol.OutputEvent = new OutputEvent(`${text}\n`);
            e.body.source = this.createSource(filePath);
            e.body.line = this.convertDebuggerLineToClient(line);
            this.sendEvent(e);
        });
    }

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
