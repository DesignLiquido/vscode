import * as vscode from 'vscode';

import { Classe, Const, FuncaoDeclaracao, Var } from '@designliquido/delegua/declaracoes';

import { primitivasMetodosLiquido, objetosEmRotaLiquido } from '../bibliotecas/primitivas-liquido';
import primitivasDicionario from '@designliquido/delegua/bibliotecas/primitivas-dicionario';
import primitivasNumero from '@designliquido/delegua/bibliotecas/primitivas-numero';
import primitivasTexto from '@designliquido/delegua/bibliotecas/primitivas-texto';
import primitivasVetor from '@designliquido/delegua/bibliotecas/primitivas-vetor';
import { formatarPrimitivas, funcoesNativasDelegua } from '../bibliotecas';

const primitivasDicionarioFormatadas = formatarPrimitivas(primitivasDicionario);
const primitivasNumeroFormatadas = formatarPrimitivas(primitivasNumero);
const primitivasTextoFormatadas = formatarPrimitivas(primitivasTexto);
const primitivasVetorFormatadas = formatarPrimitivas(primitivasVetor);

import { obterResultado } from '../analise-codigo/cache-analise';
import { ParametroDetectado, TipoParametro } from '../interfaces/completude';
import { definicoesTagsDocumentario } from '../documentacao-em-editor/etiquetas-documentarios';

/**
 * Classe de provedor de completude de Delégua. 
 * Gera todos os elementos de sugestão de código enquanto o/a
 * desenvolvedor/a edita código em Delégua, pressionando caracteres como
 * ponto e/ou Ctrl + espaço.
 */
export class DeleguaProvedorCompletude implements vscode.CompletionItemProvider {
    private readonly completudesDocumentario = definicoesTagsDocumentario.map(definicao => {
        const itemCompletude = new vscode.CompletionItem(definicao.canonica, vscode.CompletionItemKind.Interface);
        itemCompletude.detail = `${definicao.titulo} do documentário`;
        itemCompletude.documentation = new vscode.MarkdownString(
            `Etiqueta canônica: \`${definicao.canonica}\`${definicao.aliases.length > 1 ? `\n\nAliases: ${definicao.aliases.map(alias => `\`${alias}\``).join(', ')}` : ''}`
        );
        itemCompletude.insertText = new vscode.SnippetString(`${definicao.canonica} $0`);
        itemCompletude.sortText = `0-${definicao.canonica}`;
        return itemCompletude;
    });

