import { FuncaoNativaOuMetodoPrimitiva } from "../../tipos";

export const primitivasVetorFormatadas: FuncaoNativaOuMetodoPrimitiva[] = [
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
        documentacao:
            '# `vetor.adicionar(elemento)` \n \n' +
            'Adiciona um ou mais elementos em um vetor.' +
            '\n\n ## Exemplo de Código\n' +
            '```pitugues\nv.adicionar(7)\n' +
            'v.adicionar(5)\n' +
            'v.adicionar(3)\n' +
            'escreva(v) // [7, 5, 3]\n```' +
            '\n\n ### Formas de uso  \n',
        exemploCodigo: 'vetor.adicionar(elemento)',
    },
    {
        nome: 'concatenar',
        assinaturas: [
            {
                formato: 'concatenar(...outroVetor: qualquer[])',
                parametros: [
                    {
                        nome: 'outroVetor',
                        documentacao: 'O outro vetorm ou outros vetores, a serem concatenados a este vetor.'
                    }
                ]
            }
        ],
        documentacao:
            '# `vetor.concatenar(outroVetor)` \n \n' +
            'Adiciona ao conteúdo do vetor um ou mais elementos' +
            '\n\n ## Exemplo de Código\n' +
            '\n\n```pitugues\nvar v = [7, 5, 3]\n' +
            'escreva(v.concatenar([1, 2, 4])) // [7, 5, 3, 1, 2, 4]\n```' +
            '\n\n ### Formas de uso  \n',
        exemploCodigo: 'vetor.concatenar(...argumentos)',
    },
    {
        nome: 'contar',
        assinaturas: [
            {
                formato: 'contar(elemento: qualquer)',
                parametros: [
                    {
                        nome: 'elemento',
                        documentacao: 'O elemento a ser contado no vetor.'
                    }
                ]
            }
        ],
        documentacao:
            '# `vetor.contar(elemento)`\n\nRetorna quantas vezes o elemento aparece no vetor.',
        exemploCodigo: 'vetor.contar(elemento)',
    },
    {
        nome: 'empilhar',
        assinaturas: [
            {
                formato: 'empilhar(elemento: qualquer)',
                parametros: [
                    {
                        nome: 'elemento',
                        documentacao: ''
                    }
                ]
            }
        ],
        documentacao:
            '# `vetor.empilhar(elemento)` \n \n' +
            'Adiciona um elemento ao final do vetor, como se o vetor fosse uma pilha na vertical.' +
            '\n\n ## Exemplo de Código\n' +
            '\n\n```pitugues\nvar v = []\n' +
            'v.empilhar(7)\n' +
            'v.empilhar(5)\n' +
            'v.empilhar(3)\n' +
            'escreva(v) // [7, 5, 3]\n```' +
            '\n\n ### Formas de uso \n',
        exemploCodigo: 'vetor.empilhar(elemento)',
    },
    {
        nome: 'estender',
        assinaturas: [
            {
                formato: 'estender(...iteravel: qualquer[])',
                parametros: [
                    {
                        nome: 'iteravel',
                        documentacao: 'Um ou mais vetores (ou dicionários) cujos elementos serão adicionados ao final deste vetor.'
                    }
                ]
            }
        ],
        documentacao:
            '# `vetor.estender(iteravel)`\n\nAdiciona elementos de um vetor ou chaves de um dicionário ao final do vetor atual.',
        exemploCodigo: 'vetor.estender([1, 2])',
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
        documentacao:
            '# `vetor.fatiar(inicio, fim)` \n \n' +
            'Extrai uma fatia do vetor, dadas posições de início e fim. \n' +
            '\n\n ## Exemplo de Código\n' +
            '\n\n```pitugues\nvar v = [1, 2, 3, 4, 5]\n' +
            'escreva(v.fatiar()) // "[1, 2, 3, 4, 5]", ou seja, não faz coisa alguma.\n' +
            'escreva(v.fatiar(2, 4)) // "[3, 4]"\n' +
            'escreva(v.fatiar(2)) // "[3, 4, 5]", ou seja, extrai trecho da 3ª posição até o final do vetor.\n```' +
            '\n\n ### Formas de uso \n' +
            'Fatiar suporta sobrecarga do método.\n\n',
        exemploCodigo:
            'vetor.fatiar(<a partir desta posição>)\n' +
            'vetor.fatiar(<a partir desta posição>, <até esta posição>)',
    },
    {
        nome: 'filtrar_por',
        assinaturas: [
            {
                formato: 'filtrar_por(funcao: função)',
                parametros: [
                    {
                        nome: 'funcao',
                        documentacao: 'A função de filtragem.'
                    }
                ]
            }
        ],
        documentacao:
            '# `vetor.filtrar_por(funcao)` \n \n' +
            'Devolve todos os elementos de um vetor cujo resultado da execução de uma função, passada por parâmetro, seja verdadeiro.\n' +
            '\n\n ### Exemplo de Código\n' +
            '\n\n```pitugues\nvar v = [1, 2, 3, 4, 5]\n' +
            'var funcaoNumerosImpares = funcao (n) { retorna n % 2 > 0 }\n' +
            'escreva(v.filtrar_por(funcaoNumerosImpares)) // "[1, 3, 5]"\n```' +
            '\n\n ### Formas de uso \n',
        exemploCodigo: 'vetor.filtrar_por(funcao (argumento) { <corpo da função com retorna> })',
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
            '# `vetor.inclui(elemento)` \n \n' +
            'Verifica se o elemento existe no vetor. Devolve `verdadeiro` se existe, e `falso` em caso contrário.\n' +
            '\n\n ## Exemplo de Código\n' +
            '\n\n```pitugues\nvar v = [1, 2, 3]\n' +
            'escreva(v.inclui(2)) // verdadeiro\n' +
            'escreva(v.inclui(4)) // falso\n```' +
            '\n\n ### Formas de uso \n',
        exemploCodigo: 'vetor.inclui(elemento)',
    },
    {
        nome: 'indice',
        assinaturas: [
            {
                formato: 'indice(elemento: qualquer)',
                parametros: [
                    {
                        nome: 'elemento',
                        documentacao: 'O elemento cuja posição (índice) será buscada no vetor.'
                    }
                ]
            }
        ],
        documentacao:
            '# `vetor.indice(elemento)` \n \n' +
            'Retorna a posição (índice) da primeira ocorrência do elemento no vetor. \n' +
            'Caso o elemento não seja encontrado, devolve `-1`.\n' +
            '\n\n ## Exemplo de Código\n' +
            '\n\n```pitugues\n' +
            'var v = ["maçã", "banana", "uva"]\n' +
            'escreva(v.indice("banana")) // 1\n' +
            'escreva(v.indice("abacaxi")) // -1\n' +
            '```',
        exemploCodigo: 'vetor.indice(elemento)',
    },
    {
        nome: 'inserir',
        assinaturas: [
            {
                formato: 'inserir(indice: numero, elemento: qualquer)',
                parametros: [
                    {
                        nome: 'indice',
                        documentacao: 'O índice onde o elemento será inserido.'
                    },
                    {
                        nome: 'elemento',
                        documentacao: 'O elemento a ser inserido.'
                    }
                ]
            }
        ],
        documentacao:
            '# `vetor.inserir(indice, elemento)` \n \n' +
            'Insere um elemento em uma posição específica do vetor, deslocando os elementos existentes para a direita. \n' +
            '\n\n ## Exemplo de Código\n' +
            '\n\n```pitugues\n' +
            'v = [1, 2, 4, 5]\n' +
            'v.inserir(2, 3) \n' +
            'escreva(v) // "[1, 2, 3, 4, 5]"\n' +
            '```',
        exemploCodigo: 'vetor.inserir(indice, elemento)',
    },
    {
        nome: 'inverter',
        assinaturas: [
            {
                formato: 'inverter()',
                parametros: []
            }
        ],
        documentacao:
            '# `vetor.inverter()` \n \n' +
            'Inverte a ordem dos elementos de um vetor.\n' +
            '\n\n ## Exemplo de Código\n' +
            '\n\n```pitugues\nvar v = [1, 2, 3]\n' +
            'escreva(v.inverter()) // [3, 2, 1]\n```' +
            '\n\n ### Formas de uso \n',
        exemploCodigo: 'vetor.inverter()',
    },
    {
        nome: 'juntar',
        assinaturas: [
            {
                formato: 'juntar(separador: texto)',
                parametros: [
                    {
                        nome: 'separador',
                        documentacao: 'O separador entre elementos do vetor para o texto.'
                    }
                ]
            }
        ],
        documentacao:
            '# `vetor.juntar(separador = ",")` \n \n' +
            'Junta todos os elementos de um vetor em um texto, separando cada elemento pelo separador passado como parâmetro.\n' +
            '\n\n ## Exemplo de Código\n' +
            '\n\n```pitugues\nvar v = [1, 2, 3]\n' +
            'escreva(v.juntar(":")) // "1:2:3"\n```' +
            '\n\n ### Formas de uso \n',
        exemploCodigo: 'vetor.juntar()\n' + 'vetor.juntar(<separador>)',
    },
    {
        nome: 'limpar',
        assinaturas: [
            {
                formato: 'limpar()',
                parametros: []
            }
        ],
        documentacao:
            '# `vetor.limpar()`\n\nRemove todos os elementos do vetor original, deixando-o vazio.',
        exemploCodigo: 'vetor.limpar()',
    },
    {
        nome: 'mapear',
        assinaturas: [
            {
                formato: 'mapear(funcao: função)',
                parametros: [
                    {
                        nome: 'funcao',
                        documentacao: 'A função que transforma cada elemento de um vetor em outro elemento a ser retornado em um novo vetor.'
                    }
                ]
            }
        ],
        documentacao:
            '# `vetor.mapear(funcao)`\n\n' +
            'Dada uma função passada como parâmetro, executa essa função para cada elemento do vetor. \n' +
            'Cada elemento retornado por esta função é adicionado ao vetor resultante. \n' +
            '\n\n ## Exemplo de Código\n' +
            '\n\n```pitugues\nvar v = [1, 2, 3, 4, 5]\n' +
            'var funcaoPotenciasDeDois = funcao (n) { retorna n ** 2 }\n' +
            'escreva(v.mapear(funcaoPotenciasDeDois)) // [1, 4, 9, 16, 25]\n```' +
            '\n\n ### Formas de uso \n',
        exemploCodigo: 'vetor.mapear(funcao (argumento) { <corpo da função com retorna> })',
    },
    {
        nome: 'ordenar',
        assinaturas: [
            {
                formato: 'ordenar()',
                parametros: []
            }
        ],
        documentacao:
            '# `vetor.ordenar()` \n \n' +
            'Ordena valores de um vetor em ordem crescente.\n' +
            '\n\n ## Exemplo de Código\n' +
            '\n\n```pitugues\n// A ordenação padrão é ascendente, ou seja, para o caso de números, a ordem fica do menor para o maior.\n' +
            'var v = [4, 2, 12, 5]\n' +
            'escreva(v.ordenar()) // [2, 4, 5, 12]\n' +
            '// Para o caso de textos, a ordenação é feita em ordem alfabética, caractere a caractere.\n' +
            'var v = ["aaa", "a", "aba", "abb", "abc"]\n' +
            'escreva(v.ordenar()) // ["a", "aaa", "aba", "abb", "abc"]\n```' +
            '\n\n ### Formas de uso \n',
        exemploCodigo: 'vetor.ordenar()',
    },
    {
        nome: 'paraTupla',
        assinaturas: [
            {
                formato: 'paraTupla()',
                parametros: []
            }
        ],
        documentacao:
            '# `vetor.paraTupla()` \n \n' + 'Converte o vetor atual em uma tupla imutável.',
        exemploCodigo: 'vetor.paraTupla()',
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
        documentacao:
            '# `vetor.remover(elemento)` \n \n' +
            'Remove um elemento do vetor caso o elemento exista no vetor.\n' +
            '\n\n ## Exemplo de Código\n' +
            '\n\n```pitugues\nvar vetor = [1, 2, 3]\n' +
            'vetor.remover(2)\n' +
            'escreva(vetor) // [1, 3]\n```' +
            '\n\n ### Formas de uso \n',
        exemploCodigo: 'vetor.remover(elemento)',
    },
    {
        nome: 'remover_primeiro',
        assinaturas: [
            {
                formato: 'remover_primeiro()',
                parametros: []
            }
        ],
        documentacao:
            '# `vetor.remover_primeiro()` \n \n' +
            'Remove o primeiro elemento do vetor caso o elemento exista no vetor.\n' +
            '\n\n ## Exemplo de Código\n' +
            '\n\n```pitugues\nvar vetor = [1, 2, 3]\n' +
            'var primeiroElemento = vetor.remover_primeiro()\n' +
            'escreva(primeiroElemento) // 1\n' +
            'escreva(vetor) // [2, 3]\n```' +
            '\n\n ### Formas de uso \n',
        exemploCodigo: 'vetor.remover_primeiro()',
    },
    {
        nome: 'remover_ultimo',
        assinaturas: [
            {
                formato: 'remover_ultimo()',
                parametros: []
            }
        ],
        documentacao:
            '# `vetor.remover_ultimo()` \n \n' +
            'Remove o último elemento do vetor caso o elemento exista no vetor.\n' +
            '\n\n ## Exemplo de Código\n' +
            '\n\n```pitugues\nvar vetor = [1, 2, 3]\n' +
            'var ultimoElemento = vetor.remover_ultimo()\n' +
            'escreva(ultimoElemento) // 3\n' +
            'escreva(vetor) // [1, 2]\n```' +
            '\n\n ### Formas de uso \n',
        exemploCodigo: 'vetor.remover_ultimo()',
    },
    {
        nome: 'somar',
        assinaturas: [
            {
                formato: 'somar()',
                parametros: []
            }
        ],
        documentacao:
            '# `vetor.somar()` \n \n' +
            'Soma ou concatena todos os elementos do vetor (de acordo com o tipo de dados desses elementos) e retorna o resultado.\n' +
            '\n\n ### Exemplo de Código\n' +
            '\n\n```pitugues\nvar vetor = [1, 2, 3, 4, 5]\n' +
            'escreva(vetor.somar()) // 15\n```' +
            '\n\n ### Formas de uso \n',
        exemploCodigo: 'vetor.somar()',
    },
    {
        nome: 'tamanho',
        assinaturas: [
            {
                formato: 'tamanho()',
                parametros: []
            }
        ],
        documentacao:
            '# `vetor.tamanho()` \n \n' +
            'Retorna o número de elementos que compõem o vetor.\n' +
            '\n\n ## Exemplo de Código\n' +
            '\n\n```pitugues\nvar vetor = [0, 1, 2, 3, 4]\n' +
            'escreva(vetor.tamanho()) // 5\n```' +
            '\n\n ### Formas de uso \n',
        exemploCodigo: 'vetor.tamanho()',
    },
];
