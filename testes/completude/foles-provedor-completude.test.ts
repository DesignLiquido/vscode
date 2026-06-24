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

jest.mock('@designliquido/foles/extensao/lista-modificadores', () => ({
    __esModule: true,
    default: {
        'alinhamento': { nomeCss: 'text-align' },
        'cor': { nomeCss: 'color' },
        'fundo': { nomeCss: 'background' },
        'margem': { nomeCss: 'margin' },
        'padding': { nomeCss: 'padding' },
    }
}));

import { FolesProvedorCompletude } from '../../fontes/completude/foles-provedor-completude';

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

describe('FolesProvedorCompletude', () => {
    let provedor: any;
    const mockToken: any = { isCancellationRequested: false };
    const mockContext: any = {};

    beforeEach(() => {
        jest.clearAllMocks();
        provedor = new FolesProvedorCompletude();
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

    describe('modificadores mockados', () => {
        it('inclui alinhamento', () => {
            const doc = criarDocumento(['']);
            const pos = criarPosicao(0, 0);
            const items = provedor.provideCompletionItems(doc, pos, mockToken, mockContext);
            expect(items.some((i: any) => i.label === 'alinhamento')).toBe(true);
        });

        it('inclui cor', () => {
            const doc = criarDocumento(['']);
            const pos = criarPosicao(0, 0);
            const items = provedor.provideCompletionItems(doc, pos, mockToken, mockContext);
            expect(items.some((i: any) => i.label === 'cor')).toBe(true);
        });

        it('inclui fundo', () => {
            const doc = criarDocumento(['']);
            const pos = criarPosicao(0, 0);
            const items = provedor.provideCompletionItems(doc, pos, mockToken, mockContext);
            expect(items.some((i: any) => i.label === 'fundo')).toBe(true);
        });

        it('inclui margem', () => {
            const doc = criarDocumento(['']);
            const pos = criarPosicao(0, 0);
            const items = provedor.provideCompletionItems(doc, pos, mockToken, mockContext);
            expect(items.some((i: any) => i.label === 'margem')).toBe(true);
        });

        it('inclui padding', () => {
            const doc = criarDocumento(['']);
            const pos = criarPosicao(0, 0);
            const items = provedor.provideCompletionItems(doc, pos, mockToken, mockContext);
            expect(items.some((i: any) => i.label === 'padding')).toBe(true);
        });
    });

    describe('contagem total de itens', () => {
        it('retorna todos os modificadores mockados', () => {
            const doc = criarDocumento(['']);
            const pos = criarPosicao(0, 0);
            const items = provedor.provideCompletionItems(doc, pos, mockToken, mockContext);
            expect(items.length).toBe(5);
        });
    });
});
