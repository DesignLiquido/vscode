import * as vscode from 'vscode';
import { Declaracao } from '@designliquido/delegua/declaracoes';
import { Bloco, Classe, FuncaoDeclaracao, Var, Const, VarMultiplo, ConstMultiplo, InterfaceDeclaracao, Extensao, CabecalhoPrograma, Se, Enquanto, Para } from '@designliquido/delegua/declaracoes';
import { SimboloInterface } from '@designliquido/delegua/interfaces';

function posicaoParaNome(documento: vscode.TextDocument, simbolo: SimboloInterface): vscode.Range {
    const linha = simbolo.linha;
    const lexema = simbolo.lexema;
    if (simbolo.colunaInicio !== undefined && simbolo.colunaInicio >= 0) {
        return new vscode.Range(linha, simbolo.colunaInicio, linha, simbolo.colunaInicio + lexema.length);
    }
    const textoLinha = documento.lineAt(Math.min(linha, documento.lineCount - 1)).text;
    let coluna = textoLinha.indexOf(lexema);
    if (coluna < 0) {
        coluna = 0;
    }
    return new vscode.Range(linha, coluna, linha, coluna + lexema.length);
}

function posicaoParaNomeString(documento: vscode.TextDocument, linha: number, nome: string): vscode.Range {
    if (linha >= 0 && linha < documento.lineCount) {
        const textoLinha = documento.lineAt(linha).text;
        let coluna = textoLinha.indexOf(nome);
        if (coluna < 0) {
            coluna = 0;
        }
        return new vscode.Range(linha, coluna, linha, coluna + nome.length);
    }
    return new vscode.Range(linha, 0, linha, 0);
}

function linhaParaRange(documento: vscode.TextDocument, linha: number): vscode.Range {
    if (linha >= 0 && linha < documento.lineCount) {
        return documento.lineAt(linha).range;
    }
    const fim = documento.lineCount - 1;
    const linhaFinal = Math.max(0, Math.min(linha, fim));
    return documento.lineAt(linhaFinal).range;
}

function ultimaLinhaEmDeclaracoes(declaracoes: Declaracao[]): number {
    let ultima = -1;
    for (const d of declaracoes) {
        if (d.linha !== undefined && d.linha > ultima) {
            ultima = d.linha;
        }
        if (d instanceof Bloco && d.declaracoes) {
            const blocoLinha = ultimaLinhaEmDeclaracoes(d.declaracoes);
            if (blocoLinha > ultima) ultima = blocoLinha;
        }
        if (d instanceof Se) {
            if (d.caminhoEntao instanceof Bloco) {
                const l = ultimaLinhaEmDeclaracoes(d.caminhoEntao.declaracoes);
                if (l > ultima) ultima = l;
            } else if (d.caminhoEntao && d.caminhoEntao.linha !== undefined && d.caminhoEntao.linha > ultima) {
                ultima = d.caminhoEntao.linha;
            }
            if (d.caminhosSeSenao) {
                for (const cs of d.caminhosSeSenao) {
                    if (cs.caminho instanceof Bloco) {
                        const l = ultimaLinhaEmDeclaracoes(cs.caminho.declaracoes);
                        if (l > ultima) ultima = l;
                    } else if (cs.caminho && cs.caminho.linha !== undefined && cs.caminho.linha > ultima) {
                        ultima = cs.caminho.linha;
                    }
                }
            }
            if (d.caminhoSenao instanceof Bloco) {
                const l = ultimaLinhaEmDeclaracoes(d.caminhoSenao.declaracoes);
                if (l > ultima) ultima = l;
            } else if (d.caminhoSenao && d.caminhoSenao.linha !== undefined && d.caminhoSenao.linha > ultima) {
                ultima = d.caminhoSenao.linha;
            }
        }
        if (d instanceof Enquanto && d['declaracoes'] instanceof Bloco) {
            const l = ultimaLinhaEmDeclaracoes(d['declaracoes'].declaracoes);
            if (l > ultima) ultima = l;
        }
        if (d instanceof Para && d['corpo'] instanceof Bloco) {
            const l = ultimaLinhaEmDeclaracoes(d['corpo'].declaracoes);
            if (l > ultima) ultima = l;
        }
    }
    return ultima;
}

function calcularRangeDeclaracao(documento: vscode.TextDocument, declaracao: Declaracao): vscode.Range {
    const linhaInicio = declaracao.linha !== undefined ? declaracao.linha : 0;
    const linhaFinal = ultimaLinhaEmDeclaracoes([declaracao]);
    if (linhaFinal >= 0 && linhaFinal !== linhaInicio) {
        const linhaFimValida = Math.min(linhaFinal, documento.lineCount - 1);
        const line = documento.lineAt(linhaFimValida);
        return new vscode.Range(linhaInicio, 0, linhaFimValida, line.text.length);
    }
    return linhaParaRange(documento, linhaInicio);
}

