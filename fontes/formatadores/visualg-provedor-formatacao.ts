import * as vscode from 'vscode';

import { FormatadorVisuAlg } from '@designliquido/visualg/formatador';
import { LexadorVisuAlg } from '@designliquido/visualg/lexador';
import { AvaliadorSintaticoVisuAlg } from '@designliquido/visualg/avaliador-sintatico';

export class VisualgProvedorFormatacao implements vscode.DocumentFormattingEditProvider {
    provideDocumentFormattingEdits(documento: vscode.TextDocument, options: vscode.FormattingOptions, token: vscode.CancellationToken): vscode.ProviderResult<vscode.TextEdit[]> {
        const lexador = new LexadorVisuAlg();
        const avaliadorSintatico = new AvaliadorSintaticoVisuAlg();

        // Definição de final da linha. 
        const caracterFimDaLinha = documento.eol === vscode.EndOfLine.CRLF ? '\r\n' : '\n';
        const formatador = new FormatadorVisuAlg(caracterFimDaLinha);
        
        let codigoFormatado: string = documento.getText();
        try {
            const resultadoLexador = lexador.mapear(documento.getText().split('\n'), -1);
            const resultadoAvaliacaoSintatica = avaliadorSintatico.analisar(resultadoLexador, -1);
            
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