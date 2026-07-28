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

Delégua possui um protocolo próprio de comunicação entre depurador e cliente de depuração, [conforme especificado aqui](https://github.com/DesignLiquido/delegua/wiki/Suporte-%C3%A0-depura%C3%A7%C3%A3o). A ideia é que seja possível escrever interações entre diferentes clientes de depuração, como outros editores que tenham suporte a depuração, por exemplo. 

O Visual Studio Code também possui [um protocolo de comunicação detalhado aqui](https://microsoft.github.io/debug-adapter-protocol/overview). Para que Delégua e Visual Studio Code se entendam, é preciso um intermediador entre eles, implementado pela classe `DeleguaTempoExecucaoLocal`. 

Segundo a documentação do Visual Studio Code, linguagens podem usar ou um executável que faça a tradução das mensagens entre linguagem e Visual Studio Code, um servidor _Socket_ implementado dentro da extensão, ou ainda, uma implementação customizada. Até a versão 0.1.1 desta extensão, usávamos um servidor _Socket_  (ver classes `DeleguaTempoExecucaoRemota` e `DeleguaSessaoDepuracaoRemota`), que abre em uma porta aleatória disponível. Esta forma comanda a execução de Delégua com a opção `--depurador` definida, que abre o servidor de depuração na porta 7777 e espera uma instrução de pronto para liberar os comandos de depuração para a interface do VSCode. A implementação ainda existe, mas não é habilitada por padrão. Poderá voltar no futuro.

Atualmente, a extensão usa o núcleo da linguagem Delégua como uma dependência NPM e instancia e controla os elementos da linguagem. 

### Depurando a extensão

Basta executar o comando "Extensão", na opção "Executar e Depurar" do VSCode. Isso deve acionar o procedimento de construção e abrir a janela de testes da extensão.

#### Depuração com pacotes locais (alternativa ao `yarn link`)

O pipeline de build atual usa **ESBuild** (`esbuild ... --bundle`), que empacota todas as dependências em um único arquivo. O `yarn link` tradicional **não funciona** com este fluxo — o ESBuild ignora links simbólicos e o build falha ou produz resultados incorretos.

Para testar ou depurar alterações em pacotes do núcleo (`@designliquido/delegua`, `@designliquido/mapler`, etc.) localmente antes de publicá-los, use uma das alternativas abaixo.

##### Opção recomendada: `npm pack`

```bash
# 1. No repositório do pacote que deseja testar (ex.: @designliquido/delegua)
cd /caminho/para/delegua
npm pack
# Gera um arquivo designliquido-delegua-x.y.z.tgz no diretório atual

# 2. No repositório da extensão
cd /caminho/para/vscode
npm install /caminho/para/delegua/designliquido-delegua-x.y.z.tgz
```

O pacote é instalado como uma dependência normal em `node_modules` — o ESBuild o empacota sem problemas. Repita o `npm pack` + `npm install` a cada alteração.

##### Opção alternativa: `yarn link` com `--external` no ESBuild

Se preferir o fluxo de link simbólico, é preciso instruir o ESBuild a **não empacotar** os pacotes linkados:

```bash
# 1. Link os pacotes (como antes)
cd /caminho/para/delegua && yarn link
cd /caminho/para/delegua-node && yarn link
cd /caminho/para/vscode && yarn link "@designliquido/delegua" && yarn link "@designliquido/delegua-node"

# 2. Adicione --external para cada pacote linkado no script build-base do package.json:
#    "build-base": "esbuild ./fontes/extensao.ts --bundle --external:vscode --external:@designliquido/delegua --external:@designliquido/delegua-node ..."
#    Isso impede o ESBuild de empacotar esses pacotes; eles serão resolvidos via require() em tempo de execução.

# 3. No tsconfig.json, troque os paths de dist/ para fontes/ (veja comentários no próprio arquivo)
```

Desvantagem: os pacotes linkados não serão empacotados no `dist/extensao.js`. A extensão final dependerá dos `node_modules` em tempo de execução.

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
    resultadoAvaliadorSintatico = await avaliadorSintatico.analisar(resultadoLexador, -1);
    resultadoAnalisadorSemantico = analisadorSemantico.analisar(resultadoAvaliadorSintatico.declaracoes);
    popularDiagnosticos(resultadoAnalisadorSemantico.diagnosticos, diagnosticos, documento);
```