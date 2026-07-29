import * as vscode from 'vscode';

export class DelpropsProvedorSimbolosDocumento implements vscode.DocumentSymbolProvider {
    provideDocumentSymbols(documento: vscode.TextDocument, _token: vscode.CancellationToken): vscode.DocumentSymbol[] {
        const simbolos: vscode.DocumentSymbol[] = [];
        const linhas = documento.getText().split('\n');

        for (let i = 0; i < linhas.length; i++) {
            const linha = linhas[i].trim();
            if (!linha || linha.startsWith('#') || linha.startsWith('//')) continue;

            const indexIgual = linha.indexOf('=');
            if (indexIgual < 0) continue;

            const chave = linha.substring(0, indexIgual).trim();
            if (!chave) continue;

            const valor = linha.substring(indexIgual + 1).trim();
            const range = new vscode.Range(i, 0, i, linhas[i].length);
            const selectionRange = posicaoParaTexto(linhas[i], i, chave);
            const kind = chave.includes('.') ? vscode.SymbolKind.Property : vscode.SymbolKind.Variable;
            simbolos.push(new vscode.DocumentSymbol(chave, valor, kind, range, selectionRange));
        }

        return simbolos;
    }
}

function posicaoParaTexto(textoLinha: string, linha: number, texto: string): vscode.Range {
    const coluna = textoLinha.indexOf(texto);
    const colunaFinal = coluna >= 0 ? coluna : 0;
    return new vscode.Range(linha, colunaFinal, linha, colunaFinal + texto.length);
}
