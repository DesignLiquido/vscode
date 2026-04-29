import { FuncaoNativaOuMetodoPrimitiva } from "../../tipos";

export const funcoesNativasPitugues: FuncaoNativaOuMetodoPrimitiva[] = [
    {
        nome: 'aleatorio',
        assinaturas: [
            {
                formato: 'aleatorio()',
                parametros: []
            }
        ],
        documentacao:
            '### Descrição \n \n' +
            'Retorna um número aleatório entre 0 e 1.' +
            '\n\n ### Exemplo de Código\n' +
            '\n\n```pitugues\nvar numeroAleatorio = aleatorio();' +
            '\n\nescreva(numeroAleatorio); // 0.8540051495195808\n```' +
            '\n \n ### Formas de uso  \n',
        exemploCodigo: 'função aleatorio()',
    },
    {
        nome: 'aleatorioEntre',
        assinaturas: [
            {
                formato: 'aleatorioEntre(minimo: número, maximo: número)',
                parametros: [
                    {
                        nome: 'minimo',
                        documentacao: 'O valor mínimo do intervalo.'
                    },
                    {
                        nome: 'maximo',
                        documentacao: 'O valor máximo do intervalo.'
                    }
                ]
            }
        ],
        documentacao:
            '### Descrição \n \n' +
            'Retorna um número inteiro aleatório entre os valores passados para a função.' +
            '\n\n ### Exemplo de Código\n' +
            '\n\n```pitugues\nvar numeroAleatorio = aleatorioEntre(1, 9);' +
            '\n\nescreva(numeroAleatorio); // Retornará um valor entre 1 e 8.\n```' +
            '\n \n ### Formas de uso  \n',
        exemploCodigo: 'função aleatorioEntre(numero minimo, numero maximo)',
    },
    {
        nome: 'algum',
        assinaturas: [
            {
                formato: 'algum(vetor: vetor, funcaoPesquisa: função)',
                parametros: [
                    {
                        nome: 'vetor',
                        documentacao: 'O vetor a ser pesquisado.'
                    },
                    {
                        nome: 'funcaoPesquisa',
                        documentacao: 'Função que define o critério de pesquisa.'
                    }
                ]
            }
        ],
        documentacao:
            '### Descrição \n \n' +
            'Verifica se pelo menos um elemento do vetor atende ao critério definido pela função de pesquisa.' +
            '\n\n ### Exemplo de Código\n' +
            '\n\n```pitugues\nvar numeros = [1, 2, 3, 4, 5];\nvar resultado = algum(numeros, funcao(x) { retorna x > 3; });' +
            '\nescreva(resultado); // verdadeiro\n```' +
            '\n \n ### Formas de uso  \n',
        exemploCodigo: 'função algum(vetor, funcaoPesquisa)',
    },
    {
        nome: 'escreva',
        assinaturas: [
            {
                formato: 'escreva(...valores: qualquer)',
                parametros: [
                    {
                        nome: 'valores',
                        documentacao: 'Os valores a serem escritos.'
                    }
                ]
            }
        ],
        documentacao:
            '### Descrição \n \n' +
            'Escreve valores na saída padrão.' +
            '\n\n ### Exemplo de Código\n' +
            '\n\n```pitugues\nescreva("Olá", "mundo"); // Olá mundo\n```' +
            '\n \n ### Formas de uso  \n',
        exemploCodigo: 'função escreva(...valores)',
    },
    {
        nome: 'algum',
        assinaturas: [
            {
                formato: 'algum(vetor: vetor, funcaoPesquisa: função)',
                parametros: [
                    {
                        nome: 'vetor',
                        documentacao: 'O vetor a ser pesquisado.'
                    },
                    {
                        nome: 'funcaoPesquisa',
                        documentacao: 'Função que define o critério de pesquisa.'
                    }
                ]
            }
        ],
        documentacao:
            '### Descrição \n \n' +
            'Verifica se pelo menos um elemento do vetor atende ao critério definido pela função de pesquisa.' +
            '\n\n ### Exemplo de Código\n' +
            '\n\n```pitugues\nvar numeros = [1, 2, 3, 4, 5];\nvar resultado = algum(numeros, funcao(x) { retorna x > 3; });' +
            '\nescreva(resultado); // verdadeiro\n```' +
            '\n \n ### Formas de uso  \n',
        exemploCodigo: 'função algum(vetor, funcaoPesquisa)',
    },
    {
        nome: 'arredondar',
        assinaturas: [
            {
                formato: 'arredondar(numero: número, casasDecimais?: número)',
                parametros: [
                    {
                        nome: 'numero',
                        documentacao: 'O número a ser arredondado.'
                    },
                    {
                        nome: 'casasDecimais',
                        documentacao: 'Número de casas decimais (opcional).'
                    }
                ]
            }
        ],
        documentacao:
            '### Descrição \n \n' +
            'Arredonda um número para o número especificado de casas decimais.' +
            '\n\n ### Exemplo de Código\n' +
            '\n\n```pitugues\nvar n = 1.23456;\nescreva(arredondar(n, 2)); // 1.23\n```' +
            '\n \n ### Formas de uso  \n',
        exemploCodigo: 'função arredondar(numero, casasDecimais?)',
    },
    {
        nome: 'tamanho',
        assinaturas: [
            {
                formato: 'tamanho(objeto: qualquer)',
                parametros: [
                    {
                        nome: 'objeto',
                        documentacao: 'O objeto cujo tamanho será retornado.'
                    }
                ]
            }
        ],
        documentacao:
            '### Descrição \n \n' +
            'Retorna o tamanho de um vetor, texto ou dicionário.' +
            '\n\n ### Exemplo de Código\n' +
            '\n\n```pitugues\nvar v = [1, 2, 3];\nescreva(tamanho(v)); // 3\n```' +
            '\n \n ### Formas de uso  \n',
        exemploCodigo: 'função tamanho(objeto)',
    },
    {
        nome: 'inteiro',
        assinaturas: [
            {
                formato: 'inteiro(valor: flutuante ou texto)',
                parametros: [
                    {
                        nome: 'valor',
                        documentacao: 'O valor a ser convertido em número inteiro.'
                    }
                ]
            }
        ],
        documentacao:
            '### Descrição \n \n' +
            'Converte um número flutuante, ou texto, que não apresente letras, em um número inteiro.' +
            '\n\n ### Exemplo de Código\n' +
            '\n\n```delegua\nvar testeTexto = "111";' +
            '\n\nescreva(111 + inteiro(testeTexto)); // 222\n```' +
            '\n \n ### Formas de uso  \n',
        exemploCodigo: 'função inteiro("123")',
    },
    {
        nome: 'escreva',
        assinaturas: [
            {
                formato: 'escreva(...argumentos: qualquer)',
                parametros: [
                    {
                        nome: '...argumentos',
                        documentacao:
                            'Os argumentos para impressão, que podem ser literais, constantes ou variáveis de qualquer tipo.',
                    },
                ],
            },
        ],
        documentacao:
            '# `escreva()`\n' +
            'Escreve um ou mais argumentos na saída padrão da aplicação.\n' +
            '## Interpolação \n' +
            'Pituguês suporta interpolação de variáveis: \n\n' +
            "```pitugues\ncomidaFavorita = 'strogonoff'\n" +
            'escreva("Minha comida favorita é ${comidaFavorita}")\n```' +
            '\n\n ### Formas de uso \n',
        exemploCodigo: 'escreva(...argumentos)',
    },
    {
          nome: 'imprima',
        assinaturas: [
            {
                formato: 'imprima(...argumentos: qualquer)',
                parametros: [
                    {
                        nome: '...argumentos',
                        documentacao:
                            'Os argumentos para impressão, que podem ser literais, constantes ou variáveis de qualquer tipo.',
                    },
                ],
            },
        ],
        documentacao:
            '# `imprima()`\n' +
            'Escreve um ou mais argumentos na saída padrão da aplicação.\n' +
            '## Interpolação \n' +
            'Pituguês suporta interpolação de variáveis: \n\n' +
            "```pitugues\ncomidaFavorita = 'strogonoff'\n" +
            'imprima("Minha comida favorita é ${comidaFavorita}")\n```' +
            '\n\n ### Formas de uso \n',
        exemploCodigo: 'imprima(...argumentos)',
    }
]
