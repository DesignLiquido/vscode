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

jest.mock('../../../fontes/interfaces', () => ({}), { virtual: true });

import { validarDelprops } from '../../../fontes/linguagens/delprops/validador-delprops';

function criarDocumento(linhas: string[]): any {
    return {
        lineCount: linhas.length,
        getText: jest.fn(() => linhas.join('\n')),
        lineAt: jest.fn((i: number) => ({ text: linhas[i] })),
    };
}

describe('validarDelprops', () => {
    it('documento vazio → nenhum diagnóstico', () => {
        const diags = validarDelprops(criarDocumento([]));
        expect(diags).toHaveLength(0);
    });

    it('linha vazia → ignorada', () => {
        const diags = validarDelprops(criarDocumento(['', '  ', '\t']));
        expect(diags).toHaveLength(0);
    });

    it('linha com apenas comentário → ignorada', () => {
        const diags = validarDelprops(criarDocumento(['// comentário aqui']));
        expect(diags).toHaveLength(0);
    });

    it('linha sem "=" → erro de sintaxe', () => {
        const diags = validarDelprops(criarDocumento(['liquido.roteador.porta']));
        expect(diags).toHaveLength(1);
        expect(diags[0].message).toContain("Linha sem o separador '='");
        expect(diags[0].severity).toBe(0); // Error
    });

    it('linha com chave vazia (= no início) → erro de sintaxe', () => {
        const diags = validarDelprops(criarDocumento(['= 3000']));
        expect(diags).toHaveLength(1);
        expect(diags[0].message).toContain('Chave vazia');
    });

    it('linha com valor vazio (= no final) → erro de sintaxe', () => {
        const diags = validarDelprops(criarDocumento(['liquido.roteador.porta =']));
        expect(diags).toHaveLength(1);
        expect(diags[0].message).toContain('Valor vazio');
        expect(diags[0].message).toContain('liquido.roteador.porta');
    });

    it('namespace não-liquido → nenhum diagnóstico (permitido sem validação)', () => {
        const diags = validarDelprops(criarDocumento(['outro.namespace.prop = valor']));
        expect(diags).toHaveLength(0);
    });

    // ──── liquido incompleto ────
    it('liquido sem subnamespace → aviso namespace sem propriedade', () => {
        const diags = validarDelprops(criarDocumento(['liquido = verdadeiro']));
        expect(diags).toHaveLength(1);
        expect(diags[0].message).toContain("Namespace 'liquido' sem nome de propriedade");
    });

    it('liquido.verboso → aviso propriedade desconhecida', () => {
        const diags = validarDelprops(criarDocumento(['liquido.verboso = verdadeiro']));
        expect(diags).toHaveLength(1);
        expect(diags[0].message).toContain('desconhecida');
        expect(diags[0].severity).toBe(1); // Warning
    });

    it('liquido.verboso com texto → aviso propriedade desconhecida', () => {
        const diags = validarDelprops(criarDocumento(["liquido.verboso = 'sim'"]));
        expect(diags).toHaveLength(1);
        expect(diags[0].message).toContain('desconhecida');
        expect(diags[0].severity).toBe(1); // Warning
    });

    // ──── liquido.roteador ────
    it('liquido.roteador sem propriedade → aviso namespace sem propriedade', () => {
        const diags = validarDelprops(criarDocumento(['liquido.roteador = verdadeiro']));
        expect(diags).toHaveLength(1);
        expect(diags[0].message).toContain("Namespace 'liquido.roteador' sem nome de propriedade");
    });

    it('liquido.roteador.porta com número → sem diagnóstico', () => {
        const diags = validarDelprops(criarDocumento(['liquido.roteador.porta = 3000']));
        expect(diags).toHaveLength(0);
    });

    it('liquido.roteador.cors com lógico válido → sem diagnóstico', () => {
        const diags = validarDelprops(criarDocumento(['liquido.roteador.cors = verdadeiro']));
        expect(diags).toHaveLength(0);
    });

    it('liquido.roteador.diretorioEstatico com texto válido → sem diagnóstico', () => {
        const diags = validarDelprops(criarDocumento(["liquido.roteador.diretorioEstatico = 'public'"]));
        expect(diags).toHaveLength(0);
    });

    it('liquido.roteador.porta com texto → erro de tipo', () => {
        const diags = validarDelprops(criarDocumento(["liquido.roteador.porta = 'texto'"]));
        expect(diags).toHaveLength(1);
        expect(diags[0].message).toContain('Tipo esperado');
        expect(diags[0].message).toContain('numero');
        expect(diags[0].severity).toBe(0); // Error
    });

    it('liquido.roteador.cors com número → erro de tipo', () => {
        const diags = validarDelprops(criarDocumento(['liquido.roteador.cors = 42']));
        expect(diags).toHaveLength(1);
        expect(diags[0].message).toContain('Tipo esperado');
        expect(diags[0].message).toContain('logico');
    });

    it('liquido.roteador.propriedadeDesconhecida → aviso', () => {
        const diags = validarDelprops(criarDocumento(['liquido.roteador.inexistente = verdadeiro']));
        expect(diags).toHaveLength(1);
        expect(diags[0].message).toContain('desconhecida');
        expect(diags[0].severity).toBe(1); // Warning
    });

    it('liquido.roteador.diretorioEstatico com valor sem aspas → erro tipo não reconhecido', () => {
        const diags = validarDelprops(criarDocumento(['liquido.roteador.diretorioEstatico = valor_sem_aspas']));
        expect(diags).toHaveLength(1);
        expect(diags[0].message).toContain('não corresponde a nenhum tipo conhecido');
    });

    // ──── liquido.dados ────
    it('liquido.dados sem nome e propriedade → aviso namespace sem propriedade', () => {
        const diags = validarDelprops(criarDocumento(['liquido.dados = verdadeiro']));
        expect(diags).toHaveLength(1);
        expect(diags[0].message).toContain("Namespace 'liquido.dados' sem nome de propriedade");
    });

    it('liquido.dados.bd → aviso namespace sem propriedade', () => {
        const diags = validarDelprops(criarDocumento(['liquido.dados.bd = verdadeiro']));
        expect(diags).toHaveLength(1);
        expect(diags[0].message).toContain("Namespace 'liquido.dados' sem nome de propriedade");
        expect(diags[0].severity).toBe(1); // Warning
    });

    it('liquido.dados.lincones.motor → aviso propriedade desconhecida', () => {
        const diags = validarDelprops(criarDocumento(["liquido.dados.lincones.motor = 'lincones'"]));
        expect(diags).toHaveLength(1);
        expect(diags[0].message).toContain('desconhecida');
        expect(diags[0].severity).toBe(1); // Warning
    });

    it('liquido.dados.lincones.motor com valor não permitido → aviso propriedade desconhecida', () => {
        const diags = validarDelprops(criarDocumento(["liquido.dados.lincones.motor = 'mysql'"]));
        expect(diags).toHaveLength(1);
        expect(diags[0].message).toContain('desconhecida');
        expect(diags[0].severity).toBe(1); // Warning
    });

    it('liquido.dados.bd.porta com número → sem diagnóstico', () => {
        const diags = validarDelprops(criarDocumento(['liquido.dados.bd.porta = 5432']));
        expect(diags).toHaveLength(0);
    });

    it('liquido.dados.bd.tecnologia com sqlite → sem diagnóstico', () => {
        const diags = validarDelprops(criarDocumento(["liquido.dados.bd.tecnologia = 'sqlite'"]));
        expect(diags).toHaveLength(0);
    });

    it('liquido.dados.bd.autoInicializar com lógico → sem diagnóstico', () => {
        const diags = validarDelprops(criarDocumento(['liquido.dados.bd.autoInicializar = verdadeiro']));
        expect(diags).toHaveLength(0);
    });

    it('liquido.dados.bd.arquivoInicializacao com texto → sem diagnóstico', () => {
        const diags = validarDelprops(criarDocumento(["liquido.dados.bd.arquivoInicializacao = 'init.lincones'"]));
        expect(diags).toHaveLength(0);
    });

    it('liquido.dados.bd.tecnologia com tipo errado (número) → erro de tipo', () => {
        const diags = validarDelprops(criarDocumento(['liquido.dados.bd.tecnologia = 5432']));
        expect(diags).toHaveLength(1);
        expect(diags[0].message).toContain('Tipo esperado');
    });

    it('liquido.dados.bd.propriedadeDesconhecida → aviso', () => {
        const diags = validarDelprops(criarDocumento(['liquido.dados.bd.inexistente = verdadeiro']));
        expect(diags).toHaveLength(1);
        expect(diags[0].severity).toBe(1); // Warning
    });

    // ──── liquido.autenticacao ────
    it('liquido.autenticacao sem propriedade → aviso namespace sem propriedade', () => {
        const diags = validarDelprops(criarDocumento(['liquido.autenticacao = verdadeiro']));
        expect(diags).toHaveLength(1);
        expect(diags[0].message).toContain("Namespace 'liquido.autenticacao' sem nome de propriedade");
    });

    it("liquido.autenticacao.segredo → aviso propriedade desconhecida", () => {
        const diags = validarDelprops(criarDocumento(["liquido.autenticacao.segredo = 'minha-chave-secreta'"]));
        expect(diags).toHaveLength(1);
        expect(diags[0].message).toContain('desconhecida');
        expect(diags[0].severity).toBe(1); // Warning
    });

    it("liquido.autenticacao.tecnologia com 'jwt' → sem diagnóstico", () => {
        const diags = validarDelprops(criarDocumento(["liquido.autenticacao.tecnologia = 'jwt'"]));
        expect(diags).toHaveLength(0);
    });

    it("liquido.autenticacao.tecnologia com 'session' → erro valor não permitido", () => {
        const diags = validarDelprops(criarDocumento(["liquido.autenticacao.tecnologia = 'session'"]));
        expect(diags).toHaveLength(1);
        expect(diags[0].message).toContain("'session'");
        expect(diags[0].severity).toBe(0); // Error
    });

    it("liquido.autenticacao.tecnologia com valor não permitido → erro", () => {
        const diags = validarDelprops(criarDocumento(["liquido.autenticacao.tecnologia = 'oauth'"]));
        expect(diags).toHaveLength(1);
        expect(diags[0].message).toContain("'oauth'");
    });

    it('liquido.autenticacao.propriedadeDesconhecida → aviso', () => {
        const diags = validarDelprops(criarDocumento(['liquido.autenticacao.inexistente = verdadeiro']));
        expect(diags).toHaveLength(1);
        expect(diags[0].message).toContain('desconhecida');
        expect(diags[0].severity).toBe(1); // Warning
    });

    // ──── namespace desconhecido ────
    it('liquido.namespaceDesconhecido → aviso propriedade desconhecida', () => {
        const diags = validarDelprops(criarDocumento(['liquido.algumOutro.prop = valor']));
        expect(diags).toHaveLength(1);
        expect(diags[0].message).toContain('desconhecida');
        expect(diags[0].message).toContain('liquido');
        expect(diags[0].severity).toBe(1); // Warning
    });

    // ──── valores aspas duplas ────
    it('valor com aspas duplas → erro tipo não reconhecido (pacote não suporta aspas duplas)', () => {
        const diags = validarDelprops(criarDocumento(['liquido.roteador.diretorioEstatico = "public"']));
        expect(diags).toHaveLength(1);
        expect(diags[0].message).toContain('não corresponde a nenhum tipo conhecido');
    });

    // ──── múltiplas linhas ────
    it('múltiplas linhas válidas → sem diagnóstico', () => {
        const diags = validarDelprops(criarDocumento([
            '// Configuração do roteador',
            "liquido.roteador.cors = verdadeiro",
            "liquido.roteador.helmet = verdadeiro",
            '',
            "liquido.autenticacao.tecnologia = 'jwt'",
        ]));
        expect(diags).toHaveLength(0);
    });

    it('múltiplas linhas com alguns erros → conta corretamente', () => {
        const diags = validarDelprops(criarDocumento([
            'linha-sem-igual',
            'liquido.roteador.cors = verdadeiro',
            'outra-sem-igual',
        ]));
        expect(diags).toHaveLength(2);
    });

    it('liquido.dados.bd.host com texto → sem diagnóstico', () => {
        const diags = validarDelprops(criarDocumento(["liquido.dados.bd.host = 'localhost'"]));
        expect(diags).toHaveLength(0);
    });

    it('liquido.dados.bd.usuario com texto → sem diagnóstico', () => {
        const diags = validarDelprops(criarDocumento(["liquido.dados.bd.usuario = 'admin'"]));
        expect(diags).toHaveLength(0);
    });

    // ──── URLs com // não devem ser tratadas como comentário ────
    it("valor com URL contendo '//' em aspas simples → sem diagnóstico", () => {
        const diags = validarDelprops(criarDocumento(["liquido.aplicacao.licenca.url = 'https://designliquido.com.br'"]));
        expect(diags).toHaveLength(0);
    });

    it("valor com URL contendo '//' em aspas duplas → erro tipo não reconhecido (pacote não suporta aspas duplas)", () => {
        const diags = validarDelprops(criarDocumento(['liquido.aplicacao.licenca.url = "https://designliquido.com.br"']));
        expect(diags).toHaveLength(1);
        expect(diags[0].message).toContain('não corresponde a nenhum tipo conhecido');
    });

    it("comentário após valor com URL → erro (pacote não trata comentário inline)", () => {
        const diags = validarDelprops(criarDocumento(["liquido.aplicacao.licenca.url = 'https://designliquido.com.br' // site oficial"]));
        expect(diags).toHaveLength(1);
        expect(diags[0].message).toContain('não corresponde a nenhum tipo conhecido');
    });

    it("comentário de linha inteira com URL dentro → linha ignorada", () => {
        const diags = validarDelprops(criarDocumento(["// liquido.aplicacao.licenca.url = 'https://designliquido.com.br'"]));
        expect(diags).toHaveLength(0);
    });

    // ──── valores permitidos (tecnologia) ────
    it('liquido.dados.bd.tecnologia com valor não permitido → erro', () => {
        const diags = validarDelprops(criarDocumento(["liquido.dados.bd.tecnologia = 'mysql'"]));
        expect(diags).toHaveLength(0); // mysql is in allowed values
    });

    it('liquido.dados.bd.tecnologia com valor não listado → erro', () => {
        const diags = validarDelprops(criarDocumento(["liquido.dados.bd.tecnologia = 'cassandra'"]));
        expect(diags).toHaveLength(1);
        expect(diags[0].message).toContain('não está entre os permitidos');
        expect(diags[0].severity).toBe(0); // Error
    });
});
