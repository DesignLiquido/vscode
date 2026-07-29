import * as vscode from 'vscode';
import { Declaracao } from '@designliquido/delegua/declaracoes';
import { Bloco, Classe, FuncaoDeclaracao, Var, Const, VarMultiplo, ConstMultiplo, InterfaceDeclaracao, Extensao, CabecalhoPrograma, Se, Enquanto, Para, Fazer, Tente, Escolha, ParaCada } from '@designliquido/delegua/declaracoes';
import { SimboloInterface } from '@designliquido/delegua/interfaces';

const KEYWORDS = new Set([
    'se', 'senao', 'senao se', 'enquanto', 'para', 'para cada', 'fazer',
    'tente', 'pegue', 'finalmente', 'escolha', 'caso', 'padrao',
    'funcao', 'classe', 'interface', 'extensao', 'tipo',
    'var', 'const', 'importar', 'de', 'como',
    'retorna', 'sustar', 'continua', 'falhar',
    'abstrato', 'estatico', 'publico', 'privado', 'protegido',
    'escreva', 'leia',
    'verdadeiro', 'falso', 'nulo',
    'e', 'ou', 'nao', 'ou entao', 'ou senao',
]);

const TIPOS_BUILTIN = new Set([
    'inteiro', 'texto', 'logico', 'real', 'numero', 'vazio',
    'qualquer', 'vetor', 'dicionario', 'caracter', 'simbolo',
    'longo', 'cadeia', 'objeto',
]);

const MODIFICADORES_ACESSO = new Set([
    'publico', 'privado', 'protegido',
]);

export const LEGENDA_TOKENS_SEMANTICOS = new vscode.SemanticTokensLegend(
    [
        'keyword',
        'type',
        'class',
        'interface',
        'function',
        'method',
        'variable',
        'property',
        'parameter',
        'string',
        'number',
        'comment',
        'modifier',
    ],
    [
        'declaration',
        'readonly',
        'static',
        'abstract',
        'deprecated',
    ]
);

interface TokenInfo {
    linha: number;
    colunaInicio: number;
    comprimento: number;
    tipoToken: number;
    modificadores: number;
}

function tipoTokenParaIndice(tipo: string): number {
    const idx = LEGENDA_TOKENS_SEMANTICOS.tokenTypes.indexOf(tipo);
    return idx >= 0 ? idx : 0;
}

function modificadoresParaMascara(modificadores: string[]): number {
    let mascara = 0;
    for (const mod of modificadores) {
        const idx = LEGENDA_TOKENS_SEMANTICOS.tokenModifiers.indexOf(mod);
        if (idx >= 0) {
            mascara |= (1 << idx);
        }
    }
    return mascara;
}

function tokensParaSemanticTokens(tokens: TokenInfo[]): vscode.SemanticTokens {
    if (tokens.length === 0) {
        return new vscode.SemanticTokens(new Uint32Array(0));
    }
    const data: number[] = [];
    let ultimaLinha = 0;
    let ultimaColuna = 0;
    for (const t of tokens) {
        data.push(t.linha - ultimaLinha);
        if (t.linha === ultimaLinha) {
            data.push(t.colunaInicio - ultimaColuna);
        } else {
            data.push(t.colunaInicio);
        }
        data.push(t.comprimento);
        data.push(t.tipoToken);
        data.push(t.modificadores);
        ultimaLinha = t.linha;
        ultimaColuna = t.colunaInicio;
    }
    return new vscode.SemanticTokens(new Uint32Array(data));
}

