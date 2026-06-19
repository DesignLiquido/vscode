// @ts-nocheck
import { describe, it, expect, jest, beforeEach } from '@jest/globals';

jest.mock('vscode', () => ({
    CompletionItemKind: {
        Text: 0, Method: 1, Function: 2, Constructor: 3, Field: 4,
        Variable: 5, Class: 6, Interface: 7, Module: 8, Property: 9,
    },
    CompletionItem: class CompletionItem {
        constructor(public label: any, public kind: any) {}
        documentation = null;
        detail = '';
        insertText = null;
        sortText = '';
    },
    MarkdownString: class MarkdownString {
        constructor(public value: any) {}
    },
    SnippetString: class SnippetString {
        constructor(public value: any) {}
    },
    FileType: { Directory: 2 },
    Uri: { parse: (u: any) => u, file: (u: any) => u },
    workspace: { fs: {} },
}), { virtual: true });

jest.mock('@designliquido/delegua-lsp', () => ({
    proverItensCompletude: jest.fn().mockReturnValue([]),
    DocumentoLSP: undefined,
}), { virtual: true });

jest.mock('vscode-languageserver-types', () => ({
    InsertTextFormat: { PlainText: 1, Snippet: 2 },
}), { virtual: true });

import { DeleguaTestesProvedorCompletude } from '../../fontes/completude/delegua-testes-provedor-completude';

describe('DeleguaTestesProvedorCompletude', () => {
    let provedor: any;

    beforeEach(() => {
        jest.clearAllMocks();
        provedor = new DeleguaTestesProvedorCompletude();
    });

    it('instância criada com sucesso', () => {
        expect(provedor).toBeDefined();
    });

    it('retorna completudes de afirmar quando texto termina com "afirmar."', () => {
        const resultado = provedor.completudesParaDelegua('afirmar.', 'afirmar', [], undefined);
        expect(Array.isArray(resultado)).toBe(true);
        expect(resultado.length).toBeGreaterThan(0);
    });

    it('retorna completudes de teste quando texto termina com "teste."', () => {
        const resultado = provedor.completudesParaDelegua('teste.', 'teste', [], undefined);
        expect(Array.isArray(resultado)).toBe(true);
        expect(resultado.length).toBeGreaterThan(0);
    });

    it('retorna completudes de grupo quando texto termina com "grupo."', () => {
        const resultado = provedor.completudesParaDelegua('grupo.', 'grupo', [], undefined);
        expect(Array.isArray(resultado)).toBe(true);
        expect(resultado.length).toBeGreaterThan(0);
    });

    it('chama super quando texto termina com "." mas palavra não é reconhecida', () => {
        const resultado = provedor.completudesParaDelegua('qualquer.', 'qualquer', [], undefined);
        expect(Array.isArray(resultado)).toBe(true);
    });

    it('retorna completudes globais incluindo módulo de testes quando texto não termina com "."', () => {
        const resultado = provedor.completudesParaDelegua('grupo(', null, [], undefined);
        expect(Array.isArray(resultado)).toBe(true);
        expect(resultado.length).toBeGreaterThan(0);
    });

    it('item de afirmar usa kind Module', () => {
        const resultado = provedor.completudesParaDelegua('afirmar.', 'afirmar', [], undefined);
        const itemAfirmar = resultado.find((r: any) => r.label === 'afirmar');
        if (itemAfirmar) {
            expect(itemAfirmar.kind).toBe(8);
        }
    });

    it('item com parâmetros tem insertText com snippet', () => {
        const resultado = provedor.completudesParaDelegua('afirmar.', 'afirmar', [], undefined);
        const itemComParams = resultado.find((r: any) => r.insertText !== null);
        expect(itemComParams).toBeDefined();
    });
});
