import * as vscode from 'vscode';
import { Declaracao } from '@designliquido/delegua/declaracoes';
import { Classe, FuncaoDeclaracao, Var, Const, VarMultiplo, ConstMultiplo, InterfaceDeclaracao, Extensao, CabecalhoPrograma, Bloco, Se, Enquanto, Para, Fazer, ParaCada } from '@designliquido/delegua/declaracoes';

interface ExtracaoNome {
    nome: string;
    linha: number;
    tipo: vscode.SymbolKind;
    containerNome?: string;
}

function extrairNomesDeclaracao(declaracao: Declaracao, containerNome?: string): ExtracaoNome[] {
    const resultados: ExtracaoNome[] = [];

    if (declaracao instanceof Classe && declaracao.simbolo) {
        resultados.push({ nome: declaracao.simbolo.lexema, linha: declaracao.linha, tipo: vscode.SymbolKind.Class });
        for (const metodo of declaracao.metodos || []) {
            resultados.push(...extrairNomesDeclaracao(metodo, declaracao.simbolo.lexema));
        }
        for (const prop of declaracao.propriedades || []) {
            if (prop.nome) {
                resultados.push({ nome: prop.nome.lexema, linha: prop.linha !== undefined ? prop.linha : declaracao.linha, tipo: vscode.SymbolKind.Property, containerNome: declaracao.simbolo.lexema });
            }
        }
        return resultados;
    }

    if (declaracao instanceof FuncaoDeclaracao && declaracao.simbolo) {
        resultados.push({ nome: declaracao.simbolo.lexema, linha: declaracao.linha, tipo: vscode.SymbolKind.Function, containerNome });
        if (declaracao.funcao && declaracao.funcao.parametros) {
            for (const param of declaracao.funcao.parametros) {
                if (param.nome) {
                    resultados.push({ nome: param.nome.lexema, linha: param.nome.linha, tipo: vscode.SymbolKind.Variable, containerNome: declaracao.simbolo.lexema });
                }
            }
        }
        return resultados;
    }

    if (declaracao instanceof Var && declaracao.simbolo) {
        resultados.push({ nome: declaracao.simbolo.lexema, linha: declaracao.linha, tipo: vscode.SymbolKind.Variable, containerNome });
        return resultados;
    }

    if (declaracao instanceof Const && declaracao.simbolo) {
        resultados.push({ nome: declaracao.simbolo.lexema, linha: declaracao.linha, tipo: vscode.SymbolKind.Constant, containerNome });
        return resultados;
    }

    if (declaracao instanceof VarMultiplo && declaracao.simbolos) {
        for (const simb of declaracao.simbolos) {
            resultados.push({ nome: simb.lexema, linha: simb.linha, tipo: vscode.SymbolKind.Variable, containerNome });
        }
        return resultados;
    }

    if (declaracao instanceof ConstMultiplo && declaracao.simbolos) {
        for (const simb of declaracao.simbolos) {
            resultados.push({ nome: simb.lexema, linha: simb.linha, tipo: vscode.SymbolKind.Constant, containerNome });
        }
        return resultados;
    }

    if (declaracao instanceof InterfaceDeclaracao && declaracao.simbolo) {
        resultados.push({ nome: declaracao.simbolo.lexema, linha: declaracao.linha, tipo: vscode.SymbolKind.Interface });
        for (const prop of declaracao.propriedades || []) {
            if (prop.nome) {
                resultados.push({ nome: prop.nome.lexema, linha: prop.linha !== undefined ? prop.linha : declaracao.linha, tipo: vscode.SymbolKind.Property, containerNome: declaracao.simbolo.lexema });
            }
        }
        return resultados;
    }

    if (declaracao instanceof Extensao && declaracao.simboloTipo) {
        resultados.push({ nome: declaracao.simboloTipo.lexema, linha: declaracao.linha, tipo: vscode.SymbolKind.Function, containerNome });
        for (const metodo of declaracao.metodos || []) {
            resultados.push(...extrairNomesDeclaracao(metodo, declaracao.simboloTipo.lexema));
        }
        return resultados;
    }

    if (declaracao instanceof CabecalhoPrograma) {
        resultados.push({ nome: declaracao.nomeProgramaAlgoritmo || 'programa', linha: declaracao.linha, tipo: vscode.SymbolKind.Module, containerNome });
        return resultados;
    }

    if (declaracao instanceof Bloco && declaracao.declaracoes) {
        for (const d of declaracao.declaracoes) {
            resultados.push(...extrairNomesDeclaracao(d, containerNome));
        }
        return resultados;
    }

    if (declaracao instanceof Se) {
        if (declaracao.caminhoEntao instanceof Bloco) {
            resultados.push(...extrairNomesDeclaracao(declaracao.caminhoEntao, containerNome));
        }
        if (declaracao.caminhosSeSenao) {
            for (const cs of declaracao.caminhosSeSenao) {
                if (cs.caminho instanceof Bloco) {
                    resultados.push(...extrairNomesDeclaracao(cs.caminho, containerNome));
                }
            }
        }
        if (declaracao.caminhoSenao instanceof Bloco) {
            resultados.push(...extrairNomesDeclaracao(declaracao.caminhoSenao, containerNome));
        }
        return resultados;
    }

    if (declaracao instanceof Enquanto && declaracao.corpo instanceof Bloco) {
        resultados.push(...extrairNomesDeclaracao(declaracao.corpo, containerNome));
        return resultados;
    }

    if (declaracao instanceof Para && declaracao.corpo instanceof Bloco) {
        resultados.push(...extrairNomesDeclaracao(declaracao.corpo, containerNome));
        return resultados;
    }

    if (declaracao instanceof ParaCada && declaracao.corpo instanceof Bloco) {
        resultados.push(...extrairNomesDeclaracao(declaracao.corpo, containerNome));
        return resultados;
    }

    if (declaracao instanceof Fazer && declaracao.caminhoFazer instanceof Bloco) {
        resultados.push(...extrairNomesDeclaracao(declaracao.caminhoFazer, containerNome));
        return resultados;
    }

    return resultados;
}

