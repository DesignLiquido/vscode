import * as vscode from 'vscode';
import { Lexador, AvaliadorSintatico } from '@designliquido/foles';

export class FolesProvedorDobramento implements vscode.FoldingRangeProvider {
    provideFoldingRanges(documento: vscode.TextDocument, _context: vscode.FoldingContext, _token: vscode.CancellationToken): vscode.FoldingRange[] {
        try {
            const lexador = new Lexador();
            const resultadoLexador = lexador.mapear(documento.getText().split('\n'));
            if (!resultadoLexador || !resultadoLexador.simbolos || resultadoLexador.simbolos.length === 0) {
                return [];
            }

            const avaliador = new AvaliadorSintatico(null as any);
            const resultadoAvaliacao = avaliador.analisar(resultadoLexador.simbolos);
            if (!resultadoAvaliacao) {
                return [];
            }

            const ranges: vscode.FoldingRange[] = [];
            for (const declaracao of resultadoAvaliacao) {
                if (declaracao.constructor.name === 'BlocoDeclaracao') {
                    const bloco = declaracao as any;
                    if (bloco.seletores && bloco.seletores.length > 0) {
                        const linhaInicio = bloco.seletores[0].linha !== undefined ? bloco.seletores[0].linha : 0;
                        let linhaFim = linhaInicio;
                        if (bloco.declaracoesAninhadas && bloco.declaracoesAninhadas.length > 0) {
                            for (const aninhada of bloco.declaracoesAninhadas) {
                                if (aninhada.linha !== undefined && aninhada.linha > linhaFim) {
                                    linhaFim = aninhada.linha;
                                }
                            }
                        }
                        if (linhaFim > linhaInicio) {
                            ranges.push(new vscode.FoldingRange(linhaInicio, linhaFim));
                        }
                    }
                }
            }

            return ranges;
        } catch {
            return [];
        }
    }
}
