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

jest.mock('../../fontes/bibliotecas/dialetos/visualg', () => ({
    estruturasDados: [
        { nome: 'vetor', documentacao: 'Estrutura de dados vetor', exemploCodigo: 'vetor[1..10]' },
    ],
    primitivasCaracteresVisuAlg: [
        { nome: 'maiusc', documentacao: 'Converte para maiúsculas', exemploCodigo: 'maiusc(s)' },
    ],
    primitivasNumeroVisuAlg: [
        { nome: 'abs', documentacao: 'Valor absoluto', exemploCodigo: 'abs(-1)' },
    ],
    primitivasEntradaSaidaVisuAlg: [
        { nome: 'escreva', documentacao: 'Escreve na saída', exemploCodigo: 'escreva("oi")' },
    ],
}), { virtual: true });

import { VisuAlgProvedorDocumentacaoEmEditor } from '../../fontes/documentacao-em-editor/visualg-provedor-documentacao-em-editor';

function criarDocumento(palavra: string, linhaTexto?: string): any {
    return {
        lineAt: jest.fn().mockReturnValue({ text: linhaTexto ?? palavra }),
        getText: jest.fn((range?: any) => range ? palavra : ''),
        getWordRangeAtPosition: jest.fn().mockReturnValue({}),
    };
}

describe('VisuAlgProvedorDocumentacaoEmEditor', () => {
    let provedor: any;
    const mockPos: any = { line: 0, character: 5 };
    const mockToken: any = {};

    beforeEach(() => {
        jest.clearAllMocks();
        provedor = new VisuAlgProvedorDocumentacaoEmEditor();
    });

    it('instância criada com sucesso', () => {
        expect(provedor).toBeDefined();
        expect(typeof provedor.provideHover).toBe('function');
    });

    it('retorna undefined para palavra não encontrada', () => {
        const resultado = provedor.provideHover(criarDocumento('desconhecida'), mockPos, mockToken);
        expect(resultado).toBeUndefined();
    });

    describe('estruturas de dados', () => {
        it('retorna Hover para vetor', () => {
            const resultado = provedor.provideHover(criarDocumento('vetor'), mockPos, mockToken);
            expect(resultado).toBeDefined();
            expect(resultado.contents.value).toContain('Estrutura de dados vetor');
        });

        it('vetor com exemploCodigo contém código', () => {
            const resultado = provedor.provideHover(criarDocumento('vetor'), mockPos, mockToken);
            expect(resultado.contents.value).toContain('vetor[1..10]');
        });
    });

    describe('primitivas de caractere', () => {
        it('retorna Hover para maiusc', () => {
            const resultado = provedor.provideHover(criarDocumento('maiusc'), mockPos, mockToken);
            expect(resultado).toBeDefined();
            expect(resultado.contents.value).toContain('maiúsculas');
        });

        it('maiusc com exemploCodigo contém código', () => {
            const resultado = provedor.provideHover(criarDocumento('maiusc'), mockPos, mockToken);
            expect(resultado.contents.value).toContain('maiusc(s)');
        });
    });

    describe('primitivas de número', () => {
        it('retorna Hover para abs', () => {
            const resultado = provedor.provideHover(criarDocumento('abs'), mockPos, mockToken);
            expect(resultado).toBeDefined();
            expect(resultado.contents.value).toContain('absoluto');
        });

        it('abs com exemploCodigo contém código', () => {
            const resultado = provedor.provideHover(criarDocumento('abs'), mockPos, mockToken);
            expect(resultado.contents.value).toContain('abs(-1)');
        });
    });

    describe('primitivas de entrada/saída', () => {
        it('retorna Hover para escreva', () => {
            const resultado = provedor.provideHover(criarDocumento('escreva'), mockPos, mockToken);
            expect(resultado).toBeDefined();
            expect(resultado.contents.value).toContain('saída');
        });

        it('escreva com exemploCodigo contém código', () => {
            const resultado = provedor.provideHover(criarDocumento('escreva'), mockPos, mockToken);
            expect(resultado.contents.value).toContain('escreva("oi")');
        });
    });
});
