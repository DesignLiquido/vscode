export default {
    SELECIONAR: {
        nomeSQL: 'SELECT',
        descricao:
            'O comando `SELECIONAR` é utilizado para vizualizar os registros de uma tabela',
        documentacao:
            '# `SELECIONAR` \n É o comando utilizado para visualizar a parte especificada da tabela, podendo-se usar varios outros comandos em conjuto para ter um resultado mais especifico e legivel ao usuario',
        exemploCodigo: 'SELECIONAR nome, email \n DE usuarios \n ONDE id = 1',
    },
    ATUALIZAR: {
        nomeSQL: 'UPDATE',
        descricao:
            'O comando `ATUALIZAR` é utilizado para modificar registros existentes em uma tabela.',
        documentacao:
            '# `ATUALIZAR` \n É o comando utilizado para modificar os registros de uma tabela',
        exemploCodigo:
            'ATUALIZAR usuarios \n RENOMEAR nome = "Novo Nome" \n ONDE id = 1',
    },
    INSERIR: {
        nomeSQL: 'INSERT',
        descricao:
            'O comando `INSERIR` é utilizado para adicionar novos registros a uma tabela.',
        documentacao:
            '# `INSERIR` \n É o comando utilizado para adicionar novos registros a uma tabela.',
        exemploCodigo:
            'INSERIR EM usuarios (nome, email) \n VALORES ("Novo Usuário", "novo@email.com")',
    },
    EXCLUIR: {
        nomeSQL: 'DELETE/DROP',
        descricao:
            'O comando `EXCLUIR` é utilizado para remover registros de uma tabela ou para remover uma tabela do banco de dados.',
        documentacao:
            '# `EXCLUIR` \n `EXCLUIR` é utilizado para remover registros de uma tabela e `EXCLUIR TABELA` é utilizado para remover uma tabela do banco de dados.',
        exemploCodigo:
            'EXCLUIR usuarios \n ONDE id = 1 \n\n EXCLUIR TABELA clientes',
    },
    CRIAR: {
        nomeSQL: 'CREATE',
        descricao:
            'O comando `CRIAR` é utilizado para criar uma nova tabela no banco de dados.',
        documentacao:
            '# `CRIAR` \n É o comando utilizado para criar uma nova tabela no banco de dados.',
        exemploCodigo:
            'CRIAR tabela clientes (id INT AUTO INCREMENTO CHAVE PRIMARIA, nome TEXTO(255), email TEXTO(255))',
    },
    ALTERAR: {
        nomeSQL: 'ALTER',
        descricao:
            'O comando `ALTERAR` é utilizado para modificar a estrutura de uma tabela existente.',
        documentacao:
            '# `ALTERAR` \n É o comando utilizado para modificar a estrutura de uma tabela existente.',
        exemploCodigo:
            'ALTERAR TABELA clientes \nADICIONAR COLUNA telefone TEXTO(20)',
    },
    RENOMEAR: {
        nomeSQL: 'RENAME',
        descricao:
            'O comando `RENOMEAR` é utilizado para alterar o nome de uma tabela ou coluna existente.',
        documentacao:
            '# `RENOMEAR` \n É o comando utilizado para alterar o nome de uma tabela ou coluna existente.',
        exemploCodigo:
            'ALTERAR TABELA Clientes \nRENOMEAR COLUNA Cidade PARA Bairro;',
    },
    MODIFICAR: {
        nomeSQL: 'MODIFY',
        descricao:
            'O comando `MODIFICAR` é utilizado para alterar a estrutura de uma coluna existente em uma tabela.',
        documentacao:
            '# `MODIFICAR` \n É o comando utilizado para alterar a estrutura de uma coluna existente em uma tabela.',
        exemploCodigo:
            'ALTERAR TABELA Pessoas \n MODIFICAR COLUNA DataNascimento ano;',
    },
    TABELA: {
        nomeSQL: 'TABLE',
        descricao:
            'O termo `TABELA` é utilizado para especificar que a operação envolve uma tabela no banco de dados.',
        documentacao:
            '# `TABELA` \n É utilizado para especificar que a operação envolve uma tabela no banco de dados.',
        exemploCodigo:
            'CRIAR tabela clientes (id INT AUTO INCREMENTO CHAVE PRIMARIA, nome TEXTO(255), email TEXTO(255))',
    },
    ADICIONAR: {
        nomeSQL: 'ADD',
        descricao:
            'O termo `ADICIONAR` é utilizado em operações `ALTERAR TABELA` para adicionar novas colunas, índices ou restrições a uma tabela existente.',
        documentacao:
            '# `ADICIONAR` \n É utilizado em operações `ALTERAR TABELA` para adicionar novas colunas, índices ou restrições a uma tabela existente.',
        exemploCodigo: 'ALTERAR TABELA Clientes ADICIONAR Email TEXTO(255);',
    },
    COLUNA: {
        nomeSQL: 'COLUMN',
        descricao:
            'O termo `COLUNA` é utilizado para especificar uma coluna em operações que envolvem a manipulação de colunas em uma tabela, como `ALTERAR TABELA` ou `EXCLUIR TABELA`.',
        documentacao:
            '# `COLUNA` \n É utilizado para especificar uma coluna em operações que envolvem a manipulação de colunas em uma tabela, como `ALTERAR TABELA` ou `EXCLUIR TABELA`.',
        exemploCodigo: 'ALTERAR TABELA Clientes EXCLUIR COLUNA Email;',
    },
    EM: {
        nomeSQL: 'INTO',
        descricao:
            'O termo `EM` é utilizado em operações `INSERIR` para indicar a tabela onde os registros serão adicionados.',
        documentacao:
            '# `EM` \n É utilizado em operações `INSERIR` para indicar a tabela onde os registros serão adicionados.',
        exemploCodigo:
            "INSERIR EM Clientes (NomeCliente, NomeContato, Endereco, Cidade, CodigoPostal, Pais) \n VALORES \n('José Silva', 'Antônio Souza', 'Rua Bela Vista 123', 'São Paulo', '03050-100', 'Brasil');",
    },
    VALORES: {
        nomeSQL: 'VALUES',
        descricao:
            'O termo `VALORES` é utilizado em operações `INSERIR` para especificar os valores a serem inseridos em uma tabela.',
        documentacao:
            '# `VALORES` \n É utilizado em operações `INSERIR` para especificar os valores a serem inseridos em uma tabela.',
        exemploCodigo:
            "INSERIR EM Clientes (NomeCliente, NomeContato, Endereco, Cidade, CodigoPostal, Pais) \nVALORES \n('José Silva', 'Antônio Souza', 'Rua Bela Vista 123', 'São Paulo', '03050-100', 'Brasil');",
    },
    ONDE: {
        nomeSQL: 'WHERE',
        descricao:
            'O termo `ONDE` é utilizado para impor condições em operações de seleção ou modificação de dados em uma tabela.',
        documentacao:
            '# `ONDE` \n É utilizado para impor condições em operações de seleção ou modificação de dados em uma tabela.',
        exemploCodigo: 'SELECIONAR * DE Clientes ONDE ID = 1;',
    },
    DE: {
        nomeSQL: 'FROM',
        descricao:
            'A cláusula `DE` é utilizada para especificar a tabela da qual deseja-se selecionar ou modificar os dados.',
        documentacao:
            '# `DE` \n É utilizada para especificar a tabela da qual deseja-se selecionar ou modificar os dados.',
        exemploCodigo: 'SELECIONAR * DE Clientes ONDE ID = 1;',
    },
    PARA: {
        nomeSQL: 'TO',
        descricao:
            'A palavra-chave `PARA` é utilizada em operações de alteração de tabela, como adicionar ou renomear colunas.',
        documentacao:
            '# `PARA` \n É utilizado em operações de alteração de tabela, como adicionar ou renomear colunas.',
        exemploCodigo: 'ALTERAR TABELA Clientes RENOMEAR COLUNA Cidade PARA Bairro;',
    },
};