function extrairTokensDeDocumento(texto: string): TokenInfo[] {
    const tokens: TokenInfo[] = [];
    const linhas = texto.split('\n');
    for (let i = 0; i < linhas.length; i++) {
        const linha = linhas[i];
        let pos = 0;
        while (pos < linha.length) {
            if (linha[pos] === ' ' || linha[pos] === '\t' || linha[pos] === '\r') {
                pos++;
                continue;
            }
            if (linha[pos] === '/' && linha[pos + 1] === '/') {
                tokens.push({ linha: i, colunaInicio: pos, comprimento: linha.length - pos, tipoToken: tipoTokenParaIndice('comment'), modificadores: 0 });
                break;
            }
            if (linha[pos] === '/' && linha[pos + 1] === '*') {
                const inicio = pos;
                pos += 2;
                while (i < linhas.length) {
                    const idxFim = linhas[i].indexOf('*/', pos);
                    if (idxFim >= 0) {
                        if (i === inicio) {
                            tokens.push({ linha: i, colunaInicio: pos - 2, comprimento: idxFim - pos + 4, tipoToken: tipoTokenParaIndice('comment'), modificadores: 0 });
                        }
                        pos = idxFim + 2;
                        break;
                    }
                    if (i > inicio) {
                        break;
                    }
                    pos = linhas[i].length;
                    i++;
                    pos = 0;
                }
                continue;
            }
            if (linha[pos] === '"' || linha[pos] === "'") {
                const delim = linha[pos];
                const inicio = pos;
                pos++;
                while (pos < linha.length && linha[pos] !== delim) {
                    if (linha[pos] === '\\') pos++;
                    pos++;
                }
                if (pos < linha.length) pos++;
                tokens.push({ linha: i, colunaInicio: inicio, comprimento: pos - inicio, tipoToken: tipoTokenParaIndice('string'), modificadores: 0 });
                continue;
            }
            if (linha[pos] >= '0' && linha[pos] <= '9') {
                const inicio = pos;
                while (pos < linha.length && /[0-9.]/.test(linha[pos])) pos++;
                tokens.push({ linha: i, colunaInicio: inicio, comprimento: pos - inicio, tipoToken: tipoTokenParaIndice('number'), modificadores: 0 });
                continue;
            }
            if (/[a-zA-Z_\u00C0-\u0241]/.test(linha[pos])) {
                const inicio = pos;
                while (pos < linha.length && /[a-zA-Z0-9_\u00C0-\u0241]/.test(linha[pos])) pos++;
                const palavra = linha.substring(inicio, pos).toLowerCase();
                if (KEYWORDS.has(palavra)) {
                    const modificadores = MODIFICADORES_ACESSO.has(palavra) ? modificadoresParaMascara(['declaration']) : 0;
                    tokens.push({ linha: i, colunaInicio: inicio, comprimento: pos - inicio, tipoToken: tipoTokenParaIndice('keyword'), modificadores });
                } else if (TIPOS_BUILTIN.has(palavra)) {
                    tokens.push({ linha: i, colunaInicio: inicio, comprimento: pos - inicio, tipoToken: tipoTokenParaIndice('type'), modificadores: 0 });
                }
                continue;
            }
            pos++;
        }
    }
    return tokens;
}

function adicionarTokenSemantico(tokens: TokenInfo[], linha: number, coluna: number, comprimento: number, tipo: string, modificadores: string[] = []): void {
    if (comprimento <= 0) return;
    tokens.push({
        linha,
        colunaInicio: coluna,
        comprimento,
        tipoToken: tipoTokenParaIndice(tipo),
        modificadores: modificadoresParaMascara(modificadores),
    });
}

function extrairNomeColuna(simbolo: SimboloInterface): { linha: number; coluna: number; nome: string } {
    return {
        linha: simbolo.linha,
        coluna: simbolo.colunaInicio !== undefined && simbolo.colunaInicio >= 0 ? simbolo.colunaInicio : 0,
        nome: simbolo.lexema,
    };
}

function processarDeclaracaoSemantica(tokens: TokenInfo[], declaracao: Declaracao): void {
    if (declaracao instanceof Classe && declaracao.simbolo) {
        const { linha, coluna, nome } = extrairNomeColuna(declaracao.simbolo);
        adicionarTokenSemantico(tokens, linha, coluna, nome.length, 'class', ['declaration']);
        for (const metodo of declaracao.metodos || []) {
            processarDeclaracaoSemantica(tokens, metodo);
        }
        for (const prop of declaracao.propriedades || []) {
            if (prop.nome) {
                const { linha: pl, coluna: pc } = extrairNomeColuna(prop.nome);
                adicionarTokenSemantico(tokens, pl, pc, prop.nome.lexema.length, 'property', ['declaration']);
            }
        }
        return;
    }

    if (declaracao instanceof FuncaoDeclaracao && declaracao.simbolo) {
        const { linha, coluna, nome } = extrairNomeColuna(declaracao.simbolo);
        const dentroClasse = declaracao.acesso === 'privado' || declaracao.acesso === 'protegido' || declaracao.acesso === 'publico';
        adicionarTokenSemantico(tokens, linha, coluna, nome.length, dentroClasse ? 'method' : 'function', ['declaration']);
        if (declaracao.funcao && declaracao.funcao.parametros) {
            for (const param of declaracao.funcao.parametros) {
                if (param.nome) {
                    const { linha: pl, coluna: pc } = extrairNomeColuna(param.nome);
                    adicionarTokenSemantico(tokens, pl, pc, param.nome.lexema.length, 'parameter', ['declaration']);
                }
            }
        }
        return;
    }

    if (declaracao instanceof Var && declaracao.simbolo) {
        const { linha, coluna, nome } = extrairNomeColuna(declaracao.simbolo);
        const modificadores: string[] = ['declaration'];
        if (declaracao.referencia) modificadores.push('readonly');
        adicionarTokenSemantico(tokens, linha, coluna, nome.length, 'variable', modificadores);
        return;
    }

    if (declaracao instanceof Const && declaracao.simbolo) {
        const { linha, coluna, nome } = extrairNomeColuna(declaracao.simbolo);
        adicionarTokenSemantico(tokens, linha, coluna, nome.length, 'variable', ['declaration', 'readonly']);
        return;
    }

    if (declaracao instanceof VarMultiplo && declaracao.simbolos) {
        for (const simb of declaracao.simbolos) {
            const { linha, coluna, nome } = extrairNomeColuna(simb);
            adicionarTokenSemantico(tokens, linha, coluna, nome.length, 'variable', ['declaration']);
        }
        return;
    }

    if (declaracao instanceof ConstMultiplo && declaracao.simbolos) {
        for (const simb of declaracao.simbolos) {
            const { linha, coluna, nome } = extrairNomeColuna(simb);
            adicionarTokenSemantico(tokens, linha, coluna, nome.length, 'variable', ['declaration', 'readonly']);
        }
        return;
    }

    if (declaracao instanceof InterfaceDeclaracao && declaracao.simbolo) {
        const { linha, coluna, nome } = extrairNomeColuna(declaracao.simbolo);
        adicionarTokenSemantico(tokens, linha, coluna, nome.length, 'interface', ['declaration']);
        for (const prop of declaracao.propriedades || []) {
            if (prop.nome) {
                const { linha: pl, coluna: pc } = extrairNomeColuna(prop.nome);
                adicionarTokenSemantico(tokens, pl, pc, prop.nome.lexema.length, 'property', ['declaration']);
            }
        }
        return;
    }

    if (declaracao instanceof Extensao && declaracao.simboloTipo) {
        const { linha, coluna, nome } = extrairNomeColuna(declaracao.simboloTipo);
        adicionarTokenSemantico(tokens, linha, coluna, nome.length, 'class', ['declaration']);
        for (const metodo of declaracao.metodos || []) {
            processarDeclaracaoSemantica(tokens, metodo);
        }
        return;
    }

    if (declaracao instanceof CabecalhoPrograma) {
        const nome = declaracao.nomeProgramaAlgoritmo || 'programa';
        adicionarTokenSemantico(tokens, declaracao.linha, 0, nome.length, 'function', ['declaration']);
        return;
    }
}

