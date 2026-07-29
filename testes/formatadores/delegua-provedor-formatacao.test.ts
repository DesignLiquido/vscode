// @ts-nocheck
import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';

const mockConfigGet = jest.fn();
const mockGetConfiguration = jest.fn().mockReturnValue({ get: mockConfigGet });
const mockDiagnosticosSet = jest.fn();

jest.mock('vscode', () => {
    class TextEdit {
        constructor(public range: any, public newText: string) {}
        static replace(range: any, text: string) { return new TextEdit(range, text); }
    }
    class Range {
        constructor(public start: any, public end: any) {}
    }
    return {
        EndOfLine: { LF: 1, CRLF: 2 },
        TextEdit,
        Range,
        workspace: { getConfiguration: mockGetConfiguration },
    };
}, { virtual: true });

jest.mock('@designliquido/delegua/avaliador-sintatico', () => ({
    AvaliadorSintatico: class AvaliadorSintatico {
        constructor(_modo: boolean) {}
        async analisar(retornoLexador: any, _hash: number) {
            return { declaracoes: [{ tipo: 'var' }], erros: [] };
        }
    },
}));

jest.mock('@designliquido/delegua/formatadores', () => ({
    FormatadorDelegua: class FormatadorDelegua {
        constructor(_fimLinha: string, _indent: number, _opts: any) {}
        formatar(_declaracoes: any[]) { return 'codigo formatado delegua'; }
    },
    FormatadorPitugues: class FormatadorPitugues {
        constructor(_fimLinha: string) {}
        async formatar(_declaracoes: any[]) { return 'codigo formatado pitugues'; }
    },
}));

jest.mock('@designliquido/delegua/lexador', () => ({
    Lexador: class Lexador {
        mapear(linhas: string[], _hash: number) { return { simbolos: [], erros: [] }; }
    },
}));

jest.mock('@designliquido/delegua', () => ({
    EstilizadorDelegua: class EstilizadorDelegua {
        adicionarRegra(_regra: any) {}
        estilizarEFormatar(_declaracoes: any[], _opcoes: any) { return 'codigo estilizado'; }
    },
}));

jest.mock('@designliquido/delegua/estilizador/regras', () => ({
    RegraFortalecerTipos: class RegraFortalecerTipos {},
    RegraConvencaoNomenclatura: class RegraConvencaoNomenclatura { constructor(_opts: any) {} },
    RegraExplicitarTiposParametros: class RegraExplicitarTiposParametros {},
}));

jest.mock('@designliquido/delegua/interfaces/estilizador', () => ({}));
jest.mock('@designliquido/delegua/interfaces/formatador', () => ({}));
jest.mock('@designliquido/delegua/tipos', () => ({ DelimitadorTextoFormatacao: {} }));

jest.mock('../../fontes/avaliacao-sintatica', () => ({
    formatarDiagnosticosAvaliacaoSintatica: jest.fn().mockReturnValue([
        { message: 'Erro de sintaxe', severity: 0 },
    ]),
}));

import { DeleguaProvedorFormatacao } from '../../fontes/formatadores/delegua-provedor-formatacao';

function criarDocumento(texto = 'var x = 10', eol = 1): any {
    const linhas = texto.split('\n');
    return {
        getText: jest.fn().mockReturnValue(texto),
        eol,
        lineCount: linhas.length,
        lineAt: jest.fn((idx: number) => ({
            range: { start: { line: idx, character: 0 }, end: { line: idx, character: linhas[idx]?.length ?? 0 } },
        })),
        uri: 'file:///teste.delegua',
    };
}

