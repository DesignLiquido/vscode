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

jest.mock('@designliquido/foles/estruturas/dicionario-estruturas-lmht', () => ({
    DicionarioEstruturasLmht: {
        'divisao': class { tagHtml = 'div'; },
        'paragrafo': class { tagHtml = 'p'; },
        'lmht': class { tagHtml = 'html'; },
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

    describe('nível raiz (fora de bloco)', () => {
        it('retorna apenas seletores LMHT na raiz', () => {
            const doc = criarDocumento(['']);
            const pos = criarPosicao(0, 0);
            const items = provedor.provideCompletionItems(doc, pos, mockToken, mockContext);
            expect(Array.isArray(items)).toBe(true);
            expect(items.length).toBe(3); // 3 tags LMHT mockadas
        });

        it('seletores LMHT são do tipo Interface', () => {
            const doc = criarDocumento(['']);
            const pos = criarPosicao(0, 0);
            const items = provedor.provideCompletionItems(doc, pos, mockToken, mockContext);
            items.forEach((item: any) => {
                expect(item.kind).toBe(vscode.CompletionItemKind.Interface);
            });
        });

        it('inclui seletor divisao na raiz', () => {
            const doc = criarDocumento(['']);
            const pos = criarPosicao(0, 0);
            const items = provedor.provideCompletionItems(doc, pos, mockToken, mockContext);
            expect(items.some((i: any) => i.label === 'divisao')).toBe(true);
        });

        it('inclui seletor lmht na raiz', () => {
            const doc = criarDocumento(['']);
            const pos = criarPosicao(0, 0);
            const items = provedor.provideCompletionItems(doc, pos, mockToken, mockContext);
            expect(items.some((i: any) => i.label === 'lmht')).toBe(true);
        });

        it('não inclui modificadores na raiz', () => {
            const doc = criarDocumento(['']);
            const pos = criarPosicao(0, 0);
            const items = provedor.provideCompletionItems(doc, pos, mockToken, mockContext);
            expect(items.some((i: any) => i.kind === vscode.CompletionItemKind.Property)).toBe(false);
        });

        it('retorna apenas seletores LMHT após fechar bloco', () => {
            const doc = criarDocumento(['.classe {', '    cor: red;', '}', '']);
            const pos = criarPosicao(3, 0);
            const items = provedor.provideCompletionItems(doc, pos, mockToken, mockContext);
            expect(items.length).toBe(3);
            expect(items.every((i: any) => i.kind === vscode.CompletionItemKind.Interface)).toBe(true);
        });
    });

    describe('dentro de um bloco seletor', () => {
        it('retorna seletores LMHT e modificadores', () => {
            const doc = criarDocumento(['.classe {', '    ', '}']);
            const pos = criarPosicao(1, 4);
            const items = provedor.provideCompletionItems(doc, pos, mockToken, mockContext);
            expect(items.length).toBe(8); // 3 LMHT + 5 modificadores
        });

        it('inclui itens do tipo Interface (seletores LMHT)', () => {
            const doc = criarDocumento(['.classe {', '    ', '}']);
            const pos = criarPosicao(1, 4);
            const items = provedor.provideCompletionItems(doc, pos, mockToken, mockContext);
            expect(items.some((i: any) => i.kind === vscode.CompletionItemKind.Interface)).toBe(true);
        });

        it('inclui itens do tipo Property (modificadores)', () => {
            const doc = criarDocumento(['.classe {', '    ', '}']);
            const pos = criarPosicao(1, 4);
            const items = provedor.provideCompletionItems(doc, pos, mockToken, mockContext);
            expect(items.some((i: any) => i.kind === vscode.CompletionItemKind.Property)).toBe(true);
        });

        it('todos os itens têm label definido', () => {
            const doc = criarDocumento(['.classe {', '    ', '}']);
            const pos = criarPosicao(1, 4);
            const items = provedor.provideCompletionItems(doc, pos, mockToken, mockContext);
            items.forEach((item: any) => {
                expect(item.label).toBeDefined();
                expect(typeof item.label).toBe('string');
            });
        });

        it('todos os itens têm documentação', () => {
            const doc = criarDocumento(['.classe {', '    ', '}']);
            const pos = criarPosicao(1, 4);
            const items = provedor.provideCompletionItems(doc, pos, mockToken, mockContext);
            items.forEach((item: any) => {
                expect(item.documentation).toBeDefined();
            });
        });

        describe('modificadores mockados', () => {
            it('inclui alinhamento', () => {
                const doc = criarDocumento(['.classe {', '    ', '}']);
                const pos = criarPosicao(1, 4);
                const items = provedor.provideCompletionItems(doc, pos, mockToken, mockContext);
                expect(items.some((i: any) => i.label === 'alinhamento')).toBe(true);
            });

            it('inclui cor', () => {
                const doc = criarDocumento(['.classe {', '    ', '}']);
                const pos = criarPosicao(1, 4);
                const items = provedor.provideCompletionItems(doc, pos, mockToken, mockContext);
                expect(items.some((i: any) => i.label === 'cor')).toBe(true);
            });

            it('inclui fundo', () => {
                const doc = criarDocumento(['.classe {', '    ', '}']);
                const pos = criarPosicao(1, 4);
                const items = provedor.provideCompletionItems(doc, pos, mockToken, mockContext);
                expect(items.some((i: any) => i.label === 'fundo')).toBe(true);
            });

            it('inclui margem', () => {
                const doc = criarDocumento(['.classe {', '    ', '}']);
                const pos = criarPosicao(1, 4);
                const items = provedor.provideCompletionItems(doc, pos, mockToken, mockContext);
                expect(items.some((i: any) => i.label === 'margem')).toBe(true);
            });

            it('inclui padding', () => {
                const doc = criarDocumento(['.classe {', '    ', '}']);
                const pos = criarPosicao(1, 4);
                const items = provedor.provideCompletionItems(doc, pos, mockToken, mockContext);
                expect(items.some((i: any) => i.label === 'padding')).toBe(true);
            });
        });
    });
});
