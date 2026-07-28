import * as vscode from 'vscode';
import { Lexador, AvaliadorSintatico } from '@designliquido/lincones-js';

export class LinConEsProvedorSimbolosDocumento implements vscode.DocumentSymbolProvider {
    provideDocumentSymbols(documento: vscode.TextDocument, _token: vscode.CancellationToken): vscode.DocumentSymbol[] {
        try {
            const lexador = new Lexador();
            const codigo = documento.getText().split('\n');
            const resultadoLexador = lexador.mapear(codigo);
            if (!resultadoLexador || !resultadoLexador.simbolos || resultadoLexador.simbolos.length === 0) {
                return [];
            }

            const avaliador = new AvaliadorSintatico();
            const resultadoAvaliacao = avaliador.analisar(resultadoLexador);
            if (!resultadoAvaliacao || !resultadoAvaliacao.comandos || resultadoAvaliacao.comandos.length === 0) {
                return [];
            }

            const simbolos: vscode.DocumentSymbol[] = [];
            for (const comando of resultadoAvaliacao.comandos) {
                const nome = comando.constructor.name === 'Criar' ? (comando as any).nomeEntidade
                    : comando.constructor.name === 'Selecionar' ? (comando as any).tabela
                    : comando.constructor.name === 'Inserir' ? (comando as any).tabela
                    : comando.constructor.name === 'Atualizar' ? (comando as any).tabela
                    : comando.constructor.name === 'Excluir' ? (comando as any).tabela
                    : comando.constructor.name;
                if (nome) {
                    const linha = comando.linha !== undefined ? comando.linha : 0;
                    const kind = comando.constructor.name === 'Criar' ? vscode.SymbolKind.Struct : vscode.SymbolKind.Function;
                    const range = linhaParaRangeSeguro(documento, linha);
                    const selectionRange = posicaoParaTexto(documento, linha, nome);
                    simbolos.push(new vscode.DocumentSymbol(nome, comando.constructor.name, kind, range, selectionRange));
                }
            }

            return simbolos;
        } catch {
            return [];
        }
    }
}

function linhaParaRangeSeguro(documento: vscode.TextDocument, linha: number): vscode.Range {
    const linhaValida = Math.min(linha, documento.lineCount - 1);
    return documento.lineAt(linhaValida).range;
}

function posicaoParaTexto(documento: vscode.TextDocument, linha: number, texto: string): vscode.Range {
    const linhaValida = Math.min(linha, documento.lineCount - 1);
    const textoLinha = documento.lineAt(linhaValida).text;
    const coluna = textoLinha.indexOf(texto);
    const colunaFinal = coluna >= 0 ? coluna : 0;
    return new vscode.Range(linhaValida, colunaFinal, linhaValida, colunaFinal + texto.length);
}
