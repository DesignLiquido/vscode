# Histórico de Modificações

## 0.10.14

- Correções de _bugs_ e ajustes em dialetos do VisuAlg e Potigol.

## 0.10.13

- Formatador de código em Potigol (extensão `.poti`): https://github.com/DesignLiquido/delegua/pull/660
- Correções de _bugs_ e ajustes em dialetos do VisuAlg e Delégua.

## 0.10.12

- Ajustes em Delégua quanto à escrita de primitivas como texto.

## 0.10.11

- Diversos ajustes em Delégua e dialetos quanto a forma de escrita de certas variáveis, e organização arquitetural dos pacotes.

## 0.10.10

- Declaração `tendo ... como` para Delégua: https://github.com/DesignLiquido/delegua/pull/639.

## 0.10.9

- Funcionalidade de tuplas para Delégua: https://github.com/DesignLiquido/delegua/pull/627;
- Funcionalidade de formatação de código para o VisuAlg: https://github.com/DesignLiquido/delegua/pull/626.

## 0.10.8

- Novas primitivas para dicionários em Delégua: `dicionario.chaves()` e `dicionario.valores()`. 

## 0.10.7

- Atualizações em recursos de Delégua e Portugol Studio.

## 0.10.6

- Delégua e Pituguês receberam duas novas primitivas para números: `numero.arredondarParaCima()` e `numero.arredondarParaBaixo()`.

## 0.10.5

- Correções de _bugs_ no dialeto VisuAlg quanto ao laço `para` sem `passo` definido;
- Correção de funcionalidade do bloco `aleatorio` no dialeto VisuAlg.

## 0.10.4

- Atualização da biblioteca `lmht-js` para a versão 0.4.8;
- Ajustes na sintaxe de LinConEs;
- Correções em dialetos de Portugol: VisuAlg e Portugol Studio.

## 0.10.3

- Correção de _bug_ usando operador de negação no Portugol Studio: https://github.com/DesignLiquido/delegua/issues/595;
- Mais atualizações da gramática de LMHT;
- Atualização da biblioteca `lmht-js` para a versão 0.4.6.

## 0.10.2

- Atualização da biblioteca `delegua-node` para a versão 0.30.4;
- Atualização da gramática de LMHT.

## 0.10.1

- Correção de _bugs_ na avaliação semântica para o VisuAlg: https://github.com/DesignLiquido/delegua/pull/593;
- Implementação dos blocos `aleatorio` para o VisuAlg: https://github.com/DesignLiquido/delegua/pull/592;
- Atualização da biblioteca `lmht-js` para a versão 0.4.5.

## 0.10.0

- Avaliação semântica para o VisuAlg;
- Novo formatador de código para Delégua (`Alt`/`Option` + `Shift` + `F`).

## 0.9.21

- Atualização da biblioteca `delegua-node` para a versão 0.27.4;
- Atualização da documentação de declaração de vetor para o VisuAlg.

## 0.9.20

- Correção de _bug_ no dialeto VisuAlg quanto a ler e definir valores em matrizes: https://github.com/DesignLiquido/delegua/pull/575;
- Correção de _bug_ em Delégua quanto a aglutinação de argumentos de funções: https://github.com/DesignLiquido/delegua/pull/570;
- Novo analisador semântico: Mapler: https://github.com/DesignLiquido/delegua/pull/572;
- Ajustes na gramática de Delégua para reconhecer tipos de estruturas de dados com acentos.

## 0.9.19

- Correção de _bug_ no dialeto VisuAlg quanto a impressão de valores com casas decimais: https://github.com/DesignLiquido/delegua/pull/568

## 0.9.18

- Correção de _bug_ na tradução de CSS para FolEs.

## 0.9.17

- Atualização das bibliotecas `lmht-js` e `foles` para as versões 0.4.4 e 0.6.0, respectivamente.

## 0.9.16

- Delégua com suporte a destruturação de objetos.

## 0.9.15

- Atualização da biblioteca `lmht-js` para a versão 0.4.3.

## 0.9.14

- Atualização da biblioteca `delegua-node` para a versão 0.27.0;
- Atualização da biblioteca `lmht-js` para a versão 0.4.2;
- Análise semântica com avisos e erros.

