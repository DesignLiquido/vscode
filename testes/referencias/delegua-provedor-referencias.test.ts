// @ts-nocheck
import { describe, it, expect, jest, beforeEach } from '@jest/globals';

jest.mock('vscode', () => ({
    Location: class Location {
        constructor(public uri, public range) {}
    },
    Uri: {
        parse: (uri) => ({ _uri: uri, toString: () => uri }),
        file: (uri) => ({ _uri: uri, toString: () => `file:///${uri}` }),
    },
    Range: class Range {
        constructor(public startLine, public startChar, public endLine, public endChar) {}
    },
    FileType: { Directory: 2 },
    workspace: {
        workspaceFolders: [{ uri: { fsPath: '/workspace' } }],
        fs: {},
    },
}), { virtual: true });

jest.mock('@designliquido/delegua-lsp', () => ({
    proverReferencias: jest.fn().mockResolvedValue([]),
    DocumentoLSP: undefined,
}), { virtual: true });

import { DeleguaProvedorReferencias } from '../../fontes/referencias/delegua-provedor-referencias';

function criarDocumento() {
    return {
        uri: { toString: () => 'file:///test.delegua' },
        fileName: '/test.delegua',
        getText: jest.fn(() => 'variavel = 1'),
        version: 1,
        languageId: 'delegua',
    };
}

describe('referencias/DeleguaProvedorReferencias', () => {
    let provedor;
    let lspMock;

    beforeEach(() => {
        jest.clearAllMocks();
        lspMock = jest.requireMock('@designliquido/delegua-lsp');
        lspMock.proverReferencias.mockResolvedValue([]);
        provedor = new DeleguaProvedorReferencias();
    });

    it('retorna lista vazia quando LSP retorna vazio', async () => {
        const resultado = await provedor.provideReferences(criarDocumento(), { line: 0, character: 0 }, { includeDeclaration: true }, {});
        expect(resultado).toEqual([]);
    });

    it('converte Location[] do LSP para vscode.Location[]', async () => {
        lspMock.proverReferencias.mockResolvedValue([
            {
                uri: 'file:///a.delegua',
                range: { start: { line: 0, character: 0 }, end: { line: 0, character: 8 } },
            },
            {
                uri: 'file:///b.delegua',
                range: { start: { line: 2, character: 4 }, end: { line: 2, character: 12 } },
            },
        ]);

        const resultado = await provedor.provideReferences(criarDocumento(), { line: 0, character: 0 }, { includeDeclaration: true }, {});
        expect(resultado.length).toBe(2);
        expect(resultado[0].uri._uri).toBe('file:///a.delegua');
        expect(resultado[1].uri._uri).toBe('file:///b.delegua');
    });

    it('passa includeDeclaration e pastaWorkspace para o LSP', async () => {
        await provedor.provideReferences(criarDocumento(), { line: 0, character: 5 }, { includeDeclaration: false }, {});
        expect(lspMock.proverReferencias).toHaveBeenCalledWith(
            expect.objectContaining({ uri: 'file:///test.delegua' }),
            { line: 0, character: 5 },
            false,
            '/workspace',
            expect.anything()
        );
    });
});
