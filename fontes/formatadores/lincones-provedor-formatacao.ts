import * as vscode from 'vscode';
import { Lexador, AvaliadorSintatico, TradutorReversoSqlAnsi } from '@designliquido/lincones-js';

export class LinConEsProvedorFormatacao implements vscode.DocumentFormattingEditProvider {
    async provideDocumentFormattingEdits(documento: vscode.TextDocument): Promise<vscode.TextEdit[]> {
        const texto = documento.getText();
        const linhas = texto.split(/\r?\n/);

        const lexador = new Lexador();
        const resultadoLexador = lexador.mapear(linhas);

        if (resultadoLexador.erros?.length > 0) {
            return [];
        }

        const avaliador = new AvaliadorSintatico();
        const resultadoAvaliacao = avaliador.analisar(resultadoLexador);

        if (resultadoAvaliacao.erros?.length > 0) {
            return [];
        }

        const tradutor = new TradutorReversoSqlAnsi(4);
        const codigoFormatado = tradutor.traduzir(resultadoAvaliacao.comandos).trim();

        return [vscode.TextEdit.replace(
            new vscode.Range(
                documento.lineAt(0).range.start,
                documento.lineAt(documento.lineCount - 1).range.end
            ),
            codigoFormatado
        )];
    }
}
