import * as vscode from 'vscode';

import { LexadorMapler, AvaliadorSintaticoMapler } from '@designliquido/mapler';
import { FormatadorMapler } from '@designliquido/mapler/formatador';

export class MaplerProvedorFormatacao implements vscode.DocumentFormattingEditProvider {
    provideDocumentFormattingEdits(documento: vscode.TextDocument, options: vscode.FormattingOptions, token: vscode.CancellationToken): vscode.ProviderResult<vscode.TextEdit[]> {
        const lexador = new LexadorMapler();
        const avaliadorSintatico = new AvaliadorSintaticoMapler();
        
        // Definição de final da linha. 
        const caracterFimDaLinha = documento.eol === vscode.EndOfLine.CRLF ? '\r\n' : '\n';
        const formatador = new FormatadorMapler(caracterFimDaLinha);

        const resultadoLexador = lexador.mapear(documento.getText().split('\n'), -1);
        const resultadoAvaliacaoSintatica = avaliadorSintatico.analisar(resultadoLexador, -1);
        let codigoFormatado: string = documento.getText();
        try {
            codigoFormatado = formatador.formatar(resultadoAvaliacaoSintatica.declaracoes);
        } catch (erro) {
            console.error(erro);
        }

        return [
            vscode.TextEdit.replace(
                new vscode.Range(
                    documento.lineAt(0).range.start,
                    documento.lineAt(documento.lineCount - 1).range.end
                ),
                codigoFormatado
            ),
        ];
    }
}