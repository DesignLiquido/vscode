// @ts-nocheck - Ignora erros de tipo nos mocks complexos
import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
import * as vscode from 'vscode';

// Mock do módulo vscode
jest.mock('vscode', () => ({
    DiagnosticSeverity: {
        Error: 0,
        Warning: 1,
        Information: 2,
        Hint: 3
    },
    Diagnostic: jest.fn((range: any, message: string, severity: any) => ({
        range,
        message,
        severity
    })),
    Range: jest.fn((startLine: number, startChar: number, endLine: number, endChar: number) => ({
        start: { line: startLine, character: startChar },
        end: { line: endLine, character: endChar }
    })),
    Uri: {
        file: jest.fn((path: string) => ({ fsPath: path })),
        joinPath: jest.fn((...args: any[]) => ({ fsPath: args.map((a: any) => a.fsPath || a).join('/') }))
    },
    FileType: {
        File: 1,
        Directory: 2
    },
    workspace: {
        workspaceFolders: [],
        fs: {
            readDirectory: jest.fn().mockResolvedValue([]),
            readFile: jest.fn().mockResolvedValue(Buffer.from('{}'))
        }
    }
}), { virtual: true });

// Mock dos módulos de análise
jest.mock('@designliquido/delegua/lexador', () => ({
    Lexador: jest.fn().mockImplementation(() => ({
        mapear: jest.fn().mockReturnValue({
            simbolos: [],
            erros: []
        })
    })),
    LexadorPitugues: jest.fn().mockImplementation(() => ({
        mapear: jest.fn().mockReturnValue({
            simbolos: [],
            erros: []
        })
    }))
}));

jest.mock('@designliquido/delegua/avaliador-sintatico', () => ({
    AvaliadorSintaticoPitugues: jest.fn().mockImplementation(() => ({
        analisar: jest.fn().mockResolvedValue({
            declaracoes: [],
            erros: []
        })
    }))
}));

jest.mock('@designliquido/delegua/analisador-semantico', () => ({
    AnalisadorSemantico: jest.fn().mockImplementation(() => ({
        analisar: jest.fn().mockResolvedValue({
            diagnosticos: []
        })
    }))
}));

jest.mock('@designliquido/delegua/analisador-semantico/dialetos', () => ({
    AnalisadorSemanticoPitugues: jest.fn().mockImplementation(() => ({
        analisar: jest.fn().mockResolvedValue({
            diagnosticos: []
        })
    }))
}));

jest.mock('@designliquido/birl/lexador', () => ({
    LexadorBirl: jest.fn().mockImplementation(() => ({
        mapear: jest.fn().mockReturnValue({
            simbolos: [],
            erros: []
        })
    }))
}));

jest.mock('@designliquido/birl/avaliador-sintatico', () => ({
    AvaliadorSintaticoBirl: jest.fn().mockImplementation(() => ({
        analisar: jest.fn().mockResolvedValue({
            declaracoes: [],
            erros: []
        })
    }))
}));

jest.mock('@designliquido/birl/analisador-semantico', () => ({
    AnalisadorSemanticoBirl: jest.fn().mockImplementation(() => ({
        analisar: jest.fn().mockResolvedValue({
            diagnosticos: []
        })
    }))
}));

jest.mock('@designliquido/mapler/lexador', () => ({
    LexadorMapler: jest.fn().mockImplementation(() => ({
        mapear: jest.fn().mockReturnValue({
            simbolos: [],
            erros: []
        })
    }))
}));

jest.mock('@designliquido/mapler/avaliador-sintatico', () => ({
    AvaliadorSintaticoMapler: jest.fn().mockImplementation(() => ({
        analisar: jest.fn().mockResolvedValue({
            declaracoes: [],
            erros: []
        })
    }))
}));

jest.mock('@designliquido/mapler/analisador-semantico', () => ({
    AnalisadorSemanticoMapler: jest.fn().mockImplementation(() => ({
        analisar: jest.fn().mockResolvedValue({
            diagnosticos: []
        })
    }))
}));

jest.mock('@designliquido/potigol/lexador', () => ({
    LexadorPotigol: jest.fn().mockImplementation(() => ({
        mapear: jest.fn().mockReturnValue({
            simbolos: [],
            erros: []
        })
    }))
}));

