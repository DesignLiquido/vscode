// @ts-nocheck
import { describe, it, expect, jest, beforeEach } from '@jest/globals';

jest.mock('vscode', () => ({
    MarkdownString: class MarkdownString {
        value: string;
        constructor(value?: string) { this.value = value || ''; }
        appendCodeblock(code: string, _lang?: string) { this.value += '\n' + code; return this; }
        appendMarkdown(text: string) { this.value += text; return this; }
    },
    Hover: class Hover {
        constructor(public contents: any) {}
    },
}), { virtual: true });

jest.mock('../../fontes/linguagens/lmht/estruturas', () => ({
    __esModule: true,
    default: {
        paragrafo: {
            documentacao: '# `paragrafo`\nEstrutura de parágrafo.',
            exemploCodigo: '<paragrafo>texto</paragrafo>',
        },
        divisao: {
            documentacao: '# `divisao`\nElemento de divisão genérico.',
            exemploCodigo: '<divisao></divisao>',
        },
        negrito: {
            documentacao: '# `negrito`\nTexto em negrito.',
            exemploCodigo: '<negrito>texto</negrito>',
        },
    },
}), { virtual: true });

import { LmhtProvedorDocumentacaoEmEditor } from '../../fontes/documentacao-em-editor/lmht-provedor-documentacao-em-editor';

function criarDocumento(palavra: string, linhaTexto?: string): any {
    return {
        lineAt: jest.fn().mockReturnValue({ text: linhaTexto ?? palavra }),
        getText: jest.fn((range?: any) => range ? palavra : ''),
        getWordRangeAtPosition: jest.fn().mockReturnValue({}),
    };
}

describe('LmhtProvedorDocumentacaoEmEditor', () => {
    let provedor: any;
    const mockPos: any = { line: 0, character: 5 };
    const mockToken: any = {};

    beforeEach(() => {
        jest.clearAllMocks();
        provedor = new LmhtProvedorDocumentacaoEmEditor();
    });

    it('instância criada com sucesso', () => {
        expect(provedor).toBeDefined();
        expect(typeof provedor.provideHover).toBe('function');
    });

    it('retorna undefined para elemento não encontrado', () => {
        const resultado = provedor.provideHover(criarDocumento('desconhecido'), mockPos, mockToken);
        expect(resultado).toBeUndefined();
    });

    it('retorna Hover para paragrafo', () => {
        const resultado = provedor.provideHover(criarDocumento('paragrafo'), mockPos, mockToken);
        expect(resultado).toBeDefined();
        expect(resultado.contents.value).toContain('parágrafo');
    });

    it('paragrafo com exemploCodigo contém código', () => {
        const resultado = provedor.provideHover(criarDocumento('paragrafo'), mockPos, mockToken);
        expect(resultado.contents.value).toContain('<paragrafo>');
    });

    it('retorna Hover para divisao', () => {
        const resultado = provedor.provideHover(criarDocumento('divisao'), mockPos, mockToken);
        expect(resultado).toBeDefined();
        expect(resultado.contents.value).toContain('divisão');
    });

    it('divisao com exemploCodigo contém código', () => {
        const resultado = provedor.provideHover(criarDocumento('divisao'), mockPos, mockToken);
        expect(resultado.contents.value).toContain('<divisao>');
    });

    it('retorna Hover para negrito', () => {
        const resultado = provedor.provideHover(criarDocumento('negrito'), mockPos, mockToken);
        expect(resultado).toBeDefined();
        expect(resultado.contents.value).toContain('negrito');
    });
});
