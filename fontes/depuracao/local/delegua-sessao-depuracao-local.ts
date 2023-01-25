import * as vscode from 'vscode';
import { basename } from 'path';

import { Breakpoint, BreakpointEvent, InitializedEvent, Logger, logger, LoggingDebugSession, OutputEvent, Source, StackFrame, StoppedEvent, TerminatedEvent, Thread } from "@vscode/debugadapter";
import { DebugProtocol } from "@vscode/debugprotocol";
import { Subject } from 'await-notify';

import { inferirTipoVariavel } from "@designliquido/delegua/fontes/interpretador/inferenciador";

import { ArgumentosInicioDepuracao } from "../argumentos-inicio-depuracao";
import { DeleguaTempoExecucaoLocal } from './delegua-tempo-execucao-local';
import { DeleguaPontoParada } from '../delegua-ponto-parada';
import { ElementoPilhaVsCode } from '../elemento-pilha';

export class DeleguaSessaoDepuracaoLocal extends LoggingDebugSession {
    private static threadId = 1;

    private tempoExecucao: DeleguaTempoExecucaoLocal;

    private _arquivoInicial = '';
    
    private _idPontoParada = 1;
    // private _deleguaEstaPronto: Promise<any>;
    private _configuracaoFinalizada = new Subject();

