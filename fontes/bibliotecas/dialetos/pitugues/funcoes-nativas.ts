import { FuncaoNativaOuMetodoPrimitiva } from '../../tipos';

export const funcoesNativasPitugues: FuncaoNativaOuMetodoPrimitiva[] = [
    {
        nome: 'aleatorio',
        assinaturas: [
            {
                formato: 'aleatorio()',
                parametros: [],
            },
        ],
        documentacao:
            '### Descrição\n\n' +
            'Retorna um número aleatório entre 0 e 1.' +
            '\n\n### Exemplo de Código\n\n' +
            '```pitugues\n' +
            'numero_aleatorio = aleatorio()\n' +
            'imprima(numero_aleatorio)\n' +
            '```' +
            '\n\n### Formas de uso',
        exemploCodigo: 'aleatorio()',
    },
    {
        nome: 'aleatorio_entre',
        assinaturas: [
            {
                formato: 'aleatorio_entre(minimo: número, maximo: número)',
                parametros: [
                    {
                        nome: 'minimo',
                        documentacao: 'Valor mínimo do intervalo.',
                    },
                    {
                        nome: 'maximo',
                        documentacao:
                            'Valor máximo do intervalo (não incluído no resultado).',
                    },
                ],
            },
        ],
        documentacao:
            '### Descrição\n\n' +
            'Retorna um número inteiro aleatório entre os valores informados. O valor máximo nunca será retornado.' +
            '\n\n### Exemplo de Código\n\n' +
            '```pitugues\n' +
            'numero_aleatorio = aleatorio_entre(1, 9)\n' +
            'imprima(numero_aleatorio) // Valor entre 1 e 8.\n' +
            '```' +
            '\n\n### Formas de uso',
        exemploCodigo: 'aleatorio_entre(minimo, maximo)',
    },
    {
        nome: 'algum',
        assinaturas: [
            {
                formato: 'algum(vetor: vetor, funcaoPesquisa: função)',
                parametros: [
                    {
                        nome: 'vetor',
                        documentacao: 'Vetor a ser pesquisado.',
                    },
                    {
                        nome: 'funcaoPesquisa',
                        documentacao:
                            'Função que define o critério da pesquisa.',
                    },
                ],
            },
        ],
        documentacao:
            '### Descrição\n\n' +
            'Retorna verdadeiro quando pelo menos um elemento do vetor satisfaz a função recebida. Caso contrário, retorna falso.' +
            '\n\n### Exemplo de Código\n\n' +
            '```pitugues\n' +
            'numeros = [1, 2, 3, 4, 5]\n' +
            'tem_par = algum(numeros, funcao(n): n % 2 == 0)\n' +
            'imprima(tem_par)\n' +
            '```' +
            '\n\n### Formas de uso',
        exemploCodigo: 'algum(vetor, funcaoPesquisa)',
    },
    {
        nome: 'arredondar',
        assinaturas: [
            {
                formato: 'arredondar(numero: número, casasDecimais?: número)',
                parametros: [
                    {
                        nome: 'numero',
                        documentacao: 'Número que será arredondado.',
                    },
                    {
                        nome: 'casasDecimais',
                        documentacao: 'Quantidade de casas decimais.',
                    },
                ],
            },
        ],
        documentacao:
            '### Descrição\n\n' +
            'Arredonda um número para a quantidade informada de casas decimais.' +
            '\n\n### Exemplo de Código\n\n' +
            '```pitugues\n' +
            'numero = 3.141592\n' +
            'imprima(arredondar(numero, 2))\n' +
            '```' +
            '\n\n### Formas de uso',
        exemploCodigo: 'arredondar(numero, casasDecimais)',
    },
    {
        nome: 'tamanho',
        assinaturas: [
            {
                formato: 'tamanho(objeto: qualquer)',
                parametros: [
                    {
                        nome: 'objeto',
                        documentacao: 'Objeto cujo tamanho será retornado.',
                    },
                ],
            },
        ],
        documentacao:
            '### Descrição\n\n' +
            'Retorna a quantidade de elementos de um vetor, texto ou outra coleção.' +
            '\n\n### Exemplo de Código\n\n' +
            '```pitugues\n' +
            'vetor = [1, 2, 3]\n' +
            'imprima(tamanho(vetor))\n\n' +
            'palavra = "pitugues"\n' +
            'imprima(tamanho(palavra))\n' +
            '```' +
            '\n\n### Formas de uso',
        exemploCodigo: 'tamanho(objeto)',
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
                            'Valores que serão escritos na saída padrão.',
                    },
                ],
            },
        ],
        documentacao:
            '### Descrição\n\n' +
            'Escreve um ou mais argumentos na saída padrão da aplicação.' +
            '\n\n### Interpolação\n\n' +
            '```pitugues\n' +
            "comida_favorita = 'strogonoff'\n" +
            'escreva("Minha comida favorita é ${comida_favorita}")\n' +
            '```' +
            '\n\n### Formas de uso',
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
                            'Valores que serão impressos na saída padrão.',
                    },
                ],
            },
        ],
        documentacao:
            '### Descrição\n\n' +
            'Escreve um ou mais argumentos na saída padrão da aplicação.' +
            '\n\n### Interpolação\n\n' +
            '```pitugues\n' +
            "comida_favorita = 'strogonoff'\n" +
            'imprima("Minha comida favorita é ${comida_favorita}")\n' +
            '```' +
            '\n\n### Formas de uso',
        exemploCodigo: 'imprima(...argumentos)',
    },
    {
        nome: 'inteiro',
        assinaturas: [
            {
                formato: 'inteiro(valor: número ou texto)',
                parametros: [
                    {
                        nome: 'valor',
                        documentacao: 'Valor que será convertido para inteiro.',
                    },
                ],
            },
        ],
        documentacao:
            '### Descrição\n\n' +
            'Converte um número com parte decimal ou um texto contendo apenas números em um número inteiro.' +
            '\n\n### Exemplo de Código\n\n' +
            '```pitugues\n' +
            '\n' +
            '```' +
            '\n\n### Formas de uso',
        exemploCodigo: 'inteiro(valor)',
    },
    {
        nome: 'real',
        assinaturas: [
            {
                formato: 'real(numero: número ou texto)',
                parametros: [
                    {
                        nome: 'numero',
                        documentacao:
                            'Número inteiro ou texto contendo apenas números.',
                    },
                ],
            },
        ],
        documentacao:
            '### Descrição\n\n' +
            'Converte um número inteiro ou um texto contendo apenas números em um número de ponto flutuante.' +
            '\n\n### Exemplo de Código\n\n' +
            '```pitugues\n' +
            'texto_para_numero = "504.69"\n' +
            'imprima(0.01 + real(texto_para_numero))\n' +
            '```' +
            '\n\n### Formas de uso',
        exemploCodigo: 'real(numero)',
    },
    {
        nome: 'texto',
        assinaturas: [
            {
                formato: 'texto(valor: qualquer)',
                parametros: [
                    {
                        nome: 'valor',
                        documentacao: 'Valor que será convertido para texto.',
                    },
                ],
            },
        ],
        documentacao:
            '### Descrição\n\n' +
            'Converte qualquer valor para texto.' +
            '\n\n### Exemplo de Código\n\n' +
            '```pitugues\n' +
            'numero = 10\n' +
            'imprima(10 + texto(numero))\n' +
            '```' +
            '\n\n### Formas de uso',
        exemploCodigo: 'texto(valor)',
    },
    {
        nome: 'tupla',
        assinaturas: [
            {
                formato: 'tupla(vetor: vetor)',
                parametros: [
                    {
                        nome: 'vetor',
                        documentacao: 'Vetor que será convertido em tupla.',
                    },
                ],
            },
        ],
        documentacao:
            '### Descrição\n\n' +
            'Converte um vetor em uma tupla.' +
            '\n\n### Exemplo de Código\n\n' +
            '```pitugues\n' +
            'pares = [2, 4, 6, 8, 10]\n' +
            'imprima(tupla(pares))\n' +
            '```' +
            '\n\n### Formas de uso',
        exemploCodigo: 'tupla(vetor)',
    },
    {
        nome: 'vetor',
        assinaturas: [
            {
                formato: 'vetor(tupla: tupla)',
                parametros: [
                    {
                        nome: 'tupla',
                        documentacao: 'Tupla que será convertida em vetor.',
                    },
                ],
            },
        ],
        documentacao:
            '### Descrição\n\n' +
            'Converte uma tupla em um vetor.' +
            '\n\n### Exemplo de Código\n\n' +
            '```pitugues\n' +
            'pares = (2, 4, 6, 8, 10)\n' +
            'imprima(vetor(pares))\n' +
            '```' +
            '\n\n### Formas de uso',
        exemploCodigo: 'vetor(tupla)',
    },
    {
        nome: 'maximo',
        assinaturas: [
            {
                formato: 'maximo(vetor: vetor)',
                parametros: [
                    {
                        nome: 'vetor',
                        documentacao: 'Vetor contendo valores comparáveis.',
                    },
                ],
            },
        ],
        documentacao:
            '### Descrição\n\n' +
            'Retorna o maior valor presente no vetor.' +
            '\n\n### Exemplo de Código\n\n' +
            '```pitugues\n' +
            'imprima(maximo([3, 9, 2]))\n' +
            '```' +
            '\n\n### Formas de uso',
        exemploCodigo: 'maximo(vetor)',
    },
    {
        nome: 'minimo',
        assinaturas: [
            {
                formato: 'minimo(vetor: vetor)',
                parametros: [
                    {
                        nome: 'vetor',
                        documentacao: 'Vetor contendo valores comparáveis.',
                    },
                ],
            },
        ],
        documentacao:
            '### Descrição\n\n' +
            'Retorna o menor valor presente no vetor.' +
            '\n\n### Exemplo de Código\n\n' +
            '```pitugues\n' +
            'imprima(minimo([3, 9, 2]))\n' +
            '```' +
            '\n\n### Formas de uso',
        exemploCodigo: 'minimo(vetor)',
    },
    {
        nome: 'somar',
        assinaturas: [
            {
                formato: 'somar(vetor: vetor)',
                parametros: [
                    {
                        nome: 'vetor',
                        documentacao:
                            'Vetor contendo apenas valores numéricos.',
                    },
                ],
            },
        ],
        documentacao:
            '### Descrição\n\n' +
            'Soma todos os valores numéricos do vetor.' +
            '\n\n### Exemplo de Código\n\n' +
            '```pitugues\n' +
            'imprima(somar([1, 2, 3, 4]))\n' +
            '```' +
            '\n\n### Formas de uso',
        exemploCodigo: 'somar(vetor)',
    },
    {
        nome: 'encontrar',
        assinaturas: [
            {
                formato: 'encontrar(vetor: vetor, funcaoPesquisa: função)',
                parametros: [
                    {
                        nome: 'vetor',
                        documentacao: 'Vetor onde a pesquisa será realizada.',
                    },
                    {
                        nome: 'funcaoPesquisa',
                        documentacao:
                            'Função que define o critério da pesquisa.',
                    },
                ],
            },
        ],
        documentacao:
            '### Descrição\n\n' +
            'Retorna o primeiro elemento do vetor que satisfaz a função recebida. Se nenhum elemento passar no teste, retorna nulo.' +
            '\n\n### Exemplo de Código\n\n' +
            '```pitugues\n' +
            'numeros = [1, 2, 3, 4, 5]\n' +
            'par = encontrar(numeros, funcao(n): n % 2 == 0)\n' +
            'imprima(par)\n' +
            '```' +
            '\n\n### Formas de uso',
        exemploCodigo: 'encontrar(vetor, funcaoPesquisa)',
    },
    {
        nome: 'encontrar_indice',
        assinaturas: [
            {
                formato:
                    'encontrar_indice(vetor: vetor, funcaoPesquisa: função)',
                parametros: [
                    {
                        nome: 'vetor',
                        documentacao: 'Vetor onde a pesquisa será realizada.',
                    },
                    {
                        nome: 'funcaoPesquisa',
                        documentacao:
                            'Função que define o critério da pesquisa.',
                    },
                ],
            },
        ],
        documentacao:
            '### Descrição\n\n' +
            'Retorna o índice do primeiro elemento do vetor que satisfaz a função recebida. Se nenhum elemento passar no teste, retorna nulo.' +
            '\n\n### Exemplo de Código\n\n' +
            '```pitugues\n' +
            'frutas = ["maçã", "banana", "laranja"]\n' +
            'indice = encontrar_indice(frutas, funcao(f): f == "banana")\n' +
            'imprima(indice)\n' +
            '```' +
            '\n\n### Formas de uso',
        exemploCodigo: 'encontrar_indice(vetor, funcaoPesquisa)',
    },
    {
        nome: 'encontrar_ultimo',
        assinaturas: [
            {
                formato:
                    'encontrar_ultimo(vetor: vetor, funcaoPesquisa: função)',
                parametros: [
                    {
                        nome: 'vetor',
                        documentacao: 'Vetor onde a pesquisa será realizada.',
                    },
                    {
                        nome: 'funcaoPesquisa',
                        documentacao:
                            'Função que define o critério da pesquisa.',
                    },
                ],
            },
        ],
        documentacao:
            '### Descrição\n\n' +
            'Retorna o último elemento do vetor que satisfaz a função recebida. Se nenhum elemento passar no teste, retorna nulo.' +
            '\n\n### Exemplo de Código\n\n' +
            '```pitugues\n' +
            'numeros = [2, 4, 6, 7, 9]\n' +
            'ultimo_par = encontrar_ultimo(numeros, funcao(n): n % 2 == 0)\n' +
            'imprima(ultimo_par)\n' +
            '```' +
            '\n\n### Formas de uso',
        exemploCodigo: 'encontrar_ultimo(vetor, funcaoPesquisa)',
    },
    {
        nome: 'encontrar_ultimo_indice',
        assinaturas: [
            {
                formato:
                    'encontrar_ultimo_indice(vetor: vetor, funcaoPesquisa: função)',
                parametros: [
                    {
                        nome: 'vetor',
                        documentacao: 'Vetor onde a pesquisa será realizada.',
                    },
                    {
                        nome: 'funcaoPesquisa',
                        documentacao:
                            'Função que define o critério da pesquisa.',
                    },
                ],
            },
        ],
        documentacao:
            '### Descrição\n\n' +
            'Retorna o índice do último elemento do vetor que satisfaz a função recebida. Se nenhum elemento passar no teste, retorna nulo.' +
            '\n\n### Exemplo de Código\n\n' +
            '```pitugues\n' +
            'numeros = [2, 4, 6, 7, 9]\n' +
            'indice = encontrar_ultimo_indice(numeros, funcao(n): n % 2 == 0)\n' +
            'imprima(indice)\n' +
            '```' +
            '\n\n### Formas de uso',
        exemploCodigo: 'encontrar_ultimo_indice(vetor, funcaoPesquisa)',
    },
    {
        nome: 'incluido',
        assinaturas: [
            {
                formato: 'incluido(vetor: vetor, valor: qualquer)',
                parametros: [
                    {
                        nome: 'vetor',
                        documentacao:
                            'Vetor onde a verificação será realizada.',
                    },
                    {
                        nome: 'valor',
                        documentacao: 'Valor a ser procurado no vetor.',
                    },
                ],
            },
        ],
        documentacao:
            '### Descrição\n\n' +
            'Retorna verdadeiro se o valor estiver presente no vetor, e falso caso contrário.' +
            '\n\n### Exemplo de Código\n\n' +
            '```pitugues\n' +
            'frutas = ["maçã", "banana", "laranja"]\n' +
            'imprima(incluido(frutas, "banana"))\n' +
            'imprima(incluido(frutas, "uva"))\n' +
            '```' +
            '\n\n### Formas de uso',
        exemploCodigo: 'incluido(vetor, valor)',
    },
    {
        nome: 'todos',
        assinaturas: [
            {
                formato: 'todos(iteravel: iterável)',
                parametros: [
                    {
                        nome: 'iteravel',
                        documentacao: 'Coleção de valores a ser verificada.',
                    },
                ],
            },
        ],
        documentacao:
            '### Descrição\n\n' +
            'Retorna verdadeiro se todos os elementos do iterável forem considerados verdadeiros, e falso caso contrário.' +
            '\n\n### Exemplo de Código\n\n' +
            '```pitugues\n' +
            'numeros = [1, 2, 3, 4, 5]\n' +
            'todos_positivos = todos(numeros)\n' +
            'imprima(todos_positivos)\n' +
            '```' +
            '\n\n### Formas de uso',
        exemploCodigo: 'todos(iteravel)',
    },
    {
        nome: 'mapear',
        assinaturas: [
            {
                formato: 'mapear(vetor: vetor, funcaoMapeamento: função)',
                parametros: [
                    {
                        nome: 'vetor',
                        documentacao: 'Vetor que será percorrido.',
                    },
                    {
                        nome: 'funcaoMapeamento',
                        documentacao:
                            'Função aplicada a cada elemento do vetor.',
                    },
                ],
            },
        ],
        documentacao:
            '### Descrição\n\n' +
            'Retorna um novo vetor contendo o resultado da aplicação da função informada sobre cada elemento do vetor original.' +
            '\n\n### Exemplo de Código\n\n' +
            '```pitugues\n' +
            'numeros = [1, 2, 3]\n' +
            'resultado = mapear(numeros, funcao(x): x * 2)\n' +
            'imprima(resultado)\n' +
            '```' +
            '\n\n### Formas de uso',
        exemploCodigo: 'mapear(vetor, funcaoMapeamento)',
    },
    {
        nome: 'filtrar_por',
        assinaturas: [
            {
                formato: 'filtrar_por(vetor: vetor, funcaoFiltragem: função)',
                parametros: [
                    {
                        nome: 'vetor',
                        documentacao: 'Vetor que será filtrado.',
                    },
                    {
                        nome: 'funcaoFiltragem',
                        documentacao:
                            'Função que define quais elementos serão mantidos.',
                    },
                ],
            },
        ],
        documentacao:
            '### Descrição\n\n' +
            'Retorna um novo vetor contendo apenas os elementos que satisfazem a função de filtragem.' +
            '\n\n### Exemplo de Código\n\n' +
            '```pitugues\n' +
            'numeros = [1, 2, 3, 4, 5]\n' +
            'pares = filtrar_por(numeros, funcao(n): n % 2 == 0)\n' +
            'imprima(pares)\n' +
            '```' +
            '\n\n### Formas de uso',
        exemploCodigo: 'filtrar_por(vetor, funcaoFiltragem)',
    },
    {
        nome: 'reduzir',
        assinaturas: [
            {
                formato:
                    'reduzir(vetor: vetor, funcaoReducao: função, valorInicial: qualquer)',
                parametros: [
                    {
                        nome: 'vetor',
                        documentacao: 'Vetor que será reduzido.',
                    },
                    {
                        nome: 'funcaoReducao',
                        documentacao:
                            'Função que recebe o acumulador e o elemento atual.',
                    },
                    {
                        nome: 'valorInicial',
                        documentacao: 'Valor inicial do acumulador.',
                    },
                ],
            },
        ],
        documentacao:
            '### Descrição\n\n' +
            'Aplica uma função sobre todos os elementos do vetor para reduzi-los a um único valor.' +
            '\n\n### Exemplo de Código\n\n' +
            '```pitugues\n' +
            'numeros = [1, 2, 3, 4]\n' +
            'resultado = reduzir(\n' +
            '    numeros,\n' +
            '    funcao(acumulado, atual): acumulado + atual,\n' +
            '    0\n' +
            ')\n' +
            'imprima(resultado)\n' +
            '```' +
            '\n\n### Formas de uso',
        exemploCodigo: 'reduzir(vetor, funcaoReducao, valorInicial)',
    },
    {
        nome: 'ordenar',
        assinaturas: [
            {
                formato: 'ordenar(vetor: vetor)',
                parametros: [
                    {
                        nome: 'vetor',
                        documentacao: 'Vetor contendo elementos comparáveis.',
                    },
                ],
            },
        ],
        documentacao:
            '### Descrição\n\n' +
            'Retorna um novo vetor contendo os mesmos elementos do vetor original em ordem crescente. Para textos, a ordenação é alfabética.' +
            '\n\n### Exemplo de Código\n\n' +
            '```pitugues\n' +
            'nomes = ["Lucas", "Heictor", "Julio", "Brennus", "Arleson"]\n' +
            'imprima(ordenar(nomes))\n\n' +
            'numeros = [1, 2, 6, 7, 3, 4]\n' +
            'imprima(ordenar(numeros))\n' +
            '```' +
            '\n\n### Formas de uso',
        exemploCodigo: 'ordenar(vetor)',
    },
    {
        nome: 'para_cada',
        assinaturas: [
            {
                formato: 'para_cada(vetor: vetor, funcaoAcao: função)',
                parametros: [
                    {
                        nome: 'vetor',
                        documentacao: 'Vetor que será percorrido.',
                    },
                    {
                        nome: 'funcaoAcao',
                        documentacao:
                            'Função executada para cada elemento do vetor.',
                    },
                ],
            },
        ],
        documentacao:
            '### Descrição\n\n' +
            'Executa a função informada para cada elemento do vetor, sem retornar um novo vetor.' +
            '\n\n### Exemplo de Código\n\n' +
            '```pitugues\n' +
            'nomes = ["Ana", "Bruno", "Carlos"]\n' +
            'para_cada(nomes, funcao(nome): imprima("Olá, " + nome + "!"))\n' +
            '```' +
            '\n\n### Formas de uso',
        exemploCodigo: 'para_cada(vetor, funcaoAcao)',
    },
    {
        nome: 'intervalo',
        assinaturas: [
            {
                formato:
                    'intervalo(valorInicial: número, valorFinal?: número, valorPasso?: número)',
                parametros: [
                    {
                        nome: 'valorInicial',
                        documentacao:
                            'Valor inicial do intervalo ou quantidade de elementos quando usado sozinho.',
                    },
                    {
                        nome: 'valorFinal',
                        documentacao:
                            'Valor final (não incluído no resultado).',
                    },
                    {
                        nome: 'valorPasso',
                        documentacao:
                            'Incremento entre os valores do intervalo.',
                    },
                ],
            },
        ],
        documentacao:
            '### Descrição\n\n' +
            'Gera um vetor de números começando em valorInicial e terminando antes de valorFinal. Caso valorFinal não seja informado, o intervalo começa em 0 e termina antes de valorInicial. O passo padrão é 1.' +
            '\n\n### Exemplo de Código\n\n' +
            '```pitugues\n' +
            'imprima(intervalo(5))\n' +
            'imprima(intervalo(2, 7))\n' +
            'imprima(intervalo(1, 10, 2))\n' +
            '```' +
            '\n\n### Formas de uso',
        exemploCodigo: 'intervalo(valorInicial, valorFinal?, valorPasso?)',
    },
    {
        nome: 'combinar',
        assinaturas: [
            {
                formato:
                    'combinar(primeiroIteravel: iterável, segundoIteravel: iterável)',
                parametros: [
                    {
                        nome: 'primeiroIteravel',
                        documentacao: 'Primeiro iterável a ser combinado.',
                    },
                    {
                        nome: 'segundoIteravel',
                        documentacao: 'Segundo iterável a ser combinado.',
                    },
                ],
            },
        ],
        documentacao:
            '### Descrição\n\n' +
            'Combina dois iteráveis em um vetor de tuplas. Cada tupla contém os elementos da mesma posição dos iteráveis. Caso possuam tamanhos diferentes, a combinação termina quando o menor deles acabar.' +
            '\n\n### Exemplo de Código\n\n' +
            '```pitugues\n' +
            'nomes = ["Ana", "Bruno"]\n' +
            'idades = [20, 25]\n' +
            'resultado = combinar(nomes, idades)\n' +
            'imprima(resultado)\n' +
            '```' +
            '\n\n### Formas de uso',
        exemploCodigo: 'combinar(primeiroIteravel, segundoIteravel)',
    },
    {
        nome: 'contar',
        assinaturas: [
            {
                formato: 'contar(iteravel: iterável, elemento: qualquer)',
                parametros: [
                    {
                        nome: 'iteravel',
                        documentacao:
                            'Iterável onde será realizada a contagem.',
                    },
                    {
                        nome: 'elemento',
                        documentacao:
                            'Elemento cuja quantidade de ocorrências será contada.',
                    },
                ],
            },
        ],
        documentacao:
            '### Descrição\n\n' +
            'Conta quantas vezes um elemento aparece em um iterável.' +
            '\n\n### Exemplo de Código\n\n' +
            '```pitugues\n' +
            'numeros = [1, 2, 2, 3]\n' +
            'imprima(contar(numeros, 2))\n' +
            '```' +
            '\n\n### Formas de uso',
        exemploCodigo: 'contar(iteravel, elemento)',
    },
    {
        nome: 'inverter',
        assinaturas: [
            {
                formato: 'inverter(iteravel: iterável)',
                parametros: [
                    {
                        nome: 'iteravel',
                        documentacao: 'Iterável que será invertido.',
                    },
                ],
            },
        ],
        documentacao:
            '### Descrição\n\n' +
            'Retorna um novo iterável com os elementos em ordem inversa. Funciona com vetores, tuplas e textos.' +
            '\n\n### Exemplo de Código\n\n' +
            '```pitugues\n' +
            'numeros = [1, 2, 3]\n' +
            'imprima(inverter(numeros))\n' +
            '```' +
            '\n\n### Formas de uso',
        exemploCodigo: 'inverter(iteravel)',
    },
    {
        nome: 'unico',
        assinaturas: [
            {
                formato: 'unico(iteravel: iterável)',
                parametros: [
                    {
                        nome: 'iteravel',
                        documentacao:
                            'Iterável do qual serão removidos os elementos duplicados.',
                    },
                ],
            },
        ],
        documentacao:
            '### Descrição\n\n' +
            'Retorna um novo vetor contendo apenas os elementos únicos do iterável, preservando a ordem da primeira ocorrência.' +
            '\n\n### Exemplo de Código\n\n' +
            '```pitugues\n' +
            'numeros = [1, 2, 2, 3, 1, 4]\n' +
            'imprima(unico(numeros))\n' +
            '```' +
            '\n\n### Formas de uso',
        exemploCodigo: 'unico(iteravel)',
    },
    {
        nome: 'enumerar',
        assinaturas: [
            {
                formato: 'enumerar(iteravel: iterável, inicio?: número)',
                parametros: [
                    {
                        nome: 'iteravel',
                        documentacao: 'Iterável que será enumerado.',
                    },
                    {
                        nome: 'inicio',
                        documentacao:
                            'Índice inicial da enumeração. O padrão é 0.',
                    },
                ],
            },
        ],
        documentacao:
            '### Descrição\n\n' +
            'Retorna um vetor de dicionários contendo o índice e o valor de cada elemento do iterável.' +
            '\n\n### Exemplo de Código\n\n' +
            '```pitugues\n' +
            'frutas = ["maçã", "banana", "uva"]\n' +
            'resultado = enumerar(frutas)\n' +
            'imprima(resultado)\n' +
            '```' +
            '\n\n### Formas de uso',
        exemploCodigo: 'enumerar(iteravel, inicio?)',
    },
];
