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
import { ChildProcessWithoutNullStreams, spawn } from "child_process";

import { DeleguaTempoExecucaoRemoto } from '../remota/delegua-tempo-execucao-remoto';
import { DeleguaPontoParada } from '../delegua-ponto-parada';
import { ArgumentosInicioDepuracao } from '../argumentos-inicio-depuracao';
import { InvocacaoDelegua } from './invocacao-delegua';

import { inferirTipoVariavel } from '@designliquido/delegua/interpretador/inferenciador';
import { palavrasReservadas } from '@designliquido/delegua/lexador/palavras-reservadas';

/**
 * Classe responsável por traduzir para o VSCode eventos enviados pelo
 * servidor de depuração da linguagem Delégua, bem como enviar
 * instruções para o servidor de depuração.
 */
export class DeleguaSessaoDepuracaoRemota extends LoggingDebugSession {
    // Node.js não suporta várias _threads_, então podemos definir um
    // valor único de _thread_.
    private static THREAD_ID = 1;
    private _tempoExecucao: DeleguaTempoExecucaoRemoto;
    private _processoExecucaoDelegua: ChildProcessWithoutNullStreams;
    private _deleguaEstaPronto: Promise<any>;

    private _cancellationTokens = new Map<number, boolean>();
    private _cancelledProgressId: string | undefined = undefined;
    private _configuracaoFinalizada = new Subject();
    private _variableHandles = new Handles<string>();
    private _escopoLocal = 0;
    private _escopoGlobal = 0;
    private _arquivoInicial = '';

    /**
     * No construtor são feitos os registros de quais eventos a classe de tempo de
     * execução irá emitir, e que são observados por essa sessão de depuração.
     */
    public constructor() {
        super('delegua-debug.txt');

        // Linhas e colunas em Delégua começam em 1.
        this.setDebuggerLinesStartAt1(true);
        this.setDebuggerColumnsStartAt1(true);

        this._tempoExecucao = new DeleguaTempoExecucaoRemoto();
        this._tempoExecucao.on('mensagemInformacao', (mensagem: string) => {
			vscode.window.showInformationMessage(mensagem);
		});

		this._tempoExecucao.on('mudancaStatus', (mensagem: string) => {
			vscode.window.setStatusBarMessage(mensagem);
		});

		this._tempoExecucao.on('mensagemAviso', (mensagem: string) => {
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
                new StoppedEvent('entry', DeleguaSessaoDepuracaoRemota.THREAD_ID)
            );
        });

        this._tempoExecucao.on('pararEmExcecao', (exception) => {
            if (exception) {
                this.sendEvent(
                    new StoppedEvent(
                        `exception(${exception})`,
                        DeleguaSessaoDepuracaoRemota.THREAD_ID
                    )
                );
            } else {
                this.sendEvent(
                    new StoppedEvent(
                        'exception',
                        DeleguaSessaoDepuracaoRemota.THREAD_ID
                    )
                );
            }
        });

        this._tempoExecucao.on('pararEmPasso', () => {
            this.sendEvent(
                new StoppedEvent('step', DeleguaSessaoDepuracaoRemota.THREAD_ID)
            );
        });

        this._tempoExecucao.on('pararEmPontoParada', () => {
            this.sendEvent(
                new StoppedEvent('breakpoint', DeleguaSessaoDepuracaoRemota.THREAD_ID)
            );
        });

        this._tempoExecucao.on('pararEmPontoParadaDados', () => {
            this.sendEvent(
                new StoppedEvent(
                    'data breakpoint',
                    DeleguaSessaoDepuracaoRemota.THREAD_ID
                )
            );
        });

