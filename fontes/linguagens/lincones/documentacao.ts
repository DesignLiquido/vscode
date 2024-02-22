/* Template:
    "SELECIONAR":{   	
        nomeSQL:"SELECT",
        descricao:"Insira descrição aqui",
        documentacao:"Insira um enxerto da documentação aqui",
        exemploCodigo:"Insira um exemplo aqui"
    }
*/

export default {
    SELECIONAR: {
        nomeSQL: 'SELECT',
        descricao:
            'O comando `SELECIONAR` é utilizado para vizualizar os registros de uma tabela',
        documentacao:
            '# `SELECIONAR` \n É o comando utilizado para visualizar a parte especificada da tabela, podendo-se usar varios outros comandos em conjuto para ter um resultado mais especifico e legivel ao usuario',
        exemploCodigo: 'SELECIONAR NOME, EMAIL \nDE USUARIOS \nONDE ID = 1',
    },
    ATUALIZAR: {
        nomeSQL: 'UPDATE',
        descricao:'O comando `ATUALIZAR` é utilizado para modificar registros existentes em uma tabela.',
        documentacao:'# `ATUALIZAR` \n É o comando utilizado para modificar os registros de uma tabela',
        exemploCodigo:''
    }
};
