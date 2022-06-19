# Extensão da linguagem Delégua para Visual Studio Code

Essa extensão visa melhorar a produtividade de projetos escritos usando as linguagem [Delégua](https://github.com/DesignLiquido/delegua) e [Egua](https://egua.tech). 

## Funcionalidades até então

- Sintaxe colorida
- Reconhecimento de expressões comuns das linguagens Delégua e Egua
- Ícone para arquivos `.delegua` e `.egua`
- Trechos de códigos para facilitar desenvolvimento

## Funcionalidades em desenvolvimento

- Suporte a depuração

## Depuração

Delégua possui um protocolo próprio de comunicação entre depurador e cliente de depuração, [conforme especificado aqui](https://github.com/DesignLiquido/delegua/wiki/Suporte-%C3%A0-depura%C3%A7%C3%A3o). A ideia é que seja possível escrever interações entre diferentes clientes de depuração, como outros editores que tenham suporte a depuração, por exemplo. 

O Visual Studio Code também possui [um protocolo de comunicação detalhado aqui](https://microsoft.github.io/debug-adapter-protocol/overview). Para que Delégia e Visual Studio Code se entendam, é preciso um intermediador entre eles, implementado pela classe `DeleguaTempoExecucao`. 

Segundo a documentação do Visual Studio Code, linguagens podem usar ou um executável que faça a tradução das mensagens entre linguagem e Visual Studio Code, ou um servidor Socket implementado dentro da extensão. Aqui optamos pela opção do servidor Socket, que abre em uma porta aleatória disponível. 

