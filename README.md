# Extensão das linguagens da Design Líquido para Visual Studio Code

Essa extensão visa melhorar a produtividade de projetos escritos usando as linguagens: 

- [Delégua](https://github.com/DesignLiquido/delegua);
- [LMHT](https://github.com/DesignLiquido/LMHT);
- [FolEs](https://github.com/DesignLiquido/FolEs);
- [LinConEs](https://github.com/DesignLiquido/LinConEs);

Essa extensão também oferece suporte parcial a outras linguagens que são dialetos de Delégua:

- [Egua](https://egua.tech);
- [EguaP](https://github.com/DesignLiquido/delegua/wiki/Dialetos#eguap);
- [VisuAlg](https://visualg3.com.br/). 

## Instalação

Você pode instalar pesquisando nas extensões do Visual Studio Code [ou por este link](https://marketplace.visualstudio.com/items?itemName=designliquido.designliquido-vscode).

## Funcionalidades até então

- Sintaxe colorida
- Reconhecimento de expressões comuns das linguagens Delégua, Egua, EguaP e Portugol VisuAlg
- Ícones para arquivos `.delegua`, `.egua`, `.eguap`, `.foles`, `.lincones` e `.lmht`
- Trechos de códigos para facilitar desenvolvimento
- Suporte a depuração para Delégua

## Depuração

Delégua possui um protocolo próprio de comunicação entre depurador e cliente de depuração, [conforme especificado aqui](https://github.com/DesignLiquido/delegua/wiki/Suporte-%C3%A0-depura%C3%A7%C3%A3o). A ideia é que seja possível escrever interações entre diferentes clientes de depuração, como outros editores que tenham suporte a depuração, por exemplo. 

O Visual Studio Code também possui [um protocolo de comunicação detalhado aqui](https://microsoft.github.io/debug-adapter-protocol/overview). Para que Delégia e Visual Studio Code se entendam, é preciso um intermediador entre eles, implementado pela classe `DeleguaTempoExecucao`. 

Segundo a documentação do Visual Studio Code, linguagens podem usar ou um executável que faça a tradução das mensagens entre linguagem e Visual Studio Code, ou um servidor _Socket_ implementado dentro da extensão. Aqui optamos pela opção do servidor _Socket_, que abre em uma porta aleatória disponível. 

A extensão também comanda a execução de Delégua com a opção `--depurador` definida, que abre o servidor de depuração na porta 7777 e espera uma instrução de pronto para liberar os comandos de depuração para a interface do VSCode.
