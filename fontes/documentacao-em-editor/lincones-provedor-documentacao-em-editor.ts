import * as vscode from 'vscode';

import modificadoresLinConEs from '../linguagens/lincones/documentacao';

/**
 * Provedor de documentação para "hover" (ponteiro do _mouse_ por cima do elemento de código.)
 * para LinConEs.
 */
export class LinConEsProvedorDocumentacaoEmEditor
    implements vscode.HoverProvider
{
    provideHover(
        document: vscode.TextDocument,
        position: vscode.Position,
        token: vscode.CancellationToken
    ): vscode.ProviderResult<vscode.Hover> {
        const intervalo = document.getWordRangeAtPosition(position, /[a-zA-Z0-9À-ž\-]+/);
        const palavra = document.getText(intervalo);

        const modificador = modificadoresLinConEs[palavra];
        const elementoDocumentacao = new vscode.MarkdownString(modificador.documentacao);
        elementoDocumentacao.appendCodeblock(modificador.exemploCodigo);
        return new vscode.Hover(elementoDocumentacao);
    }
}
