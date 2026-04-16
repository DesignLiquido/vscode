// @ts-nocheck - Ignora erros de tipo nos mocks complexos
import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import * as vscode from 'vscode';

// Mock do módulo vscode
jest.mock('vscode', () => ({
    CompletionItemKind: {
        Property: 9,
        Function: 2,
        Method: 1,
        Variable: 5,
        Interface: 7
    },
    CompletionItem: class CompletionItem {
        constructor(public label: string, public kind?: number) {}
        documentation: any;
        detail: string;
        insertText: any;
    },
    MarkdownString: class MarkdownString {
        constructor(public value: string) {}
    },
    SnippetString: class SnippetString {
        constructor(public value: string) {}
    }
}), { virtual: true });

// Mock das bibliotecas
jest.mock('../../fontes/bibliotecas', () => ({
    formatarPrimitivas: jest.fn().mockImplementation((modulo) => {
        if (!modulo) return [];
        const chaves = Object.keys(modulo);
        if (chaves.includes('chaves')) return [{ nome: 'chaves', documentacao: 'Retorna as chaves do dicionário' }];
        if (chaves.includes('absoluto')) return [{ nome: 'arredondar', documentacao: 'Arredonda um número' }];
        if (chaves.includes('aparar')) return [{ nome: 'maiuscula', documentacao: 'Converte para maiúsculas' }];
        if (chaves.includes('adicionar')) return [{ nome: 'empurrar', documentacao: 'Adiciona elemento ao vetor' }];
        return [];
    }),
    funcoesNativasDelegua: [
        { nome: 'escreva', documentacao: 'Escreve na saída' },
        { nome: 'leia', documentacao: 'Lê da entrada' }
    ]
}), { virtual: true });

// Mock das primitivas do Liquido
jest.mock('../../fontes/bibliotecas/primitivas-liquido', () => ({
    primitivasMetodosLiquido: [
        { nome: 'rotaGet', documentacao: 'Define uma rota GET' },
        { nome: 'rotaPost', documentacao: 'Define uma rota POST' }
    ],
    objetosEmRotaLiquido: [
        { nome: 'requisicao', documentacao: 'Objeto de requisição HTTP' },
        { nome: 'resposta', documentacao: 'Objeto de resposta HTTP' }
    ]
}), { virtual: true });

// Mock do cache de análise
jest.mock('../../fontes/analise-codigo/cache-analise', () => ({
    obterResultado: jest.fn().mockReturnValue(null)
}), { virtual: true });

jest.mock('../../fontes/documentacao-em-editor/etiquetas-documentarios', () => ({
    definicoesTagsDocumentario: [
        { canonica: '@param', aliases: ['@param', '@arg'], titulo: 'Parametros' },
        { canonica: '@veja', aliases: ['@veja', '@see'], titulo: 'Veja tambem' },
        { canonica: '@retorna', aliases: ['@retorna', '@returns'], titulo: 'Retorna' }
    ]
}), { virtual: true });

// Mock das declarações do Delegua
jest.mock('@designliquido/delegua/declaracoes', () => ({
    Var: class Var {
        constructor(public simbolo: any, public tipo: string) {}
    },
    Const: class Const {
        constructor(public simbolo: any, public tipo: string) {}
    },
    Classe: class Classe {
        constructor(public simbolo: any) {}
    },
    FuncaoDeclaracao: class FuncaoDeclaracao {
        constructor(public simbolo: any, public tipo: string) {}
    }
}), { virtual: true });

