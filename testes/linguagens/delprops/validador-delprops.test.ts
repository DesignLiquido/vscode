// @ts-nocheck
import { describe, it, expect, jest, beforeEach } from '@jest/globals';

jest.mock('vscode', () => {
    class Diagnostic {
        range: any; message: string; severity: number;
        constructor(range: any, message: string, severity: number) {
            this.range = range;
            this.message = message;
            this.severity = severity;
        }
    }
    class Range {
        start: any; end: any;
        constructor(sl: number, sc: number, el: number, ec: number) {
            this.start = { line: sl, character: sc };
            this.end = { line: el, character: ec };
        }
    }
    return {
        Diagnostic,
        Range,
        DiagnosticSeverity: { Error: 0, Warning: 1, Information: 2, Hint: 3 },
    };
}, { virtual: true });

jest.mock('@designliquido/delprops', () => ({
    analisar: jest.fn(),
    validar: jest.fn(),
    registrar: jest.fn(),
    obterTodos: jest.fn(),
}), { virtual: true });

jest.mock('@designliquido/delprops/liquido', () => ({
    __esModule: true,
    arquetipo: [],
    linguagem: [],
    aplicacao: [],
    roteador: [],
    dados: [],
    autenticacao: [],
    estilos: [],
}), { virtual: true });

import { validarDelprops } from '../../../fontes/linguagens/delprops/validador-delprops';
import { analisar, validar, obterTodos } from '@designliquido/delprops';

function criarDocumento(linhas: string[]): any {
    return {
        lineCount: linhas.length,
        lineAt: jest.fn((i: number) => ({ text: linhas[i] })),
    };
}

