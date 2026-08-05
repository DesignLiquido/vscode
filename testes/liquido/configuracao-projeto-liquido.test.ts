import {
    extrairConfiguracaoProjetoLiquido,
    localizarConfiguracaoProjetoLiquido,
    obterDiretoriosCandidatosConfiguracao,
} from '../../fontes/liquido/configuracao-projeto-liquido';

describe('configuração de projeto Líquido', () => {
    it('lê arquétipo e linguagem Delégua, ignorando comentários', () => {
        const configuracao = extrairConfiguracaoProjetoLiquido(`
            liquido.arquetipo = 'rest'
            liquido.linguagem = "delégua" // comentário
            liquido.roteador.origensCors = 'https://exemplo.com.br'
        `);

        expect(configuracao).toEqual({
            arquetipo: 'rest',
            linguagem: 'delegua',
        });
    });

    it('normaliza Pituguês e preserva o arquétipo MVC', () => {
        const configuracao = extrairConfiguracaoProjetoLiquido(`
            liquido.arquetipo = 'MVC';
            liquido.linguagem = 'pituguês';
        `);

        expect(configuracao).toEqual({
            arquetipo: 'mvc',
            linguagem: 'pitugues',
        });
    });

    it('usa Delégua como linguagem padrão quando a propriedade não existe', () => {
        expect(extrairConfiguracaoProjetoLiquido("liquido.arquetipo = 'rest'"))
            .toEqual({ arquetipo: 'rest', linguagem: 'delegua' });
    });

    it('procura do diretório do arquivo até a raiz do workspace', () => {
        expect(obterDiretoriosCandidatosConfiguracao(
            '/workspace/aplicacao/modelos/usuario.delegua',
            '/workspace'
        )).toEqual([
            '/workspace/aplicacao/modelos',
            '/workspace/aplicacao',
            '/workspace',
        ]);
    });

    it('detecta um projeto pelo marcador para arquivos fora de rotas', async () => {
        const arquivos = new Map([
            [
                '/workspace/configuracao.delprops',
                "liquido.arquetipo = 'mvc'\nliquido.linguagem = 'delegua'",
            ],
        ]);

        const contexto = await localizarConfiguracaoProjetoLiquido(
            '/workspace/modelos/usuario.delegua',
            '/workspace',
            async caminho => arquivos.get(caminho)
        );

        expect(contexto).toEqual({
            raiz: '/workspace',
            caminhoConfiguracao: '/workspace/configuracao.delprops',
            arquetipo: 'mvc',
            linguagem: 'delegua',
        });
    });

    it('não produz falso positivo para uma pasta rotas sem configuracao.delprops', async () => {
        const contexto = await localizarConfiguracaoProjetoLiquido(
            '/workspace/rotas/inicial.delegua',
            '/workspace',
            async () => undefined
        );

        expect(contexto).toBeUndefined();
    });

    it('prioriza o projeto aninhado mais próximo em monorepos', async () => {
        const arquivos = new Map([
            ['/workspace/configuracao.delprops', "liquido.linguagem = 'delegua'"],
            [
                '/workspace/apps/portal/configuracao.delprops',
                "liquido.arquetipo = 'mvc'\nliquido.linguagem = 'pituguês'",
            ],
        ]);

        const contexto = await localizarConfiguracaoProjetoLiquido(
            '/workspace/apps/portal/visoes/inicial.pitu',
            '/workspace',
            async caminho => arquivos.get(caminho)
        );

        expect(contexto?.raiz).toBe('/workspace/apps/portal');
        expect(contexto?.linguagem).toBe('pitugues');
    });
});