    // Definições de tipos de Liquido e seus parâmetros.
    private readonly tiposParametrosLiquido: TipoParametro[] = [
        {
            nome: 'requisicao',
            propriedades: [
                {
                    nome: 'corpo',
                    tipo: 'objeto',
                    documentacao: 'Corpo da requisição HTTP contendo dados enviados pelo cliente',
                    tipoCompletude: vscode.CompletionItemKind.Property
                },
                {
                    nome: 'parametros',
                    tipo: 'objeto',
                    documentacao: 'Parâmetros da URL da requisição',
                    tipoCompletude: vscode.CompletionItemKind.Property,
                    propriedadesAninhadas: [
                        {
                            nome: 'id',
                            tipo: 'texto',
                            documentacao: 'ID comum em parâmetros de rota'
                        },
                        {
                            nome: 'slug',
                            tipo: 'texto',
                            documentacao: 'Slug comum em parâmetros de rota'
                        }
                    ]
                },
                {
                    nome: 'cabecalhos',
                    tipo: 'objeto',
                    documentacao: 'Cabeçalhos HTTP da requisição',
                    tipoCompletude: vscode.CompletionItemKind.Property
                },
            ]
        },
        {
            nome: 'resposta',
            propriedades: [],
            metodos: [
                {
                    nome: 'status',
                    parametros: ['codigo: number'],
                    tipoRetorno: 'resposta',
                    documentacao: 'Define o código de status HTTP da resposta',
                    snippet: 'status(${1:200})',
                    permiteEncadeamento: true
                },
                {
                    nome: 'json',
                    parametros: ['dados: object'],
                    tipoRetorno: 'void',
                    documentacao: 'Envia uma resposta JSON',
                    snippet: 'json(${1:{\\}})',
                    permiteEncadeamento: false
                },
                {
                    nome: 'enviar',
                    parametros: ['texto: string'],
                    tipoRetorno: 'void',
                    documentacao: 'Envia uma resposta em texto plano',
                    snippet: 'enviar("${1:texto}")',
                    permiteEncadeamento: false
                },
                {
                    nome: 'lmht',
                    parametros: ['lmht: dicionário'],
                    tipoRetorno: 'void',
                    documentacao: 'Envia uma resposta HTML',
                    snippet: 'lmht("${1:<html></html>}")',
                    permiteEncadeamento: false
                },
                {
                    nome: 'redirecionar',
                    parametros: ['caminho: texto'],
                    tipoRetorno: 'void',
                    documentacao: 'Redireciona a requisição para outro caminho',
                    snippet: 'redirecionar("${1:caminho}")',
                    permiteEncadeamento: false
                },
                {
                    nome: 'cabecalho',
                    parametros: ['nome: texto', 'valor: texto'],
                    tipoRetorno: 'resposta',
                    documentacao: 'Define um cabeçalho HTTP na resposta',
                    snippet: 'cabecalho("${1:nome}", "${2:valor}")',
                    permiteEncadeamento: true
                },
                {
                    nome: 'cookie',
                    parametros: ['nome: texto', 'valor: texto', 'opcoes?: dicionário'],
                    tipoRetorno: 'resposta',
                    documentacao: 'Define um cookie na resposta',
                    snippet: 'cookie("${1:nome}", "${2:valor}")',
                    permiteEncadeamento: true
                }
            ]
        }
    ];

