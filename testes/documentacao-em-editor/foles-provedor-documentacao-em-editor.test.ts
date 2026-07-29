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

jest.mock('@designliquido/foles/extensao/lista-modificadores', () => ({
    __esModule: true,
    default: {
        'alinhar-texto': { documentacao: 'Alinha o texto horizontalmente', exemploCodigo: 'alinhar-texto: centro' },
        'cor': { documentacao: 'Define a cor do elemento', exemploCodigo: 'cor: vermelho' },
    },
}));

import { FolesProvedorDocumentacaoEmEditor } from '../../fontes/documentacao-em-editor/foles-provedor-documentacao-em-editor';

function criarDocumento(palavra: string, linhaTexto?: string): any {
    return {
        lineAt: jest.fn().mockReturnValue({ text: linhaTexto ?? palavra }),
        getText: jest.fn((range?: any) => range ? palavra : ''),
        getWordRangeAtPosition: jest.fn().mockReturnValue({}),
    };
}

describe('FolesProvedorDocumentacaoEmEditor', () => {
    let provedor: any;
    const mockPos: any = { line: 0, character: 5 };
    const mockToken: any = {};

    beforeEach(() => {
        jest.clearAllMocks();
        provedor = new FolesProvedorDocumentacaoEmEditor();
    });

    it('instância criada com sucesso', () => {
        expect(provedor).toBeDefined();
        expect(typeof provedor.provideHover).toBe('function');
    });

    it('retorna undefined para modificador não encontrado', () => {
        const resultado = provedor.provideHover(criarDocumento('desconhecido'), mockPos, mockToken);
        expect(resultado).toBeUndefined();
    });

    it('retorna Hover para alinhar-texto', () => {
        const resultado = provedor.provideHover(criarDocumento('alinhar-texto'), mockPos, mockToken);
        expect(resultado).toBeDefined();
        expect(resultado.contents.value).toContain('Alinha o texto');
    });

    it('alinhar-texto com exemploCodigo contém código', () => {
        const resultado = provedor.provideHover(criarDocumento('alinhar-texto'), mockPos, mockToken);
        expect(resultado.contents.value).toContain('alinhar-texto: centro');
    });

    it('retorna Hover para cor', () => {
        const resultado = provedor.provideHover(criarDocumento('cor'), mockPos, mockToken);
        expect(resultado).toBeDefined();
        expect(resultado.contents.value).toContain('Define a cor');
    });

    it('cor com exemploCodigo contém código', () => {
        const resultado = provedor.provideHover(criarDocumento('cor'), mockPos, mockToken);
        expect(resultado.contents.value).toContain('cor: vermelho');
    });
});
