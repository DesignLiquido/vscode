// @ts-nocheck - Ignora erros de tipo nos mocks complexos
import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import * as vscode from 'vscode';

jest.mock('vscode', () => {
    class TextEdit {
        constructor(public range: any, public newText: string) {}
        static replace(range: any, text: string) {
            return new TextEdit(range, text);
        }
    }

    class Range {
        constructor(public start: any, public end: any) {}
    }

    return {
        EndOfLine: { LF: 1, CRLF: 2 },
        TextEdit,
        Range
    };
}, { virtual: true });

jest.mock('@designliquido/visualg/lexador', () => ({
    LexadorVisuAlg: class LexadorVisuAlg {
        mapear(linhas: string[], hashArquivo: number) {
            return { simbolos: [], erros: [] };
        }
    }
}));

jest.mock('@designliquido/visualg/avaliador-sintatico', () => ({
    AvaliadorSintaticoVisuAlg: class AvaliadorSintaticoVisuAlg {
        async analisar(retornoLexador: any, hashArquivo: number) {
            return { declaracoes: [], erros: [] };
        }
    }
}));

jest.mock('@designliquido/visualg/formatador', () => ({
    FormatadorVisuAlg: class FormatadorVisuAlg {
        constructor(public fimDeLinha: string) {}
        formatar(declaracoes: any[]) {
            return 'codigo formatado visualg';
        }
    }
}));

import { VisualgProvedorFormatacao } from '../../fontes/formatadores/visualg-provedor-formatacao';

describe('VisualgProvedorFormatacao', () => {
    let provedor: any;
    let mockDocument: any;
    let mockOptions: any;
    let mockToken: any;

    beforeEach(() => {
        jest.clearAllMocks();

        provedor = new VisualgProvedorFormatacao();

        mockDocument = {
            getText: jest.fn().mockReturnValue('var x = 10'),
            eol: vscode.EndOfLine.LF,
            lineCount: 1,
            lineAt: jest.fn((linha: number) => ({
                range: {
                    start: { line: linha, character: 0 },
                    end: { line: linha, character: 10 }
                }
            }))
        };

        mockOptions = { tabSize: 4, insertSpaces: true };
        mockToken = { isCancellationRequested: false };
    });

    it('deve criar instância do provedor', () => {
        expect(provedor).toBeDefined();
        expect(typeof provedor.provideDocumentFormattingEdits).toBe('function');
    });

    it('deve formatar documento com LF', async () => {
        mockDocument.eol = vscode.EndOfLine.LF;

        const edits = await provedor.provideDocumentFormattingEdits(mockDocument, mockOptions, mockToken);

        expect(Array.isArray(edits)).toBe(true);
        expect(edits.length).toBe(1);
        expect(edits[0].newText).toBe('codigo formatado visualg');
    });

    it('deve formatar documento com CRLF', async () => {
        mockDocument.eol = vscode.EndOfLine.CRLF;

        const edits = await provedor.provideDocumentFormattingEdits(mockDocument, mockOptions, mockToken);

        expect(Array.isArray(edits)).toBe(true);
        expect(edits.length).toBe(1);
    });

    it('deve retornar texto original em caso de erro', async () => {
        const { FormatadorVisuAlg } = jest.requireMock('@designliquido/visualg/formatador');
        jest.spyOn(FormatadorVisuAlg.prototype, 'formatar').mockImplementation(() => {
            throw new Error('Erro de formatação');
        });

        const edits = await provedor.provideDocumentFormattingEdits(mockDocument, mockOptions, mockToken);

        expect(edits[0].newText).toBe('var x = 10');
    });

    it('deve chamar getText do documento', async () => {
        await provedor.provideDocumentFormattingEdits(mockDocument, mockOptions, mockToken);

        expect(mockDocument.getText).toHaveBeenCalled();
    });

    it('deve criar Range correto para substituição', async () => {
        const edits = await provedor.provideDocumentFormattingEdits(mockDocument, mockOptions, mockToken);

        expect(edits[0].range).toBeDefined();
        expect(edits[0].range.start).toBeDefined();
        expect(edits[0].range.end).toBeDefined();
    });
});