function percorrerDeclaracoes(tokens: TokenInfo[], declaracoes: Declaracao[]): void {
    for (const declaracao of declaracoes) {
        processarDeclaracaoSemantica(tokens, declaracao);
        if (declaracao instanceof Bloco && declaracao.declaracoes) {
            percorrerDeclaracoes(tokens, declaracao.declaracoes);
        }
        if (declaracao instanceof Se) {
            if (declaracao.caminhoEntao instanceof Bloco) {
                percorrerDeclaracoes(tokens, declaracao.caminhoEntao.declaracoes);
            }
            if (declaracao.caminhosSeSenao) {
                for (const cs of declaracao.caminhosSeSenao) {
                    if (cs.caminho instanceof Bloco) {
                        percorrerDeclaracoes(tokens, cs.caminho.declaracoes);
                    }
                }
            }
            if (declaracao.caminhoSenao instanceof Bloco) {
                percorrerDeclaracoes(tokens, declaracao.caminhoSenao.declaracoes);
            }
        }
        if (declaracao instanceof Enquanto && declaracao.corpo instanceof Bloco) {
            percorrerDeclaracoes(tokens, declaracao.corpo.declaracoes);
        }
        if (declaracao instanceof Para && declaracao.corpo instanceof Bloco) {
            percorrerDeclaracoes(tokens, declaracao.corpo.declaracoes);
        }
        if (declaracao instanceof ParaCada && declaracao.corpo instanceof Bloco) {
            percorrerDeclaracoes(tokens, declaracao.corpo.declaracoes);
        }
        if (declaracao instanceof Fazer && declaracao.caminhoFazer instanceof Bloco) {
            percorrerDeclaracoes(tokens, declaracao.caminhoFazer.declaracoes);
        }
        if (declaracao instanceof Tente) {
            for (const bloco of declaracao.caminhoTente || []) {
                if (bloco instanceof Bloco) percorrerDeclaracoes(tokens, bloco.declaracoes);
            }
            for (const bloco of declaracao.caminhoPegue || []) {
                if (bloco.corpo) percorrerDeclaracoes(tokens, bloco.corpo);
            }
            for (const bloco of declaracao.caminhoSenao || []) {
                if (bloco instanceof Bloco) percorrerDeclaracoes(tokens, bloco.declaracoes);
            }
            for (const bloco of declaracao.caminhoFinalmente || []) {
                if (bloco instanceof Bloco) percorrerDeclaracoes(tokens, bloco.declaracoes);
            }
        }
        if (declaracao instanceof Escolha && declaracao.caminhos) {
            for (const caminho of declaracao.caminhos) {
                percorrerDeclaracoes(tokens, caminho.declaracoes);
            }
            if (declaracao.caminhoPadrao) {
                percorrerDeclaracoes(tokens, declaracao.caminhoPadrao.declaracoes);
            }
        }
    }
}

export { extrairTokensDeDocumento, tokensParaSemanticTokens };

export function declaracoesParaTokensSemanticos(documento: vscode.TextDocument, declaracoes: Declaracao[]): vscode.SemanticTokens {
    const tokens = extrairTokensDeDocumento(documento.getText());
    percorrerDeclaracoes(tokens, declaracoes);
    return tokensParaSemanticTokens(tokens);
}
