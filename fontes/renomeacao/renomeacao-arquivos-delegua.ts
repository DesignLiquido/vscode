import * as path from 'path';
import * as vscode from 'vscode';

import {
    calcularNovoCaminhoImportacao,
    ehArquivoDelegua,
    extrairCaminhoImportacao,
    resolverDestinoImportacao,
} from '../importacao/utilitarios-caminho-importacao-delegua';

function normalizarFsPath(caminho: string): string {
    return path.resolve(caminho).replace(/\\/g, '/').toLowerCase();
}

async function construirEdicoesRenomeacao(
    antigo: vscode.Uri,
    novo: vscode.Uri
): Promise<vscode.WorkspaceEdit> {
    const edicoes = new vscode.WorkspaceEdit();
    const arquivos = await vscode.workspace.findFiles('**/*.{delegua,egua}', '**/node_modules/**');
    const antigoNormalizado = normalizarFsPath(antigo.fsPath);

    for (const arquivo of arquivos) {
        const documento = await vscode.workspace.openTextDocument(arquivo);

        for (let indiceLinha = 0; indiceLinha < documento.lineCount; indiceLinha++) {
            const linha = documento.lineAt(indiceLinha).text;
            const importacao = extrairCaminhoImportacao(linha);
            if (!importacao) {
                continue;
            }

            const destino = await resolverDestinoImportacao(documento, importacao.caminho);
            if (!destino) {
                continue;
            }

            if (normalizarFsPath(destino.fsPath) !== antigoNormalizado) {
                continue;
            }

            const preservarExtensaoOriginal = Boolean(path.extname(importacao.caminho));
            const novoCaminho = calcularNovoCaminhoImportacao(
                documento.uri,
                novo,
                preservarExtensaoOriginal
            );

            const range = new vscode.Range(
                new vscode.Position(indiceLinha, importacao.inicio),
                new vscode.Position(indiceLinha, importacao.fim)
            );

            edicoes.replace(arquivo, range, novoCaminho);
        }
    }

    return edicoes;
}

export function registrarRenomeacaoArquivosDelegua(): vscode.Disposable {
    return vscode.workspace.onWillRenameFiles(evento => {
        const promessasEdicao = evento.files
            .filter(arquivo => ehArquivoDelegua(arquivo.oldUri) && ehArquivoDelegua(arquivo.newUri))
            .map(arquivo => construirEdicoesRenomeacao(arquivo.oldUri, arquivo.newUri));

        if (!promessasEdicao.length) {
            return;
        }

        evento.waitUntil(
            Promise.all(promessasEdicao).then(edicoes => {
                const consolidada = new vscode.WorkspaceEdit();

                for (const edicao of edicoes) {
                    for (const [uri, lista] of edicao.entries()) {
                        for (const item of lista) {
                            if (item.newText !== undefined) {
                                consolidada.replace(uri, item.range, item.newText);
                            }
                        }
                    }
                }

                return consolidada;
            })
        );
    });
}
