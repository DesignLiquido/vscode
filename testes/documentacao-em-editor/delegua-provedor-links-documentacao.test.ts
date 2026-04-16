// @ts-nocheck
import { beforeEach, describe, expect, it, jest } from '@jest/globals';

const statMock = jest.fn();
const getWorkspaceFolderMock = jest.fn();

function criarUri(path: string) {
    return {
        path,
        toString: () => path,
        with: ({ path: novoPath }: { path: string }) => criarUri(novoPath)
    };
}

jest.mock('vscode', () => ({
    Position: class Position {
        constructor(public line: number, public character: number) {}
    },
    Range: class Range {
        constructor(public start: any, public end: any) {}
    },
    DocumentLink: class DocumentLink {
        constructor(public range: any, public target?: any) {}
    },
    Uri: {
        joinPath: jest.fn((base: any, ...segmentos: string[]) => {
            const caminhoBase = base.path.replace(/\/$/, '');
            return criarUri(`${caminhoBase}/${segmentos.join('/')}`);
        })
    },
    workspace: {
        fs: {
            stat: statMock
        },
        getWorkspaceFolder: getWorkspaceFolderMock,
        workspaceFolders: []
    }
}), { virtual: true });

import * as vscode from 'vscode';
import { DeleguaProvedorLinksDocumentacao } from '../../fontes/documentacao-em-editor/delegua-provedor-links-documentacao';

function criarDocumento(linhas: string[], uri = criarUri('/workspace/fontes/arquivo.delegua')): any {
    return {
        uri,
        lineCount: linhas.length,
        lineAt: jest.fn((indice: number) => ({ text: linhas[indice] }))
    };
}

describe('DeleguaProvedorLinksDocumentacao', () => {
    let provedor: DeleguaProvedorLinksDocumentacao;

    beforeEach(() => {
        jest.clearAllMocks();
        provedor = new DeleguaProvedorLinksDocumentacao();
        (vscode.workspace.workspaceFolders as any) = [
            { uri: criarUri('/workspace') }
        ];
        getWorkspaceFolderMock.mockReturnValue({ uri: criarUri('/workspace') });
    });

    it('resolve caminho relativo em @veja dentro de documentário', async () => {
        statMock.mockImplementation(async (uri: any) => {
            if (uri.path === '/workspace/exemplos/saudacao.delegua') {
                return {};
            }

            throw new Error('nao encontrado');
        });

        const documento = criarDocumento([
            '/**',
            ' * @veja ../exemplos/saudacao.delegua',
            ' */'
        ]);

        const links = await provedor.provideDocumentLinks(documento);
        expect(links).toHaveLength(1);
        expect(links[0].target.path).toBe('/workspace/exemplos/saudacao.delegua');
        expect(links[0].range.start.line).toBe(1);
    });

    it('resolve alias em inglês @see usando caminho relativo', async () => {
        statMock.mockImplementation(async (uri: any) => {
            if (uri.path === '/workspace/fontes/exemplos/arquivo.delegua') {
                return {};
            }

            throw new Error('nao encontrado');
        });

        const documento = criarDocumento([
            '/**',
            ' * @see ./exemplos/arquivo.delegua',
            ' */'
        ]);

        const links = await provedor.provideDocumentLinks(documento);
        expect(links).toHaveLength(1);
        expect(links[0].target.path).toBe('/workspace/fontes/exemplos/arquivo.delegua');
    });

    it('ignora referências fora de comentário documentário', async () => {
        statMock.mockResolvedValue({});
        const documento = criarDocumento([
            '// @veja exemplos/arquivo.delegua'
        ]);

        const links = await provedor.provideDocumentLinks(documento);
        expect(links).toHaveLength(0);
    });
});