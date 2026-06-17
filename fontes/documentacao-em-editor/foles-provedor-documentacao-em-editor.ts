import * as vscode from 'vscode';

import listaModificadores from '@designliquido/foles/extensao/lista-modificadores';

/**
 * Provedor de documentação para "hover" (ponteiro do _mouse_ por cima do elemento de código.)
 */
export class FolesProvedorDocumentacaoEmEditor
    implements vscode.HoverProvider
{
    provideHover(
        document: vscode.TextDocument,
        position: vscode.Position,
        token: vscode.CancellationToken
    ): vscode.ProviderResult<vscode.Hover> {
        const intervalo = document.getWordRangeAtPosition(position, /[a-zA-Z0-9À-ž\-]+/);
        const palavra = document.getText(intervalo);

        const modificador = listaModificadores[palavra];
        const elementoDocumentacao = new vscode.MarkdownString(modificador.documentacao);
        elementoDocumentacao.appendCodeblock(modificador.exemploCodigo);
        return new vscode.Hover(elementoDocumentacao);
    }
}
