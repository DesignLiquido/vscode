import * as vscode from 'vscode';
import {
    BreakpointEvent,
    OutputEvent,
    Source,
    StoppedEvent,
    TerminatedEvent,
} from '@vscode/debugadapter';
import { DebugProtocol } from '@vscode/debugprotocol';

import { DeleguaTempoExecucaoWeb } from './delegua-tempo-execucao-web';
import { DeleguaPontoParada } from '../delegua-ponto-parada';
import { ProvedorVisaoEntradaSaida } from '../../visoes';
import { DeleguaSessaoDepuracaoBase } from '../delegua-sessao-depuracao-base';

/**
 * Sessão de depuração específica para web.
 * Usa DeleguaTempoExecucaoWeb que não depende de APIs Node.js.
 */
export class DeleguaSessaoDepuracaoWeb extends DeleguaSessaoDepuracaoBase {
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

        // ... rest of the event handlers (same as DeleguaSessaoDepuracaoBase)
        // Copy all the this.tempoExecucao.on(...) handlers from DeleguaSessaoDepuracaoBase

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

    // Copy all the protected methods from DeleguaSessaoDepuracaoBase
    // (initializeRequest, launchRequest, continueRequest, etc.)
    
    protected criarReferenciaSource(caminho: string): Source {
        return new Source(
            caminho,
            this.convertDebuggerPathToClient(caminho),
            undefined, 
            undefined,
            'delegua-adapter-data'
        );
    }
}