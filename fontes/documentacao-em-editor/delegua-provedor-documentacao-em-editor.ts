import * as vscode from 'vscode';

import primitivas from '../primitivas';

/**
 * Provedor de documentação para "hover" (ponteiro do _mouse_ por cima do elemento de código.)
 */
export class DeleguaProvedorDocumentacaoEmEditor
    implements vscode.HoverProvider {
    provideHover(
        documento: vscode.TextDocument,
        posicao: vscode.Position,
        token: vscode.CancellationToken
    ): vscode.ProviderResult<vscode.Hover> {
        const intervalo = documento.getWordRangeAtPosition(posicao);
        const palavra = documento.getText(intervalo);

        let mapa = {};

        const primitiva = primitivas.find(
            (primitiva) => primitiva.nome === palavra
        );

        if (primitiva) {
            const documentacaoElemento = new vscode.MarkdownString(primitiva.documentacao);

            documentacaoElemento.appendCodeblock(primitiva.exemploCodigo,
                'delegua'
            );
            mapa[primitiva.nome] = documentacaoElemento;
        }

        return new vscode.Hover(mapa[palavra]);
    }
}
