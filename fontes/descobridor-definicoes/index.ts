import * as vscode from 'vscode';

interface ManifestoDeleguaPacote {
    definicoes: string;
}

/**
 * Varre os pacotes instalados em `node_modules/@designliquido` buscando aqueles
 * que declaram o campo `"delegua"` no seu `package.json`.
 * Para cada pacote encontrado, coleta os caminhos absolutos dos arquivos `.delegua`
 * da pasta de definições indicada pelo campo `"delegua".definicoes`.
 *
 * Esse mecanismo permite que bibliotecas como `delegua-entidades` exponham
 * superclasses (`Modelo`, `Migracao`, etc.) para o IntelliSense sem que o
 * desenvolvedor precise importá-las explicitamente no código.
 */
export async function descobrirDefinicoes(): Promise<string[]> {
    if (!vscode.workspace.workspaceFolders?.length) {
        return [];
    }

    const raizWorkspace = vscode.workspace.workspaceFolders[0].uri;
    const caminhoOrganizacao = vscode.Uri.joinPath(raizWorkspace, 'node_modules', '@designliquido');
    const caminhoArquivos: string[] = [];

    let entradas: [string, vscode.FileType][];
    try {
        entradas = await vscode.workspace.fs.readDirectory(caminhoOrganizacao);
    } catch {
        // Pasta node_modules/@designliquido não existe — nada a descobrir.
        return [];
    }

    for (const [nomePacote] of entradas) {
        const caminhoPackageJson = vscode.Uri.joinPath(caminhoOrganizacao, nomePacote, 'package.json');

        let manifestoPacote: any;
        try {
            const buffer = await vscode.workspace.fs.readFile(caminhoPackageJson);
            manifestoPacote = JSON.parse(Buffer.from(buffer).toString('utf-8'));
        } catch {
            continue;
        }

        const campoDelegua: ManifestoDeleguaPacote = manifestoPacote['delegua'];
        if (!campoDelegua?.definicoes) {
            continue;
        }

        const caminhoDefinicoes = vscode.Uri.joinPath(
            caminhoOrganizacao,
            nomePacote,
            campoDelegua.definicoes
        );

        let arquivos: [string, vscode.FileType][];
        try {
            arquivos = await vscode.workspace.fs.readDirectory(caminhoDefinicoes);
        } catch {
            continue;
        }

        for (const [nomeArquivo, tipo] of arquivos) {
            if (tipo === vscode.FileType.File && nomeArquivo.endsWith('.delegua')) {
                const caminhoCompleto = vscode.Uri.joinPath(caminhoDefinicoes, nomeArquivo);
                caminhoArquivos.push(caminhoCompleto.fsPath);
            }
        }
    }

    return caminhoArquivos;
}
