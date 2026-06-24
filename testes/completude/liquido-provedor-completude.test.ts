// @ts-nocheck
import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import * as vscode from 'vscode';

jest.mock('vscode', () => ({
    CompletionItemKind: {
        Property: 9,
        Function: 2,
        Interface: 7,
    },
    CompletionItem: class CompletionItem {
        constructor(public label: string, public kind?: number) {}
        documentation: any;
    },
}), { virtual: true });

import { LiquidoProvedorCompletude } from '../../fontes/completude/liquido-provedor-completude';

function criarDocumento(texto: string): any {
    return {
        lineAt: jest.fn(() => ({ text: texto })),
        getText: jest.fn(() => texto),
    };
}

function criarPosicao(line = 0, character = 0): any {
    return { line, character };
}

describe('LiquidoProvedorCompletude', () => {
    let provedor: any;
    const mockToken: any = { isCancellationRequested: false };
    const mockContext: any = {};

    beforeEach(() => {
        jest.clearAllMocks();
        provedor = new LiquidoProvedorCompletude();
    });

    it('instância criada com sucesso', () => {
        expect(provedor).toBeDefined();
        expect(typeof provedor.provideCompletionItems).toBe('function');
    });

    describe('quando texto é "liquido."', () => {
        it('retorna array de completion items', () => {
            const doc = criarDocumento('liquido.');
            const pos = criarPosicao(0, 8);
            const items = provedor.provideCompletionItems(doc, pos, mockToken, mockContext);
            expect(Array.isArray(items)).toBe(true);
            expect(items.length).toBeGreaterThan(0);
        });

        it('retorna exatamente um item', () => {
            const doc = criarDocumento('liquido.');
            const pos = criarPosicao(0, 8);
            const items = provedor.provideCompletionItems(doc, pos, mockToken, mockContext);
            expect(items.length).toBe(1);
        });

        it('item é "roteador"', () => {
            const doc = criarDocumento('liquido.');
            const pos = criarPosicao(0, 8);
            const items = provedor.provideCompletionItems(doc, pos, mockToken, mockContext);
            expect(items[0].label).toBe('roteador');
        });

        it('"roteador" é do tipo Interface', () => {
            const doc = criarDocumento('liquido.');
            const pos = criarPosicao(0, 8);
            const items = provedor.provideCompletionItems(doc, pos, mockToken, mockContext);
            expect(items[0].kind).toBe(vscode.CompletionItemKind.Interface);
        });

        it('chama lineAt com a posição correta', () => {
            const doc = criarDocumento('liquido.');
            const pos = criarPosicao(0, 8);
            provedor.provideCompletionItems(doc, pos, mockToken, mockContext);
            expect(doc.lineAt).toHaveBeenCalledWith(pos);
        });
    });

    describe('quando texto não é "liquido."', () => {
        it('retorna undefined para texto diferente', () => {
            const doc = criarDocumento('outro texto');
            const pos = criarPosicao(0, 11);
            const items = provedor.provideCompletionItems(doc, pos, mockToken, mockContext);
            expect(items).toBeUndefined();
        });

        it('retorna undefined para texto vazio', () => {
            const doc = criarDocumento('');
            const pos = criarPosicao(0, 0);
            const items = provedor.provideCompletionItems(doc, pos, mockToken, mockContext);
            expect(items).toBeUndefined();
        });

        it('retorna undefined para prefixo parcial "liquido"', () => {
            const doc = criarDocumento('liquido');
            const pos = criarPosicao(0, 7);
            const items = provedor.provideCompletionItems(doc, pos, mockToken, mockContext);
            expect(items).toBeUndefined();
        });
    });
});