## 0.9.13

- Atualização da biblioteca `delegua-node` para a versão 0.26.3.

## 0.9.12

- Atualização da biblioteca `lmht-js` para a versão 0.4.1.

## 0.9.11

- Ampliação do analisador semântico para casos envolvendo condição em `enquanto`.

## 0.9.10

- Implementação do método `qual_tipo` para objetos em Potigol;
- Melhoramentos no analisador semântico de Delégua.

## 0.9.9

- Permite uso de expressão regular em Delégua: `||expressao-aqui||`. Os símbolos são os mesmos de JavaScript.

## 0.9.8

- Atualização da biblioteca FolEs para a versão 0.5.1.

## 0.9.7

- Correção no Avaliador Sintático de Portugol Studio e Delégua em declarações `para`.

## 0.9.6

- Correções em Delégua para evitar `leia()` de ser chamado três vezes;
- Correções na saída de variáveis de Potigol.

## 0.9.5

- Auto-fechamento de estruturas LMHT;
- Correções na sintaxe colorida de LMHT;
- Sintaxe colorida em `fimpara` no dialeto VisuAlg;
- Correção de escrita de vetores no dialeto Potigol.

## 0.9.4

- Avaliação semântica ocorre apenas depois de 500ms após a última edição de arquivo.

## 0.9.3

- Melhorias na Análise Semântica;
- Corrige problema na declaração de vetores do VisuAlg.
- Método global `limpatela` do VisuAlg

## 0.9.2

- No dialeto VisuAlg palavra `até` pode ser acentuada ou não;
- Atualizações no reconhecimento de palavras reservadas do VisuAlg.

## 0.9.1

- Correções no dialeto VisuAlg para aceitar declarações de funções dentro do bloco `var`.

## 0.9.0

- Correções no dialeto VisuAlg para aceitar tanto comandos com acentos quanto sem;
- Implementação de funcionalidade de assinatura de funções da biblioteca global e primitivas para Delégua.

## 0.8.6

- Correções no dialeto de Potigol:
    - Atribuição de múltiplas constantes;
    - interpolação;
    - Manejo de tipos inteiros.

## 0.8.5

- Suporte à depuração para Potigol.

## 0.8.4

- Correções de bugs em diferentes dialetos (VisuAlg e Potigol).

## 0.8.3

- Dialeto VisuAlg aceita tanto `<-` quanto `:=` para atribuição.

## 0.8.2

- Dialeto VisuAlg aceita tanto `caracter` quanto `caractere`;
- Atualização da biblioteca `lmht-js`.

## 0.8.1

- Atualização de núcleos de FolEs e LMHT;
- Documentação em editor para FolEs aprimorada.

## 0.8.0

- Novas traduções:
    - LMHT para HTML
    - HTML para LMHT

## 0.7.23

- Correções no tradutor reverso de JavaScript para Delégua.

## 0.7.22

- Removido _bug_ em instrução `escolha` de Delégua.

## 0.7.21

- `escolha` em Delégua e Pituguês agora aceitam declarações de variáveis e constantes;
- Portando recursos de Delégua em Pituguês, como constantes e a instrução `falhar`.

## 0.7.20

- Nova tradução: Delégua para AssemblyScript;
- Correção em _bug_ do VisuAlg que não permitia usar uma função de uma biblioteca global usando uma variável.

## 0.7.19

- Adicionada lógica para obter erros específicos de execução do VisuAlg;
- Atualizado modelo de comando do `launch.json` para executar o arquivo aberto.

## 0.7.18

