import * as vscode from 'vscode';

import { AvaliadorSintatico } from '@designliquido/delegua/avaliador-sintatico';
import { FormatadorPitugues } from '@designliquido/delegua/formatadores';
import { Lexador } from '@designliquido/delegua/lexador';

import { formatarDiagnosticosAvaliacaoSintatica } from '../avaliacao-sintatica';

export class PituguesProvedorFormatacao implements vscode.DocumentFormattingEditProvider {
    constructor(private readonly diagnosticosDelegua: vscode.DiagnosticCollection) {}

    provideDocumentFormattingEdits(documento: vscode.TextDocument, options: vscode.FormattingOptions, token: vscode.CancellationToken): vscode.ProviderResult<vscode.TextEdit[]> {
        const lexador = new Lexador();
        const avaliadorSintatico = new AvaliadorSintatico(false);

        // Definição de final da linha. 
        // const caracterFimDaLinha = documento.eol === vscode.EndOfLine.CRLF ? '\r\n' : '\n';
        const formatador = new FormatadorPitugues(); // TODO: Atualizar formatador, colocando o caracter de fim de linha como parâmetro.

        const resultadoLexador = lexador.mapear(documento.getText().split('\n'), -1);
        const resultadoAvaliacaoSintatica = avaliadorSintatico.analisar(resultadoLexador, -1);

        if (resultadoAvaliacaoSintatica.erros.length > 0) {
            let listaOcorrencias: vscode.Diagnostic[] = [];
            listaOcorrencias = listaOcorrencias.concat(
                formatarDiagnosticosAvaliacaoSintatica(
                    resultadoAvaliacaoSintatica.erros,
                    documento
                )
            );
            this.diagnosticosDelegua.set(documento.uri, listaOcorrencias);

            return null;
        }

        formatador.formatar(resultadoAvaliacaoSintatica.declaracoes).then(resultado => {
            return [
                vscode.TextEdit.replace(
                    new vscode.Range(
                        documento.lineAt(0).range.start,
                        documento.lineAt(documento.lineCount - 1).range.end
                    ),
                    resultado
                ),
            ];
        }).catch(erro => {
            console.error(erro);
        });        
    }
}