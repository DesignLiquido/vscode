// @ts-nocheck
import { describe, it, expect, jest, beforeEach } from '@jest/globals';

jest.mock('vscode', () => ({
    MarkdownString: class MarkdownString {
        value: string;
        constructor(value?: string) { this.value = value || ''; }
        appendCodeblock(code: string, _lang?: string) { this.value += '\n' + code; return this; }
        appendMarkdown(text: string) { this.value += text; return this; }
    },
    Hover: class Hover {
        constructor(public contents: any) {}
    },
}), { virtual: true });

jest.mock('@designliquido/delprops', () => ({
    liquido: {
        roteador: [
            { nome: 'porta', tipo: 'numero', detalhe: 'Porta do servidor', valoresPermitidos: null, padrao: '3000' },
            { nome: 'cors', tipo: 'logico', detalhe: 'Habilita CORS', valoresPermitidos: null, padrao: null },
        ],
        dados: [
            { nome: 'tecnologia', tipo: 'texto', detalhe: 'Tecnologia de banco', valoresPermitidos: ['sqlite', 'mysql'], padrao: null },
            { nome: 'caminho', tipo: 'texto', detalhe: 'Caminho do banco', valoresPermitidos: null, padrao: null },
        ],
        autenticacao: [
            { nome: 'segredo', tipo: 'texto', detalhe: 'Chave secreta JWT', valoresPermitidos: null, padrao: null },
        ],
        aplicacao: [
            { nome: 'nome', tipo: 'texto', detalhe: 'Nome da aplicação', valoresPermitidos: null, padrao: null },
            { nome: 'licenca.nome', tipo: 'texto', detalhe: 'Nome da licença', valoresPermitidos: null, padrao: null },
            { nome: 'licenca.url', tipo: 'texto', detalhe: 'URL da licença', valoresPermitidos: null, padrao: null },
        ],
    },
    DefinicaoPropriedade: class {},
}), { virtual: true });

import { DelpropsProvedorDocumentacaoEmEditor } from '../../fontes/documentacao-em-editor/delprops-provedor-documentacao-em-editor';

function criarDocumento(texto: string): any {
    return {
        lineAt: jest.fn().mockReturnValue({ text: texto }),
        getText: jest.fn().mockReturnValue(''),
        getWordRangeAtPosition: jest.fn().mockReturnValue({}),
    };
}

