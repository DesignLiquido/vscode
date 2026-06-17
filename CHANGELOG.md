# Histórico de Modificações

## 0.27.2

- Núcleo de Delégua atualizado para a versão 1.24.4:
  - Inferência mais robusta de tipos envolvendo `qualquer`;
  - Correção de decoradores com acesso a propriedades no Pituguês (resolve https://github.com/DesignLiquido/delegua/issues/1346);
  - Correção: `nao` interpretado como negação unária no Pituguês (resolve https://github.com/DesignLiquido/delegua/issues/1345).
- Incluindo lista de modificadores vinda do repositório FolEs.
- Atualização na validação de arquivos `.delprops` que trabalham com Liquido.

## 0.27.1

- Núcleo de Delégua atualizado para a versão 1.24.3:
  - Suporte a decoradores com parâmetros (resolve https://github.com/DesignLiquido/delegua/issues/1334);
  - Extensão de `LexadorBase` com otimizações de legibilidade e estrutura (resolve https://github.com/DesignLiquido/delegua/issues/1335);
  - Adição de testes para construtos de classes, dicionários, laços e tradutores; correções de _bugs_ colaterais encontrados.
- Potigol atualizado para a versão 0.11.11:
  - Correção para prevenir _loops_ infinitos usando `enquanto` (resolve https://github.com/DesignLiquido/potigol/issues/222);
  - Compreensão `para ... em ... gere` (resolve https://github.com/DesignLiquido/potigol/issues/221);
  - Aceita símbolo `senãose` ou `senaose` como alternativa a `senão se` (resolve https://github.com/DesignLiquido/potigol/issues/218).
- `delegua-lsp` atualizado para a versão 0.0.1.

## 0.27.0

- Núcleo de Delégua atualizado para a versão 1.24.2:
  - Implementação do arcabouço de FFIs (Interfaces de Funcionalidade Estrangeira);
  - Operador `tipo()`/`tipo de` retorna o tipo exato de cada dado em laços `para cada` sobre dicionários (resolve https://github.com/DesignLiquido/delegua/issues/1327);
  - Correção de falso positivo no analisador semântico de Pituguês quanto a soma de vetores (resolve https://github.com/DesignLiquido/delegua/issues/1328);
  - Impede uso de operadores matemáticos (`++`, `+=`, `-=`, etc.) em texto (resolve https://github.com/DesignLiquido/delegua/issues/1326);
  - Correção de _bug_ de operador unário negativo não ser tratado corretamente (resolve https://github.com/DesignLiquido/delegua/issues/1322);
  - Atualizações de gramáticas.
- Potigol atualizado para a versão 0.11.10:
  - Melhor inferência de tipos em operações binárias (resolve https://github.com/DesignLiquido/potigol/issues/217);
  - Expansão de casos na micro avaliação sintática (resolve https://github.com/DesignLiquido/potigol/issues/216);
  - Melhoramento de algoritmo de incremento em `para` (resolve https://github.com/DesignLiquido/potigol/issues/215);
  - Múltiplas faixas em laço `para` (resolve https://github.com/DesignLiquido/potigol/issues/209);
  - Correção em `para gere` para trabalhar com múltiplas faixas geradoras (resolve https://github.com/DesignLiquido/potigol/issues/208);
  - Repensando métodos de vetor `injete` e `selecione` (resolve https://github.com/DesignLiquido/potigol/issues/207);
  - Correções em vários métodos de texto (resolve https://github.com/DesignLiquido/potigol/issues/206);
  - Chamar método após indexação de lista com `[]` (resolve https://github.com/DesignLiquido/potigol/issues/204);
  - Acesso a elemento de lista como argumento de função (resolve https://github.com/DesignLiquido/potigol/issues/203).
- Liquido:
  - Registro de `lincones` como primitiva de rotas;
  - Expansão das verificações de LinConEs em projetos Liquido;
  - Verificação de configuração de LinConEs quando `lincones` é mencionado em alguma rota;
  - Melhorado suporte a URLs como valores em arquivos `.delprops`;
  - Melhorias na documentação em editor para arquivos de rotas;
  - Revisão da validação de arquivos `.delprops` para projetos Liquido.
- Suporte a argumentos nomeados de decoradores em Delégua;
- Correção de problemas relativos a particularidades de execução em ambiente Web;
- Introdução do `delegua-lsp`, servidor de protocolo de linguagem (_Language Server Protocol_) para Delégua; vários mecanismos de análise de código passam a ser delegados a este pacote.

## 0.26.2

- Núcleo de Delégua atualizado para a versão 1.23.5:
  - Impressão de emojis sem necessidade de aspas (resolve https://github.com/DesignLiquido/delegua/issues/1319);
  - Correção de mensagem de erro exibida no terminal após o uso de emojis sem aspas ao redor (resolve https://github.com/DesignLiquido/delegua/issues/1320);
  - Correção de inconsistência na resposta dos operadores de comparação e falsos positivos em comparações encadeadas (resolve https://github.com/DesignLiquido/delegua/issues/1318);
  - Correção do bloco `senão` não estar funcionando em `Tente/Pegue` (resolve https://github.com/DesignLiquido/delegua/issues/1313);
  - Correção de valor padrão de parâmetro de função não estar funcionando (resolve https://github.com/DesignLiquido/delegua/issues/1314);
  - Correção de vazamento de AST ao tentar usar operador de atribuição em chamada de função (resolve https://github.com/DesignLiquido/delegua/issues/1317);
  - Correção de `falhar` para funcionar corretamente no Pituguês, aceitando expressões (resolve https://github.com/DesignLiquido/delegua/issues/1307);
  - Correção de _bug_ relativo ao VisuAlg e resolução de argumentos de vetores;
  - Atualizações de gramáticas.
- Potigol atualizado para a versão 0.11.8:
  - `para` pode estar no lado direito da atribuição (resolve https://github.com/DesignLiquido/potigol/issues/201);
  - Lógica mais elaborada de interpolação de texto com objetos (resolve https://github.com/DesignLiquido/potigol/issues/200);
  - Correção de inferência de variáveis por `leia_inteiro` e `leia_real` (resolve https://github.com/DesignLiquido/potigol/issues/199);
  - Correção de `[object Object]` na saída de interpolações de texto (resolve https://github.com/DesignLiquido/potigol/issues/198);
  - Melhoria na inferência de tipos para chamadas aninhadas (resolve https://github.com/DesignLiquido/potigol/issues/195);
  - Correção da função `raiz` (resolve https://github.com/DesignLiquido/potigol/issues/196).
- VisuAlg atualizado para a versão 0.9.8:
  - Melhor inferência na inicialização de vetores, evitando problemas com `leia()` ao informar uma referência de vetor com índice.

## 0.26.1

- Núcleo de Delégua atualizado para a versão 1.23.3:
  - Correção de acesso de propriedade em valor nulo;
  - Analisador Semântico verifica a entidade ao acessar método ou propriedade;
  - Preservação de tipos primitivos em vetores e compreensão de listas;
  - Exigência de identificador válido após operador de ponto;
  - Chamada a `cederControle` nos laços de repetição para evitar travamento do navegador;
  - Operador de resto (`%`) funcionando corretamente;
  - Correção de tipagem incorreta ao receber o retorno de uma função;
  - `retorna` respeita valores iniciados com operador unário;
  - Correção de corrupção na inferência de tipos em declarações múltiplas de variáveis.
- Potigol atualizado para a versão 0.11.6:
  - Implementação de `se` em linha (resolve https://github.com/DesignLiquido/potigol/issues/191);
  - Nova declaração: atribuição paralela (resolve https://github.com/DesignLiquido/potigol/issues/190);
  - Correções de inferência de tipos em comandos `leia_` (resolve https://github.com/DesignLiquido/potigol/issues/189);
  - Correção de `senão se` ou `senãose` aninhado (resolve https://github.com/DesignLiquido/potigol/issues/188);
  - Correção de variáveis de controle dentro de `para` (resolve https://github.com/DesignLiquido/potigol/issues/187);
  - Correção de reatribuição de variável dentro de `enquanto` (resolve https://github.com/DesignLiquido/potigol/issues/186);
  - Vetores em Potigol começam com índice 1 (resolve https://github.com/DesignLiquido/potigol/issues/185);
  - Correção de falso positivo emitido pelo Analisador Semântico para exercícios do Beecrowd (resolve https://github.com/DesignLiquido/potigol/issues/184);
  - Correção do operador `formato` (resolve https://github.com/DesignLiquido/potigol/issues/183);
  - Melhoria na leitura da entrada padrão, possibilitando o uso de arquivos para automatização de testes do Beecrowd;
  - Implementação das bibliotecas `Arquivo` (leitura e escrita de arquivos) e `URL` (acesso à web) com dependência no sistema de arquivos e periféricos do Node.js.

## 0.26.0

- Núcleo de Delégua atualizado para a versão 1.23.0:
  - Funcionalidade de testes nativa para Delégua;
  - Sugestão de implementação de método inexistente em classe;
  - Analisador Semântico considera hierarquia de herança ao verificar métodos;
  - Avaliador Sintático não falha quando tipo de parâmetro ainda é desconhecido;
  - Melhor inferência de tipos para vetores;
  - Lógica mais robusta de interpolação de textos (_strings_ com interpolação);
  - Validação de quantidade mínima de argumentos em chamadas de função;
  - Otimizações na inferência e reconhecimento implícito de tipos;
  - Pituguês: refatoração dos métodos de primitivas de `vetor`.
- Suporte a arquivos `.teste.delegua` para execução de testes unitários diretamente no editor;
- Sugestão de implementação de métodos ausentes para Delégua;
- Pituguês:
  - Novo provedor de completude para funções nativas e métodos de primitivas, com suporte a sugestões de snippets: https://github.com/DesignLiquido/vscode/pull/90
- Potigol:
  - Correções de verificação de uso de variáveis e constantes pelo Analisador Semântico (resolve https://github.com/DesignLiquido/potigol/issues/177);
- Portugol Studio:
  - Adição de snippets: https://github.com/DesignLiquido/vscode/pull/91
- Ampliação da cobertura de testes unitários da extensão, incluindo testes para fluxogramas.

## 0.25.11

- Núcleo de Delégua atualizado para a versão 1.21.0:
  - Refatoração completa dos métodos globais de Pituguês;
  - Correção das primitivas `contém` / `contem` em Pituguês;
  - Correção de controle de fluxo em laços com depuração (`sustar`, `continua` e `retorne`);
  - Declaração de vetores passa a ignorar comentários corretamente;
  - Suporte ao decorador `@propriedade` em classes de Pituguês;
  - Melhorias para precisão de análise e ações rápidas com tabelas de códigos de erros e avisos.
- Novo provedor de renomeação de símbolos para Delégua, com suporte ao comando de renomear em funções, métodos e demais identificadores no editor;
- Salvaguarda experimental para parâmetros de decoradores sem nome;
- Correções no popup de suporte de sintaxe da função `imprima()` para Pituguês;
- Melhorias no mecanismo de descoberta de definições, incluindo cache para definições de classes estrangeiras em pacotes Delégua;
- Atualização periódica de pacotes e dependências.

## 0.25.10

- Núcleo de Delégua atualizado para a versão 1.18.4:
  - Correção em Pituguês: propriedades criadas dentro do método `construtor` agora podem ser acessadas;
  - Melhorias no analisador semântico para reconhecer mais casos de variáveis usadas em estruturas `escolha`, laços `para cada` e fluxos com `retorna`;
  - Verificação de tipagem de métodos chamados dentro de classes com `isto.`.
- Novo provedor de referências para Delégua, com suporte a encontrar referências no código;
- Renomeação de arquivos Delégua com atualização automática das importações relacionadas nos demais arquivos da solução;
- Adição de suporte a Líquido para Pituguês.

## 0.25.9

- Núcleo de Delégua atualizado para a versão 1.18.2:
  - Preservação de mais elementos com erros sintáticos durante a avaliação sintática, melhorando a integração com a extensão do VS Code;
  - Melhorias no analisador semântico: inferência de tipos mais precisa em `escolha`, regras baseadas em inicialização de variáveis e inferência para propriedades e métodos importados de classes em arquivos `.delegua`;
  - Pituguês: correção de implementação de métodos em `snake_case` e adição de funções nativas no analisador semântico, com testes de validação de funções globais;
  - Quando classe é usada como tipo de retorno, o analisador semântico passa a considerar a classe como usada;
  - Correções em Égua Clássico e no tradutor para AssemblyScript;
  - Ampliação de cobertura de testes unitários para ARM, RISC-V e biblioteca global de Tenda.
- Melhoramentos na extensão para capacidades semânticas e provedores de código no editor;
- Ajustes para trabalho com projetos modulares (como `delegua-delegua`) e melhor suporte a importações por diretórios relativos;
- Capacidade de compreensão de etiquetas em documentários;
- Atualização de contexto de Liquido ao abrir arquivos de rotas;
- Nova configuração para adicionar tipos explícitos durante a estilização de código em Delégua;
- Ampliação de testes unitários da extensão para tradução, LMHT, delprops, descobridor de definições, provedores de completude e formatação;
- Atualizações periódicas de pacotes e ajustes internos de manutenção.

## 0.25.8

- Núcleo de Delégua atualizado para a versão 1.17.2:
  - Correção de falso positivo de variável não usada em blocos `para cada` (resolve https://github.com/DesignLiquido/delegua/issues/1183);
  - Operador de espalhamento e guardas de tipos;
  - `função[]` passa a ser um tipo válido;
  - Correção de _bug_ com encadeamento de operações de dicionários (ex.: `dicionario.chaves().tamanho()`);
  - Movendo regra de explicitação de parâmetros do Formatador para o Estilizador;
  - Implementação da função `enumerar`;
  - Finalização da implementação do dialeto Portugol IPT, incluindo Lexador, Avaliador Sintático, Interpretador e tradutor de Portugol IPT para Delégua;
  - Funções nativas passam a ser consideradas nas análises semânticas de Delégua e Pituguês;
  - Consumindo ponto-e-vírgula opcional depois de `fazer ... enquanto`;
  - Atualização para TypeScript 6;
- Pituguês:
  - Novas funcionalidades na formatação de _strings_ com interpolação (_f-strings_).

## 0.25.7

- Extensão passa a reconhecer pacote `@designliquido/delegua-entidades`;
- Núcleo de Delégua atualizado para a versão 1.16.3:
  - Estilizador passa a trabalhar com limite de caracteres por linha (resolve https://github.com/DesignLiquido/delegua/issues/1179);
  - Adição de `funcaoVerificarIteracao` para verificação opcional de _loops_ infinitos durante certas execuções;
  - Adiciona propriedade `tiposDeFerramentasExternas` na classe `AvaliadorSintaticoPitugues`;
  - Correção do uso de variável com `fazer ... enquanto`, conforme reportado em https://github.com/DesignLiquido/delegua-web/issues/72;
  - Correção de _bug_ de chamada encadeada a `leia()`;
  - Finalização do tradutor reverso de Calango;
  - Expansão do tradutor reverso de Python: operadores de comparação e lógicos, operações matemáticas, mapeamento de tipos, operações com vetores e listas, laços de repetição, estruturas de saída de laço, definições de funções e classes, subscrição de listas, lógica `tente ... pegue`, lambdas e argumentos variáveis.
- Pituguês
  - `retorna` dentro de `para cada` dentro de uma `funcao` passa a encerrar a função (resolve https://github.com/DesignLiquido/delegua/issues/1180);
- Potigol
  - Adição do tradutor reverso de Potigol, para converter código de Potigol para Delégua.

## 0.25.6

- Delégua passa a trabalhar com classes estrangeiras. Classes estrangeiras se comportam como classes abstratas, mas são implementadas por código externo, como JavaScript ou C. Elas são úteis para trabalhar com bibliotecas externas, como as de manipulação de arquivos, ou para usar funcionalidades específicas de cada ambiente de execução;
- Adiciona provedor de documentação para Portugol Studio com suporte a hover
  - Adiciona tipos e constantes para Portugol Studio, incluindo `inteiro`, `real`, `cadeia`, `caracter`, `logico`, `verdadeiro` e `falso`, e comandos de entrada e saída (`escreva` e `leia`);
  - Adiciona suporte a comandos de entrada e saída, tipos e constantes no provedores de completude e documentação em código do Portugol Studio.

## 0.25.5

- Núcleo de Delégua atualizado para a versão 1.15.6:
  - Expansão do analisador semântico para trabalhar com definições externas;
  - Expansão da análise semântica para funções e blocos `se`;
  - Correção de falso positivo em atribuições em Delégua;
  - Correção de cenário com reutilização de variável de controle em laços `para`;
  - Correção para avaliação de declarações dentro do corpo de `enquanto`;
  - Expansão do formatador Delégua para funcionalidades recentes (incluindo extensões) e novos casos vindos do Beecrowd.
- Suporte ampliado para definições externas e uso do diretório de definições do projeto no editor;
- Ajustes para o editor trabalhar com definições de forma mais consistente;
- Redução de código não utilizado e melhoria de organização interna;
- Atualização de snippets de Delégua e Pituguês, incluindo evolução do provedor de completude de Pituguês;
- Preparação de empacotamento e lançamento de versão.

## 0.25.4

- Núcleo de Delégua atualizado para a versão 1.15.5:
  - Novo parâmetro de formatação `delegua.estilizador.delimitadorTexto`: permite escolher entre aspas simples, aspas duplas ou preservar o delimitador original de cada literal de texto;
  - Correção de _bug_ em que comentários de bloco eram removidos durante a formatação de código;
  - Reorganização de interfaces do Estilizador em submódulo próprio.
- Novo parâmetro de configuração `delegua.estilizador.delimitadorTexto` exposto na extensão.
- Quando o Estilizador está habilitado, a formatação agora ocorre em etapa única via `estilizarEFormatar`, respeitando o delimitador configurado.

## 0.25.3

- Suporte a arquivos de configuração de projetos Delégua (`.delprops`):
  - Colorização de sintaxe;
  - Validação de estrutura;
  - Completude de propriedades;
  - Documentação em editor (_hover_) para propriedades.
- Pituguês:
  - Novo provedor de completude com sugestões de funções nativas, primitivas e _snippets_;
  - Documentação em editor (_hover_) para funções nativas, métodos de primitivas, variáveis tipadas, funções e classes documentadas.
- Remoção do tema de ícones próprio da Design Líquido.
- Atualização de FolEs, LinConEs, LMHT e pacotes periódicos.

## 0.25.2

- Núcleo de Delégua atualizado para a versão 1.15.3:
  - Correções de _bugs_ no Pituguês reportados pela Camila Maia;
  - Finalização do dialeto Prisma;
  - Reformulação dos delimitadores de símbolos de tabulação e quebra de linha;
  - Exposição de `executarChamavel`, permitindo executar funções vindas de gatilhos de eventos;
  - Palavra reservada `em` passa a funcionar como operador equivalente a `contém` em comparações com textos;
  - Constantes de mínimo e máximo para tipos numéricos;
  - Variável inicializada com `nulo`, quando reatribuída com literal numérico, passa a ser inteira;
  - Correção de _bug_ em atribuição composta que gerava chave inconsistente em dicionários;
  - Escopo de variáveis e _shadowing_ em Pituguês.
- Finalização de implementação do dialeto Portugol Studio;
- Finalização de implementação do dialeto Potigol.

## 0.25.1

- Núcleo de Delégua atualizado para a versão 1.15.0:
- `logico` e `lógico` passam a ser tratados como tipos compatíveis em atribuições quando o lado direito contém uma operação lógica;
- Novos tradutores: Delégua para WebAssembly e para RISC-V Assembly
- Correções diversas no tradutor de Delégua para AssemblyScript;
- Suporte a decoradores em Pituguês;
- Aviso ao comparar valores de tipos diferentes no analisador semântico;
- Correções no bloco `para` na tradução de Delégua para x64;
- Vetor com elemento nulo não descarta mais o valor: https://github.com/DesignLiquido/delegua/issues/1139.

## 0.25.0

- Novo provedor de definição (_go to definition_) para Delégua, permitindo navegar até a declaração de classes, funções e variáveis;
- Melhoria na documentação em editor de classes: exibe assinatura completa com herança (`herda`), mesclas (`mescla`) e interfaces implementadas (`implementa`);
- Geração de _stubs_ de membros de interface corrigida: propriedades listadas antes de funções, sintaxe alinhada com Delégua (sem `funcao`, com `// AFAZER`);
- Correção em análise de código: erros do avaliador sintático agora são sempre reportados, mesmo quando não há exceção lançada;
- Gramática de colorização atualizada: distinção entre classes e interfaces, com suporte a `mescla` e `implementa`;
- Análise de código expandida para os dialetos `portugolstudio` e `potigol`.
- Núcleo de Delégua atualizado para a versão 1.13.0:
  - Implementação do analisador de documentário, para auxiliar editores a produzir elementos visuais de ajuda ao programador;
  - Suporte a decoradores com execução de função ao executar elementos decorados (v1.12.0);
  - Avaliador sintático passa a sugerir correções no código, assim como o analisador semântico (v1.11.1);
  - Correção: falha silenciosa em declarações incompletas no final do arquivo;
  - Correção no lexador de Pituguês: mesclagem incorreta de decimais em nova linha;
  - Cobertura de testes ampliada para primitivas de texto, vetor, tupla, dicionário e dialeto Pituguês.

## 0.24.1

- Correção de _bug_ em Pituguês em declaração de vetores com elementos separados por vírgula, conforme reportado em https://github.com/DesignLiquido/pitugues-web/issues/16;
- Diversos ajustes no tradutor de Delégua para AssemblyScript;
- Pituguês passa a trabalhar com tipagem explícita, da mesma forma que Delégua;
- Otimizações em vários dialetos, redução do código, melhor cobertura de testes.

## 0.24.0

- Adição de mecanismo de ações rápidas, para atualizações no código sugeridas pelo núcleo de Delégua;
- Atualização de FolEs;
- Operadores `ou`, `e`, `&`, `|` e `^` passam a trabalhar de forma transparente bit a bit em Delégua e Pituguês;
- Implementação das funções globais `entrada()`, `arredondar()` e `tipo()` para Pituguês.

## 0.23.1

- Correções diversas no mecanismo de tradução e geração de fluxogramas para Web;
- Simplificação da sintaxe de exibição de tuplas em Delégua de `[()]` para `()`: https://github.com/DesignLiquido/delegua/pull/1054;
- Implementação de métodos de primitiva `limpar`, `contar`, `estender`, `inserir` e `indice` para vetores em Pituguês: https://github.com/DesignLiquido/delegua/pull/1055;
- Implementação de formatação de pontos flutuantes em _f-string_ e usando o método `formatar()` em Pituguês: https://github.com/DesignLiquido/delegua/pull/1061;
- Implementação do tipo `longo` em Delégua e Pituguês: https://github.com/DesignLiquido/delegua/pull/1058.

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