// @ts-nocheck
import { describe, it, expect, jest, beforeEach } from '@jest/globals';

class FuncaoDeclaracaoMock {
    constructor(public simbolo: any, public tipo: string, public documentacao?: any) {}
}
class ClasseMock {
    constructor(public simbolo: any, public metodos: any[] = [], public abstrata = false,
        public superClasses?: any[], public mesclas?: any[], public implementa?: any[]) {}
}
class InterfaceDeclaracaoMock {
    constructor(public simbolo: any) {}
}
class VarMock {
    constructor(public simbolo: any, public tipo: any, public inicializador?: any) {}
}
class ConstMock {
    constructor(public simbolo: any, public tipo: any, public inicializador?: any) {}
}
class ParaCadaMock {}
class ChamadaMock {}

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
    Classe: ClasseMock,
    FuncaoDeclaracao: FuncaoDeclaracaoMock,
    InterfaceDeclaracao: InterfaceDeclaracaoMock,
    Var: VarMock,
    Const: ConstMock,
    ParaCada: ParaCadaMock,
}), { virtual: true });

jest.mock('@designliquido/delegua/construtos', () => ({
    ComentarioComoConstruto: class ComentarioComoConstruto {
        constructor(public conteudo: any) {}
    },
    Chamada: ChamadaMock,
}), { virtual: true });

jest.mock('@designliquido/delegua-lsp/analise/cache-analise', () => ({
    obterResultado: jest.fn().mockReturnValue(null),
}), { virtual: true });

jest.mock('@designliquido/delegua-lsp/analise/cache-definicoes', () => ({
    obterDefinicoesPorContexto: jest.fn().mockReturnValue({}),
}), { virtual: true });

jest.mock('../../fontes/bibliotecas/dialetos/pitugues', () => ({
    funcoesNativasPitugues: [
        { nome: 'escreva', documentacao: 'Escreve na saída', exemploCodigo: 'escreva("oi")' },
        { nome: 'leia', documentacao: 'Lê da entrada' },
    ],
    primitivas: [
        { nome: 'escreva', documentacao: 'Escreve' },
    ],
    primitivasDicionarioFormatadas: [
        { nome: 'chaves', documentacao: 'Chaves do dicionário', exemploCodigo: '' },
    ],
    primitivasNumeroFormatadas: [
        { nome: 'absoluto', documentacao: 'Absoluto', exemploCodigo: '' },
    ],
    primitivasTextoFormatadas: [
        { nome: 'maiuscula', documentacao: 'Maiúsculas', exemploCodigo: '' },
    ],
    primitivasVetorFormatadas: [
        { nome: 'adicionar', documentacao: 'Adicionar elemento', exemploCodigo: '' },
    ],
}), { virtual: true });

import { PituguesProvedorDocumentacaoEmEditor } from '../../fontes/documentacao-em-editor/pitugues-provedor-documentacao-em-editor';
import { obterResultado } from '@designliquido/delegua-lsp/analise/cache-analise';

function criarDocumento(palavra: string, linhaTexto?: string): any {
    return {
        uri: { toString: () => 'file:///teste.pit' },
        lineAt: jest.fn().mockReturnValue({ text: linhaTexto ?? palavra }),
        getText: jest.fn().mockReturnValue(palavra),
        getWordRangeAtPosition: jest.fn().mockReturnValue({ start: { character: 2 } }),
    };
}

