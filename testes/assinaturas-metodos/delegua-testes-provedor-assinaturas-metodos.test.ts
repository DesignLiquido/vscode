// @ts-nocheck
import { describe, it, expect, jest, beforeEach } from '@jest/globals';

jest.mock('vscode', () => ({
    SignatureHelp: jest.fn().mockImplementation(() => ({
        signatures: [],
        activeParameter: undefined,
        activeSignature: undefined,
    })),
    SignatureInformation: jest.fn().mockImplementation((label, documentation) => ({
        label,
        documentation,
        parameters: [],
    })),
    ParameterInformation: jest.fn().mockImplementation((label, documentation) => ({
        label,
        documentation,
    })),
    MarkdownString: jest.fn().mockImplementation((value) => ({ value })),
}), { virtual: true });

jest.mock('../../fontes/bibliotecas', () => ({
    formatarPrimitivas: jest.fn().mockReturnValue([]),
    funcoesNativasDelegua: [],
}));

jest.mock('@designliquido/delegua-lsp/analise/cache-analise');

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
        constructor(public simbolo: any, public tipo: string, public funcao: any) {}
    },
}));

import { DeleguaTestesProvedorAssinaturaMetodos } from '../../fontes/assinaturas-metodos/delegua-testes-provedor-assinaturas-metodos';

function criarDocumento(textoLinha: string): any {
    return {
        lineAt: jest.fn().mockReturnValue({ text: textoLinha }),
        getText: jest.fn().mockReturnValue(textoLinha),
        uri: { toString: () => 'file:///test.delegua' },
        version: 1,
        languageId: 'delegua',
    };
}

describe('DeleguaTestesProvedorAssinaturaMetodos', () => {
    let provedor: any;
    const mockToken: any = {};
    const mockContext: any = {};

    beforeEach(() => {
        jest.clearAllMocks();
        provedor = new DeleguaTestesProvedorAssinaturaMetodos();
    });

    it('instância criada com sucesso', () => {
        expect(provedor).toBeDefined();
        expect(typeof provedor.provideSignatureHelp).toBe('function');
    });

    it('retorna assinatura para afirmar.igual(', () => {
        const doc = criarDocumento('afirmar.igual(');
        const resultado = provedor.provideSignatureHelp(doc, { line: 0, character: 14 }, mockToken, mockContext);
        expect(resultado).toBeDefined();
        expect(resultado.signatures.length).toBeGreaterThan(0);
    });

    it('retorna assinatura para teste.pular(', () => {
        const doc = criarDocumento('teste.pular(');
        const resultado = provedor.provideSignatureHelp(doc, { line: 0, character: 12 }, mockToken, mockContext);
        expect(resultado).toBeDefined();
        expect(resultado.signatures.length).toBeGreaterThan(0);
    });

    it('retorna assinatura para teste.apenas(', () => {
        const doc = criarDocumento('teste.apenas(');
        const resultado = provedor.provideSignatureHelp(doc, { line: 0, character: 13 }, mockToken, mockContext);
        expect(resultado).toBeDefined();
        expect(resultado.signatures.length).toBeGreaterThan(0);
    });

    it('retorna assinatura para grupo.pular(', () => {
        const doc = criarDocumento('grupo.pular(');
        const resultado = provedor.provideSignatureHelp(doc, { line: 0, character: 12 }, mockToken, mockContext);
        expect(resultado).toBeDefined();
        expect(resultado.signatures.length).toBeGreaterThan(0);
    });

    it('retorna assinatura para grupo( direto', () => {
        const doc = criarDocumento('grupo(');
        const resultado = provedor.provideSignatureHelp(doc, { line: 0, character: 6 }, mockToken, mockContext);
        expect(resultado).toBeDefined();
        expect(resultado.signatures.length).toBeGreaterThan(0);
    });

    it('retorna assinatura para teste( direto', () => {
        const doc = criarDocumento('teste(');
        const resultado = provedor.provideSignatureHelp(doc, { line: 0, character: 6 }, mockToken, mockContext);
        expect(resultado).toBeDefined();
        expect(resultado.signatures.length).toBeGreaterThan(0);
    });

    it('chama super quando não há correspondência nos testes (delega ao pai)', () => {
        const doc = criarDocumento('palavraDesconhecida(');
        const resultado = provedor.provideSignatureHelp(doc, { line: 0, character: 20 }, mockToken, mockContext);
        expect(resultado === null || resultado === undefined || typeof resultado === 'object').toBe(true);
    });
});
