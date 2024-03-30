import { PrimitivaOuMetodo } from "./tipos";

export const metodosBibliotecaGlobal: PrimitivaOuMetodo[] = [
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
            'Delégua suporta interpolação de variáveis: \n \n' +
            "```delegua\nvar comidaFavorita = 'strogonoff'\n" +
            'escreva("Minha comida favorita é ${comidaFavorita}")\n```' +
            '\n \n ### Formas de uso  \n',
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
            '\n\n ### Exemplo de Código ' +
            '\n\n```delegua\nvar listaDeIdades = [91, 32, 15, 44, 12, 18, 101];' +
            '\n funcao checarIdade(idade) { retorna(idade >= 18); }' +
            '\n escreva(filtrarPor(listaDeIdades, checarIdade)); // [91, 32, 44, 18, 101]' +
            +'\n\n ```' +
            '\n \n ### Formas de uso  \n',
        exemploCodigo: 'função filtrarPor(meuVetor, minhaFuncaoParaValidar)',
    },
    {
        nome: 'texto',
        assinaturas: [
            {
                formato: 'texto(numero: número)',
                parametros: [
                    {
                        nome: 'numero',
                        documentacao: 'O número a ser convertido em texto.'
                    }
                ]
            }
        ],
        documentacao:
            '# Descrição \n \n' +
            'Transforma números flutuantes ou inteiros em texto.' +
            '\n\n ### Exemplo de Código ' +
            '\n\n```delegua\ntexto(7)\n```' +
            '\n \n ### Formas de uso  \n',
        exemploCodigo: 'função texto(1234)'

    },
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
            '\n\n ### Exemplo de Código ' +
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
                        documentacao: 'O valor máximo do intervalo (não incluído no resultado).'
                    }
                ]
            }
        ],
        documentacao:
            '### Descrição \n \n' +
            'Retorna um número inteiro aleatório entre os valores passados para a função.' +
            '\n\n ### Exemplo de Código ' +
            '\n\n```delegua\nvar numeroAleatorio = aleatorioEntre(1, 9);' +
            '\n\nescreva(numeroAleatorio); // Retornará um valor entre 1 e 8.\n```' +
            '\n \n ### Formas de uso  \n',
        exemploCodigo: 'função aleatorioEntre(numero minimo, numero maximo)',
    },
    {
        nome: 'inteiro',
        assinaturas: [
            {
                formato: 'inteiro(numero: número ou texto)',
                parametros: [
                    {
                        nome: 'numero',
                        documentacao: 'O número flutuante ou texto a ser convertido em um número inteiro.'
                    }
                ]
            }
        ],
        documentacao:
            '### Descrição \n \n' +
            'Converte um número flutuante ou texto, que não apresente letras, em um número inteiro.' +
            '\n\n ### Exemplo de Código ' +
            '\n\n```delegua\nvar testeTexto = "111";' +
            '\n\nescreva(111 + inteiro(testeTexto)); // 222\n```' +
            '\n \n ### Formas de uso  \n',
        exemploCodigo: 'função inteiro("123")',
    },
    {
        nome: 'real',
        assinaturas: [
            {
                formato: 'real(texto: texto ou número)',
                parametros: [
                    {
                        nome: 'texto',
                        documentacao: 'O texto ou número inteiro a ser convertido em um número flutuante.'
                    }
                ]
            }
        ],
        documentacao:
            '### Descrição \n \n' +
            'Converte um número inteiro ou texto, que não apresente letras, em um número flutuante.' +
            '\n\n ### Exemplo de Código ' +
            '\n\n```delegua\nvar testeTexto = "504.69";' +
            '\n\nescreva(0.01 + real(testeTexto)); // 504.7\n```' +
            '\n \n ### Formas de uso  \n',
        exemploCodigo: 'função real(texto)',
    },
];