function converterDeclaracao(documento: vscode.TextDocument, declaracao: Declaracao): vscode.DocumentSymbol | null {
    if (declaracao instanceof Classe && declaracao.simbolo) {
        const nome = declaracao.simbolo.lexema;
        const selectionRange = posicaoParaNome(documento, declaracao.simbolo);
        const range = calcularRangeDeclaracao(documento, declaracao);
        const simbolo = new vscode.DocumentSymbol(nome, '', vscode.SymbolKind.Class, range, selectionRange);
        for (const metodo of declaracao.metodos || []) {
            const child = converterDeclaracao(documento, metodo);
            if (child) simbolo.children.push(child);
        }
        for (const prop of declaracao.propriedades || []) {
            if (prop.nome) {
                const propNome = prop.nome.lexema;
                const propSelection = posicaoParaNome(documento, prop.nome);
                const propRange = linhaParaRange(documento, prop.linha !== undefined ? prop.linha : declaracao.linha);
                simbolo.children.push(new vscode.DocumentSymbol(propNome, '', vscode.SymbolKind.Property, propRange, propSelection));
            }
        }
        return simbolo;
    }

    if (declaracao instanceof FuncaoDeclaracao && declaracao.simbolo) {
        const nome = declaracao.simbolo.lexema;
        const selectionRange = posicaoParaNome(documento, declaracao.simbolo);
        const range = calcularRangeDeclaracao(documento, declaracao);
        const detalhes = declaracao.tipo ? `: ${declaracao.tipo}` : '';
        const simbolo = new vscode.DocumentSymbol(nome, detalhes, vscode.SymbolKind.Function, range, selectionRange);
        if (declaracao.funcao && declaracao.funcao.parametros) {
            for (const param of declaracao.funcao.parametros) {
                if (param.nome) {
                    const pRange = posicaoParaNome(documento, param.nome);
                    simbolo.children.push(new vscode.DocumentSymbol(param.nome.lexema, '', vscode.SymbolKind.Variable, pRange, pRange));
                }
            }
        }
        return simbolo;
    }

    if (declaracao instanceof Var && declaracao.simbolo) {
        const nome = declaracao.simbolo.lexema;
        const selectionRange = posicaoParaNome(documento, declaracao.simbolo);
        const range = linhaParaRange(documento, declaracao.linha);
        const detalhes = declaracao.tipo ? `: ${declaracao.tipo}` : '';
        return new vscode.DocumentSymbol(nome, detalhes, vscode.SymbolKind.Variable, range, selectionRange);
    }

    if (declaracao instanceof Const && declaracao.simbolo) {
        const nome = declaracao.simbolo.lexema;
        const selectionRange = posicaoParaNome(documento, declaracao.simbolo);
        const range = linhaParaRange(documento, declaracao.linha);
        const detalhes = declaracao.tipo ? `: ${declaracao.tipo}` : '';
        return new vscode.DocumentSymbol(nome, detalhes, vscode.SymbolKind.Constant, range, selectionRange);
    }

    if (declaracao instanceof VarMultiplo && declaracao.simbolos) {
        const first = declaracao.simbolos[0];
        if (first) {
            const nome = first.lexema;
            const selectionRange = posicaoParaNome(documento, first);
            const range = linhaParaRange(documento, declaracao.linha);
            const s = new vscode.DocumentSymbol(nome, '', vscode.SymbolKind.Variable, range, selectionRange);
            for (let i = 1; i < declaracao.simbolos.length; i++) {
                const sym = declaracao.simbolos[i];
                const sr = posicaoParaNome(documento, sym);
                s.children.push(new vscode.DocumentSymbol(sym.lexema, '', vscode.SymbolKind.Variable, sr, sr));
            }
            return s;
        }
    }

    if (declaracao instanceof ConstMultiplo && declaracao.simbolos) {
        const first = declaracao.simbolos[0];
        if (first) {
            const nome = first.lexema;
            const selectionRange = posicaoParaNome(documento, first);
            const range = linhaParaRange(documento, declaracao.linha);
            const s = new vscode.DocumentSymbol(nome, '', vscode.SymbolKind.Constant, range, selectionRange);
            for (let i = 1; i < declaracao.simbolos.length; i++) {
                const sym = declaracao.simbolos[i];
                const sr = posicaoParaNome(documento, sym);
                s.children.push(new vscode.DocumentSymbol(sym.lexema, '', vscode.SymbolKind.Constant, sr, sr));
            }
            return s;
        }
    }

    if (declaracao instanceof InterfaceDeclaracao && declaracao.simbolo) {
        const nome = declaracao.simbolo.lexema;
        const selectionRange = posicaoParaNome(documento, declaracao.simbolo);
        const range = calcularRangeDeclaracao(documento, declaracao);
        const simbolo = new vscode.DocumentSymbol(nome, '', vscode.SymbolKind.Interface, range, selectionRange);
        for (const prop of declaracao.propriedades || []) {
            if (prop.nome) {
                const pRange = posicaoParaNome(documento, prop.nome);
                simbolo.children.push(new vscode.DocumentSymbol(prop.nome.lexema, '', vscode.SymbolKind.Property, pRange, pRange));
            }
        }
        return simbolo;
    }

    if (declaracao instanceof Extensao && declaracao.simboloTipo) {
        const nome = declaracao.simboloTipo.lexema;
        const selectionRange = posicaoParaNome(documento, declaracao.simboloTipo);
        const range = calcularRangeDeclaracao(documento, declaracao);
        const simbolo = new vscode.DocumentSymbol(nome, '', vscode.SymbolKind.Function, range, selectionRange);
        for (const metodo of declaracao.metodos || []) {
            const child = converterDeclaracao(documento, metodo);
            if (child) simbolo.children.push(child);
        }
        return simbolo;
    }

    if (declaracao instanceof CabecalhoPrograma) {
        const nome = declaracao.nomeProgramaAlgoritmo || 'programa';
        const selectionRange = posicaoParaNomeString(documento, declaracao.linha, nome);
        const range = linhaParaRange(documento, declaracao.linha);
        return new vscode.DocumentSymbol(nome, '', vscode.SymbolKind.Module, range, selectionRange);
    }

    return null;
}

export function declaracoesParaSimbolosDocumento(documento: vscode.TextDocument, declaracoes: Declaracao[]): vscode.DocumentSymbol[] {
    const simbolos: vscode.DocumentSymbol[] = [];
    for (const declaracao of declaracoes) {
        const simbolo = converterDeclaracao(documento, declaracao);
        if (simbolo) {
            simbolos.push(simbolo);
        }
    }
    return simbolos;
}
