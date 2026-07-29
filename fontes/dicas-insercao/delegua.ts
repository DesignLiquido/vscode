import * as vscode from 'vscode';
import { Lexador } from '@designliquido/delegua/lexador';
import { AvaliadorSintaticoComImportacao } from '../avaliacao-sintatica/avaliador-sintatico-com-importacao';
import { declaracoesParaDicasInsercao } from './delegua-base';

export class DeleguaProvedorDicasInsercao implements vscode.InlayHintsProvider {
    async provideInlayHints(documento: vscode.TextDocument, _range: vscode.Range, _token: vscode.CancellationToken): Promise<vscode.InlayHint[]> {
        try {
            const lexador = new Lexador();
            const resultadoLexador = lexador.mapear(documento.getText().split('\n'), -1);
            if (!resultadoLexador || !resultadoLexador.simbolos || resultadoLexador.simbolos.length === 0) return [];

            const avaliador = new AvaliadorSintaticoComImportacao(null as any);
            const resultadoAvaliacao = await avaliador.analisar(resultadoLexador, -1);
            if (!resultadoAvaliacao || !resultadoAvaliacao.declaracoes) return [];

            return declaracoesParaDicasInsercao(documento, resultadoAvaliacao.declaracoes);
        } catch {
            return [];
        }
    }
}
