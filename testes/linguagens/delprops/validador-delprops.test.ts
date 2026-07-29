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
        expect(diags[0].severity).toBe(0);
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

    it('namespace não-liquido → nenhum diagnóstico', () => {
        const diags = validarDelprops(criarDocumento(['outro.namespace.prop = valor']));
        expect(diags).toHaveLength(0);
    });

    it('propriedade desconhecida → aviso', () => {
        const diags = validarDelprops(criarDocumento(['liquido.roteador.propriedadeDesconhecida = verdadeiro']));
        expect(diags).toHaveLength(1);
        expect(diags[0].message).toContain('Propriedade');
        expect(diags[0].message).toContain('desconhecida');
        expect(diags[0].severity).toBe(1);
    });

    it('tipo incorreto → erro', () => {
        const diags = validarDelprops(criarDocumento(['liquido.roteador.diretorioEstatico = 42']));
        expect(diags).toHaveLength(1);
        expect(diags[0].message).toContain('Tipo esperado');
        expect(diags[0].severity).toBe(0);
    });

    it('valor não permitido → erro', () => {
        const diags = validarDelprops(criarDocumento(["liquido.autenticacao.tecnologia = 'session'"]));
        expect(diags).toHaveLength(1);
        expect(diags[0].message).toContain('não está entre os permitidos');
        expect(diags[0].severity).toBe(0);
    });

    it('propriedade válida → sem diagnóstico', () => {
        const diags = validarDelprops(criarDocumento(['liquido.roteador.cors = verdadeiro']));
        expect(diags).toHaveLength(0);
    });

    it('liquido.verboso → aviso propriedade desconhecida', () => {
        const diags = validarDelprops(criarDocumento(['liquido.verboso = verdadeiro']));
        expect(diags).toHaveLength(1);
        expect(diags[0].message).toContain('desconhecida');
        expect(diags[0].severity).toBe(1);
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
        expect(diags[0].severity).toBe(0);
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
        expect(diags[0].severity).toBe(1);
    });

    it('liquido.roteador.diretorioEstatico com valor sem aspas → erro tipo não reconhecido', () => {
        const diags = validarDelprops(criarDocumento(['liquido.roteador.diretorioEstatico = valor_sem_aspas']));
        expect(diags).toHaveLength(1);
        expect(diags[0].message).toContain('não corresponde a nenhum tipo conhecido');
    });

    it('liquido.dados.bd.porta com número → sem diagnóstico', () => {
        const diags = validarDelprops(criarDocumento(['liquido.dados.bd.porta = 5432']));
        expect(diags).toHaveLength(0);
    });

    it('liquido.dados.bd.tecnologia com sqlite → sem diagnóstico', () => {
        const diags = validarDelprops(criarDocumento(["liquido.dados.bd.tecnologia = 'sqlite'"]));
        expect(diags).toHaveLength(0);
    });

    it('liquido.dados.bd.tecnologia com valor não permitido → erro', () => {
        const diags = validarDelprops(criarDocumento(["liquido.dados.bd.tecnologia = 'cassandra'"]));
        expect(diags).toHaveLength(1);
        expect(diags[0].message).toContain('não está entre os permitidos');
        expect(diags[0].severity).toBe(0);
    });

    it('liquido.dados.bd.autoInicializar com lógico → sem diagnóstico', () => {
        const diags = validarDelprops(criarDocumento(['liquido.dados.bd.autoInicializar = verdadeiro']));
        expect(diags).toHaveLength(0);
    });

    it('liquido.dados.bd.arquivoInicializacao com texto → sem diagnóstico', () => {
        const diags = validarDelprops(criarDocumento(["liquido.dados.bd.arquivoInicializacao = 'init.lincones'"]));
        expect(diags).toHaveLength(0);
    });

    it('liquido.dados.bd.tecnologia com tipo errado → erro de tipo', () => {
        const diags = validarDelprops(criarDocumento(['liquido.dados.bd.tecnologia = 5432']));
        expect(diags).toHaveLength(1);
        expect(diags[0].message).toContain('Tipo esperado');
    });

    it('liquido.dados.bd.host com texto → sem diagnóstico', () => {
        const diags = validarDelprops(criarDocumento(["liquido.dados.bd.host = 'localhost'"]));
        expect(diags).toHaveLength(0);
    });

    it('liquido.dados.bd.usuario com texto → sem diagnóstico', () => {
        const diags = validarDelprops(criarDocumento(["liquido.dados.bd.usuario = 'admin'"]));
        expect(diags).toHaveLength(0);
    });

    it('liquido.autenticacao.tecnologia com jwt → sem diagnóstico', () => {
        const diags = validarDelprops(criarDocumento(["liquido.autenticacao.tecnologia = 'jwt'"]));
        expect(diags).toHaveLength(0);
    });

    it('liquido.autenticacao.tecnologia com session → erro valor não permitido', () => {
        const diags = validarDelprops(criarDocumento(["liquido.autenticacao.tecnologia = 'session'"]));
        expect(diags).toHaveLength(1);
        expect(diags[0].message).toContain("'session'");
        expect(diags[0].severity).toBe(0);
    });

    it('liquido.autenticacao.tecnologia com oauth → erro valor não permitido', () => {
        const diags = validarDelprops(criarDocumento(["liquido.autenticacao.tecnologia = 'oauth'"]));
        expect(diags).toHaveLength(1);
        expect(diags[0].message).toContain("'oauth'");
    });

    it('liquido.autenticacao.propriedadeDesconhecida → aviso', () => {
        const diags = validarDelprops(criarDocumento(['liquido.autenticacao.inexistente = verdadeiro']));
        expect(diags).toHaveLength(1);
        expect(diags[0].message).toContain('desconhecida');
        expect(diags[0].severity).toBe(1);
    });

    it('liquido.namespaceDesconhecido → aviso propriedade desconhecida', () => {
        const diags = validarDelprops(criarDocumento(['liquido.algumOutro.prop = valor']));
        expect(diags).toHaveLength(1);
        expect(diags[0].message).toContain('desconhecida');
        expect(diags[0].message).toContain('liquido');
        expect(diags[0].severity).toBe(1);
    });

    it('aspas duplas → erro tipo não reconhecido', () => {
        const diags = validarDelprops(criarDocumento(['liquido.roteador.diretorioEstatico = "public"']));
        expect(diags).toHaveLength(1);
        expect(diags[0].message).toContain('não corresponde a nenhum tipo conhecido');
    });

    it('URL com // em aspas simples → sem diagnóstico', () => {
        const diags = validarDelprops(criarDocumento(["liquido.aplicacao.licenca.url = 'https://designliquido.com.br'"]));
        expect(diags).toHaveLength(0);
    });

    it('URL com // em aspas duplas → erro tipo não reconhecido', () => {
        const diags = validarDelprops(criarDocumento(['liquido.aplicacao.licenca.url = "https://designliquido.com.br"']));
        expect(diags).toHaveLength(1);
        expect(diags[0].message).toContain('não corresponde a nenhum tipo conhecido');
    });

    it('comentário inline após valor com URL → comentário ignorado, valor preservado', () => {
        const diags = validarDelprops(criarDocumento(["liquido.aplicacao.licenca.url = 'https://designliquido.com.br' // site oficial"]));
        expect(diags).toHaveLength(0);
    });

    it('comentário de linha inteira com URL → linha ignorada', () => {
        const diags = validarDelprops(criarDocumento(["// liquido.aplicacao.licenca.url = 'https://designliquido.com.br'"]));
        expect(diags).toHaveLength(0);
    });

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

    it('múltiplos erros → conta corretamente', () => {
        const diags = validarDelprops(criarDocumento([
            'linha-sem-igual',
            'liquido.roteador.cors = verdadeiro',
            'outra-sem-igual',
        ]));
        expect(diags).toHaveLength(2);
    });

    it('diagnósticos combinados (parse + avisos + validação)', () => {
        const diags = validarDelprops(criarDocumento([
            "liquido.roteador.porta = 'texto'",
            'linha-invalida',
            'liquido.roteador.desconhecida = verdadeiro',
        ]));
        expect(diags.length).toBeGreaterThanOrEqual(2);
        const temErroParse = diags.filter(d => d.severity === 0).some(d => d.message.includes('separador'));
        const temAviso = diags.filter(d => d.severity === 1).some(d => d.message.includes('desconhecida'));
        expect(temErroParse).toBe(true);
        expect(temAviso).toBe(true);
    });

    it('várias linhas com comentários → sem diagnóstico', () => {
        const diags = validarDelprops(criarDocumento([
            '// Configuração do roteador',
            "liquido.roteador.cors = verdadeiro",
            "liquido.roteador.helmet = verdadeiro",
            '',
            "liquido.autenticacao.tecnologia = 'jwt'",
        ]));
        expect(diags).toHaveLength(0);
    });

    it('liquido.dados.bd.tecnologia com mysql → sem diagnóstico', () => {
        const diags = validarDelprops(criarDocumento(["liquido.dados.bd.tecnologia = 'mysql'"]));
        expect(diags).toHaveLength(0);
    });
});