describe('validarDelprops', () => {
    beforeEach(() => {
        analisar.mockReturnValue({ propriedades: [], erros: [] });
        validar.mockReturnValue({ avisos: [], erros: [] });
        obterTodos.mockReturnValue(new Map());
    });

    it('documento vazio → nenhum diagnóstico', () => {
        const diags = validarDelprops(criarDocumento([]));
        expect(diags).toHaveLength(0);
    });

    it('linha vazia → ignorada (analisar não retorna erro)', () => {
        const diags = validarDelprops(criarDocumento(['', '  ', '\t']));
        expect(analisar).toHaveBeenCalled();
        expect(diags).toHaveLength(0);
    });

    it('linha com apenas comentário → ignorada', () => {
        const diags = validarDelprops(criarDocumento(['// comentário aqui']));
        expect(diags).toHaveLength(0);
    });

    it('analisar retorna erro de linha sem "=" → diagnóstico Error', () => {
        analisar.mockReturnValue({
            propriedades: [],
            erros: [{ mensagem: "Linha sem o separador '='.", linha: 1 }],
        });
        const diags = validarDelprops(criarDocumento(['liquido.roteador.porta']));
        expect(diags).toHaveLength(1);
        expect(diags[0].message).toContain('separador');
        expect(diags[0].severity).toBe(0);
    });

    it('analisar retorna erro de chave vazia → diagnóstico Error', () => {
        analisar.mockReturnValue({
            propriedades: [],
            erros: [{ mensagem: 'Chave vazia.', linha: 1 }],
        });
        const diags = validarDelprops(criarDocumento(['= 3000']));
        expect(diags).toHaveLength(1);
        expect(diags[0].message).toContain('Chave vazia');
        expect(diags[0].severity).toBe(0);
    });

    it('analisar retorna erro de valor vazio → diagnóstico Error', () => {
        analisar.mockReturnValue({
            propriedades: [],
            erros: [{ mensagem: "Valor vazio para a chave 'liquido.roteador.porta'.", linha: 1 }],
        });
        const diags = validarDelprops(criarDocumento(['liquido.roteador.porta =']));
        expect(diags).toHaveLength(1);
        expect(diags[0].message).toContain('Valor vazio');
        expect(diags[0].severity).toBe(0);
    });

    it('validar retorna aviso de propriedade desconhecida → diagnóstico Warning', () => {
        const linhaConteudo = 'liquido.roteador.propriedadeDesconhecida = verdadeiro';
        analisar.mockReturnValue({
            propriedades: [{ chave: 'liquido.roteador.propriedadeDesconhecida', valor: 'verdadeiro', linha: 1 }],
            erros: [],
        });
        validar.mockReturnValue({
            avisos: [{ chave: 'liquido.roteador.propriedadeDesconhecida', linha: 1, mensagem: "Propriedade 'propriedadeDesconhecida' desconhecida no espaço de nomes 'liquido.roteador'." }],
            erros: [],
        });
        const diags = validarDelprops(criarDocumento([linhaConteudo]));
        expect(diags).toHaveLength(1);
        expect(diags[0].message).toContain('Propriedade');
        expect(diags[0].message).toContain('desconhecida');
        expect(diags[0].severity).toBe(1);
    });

    it('validar retorna erro de tipo incorreto → diagnóstico Error', () => {
        analisar.mockReturnValue({
            propriedades: [{ chave: 'liquido.roteador.diretorioEstatico', valor: '42', linha: 1 }],
            erros: [],
        });
        validar.mockReturnValue({
            avisos: [],
            erros: [{ chave: 'liquido.roteador.diretorioEstatico', linha: 1, mensagem: "Tipo esperado 'texto', mas o valor '42' parece ser 'numero'." }],
        });
        const diags = validarDelprops(criarDocumento(['liquido.roteador.diretorioEstatico = 42']));
        expect(diags).toHaveLength(1);
        expect(diags[0].message).toContain('Tipo esperado');
        expect(diags[0].severity).toBe(0);
    });

    it('validar retorna erro de valor não permitido → diagnóstico Error', () => {
        analisar.mockReturnValue({
            propriedades: [{ chave: 'liquido.autenticacao.tecnologia', valor: "'session'", linha: 1 }],
            erros: [],
        });
        validar.mockReturnValue({
            avisos: [],
            erros: [{ chave: 'liquido.autenticacao.tecnologia', linha: 1, mensagem: "Valor 'session' não está entre os permitidos: [jwt]." }],
        });
        const diags = validarDelprops(criarDocumento(["liquido.autenticacao.tecnologia = 'session'"]));
        expect(diags).toHaveLength(1);
        expect(diags[0].message).toContain('não está entre os permitidos');
        expect(diags[0].severity).toBe(0);
    });

    it('propriedade válida → nenhum diagnóstico', () => {
        analisar.mockReturnValue({
            propriedades: [{ chave: 'liquido.roteador.cors', valor: 'verdadeiro', linha: 1 }],
            erros: [],
        });
        validar.mockReturnValue({ avisos: [], erros: [] });
        const diags = validarDelprops(criarDocumento(['liquido.roteador.cors = verdadeiro']));
        expect(diags).toHaveLength(0);
    });

    it('namespace não-liquido → nenhum diagnóstico', () => {
        analisar.mockReturnValue({
            propriedades: [{ chave: 'outro.namespace.prop', valor: 'valor', linha: 1 }],
            erros: [],
        });
        validar.mockReturnValue({ avisos: [], erros: [] });
        const diags = validarDelprops(criarDocumento(['outro.namespace.prop = valor']));
        expect(diags).toHaveLength(0);
    });

    it('múltiplas linhas com alguns erros → conta corretamente', () => {
        analisar.mockReturnValue({
            propriedades: [{ chave: 'liquido.roteador.cors', valor: 'verdadeiro', linha: 2 }],
            erros: [
                { mensagem: "Linha sem o separador '='.", linha: 1 },
                { mensagem: "Linha sem o separador '='.", linha: 3 },
            ],
        });
        validar.mockReturnValue({ avisos: [], erros: [] });
        const diags = validarDelprops(criarDocumento([
            'linha-sem-igual',
            'liquido.roteador.cors = verdadeiro',
            'outra-sem-igual',
        ]));
        expect(diags).toHaveLength(2);
    });

    it('múltiplos diagnósticos combinados (erros parse + avisos + erros validação)', () => {
        analisar.mockReturnValue({
            propriedades: [
                { chave: 'liquido.roteador.porta', valor: "'texto'", linha: 1 },
            ],
            erros: [{ mensagem: 'Erro de parse.', linha: 2 }],
        });
        validar.mockReturnValue({
            avisos: [{ chave: 'liquido.roteador.desconhecida', linha: 3, mensagem: 'Aviso de validação.' }],
            erros: [{ chave: 'liquido.roteador.porta', linha: 1, mensagem: 'Erro de tipo.' }],
        });
        const diags = validarDelprops(criarDocumento([
            "liquido.roteador.porta = 'texto'",
            'linha-invalida',
            'liquido.roteador.desconhecida = verdadeiro',
        ]));
        expect(diags).toHaveLength(3);
        const temErroParse = diags.filter(d => d.severity === 0).some(d => d.message === 'Erro de parse.');
        const temErroValidacao = diags.filter(d => d.severity === 0).some(d => d.message === 'Erro de tipo.');
        const temAviso = diags.filter(d => d.severity === 1).some(d => d.message === 'Aviso de validação.');
        expect(temErroParse).toBe(true);
        expect(temErroValidacao).toBe(true);
        expect(temAviso).toBe(true);
    });

    it('valor com URL contendo // → preservado (comentário não é removido dentro de aspas)', () => {
        analisar.mockReturnValue({
            propriedades: [{ chave: 'liquido.aplicacao.licenca.url', valor: "'https://designliquido.com.br'", linha: 1 }],
            erros: [],
        });
        validar.mockReturnValue({ avisos: [], erros: [] });
        const diags = validarDelprops(criarDocumento(["liquido.aplicacao.licenca.url = 'https://designliquido.com.br'"]));
        expect(diags).toHaveLength(0);
    });

    it('comentário após valor com URL → valor preservado, comentário ignorado', () => {
        const diags = validarDelprops(criarDocumento(["liquido.aplicacao.licenca.url = 'https://designliquido.com.br' // site oficial"]));
        const chamada = analisar.mock.calls[0][0];
        expect(chamada).toContain("'https://designliquido.com.br'");
        expect(chamada).not.toContain('// site oficial');
        expect(diags).toHaveLength(0);
    });

    it('comentário de linha inteira com URL dentro → linha ignorada', () => {
        const diags = validarDelprops(criarDocumento(["// liquido.aplicacao.licenca.url = 'https://designliquido.com.br'"]));
        const chamada = analisar.mock.calls[0][0];
        expect(chamada).toBe('');
        expect(diags).toHaveLength(0);
    });

    it('várias linhas com comentários → apenas linhas não-comentário passadas ao analisar', () => {
        const diags = validarDelprops(criarDocumento([
            '// Configuração do roteador',
            "liquido.roteador.cors = verdadeiro",
            "liquido.roteador.helmet = verdadeiro",
            '',
            "liquido.autenticacao.tecnologia = 'jwt'",
        ]));
        const chamada = analisar.mock.calls[0][0];
        const linhas = chamada.split('\n');
        expect(linhas[0]).toBe('');
        expect(linhas[1]).toBe('liquido.roteador.cors = verdadeiro');
        expect(linhas[2]).toBe('liquido.roteador.helmet = verdadeiro');
        expect(linhas[3]).toBe('');
        expect(linhas[4]).toBe("liquido.autenticacao.tecnologia = 'jwt'");
        expect(diags).toHaveLength(0);
    });
});
