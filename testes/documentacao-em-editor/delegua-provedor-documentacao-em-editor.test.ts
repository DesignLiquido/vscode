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
class ParaCadaMock {
    constructor(public variavelIteracao: any, public vetorOuDicionario: any, public corpo?: any) {}
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
    ParaCada: ParaCadaMock,
}), { virtual: true });

jest.mock('@designliquido/delegua/construtos', () => ({
    Chamada: class Chamada {},
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

jest.mock('@designliquido/delegua-lsp/analise/cache-analise', () => ({
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
import { obterResultado } from '@designliquido/delegua-lsp/analise/cache-analise';

function criarDocumento(overrides: Partial<any> = {}): any {
    return {
        uri: { toString: () => 'file:///teste.delegua' },
        lineAt: jest.fn().mockReturnValue({ text: '' }),
        getText: jest.fn().mockReturnValue(''),
        getWordRangeAtPosition: jest.fn().mockReturnValue({ start: { character: 0 } }),
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

    it('instância criada com sucesso', async () => {
        expect(provedor).toBeDefined();
        expect(typeof provedor.provideHover).toBe('function');
    });

    it('retorna undefined quando palavra não encontrada em nada', async () => {
        const doc = criarDocumento({
            getText: jest.fn().mockReturnValue(''),
        });
        const result = await provedor.provideHover(doc, mockPos, mockToken);
        expect(result).toBeUndefined();
    });

    it('retorna Hover para função nativa "escreva"', async () => {
        const doc = criarDocumento({
            getText: jest.fn().mockReturnValue('escreva'),
            lineAt: jest.fn().mockReturnValue({ text: 'escreva' }),
        });
        const result = await provedor.provideHover(doc, { line: 0, character: 3 }, mockToken);
        expect(result).toBeDefined();
        expect(result.contents).toBeDefined();
    });

    it('função nativa com exemploCodigo chama appendCodeblock', async () => {
        const doc = criarDocumento({
            getText: jest.fn().mockReturnValue('escreva'),
            lineAt: jest.fn().mockReturnValue({ text: 'escreva' }),
        });
        const hover = await provedor.provideHover(doc, { line: 0, character: 3 }, mockToken);
        expect(hover).toBeDefined();
        expect(hover.contents.value).toContain('escreva("oi")');
    });

    it('retorna Hover para função nativa "leia" (sem exemploCodigo)', async () => {
        const doc = criarDocumento({
            getText: jest.fn().mockReturnValue('leia'),
            lineAt: jest.fn().mockReturnValue({ text: 'leia' }),
        });
        const result = await provedor.provideHover(doc, { line: 0, character: 2 }, mockToken);
        expect(result).toBeDefined();
    });

    it('retorna Hover para variável declarada com Var', async () => {
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
        const result = await provedor.provideHover(doc, { line: 0, character: 4 }, mockToken);
        expect(result).toBeDefined();
        expect(result.contents.value).toContain('minhaVar');
    });

    it('retorna Hover para constante declarada com Const', async () => {
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
        const result = await provedor.provideHover(doc, { line: 0, character: 5 }, mockToken);
        expect(result).toBeDefined();
        expect(result.contents.value).toContain('numero');
    });

    it('retorna Hover para função documentada com FuncaoDeclaracao', async () => {
        const comentario = {
            conteudo: [
                'Documentação da função',
                '@param {texto} nome Nome da pessoa',
                '@returns {texto} Saudação formatada',
                '@see ./exemplos/saudacao.delegua'
            ]
        };
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
        const result = await provedor.provideHover(doc, { line: 0, character: 5 }, mockToken);
        expect(result).toBeDefined();
        expect(result.contents.value).toContain('**Parametros**');
        expect(result.contents.value).toContain('**Retorna**');
        expect(result.contents.value).toContain('**Veja tambem**');
    });

    it('retorna Hover para função documentada com conteúdo array', async () => {
        const comentario = { conteudo: ['linha 1', '@summary resumo curto', 'linha 2'] };
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
        const result = await provedor.provideHover(doc, { line: 0, character: 4 }, mockToken);
        expect(result).toBeDefined();
        expect(result.contents.value).toContain('**Resumo**');
    });

    it('retorna Hover para classe documentada (encontra via regex no fonte)', async () => {
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
        const result = await provedor.provideHover(doc, { line: 0, character: 5 }, mockToken);
        expect(result).toBeDefined();
        expect(result.contents).toBeDefined();
    });

    it('retorna Hover para classe abstrata', async () => {
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
        const result = await provedor.provideHover(doc, { line: 0, character: 7 }, mockToken);
        expect(result).toBeDefined();
        // Prefixo deve ser "(classe abstrata)"
        expect(result.contents.value).toContain('(classe abstrata)');
    });

    it('retorna Hover para classe com herança', async () => {
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
        const result = await provedor.provideHover(doc, { line: 0, character: 5 }, mockToken);
        expect(result).toBeDefined();
        expect(result.contents.value).toContain('herda ClassePai');
    });

    it('retorna Hover para classe com mesclas', async () => {
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
        const result = await provedor.provideHover(doc, { line: 0, character: 5 }, mockToken);
        expect(result).toBeDefined();
        expect(result.contents.value).toContain('mescla Mixin');
    });

    it('retorna Hover para classe com implementa', async () => {
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
        const result = await provedor.provideHover(doc, { line: 0, character: 5 }, mockToken);
        expect(result).toBeDefined();
        expect(result.contents.value).toContain('implementa IInterface');
    });

    it('retorna Hover para interface documentada via regex no código', async () => {
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
        const result = await provedor.provideHover(doc, { line: 0, character: 5 }, mockToken);
        expect(result).toBeDefined();
    });

    it('hover em método primitivo (texto antes com "minhaVar.")', async () => {
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
            getWordRangeAtPosition: jest.fn().mockReturnValue({ start: { character: 9 } }),
        });
        const result = await provedor.provideHover(doc, { line: 0, character: 14 }, mockToken);
        // hoverVariavelOuConstante irá retornar 'absoluto' pois 'absoluto' não está em declaracoesPertinentes
        // hoverMetodoPrimitivo pode retornar hover se primitiva encontrada
        expect(result).toBeDefined();
    });

    it('declaracoesPreCarregadas são incluídas', async () => {
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
        const result = await provedor.provideHover(doc, { line: 0, character: 7 }, mockToken);
        expect(result).toBeDefined();
    });

    it('retorna Hover para parâmetro de função', async () => {
        const funcaoMock = new FuncaoDeclaracaoMock({ lexema: 'calcular', linha: 1 }, 'numero');
        (funcaoMock as any).funcao = {
            parametros: [{ nome: { lexema: 'valorEntrada' }, tipoDado: 'numero' }],
            corpo: [],
        };
        (obterResultado as jest.Mock).mockReturnValue({
            avaliadorSintatico: { declaracoes: [funcaoMock] },
            declaracoesPreCarregadas: [],
        });
        const doc = criarDocumento({
            getText: jest.fn().mockReturnValue('valorEntrada'),
            lineAt: jest.fn().mockReturnValue({ text: 'valorEntrada' }),
            getWordRangeAtPosition: jest.fn().mockReturnValue({ start: { character: 0 } }),
        });
        const result = await provedor.provideHover(doc, { line: 0, character: 5 }, mockToken);
        expect(result).toBeDefined();
        expect(result.contents.value).toContain('valorEntrada');
    });

    it('retorna Hover para propriedade de classe com "isto."', async () => {
        const classeMock = new ClasseMock({ lexema: 'MinhaClasse', linha: 1 });
        (classeMock as any).propriedades = [{ nome: { lexema: 'nomePropriedade' }, tipo: 'texto' }];
        (obterResultado as jest.Mock).mockReturnValue({
            avaliadorSintatico: { declaracoes: [classeMock] },
            declaracoesPreCarregadas: [],
        });
        const doc = criarDocumento({
            getText: jest.fn().mockReturnValue('nomePropriedade'),
            lineAt: jest.fn().mockReturnValue({ text: 'isto.nomePropriedade' }),
            getWordRangeAtPosition: jest.fn().mockReturnValue({ start: { character: 5 } }),
        });
        const result = await provedor.provideHover(doc, { line: 0, character: 10 }, mockToken);
        expect(result).toBeDefined();
        expect(result.contents.value).toContain('nomePropriedade');
    });

    it('retorna Hover para variável de iteração de para cada', async () => {
        const paraCadaMock = new ParaCadaMock(
            { simbolo: { lexema: 'item' } },
            { tipo: 'texto[]' }
        );
        const funcaoMock = new FuncaoDeclaracaoMock({ lexema: 'processar', linha: 1 }, 'vazio');
        (funcaoMock as any).funcao = {
            parametros: [],
            corpo: [paraCadaMock],
        };
        (obterResultado as jest.Mock).mockReturnValue({
            avaliadorSintatico: { declaracoes: [funcaoMock] },
            declaracoesPreCarregadas: [],
        });
        const doc = criarDocumento({
            getText: jest.fn().mockReturnValue('item'),
            lineAt: jest.fn().mockReturnValue({ text: 'item' }),
            getWordRangeAtPosition: jest.fn().mockReturnValue({ start: { character: 0 } }),
        });
        const result = await provedor.provideHover(doc, { line: 2, character: 2 }, mockToken);
        expect(result).toBeDefined();
        expect(result.contents.value).toContain('item');
    });

    it('retorna Hover para objeto "liquido" em contexto de rota', async () => {
        const doc = criarDocumento({
            getText: jest.fn().mockReturnValue('liquido'),
            lineAt: jest.fn().mockReturnValue({ text: 'liquido' }),
            getWordRangeAtPosition: jest.fn().mockReturnValue({ start: { character: 0 } }),
            uri: { toString: () => 'file:///projeto/rotas/index.delegua', fsPath: '/projeto/rotas/index.delegua' },
        });
        const result = await provedor.provideHover(doc, { line: 0, character: 3 }, mockToken);
        expect(result).toBeDefined();
        expect(result.contents.value).toContain('liquido');
    });

    it('retorna Hover para objeto "lincones" em contexto de rota', async () => {
        const doc = criarDocumento({
            getText: jest.fn().mockReturnValue('lincones'),
            lineAt: jest.fn().mockReturnValue({ text: 'lincones' }),
            getWordRangeAtPosition: jest.fn().mockReturnValue({ start: { character: 0 } }),
            uri: { toString: () => 'file:///projeto/rotas/index.delegua', fsPath: '/projeto/rotas/index.delegua' },
        });
        const result = await provedor.provideHover(doc, { line: 0, character: 3 }, mockToken);
        expect(result).toBeDefined();
        expect(result.contents.value).toContain('lincones');
    });

    it('retorna Hover para método "rotaGet" de objeto liquido em rota', async () => {
        const doc = criarDocumento({
            getText: jest.fn().mockReturnValue('rotaGet'),
            lineAt: jest.fn().mockReturnValue({ text: 'liquido.rotaGet' }),
            getWordRangeAtPosition: jest.fn().mockReturnValue({ start: { character: 8 } }),
            uri: { toString: () => 'file:///projeto/rotas/index.delegua', fsPath: '/projeto/rotas/index.delegua' },
        });
        const result = await provedor.provideHover(doc, { line: 0, character: 10 }, mockToken);
        expect(result).toBeDefined();
        expect(result.contents.value).toContain('rotaGet');
    });

    it('retorna assinatura de função sem documentação via formatarAssinaturaFuncao', async () => {
        const funcaoMock = new FuncaoDeclaracaoMock({ lexema: 'somar', linha: 1 }, 'numero');
        (funcaoMock as any).funcao = {
            parametros: [
                { nome: { lexema: 'a' }, tipoDado: 'numero' },
                { nome: { lexema: 'b' }, tipoDado: 'numero' },
            ],
            corpo: [],
        };
        (obterResultado as jest.Mock).mockReturnValue({
            avaliadorSintatico: { declaracoes: [funcaoMock] },
            declaracoesPreCarregadas: [],
        });
        const doc = criarDocumento({
            getText: jest.fn().mockReturnValue('somar'),
            lineAt: jest.fn().mockReturnValue({ text: 'somar' }),
            getWordRangeAtPosition: jest.fn().mockReturnValue({ start: { character: 0 } }),
        });
        const result = await provedor.provideHover(doc, { line: 0, character: 3 }, mockToken);
        expect(result).toBeDefined();
        expect(result.contents.value).toContain('somar');
        expect(result.contents.value).toContain('numero');
    });

    it('retorna undefined quando getWordRangeAtPosition retorna null', async () => {
        const doc = criarDocumento({
            getWordRangeAtPosition: jest.fn().mockReturnValue(null),
        });
        const result = await provedor.provideHover(doc, mockPos, mockToken);
        expect(result).toBeUndefined();
    });

    it('retorna Hover para método de classe sem receptor explícito (loop de classes)', async () => {
        const metodoMock = new FuncaoDeclaracaoMock({ lexema: 'sacar', linha: 5 }, 'vazio');
        (metodoMock as any).funcao = { parametros: [], corpo: [] };
        const classeMock = new ClasseMock({ lexema: 'ContaCorrente', linha: 1 }, [metodoMock]);
        (obterResultado as jest.Mock).mockReturnValue({
            avaliadorSintatico: { declaracoes: [classeMock] },
            declaracoesPreCarregadas: [],
        });
        const doc = criarDocumento({
            getText: jest.fn().mockReturnValue('sacar'),
            lineAt: jest.fn().mockReturnValue({ text: 'sacar' }),
            getWordRangeAtPosition: jest.fn().mockReturnValue({ start: { character: 0 } }),
        });
        const result = await provedor.provideHover(doc, { line: 0, character: 3 }, mockToken);
        expect(result).toBeDefined();
        expect(result.contents.value).toContain('sacar');
    });

    it('retorna Hover para método de classe via receptor (Conta.depositar)', async () => {
        const metodoMock = new FuncaoDeclaracaoMock({ lexema: 'depositar', linha: 5 }, 'vazio');
        (metodoMock as any).funcao = {
            parametros: [{ nome: { lexema: 'valor' }, tipoDado: 'numero' }],
            corpo: [],
        };
        const classeMock = new ClasseMock({ lexema: 'Conta', linha: 1 }, [metodoMock]);
        (obterResultado as jest.Mock).mockReturnValue({
            avaliadorSintatico: { declaracoes: [classeMock] },
            declaracoesPreCarregadas: [],
        });
        const doc = criarDocumento({
            getText: jest.fn().mockReturnValue('depositar'),
            lineAt: jest.fn().mockReturnValue({ text: 'Conta.depositar' }),
            getWordRangeAtPosition: jest.fn().mockReturnValue({ start: { character: 6 } }),
        });
        const result = await provedor.provideHover(doc, { line: 0, character: 10 }, mockToken);
        expect(result).toBeDefined();
        expect(result.contents.value).toContain('depositar');
    });
});
