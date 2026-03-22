// @ts-nocheck - Ignora erros de tipo nos mocks complexos
import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import * as vscode from 'vscode';

// Mock do módulo vscode
jest.mock('vscode', () => ({
    CompletionItemKind: {
        Property: 9,
        Function: 2,
        Interface: 7
    },
    CompletionItem: class CompletionItem {
        constructor(public label: string, public kind?: number) {}
        documentation: any;
    }
}), { virtual: true });

// Mock dos modificadores FoLEs
jest.mock('../../fontes/linguagens/foles/modificadores', () => ({
    default: {
        'alinhamento': { nomeCss: 'text-align' },
        'cor': { nomeCss: 'color' },
        'fundo': { nomeCss: 'background' },
        'margem': { nomeCss: 'margin' },
        'padding': { nomeCss: 'padding' }
    }
}), { virtual: true });

// Mock das estruturas LMHT
jest.mock('../../fontes/linguagens/lmht/estruturas', () => ({
    default: {
        'paragrafo': { nomeHtml: 'p' },
        'divisao': { nomeHtml: 'div' },
        'titulo1': { nomeHtml: 'h1' },
        'ancora': { nomeHtml: 'a' }
    }
}), { virtual: true });

// Mock das primitivas VisuAlg
jest.mock('../../fontes/bibliotecas/dialetos/visualg', () => ({
    primitivasNumeroVisuAlg: [
        { nome: 'abs', documentacao: 'Retorna o valor absoluto' },
        { nome: 'sqrt', documentacao: 'Retorna a raiz quadrada' }
    ],
    primitivasCaracteresVisuAlg: [
        { nome: 'maiusc', documentacao: 'Converte para maiúsculas' },
        { nome: 'minusc', documentacao: 'Converte para minúsculas' }
    ],
    primitivasEntradaSaidaVisuAlg: [
        { nome: 'escreva', documentacao: 'Escreve na saída' },
        { nome: 'leia', documentacao: 'Lê da entrada' }
    ]
}), { virtual: true });

// Mock das funções do Portugol Studio
jest.mock('../../fontes/bibliotecas/dialetos/portugol-studio', () => ({
    calendarioPortugolStudio: [
        { nome: 'dia_mes_atual', documentacao: 'Recupera o dia no mês atual do computador.' },
        { nome: 'mes_atual', documentacao: 'Recupera o mês atual do computador de 1 a 12.' }
    ],
    matematicaPortugolStudio: [
        { nome: 'potencia', documentacao: 'Realiza uma exponenciação.' },
        { nome: 'raiz', documentacao: 'Realiza a radiciação de um número.' }
    ],
    textoPortugolStudio: [
        { nome: 'numero_caracteres', documentacao: 'Conta o número de caracteres em uma cadeia.' },
        { nome: 'caixa_alta', documentacao: 'Transforma os caracteres em maiúsculos.' }
    ],
    utilPortugolStudio: [
        { nome: 'sorteia', documentacao: 'Sorteia um número aleatório.' },
        { nome: 'aguarde', documentacao: 'Pausa a execução do programa.' }
    ]
}), { virtual: true });

