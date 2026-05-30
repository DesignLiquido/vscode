// @ts-nocheck
import { describe, it, expect, jest, beforeEach } from '@jest/globals';

jest.mock('vscode', () => ({
    Range: class Range {
        constructor(public startLine, public startChar, public endLine, public endChar) {
            this.start = { line: startLine, character: startChar };
            this.end = { line: endLine, character: endChar };
        }
    },
    Uri: {
        parse: (uri) => ({ _uri: uri, toString: () => uri }),
    },
    WorkspaceEdit: class WorkspaceEdit {
        _edits = new Map();
        set(uri, edits) { this._edits.set(uri._uri || uri.toString(), edits); }
        allEdits() {
            const result = [];
            this._edits.forEach((edits) => result.push(...edits));
            return result;
        }
    },
    TextEdit: class TextEdit {
        constructor(public range, public newText) {}
    },
    workspace: {
        workspaceFolders: [{ uri: { fsPath: '/workspace' } }],
    },
}), { virtual: true });

jest.mock('@designliquido/delegua-lsp', () => ({
    prepareRename: jest.fn().mockReturnValue(undefined),
    provideRenameEdits: jest.fn().mockReturnValue(undefined),
    DocumentoLSP: undefined,
}), { virtual: true });

import { DeleguaProvedorRenomeacao } from '../../fontes/renomeacao/delegua-provedor-renomeacao';

function criarDocumento(texto = 'analisarCaractere') {
    return {
        uri: { toString: () => 'file:///test.delegua' },
        fileName: '/test.delegua',
        getText: jest.fn((range) => range
            ? texto.substring(range.start?.character ?? 0, range.end?.character ?? texto.length)
            : texto),
        version: 1,
        languageId: 'delegua',
    };
}

describe('renomeacao/DeleguaProvedorRenomeacao', () => {
    let provedor;
    let lspMock;

    beforeEach(() => {
        jest.clearAllMocks();
        lspMock = jest.requireMock('@designliquido/delegua-lsp');
        lspMock.prepareRename.mockReturnValue(undefined);
        lspMock.provideRenameEdits.mockReturnValue(undefined);
        provedor = new DeleguaProvedorRenomeacao();
    });

    describe('prepareRename', () => {
        it('retorna undefined quando LSP retorna undefined', () => {
            const resultado = provedor.prepareRename(criarDocumento(), { line: 0, character: 5 }, {});
            expect(resultado).toBeUndefined();
        });

        it('converte Range do LSP e extrai placeholder', () => {
            lspMock.prepareRename.mockReturnValue({
                start: { line: 0, character: 0 },
                end: { line: 0, character: 17 },
            });
            const resultado = provedor.prepareRename(criarDocumento('analisarCaractere'), { line: 0, character: 5 }, {});
            expect(resultado).toBeDefined();
            expect(resultado.placeholder).toBe('analisarCaractere');
        });
    });

    describe('provideRenameEdits', () => {
        it('lança erro para nome de identificador inválido', async () => {
            await expect(
                provedor.provideRenameEdits(criarDocumento(), { line: 0, character: 0 }, 'nome inválido', {})
            ).rejects.toThrow('inválido');
        });

        it('retorna undefined quando LSP retorna undefined', async () => {
            const resultado = await provedor.provideRenameEdits(criarDocumento(), { line: 0, character: 0 }, 'novoNome', {});
            expect(resultado).toBeUndefined();
        });

        it('converte WorkspaceEdit do LSP para vscode.WorkspaceEdit', async () => {
            lspMock.provideRenameEdits.mockReturnValue({
                changes: {
                    'file:///a.delegua': [
                        { range: { start: { line: 0, character: 0 }, end: { line: 0, character: 17 } }, newText: 'novoNome' },
                        { range: { start: { line: 1, character: 9 }, end: { line: 1, character: 26 } }, newText: 'novoNome' },
                    ],
                },
            });

            const resultado = await provedor.provideRenameEdits(criarDocumento(), { line: 0, character: 0 }, 'novoNome', {});
            expect(resultado).toBeDefined();
            const edicoes = resultado.allEdits();
            expect(edicoes.length).toBe(2);
            expect(edicoes[0].newText).toBe('novoNome');
        });

        it('passa posição, novo nome e pasta workspace para o LSP', async () => {
            lspMock.provideRenameEdits.mockReturnValue({ changes: {} });
            await provedor.provideRenameEdits(criarDocumento(), { line: 0, character: 5 }, 'novoIdentificador', {});
            expect(lspMock.provideRenameEdits).toHaveBeenCalledWith(
                expect.objectContaining({ uri: 'file:///test.delegua' }),
                { line: 0, character: 5 },
                'novoIdentificador',
                '/workspace'
            );
        });
    });
});
