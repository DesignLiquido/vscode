import * as vscode from 'vscode';
import * as path from 'path';

import { Lexador } from '@designliquido/delegua/lexador';
import { TradutorMermaidJs } from '@designliquido/delegua/tradutores';
import { ImportadorExtensao } from '../../importador';
import { AvaliadorSintatico, RetornoLexador, SimboloInterface } from '@designliquido/delegua';
import { GerenciadorVisoesFluxograma } from './gerenciador-visoes-fluxograma';

/**
 * Generates and displays the flowchart for a Delégua file
 */
export async function gerarFluxograma(uri: vscode.Uri | undefined, context: vscode.ExtensionContext) {
    try {
        const localizadorArquivo = uri || vscode.window.activeTextEditor?.document.uri;

        if (!localizadorArquivo) {
            vscode.window.showErrorMessage('Nenhum arquivo Delégua selecionado.');
            return;
        }

        const nomeArquivo = path.basename(localizadorArquivo.fsPath);
        if (!nomeArquivo.endsWith('.delegua') && !nomeArquivo.endsWith('.delégua')) {
            const continuar = await vscode.window.showWarningMessage(
                'Este arquivo pode não ser um arquivo Delégua válido. Deseja continuar?',
                'Sim',
                'Não'
            );
            if (continuar !== 'Sim') {
                return;
            }
        }

        await vscode.window.withProgress(
            {
                location: vscode.ProgressLocation.Notification,
                title: 'Gerando fluxograma...',
                cancellable: false
            },
            async (progresso) => {
                progresso.report({ increment: 0, message: 'Lendo arquivo...' });

                // Analisa o código Delégua
                const lexador = new Lexador();
                const importador = new ImportadorExtensao(lexador);
                const avaliadorSintatico = new AvaliadorSintatico();

                const retornoImportador = await importador.importar(nomeArquivo, -1);

                progresso.report({ increment: 30, message: 'Analisando código...' });

                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(
                    retornoImportador?.retornoLexador as RetornoLexador<SimboloInterface<string>>, 
                    -1
                );

                progresso.report({ increment: 30, message: 'Gerando diagrama...' });

                const tradutor = new TradutorMermaidJs();
                const diagramaMermaid = tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);

                if (!diagramaMermaid || diagramaMermaid.trim() === '') {
                    vscode.window.showWarningMessage(
                        'O arquivo não contém declarações que possam ser convertidas em fluxograma.'
                    );
                    return;
                }

                progresso.report({ increment: 30, message: 'Exibindo fluxograma...' });

                GerenciadorVisoesFluxograma.criarOuExibir(
                    diagramaMermaid,
                    nomeArquivo,
                    context.extensionUri
                );

                progresso.report({ increment: 10, message: 'Concluído!' });
            }
        );

    } catch (error) {
        console.error('Erro ao gerar fluxograma:', error);
        vscode.window.showErrorMessage(
            `Erro ao gerar fluxograma: ${error instanceof Error ? error.message : String(error)}`
        );
    }
}