        this._tempoExecucao.on('pararEmPontoParadaInstrucao', () => {
            this.sendEvent(
                new StoppedEvent(
                    'instruction breakpoint',
                    DeleguaSessaoDepuracaoRemota.THREAD_ID
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
            e.body.source = this.criarReferenciaSource(filePath);
            e.body.line = this.convertDebuggerLineToClient(line);
            this.sendEvent(e);
        });

        this._deleguaEstaPronto = new Promise<any>((resolve, reject) => {
            InvocacaoDelegua.localizarExecutavel()
                .then((caminhoExecutavel: string) => { 
                    this._processoExecucaoDelegua = InvocacaoDelegua.invocarDelegua(caminhoExecutavel, this._arquivoInicial, resolve, this._tempoExecucao);
                });
            // Comentar acima e descomentar abaixo quando estiver depurando a linguagem.
            // resolve(true);
        });
    }

    /**
     * 'initializeRequest' é a primeira requisição feita pelo VSCode para
     * descobrir quais funcionalidades o recurso de depuração tem.
     * @param response A resposta enviada para a interface do VSCode.
     * @param args Argumentos adicionais.
     */
    protected initializeRequest(
        response: DebugProtocol.InitializeResponse,
        args: DebugProtocol.InitializeRequestArguments
    ): void {
        response.body = response.body || {};
        response.body.supportsEvaluateForHovers = true;
        response.body.supportsStepBack = false;
        response.body.supportsSetVariable = true;
        response.body.supportsRestartRequest = false;
        response.body.supportsModulesRequest = false;

        this.sendResponse(response);
        this.sendEvent(new InitializedEvent());
    }

    protected breakpointLocationsRequest(
        response: DebugProtocol.BreakpointLocationsResponse, 
        args: DebugProtocol.BreakpointLocationsArguments, 
        request?: DebugProtocol.Request): void 
    {
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
     * Chamado após a sequência de configuração. 
     * Indica que todos os pontos de parada, variáveis, etc, foram devidamente enviados e a depuração ('launch') pode iniciar.
     */
    protected configurationDoneRequest(
        response: DebugProtocol.ConfigurationDoneResponse,
        args: DebugProtocol.ConfigurationDoneArguments
    ): void {
        super.configurationDoneRequest(response, args);

        // Notificar a requisição de início que a configuração finalizou.
        this._configuracaoFinalizada.notify();
    }

    /**
     * Evento acionado quando o usuário clica no botão ou usa o atalho de teclado para continuar.
     * No Windows, o atalho é o F5 por padrão.
     * @param response A resposta a ser enviada para a interface do VSCode.
     * @param args Argumentos adicionais.
     */
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

		const loc = this.criarReferenciaSource(this._tempoExecucao.sourceFile);

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

    private montarEvaluateResponse(response: DebugProtocol.EvaluateResponse, respostaDelegua: any) {
        try {
            const respostaEstruturada = JSON.parse(respostaDelegua);
            response.body = { 
                result: respostaEstruturada.hasOwnProperty('valor') ? String(respostaEstruturada.valor) : String(respostaEstruturada),
                type: respostaEstruturada.hasOwnProperty('tipo') ? respostaEstruturada.tipo : inferirTipoVariavel(respostaEstruturada),
                variablesReference: 0,
                presentationHint: {
                    kind: 'data'
                }
            };
            return response;
        } catch (erro: any) {
            response.message = respostaDelegua;
            response.success = false;
            return response;
        }
    }

    /**
     * Avalia a expressão passada como argumento, ou pelo painel de 'watch', ou colocando o ponteiro do mouse em cima.
     * @param response A resposta a ser enviada para a interface do VSCode.
     * @param args Argumentos adicionais.
     */
    protected evaluateRequest(
        response: DebugProtocol.EvaluateResponse,
        args: DebugProtocol.EvaluateArguments
    ): void {
        switch (args.context) {
            case 'hover':
                if (Object.keys(palavrasReservadas).includes(args.expression)) {
                    return;
                }

                this._tempoExecucao.obterValorVariavel(args.expression).then(resposta => {
                    this.sendResponse(this.montarEvaluateResponse(response, resposta));
                });
                break;
            case 'watch':
                this._tempoExecucao.obterValorVariavel(args.expression).then(resposta => {
                    this.sendResponse(this.montarEvaluateResponse(response, resposta));
                });
        }
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

    /**
     * Inicia o tradutor (Tempo de Execução) que harmoniza a comunicação entre 
     * servidor de depuração e extensão do VSCode.
     * Como a inicialização de Delégua (e do servidor de depuração) é lenta, 
     * precisamos esperar a inicialização (por Promise) e só tentar conectar a
     * hora em que o child_process avisa que o servidor de depuração está pronto.
     * @param response A resposta a ser enviada para a interface do VSCode.
     * @param args Argumentos adicionais.
     */
    protected async launchRequest(
        response: DebugProtocol.LaunchResponse,
        args: ArgumentosInicioDepuracao
    ) {
        // make sure to 'Stop' the buffered logging if 'trace' is not set
        logger.setup(
            args.trace ? Logger.LogLevel.Verbose : Logger.LogLevel.Stop,
            false
        );

        this._arquivoInicial = args.program;
        // Aguarda a finalização da configuração (configurationDoneRequest)
        await this._configuracaoFinalizada.wait(1000);

        let connectType = args.connectType ? args.connectType : 'sockets';
        let host = args.serverHost ? args.serverHost : '127.0.0.1';
        let port = args.serverPort ? args.serverPort : 7777;
        let base = args.serverBase ? args.serverBase : '';

        this._deleguaEstaPronto.then(() => {
            this._tempoExecucao.iniciar(
                args.program,
                !!args.stopOnEntry,
                connectType,
                host,
                port,
                base
            );
    
            this.sendResponse(response);
        });
    }

    /**
     * Evento acionado quando o usuário clica no botão ou usa o atalho de teclado para a próxima instrução (passo).
     * No Windows, o atalho é o F10, por padrão.
     * @param response A resposta a ser enviada para a interface do VSCode.
     * @param args Argumentos adicionais.
     */
    protected nextRequest(
        response: DebugProtocol.NextResponse,
        args: DebugProtocol.NextArguments
    ): void {
        this._tempoExecucao.passo();
        this.sendResponse(response);
    }

    /* protected reverseContinueRequest(
        response: DebugProtocol.ReverseContinueResponse,
        args: DebugProtocol.ReverseContinueArguments
    ): void {
        this._tempoExecucao.continuar();
        this.sendResponse(response);
    } */

    /* protected reverseRequest(
        response: DebugProtocol.ReverseContinueResponse,
        args: DebugProtocol.ReverseContinueArguments
    ): void {
        this.sendResponse(response);
    } */

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
        /* if (!this._tempoExecucao.verificarDepuracao(path)) {
            this.sendResponse(response);
            return;
        } */
        const clientLines = args.lines || [];

        // clear all breakpoints for this file
        this._tempoExecucao.limparTodosPontosParada(path);

        // set and verify breakpoint locations
        const actualBreakpoints = clientLines.map((l) => {
            let { verificado, linha, id } = this._tempoExecucao.definirPontoParada(
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

    /**
     * Requisição para buscar no servidor de depuração a pilha atual de execução.
     * @param response A resposta a ser enviada para a interface do VSCode.
     * @param args Argumentos adicionais.
     */
    protected stackTraceRequest(
        response: DebugProtocol.StackTraceResponse,
        args: DebugProtocol.StackTraceArguments
    ): void {
        const pilha = this._tempoExecucao.pilhaExecucao();

        response.body = {
            stackFrames: pilha.map(
                (f: any) =>
                    new StackFrame(
                        f.index,
                        f.name,
                        this.criarReferenciaSource(f.file),
                        this.convertDebuggerLineToClient(f.line)
                    )
            ),
            totalFrames: pilha.length,
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
            threads: [new Thread(DeleguaSessaoDepuracaoRemota.THREAD_ID, 'thread 1')],
        };
        this.sendResponse(response);
    }

    protected variablesRequest(
        response: DebugProtocol.VariablesResponse,
        args: DebugProtocol.VariablesArguments
    ): void {
        this._tempoExecucao.variaveis();

        let variaveis =
            args.variablesReference === this._escopoLocal
                ? this._tempoExecucao.variaveisEscopo
                : this._tempoExecucao.todasVariaveis;

        response.body = {
            variables: variaveis,
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

    private criarReferenciaSource(caminho: string): Source {
        return new Source(
            basename(caminho),
            this.convertDebuggerPathToClient(caminho),
            undefined, 
            undefined,
            // 123,
            // '456',
            'delegua-adapter-data'
        );
    }
}
