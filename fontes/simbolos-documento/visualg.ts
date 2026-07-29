import * as vscode from 'vscode';
import { LexadorVisuAlg } from '@designliquido/visualg/lexador';
import { AvaliadorSintaticoVisuAlg } from '@designliquido/visualg/avaliador-sintatico';
import { declaracoesParaSimbolosDocumento } from './delegua-base';

export class VisualgProvedorSimbolosDocumento implements vscode.DocumentSymbolProvider {
    async provideDocumentSymbols(documento: vscode.TextDocument, _token: vscode.CancellationToken): Promise<vscode.DocumentSymbol[]> {
        try {
            const lexador = new LexadorVisuAlg();
            const resultadoLexador = lexador.mapear(documento.getText().split('\n'), -1);
            if (!resultadoLexador || !resultadoLexador.simbolos || resultadoLexador.simbolos.length === 0) {
                return [];
            }

            const avaliador = new AvaliadorSintaticoVisuAlg();
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
