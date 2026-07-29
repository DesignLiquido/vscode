import * as vscode from 'vscode';
import { declaracoesParaRangesDobramento } from './delegua-base';

export class BirlProvedorDobramento implements vscode.FoldingRangeProvider {
    async provideFoldingRanges(documento: vscode.TextDocument, _context: vscode.FoldingContext, _token: vscode.CancellationToken): Promise<vscode.FoldingRange[]> {
        try {
            const { LexadorBirl } = await import('@designliquido/birl/lexador');
            const { AvaliadorSintaticoBirl } = await import('@designliquido/birl/avaliador-sintatico');

            const lexador = new LexadorBirl();
            const resultadoLexador = lexador.mapear(documento.getText().split('\n'), -1);
            if (!resultadoLexador || !resultadoLexador.simbolos || resultadoLexador.simbolos.length === 0) return [];

            const avaliador = new AvaliadorSintaticoBirl();
            const resultadoAvaliacao = await avaliador.analisar(resultadoLexador, -1);
            if (!resultadoAvaliacao || !resultadoAvaliacao.declaracoes) return [];

            return declaracoesParaRangesDobramento(documento, resultadoAvaliacao.declaracoes);
        } catch {
            return [];
        }
    }
}
