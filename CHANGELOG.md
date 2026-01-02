# Histórico de Modificações

## 0.23.0

- Novos tradutores: Delégua para Elixir e Ruby;
- Geração de fluxogramas de Delégua agora suportam funções e classes;
- Funções nativas `maximo()`, `minimo()` e `somar()` para Pituguês: https://github.com/DesignLiquido/delegua/pull/1049;
- Correções de uso de parâmetros em procedimentos do VisuAlg.

## 0.22.1

- Delégua e Pituguês passam a suportar N aninhamentos de vetor: https://github.com/DesignLiquido/delegua/issues/1043;
- Pituguês passa a suportar diversos caracteres de escape: https://github.com/DesignLiquido/delegua/issues/913;
- Operador de desempacotamento de dicionários em Pituguês: https://github.com/DesignLiquido/delegua/issues/888;
- Formatação de texto com operador % em Pituguês: https://github.com/DesignLiquido/delegua/issues/1011;
- Equiparação de operadores de atribuição composta entre Delégua e Pituguês: https://github.com/DesignLiquido/delegua/issues/1014;
- Funções de conversão entre tuplas e vetores em Pituguês: https://github.com/DesignLiquido/delegua/issues/884.

## 0.22.0

- Atualizando _engine_ do VSCode para a versão 1.80.0;
- Método `partição()` para Delégua e Pituguês: https://github.com/DesignLiquido/delegua/pull/1031;
- Limitações e correções do uso de operadores `*` e `+` em Delégua;
- Revisão de casos no analisador semântico de dialetos de Delégua, como verificação mais apurada de tipos em operações matemáticas;
- Melhoramentos na exibição de erros de execução.

## 0.21.3

- Delégua e Pituguês passam a suportar um operador de repetição, `*`, entre um texto e um número inteiro: https://github.com/DesignLiquido/delegua/pull/1028;
- Diversos melhoramentos em diferentes analisadores semânticos dos dialetos de Delégua.

## 0.21.2

- Tuplas de tamanho N em Pituguês: https://github.com/DesignLiquido/delegua/pull/1025;
- Melhorias gerais nos formatadores de Mapler e Potigol;
- Remoção de bug em Potigol que poderia causar _loops_ infinitos;
- Correções em função nativa `intervalo()` para verificação de tipos de variáveis passadas por parâmetro em Delégua e Pituguês.

## 0.21.1

- Fatiamento (_slicing_) de coleções em Pituguês: https://github.com/DesignLiquido/delegua/pull/1012;
- Suporte a f-string em Pituguês, substituindo a interpolação vinda de Delégua: https://github.com/DesignLiquido/delegua/pull/1013;
- Várias atualizações em FolEs.

## 0.21.0

- Melhoramentos no mecanismo de adentrar escopo do depurador;
- Inclusão de um estilizador para Delégua, juntamente com a formatação de código;
- Novas sintaxes de Pituguês, como desempacotamento de coleções: https://github.com/DesignLiquido/delegua/pull/1008;
- Habilitação do analisador semântico de Pituguês: https://github.com/DesignLiquido/delegua/pull/1009.

## 0.20.3

- Melhoras gerais nos analisadores semânticos de todos os dialetos de Delégua;
- Implementação do desempacotamento de valores com operador `*` (resto) em Pituguês: https://github.com/DesignLiquido/delegua/pull/1007;
- Implementação de um avaliador de expressão para o painel de avaliação em depuração.

## 0.20.2

- Ajustes no painel de entrada e saída conforme sugestões de https://github.com/DesignLiquido/visualg/issues/82;
- Vários melhoramentos no analisador semântico de Delégua;
- Ajuste na gramática de Pituguês quanto a importação e alguns outros símbolos.

## 0.20.1

- Melhorias em biblioteca de criptografia para Delégua e Pituguês;
- Declaração de variáveis em Pituguês é sempre implícita: em outras palavras, `var` não é mais aceita como palavra reservada: https://github.com/DesignLiquido/delegua/pull/1001.

## 0.20.0

