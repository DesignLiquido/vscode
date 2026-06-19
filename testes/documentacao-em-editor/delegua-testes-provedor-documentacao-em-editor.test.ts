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
    Position: class Position {
        constructor(public line: number, public character: number) {}
    },
    Range: class Range {
        constructor(public start: any, public end: any) {}
    },
    FileType: { Directory: 2 },
    Uri: { parse: (u: any) => u, file: (u: any) => u },
    workspace: { fs: {} },
    DiagnosticSeverity: { Error: 0, Warning: 1, Information: 2, Hint: 3 },
    window: { showWarningMessage: jest.fn() },
}), { virtual: true });

jest.mock('@designliquido/delegua-lsp/analise/cache-analise', () => ({
    obterResultado: jest.fn().mockReturnValue(null),
}), { virtual: true });

jest.mock('@designliquido/delegua-lsp/analise/cache-definicoes', () => ({
    obterDefinicoesPorContexto: jest.fn().mockReturnValue({}),
}), { virtual: true });

jest.mock('@designliquido/delegua/declaracoes', () => ({
    Var: class Var { constructor(public simbolo: any, public tipo: string) {} },
    Const: class Const { constructor(public simbolo: any, public tipo: string) {} },
    FuncaoDeclaracao: class FuncaoDeclaracao { constructor(public simbolo: any, public tipo: string) {} },
    Classe: class Classe { constructor(public simbolo: any) {} },
    ParaCada: class ParaCada { constructor(public variavelIteracao: any, public vetorOuDicionario: any, public corpo?: any) {} },
    InterfaceDeclaracao: class InterfaceDeclaracao { constructor(public simbolo: any) {} },
}), { virtual: true });

jest.mock('../../fontes/bibliotecas', () => ({
    formatarPrimitivas: jest.fn().mockReturnValue([]),
    funcoesNativasDelegua: [],
}), { virtual: true });

import { DeleguaTestesProvedorDocumentacaoEmEditor } from '../../fontes/documentacao-em-editor/delegua-testes-provedor-documentacao-em-editor';

function criarDocumento(textoLinha: string, caractereInicio: number, palavra: string) {
    return {
        uri: { toString: () => 'file:///test.testes.delegua' },
        lineAt: jest.fn().mockReturnValue({ text: textoLinha }),
        getText: jest.fn().mockReturnValue(palavra),
        getWordRangeAtPosition: jest.fn().mockReturnValue({ start: { character: caractereInicio } }),
    };
}

describe('DeleguaTestesProvedorDocumentacaoEmEditor', () => {
    let provedor: any;
    const mockToken: any = {};

    beforeEach(() => {
        jest.clearAllMocks();
        provedor = new DeleguaTestesProvedorDocumentacaoEmEditor();
    });

    it('instância criada com sucesso', () => {
        expect(provedor).toBeDefined();
        expect(typeof provedor.provideHover).toBe('function');
    });

    it('retorna Hover para afirmar.igual', async () => {
        const doc = criarDocumento('afirmar.igual', 8, 'igual');
        const result = await provedor.provideHover(doc, { line: 0, character: 10 }, mockToken);
        expect(result).toBeDefined();
        expect(result.contents.value).toContain('igual');
    });

    it('retorna Hover para afirmar.diferente', async () => {
        const doc = criarDocumento('afirmar.diferente', 8, 'diferente');
        const result = await provedor.provideHover(doc, { line: 0, character: 12 }, mockToken);
        expect(result).toBeDefined();
    });

    it('retorna Hover para teste.pular', async () => {
        const doc = criarDocumento('teste.pular', 6, 'pular');
        const result = await provedor.provideHover(doc, { line: 0, character: 8 }, mockToken);
        expect(result).toBeDefined();
        expect(result.contents.value).toContain('pular');
    });

    it('retorna Hover para teste.apenas', async () => {
        const doc = criarDocumento('teste.apenas', 6, 'apenas');
        const result = await provedor.provideHover(doc, { line: 0, character: 8 }, mockToken);
        expect(result).toBeDefined();
    });

    it('retorna Hover para grupo.pular', async () => {
        const doc = criarDocumento('grupo.pular', 6, 'pular');
        const result = await provedor.provideHover(doc, { line: 0, character: 8 }, mockToken);
        expect(result).toBeDefined();
    });

    it('retorna Hover para grupo.apenas', async () => {
        const doc = criarDocumento('grupo.apenas', 6, 'apenas');
        const result = await provedor.provideHover(doc, { line: 0, character: 8 }, mockToken);
        expect(result).toBeDefined();
    });

    it('retorna Hover para palavra "grupo" sem ponto anterior', async () => {
        const doc = criarDocumento('grupo', 0, 'grupo');
        const result = await provedor.provideHover(doc, { line: 0, character: 3 }, mockToken);
        expect(result).toBeDefined();
        expect(result.contents.value).toContain('grupo');
    });

    it('retorna Hover para palavra "teste" sem ponto anterior', async () => {
        const doc = criarDocumento('teste', 0, 'teste');
        const result = await provedor.provideHover(doc, { line: 0, character: 3 }, mockToken);
        expect(result).toBeDefined();
    });

    it('chama super quando não há intervalo de palavra (sem intervalo)', async () => {
        const doc = {
            uri: { toString: () => 'file:///test.testes.delegua' },
            lineAt: jest.fn().mockReturnValue({ text: '' }),
            getText: jest.fn().mockReturnValue(''),
            getWordRangeAtPosition: jest.fn().mockReturnValue(undefined),
        };
        const result = await provedor.provideHover(doc, { line: 0, character: 0 }, mockToken);
        expect(result === undefined || result === null).toBe(true);
    });

    it('chama super quando afirmar.metodoDesconhecido não é encontrado', async () => {
        const doc = criarDocumento('afirmar.xpto', 8, 'xpto');
        const result = await provedor.provideHover(doc, { line: 0, character: 10 }, mockToken);
        expect(result === undefined || result === null).toBe(true);
    });

    it('chama super quando palavra não pertence ao módulo de testes', async () => {
        const doc = criarDocumento('qualquerCoisa', 0, 'qualquerCoisa');
        const result = await provedor.provideHover(doc, { line: 0, character: 5 }, mockToken);
        expect(result === undefined || result === null).toBe(true);
    });
});
