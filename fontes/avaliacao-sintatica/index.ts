import * as vscode from 'vscode';

import { ErroAvaliadorSintatico } from "@designliquido/delegua/avaliador-sintatico";

export function formatarDiagnosticosAvaliacaoSintatica(
    errosAvaliacaoSintatica: ErroAvaliadorSintatico[],
    documento: vscode.TextDocument
): vscode.Diagnostic[] {
    const listaOcorrenciasSintaticas: vscode.Diagnostic[] = [];
    for (let erro of errosAvaliacaoSintatica) {
        if (!erro?.simbolo?.linha) {
            continue;
        }
        const numeroLinha = Math.max(0, Number(erro.simbolo.linha) - 1);
        if (numeroLinha >= documento.lineCount) {
            continue;
        }
        const linha: vscode.TextLine = documento.lineAt(numeroLinha);
        const textoLinha = linha.text;
        const intervaloTexto = new vscode.Range(numeroLinha, 0, numeroLinha, textoLinha.length);

        listaOcorrenciasSintaticas.push(new vscode.Diagnostic(
            intervaloTexto,
            String(erro.message),
            vscode.DiagnosticSeverity.Error
        ));
    }

    return listaOcorrenciasSintaticas;
}
