import * as vscode from 'vscode';
import { LexadorLmht } from '@designliquido/lmht-js/fontes/lexador/lexador-lmht';
import { AvaliadorSintaticoLmht } from '@designliquido/lmht-js/fontes/avaliador-sintatico/avaliador-sintatico-lmht';
import { FormatadorLmht } from '@designliquido/lmht-js/fontes/formatadores/formatador-lmht';

export class LmhtProvedorFormatacao implements vscode.DocumentFormattingEditProvider {
    async provideDocumentFormattingEdits(documento: vscode.TextDocument): Promise<vscode.TextEdit[]> {
        const caracterFimDaLinha = documento.eol === vscode.EndOfLine.CRLF ? '\r\n' : '\n';
        const texto = documento.getText();

        const lexador = new LexadorLmht();
        const resultadoLexador = lexador.mapear(texto);

        if (resultadoLexador.erros.length > 0) {
            return [];
        }

        const avaliador = new AvaliadorSintaticoLmht();
        const resultadoAvaliacao = avaliador.analisar(resultadoLexador.tokens);

        if (resultadoAvaliacao.erros.length > 0) {
            return [];
        }

        const formatador = new FormatadorLmht({
            quebraLinha: caracterFimDaLinha,
            tamanhoIdentacao: 4,
        });

        const codigoFormatado = formatador.formatar(resultadoAvaliacao.arvore);

        return [vscode.TextEdit.replace(
            new vscode.Range(
                documento.lineAt(0).range.start,
                documento.lineAt(documento.lineCount - 1).range.end
            ),
            codigoFormatado
        )];
    }
}
