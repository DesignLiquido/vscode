import * as vscode from 'vscode';
import { LexadorPitugues } from '@designliquido/delegua/lexador';
import { AvaliadorSintaticoPitugues } from '@designliquido/delegua/avaliador-sintatico';
import { declaracoesParaSimbolosDocumento } from './delegua-base';

export class PituguesProvedorSimbolosDocumento implements vscode.DocumentSymbolProvider {
    async provideDocumentSymbols(documento: vscode.TextDocument, _token: vscode.CancellationToken): Promise<vscode.DocumentSymbol[]> {
        try {
            const lexador = new LexadorPitugues();
            const resultadoLexador = lexador.mapear(documento.getText().split('\n'), -1);
            if (!resultadoLexador || !resultadoLexador.simbolos || resultadoLexador.simbolos.length === 0) {
                return [];
            }

            const avaliador = new AvaliadorSintaticoPitugues(null as any);
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
