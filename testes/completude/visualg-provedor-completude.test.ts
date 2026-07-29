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

jest.mock('../../fontes/bibliotecas/dialetos/visualg', () => ({
    primitivasNumeroVisuAlg: [
        { nome: 'abs', documentacao: 'Retorna o valor absoluto' },
        { nome: 'sqrt', documentacao: 'Retorna a raiz quadrada' },
    ],
    primitivasCaracteresVisuAlg: [
        { nome: 'maiusc', documentacao: 'Converte para maiúsculas' },
        { nome: 'minusc', documentacao: 'Converte para minúsculas' },
    ],
    primitivasEntradaSaidaVisuAlg: [
        { nome: 'escreva', documentacao: 'Escreve na saída' },
        { nome: 'leia', documentacao: 'Lê da entrada' },
    ],
}));

import { VisuAlgProvedorCompletude } from '../../fontes/completude/visualg-provedor-completude';

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

describe('VisuAlgProvedorCompletude', () => {
    let provedor: any;
    const mockToken: any = { isCancellationRequested: false };
    const mockContext: any = {};

    beforeEach(() => {
        jest.clearAllMocks();
        provedor = new VisuAlgProvedorCompletude();
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

    it('todos os itens são do tipo Function', () => {
        const doc = criarDocumento(['']);
        const pos = criarPosicao(0, 0);
        const items = provedor.provideCompletionItems(doc, pos, mockToken, mockContext);
        items.forEach((item: any) => {
            expect(item.kind).toBe(vscode.CompletionItemKind.Function);
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

    describe('primitivas numéricas', () => {
        it('inclui abs', () => {
            const doc = criarDocumento(['']);
            const pos = criarPosicao(0, 0);
            const items = provedor.provideCompletionItems(doc, pos, mockToken, mockContext);
            expect(items.some((i: any) => i.label === 'abs')).toBe(true);
        });

        it('inclui sqrt', () => {
            const doc = criarDocumento(['']);
            const pos = criarPosicao(0, 0);
            const items = provedor.provideCompletionItems(doc, pos, mockToken, mockContext);
            expect(items.some((i: any) => i.label === 'sqrt')).toBe(true);
        });

        it('abs tem documentação correta', () => {
            const doc = criarDocumento(['']);
            const pos = criarPosicao(0, 0);
            const items = provedor.provideCompletionItems(doc, pos, mockToken, mockContext);
            const abs = items.find((i: any) => i.label === 'abs');
            expect(abs.documentation).toBe('Retorna o valor absoluto');
        });
    });

    describe('primitivas de caracteres', () => {
        it('inclui maiusc', () => {
            const doc = criarDocumento(['']);
            const pos = criarPosicao(0, 0);
            const items = provedor.provideCompletionItems(doc, pos, mockToken, mockContext);
            expect(items.some((i: any) => i.label === 'maiusc')).toBe(true);
        });

        it('inclui minusc', () => {
            const doc = criarDocumento(['']);
            const pos = criarPosicao(0, 0);
            const items = provedor.provideCompletionItems(doc, pos, mockToken, mockContext);
            expect(items.some((i: any) => i.label === 'minusc')).toBe(true);
        });
    });

    describe('primitivas de entrada/saída', () => {
        it('inclui escreva', () => {
            const doc = criarDocumento(['']);
            const pos = criarPosicao(0, 0);
            const items = provedor.provideCompletionItems(doc, pos, mockToken, mockContext);
            expect(items.some((i: any) => i.label === 'escreva')).toBe(true);
        });

        it('inclui leia', () => {
            const doc = criarDocumento(['']);
            const pos = criarPosicao(0, 0);
            const items = provedor.provideCompletionItems(doc, pos, mockToken, mockContext);
            expect(items.some((i: any) => i.label === 'leia')).toBe(true);
        });
    });

    describe('contagem total de itens', () => {
        it('retorna 2 numéricas + 2 caracteres + 2 entrada/saída = 6', () => {
            const doc = criarDocumento(['']);
            const pos = criarPosicao(0, 0);
            const items = provedor.provideCompletionItems(doc, pos, mockToken, mockContext);
            expect(items.length).toBe(6);
        });
    });
});
