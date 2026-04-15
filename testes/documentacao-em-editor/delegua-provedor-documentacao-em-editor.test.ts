// @ts-nocheck
import { describe, it, expect, jest, beforeEach } from '@jest/globals';

// Classes reais para que instanceof funcione
class VarMock {
    constructor(public simbolo: any, public tipo: string) {}
}
class ConstMock {
    constructor(public simbolo: any, public tipo: string) {}
}
class FuncaoDeclaracaoMock {
    constructor(public simbolo: any, public tipo: string, public documentacao?: any) {}
}
class ClasseMock {
    constructor(public simbolo: any, public metodos: any[] = [], public documentacao?: any,
        public abstrata = false, public superClasses?: any[], public mesclas?: any[], public implementa?: any[]) {}
}
class InterfaceDeclaracaoMock {
    constructor(public simbolo: any) {}
}

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

jest.mock('@designliquido/delegua/declaracoes', () => ({
    Var: VarMock,
    Const: ConstMock,
    FuncaoDeclaracao: FuncaoDeclaracaoMock,
    Classe: ClasseMock,
    InterfaceDeclaracao: InterfaceDeclaracaoMock,
}), { virtual: true });

jest.mock('@designliquido/delegua/construtos', () => ({
    ComentarioComoConstruto: class ComentarioComoConstruto {
        constructor(public conteudo: any) {}
    },
}), { virtual: true });

jest.mock('@designliquido/delegua/bibliotecas/primitivas-dicionario', () => ({
    __esModule: true,
    default: {
        chaves: { argumentos: [], documentacao: 'Retorna as chaves', exemploCodigo: '' },
    },
}), { virtual: true });

jest.mock('@designliquido/delegua/bibliotecas/primitivas-numero', () => ({
    __esModule: true,
    default: {
        absoluto: { argumentos: [], documentacao: 'Retorna absoluto', exemploCodigo: 'absoluto(-1)' },
    },
}), { virtual: true });

jest.mock('@designliquido/delegua/bibliotecas/primitivas-texto', () => ({
    __esModule: true,
    default: {
        maiuscula: { argumentos: [], documentacao: 'Converte maiúsculas', exemploCodigo: '' },
    },
}), { virtual: true });

jest.mock('@designliquido/delegua/bibliotecas/primitivas-vetor', () => ({
    __esModule: true,
    default: {
        adicionar: { argumentos: [], documentacao: 'Adiciona elemento', exemploCodigo: '' },
    },
}), { virtual: true });

jest.mock('../../fontes/analise-codigo/cache-analise', () => ({
    obterResultado: jest.fn().mockReturnValue(null),
}), { virtual: true });

jest.mock('../../fontes/bibliotecas', () => ({
    formatarPrimitivas: jest.fn((modulo) => {
        if (!modulo) return [];
        return Object.keys(modulo).map(nome => ({ nome, documentacao: modulo[nome].documentacao, exemploCodigo: modulo[nome].exemploCodigo }));
    }),
    funcoesNativasDelegua: [
        { nome: 'escreva', documentacao: 'Escreve na saída', exemploCodigo: 'escreva("oi")' },
        { nome: 'leia', documentacao: 'Lê da entrada' },
    ],
}), { virtual: true });

import { DeleguaProvedorDocumentacaoEmEditor } from '../../fontes/documentacao-em-editor/delegua-provedor-documentacao-em-editor';
import { obterResultado } from '../../fontes/analise-codigo/cache-analise';

function criarDocumento(overrides: Partial<any> = {}): any {
    return {
        uri: { toString: () => 'file:///teste.delegua' },
        lineAt: jest.fn().mockReturnValue({ text: '' }),
        getText: jest.fn().mockReturnValue(''),
        getWordRangeAtPosition: jest.fn().mockReturnValue({}),
        ...overrides,
    };
}