describe('DelpropsProvedorDocumentacaoEmEditor', () => {
    let provedor: any;
    const mockToken: any = {};

    beforeEach(() => {
        jest.clearAllMocks();
        provedor = new DelpropsProvedorDocumentacaoEmEditor();
    });

    it('instância criada com sucesso', () => {
        expect(provedor).toBeDefined();
        expect(typeof provedor.provideHover).toBe('function');
    });

    it('linha que não começa com "liquido" → undefined', () => {
        const resultado = provedor.provideHover(criarDocumento('outro.namespace.prop'), { line: 0, character: 5 }, mockToken);
        expect(resultado).toBeUndefined();
    });

    it('cursor em "liquido" (segmento 0) → hover do namespace liquido', () => {
        const resultado = provedor.provideHover(criarDocumento('liquido'), { line: 0, character: 0 }, mockToken);
        expect(resultado).toBeDefined();
        expect(resultado.contents.value).toContain('liquido');
    });

    it('linha com comentário → hover funciona', () => {
        const resultado = provedor.provideHover(criarDocumento('liquido // comentario'), { line: 0, character: 0 }, mockToken);
        expect(resultado).toBeDefined();
    });

    it('"liquido.roteador" cursor em segmento 1 → hover do subnamespace', () => {
        const resultado = provedor.provideHover(criarDocumento('liquido.roteador'), { line: 0, character: 9 }, mockToken);
        expect(resultado).toBeDefined();
        expect(resultado.contents.value).toContain('roteador');
    });

    it('"liquido.dados" cursor em segmento 1 → menção ao identificador livre', () => {
        const resultado = provedor.provideHover(criarDocumento('liquido.dados'), { line: 0, character: 9 }, mockToken);
        expect(resultado).toBeDefined();
        expect(resultado.contents.value).toContain('nome');
    });

    it('"liquido.roteador.porta" cursor em segmento 2 → hover da propriedade porta', () => {
        const resultado = provedor.provideHover(criarDocumento('liquido.roteador.porta'), { line: 0, character: 18 }, mockToken);
        expect(resultado).toBeDefined();
        expect(resultado.contents.value).toContain('porta');
    });

    it('"liquido.roteador.porta" → mostra padrão 3000', () => {
        const resultado = provedor.provideHover(criarDocumento('liquido.roteador.porta'), { line: 0, character: 18 }, mockToken);
        expect(resultado.contents.value).toContain('3000');
    });

    it('"liquido.dados.nome.tecnologia" cursor em segmento 3 → hover da propriedade', () => {
        const resultado = provedor.provideHover(criarDocumento('liquido.dados.nome.tecnologia'), { line: 0, character: 20 }, mockToken);
        expect(resultado).toBeDefined();
        expect(resultado.contents.value).toContain('sqlite');
    });

    it('"liquido.autenticacao.segredo" → hover da propriedade', () => {
        const resultado = provedor.provideHover(criarDocumento('liquido.autenticacao.segredo'), { line: 0, character: 22 }, mockToken);
        expect(resultado).toBeDefined();
    });

    it('cursor fora dos tokens (character=100) → undefined', () => {
        const resultado = provedor.provideHover(criarDocumento('liquido.roteador'), { line: 0, character: 100 }, mockToken);
        expect(resultado).toBeUndefined();
    });

    it('"liquido.dados.lincones" cursor em segmento 2 → hover de identificador de fonte de dados', () => {
        // 'liquido.dados.lincones' → lincones começa na coluna 14
        const resultado = provedor.provideHover(criarDocumento('liquido.dados.lincones'), { line: 0, character: 14 }, mockToken);
        expect(resultado).toBeDefined();
        expect(resultado.contents.value).toContain('lincones');
    });

    it('"liquido.dados.lincones.caminho" cursor em segmento 3 → hover da propriedade caminho', () => {
        // 'caminho' começa na coluna 23
        const resultado = provedor.provideHover(criarDocumento('liquido.dados.lincones.caminho'), { line: 0, character: 23 }, mockToken);
        expect(resultado).toBeDefined();
        expect(resultado.contents.value).toContain('caminho');
    });

    it('"liquido.dados.lincones.autoInicializar" cursor em segmento 3 → hover da propriedade', () => {
        // 'autoInicializar' começa na coluna 23
        const resultado = provedor.provideHover(criarDocumento('liquido.dados.lincones.autoInicializar'), { line: 0, character: 23 }, mockToken);
        expect(resultado).toBeDefined();
        expect(resultado.contents.value).toContain('autoInicializar');
    });

    it('"liquido.aplicacao" cursor em segmento 1 → hover do subnamespace aplicacao', () => {
        const resultado = provedor.provideHover(criarDocumento('liquido.aplicacao'), { line: 0, character: 8 }, mockToken);
        expect(resultado).toBeDefined();
        expect(resultado.contents.value).toContain('aplicacao');
    });

    it('"liquido.aplicacao.nome" cursor em segmento 2 → hover da propriedade direta', () => {
        // 'nome' começa na coluna 18
        const resultado = provedor.provideHover(criarDocumento('liquido.aplicacao.nome'), { line: 0, character: 18 }, mockToken);
        expect(resultado).toBeDefined();
        expect(resultado.contents.value).toContain('nome');
    });

    it('"liquido.aplicacao.licenca" cursor em segmento 2 → hover do sub-espaço licenca', () => {
        // 'licenca' começa na coluna 18
        const resultado = provedor.provideHover(criarDocumento('liquido.aplicacao.licenca'), { line: 0, character: 18 }, mockToken);
        expect(resultado).toBeDefined();
        expect(resultado.contents.value).toContain('licenca');
    });

    it('"liquido.aplicacao.licenca.url" cursor em segmento 3 → hover da propriedade composta', () => {
        // 'url' começa na coluna 26
        const resultado = provedor.provideHover(criarDocumento('liquido.aplicacao.licenca.url'), { line: 0, character: 26 }, mockToken);
        expect(resultado).toBeDefined();
        expect(resultado.contents.value).toContain('licenca.url');
    });
});
