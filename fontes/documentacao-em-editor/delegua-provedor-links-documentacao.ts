import * as vscode from 'vscode';

import { ehEtiquetaVeja } from './etiquetas-documentarios';

function normalizarSeparadores(caminho: string): string {
    return caminho.replace(/\\/g, '/').trim();
}

function extrairCaminhoReferencia(linha: string): { caminho: string; inicio: number } | undefined {
    const correspondencia = linha.match(/(@[\w-]+)\s+(?:"([^"]+)"|'([^']+)'|<([^>]+)>|(\S+))/i);
    if (!correspondencia || !ehEtiquetaVeja(correspondencia[1])) {
        return undefined;
    }

    const caminho = correspondencia[2] ?? correspondencia[3] ?? correspondencia[4] ?? correspondencia[5];
    if (!caminho) {
        return undefined;
    }

    const inicio = linha.indexOf(caminho, correspondencia.index ?? 0);
    if (inicio < 0) {
        return undefined;
    }

    return { caminho, inicio };
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

async function uriExiste(uri: vscode.Uri): Promise<boolean> {
    try {
        await vscode.workspace.fs.stat(uri);
        return true;
    } catch {
        return false;
    }
}

function extrairCaminhoImportacao(linha: string): { caminho: string; inicio: number } | undefined {
    const correspondencia = linha.match(/\bde\s+(["'])([^"']+)\1/);
    if (!correspondencia) {
        return undefined;
    }

    const caminho = correspondencia[2];
    const inicio = linha.indexOf(correspondencia[1], (correspondencia.index ?? 0) + correspondencia[0].indexOf(correspondencia[1])) + 1;
    return { caminho, inicio };
}

async function resolverDestino(documento: vscode.TextDocument, caminhoOriginal: string): Promise<vscode.Uri | undefined> {
    const caminho = normalizarSeparadores(caminhoOriginal);
    if (!caminho) {
        return undefined;
    }

    if (caminho.startsWith('./') || caminho.startsWith('../')) {
        const uriRelativa = criarUriRelativa(documento.uri, caminho);
        if (await uriExiste(uriRelativa)) {
            return uriRelativa;
        }
    }

    const pastaAtual = vscode.workspace.getWorkspaceFolder(documento.uri);
    const pastas = pastaAtual ? [pastaAtual, ...(vscode.workspace.workspaceFolders || []).filter(p => p.uri.toString() !== pastaAtual.uri.toString())] : (vscode.workspace.workspaceFolders || []);
    for (const pasta of pastas) {
        const uri = vscode.Uri.joinPath(pasta.uri, ...caminho.split('/').filter(Boolean));
        if (await uriExiste(uri)) {
            return uri;
        }
    }

    return undefined;
}

export class DeleguaProvedorLinksDocumentacao implements vscode.DocumentLinkProvider {
    async provideDocumentLinks(documento: vscode.TextDocument): Promise<vscode.DocumentLink[]> {
        const links: vscode.DocumentLink[] = [];
        let emComentarioDocumentario = false;

        for (let indiceLinha = 0; indiceLinha < documento.lineCount; indiceLinha++) {
            const textoLinha = documento.lineAt(indiceLinha).text;
            if (textoLinha.includes('/**')) {
                emComentarioDocumentario = true;
            }

            if (emComentarioDocumentario) {
                const referencia = extrairCaminhoReferencia(textoLinha);
                if (referencia) {
                    const destino = await resolverDestino(documento, referencia.caminho);
                    if (destino) {
                        const range = new vscode.Range(
                            new vscode.Position(indiceLinha, referencia.inicio),
                            new vscode.Position(indiceLinha, referencia.inicio + referencia.caminho.length)
                        );
                        links.push(new vscode.DocumentLink(range, destino));
                    }
                }
            }

            if (textoLinha.includes('*/')) {
                emComentarioDocumentario = false;
            }

            if (!emComentarioDocumentario) {
                const importacao = extrairCaminhoImportacao(textoLinha);
                if (importacao) {
                    const destino = await resolverDestino(documento, importacao.caminho);
                    if (destino) {
                        const range = new vscode.Range(
                            new vscode.Position(indiceLinha, importacao.inicio),
                            new vscode.Position(indiceLinha, importacao.inicio + importacao.caminho.length)
                        );
                        links.push(new vscode.DocumentLink(range, destino));
                    }
                }
            }
        }

        return links;
    }
}