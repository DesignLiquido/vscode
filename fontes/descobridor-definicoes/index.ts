import * as vscode from 'vscode';

import { ManifestoDeleguaPacoteInterface } from '../interfaces';

const TTL_CAMINHOS_MS = 60 * 60 * 1000;

interface EntradaCacheCaminhos {
    caminhos: string[];
    expiraEm: number;
}

const cacheCaminhos = new Map<string, EntradaCacheCaminhos>();

export function limparCacheCaminhosDefinicoes(): void {
    cacheCaminhos.clear();
}

function obterChaveCacheDefinicoes(arquivoDeRotaLiquido: boolean): string {
    const chaveWorkspace = vscode.workspace.workspaceFolders?.[0]?.uri.toString() || 'sem-workspace';
    return `${chaveWorkspace}::${arquivoDeRotaLiquido ? 'liquido' : 'normal'}`;
}

function obterCaminhosCached(chave: string): string[] | undefined {
    const entrada = cacheCaminhos.get(chave);
    if (!entrada || Date.now() > entrada.expiraEm) {
        cacheCaminhos.delete(chave);
        return undefined;
    }
    return entrada.caminhos;
}

function definirCaminhosCache(chave: string, caminhos: string[]): void {
    cacheCaminhos.set(chave, { caminhos, expiraEm: Date.now() + TTL_CAMINHOS_MS });
}

/**
 * Ponto de entrada para o mecanismo de descoberta de definições.
 * Varre o projeto aberto e pacotes npm selecionados buscando aqueles
 * com o campo `delegua.definicoes` configurado.
 *
 * Pacotes selecionados:
 * - Todos sob `@designliquido/*` que começam com `delegua-`
 * - Pacote `liquido` (se contexto Líquido)
 *
 * @param arquivoDeRotaLiquido Se true, inclui definições do pacote 'liquido'
 * @returns {string[]} Uma lista de caminhos absolutos para arquivos `.delegua` encontrados.
 */
export async function descobrirDefinicoes(arquivoDeRotaLiquido: boolean = false): Promise<string[]> {
    if (!vscode.workspace.workspaceFolders?.length) {
        return [];
    }

    const chaveCacheDefinicoes = obterChaveCacheDefinicoes(arquivoDeRotaLiquido);
    const definicoesEmCache = obterCaminhosCached(chaveCacheDefinicoes);
    if (definicoesEmCache) {
        return definicoesEmCache;
    }

    const raizWorkspace = vscode.workspace.workspaceFolders[0].uri;
    const diretorioNodeModulesDoProjeto = vscode.Uri.joinPath(raizWorkspace, 'node_modules');

    const promisesAExecutar: Promise<string[]>[] = [
        descobrirDefinicoesEmProjetoAberto(raizWorkspace),
        // Descobre apenas pacotes padrão @designliquido/delegua-*
        coletarDefinicoesDePastaNodeModules(
            vscode.Uri.joinPath(diretorioNodeModulesDoProjeto, '@designliquido'),
            nome => nome.startsWith('delegua-')
        ),
        // Descobre pacotes de raiz em node_modules (ex: liquido)
        coletarDefinicoesDePacoteEspecifico(
            diretorioNodeModulesDoProjeto,
            'liquido'
        )
    ];

    const promises = await Promise.all(promisesAExecutar);
    const definicoes = promises.flat();

    // Remove duplicatas mantendo ordem
    const definicoesUnicas = Array.from(new Set(definicoes));
    if (definicoesUnicas.length > 0) {
        definirCaminhosCache(chaveCacheDefinicoes, definicoesUnicas);
    }

    return definicoesUnicas;
}

async function descobrirDefinicoesEmProjetoAberto(raizWorkspace: vscode.Uri): Promise<string[]> {
    const arquivos: string[] = [];

    // Ler o diretório `definicoes`
    const caminhoDefinicoes = vscode.Uri.joinPath(raizWorkspace, 'definicoes');
    let entradas: [string, vscode.FileType][];

    try {
        entradas = await vscode.workspace.fs.readDirectory(caminhoDefinicoes);
    } catch (error) {
        // Pasta definicoes não existe — nada a descobrir.
        return [];
    }

    for (const [nomeArquivo, tipo] of entradas) {
        if (tipo === vscode.FileType.File && nomeArquivo.endsWith('.delegua')) {
            const caminhoCompleto = vscode.Uri.joinPath(caminhoDefinicoes, nomeArquivo);
            arquivos.push(caminhoCompleto.fsPath);
        }
    }

    return arquivos;
}

async function coletarDefinicoesDePacoteEspecifico(
    pastaPacotes: vscode.Uri,
    nomePacote: string
): Promise<string[]> {
    const caminhoArquivos: string[] = [];
    const caminhoPackageJson = vscode.Uri.joinPath(pastaPacotes, nomePacote, 'package.json');

    let manifestoPacote: any;
    try {
        const buffer = await vscode.workspace.fs.readFile(caminhoPackageJson);
        manifestoPacote = JSON.parse(Buffer.from(buffer).toString('utf-8'));
    } catch {
        return [];
    }

    const campoDelegua: ManifestoDeleguaPacoteInterface = manifestoPacote['delegua'];
    const pastaDef = campoDelegua?.definicoes ?? 'definicoes';
    const caminhoDefinicoes = vscode.Uri.joinPath(pastaPacotes, nomePacote, pastaDef);

    let arquivos: [string, vscode.FileType][];
    try {
        arquivos = await vscode.workspace.fs.readDirectory(caminhoDefinicoes);
    } catch {
        return [];
    }

    for (const [nomeArquivo, tipoArquivo] of arquivos) {
        if (tipoArquivo === vscode.FileType.File && nomeArquivo.endsWith('.delegua')) {
            const caminhoCompleto = vscode.Uri.joinPath(caminhoDefinicoes, nomeArquivo);
            caminhoArquivos.push(caminhoCompleto.fsPath);
        }
    }

    return caminhoArquivos;
}

async function coletarDefinicoesDePastaNodeModules(
    pastaPacotes: vscode.Uri,
    filtro: (nome: string) => boolean
): Promise<string[]> {
    const caminhoArquivos: string[] = [];

    let entradas: [string, vscode.FileType][];
    try {
        entradas = await vscode.workspace.fs.readDirectory(pastaPacotes);
    } catch {
        return [];
    }

    for (const [nomePacote, tipo] of entradas) {
        if (tipo !== vscode.FileType.Directory || !filtro(nomePacote)) {
            continue;
        }

        caminhoArquivos.push(...await coletarDefinicoesDePacoteEspecifico(pastaPacotes, nomePacote));
    }

    return caminhoArquivos;
}
