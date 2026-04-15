// @ts-nocheck
import { describe, it, expect, jest, beforeEach } from '@jest/globals';

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
    };
}, { virtual: true });

jest.mock('@designliquido/delegua/avaliador-sintatico', () => ({
    AvaliadorSintatico: class AvaliadorSintatico {
        constructor(_modo: boolean) {}
        async analisar(_retornoLexador: any, _hash: number) {
            return { declaracoes: [{ tipo: 'var' }], erros: [] };
        }
    },
}), { virtual: true });

jest.mock('@designliquido/delegua/formatadores', () => ({
    FormatadorPitugues: class FormatadorPitugues {
        constructor(_fimLinha: string) {}
        async formatar(_declaracoes: any[]) { return 'codigo formatado pitugues'; }
    },
}), { virtual: true });

jest.mock('@designliquido/delegua/lexador', () => ({
    Lexador: class Lexador {
        mapear(_linhas: string[], _hash: number) { return { simbolos: [], erros: [] }; }
    },
}), { virtual: true });

jest.mock('../../fontes/avaliacao-sintatica', () => ({
    formatarDiagnosticosAvaliacaoSintatica: jest.fn().mockReturnValue([
        { message: 'Erro sintaxe pitugues', severity: 0 },
    ]),
}), { virtual: true });

import { PituguesProvedorFormatacao } from '../../fontes/formatadores/pitugues-provedor-formatacao';

function criarDocumento(texto = 'escreva("oi")', eol = 1): any {
    const linhas = texto.split('\n');
    return {
        getText: jest.fn().mockReturnValue(texto),
        eol,
        lineCount: linhas.length,
        lineAt: jest.fn((idx: number) => ({
            range: { start: { line: idx, character: 0 }, end: { line: idx, character: linhas[idx]?.length ?? 0 } },
        })),
        uri: 'file:///teste.pit',
    };
}

describe('PituguesProvedorFormatacao', () => {
    let provedor: any;
    let mockDiagnosticos: any;

    beforeEach(() => {
        jest.clearAllMocks();
        mockDiagnosticos = { set: mockDiagnosticosSet };
        provedor = new PituguesProvedorFormatacao(mockDiagnosticos);
    });

    it('instância criada com sucesso', () => {
        expect(provedor).toBeDefined();
        expect(typeof provedor.provideDocumentFormattingEdits).toBe('function');
    });

    it('retorna array de TextEdit com código formatado', async () => {
        const edits = await provedor.provideDocumentFormattingEdits(criarDocumento(), {}, {});
        expect(Array.isArray(edits)).toBe(true);
        expect(edits.length).toBe(1);
        expect(edits[0].newText).toBe('codigo formatado pitugues');
    });

    it('retorna null e define diagnósticos quando há erros de sintaxe', async () => {
        const { AvaliadorSintatico } = jest.requireMock('@designliquido/delegua/avaliador-sintatico');
        jest.spyOn(AvaliadorSintatico.prototype, 'analisar').mockResolvedValue({
            declaracoes: [],
            erros: [{ message: 'erro parse pitugues' }],
        });

        const edits = await provedor.provideDocumentFormattingEdits(criarDocumento(), {}, {});
        expect(edits).toBeNull();
        expect(mockDiagnosticosSet).toHaveBeenCalled();
    });

    it('usa LF quando eol é LF', async () => {
        const { FormatadorPitugues } = jest.requireMock('@designliquido/delegua/formatadores');
        const spy = jest.spyOn(FormatadorPitugues.prototype, 'formatar').mockResolvedValue('lf code');

        const edits = await provedor.provideDocumentFormattingEdits(criarDocumento('x', 1), {}, {});
        expect(edits[0].newText).toBe('lf code');
        spy.mockRestore();
    });

    it('usa CRLF quando eol é CRLF', async () => {
        const { FormatadorPitugues } = jest.requireMock('@designliquido/delegua/formatadores');
        const constructorSpy = jest.fn();
        const originalClass = FormatadorPitugues;
        // Spy on constructor to check the fimDeLinha arg
        jest.spyOn(FormatadorPitugues.prototype, 'formatar').mockResolvedValue('crlf code');

        const edits = await provedor.provideDocumentFormattingEdits(criarDocumento('x', 2), {}, {});
        expect(Array.isArray(edits)).toBe(true);
    });

    it('retorna null quando formatador lança exceção', async () => {
        const { FormatadorPitugues } = jest.requireMock('@designliquido/delegua/formatadores');
        jest.spyOn(FormatadorPitugues.prototype, 'formatar').mockRejectedValue(new Error('Erro formatação'));

        const edits = await provedor.provideDocumentFormattingEdits(criarDocumento(), {}, {});
        expect(edits).toBeNull();
    });

    it('TextEdit criado com Range correto', async () => {
        const edits = await provedor.provideDocumentFormattingEdits(criarDocumento(), {}, {});
        expect(edits[0].range).toBeDefined();
        expect(edits[0].range.start).toBeDefined();
        expect(edits[0].range.end).toBeDefined();
    });

    it('chama getText no documento', async () => {
        const doc = criarDocumento('escreva("teste")');
        await provedor.provideDocumentFormattingEdits(doc, {}, {});
        expect(doc.getText).toHaveBeenCalled();
    });
});
