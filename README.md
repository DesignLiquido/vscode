# Linguagens em Português para Visual Studio Code

<p align="center">
  <a href="https://marketplace.visualstudio.com/items?itemName=designliquido.designliquido-vscode" title="Extensão no Visual Studio Marketplace">
    <img src="https://img.shields.io/visual-studio-marketplace/i/designliquido.designliquido-vscode?label=Visual%20Studio%20Marketplace" alt="Extensão no Visual Studio Marketplace" />
  </a>
  <a href="https://open-vsx.org/extension/designliquido/designliquido-vscode" title="Extensão na open-vsx.org">
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
- [Pituguês](https://github.com/DesignLiquido/delegua/wiki/Dialetos#pitugues);
- [Portugol Mapler](https://portugol.sourceforge.io/);
- [Portugol Studio](http://lite.acad.univali.br/portugol/);
- [Portugol VisuAlg](https://visualg3.com.br/);
- [Potigol](https://potigol.github.io).

## Instalação

Você pode instalar pesquisando nas extensões do Visual Studio Code [ou por este link](https://marketplace.visualstudio.com/items?itemName=designliquido.designliquido-vscode) (Windows e Mac), ou ainda [por este outro link](https://open-vsx.org/extension/designliquido/designliquido-vscode) (Linux, VSCodium, etc).

## Funcionalidades até então

- Sintaxe colorida
- Formatação de arquivos em Delégua
- Análise semântica para Delégua
- Reconhecimento de expressões comuns das linguagens Delégua, Égua, Pituguês e dialetos de Portugol, como VisuAlg, Portugol Studio/Webstudio e Mapler
- Ícones para arquivos `.delegua`, `.egua`, `.pitugues`, `.foles`, `.lincones` e `.lmht`, `.alg` (VisuAlg), `.por` (Portugol Studio/Webstudio), `.mapler` (Mapler)
- Trechos de códigos para facilitar desenvolvimento em Delégua
- Mecanismo de completude de funções da biblioteca global para Delégua
- Suporte a depuração para Delégua, Pituguês, Portugol VisuAlg, Portugol Studio/Webstudio e Mapler

## Tradução entre linguagens

Essa extensão suporta tradução entre linguagens:

- VisuAlg para Delégua;
- Delégua para JavaScript
- JavaScript para Delégua
- Delégua para Python

Pressione `Ctrl` + `Shift` + `p` (`Cmd` + `Shift` + `p` no Mac) e digite "tradução" para ter acesso aos comandos. Você pode atribuir atalhos de teclado a eles se quiser.

## Depuração

As linguagens que podem ser depuradas por esta extensão são:

- [Delégua](https://github.com/DesignLiquido/delegua);
- [Pituguês](https://github.com/DesignLiquido/delegua/wiki/Dialetos#pitugues);
- [Portugol Mapler](https://portugol.sourceforge.io/);
- [Portugol Studio](http://lite.acad.univali.br/portugol/);
- [Portugol VisuAlg](https://visualg3.com.br/);
- [Potigol](https://potigol.github.io).

Para depurar seu código, siga os passos de qualquer um dos vídeos abaixo:

- [Depurando Fibonacci em Delégua](https://www.youtube.com/watch?v=TQxLekzvBv8)
- [Depuração com VisuAlg no Visual Studio Code](https://www.youtube.com/watch?v=-L70aVOMduc)
- [Executando Portugol Studio e Portugol Webstudio no Visual Studio Code](https://www.youtube.com/watch?v=joLJo875hMs)

O resultado da execução aparecerá no painel "Entrada e Saída", que fica juntamente com o console de depuração e o terminal.