import { FuncaoNativaOuMetodoPrimitiva } from "./tipos";

export const funcoesNativasDelegua: FuncaoNativaOuMetodoPrimitiva[] = [
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
            '\n\n```delegua\nvar numeroAleatorio = aleatorio();' +
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
            '\n\n```delegua\nvar numeroAleatorio = aleatorioEntre(1, 9);' +
            '\n\nescreva(numeroAleatorio); // Retornará um valor entre 1 e 8.\n```' +
            '\n \n ### Formas de uso  \n',
        exemploCodigo: 'função aleatorioEntre(numero minimo, numero maximo)',
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
            'Delégua suporta interpolação de variáveis: \n\n' +
            "```delegua\nvar comidaFavorita = 'strogonoff'\n" +
            'escreva("Minha comida favorita é ${comidaFavorita}")\n```' +
            '\n\n ### Formas de uso \n',
        exemploCodigo: 'função escreva(...argumentos)',
    },
    {
        nome: 'filtrarPor',
        assinaturas: [
            {
                formato: 'filtrarPor(meuVetor: vetor, minhaFuncaoParaValidar: função)',
                parametros: [
                    {
                        nome: 'meuVetor',
                        documentacao: 'O vetor a ser filtrado.'
                    },
                    {
                        nome: 'minhaFuncaoParaValidar',
                        documentacao: 'A função de validação que retorna verdadeiro ou falso.'
                    }
                ]
            }
        ],
        documentacao:
            '### Descrição \n \n' +
            'Retorna uma lista de elementos filtrados de um vetor.' +
            '\n\n ### Exemplo de Código\n' +
            '\n\n```delegua\nvar listaDeIdades = [91, 32, 15, 44, 12, 18, 101];' +
            '\n funcao checarIdade(idade) { retorna(idade >= 18); }' +
            '\n escreva(filtrarPor(listaDeIdades, checarIdade)); // [91, 32, 44, 18, 101]' +
            '\n\n ```' +
            '\n\n ### Formas de uso  \n',
        exemploCodigo: 'função filtrarPor(meuVetor, minhaFuncaoParaValidar)',
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
        nome: 'leia',
        assinaturas: [
            {
                formato: 'leia(orientação: texto)',
                parametros: [
                    {
                        nome: 'orientação',
                        documentacao: 'O texto a ser exibido para o usuário, indicando o que ele deve digitar.'
                    }
                ]
            }
        ],
        documentacao:
            '# `leia()`\n' +
            '### Descrição \n \n' +
            'Lê um valor do usuário, a partir da entrada padrão, e o retorna como texto.' +
            '\n\n ### Exemplo de Código\n' +
            '\n\n```delegua\nvar nome = leia("Digite seu nome: ");' +
            '\n\nescreva("Olá, ${nome}!");\n```' +
            '\n \n ### Formas de uso  \n',
        exemploCodigo: 'função leia("Digite seu nome: ")',       
    },
    {
        nome: 'numero',
        assinaturas: [
            {
                formato: 'numero(valor: inteiro ou texto)',
                parametros: [
                    {
                        nome: 'valor',
                        documentacao: 'O valor a ser convertido em número (real, ou com porção decimal).'
                    }
                ]
            }
        ],
        documentacao:
            '### Descrição \n \n' +
            'Converte um número inteiro, ou texto, que não apresente letras, em um número com porção decimal.' +
            '\n\n ### Exemplo de Código\n' +
            '\n\n```delegua\nvar testeTexto = "111.11";' +
            '\n\nescreva(111 + numero(testeTexto)); // 222.11\n```' +
            '\n \n ### Formas de uso  \n',
        exemploCodigo: 'função numero("123.45")',
    },
    {
        nome: 'número',
        assinaturas: [
            {
                formato: 'número(valor: inteiro ou texto)',
                parametros: [
                    {
                        nome: 'valor',
                        documentacao: 'O valor a ser convertido em número (real, ou com porção decimal).'
                    }
                ]
            }
        ],
        documentacao:
            '### Descrição \n \n' +
            'Converte um número inteiro, ou texto, que não apresente letras, em um número com porção decimal.' +
            '\n\n ### Exemplo de Código\n' +
            '\n\n```delegua\nvar testeTexto = "111.11";' +
            '\n\nescreva(111 + número(testeTexto)); // 222.11\n```' +
            '\n \n ### Formas de uso  \n',
        exemploCodigo: 'função número("123.45")',
    },
    {
        nome: 'real',
        assinaturas: [
            {
                formato: 'real(valor: inteiro ou texto)',
                parametros: [
                    {
                        nome: 'valor',
                        documentacao: 'O valor a ser convertido em número flutuante.'
                    }
                ]
            }
        ],
        documentacao:
            '### Descrição \n \n' +
            'Converte um número inteiro ou texto, que não apresente letras, em um número flutuante.' +
            '\n\n ### Exemplo de Código\n' +
            '\n\n```delegua\nvar testeTexto = "504.69";' +
            '\n\nescreva(0.01 + real(testeTexto)); // 504.7\n```' +
            '\n \n ### Formas de uso  \n',
        exemploCodigo: 'função real(texto)',
    },
    {
        nome: 'texto',
        assinaturas: [
            {
                formato: 'texto(valor: qualquer)',
                parametros: [
                    {
                        nome: 'valor',
                        documentacao: 'O valor a ser convertido em texto.'
                    }
                ]
            }
        ],
        documentacao:
            '### Descrição \n \n' +
            'Converte qualquer valor em um texto.' +
            '\n\n ### Exemplo de Código\n' +
            '\n\n```delegua\nvar testeNumero = 504.69;' +
            '\n\nescreva(texto(testeTexto)); // 504.69\n```' +
            '\n \n ### Formas de uso  \n',
        exemploCodigo: 'função texto(qualquer)',
    },
];