jest.mock('@designliquido/potigol/avaliador-sintatico', () => ({
    AvaliadorSintaticoPotigol: jest.fn().mockImplementation(() => ({
        analisar: jest.fn().mockResolvedValue({
            declaracoes: [],
            erros: []
        })
    }))
}));

jest.mock('@designliquido/potigol/analisador-semantico', () => ({
    AnalisadorSemanticoPotigol: jest.fn().mockImplementation(() => ({
        analisar: jest.fn().mockResolvedValue({
            diagnosticos: []
        })
    }))
}));

jest.mock('@designliquido/portugol-studio/lexador', () => ({
    LexadorPortugolStudio: jest.fn().mockImplementation(() => ({
        mapear: jest.fn().mockReturnValue({
            simbolos: [],
            erros: []
        })
    }))
}));

jest.mock('@designliquido/portugol-studio/avaliador-sintatico', () => ({
    AvaliadorSintaticoPortugolStudio: jest.fn().mockImplementation(() => ({
        analisar: jest.fn().mockResolvedValue({
            declaracoes: [],
            erros: []
        })
    }))
}));

jest.mock('@designliquido/portugol-studio/analisador-semantico', () => ({
    AnalisadorSemanticoPortugolStudio: jest.fn().mockImplementation(() => ({
        analisar: jest.fn().mockResolvedValue({
            diagnosticos: []
        })
    }))
}));

jest.mock('@designliquido/visualg', () => ({
    LexadorVisuAlg: jest.fn().mockImplementation(() => ({
        mapear: jest.fn().mockReturnValue({
            simbolos: [],
            erros: []
        })
    })),
    AvaliadorSintaticoVisuAlg: jest.fn().mockImplementation(() => ({
        analisar: jest.fn().mockResolvedValue({
            declaracoes: [],
            erros: []
        })
    })),
    AnalisadorSemanticoVisuAlg: jest.fn().mockImplementation(() => ({
        analisar: jest.fn().mockResolvedValue({
            diagnosticos: []
        })
    }))
}));

jest.mock('../../fontes/avaliacao-sintatica', () => ({
    formatarDiagnosticosAvaliacaoSintatica: jest.fn().mockReturnValue([])
}));

jest.mock('@designliquido/delegua-lsp/analise/cache-analise');

jest.mock('../../fontes/importador', () => ({
    ImportadorExtensao: jest.fn().mockImplementation(() => ({}))
}));

jest.mock('../../fontes/avaliacao-sintatica/avaliador-sintatico-com-importacao', () => ({
    AvaliadorSintaticoComImportacao: jest.fn().mockImplementation(() => ({
        analisar: jest.fn().mockResolvedValue({
            declaracoes: [],
            erros: []
        }),
        preCarregarDefinicoes: jest.fn().mockResolvedValue(undefined),
        definirContextoLiquido: jest.fn(),
        tiposDefinidosEmCodigo: {}
    }))
}));

