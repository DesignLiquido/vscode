import * as vscode from 'vscode';

import primitivas from '../primitivas';

/**
 * Provedor de documentação para "hover" (ponteiro do _mouse_ por cima do elemento de código.)
 */
export class DeleguaProvedorDocumentacaoEmEditor
    implements vscode.HoverProvider {
    provideHover(
        document: vscode.TextDocument,
        position: vscode.Position,
        token: vscode.CancellationToken
    ): vscode.ProviderResult<vscode.Hover> {
        const intervalo = document.getWordRangeAtPosition(position);
        const palavra = document.getText(intervalo);

        let mapa = {};

        const primitiva = primitivas.find(
            (primitiva) => primitiva.nome === palavra
        );

        if (primitiva) {
            const documentacaoElemento = new vscode.MarkdownString(primitiva.documentacao);

            documentacaoElemento.appendCodeblock((primitiva as any).exemploCodigo,
                'delegua'
            );
            mapa[primitiva.nome] = documentacaoElemento;
        }

        return new vscode.Hover(mapa[palavra]);
    }
}
