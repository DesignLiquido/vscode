import * as vscode from 'vscode';

export class DelpropsProvedorFormatacao implements vscode.DocumentFormattingEditProvider {
    provideDocumentFormattingEdits(documento: vscode.TextDocument): vscode.TextEdit[] {
        const caracterFimDaLinha = documento.eol === vscode.EndOfLine.CRLF ? '\r\n' : '\n';
        const linhas = documento.getText().split(/\r?\n/);
        const linhasFormatadas: string[] = [];

        for (const linha of linhas) {
            const trimada = linha.trim();
            if (trimada === '' || trimada.startsWith('//')) {
                linhasFormatadas.push(linha);
                continue;
            }
            const indiceIgual = trimada.indexOf('=');
            if (indiceIgual === -1) {
                linhasFormatadas.push(linha);
                continue;
            }
            const chave = trimada.slice(0, indiceIgual).trim();
            const valor = trimada.slice(indiceIgual + 1).trim();
            linhasFormatadas.push(`${chave} = ${valor}`);
        }

        return [vscode.TextEdit.replace(
            new vscode.Range(
                documento.lineAt(0).range.start,
                documento.lineAt(documento.lineCount - 1).range.end
            ),
            linhasFormatadas.join(caracterFimDaLinha)
        )];
    }
}
