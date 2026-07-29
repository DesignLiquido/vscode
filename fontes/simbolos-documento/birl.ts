import * as vscode from 'vscode';
import { declaracoesParaSimbolosDocumento } from './delegua-base';

export class BirlProvedorSimbolosDocumento implements vscode.DocumentSymbolProvider {
    async provideDocumentSymbols(documento: vscode.TextDocument, _token: vscode.CancellationToken): Promise<vscode.DocumentSymbol[]> {
        try {
            const { LexadorBirl } = await import('@designliquido/birl/lexador');
            const { AvaliadorSintaticoBirl } = await import('@designliquido/birl/avaliador-sintatico');

            const lexador = new LexadorBirl();
            const resultadoLexador = lexador.mapear(documento.getText().split('\n'), -1);
            if (!resultadoLexador || !resultadoLexador.simbolos || resultadoLexador.simbolos.length === 0) {
                return [];
            }

            const avaliador = new AvaliadorSintaticoBirl();
            const resultadoAvaliacao = await avaliador.analisar(resultadoLexador, -1);
            if (!resultadoAvaliacao || !resultadoAvaliacao.declaracoes) {
                return [];
            }

            return declaracoesParaSimbolosDocumento(documento, resultadoAvaliacao.declaracoes);
        } catch {
            return [];
        }
    }
}
