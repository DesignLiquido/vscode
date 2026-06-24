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

jest.mock('../../fontes/linguagens/lmht/estruturas', () => ({
    __esModule: true,
    default: {
        'paragrafo': { nomeHtml: 'p' },
        'divisao': { nomeHtml: 'div' },
        'titulo1': { nomeHtml: 'h1' },
        'ancora': { nomeHtml: 'a' },
    }
}));

import { LmhtProvedorCompletude } from '../../fontes/completude/lmht-provedor-completude';

function criarDocumento(linhas: string[] = ['']): any {
    return {
        lineAt: jest.fn((linha: any) => {
            const idx = typeof linha === 'number' ? linha : linha.line ?? 0;
            return { text: linhas[idx] ?? '' };
        }),
        getText: jest.fn(() => linhas.join('\n')),
    };
}

function criarPosicao(line = 0, character = 0): any {
    return { line, character };
}

describe('LmhtProvedorCompletude', () => {
    let provedor: any;
    const mockToken: any = { isCancellationRequested: false };
    const mockContext: any = {};

    beforeEach(() => {
        jest.clearAllMocks();
        provedor = new LmhtProvedorCompletude();
    });

    it('instância criada com sucesso', () => {
        expect(provedor).toBeDefined();
        expect(typeof provedor.provideCompletionItems).toBe('function');
    });

    it('retorna array de completion items', () => {
        const doc = criarDocumento(['']);
        const pos = criarPosicao(0, 0);
        const items = provedor.provideCompletionItems(doc, pos, mockToken, mockContext);
        expect(Array.isArray(items)).toBe(true);
        expect(items.length).toBeGreaterThan(0);
    });

    it('todos os itens têm label definido', () => {
        const doc = criarDocumento(['']);
        const pos = criarPosicao(0, 0);
        const items = provedor.provideCompletionItems(doc, pos, mockToken, mockContext);
        items.forEach((item: any) => {
            expect(item.label).toBeDefined();
            expect(typeof item.label).toBe('string');
        });
    });

    it('todos os itens são do tipo Property', () => {
        const doc = criarDocumento(['']);
        const pos = criarPosicao(0, 0);
        const items = provedor.provideCompletionItems(doc, pos, mockToken, mockContext);
        items.forEach((item: any) => {
            expect(item.kind).toBe(vscode.CompletionItemKind.Property);
        });
    });

    it('todos os itens têm documentação', () => {
        const doc = criarDocumento(['']);
        const pos = criarPosicao(0, 0);
        const items = provedor.provideCompletionItems(doc, pos, mockToken, mockContext);
        items.forEach((item: any) => {
            expect(item.documentation).toBeDefined();
        });
    });

    describe('estruturas mockadas', () => {
        it('inclui paragrafo', () => {
            const doc = criarDocumento(['']);
            const pos = criarPosicao(0, 0);
            const items = provedor.provideCompletionItems(doc, pos, mockToken, mockContext);
            expect(items.some((i: any) => i.label === 'paragrafo')).toBe(true);
        });

        it('inclui divisao', () => {
            const doc = criarDocumento(['']);
            const pos = criarPosicao(0, 0);
            const items = provedor.provideCompletionItems(doc, pos, mockToken, mockContext);
            expect(items.some((i: any) => i.label === 'divisao')).toBe(true);
        });

        it('inclui titulo1', () => {
            const doc = criarDocumento(['']);
            const pos = criarPosicao(0, 0);
            const items = provedor.provideCompletionItems(doc, pos, mockToken, mockContext);
            expect(items.some((i: any) => i.label === 'titulo1')).toBe(true);
        });

        it('inclui ancora', () => {
            const doc = criarDocumento(['']);
            const pos = criarPosicao(0, 0);
            const items = provedor.provideCompletionItems(doc, pos, mockToken, mockContext);
            expect(items.some((i: any) => i.label === 'ancora')).toBe(true);
        });
    });

    describe('contagem total de itens', () => {
        it('retorna todas as estruturas mockadas', () => {
            const doc = criarDocumento(['']);
            const pos = criarPosicao(0, 0);
            const items = provedor.provideCompletionItems(doc, pos, mockToken, mockContext);
            expect(items.length).toBe(4);
        });
    });
});
