import * as vscode from 'vscode';
import { primitivasMetodosLiquido, objetosEmRotaLiquido } from '../bibliotecas/primitivas-liquido';

import { obterResultado } from '@designliquido/delegua-lsp/analise/cache-analise';
import { ParametroDetectado, TipoParametro } from '../interfaces/completude';

import { Classe, FuncaoDeclaracao } from '@designliquido/delegua/declaracoes';
import {
    primitivasDicionarioFormatadas,
    primitivasNumeroFormatadas,
    primitivasTextoFormatadas,
    primitivasVetorFormatadas,
    funcoesNativasPitugues,
} from '../bibliotecas/dialetos/pitugues';

/**
 * Classe de provedor de completude de Pituguês.
 * Gera todos os elementos de sugestão de código enquanto o/a
 * desenvolvedor/a edita código em Pituguês, pressionando caracteres como
 * ponto e/ou Ctrl + espaço.
 */
export class PituguesProvedorCompletude implements vscode.CompletionItemProvider {

    // Definições de tipos de Líquido e seus parâmetros.
    private readonly tiposParametrosLiquido: TipoParametro[] = [
        
    ];

    provideCompletionItems(documento: vscode.TextDocument, posicao: vscode.Position, token: vscode.CancellationToken, context: vscode.CompletionContext): vscode.ProviderResult<vscode.CompletionList<vscode.CompletionItem> | vscode.CompletionItem[]> {
        const resultadoAnalise = obterResultado(documento.uri.toString());
        const linhaTexto = documento.lineAt(posicao).text;
        const textoAntesPosicao = linhaTexto.substring(0, posicao.character);

        const detalhesEscopo = this.obterDetalhesEscopo(documento, posicao);
        const parametrosDetectados = this.detectarParametrosDaFuncao(documento, posicao);

        const caminhoCompleto = this.analisarCadeiaChamadasEmCodigo(textoAntesPosicao);

        if (caminhoCompleto.length > 0) {
            const completudes = this.obterCompletudesParaCaminho(caminhoCompleto, parametrosDetectados, detalhesEscopo);
            if (completudes && completudes.length > 0) {
                return completudes;
            }
        }

        const declaracoesPertinentes = resultadoAnalise?.avaliadorSintatico.declaracoes.flatMap(declaracao => {
            if (declaracao instanceof Classe) {
                return [{ nome: declaracao.simbolo.lexema, tipo: declaracao.simbolo.lexema }];
            }

            if (declaracao instanceof FuncaoDeclaracao) {
                return [{ nome: declaracao.simbolo.lexema, tipo: declaracao.tipo }];
            }

            return [];
        }) || [];

        const completudesDeVariaveisEConstantes = declaracoesPertinentes.map(v => {
            let itemCompletude = new vscode.CompletionItem(v.nome, vscode.CompletionItemKind.Variable);
            itemCompletude.detail = `(${v.tipo}) ${v.nome}`;
            return itemCompletude;
        });

        const palavraAntesPonto = this.obterPalavraAntesPonto(textoAntesPosicao);
        const declaracaoCorrespondente = declaracoesPertinentes.find(v => v.nome === palavraAntesPonto);

        // Propriedades com um parâmetro com tipo definido.
        const tipoParametro = this.obterTipoParametroComDeteccao(palavraAntesPonto, parametrosDetectados);
        if (tipoParametro && this.estaNoContextoCorreto(detalhesEscopo, palavraAntesPonto)) {
            return this.criarCompletudesCompletas(tipoParametro);
        }

        switch (detalhesEscopo.tipoEscopo) {
            case 'rotaGet':
            case 'rotaPost':
                // Objetos válidos apenas dentro de um escopo de rota de Líquido.
                return objetosEmRotaLiquido.map(objeto => {
                    let itemCompletude = new vscode.CompletionItem(objeto.nome, vscode.CompletionItemKind.Function);
                    itemCompletude.documentation = new vscode.MarkdownString(objeto.documentacao);
                    return itemCompletude;
                });
            default:
                // Primitivas de Líquido
                if (palavraAntesPonto === 'liquido') {
                    return primitivasMetodosLiquido.map(funcaoNativa => {
                        let itemCompletude = new vscode.CompletionItem(funcaoNativa.nome, vscode.CompletionItemKind.Function);
                        itemCompletude.insertText = new vscode.SnippetString(`${funcaoNativa.nome}(requisicao, resposta) {\n\t$0\n}`);
                        itemCompletude.documentation = new vscode.MarkdownString(funcaoNativa.documentacao);
                        return itemCompletude;
                    });
                }

                return completudesDeVariaveisEConstantes.concat(
                    this.completudesParaPitugues(textoAntesPosicao, palavraAntesPonto, parametrosDetectados, declaracaoCorrespondente)
                );
        }
    }

