import * as vscode from 'vscode';

import { AvaliadorSintatico } from '@designliquido/delegua/avaliador-sintatico';
import { FormatadorDelegua } from '@designliquido/delegua/formatadores';
import { Lexador } from '@designliquido/delegua/lexador';

import { formatarDiagnosticosAvaliacaoSintatica } from '../avaliacao-sintatica';

export class DeleguaProvedorFormatacao implements vscode.DocumentFormattingEditProvider {
    constructor(private readonly diagnosticosDelegua: vscode.DiagnosticCollection) {}

    provideDocumentFormattingEdits(documento: vscode.TextDocument, options: vscode.FormattingOptions, token: vscode.CancellationToken): vscode.ProviderResult<vscode.TextEdit[]> {
        const lexador = new Lexador();
        const avaliadorSintatico = new AvaliadorSintatico(false);

        // Definição de final da linha. 
        const caracterFimDaLinha = documento.eol === vscode.EndOfLine.CRLF ? '\r\n' : '\n';
        const formatador = new FormatadorDelegua(caracterFimDaLinha);

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