describe('PituguesProvedorDocumentacaoEmEditor', () => {
    let provedor: any;
    const mockPos: any = { line: 0, character: 5 };
    const mockToken: any = {};

    beforeEach(() => {
        jest.clearAllMocks();
        (obterResultado as jest.Mock).mockReturnValue(null);
        provedor = new PituguesProvedorDocumentacaoEmEditor();
    });

    it('instância criada com sucesso', () => {
        expect(provedor).toBeDefined();
        expect(typeof provedor.provideHover).toBe('function');
    });

    it('retorna undefined quando palavra não encontrada', async () => {
        const result = await provedor.provideHover(criarDocumento('desconhecida'), mockPos, mockToken);
        expect(result).toBeUndefined();
    });

    it('retorna Hover para função nativa "escreva"', async () => {
        const result = await provedor.provideHover(criarDocumento('escreva'), mockPos, mockToken);
        expect(result).toBeDefined();
        expect(result.contents).toBeDefined();
    });

    it('função nativa com exemploCodigo chama appendCodeblock', async () => {
        const hover = await provedor.provideHover(criarDocumento('escreva'), mockPos, mockToken);
        expect(hover.contents.value).toContain('escreva("oi")');
    });

    it('retorna Hover para função nativa "leia" sem exemploCodigo', async () => {
        const result = await provedor.provideHover(criarDocumento('leia'), mockPos, mockToken);
        expect(result).toBeDefined();
    });

    it('retorna Hover para variável do tipo texto via hoverMetodoPrimitivo (maiuscula)', async () => {
        (obterResultado as jest.Mock).mockReturnValue({
            avaliadorSintatico: {
                declaracoes: [
                    new FuncaoDeclaracaoMock({ lexema: 't' }, 'texto'),
                ],
            },
        });
        const doc = criarDocumento('maiuscula', 't.maiuscula');
        const result = await provedor.provideHover(doc, { line: 0, character: 8 }, mockToken);
        expect(result).toBeDefined();
    });

    it('retorna Hover para variável do tipo numero via hoverMetodoPrimitivo (absoluto)', async () => {
        (obterResultado as jest.Mock).mockReturnValue({
            avaliadorSintatico: {
                declaracoes: [
                    new FuncaoDeclaracaoMock({ lexema: 'n' }, 'numero'),
                ],
            },
        });
        const doc = criarDocumento('absoluto', 'n.absoluto');
        const result = await provedor.provideHover(doc, { line: 0, character: 7 }, mockToken);
        expect(result).toBeDefined();
    });

    it('retorna Hover para variável do tipo vetor (adicionar)', async () => {
        (obterResultado as jest.Mock).mockReturnValue({
            avaliadorSintatico: {
                declaracoes: [
                    new FuncaoDeclaracaoMock({ lexema: 'v' }, 'vetor'),
                ],
            },
        });
        const doc = criarDocumento('adicionar', 'v.adicionar');
        const result = await provedor.provideHover(doc, { line: 0, character: 8 }, mockToken);
        expect(result).toBeDefined();
    });

    it('retorna Hover para variável do tipo dicionario (chaves)', async () => {
        (obterResultado as jest.Mock).mockReturnValue({
            avaliadorSintatico: {
                declaracoes: [
                    new FuncaoDeclaracaoMock({ lexema: 'd' }, 'dicionario'),
                ],
            },
        });
        const doc = criarDocumento('chaves', 'd.chaves');
        const result = await provedor.provideHover(doc, { line: 0, character: 5 }, mockToken);
        expect(result).toBeDefined();
    });

    it('retorna Hover (nome:tipo) para FuncaoDeclaracao — hoverVariavelOuConstante tem prioridade', async () => {
        const comentario = { conteudo: 'Documentação da função pitugues' };
        (obterResultado as jest.Mock).mockReturnValue({
            avaliadorSintatico: {
                declaracoes: [
                    new FuncaoDeclaracaoMock({ lexema: 'minhaFuncao' }, 'funcao', comentario),
                ],
            },
        });
        const result = await provedor.provideHover(criarDocumento('minhaFuncao'), mockPos, mockToken);
        expect(result).toBeDefined();
        expect(result.contents.value).toContain('minhaFuncao');
    });

    it('retorna Hover (nome:tipo) para FuncaoDeclaracao com conteúdo array', async () => {
        const comentario = { conteudo: ['linha a', 'linha b'] };
        (obterResultado as jest.Mock).mockReturnValue({
            avaliadorSintatico: {
                declaracoes: [
                    new FuncaoDeclaracaoMock({ lexema: 'funcArray' }, 'funcao', comentario),
                ],
            },
        });
        const result = await provedor.provideHover(criarDocumento('funcArray'), mockPos, mockToken);
        expect(result).toBeDefined();
        expect(result.contents.value).toContain('funcArray');
    });

    it('retorna Hover para método em classe', async () => {
        const comentario = { conteudo: 'Método da classe' };
        const metodo = new FuncaoDeclaracaoMock({ lexema: 'metodoClasse' }, 'funcao', comentario);
        const classe = new ClasseMock({ lexema: 'MinhaClasse' }, [metodo]);
        (obterResultado as jest.Mock).mockReturnValue({
            avaliadorSintatico: { declaracoes: [classe] },
        });
        const result = await provedor.provideHover(criarDocumento('metodoClasse'), mockPos, mockToken);
        expect(result).toBeDefined();
    });

    it('retorna Hover para classe documentada', async () => {
        const classe = new ClasseMock({ lexema: 'ClassePitugues' });
        (obterResultado as jest.Mock).mockReturnValue({
            avaliadorSintatico: { declaracoes: [classe] },
        });
        const result = await provedor.provideHover(criarDocumento('ClassePitugues'), mockPos, mockToken);
        expect(result).toBeDefined();
        expect(result.contents.value).toContain('(classe)');
    });

    it('retorna Hover para classe abstrata pitugues', async () => {
        const classe = new ClasseMock({ lexema: 'ClasseAbstrata' }, [], true);
        (obterResultado as jest.Mock).mockReturnValue({
            avaliadorSintatico: { declaracoes: [classe] },
        });
        const result = await provedor.provideHover(criarDocumento('ClasseAbstrata'), mockPos, mockToken);
        expect(result).toBeDefined();
        expect(result.contents.value).toContain('(classe abstrata)');
    });

    it('retorna Hover para classe com superClasses', async () => {
        const classe = new ClasseMock({ lexema: 'Filho' }, [], false, [{ simbolo: { lexema: 'Pai' } }]);
        (obterResultado as jest.Mock).mockReturnValue({
            avaliadorSintatico: { declaracoes: [classe] },
        });
        const result = await provedor.provideHover(criarDocumento('Filho'), mockPos, mockToken);
        expect(result.contents.value).toContain('herda Pai');
    });

    it('retorna Hover para classe com mesclas', async () => {
        const classe = new ClasseMock({ lexema: 'ComMixin' }, [], false, undefined, [{ simbolo: { lexema: 'MixinA' } }]);
        (obterResultado as jest.Mock).mockReturnValue({
            avaliadorSintatico: { declaracoes: [classe] },
        });
        const result = await provedor.provideHover(criarDocumento('ComMixin'), mockPos, mockToken);
        expect(result.contents.value).toContain('mescla MixinA');
    });

    it('retorna Hover para classe com implementa', async () => {
        const classe = new ClasseMock({ lexema: 'ImplClasse' }, [], false, undefined, undefined, [{ lexema: 'IFoo' }]);
        (obterResultado as jest.Mock).mockReturnValue({
            avaliadorSintatico: { declaracoes: [classe] },
        });
        const result = await provedor.provideHover(criarDocumento('ImplClasse'), mockPos, mockToken);
        expect(result.contents.value).toContain('implementa IFoo');
    });

    it('retorna Hover para interface via regex no código fonte', async () => {
        const iface = new InterfaceDeclaracaoMock({ lexema: 'IMinhaInterface' });
        (obterResultado as jest.Mock).mockReturnValue({
            avaliadorSintatico: { declaracoes: [iface] },
        });
        const codigoFonte = '/** Descrição interface */\ninterface IMinhaInterface {}';
        const doc = {
            uri: { toString: () => 'file:///teste.pit' },
            lineAt: jest.fn().mockReturnValue({ text: 'IMinhaInterface' }),
            getText: jest.fn((range?: any) => range ? 'IMinhaInterface' : codigoFonte),
            getWordRangeAtPosition: jest.fn().mockReturnValue({ start: { character: 0 } }),
        };
        const result = await provedor.provideHover(doc, { line: 0, character: 7 }, mockToken);
        expect(result).toBeDefined();
    });

    it('retorna undefined para interface não encontrada no regex', async () => {
        const iface = new InterfaceDeclaracaoMock({ lexema: 'INaoDocumentada' });
        (obterResultado as jest.Mock).mockReturnValue({
            avaliadorSintatico: { declaracoes: [iface] },
        });
        const doc = {
            uri: { toString: () => 'file:///teste.pit' },
            lineAt: jest.fn().mockReturnValue({ text: 'INaoDocumentada' }),
            getText: jest.fn((range?: any) => range ? 'INaoDocumentada' : 'sem comentario'),
            getWordRangeAtPosition: jest.fn().mockReturnValue({ start: { character: 0 } }),
        };
        const result = await provedor.provideHover(doc, { line: 0, character: 7 }, mockToken);
        expect(result).toBeUndefined();
    });

    it('cache nulo, palavra desconhecida → undefined', async () => {
        (obterResultado as jest.Mock).mockReturnValue(null);
        const result = await provedor.provideHover(criarDocumento('palavraEstranha'), mockPos, mockToken);
        expect(result).toBeUndefined();
    });

    it('retorna Hover para parâmetro de função no pitugues', async () => {
        const funcaoMock = new FuncaoDeclaracaoMock({ lexema: 'calcular', linha: 1 }, 'numero');
        (funcaoMock as any).funcao = {
            parametros: [{ nome: { lexema: 'entrada' }, tipoDado: 'numero' }],
            corpo: [],
        };
        (obterResultado as jest.Mock).mockReturnValue({
            avaliadorSintatico: { declaracoes: [funcaoMock] },
        });
        const doc = {
            uri: { toString: () => 'file:///teste.pit' },
            lineAt: jest.fn().mockReturnValue({ text: 'entrada' }),
            getText: jest.fn().mockReturnValue('entrada'),
            getWordRangeAtPosition: jest.fn().mockReturnValue({ start: { character: 0 } }),
        };
        const result = await provedor.provideHover(doc, { line: 0, character: 4 }, mockToken);
        expect(result).toBeDefined();
        expect(result.contents.value).toContain('entrada');
    });

    it('retorna Hover para propriedade de classe com "isto." no pitugues', async () => {
        const classeMock = new ClasseMock({ lexema: 'ContaPit', linha: 1 });
        (classeMock as any).propriedades = [{ nome: { lexema: 'saldo' }, tipo: 'numero' }];
        (obterResultado as jest.Mock).mockReturnValue({
            avaliadorSintatico: { declaracoes: [classeMock] },
        });
        const doc = {
            uri: { toString: () => 'file:///teste.pit' },
            lineAt: jest.fn().mockReturnValue({ text: 'isto.saldo' }),
            getText: jest.fn().mockReturnValue('saldo'),
            getWordRangeAtPosition: jest.fn().mockReturnValue({ start: { character: 5 } }),
        };
        const result = await provedor.provideHover(doc, { line: 0, character: 7 }, mockToken);
        expect(result).toBeDefined();
        expect(result.contents.value).toContain('saldo');
    });

    it('retorna Hover para variável de iteração em para cada no pitugues', async () => {
        const paraCadaMock = new ParaCadaMock();
        (paraCadaMock as any).variavelIteracao = { simbolo: { lexema: 'elemento' } };
        (paraCadaMock as any).vetorOuDicionario = { tipo: 'texto[]' };
        const funcaoMock = new FuncaoDeclaracaoMock({ lexema: 'processar', linha: 1 }, 'vazio');
        (funcaoMock as any).funcao = {
            parametros: [],
            corpo: [paraCadaMock],
        };
        (obterResultado as jest.Mock).mockReturnValue({
            avaliadorSintatico: { declaracoes: [funcaoMock] },
        });
        const doc = {
            uri: { toString: () => 'file:///teste.pit' },
            lineAt: jest.fn().mockReturnValue({ text: 'elemento' }),
            getText: jest.fn().mockReturnValue('elemento'),
            getWordRangeAtPosition: jest.fn().mockReturnValue({ start: { character: 0 } }),
        };
        const result = await provedor.provideHover(doc, { line: 2, character: 4 }, mockToken);
        expect(result).toBeDefined();
        expect(result.contents.value).toContain('elemento');
    });

    it('retorna assinatura de função sem documentação no pitugues', async () => {
        const funcaoMock = new FuncaoDeclaracaoMock({ lexema: 'somar', linha: 1 }, 'numero');
        (funcaoMock as any).funcao = {
            parametros: [
                { nome: { lexema: 'x' }, tipoDado: 'numero' },
                { nome: { lexema: 'y' }, tipoDado: 'numero' },
            ],
            corpo: [],
        };
        (obterResultado as jest.Mock).mockReturnValue({
            avaliadorSintatico: { declaracoes: [funcaoMock] },
        });
        const doc = {
            uri: { toString: () => 'file:///teste.pit' },
            lineAt: jest.fn().mockReturnValue({ text: 'somar' }),
            getText: jest.fn().mockReturnValue('somar'),
            getWordRangeAtPosition: jest.fn().mockReturnValue({ start: { character: 0 } }),
        };
        const result = await provedor.provideHover(doc, { line: 0, character: 3 }, mockToken);
        expect(result).toBeDefined();
        expect(result.contents.value).toContain('somar');
    });

    it('retorna Hover para classe com documentação no pitugues', async () => {
        const classeMock = new ClasseMock({ lexema: 'ContaPit', linha: 1 }, []);
        (classeMock as any).documentacao = { conteudo: '@resumo Classe de conta pituguesa' };
        (obterResultado as jest.Mock).mockReturnValue({
            avaliadorSintatico: { declaracoes: [classeMock] },
        });
        const doc = {
            uri: { toString: () => 'file:///teste.pit' },
            lineAt: jest.fn().mockReturnValue({ text: 'ContaPit' }),
            getText: jest.fn().mockImplementation((arg) => arg ? 'ContaPit' : ''),
            getWordRangeAtPosition: jest.fn().mockReturnValue({ start: { character: 0 } }),
        };
        const result = await provedor.provideHover(doc, { line: 0, character: 4 }, mockToken);
        expect(result).toBeDefined();
    });

    it('retorna Hover para classe via JSDoc no fonte pitugues', async () => {
        const classeMock = new ClasseMock({ lexema: 'ContaPit', linha: 1 }, []);
        (obterResultado as jest.Mock).mockReturnValue({
            avaliadorSintatico: { declaracoes: [classeMock] },
        });
        const fontePit = '/** @resumo Conta\n * Descrição da conta\n */ classe ContaPit {\n}';
        const doc = {
            uri: { toString: () => 'file:///teste.pit' },
            lineAt: jest.fn().mockReturnValue({ text: 'ContaPit' }),
            getText: jest.fn().mockImplementation((arg) => arg ? 'ContaPit' : fontePit),
            getWordRangeAtPosition: jest.fn().mockReturnValue({ start: { character: 0 } }),
        };
        const result = await provedor.provideHover(doc, { line: 0, character: 4 }, mockToken);
        expect(result).toBeDefined();
    });

    it('retorna Hover para método de classe sem receptor no pitugues (loop de classes)', async () => {
        const metodoMock = new FuncaoDeclaracaoMock({ lexema: 'depositar', linha: 5 }, 'vazio');
        (metodoMock as any).funcao = { parametros: [], corpo: [] };
        (metodoMock as any).documentacao = { conteudo: '@resumo Método depositar' };
        const classeMock = new ClasseMock({ lexema: 'ContaPit', linha: 1 }, [metodoMock]);
        (obterResultado as jest.Mock).mockReturnValue({
            avaliadorSintatico: { declaracoes: [classeMock] },
        });
        const doc = {
            uri: { toString: () => 'file:///teste.pit' },
            lineAt: jest.fn().mockReturnValue({ text: 'depositar' }),
            getText: jest.fn().mockReturnValue('depositar'),
            getWordRangeAtPosition: jest.fn().mockReturnValue({ start: { character: 0 } }),
        };
        const result = await provedor.provideHover(doc, { line: 0, character: 5 }, mockToken);
        expect(result).toBeDefined();
        expect(result.contents.value).toContain('depositar');
    });
});
