# Contribuir para essa extensão

## Os fontes

* `package.json` - Arquivo inicial de manifesto, apontando todos os arquivos da extensão.
* `syntaxes/delegua.tmLanguage.json` - Arquivo de gramática do Text Mate: https://macromates.com/manual/en/language_grammars (inglês)
* `language-configuration.json` - Arquivo de configuração da linguagem, onde se definem tokens e palavras reservadas.

## Como testar

* Recomendamos um Visual Studio Code em separado, como o Insiders: https://code.visualstudio.com/insiders/
* Com o projeto aberto no Visual Studio Code Insiders, verifique se todas as configurações em `language-configuration.json` estão corretas.
* Pressione `F5` para abrir uma nova janela com a extensão carregada.
* Crie um novo arquivo com a extensão `.delegua` ou `.egua`.
* Verifique se a sintaxe está colorida corretamente.

## Modificando

* Você pode reiniciar a extensão pela barra de debug após realizar modificações nos arquivos.
* Você também pode usar `Ctrl+R` ou `Cmd+R` no Mac para recarregar a janela.

## Adicionar mais funcionalidades na linguagem

* Para adicionar funcionalidades tipo IntelliSense, hovers e validadores, veja a documentação do VS Code em https://code.visualstudio.com/docs (inglês)

## Instalar sua extensão

* Para usar sua extensão, com o Visual Studio Code, copie todos os arquivos para `<seu diretório home>/.vscode/extensions` e reinicie o VSCode.
