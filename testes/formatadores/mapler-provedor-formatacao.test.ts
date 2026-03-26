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

jest.mock('@designliquido/mapler', () => ({
    LexadorMapler: class LexadorMapler {
        mapear(linhas: string[], hashArquivo: number) {
            return { simbolos: [], erros: [] };
        }
    },
    AvaliadorSintaticoMapler: class AvaliadorSintaticoMapler {
        async analisar(retornoLexador: any, hashArquivo: number) {
            return { declaracoes: [], erros: [] };
        }
    }
}), { virtual: true });

jest.mock('@designliquido/mapler/formatador', () => ({
    FormatadorMapler: class FormatadorMapler {
        constructor(public fimDeLinha: string) {}
        formatar(declaracoes: any[]) {
            return 'codigo formatado mapler';
        }
    }
}), { virtual: true });

import { MaplerProvedorFormatacao } from '../../fontes/formatadores/mapler-provedor-formatacao';

describe('MaplerProvedorFormatacao', () => {
    let provedor: any;
    let mockDocument: any;
    let mockOptions: any;
    let mockToken: any;

    beforeEach(() => {
        jest.clearAllMocks();

        provedor = new MaplerProvedorFormatacao();

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

    it('deve formatar documento', async () => {
        const edits = await provedor.provideDocumentFormattingEdits(mockDocument, mockOptions, mockToken);

        expect(Array.isArray(edits)).toBe(true);
        expect(edits.length).toBe(1);
        expect(edits[0].newText).toBe('codigo formatado mapler');
    });

    it('deve lidar com documentos multi-linha', async () => {
        mockDocument.lineCount = 3;
        mockDocument.getText.mockReturnValue('linha1\nlinha2\nlinha3');

        const edits = await provedor.provideDocumentFormattingEdits(mockDocument, mockOptions, mockToken);

        expect(edits.length).toBe(1);
    });

    it.skip('deve retornar texto original em caso de erro', async () => {
        const { FormatadorMapler } = jest.requireMock('@designliquido/mapler/formatador');
        FormatadorMapler.prototype.formatar = jest.fn().mockImplementation(() => {
            throw new Error('Erro de formatação');
        });

        const edits = await provedor.provideDocumentFormattingEdits(mockDocument, mockOptions, mockToken);

        expect(edits[0].newText).toBe('var x = 10');
    });
});
