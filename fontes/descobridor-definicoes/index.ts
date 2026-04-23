import * as vscode from 'vscode';

import { ManifestoDeleguaPacoteInterface } from '../interfaces';

/**
 * Ponto de entrada para o mecanismo de descoberta de definições. 
 * Varre o projeto aberto e os pacotes instalados em busca de arquivos `.delegua` que possam conter definições 
 * de classes, funções, etc. para o IntelliSense.
 * @returns {string[]} Uma lista de caminhos absolutos para arquivos `.delegua` encontrados.
 */
export async function descobrirDefinicoes(): Promise<string[]> {
    const promises = await Promise.all([
        descobrirDefinicoesEmProjetoAberto(),
        descobrirDefinicoesEmPacotes()
    ]);

    const definicoes = promises.flat();
    return definicoes;
}

async function descobrirDefinicoesEmProjetoAberto(): Promise<string[]> {
    if (!vscode.workspace.workspaceFolders?.length) {
        return [];
    }

    const raizWorkspace = vscode.workspace.workspaceFolders[0].uri;
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

async function coletarDefinicoesDePastaNodeModules(pastaPacotes: vscode.Uri): Promise<string[]> {
    const caminhoArquivos: string[] = [];

    let entradas: [string, vscode.FileType][];
    try {
        entradas = await vscode.workspace.fs.readDirectory(pastaPacotes);
    } catch {
        return [];
    }

    for (const [nomePacote, tipo] of entradas) {
        if (tipo !== vscode.FileType.Directory) {
            continue;
        }

        const caminhoPackageJson = vscode.Uri.joinPath(pastaPacotes, nomePacote, 'package.json');

        let manifestoPacote: any;
        try {
            const buffer = await vscode.workspace.fs.readFile(caminhoPackageJson);
            manifestoPacote = JSON.parse(Buffer.from(buffer).toString('utf-8'));
        } catch {
            continue;
        }

        const campoDelegua: ManifestoDeleguaPacoteInterface = manifestoPacote['delegua'];
        if (!campoDelegua?.definicoes) {
            continue;
        }

        const caminhoDefinicoes = vscode.Uri.joinPath(pastaPacotes, nomePacote, campoDelegua.definicoes);

        let arquivos: [string, vscode.FileType][];
        try {
            arquivos = await vscode.workspace.fs.readDirectory(caminhoDefinicoes);
        } catch {
            continue;
        }

        for (const [nomeArquivo, tipoArquivo] of arquivos) {
            if (tipoArquivo === vscode.FileType.File && nomeArquivo.endsWith('.delegua')) {
                const caminhoCompleto = vscode.Uri.joinPath(caminhoDefinicoes, nomeArquivo);
                caminhoArquivos.push(caminhoCompleto.fsPath);
            }
        }
    }

    return caminhoArquivos;
}

/**
 * Varre os pacotes instalados em `node_modules` buscando aqueles que declaram o campo
 * `"delegua"` no seu `package.json`. Cobre tanto pacotes sob `@designliquido` quanto
 * pacotes de raiz (ex.: `liquido`).
 */
async function descobrirDefinicoesEmPacotes(): Promise<string[]> {
    if (!vscode.workspace.workspaceFolders?.length) {
        return [];
    }

    const raizWorkspace = vscode.workspace.workspaceFolders[0].uri;
    const nodeModules = vscode.Uri.joinPath(raizWorkspace, 'node_modules');

    const [deOrganizacao, deRaiz] = await Promise.all([
        coletarDefinicoesDePastaNodeModules(vscode.Uri.joinPath(nodeModules, '@designliquido')),
        coletarDefinicoesDePastaNodeModules(nodeModules),
    ]);

    return [...deOrganizacao, ...deRaiz];
}