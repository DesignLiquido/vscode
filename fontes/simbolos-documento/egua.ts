import * as vscode from 'vscode';
import { declaracoesParaSimbolosDocumento } from './delegua-base';

export class EguaProvedorSimbolosDocumento implements vscode.DocumentSymbolProvider {
    async provideDocumentSymbols(documento: vscode.TextDocument, _token: vscode.CancellationToken): Promise<vscode.DocumentSymbol[]> {
        try {
            const { LexadorEguaClassico } = await import('@designliquido/delegua/lexador');
            const { AvaliadorSintaticoEguaClassico } = await import('@designliquido/delegua/avaliador-sintatico');

            const lexador = new LexadorEguaClassico();
            const resultadoLexador = lexador.mapear(documento.getText().split('\n'));
            if (!resultadoLexador || !resultadoLexador.simbolos || resultadoLexador.simbolos.length === 0) {
                return [];
            }

            const avaliador = new AvaliadorSintaticoEguaClassico();
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
