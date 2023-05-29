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
];