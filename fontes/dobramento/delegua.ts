import * as vscode from 'vscode';
import { Lexador } from '@designliquido/delegua/lexador';
import { AvaliadorSintaticoComImportacao } from '../avaliacao-sintatica/avaliador-sintatico-com-importacao';
import { declaracoesParaRangesDobramento } from './delegua-base';

export class DeleguaProvedorDobramento implements vscode.FoldingRangeProvider {
    async provideFoldingRanges(documento: vscode.TextDocument, _context: vscode.FoldingContext, _token: vscode.CancellationToken): Promise<vscode.FoldingRange[]> {
        try {
            const lexador = new Lexador();
            const resultadoLexador = lexador.mapear(documento.getText().split('\n'), -1);
            if (!resultadoLexador || !resultadoLexador.simbolos || resultadoLexador.simbolos.length === 0) {
                return [];
            }

            const avaliador = new AvaliadorSintaticoComImportacao(null as any);
            const resultadoAvaliacao = await avaliador.analisar(resultadoLexador, -1);
            if (!resultadoAvaliacao || !resultadoAvaliacao.declaracoes) {
                return [];
            }

            return declaracoesParaRangesDobramento(documento, resultadoAvaliacao.declaracoes);
        } catch {
            return [];
        }
    }
}
