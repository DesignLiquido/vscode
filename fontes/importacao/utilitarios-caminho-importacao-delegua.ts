import * as path from 'path';
import * as vscode from 'vscode';

const EXTENSOES_DELEGUA = ['.delegua', '.egua'];

export function ehArquivoDelegua(uri: vscode.Uri): boolean {
    const extensao = path.extname(uri.fsPath).toLowerCase();
    return EXTENSOES_DELEGUA.includes(extensao);
}

export function normalizarSeparadores(caminho: string): string {
    return caminho.replace(/\\/g, '/').trim();
}

export function extrairCaminhoImportacao(
    linha: string
): { caminho: string; inicio: number; fim: number } | undefined {
    const correspondencia = linha.match(/\bde\s+(["'])([^"']+)\1/);
    if (!correspondencia) {
        return undefined;
    }

    const caminho = correspondencia[2];
    const indiceInicial = linha.indexOf(caminho, correspondencia.index ?? 0);
    if (indiceInicial < 0) {
        return undefined;
    }

    return {
        caminho,
        inicio: indiceInicial,
        fim: indiceInicial + caminho.length,
    };
}

async function uriExiste(uri: vscode.Uri): Promise<boolean> {
    try {
        await vscode.workspace.fs.stat(uri);
        return true;
    } catch {
        return false;
    }
}

function criarUriRelativa(base: vscode.Uri, caminho: string): vscode.Uri {
    const segmentosBase = base.path.split('/');
    segmentosBase.pop();

    for (const segmento of normalizarSeparadores(caminho).split('/')) {
        if (!segmento || segmento === '.') {
            continue;
        }

        if (segmento === '..') {
            if (segmentosBase.length > 1) {
                segmentosBase.pop();
            }
            continue;
        }

        segmentosBase.push(segmento);
    }

    return base.with({ path: segmentosBase.join('/') });
}

export async function resolverDestinoImportacao(
    documento: vscode.TextDocument,
    caminhoOriginal: string
): Promise<vscode.Uri | undefined> {
    const caminho = normalizarSeparadores(caminhoOriginal);
    if (!caminho) {
        return undefined;
    }

    if (caminho.startsWith('./') || caminho.startsWith('../')) {
        const destinoRelativo = criarUriRelativa(documento.uri, caminho);
        if (await uriExiste(destinoRelativo)) {
            return destinoRelativo;
        }

        if (!path.extname(caminho)) {
            for (const extensao of EXTENSOES_DELEGUA) {
                const comExtensao = destinoRelativo.with({ path: `${destinoRelativo.path}${extensao}` });
                if (await uriExiste(comExtensao)) {
                    return comExtensao;
                }
            }
        }

        return undefined;
    }

    const pastaAtual = vscode.workspace.getWorkspaceFolder(documento.uri);
    const pastas = pastaAtual
        ? [
              pastaAtual,
              ...(vscode.workspace.workspaceFolders || []).filter(
                  p => p.uri.toString() !== pastaAtual.uri.toString()
              ),
          ]
        : vscode.workspace.workspaceFolders || [];

    for (const pasta of pastas) {
        const partes = caminho.split('/').filter(Boolean);
        const uriDireta = vscode.Uri.joinPath(pasta.uri, ...partes);

        if (await uriExiste(uriDireta)) {
            return uriDireta;
        }

        if (!path.extname(caminho)) {
            for (const extensao of EXTENSOES_DELEGUA) {
                const uriComExtensao = vscode.Uri.joinPath(pasta.uri, ...partes.slice(0, -1), `${partes[partes.length - 1]}${extensao}`);
                if (await uriExiste(uriComExtensao)) {
                    return uriComExtensao;
                }
            }
        }
    }

    return undefined;
}

export function calcularNovoCaminhoImportacao(
    importador: vscode.Uri,
    novoDestino: vscode.Uri,
    preservarExtensaoOriginal: boolean
): string {
    const pastaImportador = path.dirname(importador.fsPath);
    let relativo = path.relative(pastaImportador, novoDestino.fsPath).replace(/\\/g, '/');

    if (!preservarExtensaoOriginal) {
        const extensao = path.extname(relativo);
        if (extensao) {
            relativo = relativo.slice(0, -extensao.length);
        }
    }

    if (!relativo.startsWith('.')) {
        relativo = `./${relativo}`;
    }

    return relativo;
}
