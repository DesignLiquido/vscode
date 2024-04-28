# Contribuir para essa extensão

## Os fontes

* `package.json` - Arquivo inicial de manifesto, apontando todos os arquivos da extensão.
* Diretório `gramaticas` - Arquivos de gramática do Text Mate: https://macromates.com/manual/en/language_grammars (inglês)
    * BIRL: `birl.tmLanguage.json`
    * Delégua: `delegua.tmLanguage.json`
    * Pituguês: `pitugues.tmLanguage.json`
    * LMHT: `lmht.tmLanguage.json`
    * VisuAlg: `visualg.tmLanguage.json`
* Diretório `configuracoes` - Arquivos de configuração das linguagens, onde se definem _tokens_ e palavras reservadas.
    * BIRL: `configuracao-birl.json`
    * Delégua: `configuracao-delegua.json`
    * Pituguês: `configuracao-pitugues.json`
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

## Instalar a extensão (modo manual)

* Para usar a extensão de modo manual, com o Visual Studio Code, copie todos os arquivos para `<seu diretório home>/.vscode/extensions` e reinicie o VSCode.

## Depuração

Para depurar a extensão, especialmente para acompanhar a execução de código por linguagem, é recomendado ligar (linkar) pacotes.

Os pacotes que podem ser linkados estão em `tsconfig.json`, no diretório raiz.

Primeiro é preciso clonar o repositório correspondente. Por exemplo, se queremos inspecionar o núcleo de Delégua, devemos clonar [`@designliquido/delegua`](https://github.com/DesignLiquido/delegua). Além disso, é preciso clonar também o pacote Node de Delégua, já que todas as linguagens que esta extensão interpreta são dependentes dele: [`@designliquido/delegua-node`](https://github.com/DesignLiquido/delegua-node). Se isso não for feito, o VSCode se perde na hora de encontrar os mapas de fontes, e o resultado será um arquivo JS (que não é o que queremos).

Após clonar os repositórios, é preciso avisar ao Yarn que queremos criar um link simbólico para cada um deles. Isso é feito pelo comando `yarn link` na raiz de cada repositório.

De volta a este repositório, use os comandos `yarn link "@designliquido/delegua"` e `yarn link "@designliquido/delegua-node"` no diretório raiz deste projeto para substituir os pacotes do `node_modules` pelos pacotes linkados. Os links simbólicos deve aparecer nos diretórios correspondentes dos pacotes dentro de `node_modules` (normalmente com uma setinha ao lado do diretório para indicar que é um link simbólico).

Por fim, comente as linhas que apontam para o diretório `dist` no `tsconfig.json`. No nosso exemplo, as linhas abaixo devem ser descomentadas:

```jsonc
{
    // ...
    paths: {
        // ...
        // "@designliquido/delegua": ["node_modules/@designliquido/delegua/dist"],
        // "@designliquido/delegua/*": ["node_modules/@designliquido/delegua/dist/*"],
        // "@designliquido/delegua-node": ["node_modules/@designliquido/delegua-node/dist"],
        // "@designliquido/delegua-node/*": ["node_modules/@designliquido/delegua-node/dist/*"],
        // ...
    }
    // ...
}
```

E descomente as linhas que apontam para o diretório `fontes`:

```jsonc
{
    // ...
    paths: {
        // ...
        "@designliquido/delegua": ["node_modules/@designliquido/delegua/fontes"],
        "@designliquido/delegua/*": ["node_modules/@designliquido/delegua/fontes/*"],
        "@designliquido/delegua-node": ["node_modules/@designliquido/delegua-node/fontes"],
        "@designliquido/delegua-node/*": ["node_modules/@designliquido/delegua-node/fontes/*"],
        // ...
    }
    // ...
}
```

### Dicas de pontos de parada

Abaixo temos algumas dicas de onde colocar pontos de parada para a inspeção de funcionalidades.

- Execução de código, qualquer linguagem: `fontes\depuracao\local\delegua-tempo-execucao-local.ts`, linha 212, ou seja:

```ts
            this.interpretador.instrucaoContinuarInterpretacao().then(_ => {
                // Pós-execução
                for (let erro of this.interpretador.erros) {
                    this.enviarEvento('saida', erro);
                }
            });
```

- Análise semântica: `fontes\analise-semantica\index.ts`, linhas 80 a 83:

```ts
    resultadoLexador = lexador.mapear(linhas, -1);
    resultadoAvaliadorSintatico = avaliadorSintatico.analisar(resultadoLexador, -1);
    resultadoAnalisadorSemantico = analisadorSemantico.analisar(resultadoAvaliadorSintatico.declaracoes);
    popularDiagnosticos(resultadoAnalisadorSemantico.diagnosticos, diagnosticos, documento);
```