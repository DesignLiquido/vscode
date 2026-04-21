// @ts-nocheck
import { describe, it, expect, jest, beforeEach } from '@jest/globals';

class ClasseMock {
    constructor(public simbolo: any, public metodos: any[] = []) {}
}
class DeclaracaoSimples {
    constructor(public simbolo: any) {}
}

jest.mock('vscode', () => ({
    Location: class Location {
        constructor(public uri: any, public position: any) {}
    },
    Position: class Position {
        constructor(public line: number, public character: number) {}
    },
    Uri: {
        file: jest.fn((path: string) => ({ path, toString: () => path })),
    },
}), { virtual: true });

jest.mock('@designliquido/delegua/declaracoes/classe', () => ({
    Classe: ClasseMock,
}), { virtual: true });

jest.mock('@designliquido/delegua/declaracoes', () => ({
    Declaracao: class Declaracao {},
}), { virtual: true });

jest.mock('../../fontes/analise-codigo/cache-analise', () => ({
    obterResultado: jest.fn().mockReturnValue(null),
}), { virtual: true });

import { DeleguaProvedorDefinicao } from '../../fontes/definicao/delegua-provedor-definicao';
import { obterResultado } from '../../fontes/analise-codigo/cache-analise';

const mockUri = { toString: () => 'file:///teste.delegua', path: '/teste.delegua' };

function criarDocumento(palavra: string, overrides: any = {}): any {
    return {
        uri: mockUri,
        getText: jest.fn((range?: any) => range ? palavra : ''),
        getWordRangeAtPosition: jest.fn().mockReturnValue({ start: { character: 0 } }),
        lineAt: jest.fn().mockReturnValue({ text: palavra }),
        ...overrides,
    };
}

