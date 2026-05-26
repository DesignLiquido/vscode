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

export const metodosRespostaLiquido: FuncaoNativaOuMetodoPrimitiva[] = [
    {
        nome: 'status',
        assinaturas: [{ formato: 'status(codigo)', parametros: [{ nome: 'codigo', documentacao: 'Código de status HTTP (ex: 200, 404, 500).' }] }],
        documentacao: '# `resposta.status(codigo)`\n\nDefine o código de status HTTP da resposta. Pode ser encadeado com outros métodos.',
        exemploCodigo: 'resposta.enviar("OK").status(200)'
    },
    {
        nome: 'enviar',
        assinaturas: [{ formato: 'enviar(texto)', parametros: [{ nome: 'texto', documentacao: 'Texto da resposta.' }] }],
        documentacao: '# `resposta.enviar(texto)`\n\nEnvia uma resposta em texto plano.',
        exemploCodigo: 'resposta.enviar("Olá mundo")'
    },
    {
        nome: 'json',
        assinaturas: [{ formato: 'json(dados)', parametros: [{ nome: 'dados', documentacao: 'Objeto a serializar como JSON.' }] }],
        documentacao: '# `resposta.json(dados)`\n\nEnvia uma resposta JSON.',
        exemploCodigo: 'resposta.json({ chave: "valor" })'
    },
    {
        nome: 'lmht',
        assinaturas: [{ formato: 'lmht(conteudo)', parametros: [{ nome: 'conteudo', documentacao: 'Conteúdo HTML a enviar.' }] }],
        documentacao: '# `resposta.lmht(conteudo)`\n\nEnvia uma resposta HTML.',
        exemploCodigo: 'resposta.lmht("<html><body>Olá</body></html>")'
    },
    {
        nome: 'redirecionar',
        assinaturas: [{ formato: 'redirecionar(caminho)', parametros: [{ nome: 'caminho', documentacao: 'Caminho para redirecionar.' }] }],
        documentacao: '# `resposta.redirecionar(caminho)`\n\nRedireciona a requisição para outro caminho.',
        exemploCodigo: 'resposta.redirecionar("/outro-caminho")'
    },
    {
        nome: 'cabecalho',
        assinaturas: [{ formato: 'cabecalho(nome, valor)', parametros: [{ nome: 'nome', documentacao: 'Nome do cabeçalho HTTP.' }, { nome: 'valor', documentacao: 'Valor do cabeçalho.' }] }],
        documentacao: '# `resposta.cabecalho(nome, valor)`\n\nDefine um cabeçalho HTTP na resposta. Pode ser encadeado.',
        exemploCodigo: 'resposta.cabecalho("Content-Type", "text/plain")'
    },
    {
        nome: 'cookie',
        assinaturas: [{ formato: 'cookie(nome, valor)', parametros: [{ nome: 'nome', documentacao: 'Nome do cookie.' }, { nome: 'valor', documentacao: 'Valor do cookie.' }] }],
        documentacao: '# `resposta.cookie(nome, valor)`\n\nDefine um cookie na resposta. Pode ser encadeado.',
        exemploCodigo: 'resposta.cookie("sessao", "token123")'
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