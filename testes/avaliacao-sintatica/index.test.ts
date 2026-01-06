// @ts-nocheck - Ignora erros de tipo nos mocks complexos
import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import * as vscode from 'vscode';

// Mock do módulo vscode
jest.mock('vscode', () => {
    const DiagnosticSeverity = {
        Error: 0,
        Warning: 1,
        Information: 2,
        Hint: 3
    };

    class Range {
        constructor(public startLine: number, public startChar: number, public endLine: number, public endChar: number) {
            this.start = { line: startLine, character: startChar };
            this.end = { line: endLine, character: endChar };
        }
        start: any;
        end: any;
    }

    class Diagnostic {
        constructor(public range: any, public message: string, public severity: number) {}
    }

    return {
        DiagnosticSeverity,
        Diagnostic,
        Range
    };
}, { virtual: true });

describe('avaliacao-sintatica/index', () => {
    let formatarDiagnosticosAvaliacaoSintatica: any;

    beforeEach(() => {
        jest.clearAllMocks();
        formatarDiagnosticosAvaliacaoSintatica =
            require('../../fontes/avaliacao-sintatica/index').formatarDiagnosticosAvaliacaoSintatica;
    });

    describe('formatarDiagnosticosAvaliacaoSintatica', () => {
        let mockDocumento: any;

        beforeEach(() => {
            mockDocumento = {
                lineAt: jest.fn()
            };
        });

        it('deve retornar array vazio quando não há erros', () => {
            const erros: any[] = [];
            const resultado = formatarDiagnosticosAvaliacaoSintatica(erros, mockDocumento);

            expect(resultado).toEqual([]);
            expect(Array.isArray(resultado)).toBe(true);
            expect(resultado.length).toBe(0);
        });

        it('deve formatar um único erro', () => {
            mockDocumento.lineAt.mockReturnValue({
                text: 'const x = ;'
            });

            const erros = [
                {
                    simbolo: { linha: 1 },
                    message: 'Esperado expressão'
                }
            ];

            const resultado = formatarDiagnosticosAvaliacaoSintatica(erros, mockDocumento);

            expect(resultado).toHaveLength(1);
            expect(mockDocumento.lineAt).toHaveBeenCalledWith(0); // linha 1 -> índice 0
        });

        it('deve formatar múltiplos erros', () => {
            mockDocumento.lineAt
                .mockReturnValueOnce({ text: 'const x = ;' })
                .mockReturnValueOnce({ text: 'let y =' })
                .mockReturnValueOnce({ text: 'function foo(' });

            const erros = [
                {
                    simbolo: { linha: 1 },
                    message: 'Erro 1'
                },
                {
                    simbolo: { linha: 2 },
                    message: 'Erro 2'
                },
                {
                    simbolo: { linha: 3 },
                    message: 'Erro 3'
                }
            ];

            const resultado = formatarDiagnosticosAvaliacaoSintatica(erros, mockDocumento);

            expect(resultado).toHaveLength(3);
            expect(mockDocumento.lineAt).toHaveBeenCalledTimes(3);
        });

        it('deve criar diagnóstico com severidade de erro', () => {
            mockDocumento.lineAt.mockReturnValue({
                text: 'erro aqui'
            });

            const erros = [
                {
                    simbolo: { linha: 1 },
                    message: 'Erro de sintaxe'
                }
            ];

            const resultado = formatarDiagnosticosAvaliacaoSintatica(erros, mockDocumento);

            expect(resultado[0].severity).toBe(vscode.DiagnosticSeverity.Error);
        });

        it('deve criar Range correto para o erro', () => {
            const textoLinha = 'const x = 10;';
            mockDocumento.lineAt.mockReturnValue({
                text: textoLinha
            });

            const erros = [
                {
                    simbolo: { linha: 5 },
                    message: 'Erro de teste'
                }
            ];

            const resultado = formatarDiagnosticosAvaliacaoSintatica(erros, mockDocumento);

            // Linha 5 -> índice 4
            expect(mockDocumento.lineAt).toHaveBeenCalledWith(4);

            // Range deve cobrir a linha inteira
            expect(resultado[0].range).toBeDefined();
            expect(resultado[0].range.start.line).toBe(4);
            expect(resultado[0].range.end.line).toBe(4);
            expect(resultado[0].range.end.character).toBe(textoLinha.length);
        });

        it('deve converter mensagem de erro para string', () => {
            mockDocumento.lineAt.mockReturnValue({
                text: 'linha de código'
            });

            const erros = [
                {
                    simbolo: { linha: 1 },
                    message: 'Mensagem do erro'
                }
            ];

            const resultado = formatarDiagnosticosAvaliacaoSintatica(erros, mockDocumento);

            expect(resultado[0].message).toBe('Mensagem do erro');
            expect(typeof resultado[0].message).toBe('string');
        });

        it('deve lidar com linhas vazias', () => {
            mockDocumento.lineAt.mockReturnValue({
                text: ''
            });

            const erros = [
                {
                    simbolo: { linha: 1 },
                    message: 'Erro em linha vazia'
                }
            ];

            const resultado = formatarDiagnosticosAvaliacaoSintatica(erros, mockDocumento);

            expect(resultado).toHaveLength(1);
            expect(resultado[0].range.end.character).toBe(0);
        });

        it('deve lidar com linhas longas', () => {
            const linhaLonga = 'a'.repeat(1000);
            mockDocumento.lineAt.mockReturnValue({
                text: linhaLonga
            });

            const erros = [
                {
                    simbolo: { linha: 1 },
                    message: 'Erro em linha longa'
                }
            ];

            const resultado = formatarDiagnosticosAvaliacaoSintatica(erros, mockDocumento);

            expect(resultado).toHaveLength(1);
            expect(resultado[0].range.end.character).toBe(1000);
        });

        it('deve lidar com números de linha como strings', () => {
            mockDocumento.lineAt.mockReturnValue({
                text: 'código'
            });

            const erros = [
                {
                    simbolo: { linha: '10' }, // linha como string
                    message: 'Erro'
                }
            ];

            const resultado = formatarDiagnosticosAvaliacaoSintatica(erros, mockDocumento);

            expect(mockDocumento.lineAt).toHaveBeenCalledWith(9); // '10' -> 9
            expect(resultado).toHaveLength(1);
        });

        it('deve processar mensagens de erro complexas', () => {
            mockDocumento.lineAt.mockReturnValue({
                text: 'código'
            });

            const erros = [
                {
                    simbolo: { linha: 1 },
                    message: 'Esperado ")" após expressão, mas encontrou ";"'
                }
            ];

            const resultado = formatarDiagnosticosAvaliacaoSintatica(erros, mockDocumento);

            expect(resultado[0].message).toBe('Esperado ")" após expressão, mas encontrou ";"');
        });

        it('deve manter ordem dos erros', () => {
            mockDocumento.lineAt
                .mockReturnValueOnce({ text: 'linha 1' })
                .mockReturnValueOnce({ text: 'linha 2' })
                .mockReturnValueOnce({ text: 'linha 3' });

            const erros = [
                {
                    simbolo: { linha: 3 },
                    message: 'Terceiro erro'
                },
                {
                    simbolo: { linha: 1 },
                    message: 'Primeiro erro'
                },
                {
                    simbolo: { linha: 2 },
                    message: 'Segundo erro'
                }
            ];

            const resultado = formatarDiagnosticosAvaliacaoSintatica(erros, mockDocumento);

            expect(resultado).toHaveLength(3);
            expect(resultado[0].message).toBe('Terceiro erro');
            expect(resultado[1].message).toBe('Primeiro erro');
            expect(resultado[2].message).toBe('Segundo erro');
        });

        it('deve criar diagnósticos independentes', () => {
            mockDocumento.lineAt
                .mockReturnValueOnce({ text: 'linha 1' })
                .mockReturnValueOnce({ text: 'linha 2' });

            const erros = [
                {
                    simbolo: { linha: 1 },
                    message: 'Erro A'
                },
                {
                    simbolo: { linha: 2 },
                    message: 'Erro B'
                }
            ];

            const resultado = formatarDiagnosticosAvaliacaoSintatica(erros, mockDocumento);

            expect(resultado[0]).not.toBe(resultado[1]);
            expect(resultado[0].range).not.toBe(resultado[1].range);
        });

        it('deve lidar com erros em diferentes linhas do documento', () => {
            mockDocumento.lineAt
                .mockReturnValueOnce({ text: 'primeira linha' })
                .mockReturnValueOnce({ text: 'linha muito longa com muito texto' })
                .mockReturnValueOnce({ text: 'x' });

            const erros = [
                {
                    simbolo: { linha: 1 },
                    message: 'Erro linha 1'
                },
                {
                    simbolo: { linha: 50 },
                    message: 'Erro linha 50'
                },
                {
                    simbolo: { linha: 100 },
                    message: 'Erro linha 100'
                }
            ];

            const resultado = formatarDiagnosticosAvaliacaoSintatica(erros, mockDocumento);

            expect(resultado).toHaveLength(3);
            expect(resultado[0].range.start.line).toBe(0);
            expect(resultado[1].range.start.line).toBe(49);
            expect(resultado[2].range.start.line).toBe(99);
        });

        it('deve lidar com caracteres especiais na mensagem', () => {
            mockDocumento.lineAt.mockReturnValue({
                text: 'código'
            });

            const erros = [
                {
                    simbolo: { linha: 1 },
                    message: 'Erro com "aspas", \'apóstrofo\', e \n nova linha'
                }
            ];

            const resultado = formatarDiagnosticosAvaliacaoSintatica(erros, mockDocumento);

            expect(resultado[0].message).toContain('aspas');
            expect(resultado[0].message).toContain('apóstrofo');
        });

        it('deve lidar com linhas com espaços em branco', () => {
            mockDocumento.lineAt.mockReturnValue({
                text: '    '
            });

            const erros = [
                {
                    simbolo: { linha: 1 },
                    message: 'Erro'
                }
            ];

            const resultado = formatarDiagnosticosAvaliacaoSintatica(erros, mockDocumento);

            expect(resultado).toHaveLength(1);
            expect(resultado[0].range.end.character).toBe(4);
        });
    });

    describe('Casos extremos', () => {
        let mockDocumento: any;

        beforeEach(() => {
            mockDocumento = {
                lineAt: jest.fn()
            };
        });

        it('deve lidar com linha 0 (primeira linha)', () => {
            mockDocumento.lineAt.mockReturnValue({
                text: 'primeira linha do arquivo'
            });

            const erros = [
                {
                    simbolo: { linha: 1 }, // linha 1 em formato humano
                    message: 'Erro na primeira linha'
                }
            ];

            const resultado = formatarDiagnosticosAvaliacaoSintatica(erros, mockDocumento);

            expect(mockDocumento.lineAt).toHaveBeenCalledWith(0);
        });

        it('deve processar mensagem de erro que é objeto', () => {
            mockDocumento.lineAt.mockReturnValue({
                text: 'código'
            });

            const erros = [
                {
                    simbolo: { linha: 1 },
                    message: { toString: () => 'Erro complexo' }
                }
            ];

            const resultado = formatarDiagnosticosAvaliacaoSintatica(erros, mockDocumento);

            expect(typeof resultado[0].message).toBe('string');
        });
    });
});
