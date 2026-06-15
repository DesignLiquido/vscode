// @ts-nocheck
import { describe, it, expect, jest, beforeEach } from '@jest/globals';

jest.mock('vscode', () => ({
    CompletionItemKind: {
        Property: 9,
        Module: 8,
    },
    CompletionItem: class CompletionItem {
        constructor(public label: string, public kind?: number) {}
        detail: string;
        insertText: any;
        command: any;
    },
    SnippetString: class SnippetString {
        constructor(public value: string) {}
    },
}), { virtual: true });

import { DelpropsProvedorCompletude } from '../../fontes/completude/delprops-provedor-completude';

function criarDocumento(texto: string): any {
    return {
        lineAt: jest.fn().mockReturnValue({ text: texto }),
    };
}

function criarPosicao(character: number): any {
    return { line: 0, character };
}

describe('DelpropsProvedorCompletude', () => {
    let provedor: any;
    const mockToken: any = {};

    beforeEach(() => {
        jest.clearAllMocks();
        provedor = new DelpropsProvedorCompletude();
    });

    it('instância criada com sucesso', () => {
        expect(provedor).toBeDefined();
        expect(typeof provedor.provideCompletionItems).toBe('function');
    });

    it('linha vazia → retorna item "liquido"', () => {
        const items = provedor.provideCompletionItems(criarDocumento(''), criarPosicao(0));
        expect(Array.isArray(items)).toBe(true);
        expect(items.length).toBe(1);
        expect(items[0].label).toBe('liquido');
    });

    it('item "liquido" tem insertText SnippetString', () => {
        const items = provedor.provideCompletionItems(criarDocumento(''), criarPosicao(0));
        expect(items[0].insertText).toBeDefined();
        expect(items[0].insertText.value).toBe('liquido.');
    });

    it('item "liquido" tem command para acionar sugestões', () => {
        const items = provedor.provideCompletionItems(criarDocumento(''), criarPosicao(0));
        expect(items[0].command).toBeDefined();
        expect(items[0].command.command).toBe('editor.action.triggerSuggest');
    });

    it('"liquido." → retorna namespaces de 1º nível', () => {
        const items = provedor.provideCompletionItems(criarDocumento('liquido.'), criarPosicao(8));
        expect(Array.isArray(items)).toBe(true);
        expect(items.length).toBe(3);
        const labels = items.map((i: any) => i.label);
        expect(labels).toContain('roteador');
        expect(labels).toContain('dados');
        expect(labels).toContain('autenticacao');
    });

    it('namespaces de 1º nível têm tipo Module', () => {
        const { CompletionItemKind } = jest.requireMock('vscode');
        const items = provedor.provideCompletionItems(criarDocumento('liquido.'), criarPosicao(8));
        items.forEach((i: any) => expect(i.kind).toBe(CompletionItemKind.Module));
    });

    it('"liquido.roteador." → retorna propriedades do roteador', () => {
        const items = provedor.provideCompletionItems(criarDocumento('liquido.roteador.'), criarPosicao(17));
        expect(Array.isArray(items)).toBe(true);
        expect(items.length).toBeGreaterThan(0);
        const labels = items.map((i: any) => i.label);
        expect(labels).toContain('diretorioEstatico');
        expect(labels).toContain('porta');
    });

    it('propriedades do roteador têm tipo Property', () => {
        const { CompletionItemKind } = jest.requireMock('vscode');
        const items = provedor.provideCompletionItems(criarDocumento('liquido.roteador.'), criarPosicao(17));
        items.forEach((i: any) => expect(i.kind).toBe(CompletionItemKind.Property));
    });

    it('propriedades têm detail com tipo e detalhe', () => {
        const items = provedor.provideCompletionItems(criarDocumento('liquido.roteador.'), criarPosicao(17));
        const itemPorta = items.find((i: any) => i.label === 'porta');
        expect(itemPorta.detail).toContain('escutará');
    });

    it('"liquido.autenticacao." → retorna propriedades de autenticação', () => {
        const items = provedor.provideCompletionItems(criarDocumento('liquido.autenticacao.'), criarPosicao(21));
        expect(Array.isArray(items)).toBe(true);
        expect(items.length).toBeGreaterThan(0);
        const labels = items.map((i: any) => i.label);
        expect(labels).toContain('tecnologia');
        expect(labels).toContain('segredo');
    });

    it('"liquido.dados.minhaBd." → retorna propriedades da fonte de dados', () => {
        const items = provedor.provideCompletionItems(criarDocumento('liquido.dados.minhaBd.'), criarPosicao(22));
        expect(Array.isArray(items)).toBe(true);
        const labels = items.map((i: any) => i.label);
        expect(labels).toContain('tecnologia');
        expect(labels).toContain('host');
        expect(labels).toContain('porta');
        expect(labels).toContain('autoInicializar');
        expect(labels).toContain('arquivoInicializacao');
    });

    it('texto sem relação com liquido → retorna undefined', () => {
        const result = provedor.provideCompletionItems(criarDocumento('outroNs.'), criarPosicao(8));
        expect(result).toBeUndefined();
    });

    it('texto parcial não reconhecido → retorna undefined', () => {
        const result = provedor.provideCompletionItems(criarDocumento('outro texto aleatório'), criarPosicao(10));
        expect(result).toBeUndefined();
    });
});
