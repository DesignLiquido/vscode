export const NOME_ARQUIVO_CONFIGURACAO_LIQUIDO = 'configuracao.delprops';

export type LinguagemProjetoLiquido = 'delegua' | 'pitugues';

export interface ConfiguracaoProjetoLiquido {
    arquetipo?: string;
    linguagem?: LinguagemProjetoLiquido;
}

export interface ContextoProjetoLiquidoPorCaminho extends ConfiguracaoProjetoLiquido {
    raiz: string;
    caminhoConfiguracao: string;
}

function removerComentarioLinha(linha: string): string {
    let emAspasSimples = false;
    let emAspasDuplas = false;

    for (let indice = 0; indice < linha.length - 1; indice++) {
        const caractere = linha[indice];

        if (caractere === '\\') {
            indice++;
            continue;
        }

        if (caractere === "'" && !emAspasDuplas) {
            emAspasSimples = !emAspasSimples;
            continue;
        }

        if (caractere === '"' && !emAspasSimples) {
            emAspasDuplas = !emAspasDuplas;
            continue;
        }

        if (caractere === '/' && linha[indice + 1] === '/' && !emAspasSimples && !emAspasDuplas) {
            return linha.slice(0, indice);
        }
    }

    return linha;
}

function normalizarTexto(valor: string): string {
    return valor
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .trim()
        .toLowerCase();
}

function normalizarLinguagem(valor: string): LinguagemProjetoLiquido | undefined {
    const linguagem = normalizarTexto(valor);

    if (linguagem === 'delegua') {
        return 'delegua';
    }

    if (linguagem === 'pitugues') {
        return 'pitugues';
    }

    return undefined;
}

/**
 * Extrai apenas as propriedades necessárias para contextualizar a extensão.
 * A validação completa continua sendo responsabilidade do validador Delprops.
 */
export function extrairConfiguracaoProjetoLiquido(conteudo: string): ConfiguracaoProjetoLiquido {
    let arquetipo: string | undefined;
    let linguagem: LinguagemProjetoLiquido | undefined = 'delegua';
    const padraoPropriedade = /^\s*liquido\.(arquetipo|linguagem)\s*=\s*(['"])(.*?)\2\s*;?\s*$/i;

    for (const linhaOriginal of conteudo.replace(/^\uFEFF/, '').split(/\r?\n/)) {
        const linha = removerComentarioLinha(linhaOriginal);
        const correspondencia = padraoPropriedade.exec(linha);

        if (!correspondencia) {
            continue;
        }

        const propriedade = normalizarTexto(correspondencia[1]);
        const valor = correspondencia[3];

        if (propriedade === 'arquetipo') {
            arquetipo = normalizarTexto(valor);
        } else {
            linguagem = normalizarLinguagem(valor);
        }
    }

    return { arquetipo, linguagem };
}

function removerBarrasFinais(caminho: string): string {
    if (caminho === '/') {
        return caminho;
    }

    return caminho.replace(/\/+$/, '');
}

function obterDiretorio(caminhoArquivo: string): string {
    const caminho = removerBarrasFinais(caminhoArquivo);
    const ultimoSeparador = caminho.lastIndexOf('/');

    if (ultimoSeparador <= 0) {
        return '/';
    }

    return caminho.slice(0, ultimoSeparador);
}

function caminhoEstaNaRaiz(caminho: string, raiz: string): boolean {
    return raiz === '/' || caminho === raiz || caminho.startsWith(`${raiz}/`);
}

/**
 * Retorna os diretórios a consultar do mais próximo do arquivo até a raiz do workspace.
 * Assim, um monorepo pode conter vários projetos Líquido independentes.
 */
export function obterDiretoriosCandidatosConfiguracao(
    caminhoArquivo: string,
    caminhoRaizWorkspace: string
): string[] {
    const raiz = removerBarrasFinais(caminhoRaizWorkspace) || '/';
    let diretorioAtual = obterDiretorio(caminhoArquivo);

    if (!caminhoEstaNaRaiz(diretorioAtual, raiz)) {
        return [];
    }

    const candidatos: string[] = [];

    while (caminhoEstaNaRaiz(diretorioAtual, raiz)) {
        candidatos.push(diretorioAtual);

        if (diretorioAtual === raiz) {
            break;
        }

        const diretorioPai = obterDiretorio(diretorioAtual);
        if (diretorioPai === diretorioAtual) {
            break;
        }

        diretorioAtual = diretorioPai;
    }

    return candidatos;
}

export async function localizarConfiguracaoProjetoLiquido(
    caminhoArquivo: string,
    caminhoRaizWorkspace: string,
    lerArquivo: (caminho: string) => Promise<string | undefined>
): Promise<ContextoProjetoLiquidoPorCaminho | undefined> {
    const diretorios = obterDiretoriosCandidatosConfiguracao(caminhoArquivo, caminhoRaizWorkspace);

    for (const raiz of diretorios) {
        const caminhoConfiguracao = `${raiz === '/' ? '' : raiz}/${NOME_ARQUIVO_CONFIGURACAO_LIQUIDO}`;
        const conteudo = await lerArquivo(caminhoConfiguracao);

        if (conteudo === undefined) {
            continue;
        }

        return {
            raiz,
            caminhoConfiguracao,
            ...extrairConfiguracaoProjetoLiquido(conteudo),
        };
    }

    return undefined;
}