    public constructor() {
        super('delegua-debug.txt');

        // Linhas e colunas em Delégua começam em 1.
        this.setDebuggerLinesStartAt1(true);
        this.setDebuggerColumnsStartAt1(true);

        this.tempoExecucao = new DeleguaTempoExecucaoLocal();

        this.tempoExecucao.on('mensagemInformacao', (mensagem: string) => {
			vscode.window.showInformationMessage(mensagem);
		});

		this.tempoExecucao.on('mudancaStatus', (mensagem: string) => {
			vscode.window.setStatusBarMessage(mensagem);
		});

		this.tempoExecucao.on('mensagemAviso', (mensagem: string) => {
			vscode.window.showWarningMessage('REPL: ' + mensagem);
		});

		this.tempoExecucao.on('mensagemErro', (mensagem: string) => {
			vscode.window.showErrorMessage('REPL: ' + mensagem);
		});
        
        this.tempoExecucao.on('finalizar', () => {
            this.sendEvent(new TerminatedEvent());
        });

        this.tempoExecucao.on('pararEmEntrada', () => {
            this.sendEvent(
                new StoppedEvent('entry', DeleguaSessaoDepuracaoLocal.threadId)
            );
        });

        this.tempoExecucao.on('pararEmExcecao', (exception) => {
            if (exception) {
                this.sendEvent(
                    new StoppedEvent(
                        `exception(${exception})`,
                        DeleguaSessaoDepuracaoLocal.threadId
                    )
                );
            } else {
                this.sendEvent(
                    new StoppedEvent(
                        'exception',
                        DeleguaSessaoDepuracaoLocal.threadId
                    )
                );
            }
        });

        this.tempoExecucao.on('pararEmPasso', () => {
            this.sendEvent(
                new StoppedEvent('step', DeleguaSessaoDepuracaoLocal.threadId)
            );
        });

        this.tempoExecucao.on('pararEmPontoParada', () => {
            this.sendEvent(
                new StoppedEvent('breakpoint', DeleguaSessaoDepuracaoLocal.threadId)
            );
        });

        this.tempoExecucao.on('pararEmPontoParadaDados', () => {
            this.sendEvent(
                new StoppedEvent(
                    'data breakpoint',
                    DeleguaSessaoDepuracaoLocal.threadId
                )
            );
        });

        this.tempoExecucao.on('pararEmPontoParadaInstrucao', () => {
            this.sendEvent(
                new StoppedEvent(
                    'instruction breakpoint',
                    DeleguaSessaoDepuracaoLocal.threadId
                )
            );
        });

        this.tempoExecucao.on(
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

        this.tempoExecucao.on('saida', (texto, caminhoArquivo = '', linha = 0) => {
            const e: DebugProtocol.OutputEvent = new OutputEvent(`${texto}\n`);
            e.body.source = this.criarReferenciaSource(caminhoArquivo);
            e.body.line = this.convertDebuggerLineToClient(linha);
            this.sendEvent(e);
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

    protected async launchRequest(
        response: DebugProtocol.LaunchResponse,
        args: ArgumentosInicioDepuracao
    ) {
        logger.setup(
            args.trace ? Logger.LogLevel.Verbose : Logger.LogLevel.Stop,
            false
        );
        
        this._arquivoInicial = args.program;

        // Aguarda a finalização da configuração (configurationDoneRequest)
        await this._configuracaoFinalizada.wait(1000);

        this.tempoExecucao.iniciar(this._arquivoInicial, !!args.stopOnEntry);
        this.sendResponse(response);
    }

    protected breakpointLocationsRequest(
        response: DebugProtocol.BreakpointLocationsResponse, 
        args: DebugProtocol.BreakpointLocationsArguments, 
        request?: DebugProtocol.Request): void 
    {
        // const pontosParada = this.interpretador.pontosParada;
        response.body = {
            breakpoints: []
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
        this.tempoExecucao.continuar();
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
        const resposta = this.tempoExecucao.obterVariavel(args.expression);
        if (resposta !== undefined) {
            this.sendResponse(this.montarEvaluateResponse(response, JSON.stringify(resposta)));
        }
    }

    protected nextRequest(
        response: DebugProtocol.NextResponse,
        args: DebugProtocol.NextArguments
    ): void {
        this.tempoExecucao.passo();
        this.sendResponse(response);
    }

    protected pauseRequest(
        response: DebugProtocol.PauseResponse, 
        args: DebugProtocol.PauseArguments, request?: DebugProtocol.Request
    ): void {
        super.pauseRequest(response, args);
    }

    protected setBreakPointsRequest(
        response: DebugProtocol.SetBreakpointsResponse,
        args: DebugProtocol.SetBreakpointsArguments
    ): void {
        const linhas = args.lines || [];

        const pontosParada = linhas.map(linha => {
            const pontoParada = <DebugProtocol.Breakpoint>(new Breakpoint(
                true, 
                this.convertDebuggerLineToClient(linha)
            ));
            pontoParada.id = this._idPontoParada++;
            return pontoParada;
        });

        response.body = {
            breakpoints: pontosParada,
        };

        this.tempoExecucao.definirPontosParada(pontosParada);
        this.sendResponse(response);
    }

    protected stackTraceRequest(
        response: DebugProtocol.StackTraceResponse,
        args: DebugProtocol.StackTraceArguments
    ): void {
        const pilha = this.tempoExecucao.pilhaExecucao();

        response.body = {
            stackFrames: pilha.map(
                (elementoPilha: ElementoPilhaVsCode) =>
                    new StackFrame(
                        elementoPilha.id,
                        elementoPilha.nome,
                        this.criarReferenciaSource(elementoPilha.arquivo),
                        this.convertDebuggerLineToClient(elementoPilha.linha)
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
        this.tempoExecucao.adentrarEscopo();
        this.sendResponse(response);
    }

    protected stepOutRequest(
        response: DebugProtocol.StepOutResponse,
        args: DebugProtocol.StepOutArguments
    ): void {
        this.tempoExecucao.sairEscopo();
        this.sendResponse(response);
    }

    /**
     * Fundamental para o funcionamento da depuração, senão o VSCode não sabe
     * se o código está executando ou não.
     * @param response Uma `ThreadsResponse`.
     */
    protected threadsRequest(response: DebugProtocol.ThreadsResponse): void {
        response.body = {
            threads: [new Thread(DeleguaSessaoDepuracaoLocal.threadId, 'thread 1')],
        };
        this.sendResponse(response);
    }

    protected variablesRequest(
        response: DebugProtocol.VariablesResponse,
        args: DebugProtocol.VariablesArguments
    ): void {
        const variaveis = this.tempoExecucao.variaveis();

        response.body = {
            variables: variaveis.map(variavel => ({
                name: variavel.nome,
                type: variavel.tipo,
                value: variavel.valor,
                variablesReference: 0
            })),
        };
        this.sendResponse(response);
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