describe('DeleguaProvedorDocumentacaoEmEditor', () => {
    let provedor: any;
    const mockPos: any = { line: 0, character: 5 };
    const mockToken: any = {};

    beforeEach(() => {
        jest.clearAllMocks();
        (obterResultado as jest.Mock).mockReturnValue(null);
        provedor = new DeleguaProvedorDocumentacaoEmEditor();
    });

    it('instância criada com sucesso', () => {
        expect(provedor).toBeDefined();
        expect(typeof provedor.provideHover).toBe('function');
    });

    it('retorna undefined quando palavra não encontrada em nada', () => {
        const doc = criarDocumento({
            getText: jest.fn().mockReturnValue(''),
        });
        const result = provedor.provideHover(doc, mockPos, mockToken);
        expect(result).toBeUndefined();
    });

    it('retorna Hover para função nativa "escreva"', () => {
        const doc = criarDocumento({
            getText: jest.fn().mockReturnValue('escreva'),
            lineAt: jest.fn().mockReturnValue({ text: 'escreva' }),
        });
        const result = provedor.provideHover(doc, { line: 0, character: 3 }, mockToken);
        expect(result).toBeDefined();
        expect(result.contents).toBeDefined();
    });

    it('função nativa com exemploCodigo chama appendCodeblock', () => {
        const doc = criarDocumento({
            getText: jest.fn().mockReturnValue('escreva'),
            lineAt: jest.fn().mockReturnValue({ text: 'escreva' }),
        });
        const hover = provedor.provideHover(doc, { line: 0, character: 3 }, mockToken);
        expect(hover).toBeDefined();
        expect(hover.contents.value).toContain('escreva("oi")');
    });

    it('retorna Hover para função nativa "leia" (sem exemploCodigo)', () => {
        const doc = criarDocumento({
            getText: jest.fn().mockReturnValue('leia'),
            lineAt: jest.fn().mockReturnValue({ text: 'leia' }),
        });
        const result = provedor.provideHover(doc, { line: 0, character: 2 }, mockToken);
        expect(result).toBeDefined();
    });

    it('retorna Hover para variável declarada com Var', () => {
        (obterResultado as jest.Mock).mockReturnValue({
            avaliadorSintatico: {
                declaracoes: [
                    new VarMock({ lexema: 'minhaVar' }, 'texto'),
                ],
            },
            declaracoesPreCarregadas: [],
        });
        const doc = criarDocumento({
            getText: jest.fn().mockReturnValue('minhaVar'),
            lineAt: jest.fn().mockReturnValue({ text: 'minhaVar' }),
        });
        const result = provedor.provideHover(doc, { line: 0, character: 4 }, mockToken);
        expect(result).toBeDefined();
        expect(result.contents.value).toContain('minhaVar');
    });

    it('retorna Hover para constante declarada com Const', () => {
        (obterResultado as jest.Mock).mockReturnValue({
            avaliadorSintatico: {
                declaracoes: [
                    new ConstMock({ lexema: 'MINHA_CONST' }, 'numero'),
                ],
            },
            declaracoesPreCarregadas: [],
        });
        const doc = criarDocumento({
            getText: jest.fn().mockReturnValue('MINHA_CONST'),
            lineAt: jest.fn().mockReturnValue({ text: 'MINHA_CONST' }),
        });
        const result = provedor.provideHover(doc, { line: 0, character: 5 }, mockToken);
        expect(result).toBeDefined();
        expect(result.contents.value).toContain('numero');
    });

    it('retorna Hover para função documentada com FuncaoDeclaracao', () => {
        const comentario = { conteudo: 'Documentação da função' };
        (obterResultado as jest.Mock).mockReturnValue({
            avaliadorSintatico: {
                declaracoes: [
                    new FuncaoDeclaracaoMock({ lexema: 'minhaFuncao' }, 'funcao', comentario),
                ],
            },
            declaracoesPreCarregadas: [],
        });
        const doc = criarDocumento({
            getText: jest.fn().mockReturnValue('minhaFuncao'),
            lineAt: jest.fn().mockReturnValue({ text: 'minhaFuncao' }),
        });
        const result = provedor.provideHover(doc, { line: 0, character: 5 }, mockToken);
        expect(result).toBeDefined();
    });

    it('retorna Hover para função documentada com conteúdo array', () => {
        const comentario = { conteudo: ['linha 1', 'linha 2'] };
        (obterResultado as jest.Mock).mockReturnValue({
            avaliadorSintatico: {
                declaracoes: [
                    new FuncaoDeclaracaoMock({ lexema: 'funcArray' }, 'funcao', comentario),
                ],
            },
            declaracoesPreCarregadas: [],
        });
        const doc = criarDocumento({
            getText: jest.fn().mockReturnValue('funcArray'),
            lineAt: jest.fn().mockReturnValue({ text: 'funcArray' }),
        });
        const result = provedor.provideHover(doc, { line: 0, character: 4 }, mockToken);
        expect(result).toBeDefined();
    });

    it('retorna Hover para classe documentada (encontra via regex no fonte)', () => {
        (obterResultado as jest.Mock).mockReturnValue({
            avaliadorSintatico: {
                declaracoes: [
                    new ClasseMock({ lexema: 'MinhaClasse' }),
                ],
            },
            declaracoesPreCarregadas: [],
        });
        const codigoFonte = '/** Documentação da classe */\nclasse MinhaClasse {\n}';
        const doc = criarDocumento({
            getText: jest.fn().mockReturnValue('MinhaClasse'),
            lineAt: jest.fn().mockReturnValue({ text: 'MinhaClasse' }),
        });
        const result = provedor.provideHover(doc, { line: 0, character: 5 }, mockToken);
        expect(result).toBeDefined();
        expect(result.contents).toBeDefined();
    });

    it('retorna Hover para classe abstrata', () => {
        (obterResultado as jest.Mock).mockReturnValue({
            avaliadorSintatico: {
                declaracoes: [
                    new ClasseMock({ lexema: 'ClasseAbstrata' }, [], null, true),
                ],
            },
            declaracoesPreCarregadas: [],
        });
        const doc = criarDocumento({
            getText: jest.fn().mockReturnValue('ClasseAbstrata'),
            lineAt: jest.fn().mockReturnValue({ text: 'ClasseAbstrata' }),
        });
        const result = provedor.provideHover(doc, { line: 0, character: 7 }, mockToken);
        expect(result).toBeDefined();
        // Prefixo deve ser "(classe abstrata)"
        expect(result.contents.value).toContain('(classe abstrata)');
    });

    it('retorna Hover para classe com herança', () => {
        (obterResultado as jest.Mock).mockReturnValue({
            avaliadorSintatico: {
                declaracoes: [
                    new ClasseMock({ lexema: 'ClasseFilha' }, [], null, false,
                        [{ simbolo: { lexema: 'ClassePai' } }]),
                ],
            },
            declaracoesPreCarregadas: [],
        });
        const doc = criarDocumento({
            getText: jest.fn().mockReturnValue('ClasseFilha'),
            lineAt: jest.fn().mockReturnValue({ text: 'ClasseFilha' }),
        });
        const result = provedor.provideHover(doc, { line: 0, character: 5 }, mockToken);
        expect(result).toBeDefined();
        expect(result.contents.value).toContain('herda ClassePai');
    });

    it('retorna Hover para classe com mesclas', () => {
        (obterResultado as jest.Mock).mockReturnValue({
            avaliadorSintatico: {
                declaracoes: [
                    new ClasseMock({ lexema: 'ClasseMescla' }, [], null, false,
                        undefined, [{ simbolo: { lexema: 'Mixin' } }]),
                ],
            },
            declaracoesPreCarregadas: [],
        });
        const doc = criarDocumento({
            getText: jest.fn().mockReturnValue('ClasseMescla'),
            lineAt: jest.fn().mockReturnValue({ text: 'ClasseMescla' }),
        });
        const result = provedor.provideHover(doc, { line: 0, character: 5 }, mockToken);
        expect(result).toBeDefined();
        expect(result.contents.value).toContain('mescla Mixin');
    });

    it('retorna Hover para classe com implementa', () => {
        (obterResultado as jest.Mock).mockReturnValue({
            avaliadorSintatico: {
                declaracoes: [
                    new ClasseMock({ lexema: 'ClasseImpl' }, [], null, false,
                        undefined, undefined, [{ lexema: 'IInterface' }]),
                ],
            },
            declaracoesPreCarregadas: [],
        });
        const doc = criarDocumento({
            getText: jest.fn().mockReturnValue('ClasseImpl'),
            lineAt: jest.fn().mockReturnValue({ text: 'ClasseImpl' }),
        });
        const result = provedor.provideHover(doc, { line: 0, character: 5 }, mockToken);
        expect(result).toBeDefined();
        expect(result.contents.value).toContain('implementa IInterface');
    });

    it('retorna Hover para interface documentada via regex no código', () => {
        (obterResultado as jest.Mock).mockReturnValue({
            avaliadorSintatico: {
                declaracoes: [
                    new InterfaceDeclaracaoMock({ lexema: 'MinhaInterface' }),
                ],
            },
            declaracoesPreCarregadas: [],
        });
        const codigoFonte = '/** Docs da interface */\ninterface MinhaInterface {}';
        const doc = criarDocumento({
            getText: jest.fn((range?: any) => range ? 'MinhaInterface' : codigoFonte),
            lineAt: jest.fn().mockReturnValue({ text: 'MinhaInterface' }),
        });
        const result = provedor.provideHover(doc, { line: 0, character: 5 }, mockToken);
        expect(result).toBeDefined();
    });

    it('hover em método primitivo (texto antes com "minhaVar.")', () => {
        (obterResultado as jest.Mock).mockReturnValue({
            avaliadorSintatico: {
                declaracoes: [
                    new VarMock({ lexema: 'minhaVar' }, 'numero'),
                ],
            },
            declaracoesPreCarregadas: [],
        });
        // getWordRangeAtPosition returns {}, getText({}) returns 'absoluto' (the method)
        // texto da linha tem "minhaVar.absoluto" → hoverMetodoPrimitivo detecta objeto "minhaVar"
        const doc = criarDocumento({
            getText: jest.fn((range?: any) => 'absoluto'),
            lineAt: jest.fn().mockReturnValue({ text: 'minhaVar.absoluto' }),
        });
        const result = provedor.provideHover(doc, { line: 0, character: 14 }, mockToken);
        // hoverVariavelOuConstante irá retornar 'absoluto' pois 'absoluto' não está em declaracoesPertinentes
        // hoverMetodoPrimitivo pode retornar hover se primitiva encontrada
        expect(result).toBeDefined();
    });

    it('declaracoesPreCarregadas são incluídas', () => {
        (obterResultado as jest.Mock).mockReturnValue({
            avaliadorSintatico: { declaracoes: [] },
            declaracoesPreCarregadas: [
                new VarMock({ lexema: 'varPreCarregada' }, 'texto'),
            ],
        });
        const doc = criarDocumento({
            getText: jest.fn().mockReturnValue('varPreCarregada'),
            lineAt: jest.fn().mockReturnValue({ text: 'varPreCarregada' }),
        });
        const result = provedor.provideHover(doc, { line: 0, character: 7 }, mockToken);
        expect(result).toBeDefined();
    });
});