describe('completude/DeleguaProvedorCompletude', () => {
    let DeleguaProvedorCompletude: any;
    let provedor: any;
    let mockDocument: any;
    let mockPosition: any;
    let mockToken: any;
    let mockContext: any;
    let obterResultado: any;

    beforeEach(() => {
        jest.clearAllMocks();

        const module = require('../../fontes/completude/delegua-provedor-completude');
        DeleguaProvedorCompletude = module.DeleguaProvedorCompletude;
        provedor = new DeleguaProvedorCompletude();

        const cacheModule = require('../../fontes/analise-codigo/cache-analise');
        obterResultado = cacheModule.obterResultado;

        mockDocument = {
            uri: { toString: () => 'file:///test.delegua' },
            lineAt: jest.fn().mockReturnValue({ text: '' })
        };

        mockPosition = {
            line: 5,
            character: 10
        };

        mockToken = {};
        mockContext = {};
    });

    describe('Construtor', () => {
        it('deve criar instância do provedor', () => {
            expect(provedor).toBeDefined();
            expect(typeof provedor.provideCompletionItems).toBe('function');
        });

        it('deve ter tiposParametrosLiquido definido', () => {
            expect(provedor.tiposParametrosLiquido).toBeDefined();
            expect(Array.isArray(provedor.tiposParametrosLiquido)).toBe(true);
        });

        it('deve incluir tipo "requisicao" nos parâmetros Liquido', () => {
            const tipoRequisicao = provedor.tiposParametrosLiquido.find(
                (t: any) => t.nome === 'requisicao'
            );
            expect(tipoRequisicao).toBeDefined();
            expect(tipoRequisicao.propriedades).toBeDefined();
        });

        it('deve incluir tipo "resposta" nos parâmetros Liquido', () => {
            const tipoResposta = provedor.tiposParametrosLiquido.find(
                (t: any) => t.nome === 'resposta'
            );
            expect(tipoResposta).toBeDefined();
            expect(tipoResposta.metodos).toBeDefined();
        });
    });

    describe('provideCompletionItems', () => {
        it('deve retornar sugestões básicas para linha vazia', () => {
            mockDocument.lineAt.mockReturnValue({ text: '' });
            obterResultado.mockReturnValue({ avaliadorSintatico: { declaracoes: [] } });

            const items = provedor.provideCompletionItems(
                mockDocument,
                mockPosition,
                mockToken,
                mockContext
            );

            expect(Array.isArray(items)).toBe(true);
            expect(items.length).toBeGreaterThan(0);
        });

        it('deve sugerir etiquetas de documentário após @ dentro de /** */', () => {
            mockDocument.lineAt = jest.fn((linhaOuPosicao: number | { line: number }) => {
                const linhas = ['/**', ' * @', ' */'];
                const linha = typeof linhaOuPosicao === 'number' ? linhaOuPosicao : linhaOuPosicao.line;
                return { text: linhas[linha] };
            });
            mockDocument.lineCount = 3;
            mockPosition.line = 1;
            mockPosition.character = 4;
            obterResultado.mockReturnValue({ avaliadorSintatico: { declaracoes: [] } });

            const items = provedor.provideCompletionItems(
                mockDocument,
                mockPosition,
                mockToken,
                mockContext
            );

            expect(Array.isArray(items)).toBe(true);
            expect(items.some((item: any) => item.label === '@param')).toBe(true);
            expect(items.some((item: any) => item.label === '@veja')).toBe(true);

            const itemParam = items.find((item: any) => item.label === '@param');
            expect(itemParam.insertText.value).toBe('param $0');
        });

        it('deve filtrar etiquetas de documentário pelo prefixo digitado', () => {
            mockDocument.lineAt = jest.fn((linhaOuPosicao: number | { line: number }) => {
                const linhas = ['/**', ' * @v', ' */'];
                const linha = typeof linhaOuPosicao === 'number' ? linhaOuPosicao : linhaOuPosicao.line;
                return { text: linhas[linha] };
            });
            mockDocument.lineCount = 3;
            mockPosition.line = 1;
            mockPosition.character = 5;
            obterResultado.mockReturnValue({ avaliadorSintatico: { declaracoes: [] } });

            const items = provedor.provideCompletionItems(
                mockDocument,
                mockPosition,
                mockToken,
                mockContext
            );

            expect(items).toHaveLength(1);
            expect(items[0].label).toBe('@veja');
            expect(items[0].insertText.value).toBe('eja $0');
        });

        it('deve retornar sugestões de métodos Liquido após "liquido."', () => {
            mockDocument.lineAt.mockReturnValue({ text: 'liquido.' });
            mockPosition.character = 8;
            obterResultado.mockReturnValue({ avaliadorSintatico: { declaracoes: [] } });

            const items = provedor.provideCompletionItems(
                mockDocument,
                mockPosition,
                mockToken,
                mockContext
            );

            expect(Array.isArray(items)).toBe(true);
            expect(items.length).toBeGreaterThan(0);
            // Deve incluir métodos como rotaGet, rotaPost
            const hasRotaMethod = items.some((item: any) =>
                item.label === 'rotaGet' || item.label === 'rotaPost'
            );
            expect(hasRotaMethod).toBe(true);
        });

        it('deve incluir variáveis declaradas nas sugestões', () => {
            const { Var } = require('@designliquido/delegua/declaracoes');

            mockDocument.lineAt.mockReturnValue({ text: 'x' });
            obterResultado.mockReturnValue({
                avaliadorSintatico: {
                    declaracoes: [
                        new Var({ lexema: 'minhaVar' }, 'número')
                    ]
                }
            });

            const items = provedor.provideCompletionItems(
                mockDocument,
                mockPosition,
                mockToken,
                mockContext
            );

            const varItem = items.find((item: any) => item.label === 'minhaVar');
            expect(varItem).toBeDefined();
            expect(varItem.kind).toBe(vscode.CompletionItemKind.Variable);
        });

        it('deve incluir constantes declaradas nas sugestões', () => {
            const { Const } = require('@designliquido/delegua/declaracoes');

            mockDocument.lineAt.mockReturnValue({ text: 'x' });
            obterResultado.mockReturnValue({
                avaliadorSintatico: {
                    declaracoes: [
                        new Const({ lexema: 'MINHA_CONST' }, 'texto')
                    ]
                }
            });

            const items = provedor.provideCompletionItems(
                mockDocument,
                mockPosition,
                mockToken,
                mockContext
            );

            const constItem = items.find((item: any) => item.label === 'MINHA_CONST');
            expect(constItem).toBeDefined();
        });

        it('deve retornar primitivas de número para variável tipo número', () => {
            const { Var } = require('@designliquido/delegua/declaracoes');

            mockDocument.lineAt.mockReturnValue({ text: 'x.' });
            mockPosition.character = 2;
            obterResultado.mockReturnValue({
                avaliadorSintatico: {
                    declaracoes: [
                        new Var({ lexema: 'x' }, 'número')
                    ]
                }
            });

            const items = provedor.provideCompletionItems(
                mockDocument,
                mockPosition,
                mockToken,
                mockContext
            );

            expect(Array.isArray(items)).toBe(true);
            expect(items.length).toBeGreaterThan(0);
            // Deve ter primitivas de número
            const hasNumPrimitive = items.some((item: any) => item.label === 'arredondar');
            expect(hasNumPrimitive).toBe(true);
        });

        it('deve retornar primitivas de texto para variável tipo texto', () => {
            const { Var } = require('@designliquido/delegua/declaracoes');

            mockDocument.lineAt.mockReturnValue({ text: 'str.' });
            mockPosition.character = 4;
            obterResultado.mockReturnValue({
                avaliadorSintatico: {
                    declaracoes: [
                        new Var({ lexema: 'str' }, 'texto')
                    ]
                }
            });

            const items = provedor.provideCompletionItems(
                mockDocument,
                mockPosition,
                mockToken,
                mockContext
            );

            const hasTextPrimitive = items.some((item: any) => item.label === 'maiuscula');
            expect(hasTextPrimitive).toBe(true);
        });

        it('deve retornar primitivas de vetor para variável tipo vetor', () => {
            const { Var } = require('@designliquido/delegua/declaracoes');

            mockDocument.lineAt.mockReturnValue({ text: 'arr.' });
            mockPosition.character = 4;
            obterResultado.mockReturnValue({
                avaliadorSintatico: {
                    declaracoes: [
                        new Var({ lexema: 'arr' }, 'vetor')
                    ]
                }
            });

            const items = provedor.provideCompletionItems(
                mockDocument,
                mockPosition,
                mockToken,
                mockContext
            );

            const hasVectorPrimitive = items.some((item: any) => item.label === 'empurrar');
            expect(hasVectorPrimitive).toBe(true);
        });

        it('deve retornar primitivas de dicionário para variável tipo dicionário', () => {
            const { Var } = require('@designliquido/delegua/declaracoes');

            mockDocument.lineAt.mockReturnValue({ text: 'dict.' });
            mockPosition.character = 5;
            obterResultado.mockReturnValue({
                avaliadorSintatico: {
                    declaracoes: [
                        new Var({ lexema: 'dict' }, 'dicionário')
                    ]
                }
            });

            const items = provedor.provideCompletionItems(
                mockDocument,
                mockPosition,
                mockToken,
                mockContext
            );

            const hasDictPrimitive = items.some((item: any) => item.label === 'chaves');
            expect(hasDictPrimitive).toBe(true);
        });
    });

    describe('analisarCadeiaChamadasEmCodigo', () => {
        it('deve analisar chamada simples com ponto', () => {
            const caminho = provedor.analisarCadeiaChamadasEmCodigo('objeto.');
            expect(caminho).toEqual(['objeto']);
        });

        it('deve analisar chamada encadeada', () => {
            const caminho = provedor.analisarCadeiaChamadasEmCodigo('objeto.propriedade.');
            expect(caminho).toEqual(['objeto', 'propriedade']);
        });

        it('deve analisar chamada com método', () => {
            const caminho = provedor.analisarCadeiaChamadasEmCodigo('objeto.metodo().');
            expect(caminho.length).toBeGreaterThan(0);
            expect(caminho[0]).toBe('objeto');
        });

        it('deve retornar array vazio para texto sem ponto', () => {
            const caminho = provedor.analisarCadeiaChamadasEmCodigo('objeto');
            expect(caminho).toEqual([]);
        });

        it('deve analisar cadeia complexa', () => {
            const caminho = provedor.analisarCadeiaChamadasEmCodigo('resposta.status(200).json().');
            expect(caminho.length).toBeGreaterThan(0);
        });
    });

    describe('obterPalavraAntesPonto', () => {
        it('deve extrair palavra antes do ponto', () => {
            const palavra = provedor.obterPalavraAntesPonto('objeto.');
            expect(palavra).toBe('objeto');
        });

        it('deve retornar null quando não há ponto', () => {
            const palavra = provedor.obterPalavraAntesPonto('objeto');
            expect(palavra).toBeNull();
        });

        it('deve extrair última palavra antes do ponto', () => {
            const palavra = provedor.obterPalavraAntesPonto('primeiro.segundo.');
            expect(palavra).toBe('primeiro');
        });
    });

    describe('obterDetalhesEscopo', () => {
        it('deve detectar escopo global', () => {
            mockDocument.lineAt.mockReturnValue({ text: 'var x = 10' });

            const detalhes = provedor.obterDetalhesEscopo(mockDocument, mockPosition);

            expect(detalhes.tipoEscopo).toBe('global');
            expect(detalhes.escopos).toEqual([]);
        });

        it('deve detectar escopo dentro de rotaGet', () => {
            mockDocument.lineAt
                .mockReturnValueOnce({ text: 'liquido.rotaGet("/", funcao(req, res) {' })
                .mockReturnValueOnce({ text: '    var x = 10' })
                .mockReturnValueOnce({ text: '    var x = 10' })
                .mockReturnValueOnce({ text: '    var x = 10' })
                .mockReturnValueOnce({ text: '    var x = 10' })
                .mockReturnValueOnce({ text: '    res.' });

            const detalhes = provedor.obterDetalhesEscopo(mockDocument, mockPosition);

            expect(detalhes.tipoEscopo).toBe('rotaGet');
            expect(detalhes.dentroDoEscopo).toBe(true);
        });

        it('deve contar nível de aninhamento', () => {
            mockDocument.lineAt
                .mockReturnValueOnce({ text: 'funcao teste() {' })
                .mockReturnValueOnce({ text: '    se (verdadeiro) {' })
                .mockReturnValueOnce({ text: '        var x = 10' })
                .mockReturnValueOnce({ text: '        var x = 10' })
                .mockReturnValueOnce({ text: '        var x = 10' })
                .mockReturnValueOnce({ text: '        x.' });

            const detalhes = provedor.obterDetalhesEscopo(mockDocument, mockPosition);

            expect(detalhes.nivelAninhamento).toBeGreaterThan(0);
        });
    });

    describe('detectarParametrosDaFuncao', () => {
        it('deve detectar parâmetros de rotaGet', () => {
            mockDocument.lineAt = jest.fn((linha: number) => {
                if (linha === 3) {
                    return { text: 'liquido.rotaGet(funcao(req, res) {' };
                }
                return { text: '' };
            });
            mockPosition.line = 5;

            const parametros = provedor.detectarParametrosDaFuncao(mockDocument, mockPosition);

            expect(parametros.length).toBe(2);
            expect(parametros[0].nome).toBe('req');
            expect(parametros[0].tipoOriginal).toBe('requisicao');
            expect(parametros[1].nome).toBe('res');
            expect(parametros[1].tipoOriginal).toBe('resposta');
        });

        it('deve detectar parâmetros de rotaPost', () => {
            mockDocument.lineAt = jest.fn((linha: number) => {
                if (linha === 2) {
                    return { text: 'liquido.rotaPost(funcao(requisicao, resposta) {' };
                }
                return { text: '' };
            });
            mockPosition.line = 5;

            const parametros = provedor.detectarParametrosDaFuncao(mockDocument, mockPosition);

            expect(parametros.length).toBe(2);
            expect(parametros[0].nome).toBe('requisicao');
            expect(parametros[1].nome).toBe('resposta');
        });

        it('deve retornar array vazio quando não encontra padrão', () => {
            mockDocument.lineAt.mockReturnValue({ text: 'var x = 10' });

            const parametros = provedor.detectarParametrosDaFuncao(mockDocument, mockPosition);

            expect(parametros).toEqual([]);
        });
    });

    describe('criarCompletudesCompletas', () => {
        it('deve criar completudes para propriedades', () => {
            const tipoParametro = {
                nome: 'teste',
                propriedades: [
                    {
                        nome: 'prop1',
                        tipo: 'texto',
                        documentacao: 'Propriedade de teste',
                        tipoCompletude: vscode.CompletionItemKind.Property
                    }
                ]
            };

            const completudes = provedor.criarCompletudesCompletas(tipoParametro);

            expect(completudes.length).toBeGreaterThan(0);
            expect(completudes[0].label).toBe('prop1');
            expect(completudes[0].kind).toBe(vscode.CompletionItemKind.Property);
        });

        it('deve criar completudes para métodos', () => {
            const tipoParametro = {
                nome: 'teste',
                metodos: [
                    {
                        nome: 'metodo1',
                        parametros: ['arg1: texto'],
                        tipoRetorno: 'número',
                        documentacao: 'Método de teste',
                        permiteEncadeamento: false
                    }
                ]
            };

            const completudes = provedor.criarCompletudesCompletas(tipoParametro);

            expect(completudes.length).toBeGreaterThan(0);
            expect(completudes[0].label).toBe('metodo1');
            expect(completudes[0].kind).toBe(vscode.CompletionItemKind.Method);
        });

        it('deve adicionar snippet para métodos', () => {
            const tipoParametro = {
                nome: 'teste',
                metodos: [
                    {
                        nome: 'metodo1',
                        parametros: [],
                        documentacao: 'Teste',
                        snippet: 'metodo1(${1:arg})'
                    }
                ]
            };

            const completudes = provedor.criarCompletudesCompletas(tipoParametro);

            expect(completudes[0].insertText).toBeDefined();
            expect(completudes[0].insertText.value).toBe('metodo1(${1:arg})');
        });

        it('deve indicar métodos encadeáveis', () => {
            const tipoParametro = {
                nome: 'teste',
                metodos: [
                    {
                        nome: 'metodo1',
                        parametros: [],
                        tipoRetorno: 'teste',
                        documentacao: 'Teste',
                        permiteEncadeamento: true
                    }
                ]
            };

            const completudes = provedor.criarCompletudesCompletas(tipoParametro);

            expect(completudes[0].detail).toContain('encadeável');
        });
    });

    describe('Integração - Liquido', () => {
        it('deve sugerir métodos de resposta dentro de escopo de rota', () => {
            mockDocument.lineAt.mockImplementation((linha: number) => {
                if (linha === 0) {
                    return { text: 'liquido.rotaGet("/", funcao(req, res) {' };
                }
                if (linha === 5) {
                    return { text: '    ' };
                }
                return { text: '' };
            });
            obterResultado.mockReturnValue({ avaliadorSintatico: { declaracoes: [] } });

            const items = provedor.provideCompletionItems(
                mockDocument,
                mockPosition,
                mockToken,
                mockContext
            );

            // Deve incluir objetos disponíveis em rotas (requisicao, resposta)
            expect(Array.isArray(items)).toBe(true);
            expect(items.length).toBeGreaterThan(0);
        });
    });

    describe('Casos extremos', () => {
        it('deve lidar com documento sem cache de análise', () => {
            obterResultado.mockReturnValue(null);
            mockDocument.lineAt.mockReturnValue({ text: '' });

            const items = provedor.provideCompletionItems(
                mockDocument,
                mockPosition,
                mockToken,
                mockContext
            );

            expect(Array.isArray(items)).toBe(true);
        });

        it('deve lidar com posição no início da linha', () => {
            mockDocument.lineAt.mockReturnValue({ text: 'var x = 10' });
            mockPosition.character = 0;
            obterResultado.mockReturnValue({ avaliadorSintatico: { declaracoes: [] } });

            const items = provedor.provideCompletionItems(
                mockDocument,
                mockPosition,
                mockToken,
                mockContext
            );

            expect(Array.isArray(items)).toBe(true);
        });

        it('deve lidar com múltiplas declarações de diferentes tipos', () => {
            const { Var, Const, Classe, FuncaoDeclaracao } = require('@designliquido/delegua/declaracoes');

            obterResultado.mockReturnValue({
                avaliadorSintatico: {
                    declaracoes: [
                        new Var({ lexema: 'x' }, 'número'),
                        new Const({ lexema: 'Y' }, 'texto'),
                        new Classe({ lexema: 'MinhaClasse' }),
                        new FuncaoDeclaracao({ lexema: 'minhaFuncao' }, 'qualquer')
                    ]
                }
            });
            mockDocument.lineAt.mockReturnValue({ text: '' });

            const items = provedor.provideCompletionItems(
                mockDocument,
                mockPosition,
                mockToken,
                mockContext
            );

            expect(items.some((item: any) => item.label === 'x')).toBe(true);
            expect(items.some((item: any) => item.label === 'Y')).toBe(true);
            expect(items.some((item: any) => item.label === 'MinhaClasse')).toBe(true);
            expect(items.some((item: any) => item.label === 'minhaFuncao')).toBe(true);
        });
    });
});
