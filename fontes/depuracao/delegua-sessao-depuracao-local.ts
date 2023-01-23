import { basename } from 'path';

import { Breakpoint, InitializedEvent, LoggingDebugSession, Source, StackFrame } from "@vscode/debugadapter";
import { DebugProtocol } from "@vscode/debugprotocol";

import { AvaliadorSintatico, Importador, Lexador } from "@designliquido/delegua";
import { InterpretadorComDepuracao } from "@designliquido/delegua/fontes/interpretador/interpretador-com-depuracao";
import { inferirTipoVariavel } from "@designliquido/delegua/fontes/interpretador/inferenciador";
import palavrasReservadas from '@designliquido/delegua/fontes/lexador/palavras-reservadas';

import { ArgumentosInicioDepuracao } from "./argumentos-inicio-depuracao";

export class DeleguaSessaoDepuracaoLocal extends LoggingDebugSession {
    lexador: Lexador;
    avaliadorSintatico: AvaliadorSintatico;
    importador: Importador;
    interpretador: InterpretadorComDepuracao;

    private _arquivoInicial = '';
    private _idPontoParada = 1;

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
            console.log);
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
        const retornoImportador = this.importador.importar(this._arquivoInicial);
        this.interpretador.prepararParaDepuracao(
            retornoImportador.retornoAvaliadorSintatico.declaracoes,
        );

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

        for (let pontoParada of pontosParada) {
            this.interpretador.pontosParada.push({
                hashArquivo: -1,
                linha: Number(pontoParada.line),
            });
        }
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