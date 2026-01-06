// @ts-nocheck - Ignora erros de tipo nos mocks complexos
import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import * as vscode from 'vscode';

// Mock do módulo vscode
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
        EndOfLine: {
            LF: 1,
            CRLF: 2
        },
        TextEdit,
        Range
    };
}, { virtual: true });

// Mock do VisuAlg
jest.mock('@designliquido/visualg/lexador', () => ({
    LexadorVisuAlg: class LexadorVisuAlg {
        mapear(linhas: string[], hashArquivo: number) {
            return { simbolos: [], erros: [] };
        }
    }
}), { virtual: true });

jest.mock('@designliquido/visualg/avaliador-sintatico', () => ({
    AvaliadorSintaticoVisuAlg: class AvaliadorSintaticoVisuAlg {
        async analisar(retornoLexador: any, hashArquivo: number) {
            return { declaracoes: [], erros: [] };
        }
    }
}), { virtual: true });

jest.mock('@designliquido/visualg/formatador', () => ({
    FormatadorVisuAlg: class FormatadorVisuAlg {
        constructor(public fimDeLinha: string) {}
        formatar(declaracoes: any[]) {
            return 'codigo formatado visualg';
        }
    }
}), { virtual: true });

// Mock do Mapler
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

// Mock do Potigol
jest.mock('@designliquido/potigol/lexador', () => ({
    LexadorPotigol: class LexadorPotigol {
        mapear(linhas: string[], hashArquivo: number) {
            return { simbolos: [], erros: [] };
        }
    }
}), { virtual: true });

jest.mock('@designliquido/potigol/avaliador-sintatico', () => ({
    AvaliadorSintaticoPotigol: class AvaliadorSintaticoPotigol {
        async analisar(retornoLexador: any, hashArquivo: number) {
            return { declaracoes: [], erros: [] };
        }
    }
}), { virtual: true });

jest.mock('@designliquido/potigol/formatador', () => ({
    FormatadorPotigol: class FormatadorPotigol {
        constructor(public fimDeLinha: string) {}
        formatar(declaracoes: any[]) {
            return 'codigo formatado potigol';
        }
    }
}), { virtual: true });

// Mock do Portugol Studio
jest.mock('@designliquido/portugol-studio', () => ({
    LexadorPortugolStudio: class LexadorPortugolStudio {
        mapear(linhas: string[], hashArquivo: number) {
            return { simbolos: [], erros: [] };
        }
    },
    AvaliadorSintaticoPortugolStudio: class AvaliadorSintaticoPortugolStudio {
        async analisar(retornoLexador: any, hashArquivo: number) {
            return { declaracoes: [], erros: [] };
        }
    }
}), { virtual: true });

jest.mock('@designliquido/portugol-studio/formatador/formatador-portugol-studio', () => ({
    FormatadorPortugolStudio: class FormatadorPortugolStudio {
        constructor(public fimDeLinha: string) {}
        formatar(declaracoes: any[]) {
            return 'codigo formatado portugol';
        }
    }
}), { virtual: true });

