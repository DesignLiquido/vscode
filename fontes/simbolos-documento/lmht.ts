import * as vscode from 'vscode';

const { LexadorLmht } = require('@designliquido/lmht-js/fontes/lexador/lexador-lmht');
const { AvaliadorSintaticoLmht } = require('@designliquido/lmht-js/fontes/avaliador-sintatico/avaliador-sintatico-lmht');

export class LmhtProvedorSimbolosDocumento implements vscode.DocumentSymbolProvider {
    provideDocumentSymbols(documento: vscode.TextDocument, _token: vscode.CancellationToken): vscode.DocumentSymbol[] {
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

            const documentoRaiz = arvore.arvore;
            const simbolos: vscode.DocumentSymbol[] = [];
            if (documentoRaiz.elementoRaiz) {
                const s = elementoParaSimbolo(documento, documentoRaiz.elementoRaiz);
                if (s) simbolos.push(s);
            }
            return simbolos;
        } catch {
            return [];
        }
    }
}

function elementoParaSimbolo(documento: vscode.TextDocument, elemento: any): vscode.DocumentSymbol | null {
    if (!elemento || !elemento.nome) return null;

    const linha = elemento.linha !== undefined ? elemento.linha : 0;
    const coluna = elemento.coluna !== undefined ? elemento.coluna : 0;
    const linhaValida = Math.min(linha, documento.lineCount - 1);
    const selectionRange = new vscode.Range(linhaValida, coluna, linhaValida, coluna + elemento.nome.length);

    let linhaFim = linhaValida;
    if (elemento.filhos && elemento.filhos.length > 0) {
        for (const filho of elemento.filhos) {
            if (filho.linha !== undefined && filho.linha > linhaFim) {
                linhaFim = filho.linha;
            }
        }
    }
    const range = new vscode.Range(linhaValida, 0, linhaFim, documento.lineAt(linhaFim).text.length);

    const simbolo = new vscode.DocumentSymbol(elemento.nome, '', vscode.SymbolKind.Module, range, selectionRange);

    if (elemento.filhos && elemento.filhos.length > 0) {
        for (const filho of elemento.filhos) {
            if (filho.nome) {
                const child = elementoParaSimbolo(documento, filho);
                if (child) simbolo.children.push(child);
            }
        }
    }

    return simbolo;
}