- Dialeto VisuAlg suporta tanto `para v de 1 ate 10` quanto `para v <- 1 ate 10` (https://github.com/DesignLiquido/delegua/issues/478);
- Vários _bugs_ retirados de diversos dialetos. Versão de Delégua atualizada para 0.24.2.

## 0.7.17

- Atualização de Delégua e FolEs para as versões 0.24.1 e 0.4.1, respectivamente;
- [Implementação de referência para parâmetros no dialeto VisuAlg](https://github.com/DesignLiquido/delegua/issues/476).

## 0.7.16

- Atualização de Delégua e FolEs para as versões 0.22.7 e 0.4.0, respectivamente.

## 0.7.15

- Atualização de Delégua e FolEs para as versões mais recentes;
- Adição do comando "Traduzir fonte FolEs para CSS".

## 0.7.14

- Melhorias no avaliador semântico ao atribuir variáveis.

## 0.7.13

- Correção de _bug_ em passo decremental do VisuAlg.

## 0.7.12

- Documentação de métodos primitivos em Delégua.

## 0.7.11

- Comparação lexicográfica de textos para Delégua e EguaP.
- Ajustes em métodos de primitivas de texto.

## 0.7.10

- Melhorias no dialeto de Portugol Studio.

## 0.7.9

- Correção fundamental em estrutura chamável.

## 0.7.8

- Melhorias na forma de realizar a tradução de arquivos.

## 0.7.7

- Tradução de Delégua para Python.
- Atribuição de variáveis na mesma linha em Delégua.
- Definindo `tipo de` equivalente ao typeof do JavaScript para Delégua.

## 0.7.6

- Correções de métodos de primitivas em Delégua.

## 0.7.5

- Interpolação de texto em Delégua agora suporta chamada de função e expressões.

## 0.7.4

- Método `ordenar()` em Delégua agora aceita como parâmetro uma função.

## 0.7.3

- Novos métodos para vetores em Delégua: `aparar`, `apararInicio`, `apararFim`;
- Novo método para textos em Delégua: `concatenar`;
- Correção de bug no passo dinâmico para instrução `para`, no VisuAlg.

## 0.7.2

- Novo método para vetores em Delégua: `encaixar`. 

## 0.7.1

- Implementação de passo dinâmico para instrução `para`, em caso de intervalos serem determinados por uma ou duas variáveis no VisuAlg. 

## 0.7.0

- Introdução de avaliação semântica para Delégua.

## 0.6.4

- Ajustes em tradução de Delégua para JavaScript e vice-versa.

## 0.6.3

- Atualização do núcleo de Delégua e dialetos para a versão 0.19.1;
- Nova instrução em Delégua: `para cada`;
- Nova primitiva para vetor: `vetor.concatenar()`.

## 0.6.2

- Correção de bug em blocos de repetição com `sustar` em Delégua.

## 0.6.1

- Correção de bug em blocos de repetição com `retorna` em Delégua.

## 0.6.0

- Adicionando suporte à depuração para BIRL.

## 0.5.8

- Permitindo quebras de linha entre cláusulas `caso` de comando `escolha` no VisuAlg.

## 0.5.7

- Correção de bug no método `filtrarPor()` em Delégua.

## 0.5.6

- Novo recurso de imutabilidade em Delégua (constantes);
- Novas palavras reservadas: `const`, `constante`, `fixo`, `variavel`, `variável`.

## 0.5.5

- Repensando estrutura de laço de repetição na instrução `para` do VisuAlg para ficar idêntico ao interpretador original.

## 0.5.4

- Resolvendo casos em que `leia()` é usado com vetores em VisuAlg, fazendo a conversão automática de tipos.

## 0.5.3

- Adição de esboços para VisuAlg;
- Correção em instrução `para` do dialeto VisuAlg para aceitar operações matemáticas básicas na denifição de condições.

## 0.5.2

- Correção em instrução `para` do dialeto VisuAlg para aceitar identificadores e números.

## 0.5.1

- Forçando extensão do arquivo corrente em minúscula na hora de alocar os componentes de interpretação para depuração.

## 0.5.0

- Início do suporte ao dialeto [Mapler](https://portugol.sourceforge.io/).

## 0.4.7

- Corrigindo bugs no dialeto VisuAlg em que funções e procedimentos que vinham antes de `var` não eram reconhecidos corretamente.

## 0.4.6

- Remoção de bugs de atribuição para variáveis indexadas em vários dialetos.

## 0.4.5

- Redesenho da arquitetura de resolução de argumentos em tempo de depuração para todos os dialetos com suporte à depuração;
- Correção no Avaliador Sintático de Delégua quanto ao pragma (arquivo + linha) de atribuições de vetor.

## 0.4.4

- Correção em operadores lógicos `NAO` e `XOU` no dialeto VisuAlg.

## 0.4.3

- Correção de bug ao intercalar comandos "próximo" e "continuar" na mesma depuração com VisuAlg.

## 0.4.2

- Correções de bugs em instruções `enquanto` e `escolha` do VisuAlg.

## 0.4.1

- Adicionados três comandos de tradução de arquivos:
    - VisuAlg para Delégua;
    - Delégua para JavaScript;
    - JavaScript para Delégua.

## 0.4.0

- Suporte inicial a Portugol Studio e Portugol Webstudio.

## 0.3.11

- Resolvido bug: avaliação sintática de comparação igual no VisuAlg devolvendo símbolo errado pro interpretador.

## 0.3.10

- Resolvido bug: reatribuição de variáveis causando valores `NaN` em depuração.

## 0.3.9

- Resolvido bug: `enquanto (verdadeiro)` em Delégua causa loop infinito: https://github.com/DesignLiquido/vscode/issues/6
- Resolvido bug: `inteiro(leia())` chama o prompt três vezes: https://github.com/DesignLiquido/vscode/issues/7
- Resolvido bug: reatribuição de variáveis causando valores `NaN`.

## 0.3.8

- Registrando funções de entrada e saída do VisuAlg nos provedores de completude e documentação-em-código;
- Correção de bug na chamada do formatador Delégua;
- Correção de bug na depuração que não mostrava as variáveis atuais.

## 0.3.7

- Ajustes para VisuAlg no núcleo da linguagem;
- Documentação-em-código para VisuAlg (colocar o mouse em cima do nome da função, mostra o que ela faz).

## 0.3.6

- Implementação da biblioteca básica do VisuAlg; 
- Provedor de completude para VisuAlg.

## 0.3.5

- Corrigindo bug que não escrevia em console quando o método de saída é de escrita na mesma linha.

## 0.3.4

- Atualização de vários recursos de vários dialetos.

## 0.3.3

- Melhoramentos no dialeto Portugol Studio.

## 0.3.2

- Melhoramentos no dialeto VisuAlg.

## 0.3.1

- Correção de bugs no dialeto VisuAlg;
- Atualização de ícone de LinCones.

## 0.3.0

- Sintaxe de FolEs e LinConEs;
- Ícones;
- Algum autocompletar e documentação.

## 0.2.8

- Mudança de lógica no descarte de escopos de execução durante depuração, o que corrige alguns comportamentos quanto depurando código em todas as linguagens suportadas;
- Ajuste na inspeção "hover" de variável, que não estava funcionando para variáveis com caracteres maiúsculos.

## 0.2.7

- Melhoramentos em pontos de parada;
- Atualização do funcionamento do código para o VisuAlg.

## 0.2.6

- Passando a usar `delegua-node` ao invés do núcleo puro de Delégua como pacote;
- Atualização das primitivas de vetor e texto para Delégua, tanto na completude quanto na documentação.

## 0.2.5

- Atualização da versão do núcleo de Delégua para a versão 0.13.2.

## 0.2.4

- Incluindo primitivas de texto e vetor, e bibliotecas globais, no mecanismo de completude de Delégua.

## 0.2.3

- Inclusão de recurso de depuração para EguaP.

## 0.2.2

- Correção de _bug_ quando depuração é iniciada sem um `launch.json` configurado.

## 0.2.1

- Adicionando suporte a depuração do Portugol VisuAlg.

## 0.2.0

- Reimplementação da sessão de depuração com o núcleo da linguagem inteiramente embarcado.

## 0.1.1

- Depuração remota funcional na extensão. Preparação para embarcar Delégua nas dependências da extensão.

## 0.1.0

- Esboço de formatador de código em Delégua;
- Ajustes no depurador quanto a inspeção de variáveis;
- Ícone para LMHT.

## 0.0.2

- Sintaxe colorida, extensão de arquivo e reconhecimento de extensão para a linguagem BIRL.

## 0.0.1

- Adicionado ícone e sintaxe colorida para EguaP.

## 0.0.0

- Lançamento da versão inicial, derivada da extensão Delégua (descontinuada).