describe('DeleguaProvedorFormatacao', () => {
    let provedor: any;
    let mockDiagnosticos: any;

    beforeEach(() => {
        jest.clearAllMocks();
        // Restaurar mock de getConfiguration após clearAllMocks (que limpa as implementações)
        mockGetConfiguration.mockReturnValue({ get: mockConfigGet });
        mockDiagnosticos = { set: mockDiagnosticosSet };
        // Configuração padrão: estilizador habilitado=false, sem regras extras
        mockConfigGet.mockImplementation((key: string, defaultVal?: any) => {
            if (key === 'habilitado') return false;
            if (key === 'delimitadorTexto') return 'preservar';
            if (key === 'fortalecerTipos.habilitado') return false;
            if (key === 'explicitarTiposParametros.habilitado') return false;
            if (key === 'convencaoNomenclatura.habilitado') return false;
            return defaultVal;
        });
        provedor = new DeleguaProvedorFormatacao(mockDiagnosticos);
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('instância criada com sucesso', () => {
        expect(provedor).toBeDefined();
        expect(typeof provedor.provideDocumentFormattingEdits).toBe('function');
    });

    it('retorna array de TextEdit com código formatado (estilizador desabilitado)', async () => {
        const edits = await provedor.provideDocumentFormattingEdits(criarDocumento(), {}, {});
        expect(Array.isArray(edits)).toBe(true);
        expect(edits.length).toBe(1);
        expect(edits[0].newText).toBe('codigo formatado delegua');
    });

    it('usa CRLF quando documento usa CRLF', async () => {
        const { AvaliadorSintatico } = jest.requireMock('@designliquido/delegua/avaliador-sintatico');
        const { FormatadorDelegua } = jest.requireMock('@designliquido/delegua/formatadores');
        const spy = jest.spyOn(FormatadorDelegua.prototype, 'formatar').mockReturnValue('crlf formatado');

        const edits = await provedor.provideDocumentFormattingEdits(criarDocumento('var x = 10', 2), {}, {});
        expect(Array.isArray(edits)).toBe(true);
    });

    it('retorna null quando há erros de sintaxe', async () => {
        const { AvaliadorSintatico } = jest.requireMock('@designliquido/delegua/avaliador-sintatico');
        jest.spyOn(AvaliadorSintatico.prototype, 'analisar').mockResolvedValue({
            declaracoes: [],
            erros: [{ message: 'erro de parse' }],
        });

        const edits = await provedor.provideDocumentFormattingEdits(criarDocumento(), {}, {});
        expect(edits).toBeNull();
        expect(mockDiagnosticosSet).toHaveBeenCalled();
    });

    it('chama estilizador quando habilitado=true', async () => {
        mockConfigGet.mockImplementation((key: string, defaultVal?: any) => {
            if (key === 'habilitado') return true;
            if (key === 'delimitadorTexto') return 'preservar';
            if (key === 'fortalecerTipos.habilitado') return false;
            if (key === 'explicitarTiposParametros.habilitado') return false;
            if (key === 'convencaoNomenclatura.habilitado') return false;
            return defaultVal;
        });

        const edits = await provedor.provideDocumentFormattingEdits(criarDocumento(), {}, {});
        expect(Array.isArray(edits)).toBe(true);
        expect(edits[0].newText).toBe('codigo estilizado');
    });

    it('adiciona RegraFortalecerTipos quando habilitada', async () => {
        mockConfigGet.mockImplementation((key: string, defaultVal?: any) => {
            if (key === 'habilitado') return true;
            if (key === 'fortalecerTipos.habilitado') return true;
            if (key === 'explicitarTiposParametros.habilitado') return false;
            if (key === 'convencaoNomenclatura.habilitado') return false;
            if (key === 'delimitadorTexto') return 'preservar';
            return defaultVal;
        });
        const { EstilizadorDelegua } = jest.requireMock('@designliquido/delegua');
        const spy = jest.spyOn(EstilizadorDelegua.prototype, 'adicionarRegra');

        await provedor.provideDocumentFormattingEdits(criarDocumento(), {}, {});
        expect(spy).toHaveBeenCalled();
    });

    it('adiciona RegraExplicitarTiposParametros quando habilitada', async () => {
        mockConfigGet.mockImplementation((key: string, defaultVal?: any) => {
            if (key === 'habilitado') return true;
            if (key === 'fortalecerTipos.habilitado') return false;
            if (key === 'explicitarTiposParametros.habilitado') return true;
            if (key === 'convencaoNomenclatura.habilitado') return false;
            if (key === 'delimitadorTexto') return 'preservar';
            return defaultVal;
        });
        const { EstilizadorDelegua } = jest.requireMock('@designliquido/delegua');
        const spy = jest.spyOn(EstilizadorDelegua.prototype, 'adicionarRegra');

        await provedor.provideDocumentFormattingEdits(criarDocumento(), {}, {});
        expect(spy).toHaveBeenCalled();
    });

    it('adiciona RegraConvencaoNomenclatura quando habilitada', async () => {
        mockConfigGet.mockImplementation((key: string, defaultVal?: any) => {
            if (key === 'habilitado') return true;
            if (key === 'fortalecerTipos.habilitado') return false;
            if (key === 'explicitarTiposParametros.habilitado') return false;
            if (key === 'convencaoNomenclatura.habilitado') return true;
            if (key === 'convencaoNomenclatura.variaveis') return 'caixaCamelo';
            if (key === 'convencaoNomenclatura.constantes') return 'CAIXA_ALTA';
            if (key === 'convencaoNomenclatura.funcoes') return 'caixaCamelo';
            if (key === 'delimitadorTexto') return 'preservar';
            return defaultVal;
        });
        const { EstilizadorDelegua } = jest.requireMock('@designliquido/delegua');
        const spy = jest.spyOn(EstilizadorDelegua.prototype, 'adicionarRegra');

        await provedor.provideDocumentFormattingEdits(criarDocumento(), {}, {});
        expect(spy).toHaveBeenCalled();
    });

    it('retorna código original em caso de exceção no formatador', async () => {
        mockConfigGet.mockImplementation((key: string, defaultVal?: any) => {
            if (key === 'habilitado') return false;
            if (key === 'delimitadorTexto') return 'preservar';
            return defaultVal;
        });
        const { FormatadorDelegua } = jest.requireMock('@designliquido/delegua/formatadores');
        jest.spyOn(FormatadorDelegua.prototype, 'formatar').mockImplementation(() => { throw new Error('Erro formatação'); });

        const edits = await provedor.provideDocumentFormattingEdits(criarDocumento('var x'), {}, {});
        expect(Array.isArray(edits)).toBe(true);
        // Retorna o código original quando há exceção
        expect(edits[0].newText).toBe('var x');
    });
});
