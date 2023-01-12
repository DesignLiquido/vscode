# Contribuir para essa extensão

## Os fontes

* `package.json` - Arquivo inicial de manifesto, apontando todos os arquivos da extensão.
* Diretório `gramaticas` - Arquivos de gramática do Text Mate: https://macromates.com/manual/en/language_grammars (inglês)
    * BIRL: `birl.tmLanguage.json`
    * Delégua: `delegua.tmLanguage.json`
    * EguaP: `egua.tmLanguage.json`
    * LMHT: `lmht.tmLanguage.json`
    * VisuAlg: `visualg.tmLanguage.json`
* Diretório `configuracoes` - Arquivos de configuração das linguagens, onde se definem _tokens_ e palavras reservadas.
    * BIRL: `configuracao-birl.json`
    * Delégua: `configuracao-delegua.json`
    * EguaP: `configuracao-eguap.json`
    * LMHT: `configuracao-lmht.json`
    * VisuAlg: `configuracao-visualg.json`

## Como testar

* Recomendamos um Visual Studio Code em separado, como o Insiders: https://code.visualstudio.com/insiders/
* Com o projeto aberto no Visual Studio Code Insiders, verifique se todas as configurações nos arquivos JSON de configuração das linguagens estão corretas.
* Pressione `F5` para abrir uma nova janela com a extensão carregada.
* Crie um novo arquivo com alguma extensão de arquivo que esta extensão compreende, como `.delegua` ou `.alg`.
* Verifique se a sintaxe está colorida corretamente.

## Modificando a extensão

* Você pode reiniciar a extensão pela barra de debug após realizar modificações nos arquivos.
* Você também pode usar `Ctrl + R` ou `Cmd + R` no Mac para recarregar a janela.

## Adicionar mais funcionalidades na extensão

* Para adicionar funcionalidades tipo IntelliSense, _hovers_ e validadores, veja a documentação do VS Code em https://code.visualstudio.com/docs (inglês).

## Instalar sua extensão

* Para usar sua extensão, com o Visual Studio Code, copie todos os arquivos para `<seu diretório home>/.vscode/extensions` e reinicie o VSCode.
