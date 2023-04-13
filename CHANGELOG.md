# Histórico de Modificações

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
    - VisuAlg para Delégua
    - Delégua para JavaScript
    - JavaScript para Delégua

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