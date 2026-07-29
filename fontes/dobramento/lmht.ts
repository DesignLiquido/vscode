import * as vscode from 'vscode';

const { LexadorLmht } = require('@designliquido/lmht-js/fontes/lexador/lexador-lmht');
const { AvaliadorSintaticoLmht } = require('@designliquido/lmht-js/fontes/avaliador-sintatico/avaliador-sintatico-lmht');

export class LmhtProvedorDobramento implements vscode.FoldingRangeProvider {
    provideFoldingRanges(documento: vscode.TextDocument, _context: vscode.FoldingContext, _token: vscode.CancellationToken): vscode.FoldingRange[] {
        try {
            const lexador = new LexadorLmht();
            const resultadoLexador = lexador.mapear(documento.getText());
            if (!resultadoLexador || !resultadoLexador.tokens || resultadoLexador.tokens.length === 0) {
                return [];
            }

            const avaliador = new AvaliadorSintaticoLmht();
            const arvore = avaliador.analisar(resultadoLexador.tokens);
            if (!arvore || !arvore.arvore) {
                return [];
            }

            const ranges: vscode.FoldingRange[] = [];
            const documentoRaiz = arvore.arvore;
            if (documentoRaiz.elementoRaiz) {
                elementoParaRanges(documentoRaiz.elementoRaiz, ranges);
            }
            return ranges;
        } catch {
            return [];
        }
    }
}

function elementoParaRanges(elemento: any, ranges: vscode.FoldingRange[]): void {
    if (!elemento || !elemento.nome) return;
    if (elemento.filhos && elemento.filhos.length > 0) {
        const linhaInicio = elemento.linha !== undefined ? elemento.linha : 0;
        let linhaFim = linhaInicio;
        for (const filho of elemento.filhos) {
            if (filho.linha !== undefined && filho.linha > linhaFim) {
                linhaFim = filho.linha;
            }
        }
        if (linhaFim > linhaInicio) {
            ranges.push(new vscode.FoldingRange(linhaInicio, linhaFim));
        }
        for (const filho of elemento.filhos) {
            elementoParaRanges(filho, ranges);
        }
    }
}
