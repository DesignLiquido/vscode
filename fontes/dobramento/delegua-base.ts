import * as vscode from 'vscode';
import { Declaracao } from '@designliquido/delegua/declaracoes';
import { Bloco, Classe, FuncaoDeclaracao, Se, Enquanto, Para, Fazer, Tente } from '@designliquido/delegua/declaracoes';

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
        if (d instanceof Enquanto && d.corpo instanceof Bloco) {
            const l = ultimaLinhaEmDeclaracoes(d.corpo.declaracoes);
            if (l > ultima) ultima = l;
        }
        if (d instanceof Para && d.corpo instanceof Bloco) {
            const l = ultimaLinhaEmDeclaracoes(d.corpo.declaracoes);
            if (l > ultima) ultima = l;
        }
    }
    return ultima;
}

function linhaFimParaDeclaracao(declaracao: Declaracao): number | null {
    if (declaracao instanceof Bloco && declaracao.declaracoes && declaracao.declaracoes.length > 0) {
        const fim = ultimaLinhaEmDeclaracoes(declaracao.declaracoes);
        if (fim >= declaracao.linha) return fim;
    }
    if (declaracao instanceof Classe) {
        if (declaracao.metodos && declaracao.metodos.length > 0) {
            let fim = declaracao.linha;
            for (const m of declaracao.metodos) {
                if (m.linha > fim) fim = m.linha;
            }
            for (const p of declaracao.propriedades || []) {
                if (p.linha !== undefined && p.linha > fim) fim = p.linha;
            }
            return fim;
        }
        if (declaracao.propriedades && declaracao.propriedades.length > 0) {
            let fim = declaracao.linha;
            for (const p of declaracao.propriedades) {
                if (p.linha !== undefined && p.linha > fim) fim = p.linha;
            }
            return fim;
        }
    }
    if (declaracao instanceof FuncaoDeclaracao && declaracao.funcao) {
        const corpo = declaracao.funcao.corpo;
        if (corpo && corpo.length > 0) {
            const fim = ultimaLinhaEmDeclaracoes(corpo);
            if (fim >= declaracao.linha) return fim;
        }
    }
    if (declaracao instanceof Se) {
        const fim = ultimaLinhaEmDeclaracoes([declaracao]);
        if (fim >= declaracao.linha) return fim;
    }
    if (declaracao instanceof Enquanto) {
        if (declaracao.corpo instanceof Bloco && declaracao.corpo.declaracoes.length > 0) {
            const fim = ultimaLinhaEmDeclaracoes(declaracao.corpo.declaracoes);
            if (fim >= declaracao.linha) return fim;
        }
    }
    if (declaracao instanceof Para) {
        if (declaracao.corpo instanceof Bloco && declaracao.corpo.declaracoes.length > 0) {
            const fim = ultimaLinhaEmDeclaracoes(declaracao.corpo.declaracoes);
            if (fim >= declaracao.linha) return fim;
        }
    }
    if (declaracao instanceof Fazer) {
        if (declaracao.caminhoFazer instanceof Bloco && declaracao.caminhoFazer.declaracoes.length > 0) {
            const fim = ultimaLinhaEmDeclaracoes(declaracao.caminhoFazer.declaracoes);
            if (fim >= declaracao.linha) return fim;
        }
    }
    if (declaracao instanceof Tente) {
        let fim = declaracao.linha;
        for (const bloco of declaracao.caminhoTente || []) {
            if (bloco.linha > fim) fim = bloco.linha;
        }
        for (const bloco of declaracao.caminhoPegue || []) {
            const blocoAny = bloco as any;
            if (blocoAny.linha !== undefined && blocoAny.linha > fim) fim = blocoAny.linha;
            if (blocoAny.caminhoPegue) {
                const l = ultimaLinhaEmDeclaracoes(blocoAny.caminhoPegue);
                if (l > fim) fim = l;
            }
        }
        for (const bloco of declaracao.caminhoSenao || []) {
            if (bloco.linha > fim) fim = bloco.linha;
        }
        for (const bloco of declaracao.caminhoFinalmente || []) {
            if (bloco.linha > fim) fim = bloco.linha;
        }
        if (fim > declaracao.linha) return fim;
    }
    return null;
}

function extrairRanges(declaracoes: Declaracao[], _documento: vscode.TextDocument): vscode.FoldingRange[] {
    const ranges: vscode.FoldingRange[] = [];
    for (const declaracao of declaracoes) {
        if (declaracao instanceof Bloco && declaracao.declaracoes.length > 0) {
            const fim = ultimaLinhaEmDeclaracoes(declaracao.declaracoes);
            if (fim > declaracao.linha) {
                ranges.push(new vscode.FoldingRange(declaracao.linha, fim));
            }
            ranges.push(...extrairRanges(declaracao.declaracoes, _documento));
        } else if (declaracao instanceof Classe) {
            const fim = linhaFimParaDeclaracao(declaracao);
            if (fim !== null && fim > declaracao.linha) {
                ranges.push(new vscode.FoldingRange(declaracao.linha, fim));
            }
            if (declaracao.metodos) {
                for (const metodo of declaracao.metodos) {
                    const mFim = linhaFimParaDeclaracao(metodo);
                    if (mFim !== null && mFim > metodo.linha) {
                        ranges.push(new vscode.FoldingRange(metodo.linha, mFim));
                    }
                }
            }
        } else if (declaracao instanceof FuncaoDeclaracao) {
            const fim = linhaFimParaDeclaracao(declaracao);
            if (fim !== null && fim > declaracao.linha) {
                ranges.push(new vscode.FoldingRange(declaracao.linha, fim));
            }
        } else if (declaracao instanceof Se) {
            const fim = linhaFimParaDeclaracao(declaracao);
            if (fim !== null && fim > declaracao.linha) {
                ranges.push(new vscode.FoldingRange(declaracao.linha, fim));
            }
            if (declaracao.caminhoEntao instanceof Bloco) {
                ranges.push(...extrairRanges(declaracao.caminhoEntao.declaracoes, _documento));
            }
            if (declaracao.caminhosSeSenao) {
                for (const cs of declaracao.caminhosSeSenao) {
                    if (cs.caminho instanceof Bloco) {
                        ranges.push(...extrairRanges(cs.caminho.declaracoes, _documento));
                    }
                }
            }
            if (declaracao.caminhoSenao instanceof Bloco) {
                ranges.push(...extrairRanges(declaracao.caminhoSenao.declaracoes, _documento));
            }
        } else if (declaracao instanceof Enquanto && declaracao.corpo instanceof Bloco) {
            ranges.push(...extrairRanges(declaracao.corpo.declaracoes, _documento));
        } else if (declaracao instanceof Para && declaracao.corpo instanceof Bloco) {
            ranges.push(...extrairRanges(declaracao.corpo.declaracoes, _documento));
        } else if (declaracao instanceof Fazer && declaracao.caminhoFazer instanceof Bloco) {
            ranges.push(...extrairRanges(declaracao.caminhoFazer.declaracoes, _documento));
        }
    }
    return ranges;
}

export function declaracoesParaRangesDobramento(documento: vscode.TextDocument, declaracoes: Declaracao[]): vscode.FoldingRange[] {
    return extrairRanges(declaracoes, documento);
}
