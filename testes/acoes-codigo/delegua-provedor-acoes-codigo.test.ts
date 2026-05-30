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
        _insertions: Array<{ uri: any; position: any; newText: string }> = [];
        replace(uri: any, range: any, newText: string) {
            this._replacements.push({ uri, range, newText });
        }
        insert(uri: any, position: any, newText: string) {
            this._insertions.push({ uri, position, newText });
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
        Range: MockRange,
        Position: class Position {
            constructor(public line: number, public character: number) {}
        },
        workspace: {
            findFiles: jest.fn().mockResolvedValue([])
        }
    };
}, { virtual: true });

// Mock do cache de análise
jest.mock('@designliquido/delegua-lsp/analise/cache-analise', () => ({
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

        const cacheModulo = require('@designliquido/delegua-lsp/analise/cache-analise');
        obterResultado = cacheModulo.obterResultado;

        mockDocumento = {
            uri: { toString: () => 'file:///test.delegua' },
            lineAt: jest.fn().mockReturnValue({ text: '' }),
            lineCount: 1,
            getText: jest.fn().mockReturnValue('')
        };

        mockRange = {};
        mockToken = {};
    });

    describe('Propriedades estáticas', () => {
        it('deve ter tiposAcoesRapidas contendo QuickFix', async () => {
            expect(DeleguaProvedorAcoesCodigo.tiposAcoesRapidas).toBeDefined();
            expect(DeleguaProvedorAcoesCodigo.tiposAcoesRapidas).toContain(vscode.CodeActionKind.QuickFix);
        });
    });

    describe('provideCodeActions', () => {
        it('deve retornar undefined quando não há resultado de análise', async () => {
            obterResultado.mockReturnValue(undefined);
            const contexto = criarContexto([criarDiagnosticoVscode('mensagem')]);

            const acoes = await provedor.provideCodeActions(mockDocumento, mockRange, contexto, mockToken);

            expect(acoes).toBeUndefined();
        });

        it('deve retornar undefined quando resultado não possui analisadorSemantico', async () => {
            obterResultado.mockReturnValue({});
            const contexto = criarContexto([criarDiagnosticoVscode('mensagem')]);

            const acoes = await provedor.provideCodeActions(mockDocumento, mockRange, contexto, mockToken);

            expect(acoes).toBeUndefined();
        });

        it('deve retornar undefined quando analisadorSemantico não possui diagnosticos', async () => {
            obterResultado.mockReturnValue({ analisadorSemantico: {} });
            const contexto = criarContexto([criarDiagnosticoVscode('mensagem')]);

            const acoes = await provedor.provideCodeActions(mockDocumento, mockRange, contexto, mockToken);

            expect(acoes).toBeUndefined();
        });

        it('deve retornar array vazio quando nenhum diagnóstico corresponde', async () => {
            obterResultado.mockReturnValue(criarResultadoComDiagnosticos([
                { mensagem: 'outra mensagem', correcoes: [criarCorrecao()] }
            ]));
            const contexto = criarContexto([criarDiagnosticoVscode('mensagem diferente')]);

            const acoes = await provedor.provideCodeActions(mockDocumento, mockRange, contexto, mockToken);

            expect(acoes).toEqual([]);
        });

        it('deve retornar array vazio quando diagnóstico correspondente não tem correções', async () => {
            obterResultado.mockReturnValue(criarResultadoComDiagnosticos([
                { mensagem: 'mensagem', correcoes: [] }
            ]));
            const contexto = criarContexto([criarDiagnosticoVscode('mensagem')]);

            const acoes = await provedor.provideCodeActions(mockDocumento, mockRange, contexto, mockToken);

            expect(acoes).toEqual([]);
        });

        it('deve retornar array vazio quando diagnóstico correspondente não possui campo correções', async () => {
            obterResultado.mockReturnValue(criarResultadoComDiagnosticos([
                { mensagem: 'mensagem' }
            ]));
            const contexto = criarContexto([criarDiagnosticoVscode('mensagem')]);

            const acoes = await provedor.provideCodeActions(mockDocumento, mockRange, contexto, mockToken);

            expect(acoes).toEqual([]);
        });
    });

    describe('Geração de ações de correção', () => {
        it('deve criar ação de QuickFix com título correto', async () => {
            const correcao = criarCorrecao({ titulo: "Alterar tipo para 'inteiro'" });
            obterResultado.mockReturnValue(criarResultadoComDiagnosticos([
                { mensagem: 'Um tipo melhor pode ser inferido.', correcoes: [correcao] }
            ]));
            mockDocumento.lineAt.mockReturnValue({ text: 'var a: qualquer = 2' });
            const contexto = criarContexto([criarDiagnosticoVscode('Um tipo melhor pode ser inferido.')]);

            const acoes = await provedor.provideCodeActions(mockDocumento, mockRange, contexto, mockToken);

            expect(acoes).toHaveLength(1);
            expect(acoes[0].title).toBe("Alterar tipo para 'inteiro'");
            expect(acoes[0].kind).toBe(vscode.CodeActionKind.QuickFix);
        });

        it('deve marcar ação como preferida', async () => {
            const correcao = criarCorrecao();
            obterResultado.mockReturnValue(criarResultadoComDiagnosticos([
                { mensagem: 'mensagem', correcoes: [correcao] }
            ]));
            mockDocumento.lineAt.mockReturnValue({ text: 'var a: qualquer = 2' });
            const diagnosticoVscode = criarDiagnosticoVscode('mensagem');
            const contexto = criarContexto([diagnosticoVscode]);

            const acoes = await provedor.provideCodeActions(mockDocumento, mockRange, contexto, mockToken);

            expect(acoes[0].isPreferred).toBe(true);
        });

        it('deve associar diagnóstico do VSCode à ação', async () => {
            const correcao = criarCorrecao();
            obterResultado.mockReturnValue(criarResultadoComDiagnosticos([
                { mensagem: 'mensagem', correcoes: [correcao] }
            ]));
            mockDocumento.lineAt.mockReturnValue({ text: 'var a: qualquer = 2' });
            const diagnosticoVscode = criarDiagnosticoVscode('mensagem');
            const contexto = criarContexto([diagnosticoVscode]);

            const acoes = await provedor.provideCodeActions(mockDocumento, mockRange, contexto, mockToken);

            expect(acoes[0].diagnostics).toEqual([diagnosticoVscode]);
        });

        it('deve criar múltiplas ações para múltiplas correções', async () => {
            const correcao1 = criarCorrecao({ titulo: "Alterar tipo para 'número'" });
            const correcao2 = criarCorrecao({ titulo: "Alterar tipo para 'inteiro'", textoSubstituto: 'inteiro' });
            obterResultado.mockReturnValue(criarResultadoComDiagnosticos([
                { mensagem: 'mensagem', correcoes: [correcao1, correcao2] }
            ]));
            mockDocumento.lineAt.mockReturnValue({ text: 'var a: qualquer = 2' });
            const contexto = criarContexto([criarDiagnosticoVscode('mensagem')]);

            const acoes = await provedor.provideCodeActions(mockDocumento, mockRange, contexto, mockToken);

            expect(acoes).toHaveLength(2);
            expect(acoes[0].title).toBe("Alterar tipo para 'número'");
            expect(acoes[1].title).toBe("Alterar tipo para 'inteiro'");
        });

        it('deve criar ações para múltiplos diagnósticos', async () => {
            obterResultado.mockReturnValue(criarResultadoComDiagnosticos([
                { mensagem: 'mensagem 1', correcoes: [criarCorrecao({ titulo: 'Correção 1' })] },
                { mensagem: 'mensagem 2', correcoes: [criarCorrecao({ titulo: 'Correção 2' })] }
            ]));
            mockDocumento.lineAt.mockReturnValue({ text: 'var a: qualquer = 2' });
            const contexto = criarContexto([
                criarDiagnosticoVscode('mensagem 1'),
                criarDiagnosticoVscode('mensagem 2')
            ]);

            const acoes = await provedor.provideCodeActions(mockDocumento, mockRange, contexto, mockToken);

            expect(acoes).toHaveLength(2);
            expect(acoes[0].title).toBe('Correção 1');
            expect(acoes[1].title).toBe('Correção 2');
        });
    });

    describe('Posicionamento correto do texto substituído', () => {
        it('deve encontrar posição real de textoOriginal na linha', async () => {
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

            const acoes = await provedor.provideCodeActions(mockDocumento, mockRange, contexto, mockToken);

            expect(acoes).toHaveLength(1);
            const substituicao = acoes[0].edit._replacements[0];
            // "qualquer" começa na coluna 7 (0-based) em "var a: qualquer = 2"
            expect(substituicao.range.startCharacter).toBe(7);
            expect(substituicao.range.endCharacter).toBe(7 + 'qualquer'.length);
            expect(substituicao.newText).toBe('número');
        });

        it('deve converter linha de 1-based para 0-based', async () => {
            const correcao = criarCorrecao({ linha: 3 });
            obterResultado.mockReturnValue(criarResultadoComDiagnosticos([
                { mensagem: 'mensagem', correcoes: [correcao] }
            ]));
            mockDocumento.lineAt.mockReturnValue({ text: 'var a: qualquer = 2' });
            const contexto = criarContexto([criarDiagnosticoVscode('mensagem')]);

            const acoes = await provedor.provideCodeActions(mockDocumento, mockRange, contexto, mockToken);

            const substituicao = acoes[0].edit._replacements[0];
            expect(substituicao.range.startLine).toBe(2);
            expect(substituicao.range.endLine).toBe(2);
        });

        it('deve encontrar textoOriginal quando colunaInicio aponta para posição anterior', async () => {
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

            const acoes = await provedor.provideCodeActions(mockDocumento, mockRange, contexto, mockToken);

            expect(acoes).toHaveLength(1);
            const substituicao = acoes[0].edit._replacements[0];
            expect(substituicao.range.startCharacter).toBe(7);
            expect(substituicao.range.endCharacter).toBe(7 + 'texto'.length);
        });

        it('deve funcionar quando colunaInicio já aponta para posição correta', async () => {
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

            const acoes = await provedor.provideCodeActions(mockDocumento, mockRange, contexto, mockToken);

            expect(acoes).toHaveLength(1);
            const substituicao = acoes[0].edit._replacements[0];
            expect(substituicao.range.startCharacter).toBe(7);
            expect(substituicao.range.endCharacter).toBe(15);
        });

        it('deve pular correção quando textoOriginal não é encontrado na linha', async () => {
            const correcao = criarCorrecao({
                textoOriginal: 'inexistente',
                colunaInicio: 0
            });
            obterResultado.mockReturnValue(criarResultadoComDiagnosticos([
                { mensagem: 'mensagem', correcoes: [correcao] }
            ]));
            mockDocumento.lineAt.mockReturnValue({ text: 'var a: qualquer = 2' });
            const contexto = criarContexto([criarDiagnosticoVscode('mensagem')]);

            const acoes = await provedor.provideCodeActions(mockDocumento, mockRange, contexto, mockToken);

            expect(acoes).toEqual([]);
        });

        it('deve usar URI do documento na substituição', async () => {
            const correcao = criarCorrecao();
            obterResultado.mockReturnValue(criarResultadoComDiagnosticos([
                { mensagem: 'mensagem', correcoes: [correcao] }
            ]));
            mockDocumento.lineAt.mockReturnValue({ text: 'var a: qualquer = 2' });
            const contexto = criarContexto([criarDiagnosticoVscode('mensagem')]);

            const acoes = await provedor.provideCodeActions(mockDocumento, mockRange, contexto, mockToken);

            const substituicao = acoes[0].edit._replacements[0];
            expect(substituicao.uri).toBe(mockDocumento.uri);
        });
    });

    describe('Cenário real: var a: qualquer = 2', () => {
        it('deve substituir apenas "qualquer" por "número", mantendo restante intacto', async () => {
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

            const acoes = await provedor.provideCodeActions(mockDocumento, mockRange, contexto, mockToken);

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

        it('deve lidar com const ao invés de var', async () => {
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

            const acoes = await provedor.provideCodeActions(mockDocumento, mockRange, contexto, mockToken);

            expect(acoes).toHaveLength(1);
            const substituicao = acoes[0].edit._replacements[0];
            const linhaOriginal = "const nome: qualquer = 'Maria'";
            const resultado = linhaOriginal.substring(0, substituicao.range.startCharacter) +
                substituicao.newText +
                linhaOriginal.substring(substituicao.range.endCharacter);
            expect(resultado).toBe("const nome: texto = 'Maria'");
        });

        it('deve lidar com indentação na linha', async () => {
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

            const acoes = await provedor.provideCodeActions(mockDocumento, mockRange, contexto, mockToken);

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
        it('deve lidar com contexto sem diagnósticos', async () => {
            obterResultado.mockReturnValue(criarResultadoComDiagnosticos([]));
            const contexto = criarContexto([]);

            const acoes = await provedor.provideCodeActions(mockDocumento, mockRange, contexto, mockToken);

            expect(acoes).toEqual([]);
        });

        it('deve lidar com textoOriginal aparecendo múltiplas vezes na linha', async () => {
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

            const acoes = await provedor.provideCodeActions(mockDocumento, mockRange, contexto, mockToken);

            expect(acoes).toHaveLength(1);
            const substituicao = acoes[0].edit._replacements[0];
            // Deve encontrar a partir de colunaInicio (4), que é o "qualquer" na posição 4
            expect(substituicao.range.startCharacter).toBe(4);
        });

        it('deve pular correções com textoOriginal não encontrado e ainda processar as válidas', async () => {
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

            const acoes = await provedor.provideCodeActions(mockDocumento, mockRange, contexto, mockToken);

            expect(acoes).toHaveLength(1);
            expect(acoes[0].title).toBe('Correção válida');
        });

        it('deve criar WorkspaceEdit para cada ação', async () => {
            const correcao = criarCorrecao();
            obterResultado.mockReturnValue(criarResultadoComDiagnosticos([
                { mensagem: 'mensagem', correcoes: [correcao] }
            ]));
            mockDocumento.lineAt.mockReturnValue({ text: 'var a: qualquer = 2' });
            const contexto = criarContexto([criarDiagnosticoVscode('mensagem')]);

            const acoes = await provedor.provideCodeActions(mockDocumento, mockRange, contexto, mockToken);

            expect(acoes[0].edit).toBeDefined();
            expect(acoes[0].edit._replacements).toHaveLength(1);
        });
    });

    describe('Quick Fix de importação', () => {
        it('deve sugerir import para mensagem de tipo de dados desconhecido', async () => {
            const diagnostico = {
                message: "Tipo de dados desconhecido: 'AvaliadorSintatico'.",
                range: { start: { line: 7, character: 0 }, end: { line: 7, character: 68 } }
            };

            obterResultado.mockReturnValue({
                analisadorSemantico: { diagnosticos: [{ mensagem: diagnostico.message }] },
                declaracoesPreCarregadas: [
                    {
                        simbolo: { lexema: 'AvaliadorSintatico' },
                        caminhoArquivoDefinicao: '/projeto/fontes/avaliador-sintatico/avaliador-sintatico.delegua'
                    }
                ],
                avaliadorSintatico: { erros: [], declaracoes: [] }
            });

            mockDocumento = {
                uri: {
                    toString: () => 'file:///projeto/fontes/execucao.delegua',
                    fsPath: '/projeto/fontes/execucao.delegua'
                },
                lineAt: jest.fn((linha: number) => {
                    if (linha === 7) return { text: 'classe Execucao { tipo: AvaliadorSintatico }' };
                    return { text: '' };
                }),
                lineCount: 9,
                getText: jest.fn().mockReturnValue('classe Execucao {\n  tipo: AvaliadorSintatico\n}')
            };

            const acoes = await provedor.provideCodeActions(mockDocumento, mockRange, criarContexto([diagnostico]), mockToken);
            const acaoImportacao = (acoes || []).find((a: any) => a.title.includes("Adicionar importação de 'AvaliadorSintatico'"));

            expect(acaoImportacao).toBeDefined();
            expect(acaoImportacao.edit._insertions[0].newText)
                .toContain('importar { AvaliadorSintatico } de "./avaliador-sintatico/avaliador-sintatico.delegua"');
        });

        it('deve sugerir import quando encontrar símbolo ausente em definição pré-carregada', async () => {
            const diagnostico = {
                message: "Variável 'AvaliadorSintatico' não declarada",
                range: { start: { line: 2, character: 0 }, end: { line: 2, character: 30 } }
            };

            obterResultado.mockReturnValue({
                analisadorSemantico: { diagnosticos: [{ mensagem: diagnostico.message }] },
                declaracoesPreCarregadas: [
                    {
                        simbolo: { lexema: 'AvaliadorSintatico' },
                        caminhoArquivoDefinicao: '/projeto/fontes/avaliador-sintatico/avaliador-sintatico.delegua'
                    }
                ],
                avaliadorSintatico: { erros: [], declaracoes: [] }
            });

            mockDocumento = {
                uri: {
                    toString: () => 'file:///projeto/fontes/execucao.delegua',
                    fsPath: '/projeto/fontes/execucao.delegua'
                },
                lineAt: jest.fn((linha: number) => {
                    if (linha === 0) return { text: 'funcao principal() {' };
                    if (linha === 2) return { text: 'var avaliador = AvaliadorSintatico()' };
                    return { text: '' };
                }),
                lineCount: 3,
                getText: jest.fn().mockReturnValue('funcao principal() {\n\nvar avaliador = AvaliadorSintatico()\n}')
            };

            const acoes = await provedor.provideCodeActions(mockDocumento, mockRange, criarContexto([diagnostico]), mockToken);

            const acaoImportacao = (acoes || []).find((a: any) => a.title.includes("Adicionar importação de 'AvaliadorSintatico'"));
            expect(acaoImportacao).toBeDefined();
            expect(acaoImportacao.edit._insertions).toHaveLength(1);
            expect(acaoImportacao.edit._insertions[0].newText)
                .toContain('importar { AvaliadorSintatico } de "./avaliador-sintatico/avaliador-sintatico.delegua"');
        });

        it('não deve sugerir import duplicado quando já existe linha equivalente', async () => {
            const diagnostico = {
                message: "Variável 'AvaliadorSintatico' não declarada",
                range: { start: { line: 3, character: 0 }, end: { line: 3, character: 25 } }
            };

            obterResultado.mockReturnValue({
                analisadorSemantico: { diagnosticos: [{ mensagem: diagnostico.message }] },
                declaracoesPreCarregadas: [
                    {
                        simbolo: { lexema: 'AvaliadorSintatico' },
                        caminhoArquivoDefinicao: '/projeto/fontes/avaliador-sintatico/avaliador-sintatico.delegua'
                    }
                ],
                avaliadorSintatico: { erros: [], declaracoes: [] }
            });

            const textoDocumento = [
                'importar { AvaliadorSintatico } de "./avaliador-sintatico/avaliador-sintatico.delegua"',
                '',
                'funcao principal() {',
                '  var avaliador = AvaliadorSintatico()',
                '}'
            ].join('\n');

            mockDocumento = {
                uri: {
                    toString: () => 'file:///projeto/fontes/execucao.delegua',
                    fsPath: '/projeto/fontes/execucao.delegua'
                },
                lineAt: jest.fn((linha: number) => ({ text: textoDocumento.split('\n')[linha] || '' })),
                lineCount: 5,
                getText: jest.fn().mockReturnValue(textoDocumento)
            };

            const acoes = await provedor.provideCodeActions(mockDocumento, mockRange, criarContexto([diagnostico]), mockToken);
            const titulos = (acoes || []).map((a: any) => a.title);
            expect(titulos).not.toContain("Adicionar importação de 'AvaliadorSintatico'");
        });

        it('deve sugerir import via workspace.findFiles quando não há declarações pré-carregadas', async () => {
            // Simula findFiles encontrando o arquivo real no workspace.
            (vscode as any).workspace.findFiles.mockResolvedValue([
                { path: '/projeto/fontes/avaliador-sintatico/avaliador-sintatico.delegua' }
            ]);

            obterResultado.mockReturnValue({
                analisadorSemantico: { diagnosticos: [{ mensagem: "Variável 'AvaliadorSintatico' não declarada" }] },
                declaracoesPreCarregadas: [],
                avaliadorSintatico: { erros: [], declaracoes: [] }
            });

            const documentoLocal = {
                uri: {
                    toString: () => 'file:///projeto/fontes/execucao.delegua',
                    path: '/projeto/fontes/execucao.delegua'
                },
                lineAt: jest.fn((linha: number) => {
                    if (linha === 1) return { text: 'AvaliadorSintatico()' };
                    return { text: '' };
                }),
                lineCount: 2,
                getText: jest.fn().mockReturnValue('funcao principal() {\nAvaliadorSintatico()\n}')
            };

            const diagnostico = {
                message: "Variável 'AvaliadorSintatico' não declarada",
                range: { start: { line: 1, character: 0 }, end: { line: 1, character: 20 } }
            };

            const acoes = await provedor.provideCodeActions(documentoLocal, mockRange, criarContexto([diagnostico]), mockToken);
            const acaoImportacao = (acoes || []).find((a: any) => a.title.includes("Adicionar importação de 'AvaliadorSintatico'"));

            expect(acaoImportacao).toBeDefined();
            expect((vscode as any).workspace.findFiles).toHaveBeenCalledWith(
                '**/avaliador-sintatico.delegua',
                '**/node_modules/**',
                10
            );
            expect(acaoImportacao.edit._insertions[0].newText)
                .toContain('importar { AvaliadorSintatico } de "./avaliador-sintatico/avaliador-sintatico.delegua"');
        });
    });
});
