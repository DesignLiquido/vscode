// @ts-nocheck
import { describe, it, expect, jest, beforeEach } from '@jest/globals';

jest.mock('vscode', () => ({
    MarkdownString: class MarkdownString {
        value: string;
        constructor(value?: string) { this.value = value || ''; }
        appendCodeblock(code: string) { this.value += '\n' + code; return this; }
        appendMarkdown(text: string) { this.value += text; return this; }
    },
    Hover: class Hover {
        constructor(public contents: any) {}
    },
}), { virtual: true });

// Mock VisuAlg bibliotecas
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

// Mock PortugolStudio bibliotecas
jest.mock('../../fontes/bibliotecas/dialetos/portugol-studio', () => ({
    calendarioPortugolStudio: [
        { nome: 'dia_mes_atual', documentacao: 'Dia do mês atual' },
    ],
    matematicaPortugolStudio: [
        { nome: 'potencia', documentacao: 'Exponenciação', exemploCodigo: 'potencia(2, 3)' },
    ],
    textoPortugolStudio: [
        { nome: 'numero_caracteres', documentacao: 'Conta caracteres', exemploCodigo: '' },
    ],
    utilPortugolStudio: [
        { nome: 'sorteia', documentacao: 'Sorteia número', exemploCodigo: '' },
    ],
    primitivasEntradaSaidaPortugolStudio: [
        { nome: 'escreva', documentacao: 'Escreve na saída', exemploCodigo: '' },
    ],
    tiposPortugolStudio: [
        { nome: 'inteiro', documentacao: 'Tipo inteiro', exemploCodigo: '' },
    ],
    constantesPortugolStudio: [
        { nome: 'verdadeiro', documentacao: 'Constante verdadeira', exemploCodigo: '' },
    ],
    palavrasReservadasPortugolStudio: [
        { nome: 'programa', documentacao: 'Bloco principal do programa', exemploCodigo: 'programa { }' },
        { nome: 'se', documentacao: 'Estrutura de decisão', exemploCodigo: 'se (condicao) { }' },
    ],
}), { virtual: true });

// Mock FoLEs
jest.mock('../../fontes/linguagens/foles/modificadores', () => ({
    __esModule: true,
    default: {
        alinhamento: { documentacao: 'Alinha o elemento', exemploCodigo: 'alinhamento: centro' },
        cor: { documentacao: 'Define a cor', exemploCodigo: 'cor: vermelho' },
    },
}), { virtual: true });

// Mock LinConEs
jest.mock('../../fontes/linguagens/lincones/documentacao', () => ({
    __esModule: true,
    default: {
        negrito: { documentacao: 'Texto em negrito', exemploCodigo: '[negrito]texto[/negrito]' },
        italico: { documentacao: 'Texto em itálico', exemploCodigo: '[italico]texto[/italico]' },
    },
}), { virtual: true });

// Mock LMHT
jest.mock('../../fontes/linguagens/lmht/estruturas', () => ({
    __esModule: true,
    default: {
        paragrafo: { documentacao: 'Elemento parágrafo', exemploCodigo: '<paragrafo>texto</paragrafo>' },
        divisao: { documentacao: 'Elemento divisão', exemploCodigo: '<divisao></divisao>' },
    },
}), { virtual: true });

// Mock @designliquido/delprops
jest.mock('@designliquido/delprops', () => ({
    liquido: {
        roteador: [
            { nome: 'porta', tipo: 'numero', detalhe: 'Porta do servidor', valoresPermitidos: null, padrao: '3000' },
            { nome: 'cors', tipo: 'logico', detalhe: 'Habilita CORS', valoresPermitidos: null, padrao: null },
        ],
        dados: [
            { nome: 'tecnologia', tipo: 'texto', detalhe: 'Tecnologia de banco', valoresPermitidos: ['sqlite', 'mysql'], padrao: null },
        ],
        autenticacao: [
            { nome: 'segredo', tipo: 'texto', detalhe: 'Chave secreta JWT', valoresPermitidos: null, padrao: null },
        ],
    },
    DefinicaoPropriedade: class {},
}), { virtual: true });

function criarDocumento(palavra: string, linhaTexto?: string): any {
    return {
        lineAt: jest.fn().mockReturnValue({ text: linhaTexto ?? palavra }),
        getText: jest.fn((range?: any) => range ? palavra : ''),
        getWordRangeAtPosition: jest.fn().mockReturnValue({}),
    };
}

