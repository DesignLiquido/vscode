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

jest.mock('../../fontes/linguagens/lmht/estruturas', () => ({
    __esModule: true,
    default: {
        paragrafo: {
            documentacao: '# `paragrafo`\nEstrutura de parágrafo.',
            exemploCodigo: '<paragrafo>texto</paragrafo>',
        },
        divisao: {
            documentacao: '# `divisao`\nElemento de divisão genérico.',
            exemploCodigo: '<divisao></divisao>',
        },
        negrito: {
            documentacao: '# `negrito`\nTexto em negrito.',
            exemploCodigo: '<negrito>texto</negrito>',
        },
    },
}));

jest.mock('../../fontes/linguagens/lmht/atributos', () => ({
    __esModule: true,
    default: {
        classe: {
            nomeHtml: 'class',
            documentacao: '# `classe`\nAtributo de classe CSS.',
            exemploCodigo: '<paragrafo classe="destaque">Texto</paragrafo>',
        },
        nome: {
            nomeHtml: 'name',
            documentacao: '# `nome`\nNome genérico do elemento.',
            exemploCodigo: '<campo nome="campo1">',
        },
        tipo: {
            nomeHtml: 'type',
            documentacao: '# `tipo`\nTipo genérico do elemento.',
            exemploCodigo: '<campo tipo="texto">',
        },
    },
}));

const atributosRecursoMock = {
    relacao: {
        documentacao: '# `relacao` em `recurso`\nRelacionamento do recurso (stylesheet, icon, preload...).',
        exemploCodigo: '<recurso relacao="stylesheet" destino="estilos.css">',
    },
    destino: {
        documentacao: '# `destino` em `recurso`\nURL da folha de estilo ou recurso externo.',
        exemploCodigo: '<recurso relacao="stylesheet" destino="estilos.css">',
    },
};

jest.mock('../../fontes/linguagens/lmht/atributos-por-estrutura', () => ({
    __esModule: true,
    default: {
        'meta-dados': {
            nome: {
                documentacao: '# `nome` em `meta-dados`\nTipo de metadado (descricao, palavras-chave, viewport...).',
                exemploCodigo: '<meta-dados nome="descricao" conteudo="Minha página">',
            },
        },
        campo: {
            tipo: {
                documentacao: '# `tipo` em `campo`\nTipo do campo de entrada (texto, senha, email...).',
                exemploCodigo: '<campo tipo="email" nome="email">',
            },
            nome: {
                documentacao: '# `nome` em `campo`\nNome do campo enviado com o formulário.',
                exemploCodigo: '<campo tipo="texto" nome="usuario">',
            },
        },
        // recurso e ligacao-estilo devem apontar para o mesmo objeto
        recurso: atributosRecursoMock,
        'ligacao-estilo': atributosRecursoMock,
        etiqueta: {
            para: {
                documentacao: '# `para` em `etiqueta`\nId do campo associado ao rótulo.',
                exemploCodigo: '<etiqueta para="campo-nome">Nome:</etiqueta>',
            },
        },
    },
}));

import { LmhtProvedorDocumentacaoEmEditor } from '../../fontes/documentacao-em-editor/lmht-provedor-documentacao-em-editor';

function criarDocumento(palavra: string, linhaTexto?: string): any {
    return {
        lineAt: jest.fn().mockReturnValue({ text: linhaTexto ?? palavra }),
        getText: jest.fn((range?: any) => range ? palavra : ''),
        getWordRangeAtPosition: jest.fn().mockReturnValue({}),
    };
}

function posicaoEm(linha: number, caractere: number): any {
    return { line: linha, character: caractere };
}

