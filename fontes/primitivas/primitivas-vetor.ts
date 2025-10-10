import { PrimitivaOuMetodo } from "./tipos";

export const primitivasVetor: PrimitivaOuMetodo[] = [
    {
        nome: 'adicionar',
        assinaturas: [
            {
                formato: 'adicionar(...elemento: qualquer)',
                parametros: [
                    {
                        nome: 'elemento',
                        documentacao: 'Os elementos a serem adicionados ao vetor.'
                    }
                ]
            }
        ],
        documentacao: '### Descrição \n \n' +
            'Adiciona um ou mais elementos em um vetor.' +
            '\n\n ### Exemplo de Código\n' +
            '```delegua\nv.adicionar(7)\n' +
            'v.adicionar(5)\n' +
            'v.adicionar(3)\n' +
            'escreva(v) // [7, 5, 3]\n```' +
            '\n\n ### Formas de uso  \n',
        exemploCodigo: 'vetor.adicionar(elemento)'
    },
    {
        nome: 'concatenar',
        assinaturas: [
            {
                formato: 'concatenar(...elementos: qualquer)',
                parametros: [
                    {
                        nome: 'elementos',
                        documentacao: 'Os elementos a serem concatenados ao vetor.'
                    }
                ]
            }
        ],
        documentacao: '### Descrição \n \n' +
            'Adiciona ao conteúdo do vetor um ou mais elementos' +
            '\n\n ### Exemplo de Código\n' +
            '\n\n```delegua\nvar v = [7, 5, 3]\n' +
            'escreva(v.concatenar([1, 2, 4])) // [7, 5, 3, 1, 2, 4]\n```' +
            '\n\n ### Formas de uso  \n',
        exemploCodigo: 'vetor.concatenar(...argumentos)'
    },
    {
        nome: 'empilhar',
        assinaturas: [
            {
                formato: 'empilhar(elemento: qualquer)',
                parametros: [
                    {
                        nome: 'elemento',
                        documentacao: 'O elemento a ser adicionado ao final do vetor.'
                    }
                ]
            }
        ],
        documentacao: '### Descrição \n \n' +
            'Adiciona um elemento ao final do vetor, como se o vetor fosse uma pilha na vertical.' +
            '\n\n ### Exemplo de Código\n' +
            '\n\n```delegua\nvar v = []\n' +
            'v.empilhar(7)\n' +
            'v.empilhar(5)\n' +
            'v.empilhar(3)\n' +
            'escreva(v) // [7, 5, 3]\n```' +
            '\n\n ### Formas de uso \n',
        exemploCodigo: 'vetor.empilhar(conteúdo)'
    },
    {
        nome: 'fatiar',
        assinaturas: [
            {
                formato: 'fatiar(inicio?: número, fim?: número)',
                parametros: [
                    {
                        nome: 'inicio',
                        documentacao: 'A posição de início do vetor a ser fatiado. Se não fornecido, retorna o vetor inteiro.'
                    },
                    {
                        nome: 'fim',
                        documentacao: 'A posição de fim do vetor a ser fatiado.'
                    }
                ]
            }
        ],
        documentacao: '### Descrição \n \n' +
            'Extrai uma fatia do vetor, dadas posições de início e fim. \n' +
            '\n\n ### Exemplo de Código\n' +
            '\n\n```delegua\nvar v = [1, 2, 3, 4, 5]\n' +
            'escreva(v.fatiar()) // "[1, 2, 3, 4, 5]", ou seja, não faz coisa alguma.\n' +
            'escreva(v.fatiar(2, 4)) // "[3, 4]"\n' +
            'escreva(v.fatiar(2)) // "[3, 4, 5]", ou seja, seleciona tudo da posição 3 até o final do vetor.\n```' +
            '\n\n ### Formas de uso \n' +
            'Fatiar suporta sobrecarga do método.\n\n',
        exemploCodigo: 'vetor.fatiar(<a partir desta posição>)\n' +
            'vetor.fatiar(<a partir desta posição>, <até esta posição>)'
    },
    {
        nome: 'inclui',
        assinaturas: [
            {
                formato: 'inclui(elemento: qualquer)',
                parametros: [
                    {
                        nome: 'elemento',
                        documentacao: 'O elemento a ser verificado se está presente no vetor.'
                    }
                ]
            }
        ],
        documentacao:
            '### Descrição \n \n' +
            'Verifica se o elemento existe no vetor. Devolve verdadeiro se existe, e falso em caso contrário. \n' +
            '\n\n ### Exemplo de Código\n' +
            '\n\n```delegua\nvar v = [1, 2, 3]\n' +
            'escreva(v.inclui(2)) // verdadeiro\n' +
            'escreva(v.inclui(4)) // falso\n```' +
            '\n\n ### Formas de uso \n',
        exemploCodigo: 'vetor.inclui(elemento)'
    },
    {
        nome: 'inverter',
        assinaturas: [
            {
                formato: 'inverter()',
                parametros: []
            }
        ],
        documentacao: '### Descrição \n \n' +
            'Inverte a ordem dos elementos de um vetor.\n' +
            '\n\n ### Exemplo de Código\n' +
            '\n\n```delegua\nvar v = [1, 2, 3]\n' +
            'escreva(v.inverter()) // [3, 2, 1]\n```' +
            '\n\n ### Formas de uso \n',
        exemploCodigo: 'vetor.inverter()'
    },
    {
        nome: 'ordenar',
        assinaturas: [
            {
                formato: 'ordenar()',
                parametros: []
            }
        ],
        documentacao: '### Descrição \n \n' +
            'Ordena valores de um vetor em ordem crescente.\n' +
            '\n\n ### Exemplo de Código\n' +
            '\n\n```delegua\n// A ordenação padrão é ascendente, ou seja, para o caso de números, a ordem fica do menor para o maior.\n' +
            'var v = [4, 2, 12, 5]\n' +
            'escreva(v.ordenar()) // [2, 4, 5, 12]\n' +
            '// Para o caso de textos, a ordenação é feita em ordem alfabética, caractere a caractere.\n' +
            'var v = ["aaa", "a", "aba", "abb", "abc"]\n' +
            'escreva(v.ordenar()) // ["a", "aaa", "aba", "abb", "abc"]\n```' +
            '\n\n ### Formas de uso \n',
        exemploCodigo: 'vetor.ordenar()'
    },
    {
        nome: 'remover',
        assinaturas: [
            {
                formato: 'remover(elemento: qualquer)',
                parametros: [
                    {
                        nome: 'elemento',
                        documentacao: 'O elemento a ser removido do vetor.'
                    }
                ]
            }
        ],
        documentacao: '### Descrição \n \n' +
            'Remove um elemento do vetor caso o elemento exista no vetor.\n' +
            '\n\n ### Exemplo de Código\n' +
            '\n\n```delegua\nvar vetor = [1, 2, 3]\n' +
            'vetor.remover(2)\n' +
            'escreva(vetor) // [1, 3]\n```' +
            '\n\n ### Formas de uso \n',
        exemploCodigo: 'vetor.remover(elemento)'
    },
    {
        nome: 'removerPrimeiro',
        assinaturas: [
            {
                formato: 'removerPrimeiro()',
                parametros: []
            }
        ],
        documentacao: '### Descrição \n \n' +
            'Remove o primeiro elemento do vetor caso o elemento exista no vetor.\n' +
            '\n\n ### Exemplo de Código\n' +
            '\n\n```delegua\nvar vetor = [1, 2, 3]\n' +
            'var primeiroElemento = vetor.removerPrimeiro()\n' +
            'escreva(primeiroElemento) // 1\n' +
            'escreva(vetor) // [2, 3]\n```' +
            '\n\n ### Formas de uso \n',
        exemploCodigo: 'vetor.removerPrimeiro()'
    },
    {
        nome: 'removerUltimo',
        assinaturas: [
            {
                formato: 'removerUltimo()',
                parametros: []
            }
        ],
        documentacao: '### Descrição \n \n' +
            'Remove o último elemento do vetor caso o elemento exista no vetor.\n' +
            '\n\n ### Exemplo de Código\n' +
            '\n\n```delegua\nvar vetor = [1, 2, 3]\n' +
            'var ultimoElemento = vetor.removerUltimo()\n' +
            'escreva(ultimoElemento) // 3\n' +
            'escreva(vetor) // [1, 2]\n```' +
            '\n\n ### Formas de uso \n',
        exemploCodigo: 'vetor.removerUltimo()'
    },
    {
        nome: 'somar',
        assinaturas: [
            {
                formato: 'somar()',
                parametros: []
            }
        ],
        documentacao: '### Descrição \n \n' +
            'Soma ou concatena todos os elementos do vetor (de acordo com o tipo de dados desses elementos) e retorna o resultado.\n' +
            '\n\n ### Exemplo de Código\n' +
            '\n\n```delegua\nvar vetor = [1, 2, 3, 4, 5]\n' +
            'escreva(vetor.somar()) // 15\n```' +
            '\n\n ### Formas de uso \n',
        exemploCodigo: 'vetor.somar()'
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
            'Retorna o número de elementos que compõem o vetor.\n' +
            '\n\n ### Exemplo de Código\n' +
            '\n\n```delegua\nvar vetor = [0, 1, 2, 3, 4]\n' +
            'escreva(vetor.tamanho()) // 5\n```' +
            '\n\n ### Formas de uso \n',
        exemploCodigo: 'vetor.tamanho()'
    },
    {
        nome: 'juntar',
        assinaturas: [
            {
                formato: 'juntar(separador: string)',
                parametros: [
                    {
                        nome: 'separador',
                        documentacao: 'O separador a ser utilizado para unir os elementos do vetor.'
                    }
                ]
            }
        ],
        documentacao: '### Descrição \n \n' +
            'Junta os elementos de um vetor em um literal de texto, separando os elementos pelo separador passado como parâmetro.\n' +
            '\n\n ### Exemplo de Código\n' +
            '\n\n```delegua\nvar vetor = [\'maçã\', \'laranja\', \'banana\', \'morango\']\n' +
            'escreva(vetor.juntar(\', \')) // maçã, laranja, banana, morango\n```' +
            '\n\n ### Formas de uso \n',
        exemploCodigo: 'vetor.juntar(separador)'
    },
];