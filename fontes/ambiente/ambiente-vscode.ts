import * as vscode from 'vscode';

import { AmbienteLSPInterface, EntradaDiretorioInterface, ManipuladorCaminhosInterface, SistemaArquivosInterface } from '@designliquido/delegua-lsp';

const decoder = new TextDecoder('utf-8');

function caminhoParaUri(caminho: string): vscode.Uri {
    if (/^file:/.test(caminho)) {
        return vscode.Uri.parse(caminho);
    }
    return vscode.Uri.file(caminho);
}

const sistemaArquivos: SistemaArquivosInterface = {
    async lerArquivoTexto(caminho: string): Promise<string | undefined> {
        try {
            const bytes = await vscode.workspace.fs.readFile(caminhoParaUri(caminho));
            return decoder.decode(bytes);
        } catch {
            return undefined;
        }
    },
    async listarDiretorio(caminho: string): Promise<EntradaDiretorioInterface[]> {
        try {
            const entradas = await vscode.workspace.fs.readDirectory(caminhoParaUri(caminho));
            return entradas.map(([nome, tipo]) => ({
                nome,
                ehDiretorio: tipo === vscode.FileType.Directory,
            }));
        } catch {
            return [];
        }
    },
};

function unificarSeparadores(caminho: string): string {
    return caminho.replace(/\\/g, '/');
}

const caminhos: ManipuladorCaminhosInterface = {
    juntar(...partes: string[]): string {
        const unificado = partes.map(unificarSeparadores).join('/');
        return unificado.replace(/\/+/g, '/').replace(/\/$/, '') || '/';
    },
    dirname(caminho: string): string {
        const normalizado = unificarSeparadores(caminho);
        const idx = normalizado.lastIndexOf('/');
        if (idx <= 0) { return normalizado.startsWith('/') ? '/' : '.'; }
        return normalizado.slice(0, idx);
    },
    resolver(base: string, relativo: string): string {
        const rel = unificarSeparadores(relativo);
        if (/^\//.test(rel) || /^[A-Za-z]:/.test(rel)) {
            return rel;
        }
        const partes = unificarSeparadores(base).split('/');
        for (const segmento of rel.split('/')) {
            if (segmento === '..') {
                partes.pop();
            } else if (segmento !== '.') {
                partes.push(segmento);
            }
        }
        return partes.join('/').replace(/\/+/g, '/');
    },
    normalizar(caminho: string): string {
        return unificarSeparadores(caminho);
    },
};

export const ambienteVscode: AmbienteLSPInterface = { sistemaArquivos, caminhos };
