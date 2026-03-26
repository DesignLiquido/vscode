import { FuncaoNativaOuMetodoPrimitiva } from "../../tipos";

export const primitivasNumeroFormatadas: FuncaoNativaOuMetodoPrimitiva[] = [
    {
        nome: 'absoluto',
        assinaturas: [
            {
                formato: 'absoluto()',
                parametros: []
            }
        ],
        documentacao:
            '# `número.absoluto()`\n\n' +
            'Retorna a versão absoluta de um número, ou seja, seu valor sem sinal.' +
            '\n\n ## Exemplo de Código\n' +
            '\n\n```pitugues\n' +
            'var n = -5\n' +
            'escreva(n.absoluto()) // 5\n```' +
            '\n\n## Formas de uso\n',
        exemploCodigo: 'numero.absoluto()',
    },
    {
        nome: 'arredondar_para_baixo',
        assinaturas: [
            {
                formato: 'arredondar_para_baixo()',
                parametros: []
            }
        ],
        documentacao:
            '# `número.arredondar_para_baixo()`\n\n' +
            'Retira as partes decimais de um número com partes decimais e retorna sua parte inteira. Se o número já é inteiro, devolve apenas o próprio número.' +
            '\n\n ## Exemplo de Código\n' +
            '\n\n```pitugues\n' +
            'var n = 2.5\n' +
            'escreva(n.arredondar_para_baixo()) // 2\n```' +
            '\n\n## Formas de uso\n',
        exemploCodigo: 'numero.arredondar_para_baixo()',
    },
    {
        nome: 'arredondar_para_cima',
        assinaturas: [
            {
                formato: 'arredondar_para_cima()',
                parametros: []
            }
        ],
        documentacao:
            '# `número.arredondar_para_cima()`\n\n' +
            'Arredonda um número com partes decimais para cima, ou seja, para o próximo número inteiro.' +
            '\n\n ## Exemplo de Código\n' +
            '\n\n```pitugues\n' +
            'var n = 2.5\n' +
            'escreva(n.arredondar_para_cima()) // 3\n```' +
            '\n\n## Formas de uso\n',
        exemploCodigo: 'numero.arredondar_para_cima()',
    },
    {
        nome: 'formatar',
        assinaturas: [
            {
                formato: 'formatar(opcoesFormatacao: dicionário)',
                parametros: [
                    {
                        nome: 'opcoesFormatacao',
                        documentacao: 'Dicionário com opções de formatação, como número de casas decimais.'
                    }
                ]
            }
        ],
        documentacao:
            '# `número.formatar(opcoesFormatacao)`\n\n' +
            'Formata um número para o padrão brasileiro, com separador de milhar e vírgula como separador decimal.' +
            '\n\n ## Exemplo de Código\n' +
            '\n\n```pitugues\n' +
            'var n = 1234.56\n' +
            'escreva(n.formatar()) // 1.234,56\n' +
            'escreva(n.formatar({ minimoCasasDecimais: 2, maximoCasasDecimais: 3 })) // 1.234,568\n```' +
            '\n\n## Formas de uso\n',
        exemploCodigo: 'numero.formatar({ maximoCasasDecimais: 2 })',
    },
];
