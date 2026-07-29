import * as vscode from 'vscode';
import { LexadorPotigol } from '@designliquido/potigol/lexador';
import { AvaliadorSintaticoPotigol } from '@designliquido/potigol/avaliador-sintatico';
import { declaracoesParaRangesDobramento } from './delegua-base';

export class PotigolProvedorDobramento implements vscode.FoldingRangeProvider {
    async provideFoldingRanges(documento: vscode.TextDocument, _context: vscode.FoldingContext, _token: vscode.CancellationToken): Promise<vscode.FoldingRange[]> {
        try {
            const lexador = new LexadorPotigol();
            const resultadoLexador = lexador.mapear(documento.getText().split('\n'), -1);
            if (!resultadoLexador || !resultadoLexador.simbolos || resultadoLexador.simbolos.length === 0) return [];

            const avaliador = new AvaliadorSintaticoPotigol();
            const resultadoAvaliacao = await avaliador.analisar(resultadoLexador, -1);
            if (!resultadoAvaliacao || !resultadoAvaliacao.declaracoes) return [];

            return declaracoesParaRangesDobramento(documento, resultadoAvaliacao.declaracoes);
        } catch {
            return [];
        }
    }
}
