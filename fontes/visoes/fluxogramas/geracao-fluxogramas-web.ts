import * as vscode from 'vscode';

import { Lexador } from '@designliquido/delegua/lexador';
import { TradutorMermaidJs } from '@designliquido/delegua/tradutores';
import { ImportadorExtensao } from '../../importador';
import { AvaliadorSintatico, RetornoLexador, SimboloInterface } from '@designliquido/delegua';
import { GerenciadorVisoesFluxograma } from './gerenciador-visoes-fluxograma';

/**
 * Gera um fluxograma para um fonte Delégua (lógica Web)
 */
export async function gerarFluxogramaWeb(uri: vscode.Uri | undefined, context: vscode.ExtensionContext) {
    try {
        // Obtém o URI do arquivo
        const fileUri = uri || vscode.window.activeTextEditor?.document.uri;

        if (!fileUri) {
            vscode.window.showErrorMessage('Nenhum arquivo Delégua selecionado.');
            return;
        }

        // Obtém o nome do arquivo
        const pathSegments = fileUri.path.split('/');
        const fileName = pathSegments[pathSegments.length - 1];

        // Valida a extensão do arquivo (opcional)
        if (!fileName.endsWith('.delegua') && !fileName.endsWith('.delégua')) {
            const proceed = await vscode.window.showWarningMessage(
                'Este arquivo pode não ser um arquivo Delégua válido. Deseja continuar?',
                'Sim',
                'Não'
            );
            if (proceed !== 'Sim') {
                return;
            }
        }

        // Exibe indicador de progresso
        await vscode.window.withProgress(
            {
                location: vscode.ProgressLocation.Notification,
                title: 'Gerando fluxograma...',
                cancellable: false
            },
            async (progress) => {
                progress.report({ increment: 0, message: 'Lendo arquivo...' });

                // Analisa o código Delégua
                const lexador = new Lexador();
                const avaliadorSintatico = new AvaliadorSintatico();

                // Nota: Na versão web, as pastas do workspace funcionam de forma diferente
                // Você pode precisar adaptar isso conforme suas necessidades
                // const workspaceFolder = vscode.workspace.workspaceFolders?.[0]?.uri.toString();
                const importador = new ImportadorExtensao(lexador);

                const conteudoArquivo = await vscode.workspace.fs.readFile(fileUri);
                const funcaoImportadorLeituraArquivo = () => new TextDecoder('utf-8').decode(conteudoArquivo);
                const retornoImportador = importador.importarViaFuncaoConteudoDocumento(
                    funcaoImportadorLeituraArquivo, 
                    fileUri.fsPath
                );

                progress.report({ increment: 30, message: 'Analisando código...' });

                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(
                    retornoImportador?.retornoLexador as RetornoLexador<SimboloInterface<string>>, 
                    -1
                );

                progress.report({ increment: 30, message: 'Gerando diagrama...' });

                // Gera diagrama Mermaid
                const tradutor = new TradutorMermaidJs();
                const diagramaMermaid = await tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);

                if (!diagramaMermaid || diagramaMermaid.trim() === '') {
                    vscode.window.showWarningMessage(
                        'O arquivo não contém declarações que possam ser convertidas em fluxograma.'
                    );
                    return;
                }

                progress.report({ increment: 30, message: 'Exibindo fluxograma...' });

                // Cria e exibe o painel webview usando o gerenciador compartilhado
                // Nota: context.extensionUri funciona tanto no desktop quanto na web
                GerenciadorVisoesFluxograma.criarOuExibir(
                    diagramaMermaid,
                    fileName,
                    context.extensionUri
                );

                progress.report({ increment: 10, message: 'Concluído!' });
            }
        );

    } catch (error) {
        console.error('Erro ao gerar fluxograma:', error);
        vscode.window.showErrorMessage(
            `Erro ao gerar fluxograma: ${error instanceof Error ? error.message : String(error)}`
        );
    }
}