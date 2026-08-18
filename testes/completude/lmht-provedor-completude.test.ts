// @ts-nocheck
import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import * as vscode from 'vscode';

jest.mock('vscode', () => ({
    CompletionItemKind: {
        Property: 9,
        Function: 2,
        Interface: 7,
        Field: 4,
    },
    CompletionItem: class CompletionItem {
        constructor(public label: string, public kind?: number) {}
        documentation: any;
        insertText: any;
    },
    SnippetString: class SnippetString {
        constructor(public value: string) {}
    },
    MarkdownString: class MarkdownString {
        constructor(public value: string = '') {}
    },
    Position: class Position {
        constructor(public line: number, public character: number) {}
    },
    Range: class Range {
        constructor(public start: any, public end: any) {}
    },
}), { virtual: true });

jest.mock('../../fontes/linguagens/lmht/estruturas', () => ({
    __esModule: true,
    default: {
        'paragrafo': { nomeHtml: 'p' },
        'divisao': { nomeHtml: 'div' },
        'titulo1': { nomeHtml: 'h1' },
        'ancora': { nomeHtml: 'a' },
        'imagem': { nomeHtml: 'img' },
        'conteudo': { nomeHtml: '(nenhum)' },
    }
}));

jest.mock('../../fontes/linguagens/lmht/atributos', () => ({
    __esModule: true,
    default: {
        'classe': { nomeHtml: 'class' },
        'id': { nomeHtml: 'id' },
        'fonte': { nomeHtml: 'src' },
    }
}));

import { LmhtProvedorCompletude } from '../../fontes/completude/lmht-provedor-completude';

/**
 * Documento simulado. `getText(range)` devolve o texto do início até o fim
 * do range, replicando o comportamento usado pelo provedor para analisar o
 * contexto do cursor.
 */
function criarDocumento(linhas: string[] = ['']): any {
    const texto = linhas.join('\n');
    return {
        getText: jest.fn((range?: any) => {
            if (!range) {
                return texto;
            }
            let offset = 0;
            for (let i = 0; i < range.end.line; i++) {
                offset += linhas[i].length + 1;
            }
            offset += range.end.character;
            return texto.substring(0, offset);
        }),
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

    describe('contexto de estruturas', () => {
        it('sugere estruturas fora de qualquer tag', () => {
            const items = provedor.provideCompletionItems(
                criarDocumento(['']), criarPosicao(0, 0), mockToken, mockContext
            );
            expect(Array.isArray(items)).toBe(true);
            expect(items.length).toBe(6);
            expect(items.some((i: any) => i.label === 'paragrafo')).toBe(true);
            expect(items.some((i: any) => i.label === 'titulo1')).toBe(true);
        });

        it('sugere estruturas após o fechamento de uma tag', () => {
            const doc = criarDocumento(['<corpo>']);
            const items = provedor.provideCompletionItems(doc, criarPosicao(0, 7), mockToken, mockContext);
            expect(items.length).toBe(6);
        });

        it('insere estrutura como par de abertura e fechamento com cursor no meio', () => {
            const doc = criarDocumento(['<corpo>']);
            const items = provedor.provideCompletionItems(doc, criarPosicao(0, 7), mockToken, mockContext);
            const titulo1 = items.find((i: any) => i.label === 'titulo1');
            expect(titulo1.insertText.value).toBe('<titulo1>$0</titulo1>');
        });

        it('insere estrutura vazia (void) sem tag de fechamento', () => {
            const doc = criarDocumento(['<corpo>']);
            const items = provedor.provideCompletionItems(doc, criarPosicao(0, 7), mockToken, mockContext);
            const imagem = items.find((i: any) => i.label === 'imagem');
            expect(imagem.insertText.value).toBe('<imagem $0/>');
        });

        it('insere <conteudo /> como marcador auto-fechante (sem tag de fechamento)', () => {
            const doc = criarDocumento(['<corpo>']);
            const items = provedor.provideCompletionItems(doc, criarPosicao(0, 7), mockToken, mockContext);
            const conteudo = items.find((i: any) => i.label === 'conteudo');
            expect(conteudo.insertText.value).toBe('<conteudo $0/>');
        });

        it('todos os itens de estrutura têm label, documentação e insertText', () => {
            const items = provedor.provideCompletionItems(
                criarDocumento(['']), criarPosicao(0, 0), mockToken, mockContext
            );
            items.forEach((item: any) => {
                expect(typeof item.label).toBe('string');
                expect(item.documentation).toBeDefined();
                expect(item.insertText).toBeDefined();
            });
        });
    });

    describe('contexto de atributos', () => {
        it('sugere atributos dentro da abertura de uma tag', () => {
            const doc = criarDocumento(['<imagem ']);
            const items = provedor.provideCompletionItems(doc, criarPosicao(0, 8), mockToken, mockContext);
            expect(items.length).toBe(3);
            expect(items.some((i: any) => i.label === 'classe')).toBe(true);
            expect(items.some((i: any) => i.label === 'fonte')).toBe(true);
            // Não deve sugerir estruturas aqui.
            expect(items.some((i: any) => i.label === 'paragrafo')).toBe(false);
        });

        it('insere atributo com aspas e cursor entre elas', () => {
            const doc = criarDocumento(['<imagem ']);
            const items = provedor.provideCompletionItems(doc, criarPosicao(0, 8), mockToken, mockContext);
            const classe = items.find((i: any) => i.label === 'classe');
            expect(classe.insertText.value).toBe('classe="$0"');
        });
    });

    describe('contexto de comentário', () => {
        it('não sugere nada dentro de um comentário', () => {
            const doc = criarDocumento(['<!-- ']);
            const items = provedor.provideCompletionItems(doc, criarPosicao(0, 5), mockToken, mockContext);
            expect(items).toEqual([]);
        });

        it('volta a sugerir estruturas após o fechamento do comentário', () => {
            const doc = criarDocumento(['<!-- nota --> ']);
            const items = provedor.provideCompletionItems(doc, criarPosicao(0, 14), mockToken, mockContext);
            expect(items.length).toBe(6);
        });
    });
});
