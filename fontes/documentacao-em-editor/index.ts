import * as vscode from 'vscode';

export class DeleguaProvedorDocumentacaoEmEditor implements vscode.HoverProvider {
    provideHover(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken): vscode.ProviderResult<vscode.Hover> {
        const intervalo = document.getWordRangeAtPosition(position);
        const palavra = document.getText(intervalo);
        const documentacaoEscreva = new vscode.MarkdownString('Escreve um ou mais argumentos na saída padrão da aplicação.', true);
        documentacaoEscreva.appendCodeblock('função escreva(...argumentos)', 'delegua');
        const mapa = {
            aleatorio: 'Retorna um número aleatório entre 0 e 1.',
            escreva: documentacaoEscreva
        };
        
        return new vscode.Hover(mapa[palavra]);
    }
}
