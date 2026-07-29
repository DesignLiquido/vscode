// @ts-nocheck
import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import * as vscode from 'vscode';

jest.mock('vscode', () => ({
    CompletionItemKind: {
        Property: 9,
        Function: 2,
        Interface: 7,
    },
    CompletionItem: class CompletionItem {
        constructor(public label: string, public kind?: number) {}
        documentation: any;
    },
}), { virtual: true });

jest.mock('../../fontes/linguagens/foles/modificadores', () => ({
    default: {
        'alinhamento': { nomeCss: 'text-align' },
        'cor': { nomeCss: 'color' },
    }
}), { virtual: true });

jest.mock('../../fontes/linguagens/lmht/estruturas', () => ({
    default: {
        'paragrafo': { nomeHtml: 'p' },
        'divisao': { nomeHtml: 'div' },
    }
}));

jest.mock('../../fontes/bibliotecas/dialetos/visualg', () => ({
    primitivasNumeroVisuAlg: [
        { nome: 'abs', documentacao: 'Retorna o valor absoluto' },
    ],
    primitivasCaracteresVisuAlg: [],
    primitivasEntradaSaidaVisuAlg: [],
}));

jest.mock('../../fontes/bibliotecas/dialetos/portugol-studio', () => ({
    calendarioPortugolStudio: [],
    matematicaPortugolStudio: [],
    textoPortugolStudio: [],
    utilPortugolStudio: [],
    primitivasEntradaSaidaPortugolStudio: [
        { nome: 'escreva', documentacao: 'Escreve na saída.' },
    ],
    tiposPortugolStudio: [],
    constantesPortugolStudio: [],
    palavrasReservadasPortugolStudio: [],
}));

describe('integração entre provedores', () => {
    let mockDocument: any;
    let mockPosition: any;
    let mockToken: any;
    let mockContext: any;

    beforeEach(() => {
        jest.clearAllMocks();

        mockDocument = {
            lineAt: jest.fn().mockReturnValue({ text: '' }),
            getText: jest.fn().mockReturnValue(''),
        };
        mockPosition = { line: 0, character: 0 };
        mockToken = {};
        mockContext = {};
    });

    it('permite criar múltiplas instâncias de provedores', () => {
        const { FolesProvedorCompletude } = require('../../fontes/completude/foles-provedor-completude');
        const { LmhtProvedorCompletude } = require('../../fontes/completude/lmht-provedor-completude');
        const { VisuAlgProvedorCompletude } = require('../../fontes/completude/visualg-provedor-completude');
        const { LiquidoProvedorCompletude } = require('../../fontes/completude/liquido-provedor-completude');
        const { PortugolStudioProvedorCompletude } = require('../../fontes/completude/portugol-studio-provedor-completude');

        expect(new FolesProvedorCompletude()).toBeDefined();
        expect(new LmhtProvedorCompletude()).toBeDefined();
        expect(new VisuAlgProvedorCompletude()).toBeDefined();
        expect(new LiquidoProvedorCompletude()).toBeDefined();
        expect(new PortugolStudioProvedorCompletude()).toBeDefined();
    });

    it('FoLEs e VisuAlg retornam tipos de itens distintos', () => {
        const { FolesProvedorCompletude } = require('../../fontes/completude/foles-provedor-completude');
        const { VisuAlgProvedorCompletude } = require('../../fontes/completude/visualg-provedor-completude');

        const foles = new FolesProvedorCompletude();
        const visualg = new VisuAlgProvedorCompletude();

        const itemsFoles = foles.provideCompletionItems(mockDocument, mockPosition, mockToken, mockContext);
        const itemsVisualg = visualg.provideCompletionItems(mockDocument, mockPosition, mockToken, mockContext);

        expect(itemsFoles[0].kind).toBe(vscode.CompletionItemKind.Interface);
        expect(itemsVisualg[0].kind).toBe(vscode.CompletionItemKind.Function);
    });
});
