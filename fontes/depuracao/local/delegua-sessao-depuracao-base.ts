import * as vscode from 'vscode';

import {
    Breakpoint,
    BreakpointEvent,
    Handles,
    InitializedEvent,
    Logger,
    logger,
    LoggingDebugSession,
    OutputEvent,
    Scope,
    Source,
    StackFrame,
    StoppedEvent,
    TerminatedEvent,
    Thread,
} from '@vscode/debugadapter';
import { DebugProtocol } from '@vscode/debugprotocol';
import { Subject } from 'await-notify';

import { inferirTipoVariavel } from '@designliquido/delegua/interpretador/inferenciador';

import { ArgumentosInicioDepuracao } from '../argumentos-inicio-depuracao';
import { DeleguaTempoExecucaoLocal } from './delegua-tempo-execucao-local';
import { DeleguaPontoParada } from '../delegua-ponto-parada';
import { ElementoPilhaVsCode } from '../elemento-pilha';
import { PontoParadaExtensao } from '../ponto-parada-extensao';

export abstract class DeleguaSessaoDepuracaoBase extends LoggingDebugSession {
    private static threadId = 1;

    private tempoExecucao: DeleguaTempoExecucaoLocal;

    private _arquivoInicial = '';

    private _idPontoParada = 1;
    private _configuracaoFinalizada = new Subject();
    private _alocadorEscopos = new Handles<string>();
    // private _referenciaEscopoLocal = 0;
    private _referenciaEscopoGlobal = 0;

