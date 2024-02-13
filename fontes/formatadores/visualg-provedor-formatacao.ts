import * as vscode from 'vscode';
import * as sistemaOperacional from 'node:os';


import { FormatadorVisuAlg } from '@designliquido/delegua/formatadores';
import { LexadorVisuAlg } from '@designliquido/delegua/lexador/dialetos';
import { AvaliadorSintaticoVisuAlg } from '@designliquido/delegua/avaliador-sintatico/dialetos';

export class VisualgProvedorFormatacao implements vscode.DocumentFormattingEditProvider {
    provideDocumentFormattingEdits(document: vscode.TextDocument, options: vscode.FormattingOptions, token: vscode.CancellationToken): vscode.ProviderResult<vscode.TextEdit[]> {
        const lexador = new LexadorVisuAlg();
        const avaliadorSintatico = new AvaliadorSintaticoVisuAlg();
        const formatador = new FormatadorVisuAlg(sistemaOperacional.EOL);

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