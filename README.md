# Linguagens em Português para Visual Studio Code

<p align="center">
  <a href="https://marketplace.visualstudio.com/items?itemName=designliquido.designliquido-vscode" title="Extensão no Visual Studio Marketplace">
    <img src="https://img.shields.io/visual-studio-marketplace/i/designliquido.designliquido-vscode?label=Visual%20Studio%20Marketplace" alt="Extensão no Visual Studio Marketplace" />
  </a>
  <a href="https://marketplace.visualstudio.com/items?itemName=designliquido.designliquido-vscode" title="Extensão na open-vsx.org">
    <img src="https://img.shields.io/open-vsx/dt/designliquido/designliquido-vscode?label=open-vsx.org" alt="Extensão na open-vsx.org" />
  </a>
</p>

Essa extensão visa melhorar a produtividade de projetos escritos usando as linguagens da Design Líquido: 

- [Delégua](https://github.com/DesignLiquido/delegua);
- [LMHT](https://github.com/DesignLiquido/LMHT);
- [FolEs](https://github.com/DesignLiquido/FolEs);
- [LinConEs](https://github.com/DesignLiquido/LinConEs);

Essa extensão também oferece suporte parcial a outras linguagens que são dialetos de Delégua:

- [Egua](https://egua.tech);
- [EguaP](https://github.com/DesignLiquido/delegua/wiki/Dialetos#eguap);
- [Portugol Mapler](https://portugol.sourceforge.io/);
- [Portugol Studio](http://lite.acad.univali.br/portugol/);
- [Portugol VisuAlg](https://visualg3.com.br/).

## Instalação

Você pode instalar pesquisando nas extensões do Visual Studio Code [ou por este link](https://marketplace.visualstudio.com/items?itemName=designliquido.designliquido-vscode).

## Funcionalidades até então

- Sintaxe colorida
- Formatação de arquivos em Delégua
- Análise semântica para Delégua
- Reconhecimento de expressões comuns das linguagens Delégua, Égua, EguaP e dialetos de Portugol, como VisuAlg e Portugol Studio/Webstudio
- Ícones para arquivos `.delegua`, `.egua`, `.eguap`, `.foles`, `.lincones` e `.lmht`
- Trechos de códigos para facilitar desenvolvimento em Delégua
- Mecanismo de completude de funções da biblioteca global para Delégua
- Suporte a depuração para Delégua, EguaP, Portugol VisuAlg e Portugol Studio/Webstudio

## Tradução entre linguagens

Essa extensão suporta tradução entre linguagens:

- VisuAlg para Delégua;
- Delégua para JavaScript
- JavaScript para Delégua
- Delégua para Python

Pressione `Ctrl` + `Shift` + `p` (`Cmd` + `Shift` + `p` no Mac) e digite "tradução" para ter acesso aos comandos. Você pode atribuir atalhos de teclado a eles se quiser.

## Depuração

Delégua possui um protocolo próprio de comunicação entre depurador e cliente de depuração, [conforme especificado aqui](https://github.com/DesignLiquido/delegua/wiki/Suporte-%C3%A0-depura%C3%A7%C3%A3o). A ideia é que seja possível escrever interações entre diferentes clientes de depuração, como outros editores que tenham suporte a depuração, por exemplo. 

O Visual Studio Code também possui [um protocolo de comunicação detalhado aqui](https://microsoft.github.io/debug-adapter-protocol/overview). Para que Delégua e Visual Studio Code se entendam, é preciso um intermediador entre eles, implementado pela classe `DeleguaTempoExecucaoLocal`. 

Segundo a documentação do Visual Studio Code, linguagens podem usar ou um executável que faça a tradução das mensagens entre linguagem e Visual Studio Code, um servidor _Socket_ implementado dentro da extensão, ou ainda, uma implementação customizada. Aqui optamos pela opção do servidor _Socket_ até a versão 0.1.1 (ver classes `DeleguaTempoExecucaoRemota` e `DeleguaSessaoDepuracaoRemota`), que abre em uma porta aleatória disponível. Esta forma comanda a execução de Delégua com a opção `--depurador` definida, que abre o servidor de depuração na porta 7777 e espera uma instrução de pronto para liberar os comandos de depuração para a interface do VSCode. A implementação ainda existe, mas não é habilitada por padrão. Poderá voltar no futuro.

Atualmente a extensão usa o núcleo da linguagem Delégua como uma dependência NPM e instancia e controla os elementos da linguagem. 
