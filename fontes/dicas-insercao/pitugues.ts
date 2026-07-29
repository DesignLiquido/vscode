import * as vscode from 'vscode';
import { LexadorPitugues } from '@designliquido/delegua/lexador';
import { AvaliadorSintaticoPitugues } from '@designliquido/delegua/avaliador-sintatico';
import { declaracoesParaDicasInsercao } from './delegua-base';

export class PituguesProvedorDicasInsercao implements vscode.InlayHintsProvider {
    async provideInlayHints(documento: vscode.TextDocument, _range: vscode.Range, _token: vscode.CancellationToken): Promise<vscode.InlayHint[]> {
        try {
            const lexador = new LexadorPitugues();
            const resultadoLexador = lexador.mapear(documento.getText().split('\n'), -1);
            if (!resultadoLexador || !resultadoLexador.simbolos || resultadoLexador.simbolos.length === 0) return [];

            const avaliador = new AvaliadorSintaticoPitugues(null as any);
            const resultadoAvaliacao = await avaliador.analisar(resultadoLexador, -1);
            if (!resultadoAvaliacao || !resultadoAvaliacao.declaracoes) return [];

            return declaracoesParaDicasInsercao(documento, resultadoAvaliacao.declaracoes);
        } catch {
            return [];
        }
    }
}
