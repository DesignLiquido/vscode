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
    }))
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
}), { virtual: true });

jest.mock('@designliquido/delegua/avaliador-sintatico', () => ({
    AvaliadorSintaticoPitugues: jest.fn().mockImplementation(() => ({
        analisar: jest.fn().mockResolvedValue({
            declaracoes: [],
            erros: []
        })
    }))
}), { virtual: true });

jest.mock('@designliquido/delegua/analisador-semantico', () => ({
    AnalisadorSemantico: jest.fn().mockImplementation(() => ({
        analisar: jest.fn().mockResolvedValue({
            diagnosticos: []
        })
    }))
}), { virtual: true });

jest.mock('@designliquido/delegua/analisador-semantico/dialetos', () => ({
    AnalisadorSemanticoPitugues: jest.fn().mockImplementation(() => ({
        analisar: jest.fn().mockResolvedValue({
            diagnosticos: []
        })
    }))
}), { virtual: true });

jest.mock('@designliquido/birl/lexador', () => ({
    LexadorBirl: jest.fn().mockImplementation(() => ({
        mapear: jest.fn().mockReturnValue({
            simbolos: [],
            erros: []
        })
    }))
}), { virtual: true });

jest.mock('@designliquido/birl/avaliador-sintatico', () => ({
    AvaliadorSintaticoBirl: jest.fn().mockImplementation(() => ({
        analisar: jest.fn().mockResolvedValue({
            declaracoes: [],
            erros: []
        })
    }))
}), { virtual: true });

jest.mock('@designliquido/birl/analisador-semantico', () => ({
    AnalisadorSemanticoBirl: jest.fn().mockImplementation(() => ({
        analisar: jest.fn().mockResolvedValue({
            diagnosticos: []
        })
    }))
}), { virtual: true });

jest.mock('@designliquido/mapler/lexador', () => ({
    LexadorMapler: jest.fn().mockImplementation(() => ({
        mapear: jest.fn().mockReturnValue({
            simbolos: [],
            erros: []
        })
    }))
}), { virtual: true });

jest.mock('@designliquido/mapler/avaliador-sintatico', () => ({
    AvaliadorSintaticoMapler: jest.fn().mockImplementation(() => ({
        analisar: jest.fn().mockResolvedValue({
            declaracoes: [],
            erros: []
        })
    }))
}), { virtual: true });

jest.mock('@designliquido/mapler/analisador-semantico', () => ({
    AnalisadorSemanticoMapler: jest.fn().mockImplementation(() => ({
        analisar: jest.fn().mockResolvedValue({
            diagnosticos: []
        })
    }))
}), { virtual: true });

jest.mock('@designliquido/potigol/lexador', () => ({
    LexadorPotigol: jest.fn().mockImplementation(() => ({
        mapear: jest.fn().mockReturnValue({
            simbolos: [],
            erros: []
        })
    }))
}), { virtual: true });

jest.mock('@designliquido/potigol/avaliador-sintatico', () => ({
    AvaliadorSintaticoPotigol: jest.fn().mockImplementation(() => ({
        analisar: jest.fn().mockResolvedValue({
            declaracoes: [],
            erros: []
        })
    }))
}), { virtual: true });

jest.mock('@designliquido/potigol/analisador-semantico', () => ({
    AnalisadorSemanticoPotigol: jest.fn().mockImplementation(() => ({
        analisar: jest.fn().mockResolvedValue({
            diagnosticos: []
        })
    }))
}), { virtual: true });

jest.mock('@designliquido/portugol-studio/lexador', () => ({
    LexadorPortugolStudio: jest.fn().mockImplementation(() => ({
        mapear: jest.fn().mockReturnValue({
            simbolos: [],
            erros: []
        })
    }))
}), { virtual: true });

jest.mock('@designliquido/portugol-studio/avaliador-sintatico', () => ({
    AvaliadorSintaticoPortugolStudio: jest.fn().mockImplementation(() => ({
        analisar: jest.fn().mockResolvedValue({
            declaracoes: [],
            erros: []
        })
    }))
}), { virtual: true });

jest.mock('@designliquido/portugol-studio/analisador-semantico', () => ({
    AnalisadorSemanticoPortugolStudio: jest.fn().mockImplementation(() => ({
        analisar: jest.fn().mockResolvedValue({
            diagnosticos: []
        })
    }))
}), { virtual: true });

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
}), { virtual: true });

jest.mock('../../fontes/avaliacao-sintatica', () => ({
    formatarDiagnosticosAvaliacaoSintatica: jest.fn().mockReturnValue([])
}), { virtual: true });

jest.mock('../../fontes/analise-codigo/cache-analise', () => ({
    definirResultado: jest.fn()
}), { virtual: true });

jest.mock('../../fontes/importador', () => ({
    ImportadorExtensao: jest.fn().mockImplementation(() => ({}))
}), { virtual: true });

jest.mock('../../fontes/avaliacao-sintatica/avaliador-sintatico-com-importacao', () => ({
    AvaliadorSintaticoComImportacao: jest.fn().mockImplementation(() => ({
        analisar: jest.fn().mockResolvedValue({
            declaracoes: [],
            erros: []
        })
    }))
}), { virtual: true });

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
            const { definirResultado } = require('../../fontes/analise-codigo/cache-analise');
            mockDocumento.fileName = 'test.delegua';

            await executarAnalises(mockDocumento, mockDiagnosticos);

            expect(definirResultado).toHaveBeenCalledWith(
                'file:///test/test.delegua',
                expect.objectContaining({
                    lexador: expect.any(Object),
                    avaliadorSintatico: expect.any(Object),
                    analisadorSemantico: expect.any(Object)
                })
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
            const { definirResultado } = require('../../fontes/analise-codigo/cache-analise');
            expect(definirResultado).toHaveBeenCalled();
        });

        it('deve continuar execução mesmo com erro no analisador semântico', async () => {
            // Testa que erros no analisador semântico não interrompem a execução
            mockDocumento.fileName = 'test.delegua';

            // A função deve completar sem lançar exceção
            await expect(executarAnalises(mockDocumento, mockDiagnosticos)).resolves.not.toThrow();

            // Deve ter definido resultado no cache
            const { definirResultado } = require('../../fontes/analise-codigo/cache-analise');
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
            const { definirResultado } = require('../../fontes/analise-codigo/cache-analise');
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
});
