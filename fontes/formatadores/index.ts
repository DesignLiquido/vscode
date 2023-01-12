import * as vscode from 'vscode';

import { Lexador } from '@designliquido/delegua';
import { FormatadorDelegua } from '@designliquido/delegua/fontes/formatadores';

export class DeleguaProvedorFormatacao implements vscode.DocumentFormattingEditProvider {
    provideDocumentFormattingEdits(document: vscode.TextDocument, options: vscode.FormattingOptions, token: vscode.CancellationToken): vscode.ProviderResult<vscode.TextEdit[]> {
        const lexador = new Lexador();
        const formatador = new FormatadorDelegua();
        const resultadoLexador = lexador.mapear(document.getText().split('\n'), -1);
        return [
            vscode.TextEdit.replace(
                new vscode.Range(
                    document.lineAt(0).range.start,
                    document.lineAt(document.lineCount - 1).range.end
                ),
                formatador.formatar(resultadoLexador.simbolos)
            ),
        ];
    }
}