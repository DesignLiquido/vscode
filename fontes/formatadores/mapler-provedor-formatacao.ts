import * as vscode from 'vscode';
import * as sistemaOperacional from 'node:os';

import { LexadorMapler, AvaliadorSintaticoMapler } from '@designliquido/mapler';
import { FormatadorMapler } from '@designliquido/mapler/formatador';


export class MaplerProvedorFormatacao implements vscode.DocumentFormattingEditProvider {
    provideDocumentFormattingEdits(document: vscode.TextDocument, options: vscode.FormattingOptions, token: vscode.CancellationToken): vscode.ProviderResult<vscode.TextEdit[]> {
        const lexador = new LexadorMapler();
        const avaliadorSintatico = new AvaliadorSintaticoMapler();
        const formatador = new FormatadorMapler(sistemaOperacional.EOL);

        const resultadoLexador = lexador.mapear(document.getText().split('\n'), -1);
        const resultadoAvaliacaoSintatica = avaliadorSintatico.analisar(resultadoLexador, -1);
        let codigoFormatado: string = document.getText();
        try {
            codigoFormatado = formatador.formatar(resultadoAvaliacaoSintatica.declaracoes);
        } catch (erro) {
            console.error(erro);
        }

        return [
            vscode.TextEdit.replace(
                new vscode.Range(
                    document.lineAt(0).range.start,
                    document.lineAt(document.lineCount - 1).range.end
                ),
                codigoFormatado
            ),
        ];
    }
}
