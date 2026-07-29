import * as vscode from 'vscode';
import { extrairTokensDeDocumento, tokensParaSemanticTokens, LEGENDA_TOKENS_SEMANTICOS } from './delegua-base';

export class FolesProvedorTokensSemanticos implements vscode.DocumentSemanticTokensProvider {
    provideDocumentSemanticTokens(documento: vscode.TextDocument, _token: vscode.CancellationToken): vscode.SemanticTokens {
        try {
            const tokens = extrairTokensDeDocumento(documento.getText());
            return tokensParaSemanticTokens(tokens);
        } catch {
            return new vscode.SemanticTokens(new Uint32Array(0));
        }
    }
}

export { LEGENDA_TOKENS_SEMANTICOS };
