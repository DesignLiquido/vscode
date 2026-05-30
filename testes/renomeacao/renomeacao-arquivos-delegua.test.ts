// @ts-nocheck
import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import * as vscode from 'vscode';

let callbackRenomeacao: any;
let arquivosEncontrados: any[] = [];
const documentos = new Map<string, any>();

jest.mock('vscode', () => ({
    Position: class Position {
        constructor(public line: number, public character: number) {}
    },
    Range: class Range {
        constructor(public start: any, public end: any) {}
    },
    WorkspaceEdit: class WorkspaceEditMock {
        private mudancas = new Map<any, any[]>();

        replace(uri: any, range: any, newText: string) {
            if (!this.mudancas.has(uri)) {
                this.mudancas.set(uri, []);
            }

            this.mudancas.get(uri).push({ range, newText });
        }

        entries() {
            return Array.from(this.mudancas.entries());
        }
    },
    Uri: {
        joinPath: jest.fn((base: any, ...partes: string[]) => ({
            fsPath: `${base.fsPath}/${partes.join('/')}`.replace(/\\/g, '/'),
            path: `${base.path || base.fsPath}/${partes.join('/')}`.replace(/\\/g, '/'),
            toString: () => `file://${(`${base.fsPath}/${partes.join('/')}`).replace(/\\/g, '/')}`,
            with: function (valor: any) {
                return {
                    ...this,
                    ...valor,
                    fsPath: (valor.path || this.path).replace(/\\/g, '/'),
                    toString: () => `file://${(valor.path || this.path).replace(/\\/g, '/')}`,
                };
            },
        })),
    },
    workspace: {
        onWillRenameFiles: jest.fn(),
        findFiles: jest.fn(),
        openTextDocument: jest.fn(),
        getWorkspaceFolder: jest.fn(),
        workspaceFolders: [
            {
                uri: {
                    fsPath: '/workspace',
                    path: '/workspace',
                    toString: () => 'file:///workspace',
                },
            },
        ],
        fs: {
            stat: jest.fn(async () => ({ type: 0 })),
        },
    },
}), { virtual: true });

import { registrarRenomeacaoArquivosDelegua } from '../../fontes/renomeacao/renomeacao-arquivos-delegua';

function criarDocumento(uriPath: string, linhas: string[]): any {
    const uri = {
        fsPath: uriPath,
        path: uriPath,
        toString: () => `file://${uriPath}`,
        with: function (valor: any) {
            return {
                ...this,
                ...valor,
                fsPath: (valor.path || this.path).replace(/\\/g, '/'),
                toString: () => `file://${(valor.path || this.path).replace(/\\/g, '/')}`,
            };
        },
    };

    return {
        uri,
        lineCount: linhas.length,
        lineAt: (indice: number) => ({ text: linhas[indice] }),
    };
}

describe('renomeacao/renomeacao-arquivos-delegua', () => {
    beforeEach(() => {
        callbackRenomeacao = undefined;
        arquivosEncontrados = [];
        documentos.clear();
        jest.clearAllMocks();

        (vscode.workspace.onWillRenameFiles as jest.Mock).mockImplementation((cb: any) => {
            callbackRenomeacao = cb;
            return { dispose: jest.fn() };
        });
        (vscode.workspace.findFiles as jest.Mock).mockImplementation(async () => arquivosEncontrados);
        (vscode.workspace.openTextDocument as jest.Mock).mockImplementation(async (uri: any) =>
            documentos.get(uri.fsPath)
        );
        (vscode.workspace.getWorkspaceFolder as jest.Mock).mockImplementation(() => ({
            uri: {
                fsPath: '/workspace',
                path: '/workspace',
                toString: () => 'file:///workspace',
            },
        }));
    });

    it('registra callback de renomeação', () => {
        registrarRenomeacaoArquivosDelegua();
        expect(vscode.workspace.onWillRenameFiles).toHaveBeenCalledTimes(1);
        expect(callbackRenomeacao).toBeDefined();
    });

    it('atualiza caminho de importação ao renomear arquivo delegua', async () => {
        registrarRenomeacaoArquivosDelegua();

        const arquivoPrincipal = {
            fsPath: '/workspace/app/main.delegua',
            path: '/workspace/app/main.delegua',
            toString: () => 'file:///workspace/app/main.delegua',
        };

        arquivosEncontrados = [arquivoPrincipal];
        documentos.set(
            '/workspace/app/main.delegua',
            criarDocumento('/workspace/app/main.delegua', ["importar { x } de './modulo-antigo.delegua'"])
        );

        let promessa: Promise<any> | undefined;
        callbackRenomeacao({
            files: [
                {
                    oldUri: { fsPath: '/workspace/app/modulo-antigo.delegua', path: '/workspace/app/modulo-antigo.delegua' },
                    newUri: { fsPath: '/workspace/app/modulo-novo.delegua', path: '/workspace/app/modulo-novo.delegua' },
                },
            ],
            waitUntil: (p: Promise<any>) => {
                promessa = p;
            },
        });

        const edicao = await promessa;
        const entradas = edicao.entries();

        expect(entradas.length).toBe(1);
        expect(entradas[0][1][0].newText).toBe('./modulo-novo.delegua');
    });
});