- Nova funcionalidade: geração de fluxogramas;
- Nova tradução: Delégua para ARM (Linux e Android);
- Correções no Pituguês para permitir alguns casos com ponto-e-vírgula no meio da linha.

## 0.19.2

- Nova tradução: Delégua para x64 (NASM e YASM);
- Primeira versão do formatador de código Pituguês.

## 0.19.1

- Correções em mecanismo de depuração para versão _web_;
- Correções no formatador Delégua para esta extensão.

## 0.19.0

- Primeira versão _web_ da extensão.

## 0.18.1

- Exponenciação à direita para todos os dialetos: https://github.com/DesignLiquido/delegua/pull/990;
- Nova biblioteca de Delégua: [`criptografia`](https://github.com/DesignLiquido/delegua-criptografia). 

## 0.18.0

- `contém` e `não contém` para Delégua e Pituguês;
- Adição de tradução de LinConEs para SQL.

## 0.17.3

- Adicionado método de primitiva de dicionário `.itens()` para Delégua e Pituguês: https://github.com/DesignLiquido/delegua/pull/981
- Mudanças internas em Delégua em como trabalhar com tuplas;
- Ajustes e colaterais nos dialetos para acomodar mudanças no núcleo de Delégua;
- Novo ícone para Pituguês;
- Correções diversas em _snippets_ de código.

## 0.17.2

- Correções diversas no dialeto VisuAlg quanto ao colorimento de palavras-chave e provedor de documentação em código: https://github.com/DesignLiquido/vscode/issues/79. 

## 0.17.1

- Pituguês passa a ter um conjunto de funções nativas e métodos de primitivas à parte, bem como seu próprio interpretador;
- Configurando símbolos de fechamento para Pituguês.

## 0.17.0

- Completude, documentação em editor, e mecanismo de assinatura de métodos reformulado em Delégua.

## 0.16.4

- Nova função nativa: `clonar()`, em Delégua: https://github.com/DesignLiquido/delegua/pull/957;
- Implantação do `se` ternário em Pituguês: https://github.com/DesignLiquido/delegua/pull/956;
- Camel Case para Snake Case em métodos de primitivas para Pituguês: https://github.com/DesignLiquido/delegua/pull/959;
- Correção em soma de vetores de Delégua;
- Delégua passa a suportar [compreensão de listas](https://github.com/DesignLiquido/delegua/wiki/Estruturas-de-dados-elementares#compreens%C3%A3o-de-listas);
- Atualização da versão de FolEs para 0.11.1.

## 0.16.3

- Suporte a [`se` ternário em Delégua](https://github.com/DesignLiquido/delegua/wiki/Condicionais#se-tern%C3%A1rio);
- Suporte ao operador Elvis em Delégua, para [coalescência de nulo](https://github.com/DesignLiquido/delegua/wiki/Operadores#operadores-de-coalesc%C3%AAncia-de-nulo);
- Melhoramentos na documentação de primitivas de vetor em Delégua;
- Correção no método de primitiva de vetor `encaixar` em Delégua;
- Pituguês passa a ter um micro-lexador.

## 0.16.2

- Delégua passa a suportar novo mecanismo de importação: `importar tudo como arquivos de arquivos`;
- Operador Elvis em Delégua, para coalescência de nulo: https://github.com/DesignLiquido/delegua/wiki/Operadores#operadores-de-coalesc%C3%AAncia-de-nulo

## 0.16.1

- Nova biblioteca para Delégua: `arquivos`;
- Modificações em passo-a-passo para Pituguês: https://github.com/DesignLiquido/vscode/pull/77.

## 0.16.0

- Passo-a-passo (_walkthrough_) para Pituguês: https://github.com/DesignLiquido/vscode/pull/75.

## 0.15.6

- Colateral pós atualização de versão de `delegua-node`: https://github.com/DesignLiquido/vscode/issues/71.

## 0.15.5

- Ajustes na forma de resolver valores de primitivas, e determinados tipos específicos de bibliotecas como Liquido;
- Atualização de FolEs.

## 0.15.4

- Correção em problema de buscar referência de vetor em dicionários de Delégua.

## 0.15.3

- Herança em Pituguês passa a ser mais próxima de Python: `classe Cachorro(Animal)`: https://github.com/DesignLiquido/delegua/issues/855;
- Pituguês não aceita mais constantes: https://github.com/DesignLiquido/delegua/issues/854;
- Correção em mecanismo para execução em modo de depuração, que avaliava incorretamente funções.

## 0.15.2

- Correção em Pituguês para detectar corretamente classes com herança;
- Delégua passa a suportar laços de repetição com `retorna`, acumulando o resultado a cada repetição;
- Ajustes gerais em gramáticas e bibliotecas.

## 0.15.1

- Painel de entrada e saída não some mais com o que havia no prompt em caso de troca de painéis;
- Reconfiguração da sessão de depuração para não mostrar o console de depuração na primeira execução;
- Ao finalizar execução pelo botão de parada do VSCode, avisa o usuário no painel de entrada e saída da finalização mais apropriadamente.

## 0.15.0

- Inclusão de primitivas de Liquido;
- Comentários permitidos entre elementos de vetor em Delégua.

## 0.14.7

- Inclusão do método `formatar()` para primitivas de número em Delégua: https://github.com/DesignLiquido/delegua/pull/835;
- Melhoramentos no provedor de completude de Delégua;
- Correção no método `copia` do VisuAlg: https://github.com/DesignLiquido/visualg/issues/33.

## 0.14.6

- Correção no formatador quanto a declarações com tipos explícitos, e separação de argumentos de `escreva()` por vírgula.

## 0.14.5

- Formatador passa a reportar erros de avaliação sintática quando houverem, em Delégua.

## 0.14.4

- Correções no formatador de código de Delégua;
- Melhorando o suporte de primitivas de dicionários na extensão para Delégua.

## 0.14.3

- Ajustes em primitivas de Delégua, Pituguês e Potigol, para atualizar referências em escopo de execução em caso de modificação de vetores.

## 0.14.2

- Inclusão de suporte a referências para dicionários em Delégua e Pituguês.

## 0.14.1

- Relançando versão com opção de pacotes externos revertida.

## 0.14.0

- Mudança em construção da extensão, deixando o tamanho dela muito menor, de Mb para Kb;
- Correção de problema em dicionários de Delégua trabalhando com valores nulos.

## 0.13.4

- `delegua-json` passa a trabalhar com o diretório base do arquivo em execução;
- Inclusão de duas novas primitivas de dicionário em Delégua: `contém()` e `remover()`;
- Registro de primitivas de dicionário de Delégua no editor (completude e documentação em código).

## 0.13.3

- Implementação de mecanismo de resolução de tipos para bibliotecas na etapa de avaliação sintática;
- Ajustes na análise semântica de Delégua ao analisar comandos `leia()`;
- Correção de problema de inferência de tipo de função em Delégua.

## 0.13.2

- Flexibilizando verificação de tipos para quando `qualquer` é usado em Delégua;
- Modificações para mecanismo de importação de bibliotecas específicas de Delégua, que agora aceitam um manifesto.

## 0.13.1

- Atualização da versão de FolEs;
- Correção de problema com inferência de funções anônimas para `mapear()` em Delégua e Pituguês.

## 0.13.0

- Início da transição desta extensão sem `delegua-node`, possibilitando uma execução 100% web de qualquer linguagem ou dialeto;
- Atualização de FolEs para a versão 0.9.3.

## 0.12.36

- Separação dos interpretadores com e sem mecanismo de depuração de todos os dialetos, corrigindo uma série de _bugs_ entre eles;
- Reintrodução do formatador de código do Portugol Studio.

## 0.12.35

- Suporte a funções da biblioteca global de Delégua em Pituguês.

## 0.12.34

- Ajustes na tipagem para declaração e chamadas de funções em Pituguês.

## 0.12.33

- Correções em Pituguês para alguns comandos, pós testes na extensão.

## 0.12.32

- Aferição de erros de avaliação sintática durante a execução de código para todas as linguagens suportadas por esta extensão;
- Diversas correções de _bugs_ e erros de Pituguês.

## 0.12.31

- Diversas atualizações de pacotes do ecossistema de todos os dialetos;
- Nova primitiva em Delégua: `numero.absoluto()`;
- Correções na análise semântica de Delégua.

## 0.12.30

- Correções no formatador do VisuAlg, conforme reportado pelo Discord;
- Atualizações na gramática de Delégua;
- Validação de tipos de argumentos para funções da biblioteca global e primitivas de Delégua.

## 0.12.29

- Atualização de Delégua para entender `numero()` e `número()` como funções de conversão para os respectivos tipos;
- Alguma atualização na gramática de LMHT.

## 0.12.28

- Correção na importação de fontes em Delégua por caminho relativo.

## 0.12.27

- Correção no formatador de código do VisuAlg para procedimentos e funções;
- Expansão na sintaxe de FolEs: https://github.com/DesignLiquido/FolEs/releases/tag/0.9.2.

## 0.12.26

- Correção no dialeto VisuAlg para emitir erro de sintaxe em caso de `se` sem o `fimse` correspondente;
- Correções no dialeto Pituguês para trabalhar com a devida influência de variáveis elementares;
- Atualizações na sintaxe colorida de Pituguês.

## 0.12.25

- Delégua passa a suportar função que devolve outra função, e operações de _currying_.

## 0.12.24

- Correção de lógica do importador em execução de Delégua.

## 0.12.23

- Atualizações gerais em Delégua e todos os dialetos desta extensão;
- Suporte a variáveis em FolEs.

## 0.12.22

- Funções `escreva` e `escreval` do VisuAlg passam a trabalhar sem a obrigatoriedade de parênteses;
- Ajuste no analisador semântico do Portugol Studio para reconhecer variáveis declaradas em escopos diferentes.

## 0.12.21

- Corrigindo problema com operador `mod` no VisuAlg: https://github.com/DesignLiquido/visualg/issues/17;
- Melhoramentos no analisador semântico de Portugol Studio: https://github.com/DesignLiquido/portugol-studio/pull/39.

## 0.12.20

- Corrigido erros no Portugol Studio : Erro se passar comentário no inicio do código ([#36](https://github.com/DesignLiquido/portugol-studio/issues/36)) e erro ao usar variáveis no `para` ([#35](https://github.com/DesignLiquido/portugol-studio/issues/35)).

## 0.12.19

- Atualização do analisador semântico do Portugol Studio: https://github.com/DesignLiquido/portugol-studio/issues/31. 

## 0.12.18

- Remoção de _bug_ no VisuAlg na análise sintática de `faça ... enquanto`: https://github.com/DesignLiquido/portugol-studio/issues/33.

## 0.12.17

- Remoção de _bug_ no VisuAlg que imprimia casas decimais a mais para `escreva()` contendo informação de casas decimais a serem impressas: https://github.com/DesignLiquido/visualg/issues/16.

## 0.12.16

- Remoção de _bug_ no VisuAlg que não imprimia elementos de matriz: https://github.com/DesignLiquido/visualg/issues/15.

## 0.12.15

- Atualização na biblioteca `lmht-js` para resolver um _bug_ relacionado a certas estruturas que não aparecem corretamente: https://github.com/DesignLiquido/lmht-js/issues/2 e https://github.com/DesignLiquido/lmht-js/issues/3;
- Implementação da biblioteca Objetos no dialeto Portugol Studio: https://github.com/DesignLiquido/portugol-studio/pull/30;
- Correção de _bug_ no VisuAlg em laço `para` aninhado: https://github.com/DesignLiquido/visualg/issues/13.

## 0.12.14

- Implementação de suporte a registros no VisuAlg: https://github.com/DesignLiquido/visualg/issues/12. 

## 0.12.13

- Diversas correções no dialeto Potigol.

## 0.12.12

- Correção de verificação de parâmetros na análise semântica do VisuAlg;
- Inclusão de chamadas de funções do VisuAlg quando nenhum parâmetro é passado.

## 0.12.11

- Correções de _bugs_ no dialeto BIRL;
- Correção de _bug_ na análise semântica do VisuAlg ao considerar que um procedimento deve retornar valor.

## 0.12.10

- Correção de _bug_ ao trazer pilha de escopos de execução em depuração com Delégua: https://github.com/DesignLiquido/vscode/issues/64;
- Ao executar código, trazendo a visão de entrada e saída mesmo que ela não esteja selecionada;
- Formatação de código para VisuAlg usando `Ctrl`/`Cmd` + `Shift` + `F`.

## 0.12.9

- Dialetos que não possuem suporte à importação de arquivos agora usam um importador que trabalha com a API do Visual Studio Code.

## 0.12.8

- Correção em dialeto do Portugol Studio para operadores `+=` e `-=`: https://github.com/DesignLiquido/portugol-studio/issues/27.

## 0.12.7

- Correção de condição de corrida no painel de entrada e saída quando há uma instrução de escrita antes de uma instrução de leitura: https://github.com/DesignLiquido/vscode/issues/62
- Correções em dialeto Potigol, que estava lendo o tipo do retorno de função incorretamente;
- Novos métodos de lista em Potigol: `descarte_enquanto`, `divida_quando`, `pegue_enquanto`.

## 0.12.6

- Correção de _bug_ no Portugol Studio na inicialização de matrizes vazias com valores por variáveis: https://github.com/DesignLiquido/portugol-studio/issues/17.

## 0.12.5

- Correção de _bug_ no Portugol Studio na inicialização de matrizes vazias: https://github.com/DesignLiquido/portugol-studio/issues/18.

## 0.12.4

- Correção no painel de Entrada e Saída em que não estava sendo possível usar o `backspace`;
- Correções no dialeto do Portugol Studio quanto a atribuição de valores em vetores (https://github.com/DesignLiquido/portugol-studio/issues/26 e https://github.com/DesignLiquido/portugol-studio/issues/23). 

## 0.12.3

- Novo suporte a bibliotecas globais pelo núcleo de Delégua;
- Novas bibliotecas para Portugol Studio: Tipos e Internet.

## 0.12.2

- Aprimoramento do suporte a Mapler, agora suportando módulos (funções);
- Resolução de problema no formatador do VisuAlg que transformava `escreval()` em `escreva()`.

## 0.12.1

- Resolvendo problema com impressões que apareciam com um `\n` no Portugol Studio: https://github.com/DesignLiquido/vscode/issues/61.

## 0.12.0

- Implementação de novo painel de entrada e saída, em substituição ao console de depuração, que não funciona direito com comandos de limpeza;
- Atualização em tradutores de Delégua para outras linguagens de forma a entender comentários.

## 0.11.1

- Função `limpa()` no Portugol Studio funcional para execução com pontos de parada;
- Função `limpatela` no VisuAlg funcional para execução com pontos de parada;
- Ajustes nas gramáticas de Delégua e Portugol Studio para entender comentários multilinha.

## 0.11.0

- Atualização geral em todos os dialetos, agora que comentários são considerados na avaliação sintática;
- Atualizações no formatador de código do VisuAlg.

## 0.10.22

- Correções no dialeto Portugol Studio quanto a vetores de cadeias de caracteres, e impressão de elementos usando `\n`.

## 0.10.21

- Novas funções e cores para FolEs (versão 0.7.0);
- Correções em dialeto VisuAlg quanto a comportamentos de escrita e laços de repetição em modo de depuração.

## 0.10.20

- Correção de problema com detecção de matrizes no Portugol Studio: https://github.com/DesignLiquido/portugol-studio/pull/14

## 0.10.19

- Permitindo uso de nome da biblioteca sem um nome de constante para Portugol Studio: https://github.com/DesignLiquido/portugol-studio/pull/12
- Anotações para tipos de primitivas em Delégua: https://github.com/DesignLiquido/delegua/pull/674

## 0.10.18

- Inclusão de quatro bibliotecas no Portugol Studio: Matemática, Texto, Calendário e Útil.

## 0.10.17

- Correção de inferência de variáveis no Portugol Studio: https://github.com/DesignLiquido/portugol-studio/pull/6

## 0.10.16

- Atualizado catálogo de métodos da biblioteca global: https://github.com/DesignLiquido/vscode/pull/56

## 0.10.15

- Correções de _bugs_ e ajustes em dialeto do VisuAlg;
- Fragmentos de código (_snippets_) para LinConEs;
- Diversas atualizações de pacotes e estrutura interna do projeto.

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

- Correções de _bugs_ em diferentes dialetos (VisuAlg e Potigol).

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
- Correção de _bug_ no passo dinâmico para instrução `para`, no VisuAlg.

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

- Correção de _bug_ em blocos de repetição com `sustar` em Delégua.

## 0.6.1

- Correção de _bug_ em blocos de repetição com `retorna` em Delégua.

## 0.6.0

- Adicionando suporte à depuração para BIRL.

## 0.5.8

- Permitindo quebras de linha entre cláusulas `caso` de comando `escolha` no VisuAlg.

## 0.5.7

- Correção de _bug_ no método `filtrarPor()` em Delégua.

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

- Corrigindo _bugs_ no dialeto VisuAlg em que funções e procedimentos que vinham antes de `var` não eram reconhecidos corretamente.

## 0.4.6

- Remoção de _bugs_ de atribuição para variáveis indexadas em vários dialetos.

## 0.4.5

- Redesenho da arquitetura de resolução de argumentos em tempo de depuração para todos os dialetos com suporte à depuração;
- Correção no Avaliador Sintático de Delégua quanto ao pragma (arquivo + linha) de atribuições de vetor.

## 0.4.4

- Correção em operadores lógicos `NAO` e `XOU` no dialeto VisuAlg.

## 0.4.3

- Correção de _bug_ ao intercalar comandos "próximo" e "continuar" na mesma depuração com VisuAlg.

## 0.4.2

- Correções de _bugs_ em instruções `enquanto` e `escolha` do VisuAlg.

## 0.4.1

- Adicionados três comandos de tradução de arquivos:
    - VisuAlg para Delégua;
    - Delégua para JavaScript;
    - JavaScript para Delégua.

## 0.4.0

- Suporte inicial a Portugol Studio e Portugol Webstudio.

## 0.3.11

- Resolvido _bug_: avaliação sintática de comparação igual no VisuAlg devolvendo símbolo errado pro interpretador.

## 0.3.10

- Resolvido _bug_: reatribuição de variáveis causando valores `NaN` em depuração.

## 0.3.9

- Resolvido _bug_: `enquanto (verdadeiro)` em Delégua causa loop infinito: https://github.com/DesignLiquido/vscode/issues/6
- Resolvido _bug_: `inteiro(leia())` chama o prompt três vezes: https://github.com/DesignLiquido/vscode/issues/7
- Resolvido _bug_: reatribuição de variáveis causando valores `NaN`.

## 0.3.8

- Registrando funções de entrada e saída do VisuAlg nos provedores de completude e documentação-em-código;
- Correção de _bug_ na chamada do formatador Delégua;
- Correção de _bug_ na depuração que não mostrava as variáveis atuais.

## 0.3.7

- Ajustes para VisuAlg no núcleo da linguagem;
- Documentação-em-código para VisuAlg (colocar o ponteiro do _mouse_ em cima do nome da função, mostra o que ela faz).

## 0.3.6

- Implementação da biblioteca básica do VisuAlg; 
- Provedor de completude para VisuAlg.

## 0.3.5

- Corrigindo _bug_ que não escrevia em console quando o método de saída é de escrita na mesma linha.

## 0.3.4

- Atualização de vários recursos de vários dialetos.

## 0.3.3

- Melhoramentos no dialeto Portugol Studio.

## 0.3.2

- Melhoramentos no dialeto VisuAlg.

## 0.3.1

- Correção de _bugs_ no dialeto VisuAlg;
- Atualização de ícone de LinCones.

## 0.3.0

- Sintaxe de FolEs e LinConEs;
- Ícones;
- Algum autocompletar e documentação.

## 0.2.8

- Mudança de lógica no descarte de escopos de execução durante depuração, o que corrige alguns comportamentos quanto depurando código em todas as linguagens suportadas;
- Ajuste na inspeção `hover` (passar o ponteiro do _mouse_ em cima) de variável, que não estava funcionando para variáveis com caracteres maiúsculos.

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