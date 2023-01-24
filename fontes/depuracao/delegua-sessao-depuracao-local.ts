// import * as vscode from 'vscode';
import { basename } from 'path';

import { Breakpoint, InitializedEvent, LoggingDebugSession, OutputEvent, Source, StackFrame, StoppedEvent, TerminatedEvent } from "@vscode/debugadapter";
import { DebugProtocol } from "@vscode/debugprotocol";
import { Subject } from 'await-notify';

import { AvaliadorSintatico, Importador, Lexador } from "@designliquido/delegua";
import { InterpretadorComDepuracao } from "@designliquido/delegua";
import { inferirTipoVariavel } from "@designliquido/delegua/fontes/interpretador/inferenciador";
import palavrasReservadas from '@designliquido/delegua/fontes/lexador/palavras-reservadas';

import { ArgumentosInicioDepuracao } from "./argumentos-inicio-depuracao";

export class DeleguaSessaoDepuracaoLocal extends LoggingDebugSession {
    private static threadId = 1;

    lexador: Lexador;
    avaliadorSintatico: AvaliadorSintatico;
    importador: Importador;
    interpretador: InterpretadorComDepuracao;

    private _arquivoInicial = '';
    private _hashArquivoInicial = - 1;
    private _idPontoParada = 1;
    // private _deleguaEstaPronto: Promise<any>;
    private _configuracaoFinalizada = new Subject();

    public constructor() {
        super();

        // Linhas e colunas em Delégua começam em 1.
        this.setDebuggerLinesStartAt1(true);
        this.setDebuggerColumnsStartAt1(true);

        this.lexador = new Lexador();
        this.avaliadorSintatico = new AvaliadorSintatico();
        this.importador = new Importador(
            this.lexador, 
            this.avaliadorSintatico, 
            {},
            {},
            true);
        this.interpretador = new InterpretadorComDepuracao(this.importador, process.cwd(), 
            this.escreverEmDebugOutput.bind(this));

        this.interpretador.finalizacaoDaExecucao = this.finalizacao.bind(this);
        this.interpretador.avisoPontoParadaAtivado = this.avisoPontoParadaAtivado.bind(this);
    }

    /**
     * Usado pelo depurador para dizer que a execução finalizou.
     */
    public finalizacao() {
        this.sendEvent(new TerminatedEvent());
    }

    public avisoPontoParadaAtivado() {
        this.sendEvent(
            new StoppedEvent('entry', DeleguaSessaoDepuracaoLocal.threadId)
        );
    }

    public escreverEmDebugOutput(texto: string) {
        const evento: DebugProtocol.OutputEvent = new OutputEvent(`${texto}\n`);
        evento.body.source = this.criarReferenciaSource(this._arquivoInicial);
        evento.body.line = 0;
        this.sendEvent(evento);
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
        this._arquivoInicial = args.program;
        // Por algum motivo, isso gera um hash diferente do importador.
        // this._hashArquivoInicial = cyrb53(this._arquivoInicial);
        const retornoImportador = this.importador.importar(this._arquivoInicial);
        this._hashArquivoInicial = retornoImportador.hashArquivo;
        this.interpretador.prepararParaDepuracao(
            retornoImportador.retornoAvaliadorSintatico.declaracoes,
        );

        // Aguarda a finalização da configuração (configurationDoneRequest)
        await this._configuracaoFinalizada.wait(1000);

        this.interpretador.instrucaoContinuarInterpretacao();
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
        this.interpretador.instrucaoContinuarInterpretacao().then(_ => {
            this.sendResponse(response);
            if (this.interpretador.pontoDeParadaAtivo) {
                this.sendEvent(
                    new StoppedEvent('entry', DeleguaSessaoDepuracaoLocal.threadId)
                );
            }
        });
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
        if (Object.keys(palavrasReservadas).includes(args.expression)) {
            return;
        }

        const resposta = this.interpretador.obterVariavel(args.expression);
        this.sendResponse(this.montarEvaluateResponse(response, resposta));
    }

    protected nextRequest(
        response: DebugProtocol.NextResponse,
        args: DebugProtocol.NextArguments
    ): void {
        this.interpretador.instrucaoPasso().then(_ =>
            this.sendResponse(response)
        );
    }

    protected pauseRequest(response: DebugProtocol.PauseResponse, args: DebugProtocol.PauseArguments, request?: DebugProtocol.Request): void {
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

        for (let pontoParada of pontosParada) {
            this.interpretador.pontosParada.push({
                hashArquivo: this._hashArquivoInicial,
                linha: Number(pontoParada.line),
            });
        }

        response.body = {
            breakpoints: pontosParada,
        };

        this.sendResponse(response);
    }

    protected stackTraceRequest(
        response: DebugProtocol.StackTraceResponse,
        args: DebugProtocol.StackTraceArguments
    ): void {
        const pilha = this.interpretador.pilhaEscoposExecucao.pilha;

        response.body = {
            stackFrames: pilha.map(
                (elementoPilha: any) =>
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
        this.interpretador.adentrarEscopo().then(_ => {
            this.sendResponse(response);
        });
    }

    protected stepOutRequest(
        response: DebugProtocol.StepOutResponse,
        args: DebugProtocol.StepOutArguments
    ): void {
        this.interpretador.instrucaoProximoESair().then(_ => {
            this.sendResponse(response);
        });
    }

    protected variablesRequest(
        response: DebugProtocol.VariablesResponse,
        args: DebugProtocol.VariablesArguments
    ): void {
        const variaveis = this.interpretador.pilhaEscoposExecucao.obterTodasVariaveis([]);

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