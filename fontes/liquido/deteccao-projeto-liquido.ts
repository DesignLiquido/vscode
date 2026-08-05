import * as vscode from 'vscode';

import type {
    ContextoProjetoLiquidoPorCaminho,
    LinguagemProjetoLiquido,
} from './configuracao-projeto-liquido';
import {
    NOME_ARQUIVO_CONFIGURACAO_LIQUIDO,
    localizarConfiguracaoProjetoLiquido,
    obterDiretoriosCandidatosConfiguracao,
} from './configuracao-projeto-liquido';

export interface ContextoProjetoLiquido {
    raiz: vscode.Uri;
    arquivoConfiguracao: vscode.Uri;
    arquetipo?: string;
    linguagem?: LinguagemProjetoLiquido;
}

const cacheDeteccao = new Map<string, Promise<ContextoProjetoLiquido | undefined>>();
const decodificadorUtf8 = new TextDecoder('utf-8');

function obterCaminhoUriSeguro(uri: vscode.Uri | undefined): string | undefined {
    if (!uri) {
        return undefined;
    }

    const caminhoDireto = (uri as any).path;
    if (typeof caminhoDireto === 'string' && caminhoDireto.length > 0) {
        return caminhoDireto;
    }

    const caminhoSistema = (uri as any).fsPath;
    if (typeof caminhoSistema === 'string' && caminhoSistema.length > 0) {
        return caminhoSistema.replace(/\\/g, '/');
    }

    try {
        const valor = uri.toString?.();
        if (typeof valor === 'string' && valor.length > 0) {
            if (valor.startsWith('file://')) {
                return decodeURIComponent(new URL(valor).pathname);
            }

            const indiceEsquema = valor.indexOf('://');
            if (indiceEsquema >= 0) {
                const indiceCaminho = valor.indexOf('/', indiceEsquema + 3);
                return indiceCaminho >= 0 ? valor.slice(indiceCaminho) : '/';
            }

            return valor.startsWith('/') ? valor : undefined;
        }
    } catch {
        return undefined;
    }

    return undefined;
}

function caminhoEstaSobRaiz(caminho: string, raiz: string): boolean {
    return raiz === '/' || caminho === raiz || caminho.startsWith(`${raiz}/`);
}

function obterPastaTrabalhoSegura(
    uriArquivo: vscode.Uri,
    caminhoArquivo: string
): vscode.WorkspaceFolder | undefined {
    const obterPasta = (vscode.workspace as any)?.getWorkspaceFolder;
    if (typeof obterPasta === 'function') {
        return obterPasta.call(vscode.workspace, uriArquivo);
    }

    const pastas = (vscode.workspace as any)?.workspaceFolders;
    if (!Array.isArray(pastas)) {
        return undefined;
    }

    return pastas.find((pasta: vscode.WorkspaceFolder) => {
        const raiz = obterCaminhoUriSeguro(pasta?.uri);
        return raiz ? caminhoEstaSobRaiz(caminhoArquivo, raiz) : false;
    });
}

function uriNoMesmoProvedor(uriBase: vscode.Uri, caminho: string): vscode.Uri {
    return uriBase.with({ path: caminho, query: '', fragment: '' });
}

function converterContexto(
    contexto: ContextoProjetoLiquidoPorCaminho,
    uriBase: vscode.Uri
): ContextoProjetoLiquido {
    return {
        raiz: uriNoMesmoProvedor(uriBase, contexto.raiz),
        arquivoConfiguracao: uriNoMesmoProvedor(uriBase, contexto.caminhoConfiguracao),
        arquetipo: contexto.arquetipo,
        linguagem: contexto.linguagem,
    };
}

async function detectarSemCache(
    uriArquivo: vscode.Uri,
    pastaTrabalho: vscode.WorkspaceFolder,
    caminhoArquivo: string,
    caminhoRaizWorkspace: string
): Promise<ContextoProjetoLiquido | undefined> {
    const leitor = (vscode.workspace as any)?.fs?.readFile;
    if (typeof leitor !== 'function') {
        return undefined;
    }

    const contexto = await localizarConfiguracaoProjetoLiquido(
        caminhoArquivo,
        caminhoRaizWorkspace,
        async caminhoConfiguracao => {
            try {
                const conteudo = await leitor.call(
                    (vscode.workspace as any).fs,
                    uriNoMesmoProvedor(pastaTrabalho.uri, caminhoConfiguracao)
                );
                return decodificadorUtf8.decode(conteudo);
            } catch {
                return undefined;
            }
        }
    );

    return contexto ? converterContexto(contexto, pastaTrabalho.uri) : undefined;
}

export async function detectarProjetoLiquido(
    uriArquivo: vscode.Uri
): Promise<ContextoProjetoLiquido | undefined> {
    const caminhoArquivo = obterCaminhoUriSeguro(uriArquivo);
    if (!caminhoArquivo) {
        return undefined;
    }

    const pastaTrabalho = obterPastaTrabalhoSegura(uriArquivo, caminhoArquivo);
    const caminhoRaizWorkspace = obterCaminhoUriSeguro(pastaTrabalho?.uri);

    if (!pastaTrabalho || !caminhoRaizWorkspace) {
        return undefined;
    }

    const diretorioDocumento = obterDiretoriosCandidatosConfiguracao(
        caminhoArquivo,
        caminhoRaizWorkspace
    )[0] ?? caminhoArquivo;
    const chaveCache = `${pastaTrabalho.uri.toString()}::${diretorioDocumento}`;

    let deteccao = cacheDeteccao.get(chaveCache);
    if (!deteccao) {
        deteccao = detectarSemCache(
            uriArquivo,
            pastaTrabalho,
            caminhoArquivo,
            caminhoRaizWorkspace
        );
        cacheDeteccao.set(chaveCache, deteccao);
    }

    return deteccao;
}

export function invalidarCacheDeteccaoProjetoLiquido(): void {
    cacheDeteccao.clear();
}

export function ehArquivoConfiguracaoProjetoLiquido(uri: vscode.Uri): boolean {
    const caminho = obterCaminhoUriSeguro(uri);
    if (!caminho) {
        return false;
    }

    const nomeArquivo = caminho.split('/').pop()?.toLowerCase();
    return nomeArquivo === NOME_ARQUIVO_CONFIGURACAO_LIQUIDO;
}

export function contextoLiquidoCorrespondeAExtensao(
    contexto: ContextoProjetoLiquido | undefined,
    extensaoArquivo: string
): boolean {
    if (!contexto?.linguagem) {
        return false;
    }

    if (extensaoArquivo === 'delegua') {
        return contexto.linguagem === 'delegua';
    }

    if (extensaoArquivo === 'pitu' || extensaoArquivo === 'pitugues') {
        return contexto.linguagem === 'pitugues';
    }

    return false;
}