describe('LmhtProvedorDocumentacaoEmEditor', () => {
    let provedor: any;
    const mockToken: any = {};

    beforeEach(() => {
        jest.clearAllMocks();
        provedor = new LmhtProvedorDocumentacaoEmEditor();
    });

    it('instância criada com sucesso', () => {
        expect(provedor).toBeDefined();
        expect(typeof provedor.provideHover).toBe('function');
    });

    // Estruturas (tags)

    it('retorna undefined para elemento não encontrado', () => {
        const resultado = provedor.provideHover(
            criarDocumento('desconhecido'),
            posicaoEm(0, 5),
            mockToken
        );
        expect(resultado).toBeUndefined();
    });

    it('retorna Hover para paragrafo', () => {
        const resultado = provedor.provideHover(criarDocumento('paragrafo'), posicaoEm(0, 5), mockToken);
        expect(resultado).toBeDefined();
        expect(resultado.contents.value).toContain('parágrafo');
    });

    it('paragrafo com exemploCodigo contém código', () => {
        const resultado = provedor.provideHover(criarDocumento('paragrafo'), posicaoEm(0, 5), mockToken);
        expect(resultado.contents.value).toContain('<paragrafo>');
    });

    it('retorna Hover para divisao', () => {
        const resultado = provedor.provideHover(criarDocumento('divisao'), posicaoEm(0, 5), mockToken);
        expect(resultado).toBeDefined();
        expect(resultado.contents.value).toContain('divisão');
    });

    it('retorna Hover para negrito', () => {
        const resultado = provedor.provideHover(criarDocumento('negrito'), posicaoEm(0, 5), mockToken);
        expect(resultado).toBeDefined();
        expect(resultado.contents.value).toContain('negrito');
    });

    // Atributos genéricos (sem contexto de estrutura)

    it('retorna Hover para atributo genérico classe', () => {
        // Sem tag identificável na linha (apenas o nome do atributo)
        const resultado = provedor.provideHover(criarDocumento('classe', 'classe'), posicaoEm(0, 5), mockToken);
        expect(resultado).toBeDefined();
        expect(resultado.contents.value).toContain('classe');
    });

    it('retorna undefined para palavra desconhecida que não é estrutura nem atributo', () => {
        const resultado = provedor.provideHover(criarDocumento('palavraInexistente', 'palavraInexistente'), posicaoEm(0, 5), mockToken);
        expect(resultado).toBeUndefined();
    });

    // Atributos contextuais

    it('nome em meta-dados retorna documentação específica de meta-dados', () => {
        // Linha: "<meta-dados nome=..." — cursor no início de "nome" (caractere 12)
        const linha = '<meta-dados nome="descricao">';
        const resultado = provedor.provideHover(
            criarDocumento('nome', linha),
            posicaoEm(0, 12),
            mockToken
        );
        expect(resultado).toBeDefined();
        expect(resultado.contents.value).toContain('meta-dados');
    });

    it('nome em meta-dados NÃO retorna documentação genérica de nome', () => {
        const linha = '<meta-dados nome="descricao">';
        const resultado = provedor.provideHover(
            criarDocumento('nome', linha),
            posicaoEm(0, 12),
            mockToken
        );
        expect(resultado.contents.value).not.toContain('genérico');
    });

    it('tipo em campo retorna documentação específica de campo', () => {
        // Linha: "<campo tipo=..." — cursor no início de "tipo" (caractere 7)
        const linha = '<campo tipo="email">';
        const resultado = provedor.provideHover(
            criarDocumento('tipo', linha),
            posicaoEm(0, 7),
            mockToken
        );
        expect(resultado).toBeDefined();
        expect(resultado.contents.value).toContain('campo');
    });

    it('nome em campo retorna documentação específica de campo', () => {
        const linha = '<campo nome="usuario">';
        const resultado = provedor.provideHover(
            criarDocumento('nome', linha),
            posicaoEm(0, 7),
            mockToken
        );
        expect(resultado).toBeDefined();
        expect(resultado.contents.value).toContain('campo');
    });

    it('relacao em recurso retorna documentação específica de recurso', () => {
        const linha = '<recurso relacao="stylesheet">';
        const resultado = provedor.provideHover(
            criarDocumento('relacao', linha),
            posicaoEm(0, 9),
            mockToken
        );
        expect(resultado).toBeDefined();
        expect(resultado.contents.value).toContain('recurso');
    });

    it('destino em recurso retorna documentação específica de recurso', () => {
        const linha = '<recurso destino="estilos.css">';
        const resultado = provedor.provideHover(
            criarDocumento('destino', linha),
            posicaoEm(0, 9),
            mockToken
        );
        expect(resultado).toBeDefined();
        expect(resultado.contents.value).toContain('recurso');
    });

    it('relacao em ligacao-estilo usa a mesma documentação que recurso', () => {
        const linha = '<ligacao-estilo relacao="stylesheet">';
        const resultado = provedor.provideHover(
            criarDocumento('relacao', linha),
            posicaoEm(0, 16),
            mockToken
        );
        expect(resultado).toBeDefined();
        expect(resultado.contents.value).toContain('recurso');
    });

    it('para em etiqueta retorna documentação específica de etiqueta', () => {
        const linha = '<etiqueta para="campo-nome">';
        const resultado = provedor.provideHover(
            criarDocumento('para', linha),
            posicaoEm(0, 10),
            mockToken
        );
        expect(resultado).toBeDefined();
        expect(resultado.contents.value).toContain('etiqueta');
    });

    it('classe em divisao (não contextual) retorna documentação genérica', () => {
        // "divisao" não está no mock de atributos-por-estrutura, deve usar genérico
        const linha = '<divisao classe="container">';
        const resultado = provedor.provideHover(
            criarDocumento('classe', linha),
            posicaoEm(0, 9),
            mockToken
        );
        expect(resultado).toBeDefined();
        expect(resultado.contents.value).toContain('classe');
    });
});