describe('formatadores/formatadores-simples', () => {
    let mockDocument: any;
    let mockOptions: any;
    let mockToken: any;

    beforeEach(() => {
        jest.clearAllMocks();

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

        mockOptions = {
            tabSize: 4,
            insertSpaces: true
        };

        mockToken = {
            isCancellationRequested: false
        };
    });

    describe('VisualgProvedorFormatacao', () => {
        let VisualgProvedorFormatacao: any;
        let provedor: any;

        beforeEach(() => {
            const module = require('../../fontes/formatadores/visualg-provedor-formatacao');
            VisualgProvedorFormatacao = module.VisualgProvedorFormatacao;
            provedor = new VisualgProvedorFormatacao();
        });

        it('deve criar instância do provedor', () => {
            expect(provedor).toBeDefined();
            expect(typeof provedor.provideDocumentFormattingEdits).toBe('function');
        });

        it('deve formatar documento com LF', async () => {
            mockDocument.eol = vscode.EndOfLine.LF;

            const edits = await provedor.provideDocumentFormattingEdits(
                mockDocument,
                mockOptions,
                mockToken
            );

            expect(Array.isArray(edits)).toBe(true);
            expect(edits.length).toBe(1);
            expect(edits[0].newText).toBe('codigo formatado visualg');
        });

        it('deve formatar documento com CRLF', async () => {
            mockDocument.eol = vscode.EndOfLine.CRLF;

            const edits = await provedor.provideDocumentFormattingEdits(
                mockDocument,
                mockOptions,
                mockToken
            );

            expect(Array.isArray(edits)).toBe(true);
            expect(edits.length).toBe(1);
        });

        it.skip('deve retornar texto original em caso de erro', async () => {
            const { FormatadorVisuAlg } = require('@designliquido/visualg/formatador');
            FormatadorVisuAlg.prototype.formatar = jest.fn().mockImplementation(() => {
                throw new Error('Erro de formatação');
            });

            const edits = await provedor.provideDocumentFormattingEdits(
                mockDocument,
                mockOptions,
                mockToken
            );

            expect(edits[0].newText).toBe('var x = 10');
        });

        it('deve chamar getText do documento', async () => {
            await provedor.provideDocumentFormattingEdits(
                mockDocument,
                mockOptions,
                mockToken
            );

            expect(mockDocument.getText).toHaveBeenCalled();
        });

        it('deve criar Range correto para substituição', async () => {
            const edits = await provedor.provideDocumentFormattingEdits(
                mockDocument,
                mockOptions,
                mockToken
            );

            expect(edits[0].range).toBeDefined();
            expect(edits[0].range.start).toBeDefined();
            expect(edits[0].range.end).toBeDefined();
        });
    });

    describe('MaplerProvedorFormatacao', () => {
        let MaplerProvedorFormatacao: any;
        let provedor: any;

        beforeEach(() => {
            const module = require('../../fontes/formatadores/mapler-provedor-formatacao');
            MaplerProvedorFormatacao = module.MaplerProvedorFormatacao;
            provedor = new MaplerProvedorFormatacao();
        });

        it('deve criar instância do provedor', () => {
            expect(provedor).toBeDefined();
            expect(typeof provedor.provideDocumentFormattingEdits).toBe('function');
        });

        it('deve formatar documento', async () => {
            const edits = await provedor.provideDocumentFormattingEdits(
                mockDocument,
                mockOptions,
                mockToken
            );

            expect(Array.isArray(edits)).toBe(true);
            expect(edits.length).toBe(1);
            expect(edits[0].newText).toBe('codigo formatado mapler');
        });

        it('deve lidar com documentos multi-linha', async () => {
            mockDocument.lineCount = 3;
            mockDocument.getText.mockReturnValue('linha1\nlinha2\nlinha3');

            const edits = await provedor.provideDocumentFormattingEdits(
                mockDocument,
                mockOptions,
                mockToken
            );

            expect(edits.length).toBe(1);
        });

        it.skip('deve retornar texto original em caso de erro', async () => {
            const { FormatadorMapler } = require('@designliquido/mapler/formatador');
            FormatadorMapler.prototype.formatar = jest.fn().mockImplementation(() => {
                throw new Error('Erro de formatação');
            });

            const edits = await provedor.provideDocumentFormattingEdits(
                mockDocument,
                mockOptions,
                mockToken
            );

            expect(edits[0].newText).toBe('var x = 10');
        });
    });

    describe('PotigolProvedorFormatacao', () => {
        let PotigolProvedorFormatacao: any;
        let provedor: any;

        beforeEach(() => {
            const module = require('../../fontes/formatadores/potigol-provedor-formatacao');
            PotigolProvedorFormatacao = module.PotigolProvedorFormatacao;
            provedor = new PotigolProvedorFormatacao();
        });

        it('deve criar instância do provedor', () => {
            expect(provedor).toBeDefined();
            expect(typeof provedor.provideDocumentFormattingEdits).toBe('function');
        });

        it('deve formatar documento', async () => {
            const edits = await provedor.provideDocumentFormattingEdits(
                mockDocument,
                mockOptions,
                mockToken
            );

            expect(Array.isArray(edits)).toBe(true);
            expect(edits.length).toBe(1);
            expect(edits[0].newText).toBe('codigo formatado potigol');
        });

        it('deve usar fim de linha correto (LF)', async () => {
            mockDocument.eol = vscode.EndOfLine.LF;

            const edits = await provedor.provideDocumentFormattingEdits(
                mockDocument,
                mockOptions,
                mockToken
            );

            // Verifica que a formatação foi realizada
            expect(edits).toBeDefined();
            expect(edits.length).toBe(1);
        });

        it.skip('deve retornar texto original em caso de erro', async () => {
            const { FormatadorPotigol } = require('@designliquido/potigol/formatador');
            FormatadorPotigol.prototype.formatar = jest.fn().mockImplementation(() => {
                throw new Error('Erro de formatação');
            });

            const edits = await provedor.provideDocumentFormattingEdits(
                mockDocument,
                mockOptions,
                mockToken
            );

            expect(edits[0].newText).toBe('var x = 10');
        });
    });

    describe('PortugolStudioProvedorFormatacao', () => {
        let PortugolStudioProvedorFormatacao: any;
        let provedor: any;

        beforeEach(() => {
            const module = require('../../fontes/formatadores/portugol-studio-provedor-formatacao');
            PortugolStudioProvedorFormatacao = module.PortugolStudioProvedorFormatacao;
            provedor = new PortugolStudioProvedorFormatacao();
        });

        it('deve criar instância do provedor', () => {
            expect(provedor).toBeDefined();
            expect(typeof provedor.provideDocumentFormattingEdits).toBe('function');
        });

        it('deve formatar documento', async () => {
            const edits = await provedor.provideDocumentFormattingEdits(
                mockDocument,
                mockOptions,
                mockToken
            );

            expect(Array.isArray(edits)).toBe(true);
            expect(edits.length).toBe(1);
            expect(edits[0].newText).toBe('codigo formatado portugol');
        });

        it('deve processar documentos vazios', async () => {
            mockDocument.getText.mockReturnValue('');
            mockDocument.lineCount = 1;

            const edits = await provedor.provideDocumentFormattingEdits(
                mockDocument,
                mockOptions,
                mockToken
            );

            expect(edits.length).toBe(1);
        });

        it('deve retornar texto original em caso de erro', async () => {
            const { FormatadorPortugolStudio } = require('@designliquido/portugol-studio/formatador/formatador-portugol-studio');
            FormatadorPortugolStudio.prototype.formatar = jest.fn().mockImplementation(() => {
                throw new Error('Erro de formatação');
            });

            const edits = await provedor.provideDocumentFormattingEdits(
                mockDocument,
                mockOptions,
                mockToken
            );

            expect(edits[0].newText).toBe('var x = 10');
        });
    });

    describe('Integração entre formatadores', () => {
        it('deve permitir criar múltiplas instâncias', () => {
            const { VisualgProvedorFormatacao } = require('../../fontes/formatadores/visualg-provedor-formatacao');
            const { MaplerProvedorFormatacao } = require('../../fontes/formatadores/mapler-provedor-formatacao');
            const { PotigolProvedorFormatacao } = require('../../fontes/formatadores/potigol-provedor-formatacao');
            const { PortugolStudioProvedorFormatacao } = require('../../fontes/formatadores/portugol-studio-provedor-formatacao');

            const visualg = new VisualgProvedorFormatacao();
            const mapler = new MaplerProvedorFormatacao();
            const potigol = new PotigolProvedorFormatacao();
            const portugol = new PortugolStudioProvedorFormatacao();

            expect(visualg).toBeDefined();
            expect(mapler).toBeDefined();
            expect(potigol).toBeDefined();
            expect(portugol).toBeDefined();
        });

        it('deve formatar corretamente com diferentes provedores', async () => {
            const { VisualgProvedorFormatacao } = require('../../fontes/formatadores/visualg-provedor-formatacao');
            const { MaplerProvedorFormatacao } = require('../../fontes/formatadores/mapler-provedor-formatacao');

            const visualg = new VisualgProvedorFormatacao();
            const mapler = new MaplerProvedorFormatacao();

            const editsVisualg = await visualg.provideDocumentFormattingEdits(
                mockDocument,
                mockOptions,
                mockToken
            );

            const editsMapler = await mapler.provideDocumentFormattingEdits(
                mockDocument,
                mockOptions,
                mockToken
            );

            // Verifica que ambos retornam edits válidos
            expect(editsVisualg).toBeDefined();
            expect(editsMapler).toBeDefined();
            expect(Array.isArray(editsVisualg)).toBe(true);
            expect(Array.isArray(editsMapler)).toBe(true);
            expect(editsVisualg.length).toBe(1);
            expect(editsMapler.length).toBe(1);
        });
    });
});