describe('provedores-simples documentacao-em-editor', () => {
    const mockPos: any = { line: 0, character: 5 };
    const mockToken: any = {};

    beforeEach(() => jest.clearAllMocks());

    // ────── VisuAlgProvedorDocumentacaoEmEditor ──────
    describe('VisuAlgProvedorDocumentacaoEmEditor', () => {
        let provedor: any;
        beforeEach(() => {
            const { VisuAlgProvedorDocumentacaoEmEditor } = require('../../fontes/documentacao-em-editor/visualg-provedor-documentacao-em-editor');
            provedor = new VisuAlgProvedorDocumentacaoEmEditor();
        });

        it('instância criada', () => {
            expect(provedor).toBeDefined();
        });

        it('hover em estrutura de dados (vetor)', () => {
            const result = provedor.provideHover(criarDocumento('vetor'), mockPos, mockToken);
            expect(result).toBeDefined();
            expect(result.contents.value).toContain('Estrutura de dados vetor');
        });

        it('estrutura com exemploCodigo → appendCodeblock chamado', () => {
            const result = provedor.provideHover(criarDocumento('vetor'), mockPos, mockToken);
            expect(result.contents.value).toContain('vetor[1..10]');
        });

        it('hover em primitiva de caractere (maiusc)', () => {
            const result = provedor.provideHover(criarDocumento('maiusc'), mockPos, mockToken);
            expect(result).toBeDefined();
            expect(result.contents.value).toContain('maiúsculas');
        });

        it('hover em primitiva de número (abs)', () => {
            const result = provedor.provideHover(criarDocumento('abs'), mockPos, mockToken);
            expect(result).toBeDefined();
            expect(result.contents.value).toContain('absoluto');
        });

        it('hover em entrada/saída (escreva)', () => {
            const result = provedor.provideHover(criarDocumento('escreva'), mockPos, mockToken);
            expect(result).toBeDefined();
        });

        it('palavra desconhecida → undefined', () => {
            const result = provedor.provideHover(criarDocumento('desconhecida'), mockPos, mockToken);
            expect(result).toBeUndefined();
        });
    });

    // ────── PortugolStudioProvedorDocumentacaoEmEditor ──────
    describe('PortugolStudioProvedorDocumentacaoEmEditor', () => {
        let provedor: any;
        beforeEach(() => {
            const { PortugolStudioProvedorDocumentacaoEmEditor } = require('../../fontes/documentacao-em-editor/portugol-studio-provedor-documentacao-em-editor');
            provedor = new PortugolStudioProvedorDocumentacaoEmEditor();
        });

        it('instância criada', () => {
            expect(provedor).toBeDefined();
        });

        it('hover em função de calendário', () => {
            const result = provedor.provideHover(criarDocumento('dia_mes_atual'), mockPos, mockToken);
            expect(result).toBeDefined();
            expect(result.contents.value).toContain('Dia do mês atual');
        });

        it('hover em função matemática com exemploCodigo', () => {
            const result = provedor.provideHover(criarDocumento('potencia'), mockPos, mockToken);
            expect(result).toBeDefined();
            expect(result.contents.value).toContain('potencia(2, 3)');
        });

        it('hover em função de texto', () => {
            const result = provedor.provideHover(criarDocumento('numero_caracteres'), mockPos, mockToken);
            expect(result).toBeDefined();
        });

        it('hover em função util', () => {
            const result = provedor.provideHover(criarDocumento('sorteia'), mockPos, mockToken);
            expect(result).toBeDefined();
        });

        it('hover em entrada/saída', () => {
            const result = provedor.provideHover(criarDocumento('escreva'), mockPos, mockToken);
            expect(result).toBeDefined();
        });

        it('hover em tipo', () => {
            const result = provedor.provideHover(criarDocumento('inteiro'), mockPos, mockToken);
            expect(result).toBeDefined();
        });

        it('hover em constante', () => {
            const result = provedor.provideHover(criarDocumento('verdadeiro'), mockPos, mockToken);
            expect(result).toBeDefined();
        });

        it('hover em palavra reservada (programa)', () => {
            const result = provedor.provideHover(criarDocumento('programa'), mockPos, mockToken);
            expect(result).toBeDefined();
            expect(result.contents.value).toContain('Bloco principal do programa');
        });

        it('hover em palavra reservada com exemploCodigo (se)', () => {
            const result = provedor.provideHover(criarDocumento('se'), mockPos, mockToken);
            expect(result).toBeDefined();
            expect(result.contents.value).toContain('se (condicao)');
        });

        it('palavra desconhecida → undefined', () => {
            const result = provedor.provideHover(criarDocumento('xyz'), mockPos, mockToken);
            expect(result).toBeUndefined();
        });
    });

    // ────── FolesProvedorDocumentacaoEmEditor ──────
    describe('FolesProvedorDocumentacaoEmEditor', () => {
        let provedor: any;
        beforeEach(() => {
            const { FolesProvedorDocumentacaoEmEditor } = require('../../fontes/documentacao-em-editor/foles-provedor-documentacao-em-editor');
            provedor = new FolesProvedorDocumentacaoEmEditor();
        });

        it('instância criada', () => {
            expect(provedor).toBeDefined();
        });

        it('hover em modificador "alinhamento"', () => {
            const result = provedor.provideHover(criarDocumento('alinhamento'), mockPos, mockToken);
            expect(result).toBeDefined();
            expect(result.contents.value).toContain('Alinha o elemento');
        });

        it('hover em modificador "cor"', () => {
            const result = provedor.provideHover(criarDocumento('cor'), mockPos, mockToken);
            expect(result).toBeDefined();
            expect(result.contents.value).toContain('Define a cor');
        });

        it('appendCodeblock chamado com exemploCodigo', () => {
            const result = provedor.provideHover(criarDocumento('alinhamento'), mockPos, mockToken);
            expect(result.contents.value).toContain('alinhamento: centro');
        });
    });

    // ────── LinConEsProvedorDocumentacaoEmEditor ──────
    describe('LinConEsProvedorDocumentacaoEmEditor', () => {
        let provedor: any;
        beforeEach(() => {
            const { LinConEsProvedorDocumentacaoEmEditor } = require('../../fontes/documentacao-em-editor/lincones-provedor-documentacao-em-editor');
            provedor = new LinConEsProvedorDocumentacaoEmEditor();
        });

        it('instância criada', () => {
            expect(provedor).toBeDefined();
        });

        it('hover em modificador "negrito"', () => {
            const result = provedor.provideHover(criarDocumento('negrito'), mockPos, mockToken);
            expect(result).toBeDefined();
            expect(result.contents.value).toContain('negrito');
        });

        it('hover em modificador "italico"', () => {
            const result = provedor.provideHover(criarDocumento('italico'), mockPos, mockToken);
            expect(result).toBeDefined();
        });
    });

    // ────── LmhtProvedorDocumentacaoEmEditor ──────
    describe('LmhtProvedorDocumentacaoEmEditor', () => {
        let provedor: any;
        beforeEach(() => {
            const { LmhtProvedorDocumentacaoEmEditor } = require('../../fontes/documentacao-em-editor/lmht-provedor-documentacao-em-editor');
            provedor = new LmhtProvedorDocumentacaoEmEditor();
        });

        it('instância criada', () => {
            expect(provedor).toBeDefined();
        });

        it('hover em elemento "paragrafo"', () => {
            const result = provedor.provideHover(criarDocumento('paragrafo'), mockPos, mockToken);
            expect(result).toBeDefined();
            expect(result.contents.value).toContain('parágrafo');
        });

        it('hover em elemento "divisao"', () => {
            const result = provedor.provideHover(criarDocumento('divisao'), mockPos, mockToken);
            expect(result).toBeDefined();
        });
    });

    // ────── DelpropsProvedorDocumentacaoEmEditor ──────
    describe('DelpropsProvedorDocumentacaoEmEditor', () => {
        let provedor: any;
        beforeEach(() => {
            const { DelpropsProvedorDocumentacaoEmEditor } = require('../../fontes/documentacao-em-editor/delprops-provedor-documentacao-em-editor');
            provedor = new DelpropsProvedorDocumentacaoEmEditor();
        });

        it('instância criada', () => {
            expect(provedor).toBeDefined();
        });

        it('linha com "liquido" no segmento 0 → hover do namespace liquido', () => {
            const doc = {
                lineAt: jest.fn().mockReturnValue({ text: 'liquido' }),
                getText: jest.fn().mockReturnValue(''),
                getWordRangeAtPosition: jest.fn().mockReturnValue({}),
            };
            const result = provedor.provideHover(doc, { line: 0, character: 0 }, mockToken);
            expect(result).toBeDefined();
            expect(result.contents.value).toContain('liquido');
        });

        it('"liquido.roteador" no segmento 1 → hover do subnamespace', () => {
            const doc = {
                lineAt: jest.fn().mockReturnValue({ text: 'liquido.roteador' }),
                getText: jest.fn().mockReturnValue(''),
                getWordRangeAtPosition: jest.fn().mockReturnValue({}),
            };
            const result = provedor.provideHover(doc, { line: 0, character: 9 }, mockToken);
            expect(result).toBeDefined();
            expect(result.contents.value).toContain('roteador');
        });

        it('"liquido.dados" no segmento 1 → menção ao identificador livre', () => {
            const doc = {
                lineAt: jest.fn().mockReturnValue({ text: 'liquido.dados' }),
                getText: jest.fn().mockReturnValue(''),
                getWordRangeAtPosition: jest.fn().mockReturnValue({}),
            };
            const result = provedor.provideHover(doc, { line: 0, character: 9 }, mockToken);
            expect(result).toBeDefined();
            expect(result.contents.value).toContain('nome');
        });

        it('"liquido.roteador.porta" no segmento 2 → hover da propriedade', () => {
            const doc = {
                lineAt: jest.fn().mockReturnValue({ text: 'liquido.roteador.porta' }),
                getText: jest.fn().mockReturnValue(''),
                getWordRangeAtPosition: jest.fn().mockReturnValue({}),
            };
            const result = provedor.provideHover(doc, { line: 0, character: 18 }, mockToken);
            expect(result).toBeDefined();
            expect(result.contents.value).toContain('porta');
        });

        it('"liquido.roteador.porta" → mostra padrão quando existe', () => {
            const doc = {
                lineAt: jest.fn().mockReturnValue({ text: 'liquido.roteador.porta' }),
                getText: jest.fn().mockReturnValue(''),
                getWordRangeAtPosition: jest.fn().mockReturnValue({}),
            };
            const result = provedor.provideHover(doc, { line: 0, character: 18 }, mockToken);
            expect(result.contents.value).toContain('3000');
        });

        it('"liquido.dados.nome.tecnologia" no segmento 3 → hover da propriedade de dados', () => {
            const doc = {
                lineAt: jest.fn().mockReturnValue({ text: 'liquido.dados.nome.tecnologia' }),
                getText: jest.fn().mockReturnValue(''),
                getWordRangeAtPosition: jest.fn().mockReturnValue({}),
            };
            const result = provedor.provideHover(doc, { line: 0, character: 20 }, mockToken);
            expect(result).toBeDefined();
            expect(result.contents.value).toContain('sqlite');
        });

        it('"liquido.autenticacao.segredo" → hover da propriedade', () => {
            const doc = {
                lineAt: jest.fn().mockReturnValue({ text: 'liquido.autenticacao.segredo' }),
                getText: jest.fn().mockReturnValue(''),
                getWordRangeAtPosition: jest.fn().mockReturnValue({}),
            };
            const result = provedor.provideHover(doc, { line: 0, character: 22 }, mockToken);
            expect(result).toBeDefined();
        });

        it('linha que não começa com "liquido" → undefined', () => {
            const doc = {
                lineAt: jest.fn().mockReturnValue({ text: 'outro.namespace.prop' }),
                getText: jest.fn().mockReturnValue(''),
                getWordRangeAtPosition: jest.fn().mockReturnValue({}),
            };
            const result = provedor.provideHover(doc, { line: 0, character: 5 }, mockToken);
            expect(result).toBeUndefined();
        });

        it('linha com comentário ignorado', () => {
            const doc = {
                lineAt: jest.fn().mockReturnValue({ text: 'liquido // comentario' }),
                getText: jest.fn().mockReturnValue(''),
                getWordRangeAtPosition: jest.fn().mockReturnValue({}),
            };
            const result = provedor.provideHover(doc, { line: 0, character: 0 }, mockToken);
            expect(result).toBeDefined();
        });

        it('segmentoAtual === -1 (cursor fora dos tokens) → undefined', () => {
            const doc = {
                lineAt: jest.fn().mockReturnValue({ text: 'liquido.roteador' }),
                getText: jest.fn().mockReturnValue(''),
                getWordRangeAtPosition: jest.fn().mockReturnValue({}),
            };
            // character=100 está além do texto → segmentoAtual = -1
            const result = provedor.provideHover(doc, { line: 0, character: 100 }, mockToken);
            expect(result).toBeUndefined();
        });
    });
});