async function analisarDocumento(documento: vscode.TextDocument): Promise<ExtracaoNome[]> {
    try {
        const texto = documento.getText();
        const linhas = texto.split('\n');

        let lexador: any;
        let avaliador: any;

        switch (documento.languageId) {
            case 'delegua':
            case 'delegua-testes': {
                const { Lexador } = await import('@designliquido/delegua/lexador');
                const { AvaliadorSintaticoComImportacao } = await import('../avaliacao-sintatica/avaliador-sintatico-com-importacao');
                lexador = new Lexador();
                avaliador = new AvaliadorSintaticoComImportacao(null as any);
                break;
            }
            case 'pitugues': {
                const { LexadorPitugues } = await import('@designliquido/delegua/lexador');
                const { AvaliadorSintaticoPitugues } = await import('@designliquido/delegua/avaliador-sintatico');
                lexador = new LexadorPitugues();
                avaliador = new AvaliadorSintaticoPitugues();
                break;
            }
            case 'visualg': {
                const { LexadorVisuAlg } = await import('@designliquido/visualg/lexador');
                const { AvaliadorSintaticoVisuAlg } = await import('@designliquido/visualg/avaliador-sintatico');
                lexador = new LexadorVisuAlg();
                avaliador = new AvaliadorSintaticoVisuAlg();
                break;
            }
            case 'mapler': {
                const { LexadorMapler, AvaliadorSintaticoMapler } = await import('@designliquido/mapler');
                lexador = new LexadorMapler();
                avaliador = new AvaliadorSintaticoMapler();
                break;
            }
            case 'potigol': {
                const { LexadorPotigol } = await import('@designliquido/potigol/lexador');
                const { AvaliadorSintaticoPotigol } = await import('@designliquido/potigol/avaliador-sintatico');
                lexador = new LexadorPotigol();
                avaliador = new AvaliadorSintaticoPotigol();
                break;
            }
            case 'portugolstudio': {
                const { LexadorPortugolStudio, AvaliadorSintaticoPortugolStudio } = await import('@designliquido/portugol-studio');
                lexador = new LexadorPortugolStudio();
                avaliador = new AvaliadorSintaticoPortugolStudio();
                break;
            }
            case 'birl': {
                const { LexadorBirl } = await import('@designliquido/birl/lexador');
                const { AvaliadorSintaticoBirl } = await import('@designliquido/birl/avaliador-sintatico');
                lexador = new LexadorBirl();
                avaliador = new AvaliadorSintaticoBirl();
                break;
            }
            case 'egua': {
                const { LexadorEguaClassico } = await import('@designliquido/delegua/lexador');
                const { AvaliadorSintaticoEguaClassico } = await import('@designliquido/delegua/avaliador-sintatico');
                lexador = new LexadorEguaClassico();
                avaliador = new AvaliadorSintaticoEguaClassico();
                break;
            }
            default:
                return [];
        }

        const resultadoLexador = lexador.mapear(linhas, -1);
        if (!resultadoLexador || !resultadoLexador.simbolos || resultadoLexador.simbolos.length === 0) {
            return [];
        }

        const resultadoAvaliacao = await avaliador.analisar(resultadoLexador, -1);
        if (!resultadoAvaliacao || !resultadoAvaliacao.declaracoes) {
            return [];
        }

        const resultados: ExtracaoNome[] = [];
        for (const declaracao of resultadoAvaliacao.declaracoes) {
            resultados.push(...extrairNomesDeclaracao(declaracao));
        }
        return resultados;
    } catch {
        return [];
    }
}

export class DeleguaProvedorSimbolosTrabalho implements vscode.WorkspaceSymbolProvider {
    async provideWorkspaceSymbols(consulta: string, _token: vscode.CancellationToken): Promise<vscode.SymbolInformation[]> {
        const query = consulta.toLowerCase();
        const linguagens = new Set([
            'delegua', 'delegua-testes', 'pitugues', 'visualg', 'mapler',
            'potigol', 'portugolstudio', 'birl', 'egua',
        ]);

        const simbolos: vscode.SymbolInformation[] = [];

        for (const documento of vscode.workspace.textDocuments) {
            if (!linguagens.has(documento.languageId)) continue;

            const nomes = await analisarDocumento(documento);
            for (const info of nomes) {
                if (info.nome.toLowerCase().includes(query)) {
                    const uri = documento.uri;
                    const linhaValida = Math.min(info.linha, documento.lineCount - 1);
                    const posicao = new vscode.Position(linhaValida, 0);
                    const simbolo = new vscode.SymbolInformation(
                        info.nome,
                        info.tipo,
                        info.containerNome || '',
                        new vscode.Location(uri, posicao)
                    );
                    simbolos.push(simbolo);
                }
            }
        }

        return simbolos;
    }
}
