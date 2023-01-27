import * as vscode from 'vscode';
import { primitivasNumero, primitivasTexto, primitivasVetor } from '../primitivas';

export class DeleguaProvedorDocumentacaoEmEditor implements vscode.HoverProvider {
    provideHover(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken): vscode.ProviderResult<vscode.Hover> {
        const intervalo = document.getWordRangeAtPosition(position);
        const palavra = document.getText(intervalo);

        const documentacaoEscreva = new vscode.MarkdownString('Escreve um ou mais argumentos na saída padrão da aplicação.', true);
        documentacaoEscreva.appendCodeblock('função escreva(...argumentos)', 'delegua');

        let mapa = {
            escreva: documentacaoEscreva
        };

        [...primitivasNumero, ...primitivasTexto, ...primitivasVetor].map(primitiva => {
            mapa[primitiva.nome] = primitiva.documentacao;
        })
        
        return new vscode.Hover(mapa[palavra]);
    }
}
