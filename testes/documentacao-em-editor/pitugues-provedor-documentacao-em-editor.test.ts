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
}), { virtual: true });

jest.mock('@designliquido/delegua/construtos', () => ({
    ComentarioComoConstruto: class ComentarioComoConstruto {
        constructor(public conteudo: any) {}
    },
}), { virtual: true });

jest.mock('../../fontes/analise-codigo/cache-analise', () => ({
    obterResultado: jest.fn().mockReturnValue(null),
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
import { obterResultado } from '../../fontes/analise-codigo/cache-analise';

function criarDocumento(palavra: string, linhaTexto?: string): any {
    return {
        uri: { toString: () => 'file:///teste.pit' },
        lineAt: jest.fn().mockReturnValue({ text: linhaTexto ?? palavra }),
        getText: jest.fn().mockReturnValue(palavra),
        getWordRangeAtPosition: jest.fn().mockReturnValue({}),
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

    it('retorna undefined quando palavra não encontrada', () => {
        const result = provedor.provideHover(criarDocumento('desconhecida'), mockPos, mockToken);
        expect(result).toBeUndefined();
    });

    it('retorna Hover para função nativa "escreva"', () => {
        const result = provedor.provideHover(criarDocumento('escreva'), mockPos, mockToken);
        expect(result).toBeDefined();
        expect(result.contents).toBeDefined();
    });

    it('função nativa com exemploCodigo chama appendCodeblock', () => {
        const hover = provedor.provideHover(criarDocumento('escreva'), mockPos, mockToken);
        expect(hover.contents.value).toContain('escreva("oi")');
    });

    it('retorna Hover para função nativa "leia" sem exemploCodigo', () => {
        const result = provedor.provideHover(criarDocumento('leia'), mockPos, mockToken);
        expect(result).toBeDefined();
    });

    it('retorna Hover para variável do tipo texto via hoverMetodoPrimitivo (maiuscula)', () => {
        (obterResultado as jest.Mock).mockReturnValue({
            avaliadorSintatico: {
                declaracoes: [
                    new FuncaoDeclaracaoMock({ lexema: 't' }, 'texto'),
                ],
            },
        });
        const doc = criarDocumento('maiuscula', 't.maiuscula');
        const result = provedor.provideHover(doc, { line: 0, character: 8 }, mockToken);
        expect(result).toBeDefined();
    });

    it('retorna Hover para variável do tipo numero via hoverMetodoPrimitivo (absoluto)', () => {
        (obterResultado as jest.Mock).mockReturnValue({
            avaliadorSintatico: {
                declaracoes: [
                    new FuncaoDeclaracaoMock({ lexema: 'n' }, 'numero'),
                ],
            },
        });
        const doc = criarDocumento('absoluto', 'n.absoluto');
        const result = provedor.provideHover(doc, { line: 0, character: 7 }, mockToken);
        expect(result).toBeDefined();
    });

    it('retorna Hover para variável do tipo vetor (adicionar)', () => {
        (obterResultado as jest.Mock).mockReturnValue({
            avaliadorSintatico: {
                declaracoes: [
                    new FuncaoDeclaracaoMock({ lexema: 'v' }, 'vetor'),
                ],
            },
        });
        const doc = criarDocumento('adicionar', 'v.adicionar');
        const result = provedor.provideHover(doc, { line: 0, character: 8 }, mockToken);
        expect(result).toBeDefined();
    });

    it('retorna Hover para variável do tipo dicionario (chaves)', () => {
        (obterResultado as jest.Mock).mockReturnValue({
            avaliadorSintatico: {
                declaracoes: [
                    new FuncaoDeclaracaoMock({ lexema: 'd' }, 'dicionario'),
                ],
            },
        });
        const doc = criarDocumento('chaves', 'd.chaves');
        const result = provedor.provideHover(doc, { line: 0, character: 5 }, mockToken);
        expect(result).toBeDefined();
    });

    it('retorna Hover (nome:tipo) para FuncaoDeclaracao — hoverVariavelOuConstante tem prioridade', () => {
        // FuncaoDeclaracao entra em declaracoesPertinentes, então hoverVariavelOuConstante
        // dispara antes de hoverFuncaoDocumentada e retorna "nome: tipo"
        const comentario = { conteudo: 'Documentação da função pitugues' };
        (obterResultado as jest.Mock).mockReturnValue({
            avaliadorSintatico: {
                declaracoes: [
                    new FuncaoDeclaracaoMock({ lexema: 'minhaFuncao' }, 'funcao', comentario),
                ],
            },
        });
        const result = provedor.provideHover(criarDocumento('minhaFuncao'), mockPos, mockToken);
        expect(result).toBeDefined();
        expect(result.contents.value).toContain('minhaFuncao');
    });

    it('retorna Hover (nome:tipo) para FuncaoDeclaracao com conteúdo array', () => {
        const comentario = { conteudo: ['linha a', 'linha b'] };
        (obterResultado as jest.Mock).mockReturnValue({
            avaliadorSintatico: {
                declaracoes: [
                    new FuncaoDeclaracaoMock({ lexema: 'funcArray' }, 'funcao', comentario),
                ],
            },
        });
        const result = provedor.provideHover(criarDocumento('funcArray'), mockPos, mockToken);
        expect(result).toBeDefined();
        expect(result.contents.value).toContain('funcArray');
    });

    it('retorna Hover para método em classe', () => {
        const comentario = { conteudo: 'Método da classe' };
        const metodo = new FuncaoDeclaracaoMock({ lexema: 'metodoClasse' }, 'funcao', comentario);
        const classe = new ClasseMock({ lexema: 'MinhaClasse' }, [metodo]);
        (obterResultado as jest.Mock).mockReturnValue({
            avaliadorSintatico: { declaracoes: [classe] },
        });
        const result = provedor.provideHover(criarDocumento('metodoClasse'), mockPos, mockToken);
        expect(result).toBeDefined();
    });

    it('retorna Hover para classe documentada', () => {
        const classe = new ClasseMock({ lexema: 'ClassePitugues' });
        (obterResultado as jest.Mock).mockReturnValue({
            avaliadorSintatico: { declaracoes: [classe] },
        });
        const result = provedor.provideHover(criarDocumento('ClassePitugues'), mockPos, mockToken);
        expect(result).toBeDefined();
        expect(result.contents.value).toContain('(classe)');
    });

    it('retorna Hover para classe abstrata pitugues', () => {
        const classe = new ClasseMock({ lexema: 'ClasseAbstrata' }, [], true);
        (obterResultado as jest.Mock).mockReturnValue({
            avaliadorSintatico: { declaracoes: [classe] },
        });
        const result = provedor.provideHover(criarDocumento('ClasseAbstrata'), mockPos, mockToken);
        expect(result).toBeDefined();
        expect(result.contents.value).toContain('(classe abstrata)');
    });

    it('retorna Hover para classe com superClasses', () => {
        const classe = new ClasseMock({ lexema: 'Filho' }, [], false, [{ simbolo: { lexema: 'Pai' } }]);
        (obterResultado as jest.Mock).mockReturnValue({
            avaliadorSintatico: { declaracoes: [classe] },
        });
        const result = provedor.provideHover(criarDocumento('Filho'), mockPos, mockToken);
        expect(result.contents.value).toContain('herda Pai');
    });

    it('retorna Hover para classe com mesclas', () => {
        const classe = new ClasseMock({ lexema: 'ComMixin' }, [], false, undefined, [{ simbolo: { lexema: 'MixinA' } }]);
        (obterResultado as jest.Mock).mockReturnValue({
            avaliadorSintatico: { declaracoes: [classe] },
        });
        const result = provedor.provideHover(criarDocumento('ComMixin'), mockPos, mockToken);
        expect(result.contents.value).toContain('mescla MixinA');
    });

    it('retorna Hover para classe com implementa', () => {
        const classe = new ClasseMock({ lexema: 'ImplClasse' }, [], false, undefined, undefined, [{ lexema: 'IFoo' }]);
        (obterResultado as jest.Mock).mockReturnValue({
            avaliadorSintatico: { declaracoes: [classe] },
        });
        const result = provedor.provideHover(criarDocumento('ImplClasse'), mockPos, mockToken);
        expect(result.contents.value).toContain('implementa IFoo');
    });

    it('retorna Hover para interface via regex no código fonte', () => {
        const iface = new InterfaceDeclaracaoMock({ lexema: 'IMinhaInterface' });
        (obterResultado as jest.Mock).mockReturnValue({
            avaliadorSintatico: { declaracoes: [iface] },
        });
        const codigoFonte = '/** Descrição interface */\ninterface IMinhaInterface {}';
        const doc = {
            uri: { toString: () => 'file:///teste.pit' },
            lineAt: jest.fn().mockReturnValue({ text: 'IMinhaInterface' }),
            getText: jest.fn((range?: any) => range ? 'IMinhaInterface' : codigoFonte),
            getWordRangeAtPosition: jest.fn().mockReturnValue({}),
        };
        const result = provedor.provideHover(doc, { line: 0, character: 7 }, mockToken);
        expect(result).toBeDefined();
    });

    it('retorna undefined para interface não encontrada no regex', () => {
        const iface = new InterfaceDeclaracaoMock({ lexema: 'INaoDocumentada' });
        (obterResultado as jest.Mock).mockReturnValue({
            avaliadorSintatico: { declaracoes: [iface] },
        });
        const doc = {
            uri: { toString: () => 'file:///teste.pit' },
            lineAt: jest.fn().mockReturnValue({ text: 'INaoDocumentada' }),
            getText: jest.fn((range?: any) => range ? 'INaoDocumentada' : 'sem comentario'),
            getWordRangeAtPosition: jest.fn().mockReturnValue({}),
        };
        const result = provedor.provideHover(doc, { line: 0, character: 7 }, mockToken);
        expect(result).toBeUndefined();
    });

    it('cache nulo, palavra desconhecida → undefined', () => {
        (obterResultado as jest.Mock).mockReturnValue(null);
        const result = provedor.provideHover(criarDocumento('palavraEstranha'), mockPos, mockToken);
        expect(result).toBeUndefined();
    });
});