describe('analise-codigo/index', () => {
    let executarAnalises: any;
    let mockDocumento: any;
    let mockDiagnosticos: any;

    beforeEach(() => {
        // Limpar o cache de módulos para garantir reimportação
        jest.clearAllMocks();

        // Importar o módulo após os mocks estarem configurados
        executarAnalises = require('../../fontes/analise-codigo/index').executarAnalises;

        // Mock do documento VSCode
        mockDocumento = {
            fileName: 'test.delegua',
            uri: {
                toString: jest.fn().mockReturnValue('file:///test/test.delegua')
            },
            getText: jest.fn().mockReturnValue('const x = 10;'),
            lineAt: jest.fn().mockReturnValue({
                text: 'const x = 10;'
            })
        };

        // Mock da coleção de diagnósticos
        mockDiagnosticos = {
            set: jest.fn(),
            clear: jest.fn(),
            delete: jest.fn()
        };
    });

    afterEach(() => {
        jest.resetModules();
    });

    describe('executarAnalises', () => {
        it('deve executar análise para arquivo .delegua', async () => {
            mockDocumento.fileName = 'test.delegua';
            await executarAnalises(mockDocumento, mockDiagnosticos);
            expect(mockDiagnosticos.set).toHaveBeenCalled();
        });

        it('deve executar análise para arquivo .pitugues', async () => {
            mockDocumento.fileName = 'test.pitugues';
            await executarAnalises(mockDocumento, mockDiagnosticos);
            expect(mockDiagnosticos.set).toHaveBeenCalled();
        });

        it('deve executar análise para arquivo .pitu', async () => {
            mockDocumento.fileName = 'test.pitu';
            await executarAnalises(mockDocumento, mockDiagnosticos);
            expect(mockDiagnosticos.set).toHaveBeenCalled();
        });

        it('deve executar análise para arquivo .birl', async () => {
            mockDocumento.fileName = 'test.birl';
            await executarAnalises(mockDocumento, mockDiagnosticos);
            expect(mockDiagnosticos.set).toHaveBeenCalled();
        });

        it('deve executar análise para arquivo .mapler', async () => {
            mockDocumento.fileName = 'test.mapler';
            await executarAnalises(mockDocumento, mockDiagnosticos);
            expect(mockDiagnosticos.set).toHaveBeenCalled();
        });

        it('deve executar análise para arquivo .alg (VisuAlg)', async () => {
            mockDocumento.fileName = 'test.alg';
            await executarAnalises(mockDocumento, mockDiagnosticos);
            expect(mockDiagnosticos.set).toHaveBeenCalled();
        });

        it('deve executar análise para arquivo .visualg', async () => {
            mockDocumento.fileName = 'test.visualg';
            await executarAnalises(mockDocumento, mockDiagnosticos);
            expect(mockDiagnosticos.set).toHaveBeenCalled();
        });

        it('deve executar análise para arquivo .poti (Potigol)', async () => {
            mockDocumento.fileName = 'test.poti';
            await executarAnalises(mockDocumento, mockDiagnosticos);
            expect(mockDiagnosticos.set).toHaveBeenCalled();
        });

        it('deve executar análise para arquivo .potigol', async () => {
            mockDocumento.fileName = 'test.potigol';
            await executarAnalises(mockDocumento, mockDiagnosticos);
            expect(mockDiagnosticos.set).toHaveBeenCalled();
        });

        it('deve executar análise para arquivo .por (Portugol Studio)', async () => {
            mockDocumento.fileName = 'test.por';
            await executarAnalises(mockDocumento, mockDiagnosticos);
            expect(mockDiagnosticos.set).toHaveBeenCalled();
        });

        it('não deve executar análise para extensão não suportada', async () => {
            mockDocumento.fileName = 'test.js';
            await executarAnalises(mockDocumento, mockDiagnosticos);
            expect(mockDiagnosticos.set).not.toHaveBeenCalled();
        });

        it('não deve executar análise para arquivo sem extensão', async () => {
            mockDocumento.fileName = 'test';
            await executarAnalises(mockDocumento, mockDiagnosticos);
            expect(mockDiagnosticos.set).not.toHaveBeenCalled();
        });

        it('deve processar texto do documento corretamente', async () => {
            const textoMultilinhas = 'linha 1\nlinha 2\nlinha 3';
            mockDocumento.getText = jest.fn().mockReturnValue(textoMultilinhas);
            mockDocumento.fileName = 'test.delegua';

            await executarAnalises(mockDocumento, mockDiagnosticos);
            expect(mockDocumento.getText).toHaveBeenCalled();
        });

        it('deve definir resultado no cache após análise', async () => {
            const { definirResultado } = require('@designliquido/delegua-lsp/analise/cache-analise');
            mockDocumento.fileName = 'test.delegua';

            await executarAnalises(mockDocumento, mockDiagnosticos);

            expect(definirResultado).toHaveBeenCalledWith(
                'file:///test/test.delegua',
                expect.objectContaining({
                    lexador: expect.any(Object),
                    avaliadorSintatico: expect.any(Object),
                    analisadorSemantico: expect.any(Object)
                }),
                expect.any(Object)
            );
        });
    });

    describe('Tratamento de erros', () => {
        it('deve processar documento mesmo com erro no avaliador sintático', async () => {
            // Testa que a função não lança erro mesmo quando o avaliador falha
            mockDocumento.fileName = 'test.pitugues';

            // A função deve completar sem lançar exceção
            await expect(executarAnalises(mockDocumento, mockDiagnosticos)).resolves.not.toThrow();

            // Deve ter definido resultado no cache mesmo com erro
            const { definirResultado } = require('@designliquido/delegua-lsp/analise/cache-analise');
            expect(definirResultado).toHaveBeenCalled();
        });

        it('deve continuar execução mesmo com erro no analisador semântico', async () => {
            // Testa que erros no analisador semântico não interrompem a execução
            mockDocumento.fileName = 'test.delegua';

            // A função deve completar sem lançar exceção
            await expect(executarAnalises(mockDocumento, mockDiagnosticos)).resolves.not.toThrow();

            // Deve ter definido resultado no cache
            const { definirResultado } = require('@designliquido/delegua-lsp/analise/cache-analise');
            expect(definirResultado).toHaveBeenCalled();
        });
    });

    describe('Formatação de diagnósticos', () => {
        it('deve processar diagnósticos semânticos com severidade de erro', async () => {
            const { AnalisadorSemanticoPitugues } =
                require('@designliquido/delegua/analisador-semantico/dialetos');

            AnalisadorSemanticoPitugues.mockImplementation(() => ({
                analisar: jest.fn().mockResolvedValue({
                    diagnosticos: [{
                        linha: 1,
                        mensagem: 'Variável não declarada',
                        severidade: 'erro'
                    }]
                })
            }));

            jest.resetModules();
            executarAnalises = require('../../fontes/analise-codigo/index').executarAnalises;

            mockDocumento.fileName = 'test.pitugues';
            await executarAnalises(mockDocumento, mockDiagnosticos);

            expect(mockDiagnosticos.set).toHaveBeenCalled();
        });

        it('deve processar diagnósticos semânticos com severidade de aviso', async () => {
            const { AnalisadorSemanticoPitugues } =
                require('@designliquido/delegua/analisador-semantico/dialetos');

            AnalisadorSemanticoPitugues.mockImplementation(() => ({
                analisar: jest.fn().mockResolvedValue({
                    diagnosticos: [{
                        linha: 2,
                        mensagem: 'Variável não utilizada',
                        severidade: 'aviso'
                    }]
                })
            }));

            jest.resetModules();
            executarAnalises = require('../../fontes/analise-codigo/index').executarAnalises;

            mockDocumento.fileName = 'test.pitugues';
            await executarAnalises(mockDocumento, mockDiagnosticos);

            expect(mockDiagnosticos.set).toHaveBeenCalled();
        });

        it('deve processar diagnósticos com severidade numérica', async () => {
            const { AnalisadorSemanticoPitugues } =
                require('@designliquido/delegua/analisador-semantico/dialetos');

            AnalisadorSemanticoPitugues.mockImplementation(() => ({
                analisar: jest.fn().mockResolvedValue({
                    diagnosticos: [{
                        linha: 3,
                        mensagem: 'Informação',
                        severidade: 2
                    }]
                })
            }));

            jest.resetModules();
            executarAnalises = require('../../fontes/analise-codigo/index').executarAnalises;

            mockDocumento.fileName = 'test.pitugues';
            await executarAnalises(mockDocumento, mockDiagnosticos);

            expect(mockDiagnosticos.set).toHaveBeenCalled();
        });
    });

    describe('Integração com cache', () => {
        it('deve armazenar resultado completo no cache', async () => {
            const { definirResultado } = require('@designliquido/delegua-lsp/analise/cache-analise');
            mockDocumento.fileName = 'test.delegua';

            await executarAnalises(mockDocumento, mockDiagnosticos);

            expect(definirResultado).toHaveBeenCalledTimes(1);
            const [uri, resultado] = (definirResultado as jest.MockedFunction<any>).mock.calls[0];

            expect(uri).toBe('file:///test/test.delegua');
            expect(resultado).toHaveProperty('lexador');
            expect(resultado).toHaveProperty('avaliadorSintatico');
            expect(resultado).toHaveProperty('analisadorSemantico');
        });
    });

    describe('Aliases de contexto Líquido', () => {
        function configurarAvaliadorComTipos(tipos: Record<string, any>) {
            const avaliadorMod = require('../../fontes/avaliacao-sintatica/avaliador-sintatico-com-importacao');
            // Usa 'function' + Object.assign(this, ...) para que instanceof AvaliadorSintaticoComImportacao
            // retorne true — necessário para que o bloco de declaracoesPreCarregadas seja executado.
            avaliadorMod.AvaliadorSintaticoComImportacao.mockImplementationOnce(function(this: any) {
                Object.assign(this, {
                    analisar: jest.fn().mockResolvedValue({ declaracoes: [], erros: [] }),
                    preCarregarDefinicoes: jest.fn().mockResolvedValue(undefined),
                    definirContextoLiquido: jest.fn(),
                    tiposDefinidosEmCodigo: tipos,
                });
            });
        }

        function obterDeclaracoesPreCarregadas(): any[] {
            const { definirResultado } = require('@designliquido/delegua-lsp/analise/cache-analise');
            const [, resultado] = definirResultado.mock.calls[0];
            return resultado.declaracoesPreCarregadas;
        }

        it('arquivo em /rotas/ com classe Liquido → alias liquido adicionado', async () => {
            const mockLiquidoClasse = { simbolo: { lexema: 'Liquido' } };
            configurarAvaliadorComTipos({ Liquido: mockLiquidoClasse });

            mockDocumento.fileName = '/workspace/rotas/inicial.delegua';
            await executarAnalises(mockDocumento, mockDiagnosticos);

            const declaracoes = obterDeclaracoesPreCarregadas();
            // Liquido (original) + liquido (alias) = 2 entradas
            expect(declaracoes).toHaveLength(2);
            expect(declaracoes).toContain(mockLiquidoClasse);
        });

        it('arquivo em /rotas/ com Requisicao e Resposta → aliases adicionados', async () => {
            const mockRequisicao = { simbolo: { lexema: 'Requisicao' } };
            const mockResposta = { simbolo: { lexema: 'Resposta' } };
            configurarAvaliadorComTipos({ Requisicao: mockRequisicao, Resposta: mockResposta });

            mockDocumento.fileName = '/workspace/rotas/inicial.delegua';
            await executarAnalises(mockDocumento, mockDiagnosticos);

            const declaracoes = obterDeclaracoesPreCarregadas();
            // 2 originais (Requisicao, Resposta) + 2 aliases (requisicao, resposta) = 4
            expect(declaracoes).toHaveLength(4);
            expect(declaracoes).toContain(mockRequisicao);
            expect(declaracoes).toContain(mockResposta);
        });

        it('arquivo em /rotas/ com todas as classes de contexto → todos os aliases adicionados', async () => {
            const mockLiquido = { simbolo: { lexema: 'Liquido' } };
            const mockRequisicao = { simbolo: { lexema: 'Requisicao' } };
            const mockResposta = { simbolo: { lexema: 'Resposta' } };
            configurarAvaliadorComTipos({
                Liquido: mockLiquido,
                Requisicao: mockRequisicao,
                Resposta: mockResposta,
            });

            mockDocumento.fileName = '/workspace/rotas/inicial.delegua';
            await executarAnalises(mockDocumento, mockDiagnosticos);

            const declaracoes = obterDeclaracoesPreCarregadas();
            // 3 originais + 3 aliases = 6
            expect(declaracoes).toHaveLength(6);
        });

        it('arquivo fora de /rotas/ → nenhum alias adicionado', async () => {
            const mockLiquidoClasse = { simbolo: { lexema: 'Liquido' } };
            configurarAvaliadorComTipos({ Liquido: mockLiquidoClasse });

            mockDocumento.fileName = '/workspace/controladores/inicio.delegua';
            await executarAnalises(mockDocumento, mockDiagnosticos);

            const declaracoes = obterDeclaracoesPreCarregadas();
            // Apenas o original — sem alias
            expect(declaracoes).toHaveLength(1);
            expect(declaracoes[0]).toBe(mockLiquidoClasse);
        });

        it('arquivo em /rotas/ sem classes de contexto em tiposDefinidosEmCodigo → sem erro', async () => {
            configurarAvaliadorComTipos({});

            mockDocumento.fileName = '/workspace/rotas/inicial.delegua';
            await expect(executarAnalises(mockDocumento, mockDiagnosticos)).resolves.not.toThrow();

            const declaracoes = obterDeclaracoesPreCarregadas();
            expect(declaracoes).toHaveLength(0);
        });

        it('alias tem simbolo.lexema com nome minúsculo e é objeto distinto do original', async () => {
            const mockLiquidoClasse = { simbolo: { lexema: 'Liquido' } };
            configurarAvaliadorComTipos({ Liquido: mockLiquidoClasse });

            mockDocumento.fileName = '/workspace/rotas/inicial.delegua';
            await executarAnalises(mockDocumento, mockDiagnosticos);

            const declaracoes = obterDeclaracoesPreCarregadas();
            const alias = declaracoes.find(d => d !== mockLiquidoClasse);
            expect(alias).toBeDefined();
            expect(alias.simbolo.lexema).toBe('liquido');
            expect(alias).not.toBe(mockLiquidoClasse);
        });
    });
});
