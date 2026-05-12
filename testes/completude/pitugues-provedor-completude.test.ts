// @ts-nocheck
import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import * as vscode from 'vscode';

jest.mock('vscode', () => ({
    CompletionItemKind: {
        Property: 9,
        Function: 2,
        Method: 1,
        Variable: 5,
        Interface: 7,
        Module: 8,
    },
    CompletionItem: class CompletionItem {
        constructor(public label: string, public kind?: number) {}
        documentation: any;
        detail: string;
        insertText: any;
    },
    MarkdownString: class MarkdownString {
        constructor(public value?: string) {}
    },
    SnippetString: class SnippetString {
        constructor(public value: string) {}
    },
}), { virtual: true });

jest.mock('../../fontes/bibliotecas/primitivas-liquido', () => ({
    primitivasMetodosLiquido: [
        { nome: 'rotaGet', documentacao: 'Define rota GET' },
        { nome: 'rotaPost', documentacao: 'Define rota POST' },
    ],
    objetosEmRotaLiquido: [
        { nome: 'requisicao', documentacao: 'Objeto de requisição' },
        { nome: 'resposta', documentacao: 'Objeto de resposta' },
    ],
}), { virtual: true });

jest.mock('../../fontes/bibliotecas/dialetos/pitugues', () => ({
    primitivas: [
        { nome: 'escreva', documentacao: 'Escreve na saída' },
    ],
    primitivasDicionarioFormatadas: [
        { nome: 'chaves', documentacao: 'Retorna as chaves' },
    ],
    primitivasNumeroFormatadas: [
        { nome: 'absoluto', documentacao: 'Valor absoluto' },
    ],
    primitivasTextoFormatadas: [
        { nome: 'maiuscula', documentacao: 'Maiúsculas' },
    ],
    primitivasVetorFormatadas: [
        { nome: 'adicionar', documentacao: 'Adiciona elemento' },
    ],
    funcoesNativasPitugues: [
        { nome: 'escreva', documentacao: 'Escreve na saída padrão' },
        { nome: 'leia', documentacao: 'Lê da entrada padrão' },
    ],
}), { virtual: true });

jest.mock('../../fontes/analise-codigo/cache-analise', () => ({
    obterResultado: jest.fn().mockReturnValue(null),
}), { virtual: true });

jest.mock('../../fontes/completude/interfaces', () => ({}), { virtual: true });

import { PituguesProvedorCompletude } from '../../fontes/completude/pitugues-provedor-completude';
import { obterResultado } from '../../fontes/analise-codigo/cache-analise';

