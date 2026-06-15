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

    it('linha sem "=" → erro formato inválido', () => {
        const diags = validarDelprops(criarDocumento(['liquido.roteador.porta']));
        expect(diags).toHaveLength(1);
        expect(diags[0].message).toContain("formato '<chave> = <valor>'");
        expect(diags[0].severity).toBe(0); // Error
    });

    it('linha com chave vazia (= no início) → erro chave ausente', () => {
        const diags = validarDelprops(criarDocumento(['= 3000']));
        expect(diags).toHaveLength(1);
        expect(diags[0].message).toContain('Chave ausente');
    });

    it('linha com valor vazio (= no final) → erro valor ausente', () => {
        const diags = validarDelprops(criarDocumento(['liquido.roteador.porta =']));
        expect(diags).toHaveLength(1);
        expect(diags[0].message).toContain('Valor ausente');
        expect(diags[0].message).toContain('liquido.roteador.porta');
    });

    it('namespace não-liquido → nenhum diagnóstico (permitido sem validação)', () => {
        const diags = validarDelprops(criarDocumento(['outro.namespace.prop = valor']));
        expect(diags).toHaveLength(0);
    });

    // ──── liquido incompleto ────
    it('liquido sem subnamespace → erro incompleto', () => {
        const diags = validarDelprops(criarDocumento(['liquido = verdadeiro']));
        expect(diags).toHaveLength(1);
        expect(diags[0].message).toContain("'liquido' incompleta");
    });

    // ──── liquido.roteador ────
    it('liquido.roteador sem propriedade → erro incompleto', () => {
        const diags = validarDelprops(criarDocumento(['liquido.roteador = verdadeiro']));
        expect(diags).toHaveLength(1);
        expect(diags[0].message).toContain("'liquido.roteador' incompleta");
    });

    it('liquido.roteador.porta → propriedade removida → warning', () => {
        const diags = validarDelprops(criarDocumento(['liquido.roteador.porta = 3000']));
        expect(diags).toHaveLength(1);
        expect(diags[0].severity).toBe(1); // Warning
    });

    it('liquido.roteador.cors com lógico válido → sem diagnóstico', () => {
        const diags = validarDelprops(criarDocumento(['liquido.roteador.cors = verdadeiro']));
        expect(diags).toHaveLength(0);
    });

    it('liquido.roteador.diretorioEstatico com texto válido → sem diagnóstico', () => {
        const diags = validarDelprops(criarDocumento(["liquido.roteador.diretorioEstatico = 'public'"]));
        expect(diags).toHaveLength(0);
    });

    it('liquido.roteador.porta com texto → propriedade removida → warning', () => {
        const diags = validarDelprops(criarDocumento(["liquido.roteador.porta = 'texto'"]));
        expect(diags).toHaveLength(1);
        expect(diags[0].severity).toBe(1); // Warning
    });

    it('liquido.roteador.cors com número → erro tipo incorreto', () => {
        const diags = validarDelprops(criarDocumento(['liquido.roteador.cors = 42']));
        expect(diags).toHaveLength(1);
        expect(diags[0].message).toContain('Tipo incorreto');
        expect(diags[0].message).toContain('lógico');
    });

    it('liquido.roteador.propriedadeDesconhecida → warning', () => {
        const diags = validarDelprops(criarDocumento(['liquido.roteador.inexistente = verdadeiro']));
        expect(diags).toHaveLength(1);
        expect(diags[0].message).toContain('Propriedade desconhecida');
        expect(diags[0].severity).toBe(1); // Warning
    });

    it('liquido.roteador.diretorioEstatico com valor inválido → erro valor inválido', () => {
        const diags = validarDelprops(criarDocumento(['liquido.roteador.diretorioEstatico = valor_sem_aspas']));
        expect(diags).toHaveLength(1);
        expect(diags[0].message).toContain('Valor inválido');
    });

    // ──── liquido.dados ────
    it('liquido.dados sem nome e propriedade → erro incompleto', () => {
        const diags = validarDelprops(criarDocumento(['liquido.dados = verdadeiro']));
        expect(diags).toHaveLength(1);
        expect(diags[0].message).toContain("'liquido.dados' incompleta");
    });

    it('liquido.dados.bd → propriedade direta desconhecida → warning', () => {
        const diags = validarDelprops(criarDocumento(['liquido.dados.bd = verdadeiro']));
        expect(diags).toHaveLength(1);
        expect(diags[0].message).toContain("Propriedade desconhecida 'liquido.dados.bd'");
        expect(diags[0].severity).toBe(1); // Warning
    });

    it('liquido.dados.motor com valor permitido → sem diagnóstico', () => {
        const diags = validarDelprops(criarDocumento(["liquido.dados.motor = 'lincones'"]));
        expect(diags).toHaveLength(0);
    });

    it('liquido.dados.motor com valor não permitido → erro', () => {
        const diags = validarDelprops(criarDocumento(["liquido.dados.motor = 'mysql'"]));
        expect(diags).toHaveLength(1);
        expect(diags[0].message).toContain("'mysql'");
        expect(diags[0].message).toContain('Valores permitidos');
    });

    it('liquido.dados.bd.porta → propriedade removida → warning', () => {
        const diags = validarDelprops(criarDocumento(['liquido.dados.bd.porta = 5432']));
        expect(diags).toHaveLength(1);
        expect(diags[0].severity).toBe(1); // Warning
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

    it('liquido.dados.bd.tecnologia com tipo errado (número) → erro tipo', () => {
        const diags = validarDelprops(criarDocumento(['liquido.dados.bd.tecnologia = 5432']));
        expect(diags).toHaveLength(1);
        expect(diags[0].message).toContain('Tipo incorreto');
    });

    it('liquido.dados.bd.propriedadeDesconhecida → warning', () => {
        const diags = validarDelprops(criarDocumento(['liquido.dados.bd.inexistente = verdadeiro']));
        expect(diags).toHaveLength(1);
        expect(diags[0].severity).toBe(1); // Warning
    });

    // ──── liquido.autenticacao ────
    it('liquido.autenticacao sem propriedade → erro incompleto', () => {
        const diags = validarDelprops(criarDocumento(['liquido.autenticacao = verdadeiro']));
        expect(diags).toHaveLength(1);
        expect(diags[0].message).toContain("'liquido.autenticacao' incompleta");
    });

    it("liquido.autenticacao.segredo → propriedade removida → warning", () => {
        const diags = validarDelprops(criarDocumento(["liquido.autenticacao.segredo = 'minha-chave-secreta'"]));
        expect(diags).toHaveLength(1);
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

    it('liquido.autenticacao.propriedadeDesconhecida → warning', () => {
        const diags = validarDelprops(criarDocumento(['liquido.autenticacao.inexistente = verdadeiro']));
        expect(diags).toHaveLength(1);
        expect(diags[0].severity).toBe(1); // Warning
    });

    // ──── namespace desconhecido ────
    it('liquido.namespaceDesconhecido → warning', () => {
        const diags = validarDelprops(criarDocumento(['liquido.algumOutro.prop = valor']));
        expect(diags).toHaveLength(1);
        expect(diags[0].message).toContain('Propriedade ou espaço de nomes desconhecido');
        expect(diags[0].severity).toBe(1); // Warning
    });

    // ──── valores duplos aspas ────
    it('valor com aspas duplas válidas → sem diagnóstico', () => {
        const diags = validarDelprops(criarDocumento(['liquido.roteador.diretorioEstatico = "public"']));
        expect(diags).toHaveLength(0);
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

    it('liquido.dados.bd.host → propriedade removida → warning', () => {
        const diags = validarDelprops(criarDocumento(["liquido.dados.bd.host = 'localhost'"]));
        expect(diags).toHaveLength(1);
        expect(diags[0].severity).toBe(1); // Warning
    });

    it('liquido.dados.bd.usuario → propriedade removida → warning', () => {
        const diags = validarDelprops(criarDocumento(["liquido.dados.bd.usuario = 'admin'"]));
        expect(diags).toHaveLength(1);
        expect(diags[0].severity).toBe(1); // Warning
    });

    // ──── URLs com // não devem ser tratadas como comentário ────
    it("valor com URL contendo '//' → sem diagnóstico (// não é comentário dentro de aspas)", () => {
        const diags = validarDelprops(criarDocumento(["liquido.aplicacao.licenca.url = 'https://designliquido.com.br'"]));
        expect(diags).toHaveLength(0);
    });

    it("valor com URL contendo '//' em aspas duplas → sem diagnóstico", () => {
        const diags = validarDelprops(criarDocumento(['liquido.aplicacao.licenca.url = "https://designliquido.com.br"']));
        expect(diags).toHaveLength(0);
    });

    it("comentário após valor com URL → valor preservado, comentário ignorado", () => {
        const diags = validarDelprops(criarDocumento(["liquido.aplicacao.licenca.url = 'https://designliquido.com.br' // site oficial"]));
        expect(diags).toHaveLength(0);
    });

    it("comentário de linha inteira com URL dentro → linha ignorada", () => {
        const diags = validarDelprops(criarDocumento(["// liquido.aplicacao.licenca.url = 'https://designliquido.com.br'"]));
        expect(diags).toHaveLength(0);
    });
});
