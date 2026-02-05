// @ts-nocheck - Ignora erros de tipo nos mocks complexos
import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import * as vscode from 'vscode';

// Mock do módulo vscode
jest.mock('vscode', () => {
    class MockRange {
        constructor(
            public startLine: number,
            public startCharacter: number,
            public endLine: number,
            public endCharacter: number
        ) {}
    }

    class MockWorkspaceEdit {
        _replacements: Array<{ uri: any; range: any; newText: string }> = [];
        replace(uri: any, range: any, newText: string) {
            this._replacements.push({ uri, range, newText });
        }
    }

    class MockCodeAction {
        edit: any;
        diagnostics: any[];
        isPreferred: boolean;
        constructor(public title: string, public kind: any) {}
    }

    return {
        CodeAction: MockCodeAction,
        CodeActionKind: {
            QuickFix: 'quickfix'
        },
        WorkspaceEdit: MockWorkspaceEdit,
        Range: MockRange
    };
}, { virtual: true });

// Mock do cache de análise
jest.mock('../../fontes/analise-codigo/cache-analise', () => ({
    obterResultado: jest.fn()
}), { virtual: true });

describe('acoes-codigo/DeleguaProvedorAcoesCodigo', () => {
    let DeleguaProvedorAcoesCodigo: any;
    let provedor: any;
    let obterResultado: any;
    let mockDocumento: any;
    let mockRange: any;
    let mockToken: any;

    function criarDiagnosticoVscode(mensagem: string) {
        return { message: mensagem };
    }

    function criarContexto(diagnosticos: any[]) {
        return { diagnostics: diagnosticos };
    }

    function criarCorrecao(overrides: Partial<{
        titulo: string;
        textoOriginal: string;
        textoSubstituto: string;
        linha: number;
        colunaInicio: number;
        colunaFim: number;
    }> = {}) {
        return {
            titulo: "Alterar tipo para 'número'",
            textoOriginal: 'qualquer',
            textoSubstituto: 'número',
            linha: 1,
            colunaInicio: 5,
            colunaFim: 6,
            ...overrides
        };
    }

    function criarResultadoComDiagnosticos(diagnosticos: any[]) {
        return {
            analisadorSemantico: { diagnosticos }
        };
    }

    beforeEach(() => {
        jest.clearAllMocks();

        const modulo = require('../../fontes/acoes-codigo/delegua-provedor-acoes-codigo');
        DeleguaProvedorAcoesCodigo = modulo.DeleguaProvedorAcoesCodigo;
        provedor = new DeleguaProvedorAcoesCodigo();

        const cacheModulo = require('../../fontes/analise-codigo/cache-analise');
        obterResultado = cacheModulo.obterResultado;

        mockDocumento = {
            uri: { toString: () => 'file:///test.delegua' },
            lineAt: jest.fn().mockReturnValue({ text: '' })
        };

        mockRange = {};
        mockToken = {};
    });

    describe('Propriedades estáticas', () => {
        it('deve ter tiposAcoesRapidas contendo QuickFix', () => {
            expect(DeleguaProvedorAcoesCodigo.tiposAcoesRapidas).toBeDefined();
            expect(DeleguaProvedorAcoesCodigo.tiposAcoesRapidas).toContain(vscode.CodeActionKind.QuickFix);
        });
    });

    describe('provideCodeActions', () => {
        it('deve retornar undefined quando não há resultado de análise', () => {
            obterResultado.mockReturnValue(undefined);
            const contexto = criarContexto([criarDiagnosticoVscode('mensagem')]);

            const acoes = provedor.provideCodeActions(mockDocumento, mockRange, contexto, mockToken);

            expect(acoes).toBeUndefined();
        });

        it('deve retornar undefined quando resultado não possui analisadorSemantico', () => {
            obterResultado.mockReturnValue({});
            const contexto = criarContexto([criarDiagnosticoVscode('mensagem')]);

            const acoes = provedor.provideCodeActions(mockDocumento, mockRange, contexto, mockToken);

            expect(acoes).toBeUndefined();
        });

        it('deve retornar undefined quando analisadorSemantico não possui diagnosticos', () => {
            obterResultado.mockReturnValue({ analisadorSemantico: {} });
            const contexto = criarContexto([criarDiagnosticoVscode('mensagem')]);

            const acoes = provedor.provideCodeActions(mockDocumento, mockRange, contexto, mockToken);

            expect(acoes).toBeUndefined();
        });

        it('deve retornar array vazio quando nenhum diagnóstico corresponde', () => {
            obterResultado.mockReturnValue(criarResultadoComDiagnosticos([
                { mensagem: 'outra mensagem', correcoes: [criarCorrecao()] }
            ]));
            const contexto = criarContexto([criarDiagnosticoVscode('mensagem diferente')]);

            const acoes = provedor.provideCodeActions(mockDocumento, mockRange, contexto, mockToken);

            expect(acoes).toEqual([]);
        });

        it('deve retornar array vazio quando diagnóstico correspondente não tem correções', () => {
            obterResultado.mockReturnValue(criarResultadoComDiagnosticos([
                { mensagem: 'mensagem', correcoes: [] }
            ]));
            const contexto = criarContexto([criarDiagnosticoVscode('mensagem')]);

            const acoes = provedor.provideCodeActions(mockDocumento, mockRange, contexto, mockToken);

            expect(acoes).toEqual([]);
        });

        it('deve retornar array vazio quando diagnóstico correspondente não possui campo correções', () => {
            obterResultado.mockReturnValue(criarResultadoComDiagnosticos([
                { mensagem: 'mensagem' }
            ]));
            const contexto = criarContexto([criarDiagnosticoVscode('mensagem')]);

            const acoes = provedor.provideCodeActions(mockDocumento, mockRange, contexto, mockToken);

            expect(acoes).toEqual([]);
        });
    });

    describe('Geração de ações de correção', () => {
        it('deve criar ação de QuickFix com título correto', () => {
            const correcao = criarCorrecao({ titulo: "Alterar tipo para 'inteiro'" });
            obterResultado.mockReturnValue(criarResultadoComDiagnosticos([
                { mensagem: 'Um tipo melhor pode ser inferido.', correcoes: [correcao] }
            ]));
            mockDocumento.lineAt.mockReturnValue({ text: 'var a: qualquer = 2' });
            const contexto = criarContexto([criarDiagnosticoVscode('Um tipo melhor pode ser inferido.')]);

            const acoes = provedor.provideCodeActions(mockDocumento, mockRange, contexto, mockToken);

            expect(acoes).toHaveLength(1);
            expect(acoes[0].title).toBe("Alterar tipo para 'inteiro'");
            expect(acoes[0].kind).toBe(vscode.CodeActionKind.QuickFix);
        });

        it('deve marcar ação como preferida', () => {
            const correcao = criarCorrecao();
            obterResultado.mockReturnValue(criarResultadoComDiagnosticos([
                { mensagem: 'mensagem', correcoes: [correcao] }
            ]));
            mockDocumento.lineAt.mockReturnValue({ text: 'var a: qualquer = 2' });
            const diagnosticoVscode = criarDiagnosticoVscode('mensagem');
            const contexto = criarContexto([diagnosticoVscode]);

            const acoes = provedor.provideCodeActions(mockDocumento, mockRange, contexto, mockToken);

            expect(acoes[0].isPreferred).toBe(true);
        });

        it('deve associar diagnóstico do VSCode à ação', () => {
            const correcao = criarCorrecao();
            obterResultado.mockReturnValue(criarResultadoComDiagnosticos([
                { mensagem: 'mensagem', correcoes: [correcao] }
            ]));
            mockDocumento.lineAt.mockReturnValue({ text: 'var a: qualquer = 2' });
            const diagnosticoVscode = criarDiagnosticoVscode('mensagem');
            const contexto = criarContexto([diagnosticoVscode]);

            const acoes = provedor.provideCodeActions(mockDocumento, mockRange, contexto, mockToken);

            expect(acoes[0].diagnostics).toEqual([diagnosticoVscode]);
        });

        it('deve criar múltiplas ações para múltiplas correções', () => {
            const correcao1 = criarCorrecao({ titulo: "Alterar tipo para 'número'" });
            const correcao2 = criarCorrecao({ titulo: "Alterar tipo para 'inteiro'", textoSubstituto: 'inteiro' });
            obterResultado.mockReturnValue(criarResultadoComDiagnosticos([
                { mensagem: 'mensagem', correcoes: [correcao1, correcao2] }
            ]));
            mockDocumento.lineAt.mockReturnValue({ text: 'var a: qualquer = 2' });
            const contexto = criarContexto([criarDiagnosticoVscode('mensagem')]);

            const acoes = provedor.provideCodeActions(mockDocumento, mockRange, contexto, mockToken);

            expect(acoes).toHaveLength(2);
            expect(acoes[0].title).toBe("Alterar tipo para 'número'");
            expect(acoes[1].title).toBe("Alterar tipo para 'inteiro'");
        });

        it('deve criar ações para múltiplos diagnósticos', () => {
            obterResultado.mockReturnValue(criarResultadoComDiagnosticos([
                { mensagem: 'mensagem 1', correcoes: [criarCorrecao({ titulo: 'Correção 1' })] },
                { mensagem: 'mensagem 2', correcoes: [criarCorrecao({ titulo: 'Correção 2' })] }
            ]));
            mockDocumento.lineAt.mockReturnValue({ text: 'var a: qualquer = 2' });
            const contexto = criarContexto([
                criarDiagnosticoVscode('mensagem 1'),
                criarDiagnosticoVscode('mensagem 2')
            ]);

            const acoes = provedor.provideCodeActions(mockDocumento, mockRange, contexto, mockToken);

            expect(acoes).toHaveLength(2);
            expect(acoes[0].title).toBe('Correção 1');
            expect(acoes[1].title).toBe('Correção 2');
        });
    });

    describe('Posicionamento correto do texto substituído', () => {
        it('deve encontrar posição real de textoOriginal na linha', () => {
            // Cenário: "var a: qualquer = 2"
            // colunaInicio aponta para o símbolo da variável (posição incorreta do upstream),
            // mas o código deve encontrar "qualquer" na posição correta (coluna 7).
            const correcao = criarCorrecao({
                textoOriginal: 'qualquer',
                textoSubstituto: 'número',
                linha: 1,
                colunaInicio: 5
            });
            obterResultado.mockReturnValue(criarResultadoComDiagnosticos([
                { mensagem: 'Um tipo melhor pode ser inferido.', correcoes: [correcao] }
            ]));
            mockDocumento.lineAt.mockReturnValue({ text: 'var a: qualquer = 2' });
            const contexto = criarContexto([criarDiagnosticoVscode('Um tipo melhor pode ser inferido.')]);

            const acoes = provedor.provideCodeActions(mockDocumento, mockRange, contexto, mockToken);

            expect(acoes).toHaveLength(1);
            const substituicao = acoes[0].edit._replacements[0];
            // "qualquer" começa na coluna 7 (0-based) em "var a: qualquer = 2"
            expect(substituicao.range.startCharacter).toBe(7);
            expect(substituicao.range.endCharacter).toBe(7 + 'qualquer'.length);
            expect(substituicao.newText).toBe('número');
        });

        it('deve converter linha de 1-based para 0-based', () => {
            const correcao = criarCorrecao({ linha: 3 });
            obterResultado.mockReturnValue(criarResultadoComDiagnosticos([
                { mensagem: 'mensagem', correcoes: [correcao] }
            ]));
            mockDocumento.lineAt.mockReturnValue({ text: 'var a: qualquer = 2' });
            const contexto = criarContexto([criarDiagnosticoVscode('mensagem')]);

            const acoes = provedor.provideCodeActions(mockDocumento, mockRange, contexto, mockToken);

            const substituicao = acoes[0].edit._replacements[0];
            expect(substituicao.range.startLine).toBe(2);
            expect(substituicao.range.endLine).toBe(2);
        });

        it('deve encontrar textoOriginal quando colunaInicio aponta para posição anterior', () => {
            // Caso: colunaInicio aponta para a variável, mas textoOriginal está depois.
            const correcao = criarCorrecao({
                textoOriginal: 'texto',
                textoSubstituto: 'número',
                colunaInicio: 4
            });
            obterResultado.mockReturnValue(criarResultadoComDiagnosticos([
                { mensagem: 'mensagem', correcoes: [correcao] }
            ]));
            // "var b: texto = 'olá'"
            mockDocumento.lineAt.mockReturnValue({ text: "var b: texto = 'olá'" });
            const contexto = criarContexto([criarDiagnosticoVscode('mensagem')]);

            const acoes = provedor.provideCodeActions(mockDocumento, mockRange, contexto, mockToken);

            expect(acoes).toHaveLength(1);
            const substituicao = acoes[0].edit._replacements[0];
            expect(substituicao.range.startCharacter).toBe(7);
            expect(substituicao.range.endCharacter).toBe(7 + 'texto'.length);
        });

        it('deve funcionar quando colunaInicio já aponta para posição correta', () => {
            // Caso: após correção no upstream, colunaInicio aponta diretamente para textoOriginal.
            const correcao = criarCorrecao({
                textoOriginal: 'qualquer',
                textoSubstituto: 'número',
                colunaInicio: 7
            });
            obterResultado.mockReturnValue(criarResultadoComDiagnosticos([
                { mensagem: 'mensagem', correcoes: [correcao] }
            ]));
            mockDocumento.lineAt.mockReturnValue({ text: 'var a: qualquer = 2' });
            const contexto = criarContexto([criarDiagnosticoVscode('mensagem')]);

            const acoes = provedor.provideCodeActions(mockDocumento, mockRange, contexto, mockToken);

            expect(acoes).toHaveLength(1);
            const substituicao = acoes[0].edit._replacements[0];
            expect(substituicao.range.startCharacter).toBe(7);
            expect(substituicao.range.endCharacter).toBe(15);
        });

        it('deve pular correção quando textoOriginal não é encontrado na linha', () => {
            const correcao = criarCorrecao({
                textoOriginal: 'inexistente',
                colunaInicio: 0
            });
            obterResultado.mockReturnValue(criarResultadoComDiagnosticos([
                { mensagem: 'mensagem', correcoes: [correcao] }
            ]));
            mockDocumento.lineAt.mockReturnValue({ text: 'var a: qualquer = 2' });
            const contexto = criarContexto([criarDiagnosticoVscode('mensagem')]);

            const acoes = provedor.provideCodeActions(mockDocumento, mockRange, contexto, mockToken);

            expect(acoes).toEqual([]);
        });

        it('deve usar URI do documento na substituição', () => {
            const correcao = criarCorrecao();
            obterResultado.mockReturnValue(criarResultadoComDiagnosticos([
                { mensagem: 'mensagem', correcoes: [correcao] }
            ]));
            mockDocumento.lineAt.mockReturnValue({ text: 'var a: qualquer = 2' });
            const contexto = criarContexto([criarDiagnosticoVscode('mensagem')]);

            const acoes = provedor.provideCodeActions(mockDocumento, mockRange, contexto, mockToken);

            const substituicao = acoes[0].edit._replacements[0];
            expect(substituicao.uri).toBe(mockDocumento.uri);
        });
    });

    describe('Cenário real: var a: qualquer = 2', () => {
        it('deve substituir apenas "qualquer" por "número", mantendo restante intacto', () => {
            // Simula o cenário real onde o analisador semântico envia colunaInicio
            // apontando para o símbolo da variável "a" (posição 5 em 1-based).
            const correcao = criarCorrecao({
                titulo: "Alterar tipo para 'número'",
                textoOriginal: 'qualquer',
                textoSubstituto: 'número',
                linha: 1,
                colunaInicio: 5,
                colunaFim: 6
            });
            obterResultado.mockReturnValue(criarResultadoComDiagnosticos([
                { mensagem: 'Um tipo melhor pode ser inferido.', correcoes: [correcao] }
            ]));
            mockDocumento.lineAt.mockReturnValue({ text: 'var a: qualquer = 2' });
            const contexto = criarContexto([criarDiagnosticoVscode('Um tipo melhor pode ser inferido.')]);

            const acoes = provedor.provideCodeActions(mockDocumento, mockRange, contexto, mockToken);

            expect(acoes).toHaveLength(1);
            const substituicao = acoes[0].edit._replacements[0];

            // Verifica que o intervalo cobre exatamente "qualquer" (colunas 7 a 15)
            expect(substituicao.range.startCharacter).toBe(7);
            expect(substituicao.range.endCharacter).toBe(15);
            expect(substituicao.newText).toBe('número');

            // Verifica que NÃO produziria o resultado "var anúmeroer = 2"
            const linhaOriginal = 'var a: qualquer = 2';
            const resultado = linhaOriginal.substring(0, substituicao.range.startCharacter) +
                substituicao.newText +
                linhaOriginal.substring(substituicao.range.endCharacter);
            expect(resultado).toBe('var a: número = 2');
        });

        it('deve lidar com const ao invés de var', () => {
            const correcao = criarCorrecao({
                textoOriginal: 'qualquer',
                textoSubstituto: 'texto',
                colunaInicio: 7
            });
            obterResultado.mockReturnValue(criarResultadoComDiagnosticos([
                { mensagem: 'mensagem', correcoes: [correcao] }
            ]));
            mockDocumento.lineAt.mockReturnValue({ text: "const nome: qualquer = 'Maria'" });
            const contexto = criarContexto([criarDiagnosticoVscode('mensagem')]);

            const acoes = provedor.provideCodeActions(mockDocumento, mockRange, contexto, mockToken);

            expect(acoes).toHaveLength(1);
            const substituicao = acoes[0].edit._replacements[0];
            const linhaOriginal = "const nome: qualquer = 'Maria'";
            const resultado = linhaOriginal.substring(0, substituicao.range.startCharacter) +
                substituicao.newText +
                linhaOriginal.substring(substituicao.range.endCharacter);
            expect(resultado).toBe("const nome: texto = 'Maria'");
        });

        it('deve lidar com indentação na linha', () => {
            const correcao = criarCorrecao({
                textoOriginal: 'qualquer',
                textoSubstituto: 'número',
                colunaInicio: 9
            });
            obterResultado.mockReturnValue(criarResultadoComDiagnosticos([
                { mensagem: 'mensagem', correcoes: [correcao] }
            ]));
            mockDocumento.lineAt.mockReturnValue({ text: '    var x: qualquer = 42' });
            const contexto = criarContexto([criarDiagnosticoVscode('mensagem')]);

            const acoes = provedor.provideCodeActions(mockDocumento, mockRange, contexto, mockToken);

            expect(acoes).toHaveLength(1);
            const substituicao = acoes[0].edit._replacements[0];
            const linhaOriginal = '    var x: qualquer = 42';
            const resultado = linhaOriginal.substring(0, substituicao.range.startCharacter) +
                substituicao.newText +
                linhaOriginal.substring(substituicao.range.endCharacter);
            expect(resultado).toBe('    var x: número = 42');
        });
    });

    describe('Casos extremos', () => {
        it('deve lidar com contexto sem diagnósticos', () => {
            obterResultado.mockReturnValue(criarResultadoComDiagnosticos([]));
            const contexto = criarContexto([]);

            const acoes = provedor.provideCodeActions(mockDocumento, mockRange, contexto, mockToken);

            expect(acoes).toEqual([]);
        });

        it('deve lidar com textoOriginal aparecendo múltiplas vezes na linha', () => {
            // "var qualquer: qualquer = qualquer" - deve encontrar a partir de colunaInicio
            const correcao = criarCorrecao({
                textoOriginal: 'qualquer',
                textoSubstituto: 'número',
                colunaInicio: 4
            });
            obterResultado.mockReturnValue(criarResultadoComDiagnosticos([
                { mensagem: 'mensagem', correcoes: [correcao] }
            ]));
            mockDocumento.lineAt.mockReturnValue({ text: 'var qualquer: qualquer = 1' });
            const contexto = criarContexto([criarDiagnosticoVscode('mensagem')]);

            const acoes = provedor.provideCodeActions(mockDocumento, mockRange, contexto, mockToken);

            expect(acoes).toHaveLength(1);
            const substituicao = acoes[0].edit._replacements[0];
            // Deve encontrar a partir de colunaInicio (4), que é o "qualquer" na posição 4
            expect(substituicao.range.startCharacter).toBe(4);
        });

        it('deve pular correções com textoOriginal não encontrado e ainda processar as válidas', () => {
            const correcaoInvalida = criarCorrecao({
                titulo: 'Correção inválida',
                textoOriginal: 'inexistente',
                colunaInicio: 0
            });
            const correcaoValida = criarCorrecao({
                titulo: 'Correção válida',
                textoOriginal: 'qualquer',
                colunaInicio: 5
            });
            obterResultado.mockReturnValue(criarResultadoComDiagnosticos([
                { mensagem: 'mensagem', correcoes: [correcaoInvalida, correcaoValida] }
            ]));
            mockDocumento.lineAt.mockReturnValue({ text: 'var a: qualquer = 2' });
            const contexto = criarContexto([criarDiagnosticoVscode('mensagem')]);

            const acoes = provedor.provideCodeActions(mockDocumento, mockRange, contexto, mockToken);

            expect(acoes).toHaveLength(1);
            expect(acoes[0].title).toBe('Correção válida');
        });

        it('deve criar WorkspaceEdit para cada ação', () => {
            const correcao = criarCorrecao();
            obterResultado.mockReturnValue(criarResultadoComDiagnosticos([
                { mensagem: 'mensagem', correcoes: [correcao] }
            ]));
            mockDocumento.lineAt.mockReturnValue({ text: 'var a: qualquer = 2' });
            const contexto = criarContexto([criarDiagnosticoVscode('mensagem')]);

            const acoes = provedor.provideCodeActions(mockDocumento, mockRange, contexto, mockToken);

            expect(acoes[0].edit).toBeDefined();
            expect(acoes[0].edit._replacements).toHaveLength(1);
        });
    });
});