function criarDocumento(linhas: string[] = ['']): any {
    return {
        uri: { toString: () => 'file:///teste.pitu' },
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

describe('PituguesProvedorCompletude', () => {
    let provedor: any;
    const mockToken: any = { isCancellationRequested: false };
    const mockContext: any = {};

    beforeEach(() => {
        jest.clearAllMocks();
        (obterResultado as jest.Mock).mockReturnValue(null);
        provedor = new PituguesProvedorCompletude();
    });

    it('instância criada com sucesso', () => {
        expect(provedor).toBeDefined();
        expect(typeof provedor.provideCompletionItems).toBe('function');
    });

    it('retorna funções nativas quando sem cache e texto simples', () => {
        const doc = criarDocumento(['escreva']);
        const pos = criarPosicao(0, 7);
        const items = provedor.provideCompletionItems(doc, pos, mockToken, mockContext);
        expect(Array.isArray(items)).toBe(true);
        expect(items.length).toBeGreaterThan(0);
        expect(items[0].label).toBeDefined();
    });

    it('retorna funções nativas quando cache nulo', () => {
        (obterResultado as jest.Mock).mockReturnValue(null);
        const doc = criarDocumento(['x']);
        const pos = criarPosicao(0, 1);
        const items = provedor.provideCompletionItems(doc, pos, mockToken, mockContext);
        expect(items.some((i: any) => i.label === 'escreva')).toBe(true);
    });

    it('retorna primitivas de liquido quando texto termina com "liquido."', () => {
        const doc = criarDocumento(['liquido.']);
        const pos = criarPosicao(0, 8);
        const items = provedor.provideCompletionItems(doc, pos, mockToken, mockContext);
        expect(Array.isArray(items)).toBe(true);
        expect(items[0].label).toBe('rotaGet');
    });

    it('snippet inserido para primitivas liquido', () => {
        const doc = criarDocumento(['liquido.']);
        const pos = criarPosicao(0, 8);
        const items = provedor.provideCompletionItems(doc, pos, mockToken, mockContext);
        expect(items[0].insertText).toBeDefined();
    });

    it('retorna objetos em rota dentro do escopo rotaGet', () => {
        const linhas = [
            'liquido.rotaGet("/", funcao() {',
            '  ',
        ];
        const doc = criarDocumento(linhas);
        const pos = criarPosicao(1, 2);
        const items = provedor.provideCompletionItems(doc, pos, mockToken, mockContext);
        expect(Array.isArray(items)).toBe(true);
        expect(items[0].label).toBe('requisicao');
    });

    it('retorna objetos em rota dentro do escopo rotaPost', () => {
        const linhas = [
            'liquido.rotaPost("/", funcao() {',
            '  ',
        ];
        const doc = criarDocumento(linhas);
        const pos = criarPosicao(1, 2);
        const items = provedor.provideCompletionItems(doc, pos, mockToken, mockContext);
        expect(items.some((i: any) => i.label === 'requisicao')).toBe(true);
    });

    it('completudesParaPitugues: tipo dicionario retorna primitivas de dicionário', () => {
        const { Classe, FuncaoDeclaracao } = jest.requireMock('../../fontes/bibliotecas/dialetos/pitugues');
        const doc = criarDocumento(['d.chaves()']);
        const pos = criarPosicao(0, 2);
        // Simula declaração de tipo dicionario no cache
        const mockDeclaracao = {
            simbolo: { lexema: 'd' },
            tipo: 'dicionario',
        };
        (obterResultado as jest.Mock).mockReturnValue({
            avaliadorSintatico: { declaracoes: [] },
        });
        // text ends with '.' so triggers primitives
        const doc2 = criarDocumento(['d.']);
        const pos2 = criarPosicao(0, 2);
        const items = provedor.completudesParaPitugues('d.', 'd', [], { nome: 'd', tipo: 'dicionario' });
        expect(items.some((i: any) => i.label === 'chaves')).toBe(true);
    });

    it('completudesParaPitugues: tipo numero retorna primitivas numéricas', () => {
        const items = provedor.completudesParaPitugues('n.', 'n', [], { nome: 'n', tipo: 'numero' });
        expect(items.some((i: any) => i.label === 'absoluto')).toBe(true);
    });

    it('completudesParaPitugues: tipo texto retorna primitivas de texto', () => {
        const items = provedor.completudesParaPitugues('t.', 't', [], { nome: 't', tipo: 'texto' });
        expect(items.some((i: any) => i.label === 'maiuscula')).toBe(true);
    });

    it('completudesParaPitugues: tipo vetor retorna primitivas de vetor', () => {
        const items = provedor.completudesParaPitugues('v.', 'v', [], { nome: 'v', tipo: 'vetor' });
        expect(items.some((i: any) => i.label === 'adicionar')).toBe(true);
    });

    it('completudesParaPitugues: tipo dicionario[] retorna primitivas de vetor', () => {
        const items = provedor.completudesParaPitugues('v.', 'v', [], { nome: 'v', tipo: 'dicionario[]' });
        expect(items.some((i: any) => i.label === 'adicionar')).toBe(true);
    });

    it('completudesParaPitugues: tipo numero[] retorna primitivas de vetor', () => {
        const items = provedor.completudesParaPitugues('v.', 'v', [], { nome: 'v', tipo: 'numero[]' });
        expect(items.some((i: any) => i.label === 'adicionar')).toBe(true);
    });

    it('completudesParaPitugues: tipo logico[] retorna primitivas de vetor', () => {
        const items = provedor.completudesParaPitugues('v.', 'v', [], { nome: 'v', tipo: 'logico[]' });
        expect(items.some((i: any) => i.label === 'adicionar')).toBe(true);
    });

    it('completudesParaPitugues: tipo desconhecido retorna primitivas genéricas', () => {
        const items = provedor.completudesParaPitugues('x.', 'x', [], { nome: 'x', tipo: 'outro' });
        expect(items.some((i: any) => i.label === 'escreva')).toBe(true);
    });

    it('completudesParaPitugues: sem ponto retorna funções nativas', () => {
        const items = provedor.completudesParaPitugues('escreva', null, [], undefined);
        expect(items.some((i: any) => i.label === 'escreva')).toBe(true);
    });

    it('completudesParaPitugues: sem declaração correspondente e com ponto retorna funções nativas', () => {
        const items = provedor.completudesParaPitugues('x.', 'x', [], undefined);
        expect(items.some((i: any) => i.label === 'escreva')).toBe(true);
    });

    it('items têm documentação definida', () => {
        const doc = criarDocumento(['']);
        const pos = criarPosicao(0, 0);
        const items = provedor.provideCompletionItems(doc, pos, mockToken, mockContext);
        expect(items[0].documentation).toBeDefined();
    });

    it('detecta parâmetros de função liquido.rotaGet', () => {
        const linhas = [
            'liquido.rotaGet("/", funcao(req, res) {',
            '  req.',
        ];
        const doc = criarDocumento(linhas);
        const pos = criarPosicao(1, 6);
        // Deve executar sem erro
        const items = provedor.provideCompletionItems(doc, pos, mockToken, mockContext);
        expect(Array.isArray(items)).toBe(true);
    });

    it('cache com declarações de função retorna itens de variável', () => {
        const FuncaoDeclaracaoMock = class {
            constructor(public simbolo: any, public tipo: string) {}
        };
        jest.doMock('../../fontes/analise-codigo/cache-analise', () => ({
            obterResultado: jest.fn().mockReturnValue({
                avaliadorSintatico: {
                    declaracoes: [
                        new FuncaoDeclaracaoMock({ lexema: 'minhaFuncao' }, 'funcao'),
                    ],
                },
            }),
        }), { virtual: true });

        const doc = criarDocumento(['minhaFuncao']);
        const pos = criarPosicao(0, 10);
        const items = provedor.provideCompletionItems(doc, pos, mockToken, mockContext);
        // Should not throw and return items
        expect(Array.isArray(items)).toBe(true);
    });
});