    constructor() {
        super();

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
            vscode.window.showWarningMessage('Depuração: ' + mensagem);
        });

        this.tempoExecucao.on('mensagemErro', (mensagem: string) => {
            vscode.window.showErrorMessage('Depuração: ' + mensagem);
        });

        this.tempoExecucao.on('finalizar', () => {
            this.sendEvent(new TerminatedEvent());
        });

        this.tempoExecucao.on('pararEmEntrada', () => {
            this.sendEvent(
                new StoppedEvent('entry', DeleguaSessaoDepuracaoBase.threadId)
            );
        });

        this.tempoExecucao.on('pararEmExcecao', (exception) => {
            if (exception) {
                this.sendEvent(
                    new StoppedEvent(
                        `exception(${exception})`,
                        DeleguaSessaoDepuracaoBase.threadId
                    )
                );
            } else {
                this.sendEvent(
                    new StoppedEvent(
                        'exception',
                        DeleguaSessaoDepuracaoBase.threadId
                    )
                );
            }
        });

        this.tempoExecucao.on('pararEmPasso', () => {
            this.sendEvent(
                new StoppedEvent('step', DeleguaSessaoDepuracaoBase.threadId)
            );
        });

        this.tempoExecucao.on('pararEmPontoParada', () => {
            this.sendEvent(
                new StoppedEvent(
                    'breakpoint',
                    DeleguaSessaoDepuracaoBase.threadId
                )
            );
        });

        this.tempoExecucao.on('pararEmPontoParadaDados', () => {
            this.sendEvent(
                new StoppedEvent(
                    'data breakpoint',
                    DeleguaSessaoDepuracaoBase.threadId
                )
            );
        });

        this.tempoExecucao.on('pararEmPontoParadaInstrucao', () => {
            this.sendEvent(
                new StoppedEvent(
                    'instruction breakpoint',
                    DeleguaSessaoDepuracaoBase.threadId
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

        this.tempoExecucao.on(
            'saida',
            (
                textoOuExcecao: Error | string,
                mesmaLinha = false,
                caminhoArquivo = '',
                linha = 0
            ) => {
                let eventoSaida: DebugProtocol.OutputEvent;
                if (textoOuExcecao instanceof Error) {
                    eventoSaida = new OutputEvent(`${textoOuExcecao.stack}`);
                } else {
                    const textoSemEscape = textoOuExcecao
                        .replace(/\\t/g, '\t')
                        .replace(/\\n/g, '\n');
                    eventoSaida = new OutputEvent(
                        `${textoSemEscape}${mesmaLinha ? '' : '\n'}`,
                        'stdout'
                    );
                }

                eventoSaida.body.source =
                    this.criarReferenciaSource(caminhoArquivo);
                eventoSaida.body.line = this.convertDebuggerLineToClient(linha);
                this.sendEvent(eventoSaida);
            }
        );
    }

    // Descomentar se precisar descobrir a sequência de requisições
    // que o VSCode pede a esta sessão, e se alguma requisição
    // não foi implementada ainda.
    /* protected dispatchRequest(request: DebugProtocol.Request): void {
        super.dispatchRequest(request);
    } */

    // Descomentar para testar quando o VSCode finaliza a depuração.
    /* protected disconnectRequest(response: DebugProtocol.DisconnectResponse, args: DebugProtocol.DisconnectArguments, request?: DebugProtocol.Request): void {
		console.log(`disconnectRequest suspend: ${args.suspendDebuggee}, terminate: ${args.terminateDebuggee}`);
	} */

    /**
     * `initializeRequest` é a primeira requisição feita pelo VSCode para
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
        response.body.supportsConfigurationDoneRequest = true;
        response.body.supportSuspendDebuggee = false;
        response.body.supportTerminateDebuggee = true;
        response.body.supportsTerminateRequest = true;

        this.sendResponse(response);
        this.sendEvent(new InitializedEvent());
    }

    protected async launchRequest(
        response: DebugProtocol.LaunchResponse,
        args: ArgumentosInicioDepuracao
    ) {
        try {
            logger.setup(
                args.trace ? Logger.LogLevel.Verbose : Logger.LogLevel.Stop,
                false
            );

            this._arquivoInicial = args.program;

            // Aguarda a finalização da configuração (configurationDoneRequest)
            await this._configuracaoFinalizada.wait(10000);

            this.tempoExecucao.iniciar(
                this._arquivoInicial,
                !!args.stopOnEntry
            );
            this.sendResponse(response);
        } catch (erro: any) {
            response.success = false;
            if (erro.hasOwnProperty('simbolo')) {
                response.message = `[Linha: ${erro.simbolo.linha}] ${erro.message}`;
            } else {
                response.message = `${erro.message}`;
            }

            this.sendResponse(response);
            throw erro;
        }
    }

    protected breakpointLocationsRequest(
        response: DebugProtocol.BreakpointLocationsResponse,
        args: DebugProtocol.BreakpointLocationsArguments,
        request?: DebugProtocol.Request
    ): void {
        // TODO: Terminar
        // const pontosParada = this.interpretador.pontosParada;
        response.body = {
            breakpoints: [],
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

    /**
     * Monta respostas para `evaluateRequest`.
     * @param response Resposta que a extensão espera.
     * @param respostaDelegua A resposta vinda do interpretador.
     * @returns
     */
    private montarEvaluateResponse(
        response: DebugProtocol.EvaluateResponse,
        respostaDelegua: any
    ): DebugProtocol.EvaluateResponse {
        try {
            const respostaEstruturada = JSON.parse(respostaDelegua);
            response.body = {
                result: respostaEstruturada.hasOwnProperty('valor')
                    ? String(respostaEstruturada.valor)
                    : String(respostaEstruturada),
                type: respostaEstruturada.hasOwnProperty('tipo')
                    ? respostaEstruturada.tipo
                    : inferirTipoVariavel(respostaEstruturada),
                variablesReference: 0,
                presentationHint: {
                    kind: 'data',
                },
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
        const resposta = this.tempoExecucao.obterVariavel(
            args.expression.toLowerCase()
        );
        if (resposta !== undefined) {
            const responseModificada = this.montarEvaluateResponse(
                response,
                JSON.stringify(resposta)
            );
            this.sendResponse(responseModificada);
            return;
        }

        this.sendResponse(response);
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
        this.tempoExecucao.passo();
        this.sendResponse(response);
    }

    // TODO: Descomentar quando comando de pausa estiver devidamente implementado em Delégua.
    /* protected pauseRequest(
        response: DebugProtocol.PauseResponse, 
        args: DebugProtocol.PauseArguments, request?: DebugProtocol.Request
    ): void {
        this.tempoExecucao.pausar();
        super.pauseRequest(response, args);
    } */

    /**
     * Aparentemente necessário para exibir as variáveis no painel de
     * variáveis da depuração.
     * Por enquanto trabalhando apenas com escopo global.
     * @param response A resposta a ser devolvida para o VSCode.
     * @param args Argumentos de inicialização de escopos.
     */
    protected scopesRequest(
        response: DebugProtocol.ScopesResponse,
        args: DebugProtocol.ScopesArguments
    ): void {
        const referenciaElementoPilha = args.frameId;
        const escopos = new Array<Scope>();
        /* scopes.push(
            new Scope(
                'Local',
                this._variableHandles.create('local_' + frameReference),
                false
            )
        ); */
        escopos.push(
            new Scope(
                'Global',
                this._alocadorEscopos.create(
                    'global_' + referenciaElementoPilha
                ),
                false // `true` para iniciar fechado.
            )
        );

        // this._referenciaEscopoLocal = scopes[0].variablesReference;
        this._referenciaEscopoGlobal = escopos[0].variablesReference;

        response.body = {
            scopes: escopos,
        };
        this.sendResponse(response);
    }

    /**
     * Definição dos pontos de parada no interpretador.
     * Ocorre antes de `launchRequest`.
     * @param response A resposta a ser devolvida para o VSCode.
     * @param args Argumentos para inicialização dos pontos de parada.
     */
    protected setBreakPointsRequest(
        response: DebugProtocol.SetBreakpointsResponse,
        args: DebugProtocol.SetBreakpointsArguments
    ): void {
        const linhas = args.lines || [];

        const pontosParada = linhas.map((linha) => {
            const pontoParada = <PontoParadaExtensao>(
                new Breakpoint(true, this.convertDebuggerLineToClient(linha))
            );
            pontoParada.id = this._idPontoParada++;
            pontoParada.source = args.source;
            return pontoParada;
        });

        response.body = {
            breakpoints: pontosParada,
        };

        this.tempoExecucao.definirPontosParada(pontosParada);
        this.sendResponse(response);
    }

    /**
     * Evento ativado quando a execucão para por algum motivo, seja
     * porque um passo foi executado, seja por um ponto de parada encontrado.
     * @param response Uma `StackTraceResponse`.
     * @param args Argumentos adicionais.
     */
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
     * se o código está executando ou não, e onde.
     *
     * Como Delégua e dialetos são baseados em Node, e Node tem uma _thread_ só,
     * basta enviar um registro fixo de _thread_ para fazer o restante das inspeções
     * funcionarem adequadamente.
     * @param response Uma `ThreadsResponse`.
     */
    protected threadsRequest(response: DebugProtocol.ThreadsResponse): void {
        response.body = {
            threads: [
                new Thread(DeleguaSessaoDepuracaoBase.threadId, 'thread 1'),
            ],
        };
        this.sendResponse(response);
    }

    /**
     * Devolve todas as variáveis em tempo de execução. Normalmente é a informação
     * apresentada no painel "Variables" do VSCode enquanto depurando o código.
     * @param response Uma `VariablesResponse`
     * @param args Normalmente a referência da variável, mas não usamos até então (ver comentário abaixo)
     */
    protected variablesRequest(
        response: DebugProtocol.VariablesResponse,
        args: DebugProtocol.VariablesArguments
    ): void {
        const variaveis = this.tempoExecucao.variaveis();

        response.body = {
            variables: variaveis.map(
                (variavel) =>
                    ({
                        name: variavel.nome,
                        type: variavel.tipo,
                        value: String(variavel.valor),
                        // TODO: Essa `variablesReference` deve ser maior que zero quando o objeto é composto.
                        // Por exemplo, formado por outras variáveis.
                        // Por enquanto todas as referências são definidas como zero porque até então
                        // as linguagens não fazem referência de outras variáveis.
                        // variablesReference: this._referenciaEscopoGlobal,
                        variablesReference: 0,
                        namedVariables: 0,
                        indexedVariables: 0,
                        presentationHint: {
                            kind: 'data',
                            attributes: ['rawString'],
                        } as DebugProtocol.VariablePresentationHint,
                    } as DebugProtocol.Variable)
            ),
        };
        this.sendResponse(response);
    }

    protected abstract criarReferenciaSource(caminho: string): Source;
}