    /**
     * Encontra padrões como: objeto.propriedade.metodo().propriedade.
     * @param {string} texto A porção do código antes do cursor, para análise de cadeia de chamadas.
     * @returns
     */
    private analisarCadeiaChamadasEmCodigo(texto: string): string[] {
        const regex = /(\w+)(?:\.(\w+)(?:\([^)]*\))?)*\.$/;
        const match = texto.match(regex);

        if (!match) {
            return [];
        }

        // Extrai todas as partes da cadeia de chamadas
        const partes = texto.split('.');
        const caminho: string[] = [];

        for (let i = 0; i < partes.length - 1; i++) {
            const parte = partes[i];
            // Remove parênteses para melhor análise
            const nomeSemParenteses = parte.replace(/\([^)]*\)$/, '');
            if (nomeSemParenteses.trim()) {
                caminho.push(nomeSemParenteses.trim());
            }
        }

        return caminho;
    }

    private criarCompletudesCompletas(tipoParametro: TipoParametro): vscode.CompletionItem[] {
        const completudes: vscode.CompletionItem[] = [];

        // Completudes de propriedades
        if (tipoParametro.propriedades) {
            completudes.push(...tipoParametro.propriedades.map(propriedade => {
                const itemCompletude = new vscode.CompletionItem(
                    propriedade.nome,
                    propriedade.tipoCompletude || vscode.CompletionItemKind.Property
                );

                itemCompletude.documentation = new vscode.MarkdownString(propriedade.documentacao);
                itemCompletude.detail = `(${propriedade.tipo}) ${propriedade.nome}`;

                // Indicação para propriedades aninhadas
                if (propriedade.propriedadesAninhadas && propriedade.propriedadesAninhadas.length > 0) {
                    itemCompletude.detail += ` - ${propriedade.propriedadesAninhadas.length} propriedades aninhadas`;
                }

                return itemCompletude;
            }));
        }

        // Completudes de métodos
        if (tipoParametro.metodos) {
            completudes.push(...tipoParametro.metodos.map(metodo => {
                const itemCompletude = new vscode.CompletionItem(
                    metodo.nome,
                    vscode.CompletionItemKind.Method
                );

                itemCompletude.documentation = new vscode.MarkdownString(metodo.documentacao);
                itemCompletude.detail = `${metodo.nome}(${metodo.parametros.join(', ')})`;

                if (metodo.tipoRetorno) {
                    itemCompletude.detail += ` → ${metodo.tipoRetorno}`;
                }

                if (metodo.permiteEncadeamento) {
                    itemCompletude.detail += ' (encadeável)';
                }

                if (metodo.snippet) {
                    itemCompletude.insertText = new vscode.SnippetString(metodo.snippet);
                } else {
                    itemCompletude.insertText = new vscode.SnippetString(`${metodo.nome}($0)`);
                }

                return itemCompletude;
            }));
        }

        return completudes;
    }

    private estaNoContextoCorreto(detalhesEscopo: any, nomeParametro: string | null): boolean {
        if (!nomeParametro) {
            return false;
        }

        const escoposValidos = ['rotaGet', 'rotaPost'];
        return escoposValidos.includes(detalhesEscopo.tipoEscopo);
    }

    private obterPalavraAntesPonto(texto: string): string | null {
        const match = texto.match(/(\w+)\./);
        return match ? match[1] : null;
    }

    private obterCompletudesParaCaminho(caminho: string[], parametrosDetectados: ParametroDetectado[], detalhesEscopo: any): vscode.CompletionItem[] | null {
        if (caminho.length === 0) {
            return null;
        }

        const objetoBase = caminho[0];
        let tipoAtual = this.obterTipoParametroComDeteccao(objetoBase, parametrosDetectados);

        if (!tipoAtual) {
            return null;
        }

        for (let i = 1; i < caminho.length; i++) {
            const propriedadeNome = caminho[i];

            // Verifica se é um método ou propriedade que trabalha com encadeamento.
            const metodo = tipoAtual.metodos?.find(m => m.nome === propriedadeNome);
            if (metodo && metodo.permiteEncadeamento && metodo.tipoRetorno) {
                // Continue com o tipo de retorno
                tipoAtual = this.tiposParametrosLiquido.find(t => t.nome === metodo.tipoRetorno) || tipoAtual;
                continue;
            }

            // Verifica se é uma propriedade aninhada.
            const propriedade = tipoAtual.propriedades?.find(p => p.nome === propriedadeNome);
            if (propriedade && propriedade.propriedadesAninhadas) {
                // Cria um tipo temporário para propriedades aninhadas.
                tipoAtual = {
                    nome: `${tipoAtual.nome}.${propriedadeNome}`,
                    propriedades: propriedade.propriedadesAninhadas
                };
                continue;
            }

            // Se não pode continuar o encadeamento, retorna nulo.
            return null;
        }

        return this.criarCompletudesCompletas(tipoAtual);
    }

    private obterDetalhesEscopo(documento: vscode.TextDocument, posicao: vscode.Position): {
        dentroDoEscopo: boolean;
        nivelAninhamento: number;
        tipoEscopo: string;
        escopos: string[];
    } {
        let contadorChaves = 0;
        const pilhaEscopos: string[] = [];
        const palavrasChaveEscopo = [
            'rotaGet', 'rotaPost'
        ];

        for (let linha = 0; linha <= posicao.line; linha++) {
            const textoLinha = documento.lineAt(linha).text;
            const fimLinha = linha === posicao.line ? posicao.character : textoLinha.length;

            // Procurar por certos escopos de Líquido
            palavrasChaveEscopo.forEach(palavra => {
                const regex = new RegExp(`\\bliquido\.${palavra}\\b`, 'gi');
                let correspondencia;
                while ((correspondencia = regex.exec(textoLinha)) !== null && correspondencia.index < fimLinha) {
                    const restoLinha = textoLinha.substring(correspondencia.index + palavra.length);
                    if (restoLinha.includes('{')) {
                        pilhaEscopos.push(palavra);
                    }
                }
            });

            // Contar abertura e fechamento de escopos
            for (let coluna = 0; coluna < fimLinha; coluna++) {
                const char = textoLinha[coluna];
                if (char === '{') {
                    contadorChaves++;
                } else if (char === '}') {
                    contadorChaves--;
                    if (pilhaEscopos.length > 0) {
                        pilhaEscopos.pop();
                    }
                }
            }
        }

        return {
            dentroDoEscopo: contadorChaves > 0,
            nivelAninhamento: contadorChaves,
            tipoEscopo: pilhaEscopos.length > 0 ? pilhaEscopos[pilhaEscopos.length - 1] : 'global',
            escopos: [...pilhaEscopos]
        };
    }

    private obterTipoParametro(nomeParametro: string | null): TipoParametro | null {
        if (!nomeParametro) {
            return null;
        }

        return this.tiposParametrosLiquido.find(tipo => tipo.nome === nomeParametro) || null;
    }

    private obterTipoParametroComDeteccao(nomeParametro: string | null, parametrosDetectados: ParametroDetectado[]): TipoParametro | null {
        if (!nomeParametro) {
            return null;
        }

        // Primeiro tenta correspondência direta.
        const tiposDireto = this.obterTipoParametro(nomeParametro);
        if (tiposDireto) {
            return tiposDireto;
        }

        // Então, tenta correspondência por casamento de parâmetros.
        const parametroDetectado = parametrosDetectados.find(p => p.nome === nomeParametro);
        if (parametroDetectado) {
            return this.obterTipoParametro(parametroDetectado.tipoOriginal);
        }

        return null;
    }

    private detectarParametrosDaFuncao(documento: vscode.TextDocument, posicao: vscode.Position): ParametroDetectado[] {
        const parametrosDetectados: ParametroDetectado[] = [];

        // Olha em retrospecto por definições de funções, limitado a 50 ocorrências
        const linhaInicio = Math.max(0, posicao.line - 50);

        for (let linha = posicao.line; linha >= linhaInicio; linha--) {
            const textoLinha = documento.lineAt(linha).text;

            // Procura por padrões como: liquido.rotaGet(function(req, res) {
            const correspondenciasFuncoes = textoLinha.match(/liquido\.(rotaGet|rotaPost|rotaPut|rotaDelete)\s*\(\s*funcao\s*\(\s*(\w+)\s*,\s*(\w+)\s*\)/);
            if (correspondenciasFuncoes) {
                parametrosDetectados.push(
                    { nome: correspondenciasFuncoes[2], tipoOriginal: 'requisicao', linha },
                    { nome: correspondenciasFuncoes[3], tipoOriginal: 'resposta', linha }
                );
                break;
            }

            // Futuro: procura por _middlewares_.
            /* const matchMiddleware = textoLinha.match(/liquido\.(rotaGet|rotaPost|rotaPut|rotaDelete)\s*\([^,]+,\s*\w+\s*,\s*\(\s*(\w+)\s*,\s*(\w+)\s*,\s*(\w+)\s*\)/);
            if (matchMiddleware) {
                parametrosDetectados.push(
                    { nome: matchMiddleware[2], tipoOriginal: 'requisicao', linha },
                    { nome: matchMiddleware[3], tipoOriginal: 'resposta', linha },
                    { nome: matchMiddleware[4], tipoOriginal: 'proximo', linha }
                );
                break;
            } */
        }

        return parametrosDetectados;
    }

    protected completudesParaPitugues(
        textoAntesPosicao: string,
        palavraAntesPonto: string | null,
        parametrosDetectados: ParametroDetectado[],
        declaracaoCorrespondente: { nome: string; tipo: string; } | undefined
    ): vscode.CompletionItem[] {
        if (textoAntesPosicao.endsWith('.')) {
            const tipoDetectadoLiquido = this.obterTipoParametroComDeteccao(palavraAntesPonto, parametrosDetectados);
            if (tipoDetectadoLiquido) {
                const tipoLiquido = this.tiposParametrosLiquido.find(tp => tp.nome === tipoDetectadoLiquido.nome);
                if (tipoLiquido) {
                    return this.criarCompletudesCompletas(tipoLiquido);
                }
            }

            if (declaracaoCorrespondente) {
                switch (declaracaoCorrespondente.tipo) {
                    case 'dicionario':
                    case 'dicionário':
                        return primitivasDicionarioFormatadas.map(funcaoNativa => {
                            let itemCompletude = new vscode.CompletionItem(funcaoNativa.nome, vscode.CompletionItemKind.Function);
                            itemCompletude.documentation = new vscode.MarkdownString(funcaoNativa.documentacao);
                            return itemCompletude;
                        });
                    case 'numero':
                    case 'número':
                        return primitivasNumeroFormatadas.map(funcaoNativa => {
                            let itemCompletude = new vscode.CompletionItem(funcaoNativa.nome, vscode.CompletionItemKind.Function);
                            itemCompletude.documentation = new vscode.MarkdownString(funcaoNativa.documentacao);
                            return itemCompletude;
                        });
                    case 'texto':
                        return primitivasTextoFormatadas.map(funcaoNativa => {
                            let itemCompletude = new vscode.CompletionItem(funcaoNativa.nome, vscode.CompletionItemKind.Function);
                            itemCompletude.documentation = new vscode.MarkdownString(funcaoNativa.documentacao);
                            return itemCompletude;
                        });
                    case 'vetor':
                    case 'dicionario[]':
                    case 'dicionário[]':
                    case 'numero[]':
                    case 'número[]':
                    case 'logico[]':
                    case 'lógico[]':
                    case 'qualquer[]':
                    case 'texto[]':
                        return primitivasVetorFormatadas.map(funcaoNativa => {
                            let itemCompletude = new vscode.CompletionItem(funcaoNativa.nome, vscode.CompletionItemKind.Function);
                            itemCompletude.documentation = new vscode.MarkdownString(funcaoNativa.documentacao);
                            return itemCompletude;
                        });
                    default:
                        break;
                }
            }
        }

        return funcoesNativasPitugues.map(funcaoNativa => {
            let itemCompletude = new vscode.CompletionItem(funcaoNativa.nome, vscode.CompletionItemKind.Function);
            itemCompletude.documentation = new vscode.MarkdownString(funcaoNativa.documentacao);
            return itemCompletude;
        });
    }
}
