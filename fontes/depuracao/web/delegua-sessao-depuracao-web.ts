import * as vscode from 'vscode';
import {
    BreakpointEvent,
    OutputEvent,
    Source,
    StoppedEvent,
    TerminatedEvent,
} from '@vscode/debugadapter';
import { DebugProtocol } from '@vscode/debugprotocol';
import { Breakpoint } from '@vscode/debugadapter';

import { DeleguaTempoExecucaoWeb } from './delegua-tempo-execucao-web';
import { DeleguaPontoParada } from '../delegua-ponto-parada';
import { ProvedorVisaoEntradaSaida } from '../../visoes';
import { DeleguaSessaoDepuracaoBase } from '../delegua-sessao-depuracao-base';

/**
 * Sessão de depuração específica para web (vscode.dev, github.dev).
 * Usa `DeleguaTempoExecucaoWeb`, que não depende de APIs Node.js.
 */
export class DeleguaSessaoDepuracaoWeb extends DeleguaSessaoDepuracaoBase {
    private _launchArgs: any;

    constructor(
        provedorVisaoEntradaSaida: ProvedorVisaoEntradaSaida,
        diagnosticos: vscode.DiagnosticCollection
    ) {
        super(provedorVisaoEntradaSaida, diagnosticos);

        this.setDebuggerLinesStartAt1(true);
        this.setDebuggerColumnsStartAt1(true);

        this.tempoExecucao = new DeleguaTempoExecucaoWeb(
            provedorVisaoEntradaSaida,
            diagnosticos
        );

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
            this.provedorVisaoEntradaSaida.escreverEmSaida("\r\nFim da execução.");
            this.sendEvent(new TerminatedEvent());
        });

        this.tempoExecucao.on('limparTela', () => {
            this.provedorVisaoEntradaSaida.limparTerminal();
        });

        this.tempoExecucao.on('pararEmEntrada', () => {
            this.sendEvent(
                new StoppedEvent('entry', DeleguaSessaoDepuracaoWeb.threadId)
            );
        });

        this.tempoExecucao.on('pararEmExcecao', (exception) => {
            if (exception) {
                this.sendEvent(
                    new StoppedEvent(
                        `exception(${exception})`,
                        DeleguaSessaoDepuracaoWeb.threadId
                    )
                );
            } else {
                this.sendEvent(
                    new StoppedEvent(
                        'exception',
                        DeleguaSessaoDepuracaoWeb.threadId
                    )
                );
            }
        });

        this.tempoExecucao.on('pararEmPasso', () => {
            this.sendEvent(
                new StoppedEvent('step', DeleguaSessaoDepuracaoWeb.threadId)
            );
        });

        this.tempoExecucao.on('pararEmPontoParada', () => {
            this.sendEvent(
                new StoppedEvent(
                    'breakpoint',
                    DeleguaSessaoDepuracaoWeb.threadId
                )
            );
        });

        this.tempoExecucao.on('pararEmPontoParadaDados', () => {
            this.sendEvent(
                new StoppedEvent(
                    'data breakpoint',
                    DeleguaSessaoDepuracaoWeb.threadId
                )
            );
        });

        this.tempoExecucao.on('pararEmPontoParadaInstrucao', () => {
            this.sendEvent(
                new StoppedEvent(
                    'instruction breakpoint',
                    DeleguaSessaoDepuracaoWeb.threadId
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
                    eventoSaida.body.source =
                        this.criarReferenciaSource(caminhoArquivo);
                    eventoSaida.body.line = this.convertDebuggerLineToClient(linha);
                    this.sendEvent(eventoSaida);
                } else {
                    const textoSemEscape = textoOuExcecao
                        .replace(/\\t/g, '\t')
                        .replace(/\\n/g, '\r\n');

                    if (mesmaLinha) {
                        this.provedorVisaoEntradaSaida.escreverEmSaidaMesmaLinha(textoSemEscape);
                    } else {
                        this.provedorVisaoEntradaSaida.escreverEmSaida(textoSemEscape);
                    }
                }
            }
        );
    }

    /**
     * Requisição de execução do código.
     * @param response A resposta ao comando. Normalmente apenas devolvemos 
     *                 a resposta original sem alterações.
     * @param args Argumentos de início da depuração.
     */
    protected override async launchRequest(
        response: DebugProtocol.LaunchResponse,
        args: any
    ): Promise<void> {
        const documento = vscode.window.activeTextEditor?.document;
        
        if (!documento) {
            this.sendErrorResponse(
                response,
                {
                    id: 1001,
                    format: 'Por favor, abra o arquivo que deseja depurar antes de iniciar a depuração.',
                }
            );
            return;
        }
        
        // Guardamos os argumentos aqui para serem usados quando `configurationDoneRequest` executa.
        this._launchArgs = {
            documento: documento,
            programPath: documento.fileName,
            stopOnEntry: !!args.stopOnEntry
        };
        
        this.sendResponse(response);
    }

    /**
     * Chamado após a sequência de configuração.
     * Indica que todos os pontos de parada, variáveis, etc, foram devidamente enviados e a depuração ('launch') pode iniciar.
     * @param response A resposta ao comando. 
     * @param args Argumentos da conclusão da configuração para depuração.
     */
    protected override configurationDoneRequest(
        response: DebugProtocol.ConfigurationDoneResponse,
        args: DebugProtocol.ConfigurationDoneArguments
    ): void {
        super.configurationDoneRequest(response, args);
        
        // Define todos os pontos de parada.
        if (this._launchArgs) {
            this.tempoExecucao.iniciar(
                this._launchArgs.documento,
                this._launchArgs.programPath,
                this._launchArgs.stopOnEntry
            ).catch((erro) => {
                this.sendEvent(new OutputEvent(
                    `Erro: ${erro.message}\n`,
                    'stderr'
                ));
            });
        }
    }

    /**
     * Definição dos pontos de parada no interpretador.
     * Ocorre antes de `launchRequest`.
     * @param response A resposta a ser devolvida para o VSCode.
     * @param args Argumentos para inicialização dos pontos de parada.
     */
    protected override setBreakPointsRequest(
        response: DebugProtocol.SetBreakpointsResponse,
        args: DebugProtocol.SetBreakpointsArguments
    ): void {
        const linhas = args.lines || [];

        this.tempoExecucao.reiniciarPontosParada();

        const pontosParada = linhas.map((linha) => {
            const pontoParada = <any>new Breakpoint(
                true, 
                this.convertDebuggerLineToClient(linha)
            );
            pontoParada.id = this._idPontoParada++;
            pontoParada.source = undefined;
            
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
    protected override async stackTraceRequest(
        response: DebugProtocol.StackTraceResponse,
        args: DebugProtocol.StackTraceArguments
    ): Promise<void> {
        const startFrame = typeof args.startFrame === 'number' ? args.startFrame : 0;
        const maxLevels = typeof args.levels === 'number' ? args.levels : 1000;
        const endFrame = startFrame + maxLevels;

        const pilha = this.tempoExecucao.pilhaExecucao();
        
        const documento = vscode.window.activeTextEditor?.document;
        const sourceUri = documento?.uri.toString();
        
        const frames: DebugProtocol.StackFrame[] = pilha.slice(startFrame, endFrame).map(elemento => {
            const sf: DebugProtocol.StackFrame = {
                id: elemento.id,
                name: elemento.metodo || '(indefinido)',
                line: this.convertDebuggerLineToClient(elemento.linha),
                column: 0,
                source: sourceUri ? new Source(
                    elemento.arquivo,
                    sourceUri,
                    undefined,
                    undefined,
                    'delegua-adapter-data'
                ) : undefined
            };
            return sf;
        });

        response.body = {
            stackFrames: frames,
            totalFrames: pilha.length
        };
        
        this.sendResponse(response);
    }

    protected override criarReferenciaSource(caminho: string): Source {
        return new Source(
            caminho,
            undefined,
            0,
            undefined,
            'delegua-adapter-data'
        );
    }
}