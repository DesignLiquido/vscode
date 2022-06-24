import { basename } from 'path';
import * as vscode from 'vscode';
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
import * as base64 from 'base64-js';

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
    private _cancellationTokens = new Map<number, boolean>();
    private _cancelledProgressId: string | undefined = undefined;
    private _configurationDone = new Subject();
    private _variableHandles = new Handles<string>();
    private _escopoLocal = 0;
    private _escopoGlobal = 0;

    public constructor() {
        super('delegua-debug.txt');

        // Linhas e colunas em Delégua começam em 1.
        this.setDebuggerLinesStartAt1(true);
        this.setDebuggerColumnsStartAt1(true);

        this._tempoExecucao = new DeleguaTempoExecucao();
        this._tempoExecucao.on('mensagemInformacao', (mensagem: string) => {
			vscode.window.showInformationMessage(mensagem);
		});

		this._tempoExecucao.on('onStatusChange', (mensagem: string) => {
			vscode.window.setStatusBarMessage(mensagem);
		});

		this._tempoExecucao.on('onWarningMessage', (mensagem: string) => {
			vscode.window.showWarningMessage('REPL: ' + mensagem);
		});

		this._tempoExecucao.on('mensagemErro', (mensagem: string) => {
			vscode.window.showErrorMessage('REPL: ' + mensagem);
		});
        
        this._tempoExecucao.on('finalizar', () => {
            this.sendEvent(new TerminatedEvent());
        });

        this._tempoExecucao.on('pararEmEntrada', () => {
            this.sendEvent(
                new StoppedEvent('entry', DeleguaSessaoDepuracao.THREAD_ID)
            );
        });

        this._tempoExecucao.on('pararEmExcecao', (exception) => {
            if (exception) {
                this.sendEvent(
                    new StoppedEvent(
                        `exception(${exception})`,
                        DeleguaSessaoDepuracao.THREAD_ID
                    )
                );
            } else {
                this.sendEvent(
                    new StoppedEvent(
                        'exception',
                        DeleguaSessaoDepuracao.THREAD_ID
                    )
                );
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
            this.sendEvent(
                new StoppedEvent(
                    'data breakpoint',
                    DeleguaSessaoDepuracao.THREAD_ID
                )
            );
        });

        this._tempoExecucao.on('pararEmPontoParadaInstrucao', () => {
            this.sendEvent(
                new StoppedEvent(
                    'instruction breakpoint',
                    DeleguaSessaoDepuracao.THREAD_ID
                )
            );
        });

        this._tempoExecucao.on(
            'pontoDeParadaValidado',
            (pontoParada: DeleguaPontoParada) => {
                this.sendEvent(
                    new BreakpointEvent('changed', {
                        verified: pontoParada.verificado,
                        id: pontoParada.id,
                    } as DebugProtocol.Breakpoint)
                );
            }
        );

        this._tempoExecucao.on('saida', (text, filePath, line, column) => {
            const e: DebugProtocol.OutputEvent = new OutputEvent(`${text}\n`);
            e.body.source = this.createSource(filePath);
            e.body.line = this.convertDebuggerLineToClient(line);
            this.sendEvent(e);
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

    protected breakpointLocationsRequest(response: DebugProtocol.BreakpointLocationsResponse, args: DebugProtocol.BreakpointLocationsArguments, request?: DebugProtocol.Request): void {

		if (args.source.path) {
			const bps = this._tempoExecucao.obterPontosParada(args.source.path, this.convertClientLineToDebugger(args.line));
			response.body = {
				breakpoints: bps.map(col => {
					return {
						line: args.line,
						column: this.convertDebuggerColumnToClient(col)
					};
				})
			};
		} else {
			response.body = {
				breakpoints: []
			};
		}
		this.sendResponse(response);
	}

    protected cancelRequest(response: DebugProtocol.CancelResponse, args: DebugProtocol.CancelArguments) {
		if (args.requestId) {
			this._cancellationTokens.set(args.requestId, true);
		}
		if (args.progressId) {
			this._cancelledProgressId = args.progressId;
		}
	}

    protected completionsRequest(response: DebugProtocol.CompletionsResponse, args: DebugProtocol.CompletionsArguments): void {

		response.body = {
			targets: [
				{
					label: "item 10",
					sortText: "10"
				},
				{
					label: "item 1",
					sortText: "01"
				},
				{
					label: "item 2",
					sortText: "02"
				},
				{
					label: "array[]",
					selectionStart: 6,
					sortText: "03"
				},
				{
					label: "func(arg)",
					selectionStart: 5,
					selectionLength: 3,
					sortText: "04"
				}
			]
		};
		this.sendResponse(response);
	}

    /**
     * Called at the end of the configuration sequence.
     * Indicates that all breakpoints etc. have been sent to the DA and that the 'launch' can start.
     */
    protected configurationDoneRequest(
        response: DebugProtocol.ConfigurationDoneResponse,
        args: DebugProtocol.ConfigurationDoneArguments
    ): void {
        super.configurationDoneRequest(response, args);

        // notify the launchRequest that configuration has finished
        this._configurationDone.notify();
    }

    protected continueRequest(
        response: DebugProtocol.ContinueResponse,
        args: DebugProtocol.ContinueArguments
    ): void {
        this._tempoExecucao.continuar();
        this.sendResponse(response);
    }

    protected customRequest(command: string, response: DebugProtocol.Response, args: any) {
		/* if (command === 'toggleFormatting') {
			this._valuesInHex = ! this._valuesInHex;
			if (this._useInvalidatedEvent) {
				this.sendEvent(new InvalidatedEvent( ['variables'] ));
			}
			this.sendResponse(response);
		} else { */
		super.customRequest(command, response, args);
		// }
	}

    protected dataBreakpointInfoRequest(response: DebugProtocol.DataBreakpointInfoResponse, args: DebugProtocol.DataBreakpointInfoArguments): void {

		response.body = {
            dataId: null,
            description: "cannot break on data access",
            accessTypes: undefined,
            canPersist: false
        };

		if (args.variablesReference && args.name) {
			const v = this._variableHandles.get(args.variablesReference);
			if (v === 'globals') {
				response.body.dataId = args.name;
				response.body.description = args.name;
				response.body.accessTypes = [ "write" ];
				response.body.canPersist = true;
			} else {
				response.body.dataId = args.name;
				response.body.description = args.name;
				response.body.accessTypes = ["read", "write", "readWrite"];
				response.body.canPersist = true;
			}
		}

		this.sendResponse(response);
	}

    protected disassembleRequest(response: DebugProtocol.DisassembleResponse, args: DebugProtocol.DisassembleArguments) {

		const baseAddress = parseInt(args.memoryReference);
		const offset = args.instructionOffset || 0;
		const count = args.instructionCount;

		const isHex = args.memoryReference.startsWith('0x');
		const pad = isHex ? args.memoryReference.length-2 : args.memoryReference.length;

		const loc = this.createSource(this._tempoExecucao.sourceFile);

		let lastLine = -1;

		const instructions = this._tempoExecucao.disassemble(baseAddress+offset, count).map(instruction => {
			const address = instruction.address.toString(isHex ? 16 : 10).padStart(pad, '0');
			const instr : DebugProtocol.DisassembledInstruction = {
				address: isHex ? `0x${address}` : `${address}`,
				instruction: instruction.instruction
			};
			// if instruction's source starts on a new line add the source to instruction
			if (instruction.line !== undefined && lastLine !== instruction.line) {
				lastLine = instruction.line;
				instr.location = loc;
				instr.line = this.convertDebuggerLineToClient(instruction.line);
			}
			return instr;
		});

		response.body = {
			instructions: instructions
		};
		this.sendResponse(response);
	}

    protected disconnectRequest(
        response: DebugProtocol.DisconnectResponse,
        args: DebugProtocol.DisconnectArguments
    ): void {
        this._tempoExecucao.desconectarDoDepurador();
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

    protected exceptionInfoRequest(response: DebugProtocol.ExceptionInfoResponse, args: DebugProtocol.ExceptionInfoArguments) {
		response.body = {
			exceptionId: 'Exception ID',
			description: 'This is a descriptive description of the exception.',
			breakMode: 'always',
			details: {
				message: 'Message contained in the exception.',
				typeName: 'Short type name of the exception object',
				stackTrace: 'stack frame 1\nstack frame 2',
			}
		};
		this.sendResponse(response);
	}

    protected async launchRequest(
        response: DebugProtocol.LaunchResponse,
        args: LaunchRequestArguments
    ) {
        // make sure to 'Stop' the buffered logging if 'trace' is not set
        logger.setup(
            args.trace ? Logger.LogLevel.Verbose : Logger.LogLevel.Stop,
            false
        );

        // wait until configuration has finished (and configurationDoneRequest has been called)
        await this._configurationDone.wait(1000);

        let connectType = args.connectType ? args.connectType : 'sockets';
        let host = args.serverHost ? args.serverHost : '127.0.0.1';
        let port = args.serverPort ? args.serverPort : 7777;
        let base = args.serverBase ? args.serverBase : '';
        // start the program in the runtime

        //let config = vscode.workspace.getConfiguration('delegua');
        //let hostConfig = config.get("serverHost");
        //host =  hostConfig ? hostConfig : "127.0.0.1";
        this._tempoExecucao.iniciar(
            args.program,
            !!args.stopOnEntry,
            connectType,
            host,
            port,
            base
        );

        this.sendResponse(response);
    }

    protected nextRequest(
        response: DebugProtocol.NextResponse,
        args: DebugProtocol.NextArguments
    ): void {
        this._tempoExecucao.passo();
        this.sendResponse(response);
    }

    protected reverseContinueRequest(
        response: DebugProtocol.ReverseContinueResponse,
        args: DebugProtocol.ReverseContinueArguments
    ): void {
        this._tempoExecucao.continuar();
        this.sendResponse(response);
    }

    protected reverseRequest(
        response: DebugProtocol.ReverseContinueResponse,
        args: DebugProtocol.ReverseContinueArguments
    ): void {
        this.sendResponse(response);
    }

    protected scopesRequest(
        response: DebugProtocol.ScopesResponse,
        args: DebugProtocol.ScopesArguments
    ): void {
        const frameReference = args.frameId;
        const scopes = new Array<Scope>();
        scopes.push(
            new Scope(
                'Local',
                this._variableHandles.create('local_' + frameReference),
                false
            )
        );
        scopes.push(
            new Scope(
                'Global',
                this._variableHandles.create('global_' + frameReference),
                true
            )
        );

        this._escopoLocal = scopes[0].variablesReference;
        this._escopoGlobal = scopes[1].variablesReference;

        //console.log('Local: ' + this._localScope + '. Global: ' + this._globalScope);

        response.body = {
            scopes: scopes,
        };
        this.sendResponse(response);
    }

    protected setBreakPointsRequest(
        response: DebugProtocol.SetBreakpointsResponse,
        args: DebugProtocol.SetBreakpointsArguments
    ): void {
        const path = <string>args.source.path;
        if (!this._tempoExecucao.verificarDepuracao(path)) {
            this.sendResponse(response);
            return;
        }
        const clientLines = args.lines || [];

        // clear all breakpoints for this file
        this._tempoExecucao.limparTodosPontosParada(path);

        // set and verify breakpoint locations
        const actualBreakpoints = clientLines.map((l) => {
            let { verificado, linha, id } = this._tempoExecucao.setBreakPoint(
                path,
                this.convertClientLineToDebugger(l)
            );
            const bp = <DebugProtocol.Breakpoint>(
                new Breakpoint(
                    verificado,
                    this.convertDebuggerLineToClient(linha)
                )
            );
            bp.id = id;
            return bp;
        });

        // send back the actual breakpoint positions
        response.body = {
            breakpoints: actualBreakpoints,
        };

        this._tempoExecucao.enviarPontosParadaParaServidorDepuracao(path);
        this.sendResponse(response);
    }

    protected setDataBreakpointsRequest(response: DebugProtocol.SetDataBreakpointsResponse, args: DebugProtocol.SetDataBreakpointsArguments): void {

		// clear all data breakpoints
		this._tempoExecucao.clearAllDataBreakpoints();

		response.body = {
			breakpoints: []
		};

		for (const dbp of args.breakpoints) {
			const ok = this._tempoExecucao.setDataBreakpoint(dbp.dataId, dbp.accessType || 'write');
			response.body.breakpoints.push({
				verified: ok
			});
		}

		this.sendResponse(response);
	}

    protected async setExceptionBreakPointsRequest(response: DebugProtocol.SetExceptionBreakpointsResponse, args: DebugProtocol.SetExceptionBreakpointsArguments): Promise<void> {

		let namedException: string | undefined = undefined;
		let otherExceptions = false;

		if (args.filterOptions) {
			for (const filterOption of args.filterOptions) {
				switch (filterOption.filterId) {
					case 'namedException':
						namedException = args.filterOptions[0].condition;
						break;
					case 'otherExceptions':
						otherExceptions = true;
						break;
				}
			}
		}

		if (args.filters) {
			if (args.filters.indexOf('otherExceptions') >= 0) {
				otherExceptions = true;
			}
		}

		this._tempoExecucao.setExceptionsFilters(namedException, otherExceptions);

		this.sendResponse(response);
	}

    protected setExpressionRequest(response: DebugProtocol.SetExpressionResponse, args: DebugProtocol.SetExpressionArguments): void {

		if (args.expression.startsWith('$')) {
			const rv = this._tempoExecucao.getLocalVariable(args.expression.substr(1));
			if (rv) {
				// rv.value = this.convertToRuntime(args.value);
				// response.body = this.convertFromRuntime(rv);
				this.sendResponse(response);
			} else {
				this.sendErrorResponse(response, {
					id: 1002,
					format: `variable '{lexpr}' not found`,
					variables: { lexpr: args.expression },
					showUser: true
				});
			}
		} else {
			this.sendErrorResponse(response, {
				id: 1003,
				format: `'{lexpr}' not an assignable expression`,
				variables: { lexpr: args.expression },
				showUser: true
			});
		}
	}

    protected setInstructionBreakpointsRequest(response: DebugProtocol.SetInstructionBreakpointsResponse, args: DebugProtocol.SetInstructionBreakpointsArguments) {

		// clear all instruction breakpoints
		this._tempoExecucao.clearInstructionBreakpoints();

		// set instruction breakpoints
		const breakpoints = args.breakpoints.map(ibp => {
			const address = parseInt(ibp.instructionReference);
			const offset = ibp.offset || 0;
			return <DebugProtocol.Breakpoint>{
				verified: this._tempoExecucao.setInstructionBreakpoint(address + offset)
			};
		});

		response.body = {
			breakpoints: breakpoints
		};
		this.sendResponse(response);
	}

    protected stackTraceRequest(
        response: DebugProtocol.StackTraceResponse,
        args: DebugProtocol.StackTraceArguments
    ): void {
        const startFrame =
            typeof args.startFrame === 'number' ? args.startFrame : 0;
        const maxLevels = typeof args.levels === 'number' ? args.levels : 1000;
        const endFrame = startFrame + maxLevels;

        const pilha = this._tempoExecucao.pilhaExecucao(startFrame, endFrame);

        response.body = {
            stackFrames: pilha.frames.map(
                (f) =>
                    new StackFrame(
                        f.index,
                        f.name,
                        this.createSource(f.file),
                        this.convertDebuggerLineToClient(f.line)
                    )
            ),
            totalFrames: pilha.count,
        };
        this.sendResponse(response);
    }

    protected stepInRequest(
        response: DebugProtocol.StepInResponse,
        args: DebugProtocol.StepInArguments
    ): void {
        this._tempoExecucao.adentrarEscopo();
        this.sendResponse(response);
    }

    protected stepOutRequest(
        response: DebugProtocol.StepOutResponse,
        args: DebugProtocol.StepOutArguments
    ): void {
        this._tempoExecucao.sairEscopo();
        this.sendResponse(response);
    }

    protected stepBackRequest(
        response: DebugProtocol.StepBackResponse,
        args: DebugProtocol.StepBackArguments
    ): void {
        this.sendResponse(response);
    }

    protected threadsRequest(response: DebugProtocol.ThreadsResponse): void {
        response.body = {
            threads: [new Thread(DeleguaSessaoDepuracao.THREAD_ID, 'thread 1')],
        };
        this.sendResponse(response);
    }

    protected variablesRequest(
        response: DebugProtocol.VariablesResponse,
        args: DebugProtocol.VariablesArguments
    ): void {
        this._tempoExecucao.variaveis();

        let variables =
            args.variablesReference === this._escopoLocal
                ? this._tempoExecucao.localVariables
                : this._tempoExecucao.globalVariables;

        response.body = {
            variables: variables,
        };
        this.sendResponse(response);
    }

    protected async writeMemoryRequest(response: DebugProtocol.WriteMemoryResponse, { data, memoryReference, offset = 0 }: DebugProtocol.WriteMemoryArguments) {
		const variable = this._variableHandles.get(Number(memoryReference));
		if (typeof variable === 'object') {
			const decoded = base64.toByteArray(data);
			(variable as any).setMemory(decoded, offset);
			response.body = { bytesWritten: decoded.length };
		} else {
			response.body = { bytesWritten: 0 };
		}

		this.sendResponse(response);
		this.sendEvent(new InvalidatedEvent(['variables']));
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
