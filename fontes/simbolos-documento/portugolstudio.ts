import * as vscode from 'vscode';
import { LexadorPortugolStudio, AvaliadorSintaticoPortugolStudio } from '@designliquido/portugol-studio';
import { declaracoesParaSimbolosDocumento } from './delegua-base';

export class PortugolStudioProvedorSimbolosDocumento implements vscode.DocumentSymbolProvider {
    async provideDocumentSymbols(documento: vscode.TextDocument, _token: vscode.CancellationToken): Promise<vscode.DocumentSymbol[]> {
        try {
            const lexador = new LexadorPortugolStudio();
            const resultadoLexador = lexador.mapear(documento.getText().split('\n'), -1);
            if (!resultadoLexador || !resultadoLexador.simbolos || resultadoLexador.simbolos.length === 0) {
                return [];
            }

            const avaliador = new AvaliadorSintaticoPortugolStudio();
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
