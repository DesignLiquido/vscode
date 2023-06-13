export const metodosBibliotecaGlobal = [
    {
        nome: 'escreva',
        documentacao: 'Escreve um ou mais argumentos na saída padrão da aplicação. \n' +
            '## Interpolação \n' +
            'Delégua suporta interpolação de variáveis: \n \n' +
            '<code> var comidaFavorita = \'strogonoff\' \n' +
            'escreva("Minha comida favorita é ${comidaFavorita}") </code> ',
        exemploCodigo: 'função escreva(...argumentos)'
    },
    {
        nome: 'filtrarPor',
        documentacao: '### Descrição \n \n' +
            'Retorna uma lista de elementos filtrados de um vetor.' +
            '\n\n ### Exemplo de Código ' +
            '\n\n```javascript var listaDeIdades = [91, 32, 15, 44, 12, 18, 101]; ' +
            '\n funcao checarIdade(idade) { retorna(idade >= 18); }' +
            '\n escreva(filtrarPor(listaDeIdades, checarIdade)); // [91, 32, 44, 18, 101] ' +
            +'\n\n ```' +
            '\n \n ### Formas de uso  \n',
        exemploCodigo: 'filtrarPor(meuVetor, minhaFuncaoParaValidar)'
    },
    {
        nome: 'texto',
        documentacao: '### Descrição \n \n' +
            'Transforma números flutuantes ou inteiros em texto.' +
            '\n\n ### Exemplo de Código ' +
            '\n\n```texto(7)```' +
            '\n \n ### Formas de uso  \n',
        exemploCodigo: 'texto(1234)'
    },
    {
        nome: 'aleatorio',
        documentacao: '### Descrição \n \n' +
            'Retorna um número aleatório entre 0 e 1.' +
            '\n\n ### Exemplo de Código ' +
            '\n\n```var numeroAleatorio = aleatorio();```' +
            '\n\n```escreva(numeroAleatorio);```' +
            '\n\n```// 0.8540051495195808```' +
            '\n \n ### Formas de uso  \n',
        exemploCodigo: 'aleatorio()'
    },
    {
        nome: 'aleatorioEntre',
        documentacao: '### Descrição \n \n' +
            'Retorna um número inteiro aleatório entre os valores passados para a função.' +
            '\n\n ### Exemplo de Código ' +
            '\n\n```var numeroAleatorio = aleatorioEntre(1, 9);```' +
            '\n\n```escreva(numeroAleatorio); // Retornará um valor entre 1 e 8.```' +
            '\n \n ### Formas de uso  \n',
        exemploCodigo: 'aleatorioEntre(numero minimo, numero maximo)'
    },
    {
        nome: 'inteiro',
        documentacao: '### Descrição \n \n' +
            'Converte um número flutuante ou texto, que não apresente letras, em um número inteiro.' +
            '\n\n ### Exemplo de Código ' +
            '\n\n```var testeTexto = "111";```' +
            '\n\n```escreva(111 + inteiro(testeTexto));```' +
            '\n\n```// 222```' +
            '\n \n ### Formas de uso  \n',
        exemploCodigo: 'inteiro("123")'
    },
    {
        nome: 'real',
        documentacao: '### Descrição \n \n' +
            'Converte um número inteiro ou texto, que não apresente letras, em um número flutuante.' +
            '\n\n ### Exemplo de Código ' +
            '\n\n```var testeTexto = "504.69";```' +
            '\n\n```escreva(0.01 + real(testeTexto));```' +
            '\n\n```// 504.7```' +
            '\n \n ### Formas de uso  \n',
        exemploCodigo: 'real(texto)'
    },
];