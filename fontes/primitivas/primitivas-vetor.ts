export const primitivasVetor = [
    {
        nome: 'adicionar',
        documentacao: '### Descrição \n \n' +
            'Escreve um ou mais argumentos na saída padrão da aplicação.' +
            '\n\n ### Exemplo de Código ' +
            '\n\n```v.adicionar(7)```' +
            '\n\n```v.adicionar(5)```' +
            '\n\n```v.adicionar(3)```' +
            '\n\n```escreva(v) // [7, 5, 3]```'+
            '\n \n ### Formas de uso  \n' ,
        exemploCodigo: 'função escreva(...argumentos)'
    },
    {
        nome: 'concatenar',
        documentacao: '### Descrição \n \n' +
            'Adiciona ao conteúdo do vetor um ou mais elementos' +
            '\n\n ### Exemplo de Código ' +
            '\n\n```var v = [7, 5, 3]```' +
            '\n\n```escreva(v.concatenar([1, 2, 4])) // [7, 5, 3, 1, 2, 4]```'+
            '\n \n ### Formas de uso  \n' ,
        exemploCodigo: 'vetor.concatenar(...argumentos)'
    },
    {
        nome: 'empilhar',
        documentacao: '### Descrição \n \n' +
            'Adiciona um elemento ao final do vetor.' +
            '\n\n ### Exemplo de Código ' +
            '\n\n```var v = [] ```' +
            '\n\n```v.empilhar(7)```' +
            '\n\n```v.empilhar(5)```' +
            '\n\n```v.empilhar(3)```' +
            '\n\n``` escreva(v) // [7, 5, 3] ```' +
            '\n \n ### Formas de uso  \n' ,
        exemploCodigo: 'vetor.empilhar(conteúdo)'
    },
    {
        nome: 'fatiar',
        documentacao: '### Descrição \n \n' +
            'Extrai uma fatia do vetor, dadas posições de início e fim. \n' +
            '\n\n ### Exemplo de Código ' +
            '\n\n``` var v = [1, 2, 3, 4, 5] ```' +
            '\n\n```escreva(v.fatiar()) // "[1, 2, 3, 4, 5]", ou seja, não faz coisa alguma. ```' +
            '\n\n```escreva(v.fatiar(2, 4)) // "[3, 4]"```' +
            '\n\n```escreva(v.fatiar(2)) // "[3, 4, 5]", ou seja, seleciona tudo da posição 3 até o final do vetor. ```' +
            '\n \n ### Formas de uso  \n' +
            'fatiar suporta sobrecarga do método\n \n',
        exemploCodigo: 'vetor.fatiar(a partir desta posicao)\n' +
            'vetor.fatiar(a partir desta posicao, ate esta posicao)'
    },
   
    {
        nome: 'inclui',
        documentacao:
            '### Descrição \n \n' +
            'Extrai uma fatia do vetor, dadas posições de início e fim. \n' +
            '\n\n ### Exemplo de Código ' +
            'Devolve verdadeiro se elemento passado por parâmetro está contido no vetor, e falso em caso contrário.',
        exemploCodigo: '<code> </code>'
    },
    {
        nome: 'inverter',
        documentacao: 'Inverte a ordem dos elementos de um vetor.',
        exemploCodigo: '<code> </code>'
    },
    {
        nome: 'juntar',
        documentacao: 'Junta os elementos de um vetor em um literal de texto, separando os elementos pelo separados passado como parâmetro.',
        exemploCodigo: '<code> </code>'
    },
    {
        nome: 'ordenar',
        documentacao: 'Ordena valores em ordem crescente. Esta função só aceita vetores.',
        exemploCodigo: '<code> </code>'
    },
    {
        nome: 'remover',
        documentacao: 'Remove um elemento do vetor caso o elemento exista no vetor.',
        exemploCodigo: '<code> </code>'
    },
    {
        nome: 'removerPrimeiro',
        documentacao: 'Remove o primeiro elemento do vetor caso o elemento exista no vetor.',
        exemploCodigo: '<code> </code>'
    },
    {
        nome: 'removerUltimo',
        documentacao: 'Remove o último elemento do vetor caso o elemento exista no vetor.',
        exemploCodigo: '<code> </code>'
    },
    {
        nome: 'somar',
        documentacao: 'Soma ou concatena todos os elementos do vetor (de acordo com o tipo de dados desses elementos) e retorna o resultado.',
        exemploCodigo: '<code> </code>'
    },
    {
        nome: 'tamanho',
        documentacao: 'Retorna o número de elementos que compõem o vetor.',
        exemploCodigo: '<code> </code>'
    },
];