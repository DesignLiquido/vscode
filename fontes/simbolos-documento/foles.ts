import * as vscode from 'vscode';
import { Lexador, AvaliadorSintatico } from '@designliquido/foles';

export class FolesProvedorSimbolosDocumento implements vscode.DocumentSymbolProvider {
    provideDocumentSymbols(documento: vscode.TextDocument, _token: vscode.CancellationToken): vscode.DocumentSymbol[] {
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

            const simbolos: vscode.DocumentSymbol[] = [];
            for (const declaracao of resultadoAvaliacao) {
                if (declaracao.constructor.name === 'BlocoDeclaracao') {
                    const bloco = declaracao as any;
                    if (bloco.seletores && bloco.seletores.length > 0) {
                        for (const seletor of bloco.seletores) {
                            const nome = typeof seletor === 'string' ? seletor : seletor.lexema || seletor.nome || String(seletor);
                            const linha = seletor.linha !== undefined ? seletor.linha : 0;
                            const range = documento.lineAt(Math.min(linha, documento.lineCount - 1)).range;
                            const selectionRange = posicaoParaTexto(documento, linha, nome);
                            simbolos.push(new vscode.DocumentSymbol(nome, '', vscode.SymbolKind.Module, range, selectionRange));
                        }
                    }
                    if (bloco.declaracoesAninhadas) {
                        for (const aninhada of bloco.declaracoesAninhadas) {
                            if (aninhada.constructor.name === 'DeclaracaoVariavel') {
                                const dv = aninhada as any;
                                if (dv.nome) {
                                    const linha = dv.linha !== undefined ? dv.linha : 0;
                                    const range = documento.lineAt(Math.min(linha, documento.lineCount - 1)).range;
                                    const selectionRange = posicaoParaTexto(documento, linha, dv.nome);
                                    simbolos.push(new vscode.DocumentSymbol(dv.nome, '', vscode.SymbolKind.Variable, range, selectionRange));
                                }
                            }
                        }
                    }
                }
                if (declaracao.constructor.name === 'DeclaracaoVariavel') {
                    const dv = declaracao as any;
                    if (dv.nome) {
                        const linha = dv.linha !== undefined ? dv.linha : 0;
                        const range = documento.lineAt(Math.min(linha, documento.lineCount - 1)).range;
                        const selectionRange = posicaoParaTexto(documento, linha, dv.nome);
                        simbolos.push(new vscode.DocumentSymbol(dv.nome, '', vscode.SymbolKind.Variable, range, selectionRange));
                    }
                }
            }

            return simbolos;
        } catch {
            return [];
        }
    }
}

function posicaoParaTexto(documento: vscode.TextDocument, linha: number, texto: string): vscode.Range {
    const linhaValida = Math.min(linha, documento.lineCount - 1);
    const textoLinha = documento.lineAt(linhaValida).text;
    const coluna = textoLinha.indexOf(texto);
    const colunaFinal = coluna >= 0 ? coluna : 0;
    return new vscode.Range(linhaValida, colunaFinal, linhaValida, colunaFinal + texto.length);
}