describe('DeleguaProvedorDefinicao', () => {
    let provedor: any;
    const mockToken: any = {};
    const mockPos: any = { line: 0, character: 5 };

    beforeEach(() => {
        jest.clearAllMocks();
        (obterResultado as jest.Mock).mockReturnValue(null);
        provedor = new DeleguaProvedorDefinicao();
    });

    it('instância criada com sucesso', () => {
        expect(provedor).toBeDefined();
        expect(typeof provedor.provideDefinition).toBe('function');
    });

    it('retorna undefined quando getWordRangeAtPosition retorna undefined', () => {
        const doc = criarDocumento('', { getWordRangeAtPosition: jest.fn().mockReturnValue(undefined) });
        const result = provedor.provideDefinition(doc, mockPos, mockToken);
        expect(result).toBeUndefined();
    });

    it('retorna undefined quando cache é null (sem declarações)', () => {
        (obterResultado as jest.Mock).mockReturnValue(null);
        const result = provedor.provideDefinition(criarDocumento('minhaVar'), mockPos, mockToken);
        expect(result).toBeUndefined();
    });

    it('retorna undefined quando declarações estão vazias', () => {
        (obterResultado as jest.Mock).mockReturnValue({
            avaliadorSintatico: { declaracoes: [] },
            declaracoesPreCarregadas: [],
        });
        const result = provedor.provideDefinition(criarDocumento('minhaVar'), mockPos, mockToken);
        expect(result).toBeUndefined();
    });

    it('retorna Location para declaração simples com símbolo correspondente', () => {
        const declaracao = new DeclaracaoSimples({ lexema: 'minhaVar', linha: 5, colunaInicio: 3 });
        (obterResultado as jest.Mock).mockReturnValue({
            avaliadorSintatico: { declaracoes: [declaracao] },
            declaracoesPreCarregadas: [],
        });
        const result = provedor.provideDefinition(criarDocumento('minhaVar'), mockPos, mockToken);
        expect(result).toBeDefined();
        expect(result.position.line).toBe(4); // linha - 1
        expect(result.position.character).toBe(3);
    });

    it('uri da declaração usa uri do documento quando não há caminhoArquivoDefinicao', () => {
        const declaracao = new DeclaracaoSimples({ lexema: 'minhaVar', linha: 1, colunaInicio: 0 });
        (obterResultado as jest.Mock).mockReturnValue({
            avaliadorSintatico: { declaracoes: [declaracao] },
            declaracoesPreCarregadas: [],
        });
        const doc = criarDocumento('minhaVar');
        const result = provedor.provideDefinition(doc, mockPos, mockToken);
        expect(result.uri).toBe(mockUri);
    });

    it('uri da declaração usa caminhoArquivoDefinicao quando presente', () => {
        const { Uri } = jest.requireMock('vscode');
        const declaracao = Object.assign(
            new DeclaracaoSimples({ lexema: 'minhaVar', linha: 2, colunaInicio: 0 }),
            { caminhoArquivoDefinicao: '/outro/arquivo.delegua' }
        );
        (obterResultado as jest.Mock).mockReturnValue({
            avaliadorSintatico: { declaracoes: [declaracao] },
            declaracoesPreCarregadas: [],
        });
        const result = provedor.provideDefinition(criarDocumento('minhaVar'), mockPos, mockToken);
        expect(Uri.file).toHaveBeenCalledWith('/outro/arquivo.delegua');
    });

    it('retorna Location para método dentro de uma Classe', () => {
        const metodo = { simbolo: { lexema: 'meuMetodo', linha: 10, colunaInicio: 4 } };
        const classe = new ClasseMock({ lexema: 'MinhaClasse', linha: 5 }, [metodo]);
        (obterResultado as jest.Mock).mockReturnValue({
            avaliadorSintatico: { declaracoes: [classe] },
            declaracoesPreCarregadas: [],
        });
        const result = provedor.provideDefinition(criarDocumento('meuMetodo'), mockPos, mockToken);
        expect(result).toBeDefined();
        expect(result.position.line).toBe(9); // 10 - 1
        expect(result.position.character).toBe(4);
    });

    it('usa colunaInicio=0 quando não definido', () => {
        const declaracao = new DeclaracaoSimples({ lexema: 'semColuna', linha: 3 });
        (obterResultado as jest.Mock).mockReturnValue({
            avaliadorSintatico: { declaracoes: [declaracao] },
            declaracoesPreCarregadas: [],
        });
        const result = provedor.provideDefinition(criarDocumento('semColuna'), mockPos, mockToken);
        expect(result.position.character).toBe(0);
    });

    it('busca nas declaracoesPreCarregadas também', () => {
        const declaracao = new DeclaracaoSimples({ lexema: 'varPreCarregada', linha: 1, colunaInicio: 0 });
        (obterResultado as jest.Mock).mockReturnValue({
            avaliadorSintatico: { declaracoes: [] },
            declaracoesPreCarregadas: [declaracao],
        });
        const result = provedor.provideDefinition(criarDocumento('varPreCarregada'), mockPos, mockToken);
        expect(result).toBeDefined();
    });

    it('retorna undefined quando palavra não encontrada em nenhuma declaração', () => {
        const declaracao = new DeclaracaoSimples({ lexema: 'outraVar', linha: 1, colunaInicio: 0 });
        (obterResultado as jest.Mock).mockReturnValue({
            avaliadorSintatico: { declaracoes: [declaracao] },
            declaracoesPreCarregadas: [],
        });
        const result = provedor.provideDefinition(criarDocumento('palavraNaoExiste'), mockPos, mockToken);
        expect(result).toBeUndefined();
    });

    it('declaração sem símbolo é ignorada', () => {
        const semSimbolo = {}; // sem .simbolo
        const comSimbolo = new DeclaracaoSimples({ lexema: 'minhaVar', linha: 2, colunaInicio: 0 });
        (obterResultado as jest.Mock).mockReturnValue({
            avaliadorSintatico: { declaracoes: [semSimbolo, comSimbolo] },
            declaracoesPreCarregadas: [],
        });
        const result = provedor.provideDefinition(criarDocumento('minhaVar'), mockPos, mockToken);
        expect(result).toBeDefined();
    });
});
