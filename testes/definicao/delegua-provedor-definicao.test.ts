// @ts-nocheck
import { describe, it, expect, jest, beforeEach } from '@jest/globals';

jest.mock('vscode', () => ({
    Location: class Location {
        constructor(public uri: any, public range: any) {}
    },
    Uri: {
        parse: (uri) => ({ toString: () => uri, _uri: uri }),
        file: (uri) => ({ toString: () => `file:///${uri}`, _uri: uri }),
    },
    Range: class Range {
        constructor(public startLine, public startChar, public endLine, public endChar) {}
    },
    FileType: { Directory: 2 },
    workspace: { fs: {} },
}), { virtual: true });

jest.mock('@designliquido/delegua-lsp', () => ({
    proverDefinicao: jest.fn().mockReturnValue(undefined),
    DocumentoLSP: undefined,
}), { virtual: true });

import { DeleguaProvedorDefinicao } from '../../fontes/definicao/delegua-provedor-definicao';

function criarDocumento() {
    return {
        uri: { toString: () => 'file:///test.delegua' },
        fileName: '/test.delegua',
        getText: jest.fn(() => 'escreva(variavel)'),
        version: 1,
        languageId: 'delegua',
    };
}

describe('definicao/DeleguaProvedorDefinicao', () => {
    let provedor;
    let lspMock;

    beforeEach(() => {
        jest.clearAllMocks();
        lspMock = jest.requireMock('@designliquido/delegua-lsp');
        lspMock.proverDefinicao.mockReturnValue(undefined);
        provedor = new DeleguaProvedorDefinicao();
    });

    it('retorna undefined quando LSP retorna undefined', () => {
        const resultado = provedor.provideDefinition(criarDocumento(), { line: 0, character: 5 }, {});
        expect(resultado).toBeUndefined();
    });

    it('converte Location do LSP para vscode.Location', () => {
        lspMock.proverDefinicao.mockReturnValue({
            uri: 'file:///definicao.delegua',
            range: {
                start: { line: 2, character: 4 },
                end: { line: 2, character: 12 },
            },
        });

        const resultado = provedor.provideDefinition(criarDocumento(), { line: 0, character: 5 }, {});
        expect(resultado).toBeDefined();
        expect(resultado.uri._uri).toBe('file:///definicao.delegua');
    });

    it('passa documento e posição corretos para o LSP', () => {
        const doc = criarDocumento();
        provedor.provideDefinition(doc, { line: 1, character: 3 }, {});
        expect(lspMock.proverDefinicao).toHaveBeenCalledWith(
            expect.objectContaining({ uri: 'file:///test.delegua', languageId: 'delegua' }),
            { line: 1, character: 3 },
            expect.anything()
        );
    });
});
