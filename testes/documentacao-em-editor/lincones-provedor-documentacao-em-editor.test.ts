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

jest.mock('../../fontes/linguagens/lincones/documentacao', () => ({
    __esModule: true,
    default: {
        SELECIONAR: {
            documentacao: 'Comando para selecionar registros de uma tabela',
            exemploCodigo: 'SELECIONAR * DE usuarios',
        },
        INSERIR: {
            documentacao: 'Comando para inserir registros em uma tabela',
            exemploCodigo: 'INSERIR EM usuarios (nome) VALORES ("João")',
        },
        EXCLUIR: {
            documentacao: 'Comando para remover registros de uma tabela',
            exemploCodigo: 'EXCLUIR DE usuarios ONDE id = 1',
        },
    },
}), { virtual: true });

import { LinConEsProvedorDocumentacaoEmEditor } from '../../fontes/documentacao-em-editor/lincones-provedor-documentacao-em-editor';

function criarDocumento(palavra: string, linhaTexto?: string): any {
    return {
        lineAt: jest.fn().mockReturnValue({ text: linhaTexto ?? palavra }),
        getText: jest.fn((range?: any) => range ? palavra : ''),
        getWordRangeAtPosition: jest.fn().mockReturnValue({}),
    };
}

describe('LinConEsProvedorDocumentacaoEmEditor', () => {
    let provedor: any;
    const mockPos: any = { line: 0, character: 5 };
    const mockToken: any = {};

    beforeEach(() => {
        jest.clearAllMocks();
        provedor = new LinConEsProvedorDocumentacaoEmEditor();
    });

    it('instância criada com sucesso', () => {
        expect(provedor).toBeDefined();
        expect(typeof provedor.provideHover).toBe('function');
    });

    it('retorna undefined para comando não encontrado', () => {
        const resultado = provedor.provideHover(criarDocumento('desconhecido'), mockPos, mockToken);
        expect(resultado).toBeUndefined();
    });

    it('retorna Hover para SELECIONAR', () => {
        const resultado = provedor.provideHover(criarDocumento('SELECIONAR'), mockPos, mockToken);
        expect(resultado).toBeDefined();
        expect(resultado.contents.value).toContain('selecionar');
    });

    it('SELECIONAR com exemploCodigo contém código', () => {
        const resultado = provedor.provideHover(criarDocumento('SELECIONAR'), mockPos, mockToken);
        expect(resultado.contents.value).toContain('SELECIONAR * DE');
    });

    it('retorna Hover para INSERIR', () => {
        const resultado = provedor.provideHover(criarDocumento('INSERIR'), mockPos, mockToken);
        expect(resultado).toBeDefined();
        expect(resultado.contents.value).toContain('inserir');
    });

    it('retorna Hover para EXCLUIR', () => {
        const resultado = provedor.provideHover(criarDocumento('EXCLUIR'), mockPos, mockToken);
        expect(resultado).toBeDefined();
        expect(resultado.contents.value).toContain('remover');
    });
});
