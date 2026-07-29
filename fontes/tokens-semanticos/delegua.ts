import * as vscode from 'vscode';
import { Lexador } from '@designliquido/delegua/lexador';
import { AvaliadorSintaticoComImportacao } from '../avaliacao-sintatica/avaliador-sintatico-com-importacao';
import { declaracoesParaTokensSemanticos, LEGENDA_TOKENS_SEMANTICOS } from './delegua-base';

export class DeleguaProvedorTokensSemanticos implements vscode.DocumentSemanticTokensProvider {
    async provideDocumentSemanticTokens(documento: vscode.TextDocument, _token: vscode.CancellationToken): Promise<vscode.SemanticTokens> {
        try {
            const lexador = new Lexador();
            const resultadoLexador = lexador.mapear(documento.getText().split('\n'), -1);
            if (!resultadoLexador || !resultadoLexador.simbolos || resultadoLexador.simbolos.length === 0) {
                return new vscode.SemanticTokens(new Uint32Array(0));
            }

            const avaliador = new AvaliadorSintaticoComImportacao(null as any);
            const resultadoAvaliacao = await avaliador.analisar(resultadoLexador, -1);
            if (!resultadoAvaliacao || !resultadoAvaliacao.declaracoes) {
                return new vscode.SemanticTokens(new Uint32Array(0));
            }

            return declaracoesParaTokensSemanticos(documento, resultadoAvaliacao.declaracoes);
        } catch {
            return new vscode.SemanticTokens(new Uint32Array(0));
        }
    }
}

export { LEGENDA_TOKENS_SEMANTICOS };
