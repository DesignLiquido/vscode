// @ts-nocheck
import { describe, it, expect, jest, beforeEach } from '@jest/globals';

jest.mock('vscode', () => ({
    CompletionItemKind: {
        Text: 0, Method: 1, Function: 2, Constructor: 3, Field: 4,
        Variable: 5, Class: 6, Interface: 7, Module: 8, Property: 9,
    },
    CompletionItem: class CompletionItem {
        constructor(public label, public kind) {}
        documentation = null;
        detail = '';
        insertText = null;
        sortText = '';
    },
    MarkdownString: class MarkdownString {
        constructor(public value) {}
    },
    SnippetString: class SnippetString {
        constructor(public value) {}
    },
    FileType: { Directory: 2 },
    Uri: { parse: (u) => u, file: (u) => u },
    workspace: { fs: {} },
}), { virtual: true });

jest.mock('@designliquido/delegua-lsp');

jest.mock('vscode-languageserver-types', () => ({
    InsertTextFormat: { PlainText: 1, Snippet: 2 },
}));

import { DeleguaProvedorCompletude } from '../../fontes/completude/delegua-provedor-completude';

function criarDocumento(texto = '') {
    return {
        uri: { toString: () => 'file:///test.delegua' },
        fileName: '/test.delegua',
        getText: jest.fn(() => texto),
        version: 1,
        languageId: 'delegua',
        offsetAt: jest.fn(() => texto.length),
    };
}

describe('completude/DeleguaProvedorCompletude', () => {
    let provedor;
    let lspMock;

    beforeEach(() => {
        jest.clearAllMocks();
        lspMock = jest.requireMock('@designliquido/delegua-lsp');
        lspMock.proverItensCompletude.mockReturnValue([]);
        provedor = new DeleguaProvedorCompletude();
    });

    it('cria instância do provedor', () => {
        expect(provedor).toBeDefined();
        expect(typeof provedor.provideCompletionItems).toBe('function');
    });

    it('retorna lista vazia quando LSP retorna vazio', () => {
        const resultado = provedor.provideCompletionItems(criarDocumento(), { line: 0, character: 0 }, {});
        expect(resultado).toEqual([]);
    });

    it('converte CompletionItem do LSP para vscode (kind com offset -1)', () => {
        // LSP CompletionItemKind.Variable = 6 → vscode.CompletionItemKind.Variable = 5
        lspMock.proverItensCompletude.mockReturnValue([
            { label: 'minhaVar', kind: 6 }
        ]);
        const resultado = provedor.provideCompletionItems(criarDocumento(), { line: 0, character: 0 }, {});
        expect(resultado.length).toBe(1);
        expect(resultado[0].label).toBe('minhaVar');
        expect(resultado[0].kind).toBe(5);
    });

    it('converte documentação MarkupContent para MarkdownString', () => {
        lspMock.proverItensCompletude.mockReturnValue([
            { label: 'escreva', kind: 3, documentation: { kind: 'markdown', value: 'Escreve na saída' } }
        ]);
        const resultado = provedor.provideCompletionItems(criarDocumento(), { line: 0, character: 0 }, {});
        expect(resultado[0].documentation.value).toBe('Escreve na saída');
    });

    it('converte insertText simples para string', () => {
        lspMock.proverItensCompletude.mockReturnValue([
            { label: 'escreva', insertText: 'escreva', insertTextFormat: 1 }
        ]);
        const resultado = provedor.provideCompletionItems(criarDocumento(), { line: 0, character: 0 }, {});
        expect(typeof resultado[0].insertText).toBe('string');
    });

    it('converte insertText snippet para SnippetString', () => {
        lspMock.proverItensCompletude.mockReturnValue([
            { label: 'escreva', insertText: 'escreva($0)', insertTextFormat: 2 }
        ]);
        const resultado = provedor.provideCompletionItems(criarDocumento(), { line: 0, character: 0 }, {});
        expect(resultado[0].insertText.value).toBe('escreva($0)');
    });

    it('passa documento e posição corretos para o LSP', () => {
        const doc = criarDocumento('variavel');
        provedor.provideCompletionItems(doc, { line: 0, character: 5 }, {});
        expect(lspMock.proverItensCompletude).toHaveBeenCalledWith(
            expect.objectContaining({ uri: 'file:///test.delegua', languageId: 'delegua' }),
            { line: 0, character: 5 }
        );
    });
});
