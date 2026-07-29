import * as vscode from 'vscode';
import { declaracoesParaTokensSemanticos, LEGENDA_TOKENS_SEMANTICOS } from './delegua-base';

export class EguaProvedorTokensSemanticos implements vscode.DocumentSemanticTokensProvider {
    async provideDocumentSemanticTokens(documento: vscode.TextDocument, _token: vscode.CancellationToken): Promise<vscode.SemanticTokens> {
        try {
            const { LexadorEguaClassico } = await import('@designliquido/delegua/lexador');
            const { AvaliadorSintaticoEguaClassico } = await import('@designliquido/delegua/avaliador-sintatico');

            const lexador = new LexadorEguaClassico();
            const resultadoLexador = lexador.mapear(documento.getText().split('\n'));
            if (!resultadoLexador || !resultadoLexador.simbolos || resultadoLexador.simbolos.length === 0) {
                return new vscode.SemanticTokens(new Uint32Array(0));
            }

            const avaliador = new AvaliadorSintaticoEguaClassico();
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
