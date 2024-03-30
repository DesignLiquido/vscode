import { PrimitivaOuMetodo } from "./tipos";

export const primitivasTexto: PrimitivaOuMetodo[] = [
    {
        nome: 'aparar',
        assinaturas: [
            {
                formato: 'aparar()',
                parametros: []
            }
        ],
        documentacao: '### Descrição \n \n' +
            'Remover espaços em branco no início e no fim de um texto.' +
            '\n\n ### Exemplo de Código ' +
            '\n\n```var t = "   meu texto com espaços no início e no fim       "```' +
            '\n\n```escreva("|" + t.aparar() + "|") // "|meu texto com espaços no início e no fim|"```' +
            '\n \n ### Formas de uso  \n',
        exemploCodigo: 'texto.aparar()'
    },
    {
        nome: 'apararFim',
        assinaturas: [
            {
                formato: 'apararFim()',
                parametros: []
            }
        ],
        documentacao: '### Descrição \n \n' +
            'Remover espaços em branco no no fim de um texto.' +
            '\n\n ### Exemplo de Código ' +
            '\n\n```var t = "   meu texto com espaços no início e no fim       "```' +
            '\n\n```escreva("|" + t.apararFim() + "|") // "|   meu texto com espaços no início e no fim|"```' +
            '\n \n ### Formas de uso  \n',
        exemploCodigo: 'texto.apararFim()'
    },
    {
        nome: 'apararInicio',
        assinaturas: [
            {
                formato: 'apararInicio()',
                parametros: []
            }
        ],
        documentacao: '### Descrição \n \n' +
            'Remover espaços em branco no início e no fim de um texto.' +
            '\n\n ### Exemplo de Código ' +
            '\n\n```var t = "   meu texto com espaços no início e no fim       "```' +
            '\n\n``` escreva("|" + t.apararInicio() + "|") // "|meu texto com espaços no início e no fim       |"```' +
            '\n \n ### Formas de uso  \n',
        exemploCodigo: 'texto.apararInicio()'
    },
    {
        nome: 'concatenar',
        assinaturas: [
            {
                formato: 'concatenar(outroTexto: texto)',
                parametros: [
                    {
                        nome: 'outroTexto',
                        documentacao: 'O texto a ser concatenado.'
                    }
                ]
            }
        ],
        documentacao: '### Descrição \n \n' +
            'Realiza a junção de palavras/textos.' +
            '\n\n ### Exemplo de Código ' +
            '\n\n```var t1 = "um" ```' +
            '\n\n```var t2 = "dois três"```' +
            '\n\n```escreva(t1.concatenar(t2)) // "umdois três"```' +
            '\n \n ### Formas de uso  \n',
        exemploCodigo: 'texto.concatenar(Outro texto)'
    },
    {
        nome: 'dividir',
        assinaturas: [
            {
                formato: 'dividir(delimitador: texto)',
                parametros: [
                    {
                        nome: 'delimitador',
                        documentacao: 'O delimitador usado para dividir o texto.'
                    }
                ]
            }
        ],
        documentacao: '### Descrição \n \n' +
            'Divide o texto pelo separador passado como parâmetro.' +
            '\n\n ### Exemplo de Código ' +
            '\n\n```var t = "um dois três"```' +
            '\n\n```t.dividir(\' \') // [\'um\',\'dois\',\'três\']```' +
            '\n \n ### Formas de uso  \n',
        exemploCodigo: 'texto.dividir(\'<delimitador (, ; \' \')>\')'
    },
    {
        nome: 'fatiar',
        documentacao: '### Descrição \n \n' +
            'Extrai uma fatia do texto, dadas posições de início e fim.' +
            '\n\n ### Exemplo de Código ' +
            '\n\n```var t = "Um dois três quatro"```' +
            '\n\n```t.fatiar() // "um dois três quatro", ou seja, não faz coisa alguma.```' +
            '\n\n```t.fatiar(2, 7) // "dois"```' +
            '\n\n```t.fatiar(8, 12) // "três"```' +
            '\n\n```t.fatiar(8) // "três quatro", ou seja, seleciona tudo da posição 8 até o final do texto.```' +
            '\n \n ### Formas de uso  \n',
        exemploCodigo: 'texto.fatiar(início,final)\n' +
            'texto.fatiar(a partir da posicao)'
    },
    {
        nome: 'inclui',
        assinaturas: [
            {
                formato: 'inclui(elemento: texto)',
                parametros: [
                    {
                        nome: 'elemento',
                        documentacao: 'O elemento a ser verificado se está contido no texto.'
                    }
                ]
            }
        ],
        documentacao: '### Descrição \n \n' +
            'Devolve verdadeiro se elemento passado por parâmetro está contido no texto, e falso em caso contrário.' +
            '\n\n ### Exemplo de Código ' +
            '\n\n```var t = "um dois três"```' +
            '\n\n```t.inclui("dois") // verdadeiro```' +
            '\n\n```t.inclui("quatro") // falso```' +
            '\n \n ### Formas de uso  \n',
        exemploCodigo: 'texto.inclui(\'palavra\')'
    },
    {
        nome: 'maiusculo',
        assinaturas: [
            {
                formato: 'maiusculo()',
                parametros: []
            }
        ],
        documentacao: '### Descrição \n \n' +
            'Converte todos os caracteres alfabéticos para maiúsculas.' +
            '\n\n ### Exemplo de Código ' +
            '\n\n```var t = "tudo em minúsculo"```' +
            '\n\n```escreva(t.maiusculo()) // "TUDO EM MINÚSCULO"```' +
            '\n \n ### Formas de uso  \n',
        exemploCodigo: 'texto.maiusculo()'
    },
    {
        nome: 'minusculo',
        assinaturas: [
            {
                formato: 'minusculo()',
                parametros: []
            }
        ],
        documentacao: '### Descrição \n \n' +
            'Converte todos os caracteres alfabéticos para minúsculas.' +
            '\n\n ### Exemplo de Código ' +
            '\n\n```var t = "TUDO EM MAIÚSCULO"```' +
            '\n\n```escreva(t.minusculo()) // "tudo em maiúsculo"```' +
            '\n \n ### Formas de uso  \n',
        exemploCodigo: 'texto.minusculo()'
    },
    {
        nome: 'substituir',
        assinaturas: [
            {
                formato: 'substituir(palavraASerSubstituida: texto, novaPalavra: texto)',
                parametros: [
                    {
                        nome: 'palavraASerSubstituida',
                        documentacao: 'A palavra a ser substituída.'
                    },
                    {
                        nome: 'novaPalavra',
                        documentacao: 'A nova palavra que substituirá a palavra anterior.'
                    }
                ]
            }
        ],
        documentacao: '### Descrição \n \n' +
            'Substitui a primeira ocorrência no texto do primeiro parâmetro pelo segundo parâmetro.' +
            '\n\n ### Exemplo de Código ' +
            '\n\n```var t = "Eu gosto de caju"```' +
            '\n\n```t.substituir("caju", "graviola") // Resultado será "Eu gosto de graviola"```' +
            '\n \n ### Formas de uso  \n',
        exemploCodigo: 'texto.substituir(\'palavra a ser substituída\',\'nova palavra\')'
    },
    {
        nome: 'subtexto',
        assinaturas: [
            {
                formato: 'subtexto(inicio: número, fim: número)',
                parametros: [
                    {
                        nome: 'inicio',
                        documentacao: 'A posição de início do texto a ser extraído.'
                    },
                    {
                        nome: 'fim',
                        documentacao: 'A posição de fim do texto a ser extraído.'
                    }
                ]
            }
        ],
        documentacao: '### Descrição \n \n' +
            'Extrai uma fatia do texto, dadas posições de início e fim.' +
            '\n\n ### Exemplo de Código ' +
            '\n\n```var t = "Eu gosto de caju e de graviola"```' +
            '\n\n```t.subtexto(3, 16) // Resultado será "gosto de caju"```' +
            '\n \n ### Formas de uso  \n',
        exemploCodigo: 'texto.subtexto(posição inicial, posição final)'
    },
    {
        nome: 'tamanho',
        assinaturas: [
            {
                formato: 'tamanho()',
                parametros: []
            }
        ],
        documentacao: '### Descrição \n \n' +
            'Devolve um número inteiro com o número de caracteres do texto.' +
            '\n\n ### Exemplo de Código ' +
            '\n\n```var t = "Um dois três quatro"```' +
            '\n\n```t.tamanho() // 19```' +
            '\n \n ### Formas de uso  \n',
        exemploCodigo: 'texto.tamanho()'
    },

];