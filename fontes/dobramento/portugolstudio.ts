import * as vscode from 'vscode';
import { LexadorPortugolStudio, AvaliadorSintaticoPortugolStudio } from '@designliquido/portugol-studio';
import { declaracoesParaRangesDobramento } from './delegua-base';

export class PortugolStudioProvedorDobramento implements vscode.FoldingRangeProvider {
    async provideFoldingRanges(documento: vscode.TextDocument, _context: vscode.FoldingContext, _token: vscode.CancellationToken): Promise<vscode.FoldingRange[]> {
        try {
            const lexador = new LexadorPortugolStudio();
            const resultadoLexador = lexador.mapear(documento.getText().split('\n'), -1);
            if (!resultadoLexador || !resultadoLexador.simbolos || resultadoLexador.simbolos.length === 0) return [];

            const avaliador = new AvaliadorSintaticoPortugolStudio();
            const resultadoAvaliacao = await avaliador.analisar(resultadoLexador, -1);
            if (!resultadoAvaliacao || !resultadoAvaliacao.declaracoes) return [];

            return declaracoesParaRangesDobramento(documento, resultadoAvaliacao.declaracoes);
        } catch {
            return [];
        }
    }
}
