import * as vscode from 'vscode';
import { declaracoesParaRangesDobramento } from './delegua-base';

export class EguaProvedorDobramento implements vscode.FoldingRangeProvider {
    async provideFoldingRanges(documento: vscode.TextDocument, _context: vscode.FoldingContext, _token: vscode.CancellationToken): Promise<vscode.FoldingRange[]> {
        try {
            const { LexadorEguaClassico } = await import('@designliquido/delegua/lexador');
            const { AvaliadorSintaticoEguaClassico } = await import('@designliquido/delegua/avaliador-sintatico');

            const lexador = new LexadorEguaClassico();
            const resultadoLexador = lexador.mapear(documento.getText().split('\n'));
            if (!resultadoLexador || !resultadoLexador.simbolos || resultadoLexador.simbolos.length === 0) return [];

            const avaliador = new AvaliadorSintaticoEguaClassico();
            const resultadoAvaliacao = await avaliador.analisar(resultadoLexador, -1);
            if (!resultadoAvaliacao || !resultadoAvaliacao.declaracoes) return [];

            return declaracoesParaRangesDobramento(documento, resultadoAvaliacao.declaracoes);
        } catch {
            return [];
        }
    }
}