describe('completude/provedores-simples', () => {
    let mockDocument: any;
    let mockPosition: any;
    let mockToken: any;
    let mockContext: any;

    beforeEach(() => {
        jest.clearAllMocks();

        mockDocument = {
            lineAt: jest.fn()
        };

        mockPosition = {
            line: 0,
            character: 10
        };

        mockToken = {};
        mockContext = {};
    });

    describe('FolesProvedorCompletude', () => {
        let FolesProvedorCompletude: any;
        let provedor: any;

        beforeEach(() => {
            const module = require('../../fontes/completude/foles-provedor-completude');
            FolesProvedorCompletude = module.FolesProvedorCompletude;
            provedor = new FolesProvedorCompletude();
        });

        it('deve criar instância do provedor', () => {
            expect(provedor).toBeDefined();
            expect(typeof provedor.provideCompletionItems).toBe('function');
        });

        it('deve retornar itens de completude para modificadores', () => {
            const items = provedor.provideCompletionItems(
                mockDocument,
                mockPosition,
                mockToken,
                mockContext
            );

            expect(Array.isArray(items)).toBe(true);
            expect(items.length).toBeGreaterThan(0);
        });

        it('deve incluir modificadores mockados', () => {
            const items = provedor.provideCompletionItems(
                mockDocument,
                mockPosition,
                mockToken,
                mockContext
            );

            expect(items.length).toBeGreaterThan(0);
        });

        it('deve criar itens com tipo Property', () => {
            const items = provedor.provideCompletionItems(
                mockDocument,
                mockPosition,
                mockToken,
                mockContext
            );

            expect(items[0].kind).toBe(vscode.CompletionItemKind.Property);
        });

        it('deve adicionar documentação aos itens', () => {
            const items = provedor.provideCompletionItems(
                mockDocument,
                mockPosition,
                mockToken,
                mockContext
            );

            // Verifica que pelo menos um item tem documentação
            expect(items.length).toBeGreaterThan(0);
            expect(items[0].documentation).toBeDefined();
        });

        it('deve ter labels definidos para os itens', () => {
            const items = provedor.provideCompletionItems(
                mockDocument,
                mockPosition,
                mockToken,
                mockContext
            );

            expect(items[0].label).toBeDefined();
            expect(typeof items[0].label).toBe('string');
        });
    });

    describe('LmhtProvedorCompletude', () => {
        let LmhtProvedorCompletude: any;
        let provedor: any;

        beforeEach(() => {
            const module = require('../../fontes/completude/lmht-provedor-completude');
            LmhtProvedorCompletude = module.LmhtProvedorCompletude;
            provedor = new LmhtProvedorCompletude();
        });

        it('deve criar instância do provedor', () => {
            expect(provedor).toBeDefined();
            expect(typeof provedor.provideCompletionItems).toBe('function');
        });

        it('deve retornar itens de completude para estruturas', () => {
            const items = provedor.provideCompletionItems(
                mockDocument,
                mockPosition,
                mockToken,
                mockContext
            );

            expect(Array.isArray(items)).toBe(true);
            expect(items.length).toBeGreaterThan(0);
        });

        it('deve incluir estruturas mockadas', () => {
            const items = provedor.provideCompletionItems(
                mockDocument,
                mockPosition,
                mockToken,
                mockContext
            );

            expect(items.length).toBeGreaterThan(0);
        });

        it('deve criar itens com tipo Property', () => {
            const items = provedor.provideCompletionItems(
                mockDocument,
                mockPosition,
                mockToken,
                mockContext
            );

            expect(items[0].kind).toBe(vscode.CompletionItemKind.Property);
        });

        it('deve adicionar documentação aos itens', () => {
            const items = provedor.provideCompletionItems(
                mockDocument,
                mockPosition,
                mockToken,
                mockContext
            );

            expect(items.length).toBeGreaterThan(0);
            expect(items[0].documentation).toBeDefined();
        });

        it('deve ter labels definidos para os itens', () => {
            const items = provedor.provideCompletionItems(
                mockDocument,
                mockPosition,
                mockToken,
                mockContext
            );

            expect(items[0].label).toBeDefined();
            expect(typeof items[0].label).toBe('string');
        });
    });

    describe('VisuAlgProvedorCompletude', () => {
        let VisuAlgProvedorCompletude: any;
        let provedor: any;

        beforeEach(() => {
            const module = require('../../fontes/completude/visualg-provedor-completude');
            VisuAlgProvedorCompletude = module.VisuAlgProvedorCompletude;
            provedor = new VisuAlgProvedorCompletude();
        });

        it('deve criar instância do provedor', () => {
            expect(provedor).toBeDefined();
            expect(typeof provedor.provideCompletionItems).toBe('function');
        });

        it('deve retornar itens de completude', () => {
            const items = provedor.provideCompletionItems(
                mockDocument,
                mockPosition,
                mockToken,
                mockContext
            );

            expect(Array.isArray(items)).toBe(true);
            expect(items.length).toBeGreaterThan(0);
        });

        it('deve incluir primitivas de número, caracteres e entrada/saída', () => {
            const items = provedor.provideCompletionItems(
                mockDocument,
                mockPosition,
                mockToken,
                mockContext
            );

            // 2 numéricas + 2 caracteres + 2 entrada/saída = 6
            expect(items.length).toBe(6);
        });

        it('deve criar itens com tipo Function', () => {
            const items = provedor.provideCompletionItems(
                mockDocument,
                mockPosition,
                mockToken,
                mockContext
            );

            expect(items[0].kind).toBe(vscode.CompletionItemKind.Function);
        });

        it('deve incluir funções numéricas', () => {
            const items = provedor.provideCompletionItems(
                mockDocument,
                mockPosition,
                mockToken,
                mockContext
            );

            const itemAbs = items.find((item: any) => item.label === 'abs');
            const itemSqrt = items.find((item: any) => item.label === 'sqrt');

            expect(itemAbs).toBeDefined();
            expect(itemSqrt).toBeDefined();
        });

        it('deve incluir funções de caracteres', () => {
            const items = provedor.provideCompletionItems(
                mockDocument,
                mockPosition,
                mockToken,
                mockContext
            );

            const itemMaiusc = items.find((item: any) => item.label === 'maiusc');
            const itemMinusc = items.find((item: any) => item.label === 'minusc');

            expect(itemMaiusc).toBeDefined();
            expect(itemMinusc).toBeDefined();
        });

        it('deve incluir funções de entrada/saída', () => {
            const items = provedor.provideCompletionItems(
                mockDocument,
                mockPosition,
                mockToken,
                mockContext
            );

            const itemEscreva = items.find((item: any) => item.label === 'escreva');
            const itemLeia = items.find((item: any) => item.label === 'leia');

            expect(itemEscreva).toBeDefined();
            expect(itemLeia).toBeDefined();
        });

        it('deve adicionar documentação às funções', () => {
            const items = provedor.provideCompletionItems(
                mockDocument,
                mockPosition,
                mockToken,
                mockContext
            );

            const itemAbs = items.find((item: any) => item.label === 'abs');
            expect(itemAbs.documentation).toBe('Retorna o valor absoluto');
        });
    });

    describe('LiquidoProvedorCompletude', () => {
        let LiquidoProvedorCompletude: any;
        let provedor: any;

        beforeEach(() => {
            const module = require('../../fontes/completude/liquido-provedor-completude');
            LiquidoProvedorCompletude = module.LiquidoProvedorCompletude;
            provedor = new LiquidoProvedorCompletude();
        });

        it('deve criar instância do provedor', () => {
            expect(provedor).toBeDefined();
            expect(typeof provedor.provideCompletionItems).toBe('function');
        });

        it('deve retornar sugestões quando texto é "liquido."', () => {
            mockDocument.lineAt.mockReturnValue({
                text: 'liquido.'
            });

            const items = provedor.provideCompletionItems(
                mockDocument,
                mockPosition,
                mockToken,
                mockContext
            );

            expect(Array.isArray(items)).toBe(true);
            expect(items.length).toBeGreaterThan(0);
        });

        it('deve incluir "roteador" nas sugestões', () => {
            mockDocument.lineAt.mockReturnValue({
                text: 'liquido.'
            });

            const items = provedor.provideCompletionItems(
                mockDocument,
                mockPosition,
                mockToken,
                mockContext
            );

            expect(items.length).toBe(1);
            expect(items[0].label).toBe('roteador');
        });

        it('deve criar item "roteador" com tipo Interface', () => {
            mockDocument.lineAt.mockReturnValue({
                text: 'liquido.'
            });

            const items = provedor.provideCompletionItems(
                mockDocument,
                mockPosition,
                mockToken,
                mockContext
            );

            expect(items[0].kind).toBe(vscode.CompletionItemKind.Interface);
        });

        it('deve retornar undefined quando texto não é "liquido."', () => {
            mockDocument.lineAt.mockReturnValue({
                text: 'outro texto'
            });

            const items = provedor.provideCompletionItems(
                mockDocument,
                mockPosition,
                mockToken,
                mockContext
            );

            expect(items).toBeUndefined();
        });

        it('deve retornar undefined para texto vazio', () => {
            mockDocument.lineAt.mockReturnValue({
                text: ''
            });

            const items = provedor.provideCompletionItems(
                mockDocument,
                mockPosition,
                mockToken,
                mockContext
            );

            expect(items).toBeUndefined();
        });

        it('deve chamar lineAt com a posição correta', () => {
            mockDocument.lineAt.mockReturnValue({
                text: 'liquido.'
            });

            provedor.provideCompletionItems(
                mockDocument,
                mockPosition,
                mockToken,
                mockContext
            );

            expect(mockDocument.lineAt).toHaveBeenCalledWith(mockPosition);
        });
    });

    describe('PortugolStudioProvedorCompletude', () => {
        let PortugolStudioProvedorCompletude: any;
        let provedor: any;

        beforeEach(() => {
            const module = require('../../fontes/completude/portugol-studio-provedor-completude');
            PortugolStudioProvedorCompletude = module.PortugolStudioProvedorCompletude;
            provedor = new PortugolStudioProvedorCompletude();
        });

        it('deve criar instância do provedor', () => {
            expect(provedor).toBeDefined();
            expect(typeof provedor.provideCompletionItems).toBe('function');
        });

        it('deve retornar itens de completude', () => {
            const items = provedor.provideCompletionItems(
                mockDocument,
                mockPosition,
                mockToken,
                mockContext
            );

            expect(Array.isArray(items)).toBe(true);
            expect(items.length).toBeGreaterThan(0);
        });

        it('deve incluir funções de todas as 4 bibliotecas', () => {
            const items = provedor.provideCompletionItems(
                mockDocument,
                mockPosition,
                mockToken,
                mockContext
            );

            // 2 Calendario + 2 Matematica + 2 Texto + 2 Util = 8
            expect(items.length).toBe(8);
        });

        it('deve criar itens com tipo Function', () => {
            const items = provedor.provideCompletionItems(
                mockDocument,
                mockPosition,
                mockToken,
                mockContext
            );

            expect(items[0].kind).toBe(vscode.CompletionItemKind.Function);
        });

        it('deve incluir funções da biblioteca Calendario', () => {
            const items = provedor.provideCompletionItems(
                mockDocument,
                mockPosition,
                mockToken,
                mockContext
            );

            const itemDia = items.find((item: any) => item.label === 'dia_mes_atual');
            const itemMes = items.find((item: any) => item.label === 'mes_atual');

            expect(itemDia).toBeDefined();
            expect(itemMes).toBeDefined();
        });

        it('deve incluir funções da biblioteca Matematica', () => {
            const items = provedor.provideCompletionItems(
                mockDocument,
                mockPosition,
                mockToken,
                mockContext
            );

            const itemPotencia = items.find((item: any) => item.label === 'potencia');
            const itemRaiz = items.find((item: any) => item.label === 'raiz');

            expect(itemPotencia).toBeDefined();
            expect(itemRaiz).toBeDefined();
        });

        it('deve incluir funções da biblioteca Texto', () => {
            const items = provedor.provideCompletionItems(
                mockDocument,
                mockPosition,
                mockToken,
                mockContext
            );

            const itemNumeroCaracteres = items.find((item: any) => item.label === 'numero_caracteres');
            const itemCaixaAlta = items.find((item: any) => item.label === 'caixa_alta');

            expect(itemNumeroCaracteres).toBeDefined();
            expect(itemCaixaAlta).toBeDefined();
        });

        it('deve incluir funções da biblioteca Util', () => {
            const items = provedor.provideCompletionItems(
                mockDocument,
                mockPosition,
                mockToken,
                mockContext
            );

            const itemSorteia = items.find((item: any) => item.label === 'sorteia');
            const itemAguarde = items.find((item: any) => item.label === 'aguarde');

            expect(itemSorteia).toBeDefined();
            expect(itemAguarde).toBeDefined();
        });

        it('deve adicionar documentação às funções', () => {
            const items = provedor.provideCompletionItems(
                mockDocument,
                mockPosition,
                mockToken,
                mockContext
            );

            const itemPotencia = items.find((item: any) => item.label === 'potencia');
            expect(itemPotencia.documentation).toBe('Realiza uma exponenciação.');
        });

        it('deve ter labels definidos para todos os itens', () => {
            const items = provedor.provideCompletionItems(
                mockDocument,
                mockPosition,
                mockToken,
                mockContext
            );

            items.forEach((item: any) => {
                expect(item.label).toBeDefined();
                expect(typeof item.label).toBe('string');
            });
        });
    });

    describe('Integração entre provedores', () => {
        it('deve permitir criar múltiplas instâncias de provedores', () => {
            const { FolesProvedorCompletude } = require('../../fontes/completude/foles-provedor-completude');
            const { LmhtProvedorCompletude } = require('../../fontes/completude/lmht-provedor-completude');
            const { VisuAlgProvedorCompletude } = require('../../fontes/completude/visualg-provedor-completude');
            const { LiquidoProvedorCompletude } = require('../../fontes/completude/liquido-provedor-completude');
            const { PortugolStudioProvedorCompletude } = require('../../fontes/completude/portugol-studio-provedor-completude');

            const foles = new FolesProvedorCompletude();
            const lmht = new LmhtProvedorCompletude();
            const visualg = new VisuAlgProvedorCompletude();
            const liquido = new LiquidoProvedorCompletude();
            const portugolStudio = new PortugolStudioProvedorCompletude();

            expect(foles).toBeDefined();
            expect(lmht).toBeDefined();
            expect(visualg).toBeDefined();
            expect(liquido).toBeDefined();
            expect(portugolStudio).toBeDefined();
        });

        it('deve retornar diferentes tipos de itens por provedor', () => {
            const { FolesProvedorCompletude } = require('../../fontes/completude/foles-provedor-completude');
            const { VisuAlgProvedorCompletude } = require('../../fontes/completude/visualg-provedor-completude');
            const { PortugolStudioProvedorCompletude } = require('../../fontes/completude/portugol-studio-provedor-completude');

            const foles = new FolesProvedorCompletude();
            const visualg = new VisuAlgProvedorCompletude();
            const portugolStudio = new PortugolStudioProvedorCompletude();

            const itemsFoles = foles.provideCompletionItems(mockDocument, mockPosition, mockToken, mockContext);
            const itemsVisualg = visualg.provideCompletionItems(mockDocument, mockPosition, mockToken, mockContext);
            const itemsPortugolStudio = portugolStudio.provideCompletionItems(mockDocument, mockPosition, mockToken, mockContext);

            expect(itemsFoles[0].kind).toBe(vscode.CompletionItemKind.Property);
            expect(itemsVisualg[0].kind).toBe(vscode.CompletionItemKind.Function);
            expect(itemsPortugolStudio[0].kind).toBe(vscode.CompletionItemKind.Function);
        });
    });
});