    protected completudesParaDelegua(
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
                        return [];
                }
            }

            return [];
        }

        return funcoesNativasDelegua.map(funcaoNativa => {
            let itemCompletude = new vscode.CompletionItem(funcaoNativa.nome, vscode.CompletionItemKind.Function);
            itemCompletude.documentation = new vscode.MarkdownString(funcaoNativa.documentacao);
            return itemCompletude;
        });
    }

    private estaEmDocumentario(documento: vscode.TextDocument, posicao: vscode.Position): boolean {
        let emComentarioDocumentario = false;

        for (let linha = 0; linha <= posicao.line; linha++) {
            const textoLinha = documento.lineAt(linha).text;
            const limite = linha === posicao.line ? textoLinha.substring(0, posicao.character) : textoLinha;

            if (limite.includes('/**')) {
                emComentarioDocumentario = true;
            }

            if (limite.includes('*/')) {
                emComentarioDocumentario = false;
            }
        }

        return emComentarioDocumentario;
    }

    private obterCompletudesDocumentario(textoAntesPosicao: string): vscode.CompletionItem[] {
        const correspondencia = textoAntesPosicao.match(/(^|\s)@(\w*)$/);
        if (!correspondencia) {
            return [];
        }

        const prefixo = `@${(correspondencia[2] || '').toLowerCase()}`;
        return this.completudesDocumentario
            .filter(item => item.label.toString().toLowerCase().startsWith(prefixo))
            .map(item => {
                const itemCompletude = new vscode.CompletionItem(item.label, item.kind);
                itemCompletude.detail = item.detail;
                itemCompletude.documentation = item.documentation;
                itemCompletude.sortText = item.sortText;

                const textoEtiqueta = item.label.toString();
                const restanteEtiqueta = textoEtiqueta.slice(prefixo.length);
                itemCompletude.insertText = new vscode.SnippetString(`${restanteEtiqueta} $0`);

                return itemCompletude;
            });
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

            // Procurar por certos escopos de Liquido
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

    private obterClasseEnvolvente(documento: vscode.TextDocument, posicao: vscode.Position): string | null {
        let profundidade = 0;

        for (let linha = posicao.line; linha >= 0; linha--) {
            const textoLinha = documento.lineAt(linha).text;
            const limite = linha === posicao.line ? posicao.character : textoLinha.length;

            for (let col = limite - 1; col >= 0; col--) {
                if (textoLinha[col] === '}') {
                    profundidade++;
                } else if (textoLinha[col] === '{') {
                    if (profundidade === 0) {
                        for (let busca = linha; busca >= Math.max(0, linha - 3); busca--) {
                            const correspondencia = documento.lineAt(busca).text.match(/\bclasse\s+(\w+)/);
                            if (correspondencia) {
                                return correspondencia[1];
                            }
                        }
                        // Not a class block — keep profundidade at 0 and continue outward
                    } else {
                        profundidade--;
                    }
                }
            }
        }

        return null;
    }

    private obterCompletudesDeClasseDeTexto(documento: vscode.TextDocument, nomeClasse: string): vscode.CompletionItem[] {
        const completudes: vscode.CompletionItem[] = [];
        let linhaInicio = -1;

        for (let i = 0; i < documento.lineCount; i++) {
            if (documento.lineAt(i).text.match(new RegExp(`\\bclasse\\s+${nomeClasse}\\b`))) {
                linhaInicio = i;
                break;
            }
        }

        if (linhaInicio === -1) {
            return completudes;
        }

        let profundidade = 0;
        for (let i = linhaInicio; i < documento.lineCount; i++) {
            const texto = documento.lineAt(i).text;
            const profundidadeAntes = profundidade;
            for (const char of texto) {
                if (char === '{') profundidade++;
                else if (char === '}') profundidade--;
            }

            if (profundidadeAntes === 1 && i > linhaInicio) {
                const correspondenciaMetodo = texto.match(/^\s*([a-zA-ZÀ-ú_]\w*)\s*\(/);
                if (correspondenciaMetodo && correspondenciaMetodo[1] !== 'construtor') {
                    const nome = correspondenciaMetodo[1];
                    if (!completudes.some(c => c.label === nome)) {
                        const item = new vscode.CompletionItem(nome, vscode.CompletionItemKind.Method);
                        item.detail = `(método) ${nome}`;
                        item.insertText = new vscode.SnippetString(`${nome}($0)`);
                        completudes.push(item);
                    }
                }

                const correspondenciaPropriedade = texto.match(/^\s*([a-zA-ZÀ-ú_]\w*)\s*:/);
                if (correspondenciaPropriedade) {
                    const nome = correspondenciaPropriedade[1];
                    if (!completudes.some(c => c.label === nome)) {
                        const item = new vscode.CompletionItem(nome, vscode.CompletionItemKind.Property);
                        item.detail = `(propriedade) ${nome}`;
                        completudes.push(item);
                    }
                }
            }

            if (profundidade === 0 && i > linhaInicio) {
                break;
            }
        }

        return completudes;
    }

    private coletarVarsEConsts(declaracoes: any[]): { nome: string; tipo: string }[] {
        const resultado: { nome: string; tipo: string }[] = [];
        for (const d of declaracoes) {
            if (d instanceof Var) {
                resultado.push({ nome: d.simbolo.lexema, tipo: d.tipo });
            } else if (d instanceof Const) {
                resultado.push({ nome: d.simbolo.lexema, tipo: d.tipo });
            }
            // Enquanto/ParaCada: corpo é um Bloco com .declaracoes
            if ((d as any).corpo?.declaracoes) {
                resultado.push(...this.coletarVarsEConsts((d as any).corpo.declaracoes));
            }
            // Se: caminhoEntao e caminhoSenao são Blocos com .declaracoes
            if ((d as any).caminhoEntao?.declaracoes) {
                resultado.push(...this.coletarVarsEConsts((d as any).caminhoEntao.declaracoes));
            }
            if ((d as any).caminhoSenao?.declaracoes) {
                resultado.push(...this.coletarVarsEConsts((d as any).caminhoSenao.declaracoes));
            }
        }
        return resultado;
    }

    private coletarVariaveisLocais(todasDeclaracoes: any[], linhaAtual: number): { nome: string; tipo: string }[] {
        const todasFuncoes: FuncaoDeclaracao[] = [];
        for (const d of todasDeclaracoes) {
            if (d instanceof FuncaoDeclaracao) {
                todasFuncoes.push(d);
            }
            if (d instanceof Classe) {
                todasFuncoes.push(...d.metodos);
            }
        }

        const funcoesAnteriores = todasFuncoes.filter(f => Number(f.simbolo.linha) <= linhaAtual);
        if (!funcoesAnteriores.length) {
            return [];
        }

        const funcaoAtual = funcoesAnteriores.reduce((prev, curr) =>
            Number(curr.simbolo.linha) > Number(prev.simbolo.linha) ? curr : prev
        );

        // FuncaoConstruto.corpo é diretamente um array de declarações
        const corpo: any[] = Array.isArray(funcaoAtual.funcao.corpo) ? funcaoAtual.funcao.corpo : [];
        return this.coletarVarsEConsts(corpo);
    }

    private obterCompletudesDeClasse(classeDeclarada: Classe): vscode.CompletionItem[] {
        const completudes: vscode.CompletionItem[] = [];

        for (const metodo of classeDeclarada.metodos) {
            const item = new vscode.CompletionItem(metodo.simbolo.lexema, vscode.CompletionItemKind.Method);
            const params = metodo.funcao?.parametros?.map(p => p.nome?.lexema ?? '').join(', ') ?? '';
            item.detail = `(método) ${metodo.simbolo.lexema}(${params})`;
            item.insertText = new vscode.SnippetString(`${metodo.simbolo.lexema}($0)`);
            completudes.push(item);
        }

        for (const prop of classeDeclarada.propriedades) {
            const item = new vscode.CompletionItem(prop.nome.lexema, vscode.CompletionItemKind.Property);
            item.detail = prop.tipo ? `(${prop.tipo}) ${prop.nome.lexema}` : `(propriedade) ${prop.nome.lexema}`;
            completudes.push(item);
        }

        return completudes;
    }

    /**
     * Ponto de entrada para fornecer sugestões de completude. Analisa o contexto atual, incluindo o texto antes do cursor, o 
     * escopo de código, e os parâmetros detectados para gerar sugestões relevantes e contextuais para o desenvolvedor.
     * @param {vscode.TextDocument} documento O documento de código-fonte onde a completude está sendo solicitada.
     * @param {vscode.Position} posicao A posição do cursor no documento, usada para determinar o contexto da completude.
     * @param {vscode.CancellationToken} token A token de cancelamento para lidar com solicitações de completude assíncronas, 
     * permitindo que sejam canceladas se o usuário continuar digitando.
     * @param {vscode.CompletionContext} context O contexto da solicitação de completude, fornecendo informações adicionais 
     * sobre a origem da solicitação.
     * @returns {vscode.ProviderResult<vscode.CompletionList<vscode.CompletionItem> | vscode.CompletionItem[]>} Uma lista de 
     * itens de completude relevantes para o contexto atual, ou uma promessa que resolve para essa lista.
     */
    provideCompletionItems(documento: vscode.TextDocument, posicao: vscode.Position, token: vscode.CancellationToken, context: vscode.CompletionContext): vscode.ProviderResult<vscode.CompletionList<vscode.CompletionItem> | vscode.CompletionItem[]> {
        const resultadoAnalise = obterResultado(documento.uri.toString());
        const linhaTexto = documento.lineAt(posicao).text;
        const textoAntesPosicao = linhaTexto.substring(0, posicao.character);

        if (this.estaEmDocumentario(documento, posicao)) {
            const completudesDocumentario = this.obterCompletudesDocumentario(textoAntesPosicao);
            if (completudesDocumentario.length > 0) {
                return completudesDocumentario;
            }
        }

        const detalhesEscopo = this.obterDetalhesEscopo(documento, posicao);
        const parametrosDetectados = this.detectarParametrosDaFuncao(documento, posicao);
        const caminhoCompleto = this.analisarCadeiaChamadasEmCodigo(textoAntesPosicao);

        if (caminhoCompleto.length > 0) {
            const completudes = this.obterCompletudesParaCaminho(caminhoCompleto, parametrosDetectados, detalhesEscopo);
            if (completudes && completudes.length > 0) {
                return completudes;
            }
        }

        const todasDeclaracoes = [
            ...(resultadoAnalise?.declaracoesPreCarregadas || []),
            ...(resultadoAnalise?.avaliadorSintatico?.declaracoes || [])
        ];
        const variaveisLocais = this.coletarVariaveisLocais(todasDeclaracoes, posicao.line + 1);

        const declaracoesPertinentes = [
            ...variaveisLocais,
            ...(resultadoAnalise?.avaliadorSintatico.declaracoes.flatMap(declaracao => {
                if (declaracao instanceof Var) {
                    return [{ nome: declaracao.simbolo.lexema, tipo: declaracao.tipo }];
                }

                if (declaracao instanceof Const) {
                    return [{ nome: declaracao.simbolo.lexema, tipo: declaracao.tipo }];
                }

                if (declaracao instanceof Classe) {
                    return [{ nome: declaracao.simbolo.lexema, tipo: declaracao.simbolo.lexema }];
                }

                if (declaracao instanceof FuncaoDeclaracao) {
                    return [{ nome: declaracao.simbolo.lexema, tipo: declaracao.tipo }];
                }

                return [];
            }) || [])
        ];

        const completudesDeVariaveisEConstantes = declaracoesPertinentes
            .filter(v => /^[a-zA-ZÀ-úÇç_]/.test(v.nome))
            .map(v => {
            let itemCompletude = new vscode.CompletionItem(v.nome, vscode.CompletionItemKind.Variable);
            itemCompletude.detail = `(${v.tipo}) ${v.nome}`;
            return itemCompletude;
        });

        const palavraAntesPonto = this.obterPalavraAntesPonto(textoAntesPosicao);
        const declaracaoCorrespondente = declaracoesPertinentes.find(v => v.nome === palavraAntesPonto);

        if (palavraAntesPonto === 'isto') {
            const nomeClasse = this.obterClasseEnvolvente(documento, posicao);
            if (nomeClasse) {
                const classeDeclarada = resultadoAnalise?.avaliadorSintatico.declaracoes.find(
                    d => d instanceof Classe && (d as Classe).simbolo.lexema === nomeClasse
                ) as Classe | undefined;
                if (classeDeclarada) {
                    return this.obterCompletudesDeClasse(classeDeclarada);
                }
                return this.obterCompletudesDeClasseDeTexto(documento, nomeClasse);
            }
        }

        // Propriedades com um parâmetro com tipo definido.
        const tipoParametro = this.obterTipoParametroComDeteccao(palavraAntesPonto, parametrosDetectados);
        if (tipoParametro && this.estaNoContextoCorreto(detalhesEscopo, palavraAntesPonto)) {
            return this.criarCompletudesCompletas(tipoParametro);
        }

        switch (detalhesEscopo.tipoEscopo) {
            case 'rotaGet':
            case 'rotaPost':
                // Objetos válidos apenas dentro de um escopo de rota de Liquido.
                return objetosEmRotaLiquido.map(objeto => {
                    let itemCompletude = new vscode.CompletionItem(objeto.nome, vscode.CompletionItemKind.Function);
                    itemCompletude.documentation = new vscode.MarkdownString(objeto.documentacao);
                    return itemCompletude;
                });
            default:
                // Primitivas de Liquido
                if (palavraAntesPonto === 'liquido') {
                    return primitivasMetodosLiquido.map(funcaoNativa => {
                        let itemCompletude = new vscode.CompletionItem(funcaoNativa.nome, vscode.CompletionItemKind.Function);
                        itemCompletude.insertText = new vscode.SnippetString(`${funcaoNativa.nome}(requisicao, resposta) {\n\t$0\n}`);
                        itemCompletude.documentation = new vscode.MarkdownString(funcaoNativa.documentacao);
                        return itemCompletude;
                    });
                }

                return completudesDeVariaveisEConstantes.concat(
                    this.completudesParaDelegua(textoAntesPosicao, palavraAntesPonto, parametrosDetectados, declaracaoCorrespondente)
                );
        }
    }
}
