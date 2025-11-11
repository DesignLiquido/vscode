import { FuncaoNativaOuMetodoPrimitiva } from "./tipos";

const parametrosTodasPrimitivas = [
    {
        nome: 'requisicao',
        documentacao: 'Dados da requisição, providos por Liquido.'
    },
    {
        nome: 'resposta',
        documentacao: 'Dados a serem retornados como resposta à requisição.'
    }
];

export const primitivasMetodosLiquido: FuncaoNativaOuMetodoPrimitiva[] = [
    {
        nome: 'rotaGet',
        assinaturas: [
            {
                formato: 'rotaGet(requisicao, resposta)',
                parametros: parametrosTodasPrimitivas
            }
        ],
        documentacao: '# `liquido.rotaGet(requisicao, resposta)`\n\n' +
            'Especifica uma rota GET, normalmente uma rota somente leitura, com parâmetros de pesquisa.' +
            '\n\n ## Exemplo de Código\n' +
            '\n\n```delegua\n' +
            'liquido.rotaGet(requisicao, resposta) {\n' +
            '    resposta.enviar("Olá mundo").status(200)\n' +
            '}\n```' +
            '\n\n## Formas de uso\n',
        exemploCodigo: 'liquido.rotaGet(requisicao, resposta) { ... }'
    },
    {
        nome: 'rotaPost',
        assinaturas: [
            {
                formato: 'rotaPost(requisicao, resposta)',
                parametros: parametrosTodasPrimitivas
            }
        ],
        documentacao: '# `liquido.rotaPost(requisicao, resposta)`\n\n' +
            'Especifica uma rota POST, normalmente uma rota para inclusão de dados, em que `requisicao.corpo` possui dados.' +
            '\n\n ## Exemplo de Código\n' +
            '\n\n```delegua\n' +
            'liquido.rotaPost(requisicao, resposta) {\n' +
            '    resposta.enviar("${requisicao.corpo}").status(200)\n' +
            '}\n```' +
            '\n\n## Formas de uso\n',
        exemploCodigo: 'liquido.rotaPost(requisicao, resposta) { ... }'
    }
];

export const objetosEmRotaLiquido: FuncaoNativaOuMetodoPrimitiva[] = [
    {
        nome: 'requisicao',
        assinaturas: [
            {
                formato: 'requisicao',
                parametros: parametrosTodasPrimitivas
            }
        ],
        documentacao: '# Objeto `requisicao`\n\n' +
            'Representa todos os dados já conhecidos da requisição, que podem ser usados para lógicas dentro do processamento da rota.' +
            '\n\n ## Exemplo de Código\n' +
            '\n\n```delegua\n' +
            'liquido.rotaPost(requisicao, resposta) {\n' +
            '    resposta.enviar("${requisicao.corpo}").status(200)\n' +
            '}\n```' +
            '\n\n## Formas de uso\n',
        exemploCodigo: 'requisicao.parametros\nrequisicao.corpo'
    },
    {
        nome: 'resposta',
        assinaturas: [
            {
                formato: 'resposta',
                parametros: parametrosTodasPrimitivas
            }
        ],
        documentacao: '# Objeto `resposta`\n\n' +
            'Representa todos os dados a serem usados para responder à requisição, que podem ser modificados por lógicas dentro do processamento da rota.' +
            '\n\n ## Exemplo de Código\n' +
            '\n\n```delegua\n' +
            'liquido.rotaPost(requisicao, resposta) {\n' +
            '    resposta.enviar("${requisicao.corpo}").status(200)\n' +
            '}\n```' +
            '\n\n## Formas de uso\n',
        exemploCodigo: 'resposta.enviar("Esta é uma resposta por texto")\nresposta.status(200)'
    }
];