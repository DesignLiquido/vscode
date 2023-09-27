export default {
  'abreviacao': {
    nomeHtml: 'abbr',
    descricao: 'Estrutura utilizada como forma de abreviar uma parte específica do texto (ou criar um acrônimo), seja dentro de uma outra estrutura ou não.',
    documentacao: '# `abreviacao`\nGeralmente, nos artigos jornalísticos ou até mesmo textos dissertativos, deve-se utilizar a abreviação para que não seja necessário utilizar o termo inteiro, ou para que seja um informativo para o leitor.',
    exemploCodigo: '<titulo1>\n A Linguagem de Marcação Hiper-Texto <abreviacao> LMHT </abreviacao> foi criada por Leonel \n</titulo1>'
  },
  'abreviação': {
    nomeHtml: 'abbr',
    descricao: 'Estrutura utilizada como forma de abreviar uma parte específica do texto (ou criar um acrônimo), seja dentro de uma outra estrutura ou não.',
    documentacao: '# `abreviação`\nGeralmente, nos artigos jornalísticos ou até mesmo textos dissertativos, deve-se utilizar a abreviação para que não seja necessário utilizar o termo inteiro, ou para que seja um informativo para o leitor.',
    exemploCodigo: '<titulo1>\n A Linguagem de Marcação Hiper-Texto <abreviação> LMHT </abreviação> foi criada por Leonel \n</titulo1>'
  },
  'aparte': {
    nomeHtml: 'aside',
    descricao: 'Estrutura utilizada com o propósito de separação de conteúdos de uma página: o objetivo é deixar claro ao leitor qual é o tema principal da página.',
    documentacao: '# `aparte`\nÉ comum em páginas de Turismo, por exemplo, quando for feita alguma descrição de algum ponto turístico específico ou prato típico, de utilizar essa estrutura para que a leitura não seja desorganizada, e para que o conteúdo adicional sirva de apoio para a compreensão do assunto.',
    exemploCodigo: '<p>Meu nome é João. Tenho 34 anos, moro em Curitiba e gosto muito de bananas.</p>\n <aparte>\n <p>Banana é uma fruta com a cor amarela, originária da Indonésia. É encontrada em fazendas hortifruti e supermercados.</p>\n</aparte>'
  },
  'area': {
    nomeHtml: 'area',
    descricao: 'Estrutura que define uma área dentro de uma imagem.',
    documentacao: '# `area`\nA área definida permite que o usuário possa interagir com cliques, seja para acessar outras páginas, seja para ativar eventos na página a qual pertence.',
    exemploCodigo: '<imagem fonte="quadrado.png">\n <mapa nome="imagem-1">\n <area forma="retangulo" coordenadas="12,12,123,123" texto="retangulo.htm">\n</mapa>'
  },
  'área': {
    nomeHtml: 'área',
    descricao: 'Estrutura que define uma área dentro de uma imagem.',
    documentacao: '# `área`\nA área definida permite que o usuário possa interagir com cliques, seja para acessar outras páginas, seja para ativar eventos na página a qual pertence.',
    exemploCodigo: '<imagem fonte="quadrado.png">\n <mapa nome="imagem-1">\n <área forma="retangulo" coordenadas="12,12,123,123" texto="retangulo.htm">\n</mapa>'
  },
  'area-texto': {
    nomeHtml: 'textarea',
    descricao: 'Estrutura que declara um campo de entrada em que o usuário pode inserir um texto de várias linhas.',
    documentacao: '# `area-texto`\nPara definir as especificações da área de texto, a estrutura pode receber alguns atributos, tais como `autofoco`, `colunas`, `direção-texto` e `desabilitada`.',
    exemploCodigo: '<area-texto id="formulario" nome="area-formulario" linhas="4" colunas="40">\n Insira aqui uma descrição sobre a sua experiência profissional. \n<\area-texto>'
  },
  'área-texto': {
    nomeHtml: 'textarea',
    descricao: 'Estrutura que declara um campo de entrada em que o usuário pode inserir um texto de várias linhas.',
    documentacao: '# `área-texto`\nPara definir as especificações da área de texto, a estrutura pode receber alguns atributos, tais como `autofoco`, `colunas`, `direção-texto` e `desabilitada`.',
    exemploCodigo: '<área-texto id="formulario" nome="area-formulario" linhas="4" colunas="40">\n Insira aqui uma descrição sobre a sua experiência profissional. \n<\área-texto>'
  },
  'artigo': {
    nomeHtml: 'article',
    descricao: 'Estrutura que especifica um conteúdo independente e autocontido.',
    documentacao: '# `artigo`\nUm artigo deve fazer sentido por si só e deve ser possível distribuí-lo independentemente do resto do site. Seus usos potenciais são, por exemplo, para postagem em fórum, postagem em blog ou notícias. A estrutura <artigo> não é renderizada como algo especial em um navegador. No entanto, você pode usar CSS para estilizá-la.',
    exemploCodigo: '<artigo>\n <titulo2>Meu exemplo de artigo</titulo2>\n <p>Este é um artigo dentro de uma página HTML.</p>\n</artigo>'
  },
  'aspas': {
    nomeHtml: 'q',
    descricao: 'Estrutura que indica que o texto dentro da tag é uma pequena citação.',
    documentacao: '# `aspas`\nEste elemento destina-se a citações curtas que não requerem marcações de parágrafo.',
    exemploCodigo: '<paragrafo>\n De acordo com a Wikipédia, \n <aspas citar="https://pt.wikipedia.org/wiki/Miss%C3%A3o_tripulada_a_Marte">o congresso dos Estados Unidos apoiou uma missão tripulada para a Lua, seguida pela exploração de um asteroide em 2025 e Marte na década de 2030.</aspas>.\n</paragrafo>'
  },
  'audio': {
    nomeHtml: 'audio',
    descricao: 'Estrutura que implementa um controle de áudio, tendo como base um arquivo de formato áudio dentro do documento LMHT.',
    documentacao: '# `audio`\nPode usar opções variadas de extensões de arquivos de áudio, como MP3, OGG, WAV, etc. Seus usos potenciais são, por exemplo, programas de web-rádio ou sites de conteúdo educativo.',
    exemploCodigo: '<audio controles>\n <fonte src="audio.ogg" tipo="audio/ogg">\n <fonte src="music.mp3" tipo="audio/mp3">\n</audio>'
  },
  'áudio': {
    nomeHtml: 'audio',
    descricao: 'Estrutura que implementa um controle de áudio, tendo como base um arquivo de formato áudio dentro do documento LMHT.',
    documentacao: '# `áudio`\nPode usar opções variadas de extensões de arquivos de áudio, como MP3, OGG, WAV, etc. Seus usos potenciais são, por exemplo, programas de web-rádio ou sites de conteúdo educativo.',
    exemploCodigo: '<áudio controles>\n <fonte src="á.ogg" tipo="audio/ogg">\n <fonte src="music.mp3" tipo="audio/mp3">\n</áudio>'
  },
  'botao': {
    nomeHtml: 'button',
    descricao: 'Estrutura que renderiza um botão de forma retangular como padrão.',
    documentacao: '# `botao`\n Dentro de um elemento `<botao>` você pode colocar texto (por exemplo, `<itálico>`, `<negrito>`, `<quebra-linha>`, `<imagem>`, etc.), o que não é possível de fazer criando um botão com a estrutura `<campo>. Seus usos potenciais são, por exemplo, para formulários, ligações para outras páginas ou lógicas especiais dentro de uma página.',
    exemploCodigo: '<botao />'
  },
  'botão': {
    nomeHtml: 'button',
    descricao: 'Estrutura que renderiza um botão de forma retangular como padrão.',
    documentacao: '# `botão`\n Dentro de um elemento `<botão>` você pode colocar texto (por exemplo, `<itálico>`, `<negrito>`, `<quebra-linha>`, `<imagem>`, etc.), o que não é possível de fazer criando um botão com a estrutura `<campo>. Seus usos potenciais são, por exemplo, para formulários, ligações para outras páginas ou lógicas especiais dentro de uma página.',
    exemploCodigo: '<botão />'
  },
  'cabeca': {
    nomeHtml: 'head',
    descricao: 'Estrutura que funciona como um contêiner para metadados (dados sobre dados) e que costuma ser colocado entre as estruturas <lmht> e <corpo>.',
    documentacao: '# `cabeca`\n Estrutura de metadados, que são dados sobre o documento LMHT, e não são exibidos - exceto o título, que é exibido no topo da janela ou aba do navegador. Metadados normalmente definem o título do documento, conjunto de caracteres, estilos, scripts e outras informações.',
    exemploCodigo: '<lmht>\n <cabeca>\n  <titulo1> Meu Título </titulo1>\n </cabeca>\n</lmht>'
  },
  'cabeça': {
    nomeHtml: 'head',
    descricao: 'Estrutura que funciona como um contêiner para metadados (dados sobre dados) e que costuma ser colocado entre as estruturas <lmht> e <corpo>.',
    documentacao: '# `cabeça`\n Estrutura de metadados, que são dados sobre o documento LMHT, e não são exibidos - exceto o título, que é exibido no topo da janela ou aba do navegador. Metadados normalmente definem o título do documento, conjunto de caracteres, estilos, scripts e outras informações.',
    exemploCodigo: '<lmht>\n <cabeça>\n  <titulo1> Meu Título </titulo1>\n </cabeça>\n</lmht>'
  },
  'campo': {
    nomeHtml: 'input',
    descricao: 'Estrutura que renderiza na página um campos de formulário, seja textos ou caracteres numéricos e especiais.',
    documentacao: '# `campo`\n Estrutura mais essencial quando se trata de um formulário, pois é através dela que os valores são inseridos pelo usuário e enviados para sistemas. Além disso, é adaptável a vários tipos de páginas.',
    exemploCodigo: '<título1>Insira uma data:</título1>\n <campo tipo="date" />'
  },
  'campos': {
    nomeHtml: 'fieldset',
    descricao: 'Estrutura utilizada para agrupar elementos relacionados em um formulário.',
    documentacao: '# `campos`\n Estrutura que agrupa todos os itens que estão acoplados desde a abertura `<campos>` até a sua finalização `</campos>`. Desenha uma caixa ao redor dos elementos relacionados.',
    exemploCodigo: '<campos>\n <etiqueta for="nome">Nome: </etiqueta>\n <campo tipo="text" id="nome"></campo>\n <etiqueta for="email"> Email: </etiqueta>\n <campo tipo="email" id="email"> </campo>\n</campos>'
  },
  'canvas': {
    nomeHtml: 'canvas',
    descricao: 'Renderiza um campo no estilo gráfico, sendo o mesmo elaborado dos mais variados possíveis.',
    documentacao: '# `canvas`\n Pode renderizar gráficos voltado para jogos ou até mesmo os mais simples possíveis, dentro da página, no qual o desenvolvedor pode alterar as suas propriedades via JavaScript. Não será necessário a utilização deste atributo caso um atributo semelhante esteja mais disponível no momento. Um exemplo disso é a renderização da estrutura `canvas` sobre a estrutura `cabeçalho`, pois caso a estilização da estrutura cabeçalho seja graficamente exagerada, a utilização dos atributos `título` será mais viável.',
    exemploCodigo: '<canvas id="MeuCanvas" altura="200" largura="100"> </canvas>'
  },
  'celula': {
    nomeHtml: 'td',
    descricao: 'Estrutura que declara e/ou insere uma célula padrão dentro de uma `<tabela>`.',
    documentacao: '# `celula`\n Dentro da `<tabela>` onde está inserida a estrutura, poderá ser inserido dois formatos de `<célula>`, seja uma célula de cabeçalho (que detalha uma estrutura `<cabeça-tabela>`), sejam dados ou informação (que detalham uma estrutura `<corpo-tabela>`). Toda estrutura `<célula>` deve ter como estrutura mãe uma `<linha>`.',
    exemploCodigo: '<tabela>\n <corpo-tabela>\n  <linha>\n   <celula>Celula 1</celula>\n   <celula>Celula 2</celula>\n  </linha>\n </corpo-tabela>\n</tabela>'
  },
  'célula': {
    nomeHtml: 'td',
    descricao: 'Estrutura que declara e/ou insere uma célula padrão dentro de uma `<tabela>`.',
    documentacao: '# `célula`\n Dentro da `<tabela>` onde está inserida a estrutura, poderá ser inserido dois formatos de `<célula>`, seja uma célula de cabeçalho (que detalha uma estrutura `<cabeça-tabela>`), sejam dados ou informação (que detalham uma estrutura `<corpo-tabela>`). Toda estrutura `<célula>` deve ter como estrutura mãe uma `<linha>`.',
    exemploCodigo: '<tabela>\n <corpo-tabela>\n  <linha>\n   <célula>Celula 1</célula>\n   <célula>Celula 2</célula>\n  </linha>\n </corpo-tabela>\n</tabela>'
  },
  'citacao': {
    nomeHtml: 'blockquote',
    descricao: 'Estrutura que renderiza um campo contendo um texto em forma de citação obtido através de fontes externas.',
    documentacao: '# `citacao`\n Estrutura de texto comumente utilizada em textos acadêmicos, jornalísticos ou em enciclopédias em formato de site. O atributo `citar` especifica a origem da citação.',
    exemploCodigo: '<citação citar="https://linkcitacao.com.br">Só sei que nada sei - Sócrates</citação>'
  },
  'citação': {
    nomeHtml: 'blockquote',
    descricao: 'Estrutura que renderiza um campo contendo um texto em forma de citação obtido através de fontes externas.',
    documentacao: '# `citação`\n Estrutura de texto comumente utilizada em textos acadêmicos, jornalísticos ou em enciclopédias em formato de site. O atributo `citar` especifica a origem da citação.',
    exemploCodigo: '<citação citar="https://linkcitacao.com.br">Só sei que nada sei - Sócrates</citação>'
  },
  'citar': {
    nomeHtml: 'cite',
    descricao: 'Estrutura que representa uma referência a um trabalho artístico.',
    documentacao: '# `citar`\n Declara uma citação de um título de uma obra artística (poema, livro, filme, música, etc.) ou de alguma outra referência externa. Pode ser uma frase, um texto detalhado ou somente uma menção do nome da obra.',
    exemploCodigo: '<parágrafo> De acordo com o filósofo Sócrates:\n <citar> Só sei que nada sei </citar>\n</parágrafo>'
  },
  'codigo': {
    nomeHtml: 'code',
    descricao: 'Estrutura usada para definir um trecho de código de computador.',
    documentacao: '# `codigo`\n Declara e reconhece um campo específico do documento como uma linguagem de programação. É exibido no documento de forma e com a fonte padrão configurada.',
    exemploCodigo: '<parágrafo>\n <código>h1</código>\n É utilizado para inserir um título de grande tamanho no documento.\n</parágrafo>'
  },
  'código': {
    nomeHtml: 'code',
    descricao: 'Estrutura usada para definir um trecho de código de computador.',
    documentacao: '# `código`\n Declara e reconhece um campo específico do documento como uma linguagem de programação. É exibido no documento de forma e com a fonte padrão configurada.',
    exemploCodigo: '<parágrafo>\n <código>h1</código>\n É utilizado para inserir um título de grande tamanho no documento.\n</parágrafo>'
  },
  'coluna': {
    nomeHtml: 'col',
    descricao: 'Especifica as propriedades de cada coluna da estrutura `<grupo-colunas>`, seja seus atributos específicos ou a sua estilização.',
    documentacao: '# `coluna`\n Caso esteja inserida dentro da estrutura `<grupo-colunas>`, e a mesma contenha a estrutura `<tabela>`, então a estrutura `<coluna>` representa uma ou mais colunas da estrutura `<grupo-colunas>`. Caso a estrutura `<coluna>` esteja armazenando uma estrutura `<envelope-texto>`, o valor dela não poderá ser nulo.',
    exemploCodigo: '<grupo-colunas>\n <coluna span="2" estilo="background-color:blue">\n <coluna estilo="background-color:white">\n</grupo-colunas>'
  },
  'definicao': {
    nomeHtml: 'dfn',
    descricao: 'Estrutura que representa uma instância de definição de um termo.',
    documentacao: '# `definicao`\n É utilizada para especificar um termo que será melhor explicado posteriormente ou em seguida dentro do conteúdo da página. A estrutura mais próxima deverá conter a definição do conteúdo inserido dentro da estrutura `<definicao>`.',
    exemploCodigo: '<paragrafo>\n <definicao>Abacaxi</definicao> é uma fruta cujo nome começa com a letra A e tem a cor amarela.\n</parágrafo>'
  },
  'definição': {
    nomeHtml: 'dfn',
    descricao: 'Estrutura que representa uma instância de definição de um termo.',
    documentacao: '# `definição`\n É utilizada para especificar um termo que será melhor explicado posteriormente ou em seguida dentro do conteúdo da página. A estrutura mais próxima deverá conter a definição do conteúdo inserido dentro da estrutura `<definição>`.',
    exemploCodigo: '<paragrafo>\n <definição>Abacaxi</definição> é uma fruta cujo nome começa com a letra A e tem a cor amarela.\n</parágrafo>'
  },
  'detalhes': {
    nomeHtml: 'details',
    descricao: 'Estrutura que especifica detalhes adicionais que o usuário pode abrir e fechar sob demanda.',
    documentacao: '# `detalhes`\n Renderiza um campo em que o usuário pode tanto minimizar quanto restaurar dentro da página. Seu conteúdo deverá ser focado em detalhes ou informações adicionais.',
    exemploCodigo: '<detalhes>\n <sumario>Exemplo</sumario>\n <paragrafo>\n  Este é um texto de exemplo que será aberto quando o usuário interagir com a estrutura detalhes.\n </paragrafo>\n</detalhes>'
  },
  'endereco': {
    nomeHtml: 'address',
    descricao: 'Declara as informações de contato vindas do autor ou proprietário do artigo ou da página.',
    documentacao: '# `endereco`\nA estrutura não deverá declarar um endereço arbitrário (caixa postal), a menos que esse endereço de fato contenha informações relevantes de contato - a estrutura `<parágrafo>` ou `<paragrafo>` é a mais recomendada para a declaração de caixas postais. Também é recomendado a utilização de somente e exclusivamente de conteúdos citados acima, de modo com que a organização e sistematização da página seja de fácil acesso.',
    exemploCodigo: '<endereco>\n Conteúdo escrito por <ligacao href="mailto:central@pedroartigos.com">Pedro Alves</ligacao>\n Visite a nossa sede em: <quebra-linha />\n Rua 25 de Março, 1616 <quebra-linha />\n São Paulo, SP <quebra-linha />\n Brasil\n</endereco>'
  },
  'endereço': {
    nomeHtml: 'address',
    descricao: 'Declara as informações de contato vindas do autor ou proprietário do artigo ou da página.',
    documentacao: '# `endereço`\nA estrutura não deverá declarar um endereço arbitrário (caixa postal), a menos que esse endereço de fato contenha informações relevantes de contato - a estrutura `<parágrafo>` ou `<paragrafo>` é a mais recomendada para a declaração de caixas postais. Também é recomendado a utilização de somente e exclusivamente de conteúdos citados acima, de modo com que a organização e sistematização da página seja de fácil acesso.',
    exemploCodigo: '<endereço>\n Conteúdo escrito por <ligacao href="mailto:central@pedroartigos.com">Pedro Alves</ligacao>\n Visite a nossa sede em: <quebra-linha />\n Rua 25 de Março, 1616 <quebra-linha />\n São Paulo, SP <quebra-linha />\n Brasil\n</endereço>'
  },
  'envelope-texto': {
    nomeHtml: 'span',
    descricao: 'Estrutura utilizada da mesma finalidade que a estrutura `<divisão>`, porém sua estilização é por padrão inline, ao invés de block como no caso da estrutura `<divisão>`.',
    documentacao: '# `envelope-texto`\n É utilizado para a marcação de um texto ou de uma parte específica de um documento, e também para uma estilização mais rápida e eficaz utilizando a estrutura `<script>` e/ou `<estilo>`.',
    exemploCodigo: '<paragrafo> Meu carro é da cor <envelope-texto estilo="color:blue">azul</envelope-texto>'
  },
  'etiqueta': {
    nomeHtml: 'label',
    descricao: 'Estrutura que representa uma legenda para um item em uma interface de usuário. ',
    documentacao: '# `etiqueta`\n Pode estar associado com um elemento de controle, colocando este dentro do elemento `<etiqueta>`, ou usando o atributo `para`. Um `<campo>` pode ser associado a diversas etiquetas. Verifique a documentação para ler a lista completa de estruturas que podem ser associados a uma `,`<etiqueta>`.',
    exemploCodigo: '<formulário>\n <etiqueta para="entrada1">Entrada 1</etiqueta>\n <campo tipo="radio" id="entrada1" />\n <etiqueta para="entrada2">Entrada 2</etiqueta>\n <campo tipo="radio" id="entrada2" />\n</formulário>'
  },
  'excluido': {
    nomeHtml: 'del',
    descricao: 'Estrutura que representa uma parte do texto que foi excluída de um documento. Este elemento é (não necessariamente) renderizado pelos navegadores com uma linha entre o texto. ',
    documentacao: '# `excluido`\n Declara um texto traçado dentro da página, indicando que o seu conteúdo fôra deletado na página e/ou substituído por outro. Ao utilizar essa estrutura, é opcional a inserção da estrutura `<inserido>` para indicar o conteúdo a ser destacado como novo.',
    exemploCodigo: '<paragrafo> Eu gosto de <excluido> Maçã </excluido> <inserido> Banana </inserido>'
  },
  'excluído': {
    nomeHtml: 'del',
    descricao: 'Estrutura que representa uma parte do texto que foi excluída de um documento. Este elemento é (não necessariamente) renderizado pelos navegadores com uma linha entre o texto. ',
    documentacao: '# `excluído`\n Declara um texto traçado dentro da página, indicando que o seu conteúdo fôra deletado na página e/ou substituído por outro. Ao utilizar essa estrutura, é opcional a inserção da estrutura `<inserido>` para indicar o conteúdo a ser destacado como novo.',
    exemploCodigo: '<paragrafo> Eu gosto de <excluído> Maçã </excluído> <inserido> Banana </inserido>'
  },
  'exemplo': {
    nomeHtml: 'samp',
    descricao: 'Estrutura usada para definir a saída de um programa de computador. ',
    documentacao: '# `exemplo`\n Declara uma representação (exemplo) de uma saída de um programa de computador ou de um sistema operacional. Seu conteúdo será renderizado para o navegador utilizando a fonte padrão de navegador (monospace).',
    exemploCodigo: '<paragrafo> Apareceu a seguinte mensagem: </paragrafo>\n<paragrafo> <exemplo> arquivo nao encontrado </exemplo> </paragrafo>'
  },
  'formulario': {
    nomeHtml: 'form',
    descricao: 'Estrutura que representa uma seção do documento contendo controles interativos para envio de informações. ',
    documentacao: '# `formulario`\n Declara um campo pré-definido para a elaboração de um formulário, de modo com que renderize um campo mais organizado e estruturado para o usuário.',
    exemploCodigo: '<formulario ação="/registrar.php" método="get">\n <etiqueta for="nome"> Nome Completo: </etiqueta>\n <campo tipo="texto" id="nome" />\n <etiqueta for="data-nasc"> Data de Nascimento: </etiqueta>\n <campo tipo="data" id="data" />\n <botão tipo="botão"> Registro </botão>\n</formulario>'
  },
  'formulário': {
    nomeHtml: 'form',
    descricao: 'Estrutura que representa uma seção do documento contendo controles interativos para envio de informações. ',
    documentacao: '# `formulário`\n Declara um campo pré-definido para a elaboração de um formulário, de modo com que renderize um campo mais organizado e estruturado para o usuário.',
    exemploCodigo: '<formulário ação="/registrar.php" método="get">\n <etiqueta for="nome"> Nome Completo: </etiqueta>\n <campo tipo="texto" id="nome" />\n <etiqueta for="data-nasc"> Data de Nascimento: </etiqueta>\n <campo tipo="data" id="data" />\n <botão tipo="botão"> Registro </botão>\n</formulário>'
  },
  'grupo-colunas': {
    nomeHtml: 'colgroup',
    descricao: 'Estrutura que agrupa um ou mais colunas de uma tabela para a formatação.',
    documentacao: '# `grupo-colunas`\n Caso a estrutura `<grupo-colunas>` armazena nenhuma estrutura `<coluna>`, deverá ser armazenado uma estrutura `<envelope-texto>`, com o seu valor acima de zero. Ela deverá ser inserida dentro da estrutura `<tabela>` e atrás das estruturas `<corpo-tabela>` e `<linha>`.',
    exemploCodigo: '<tabela>\n  <grupo-colunas>\n  <coluna span="2" estilo="background-color:blue">\n  <coluna estilo="background-color:white">\n </grupo-colunas>\n</tabela>'
  },
  'grupo-opcoes': {
    nomeHtml: 'optgroup',
    descricao: 'Estrutura utilizada para agrupar um grupo de estruturas `<opção>` ou `<opcao>` dentro da estrutura `<formulário>`.',
    documentacao: '# `grupo-opcoes`\n Além de reunir estruturas, é utilizado para catalogar e organizar, para que o desenvolvedor tenha mais facilidade ao desenvolver a página, no caso de se utilizar listas longas ou opções com uma relação entre elas mesmas.',
    exemploCodigo: '<etiqueta for="frutas"> Escolha uma fruta: </etiqueta>\n <selecao nome="frutas" id="frutas">\n  <grupo-opcoes etiqueta="Frutas Vermelhas">\n   <opcao valor="morango"> Morango </opcao>\n   <opcao valor="cereja"> Cereja </opcao>\n  </grupo-opcoes>\n</seleção>'
  },
  'grupo-opções': {
    nomeHtml: 'optgroup',
    descricao: 'Estrutura utilizada para agrupar um grupo de estruturas `<opção>` ou `<opcao>` dentro da estrutura `<formulário>`.',
    documentacao: '# `grupo-opções`\n Além de reunir estruturas, é utilizado para catalogar e organizar, para que o desenvolvedor tenha mais facilidade ao desenvolver a página, no caso de se utilizar listas longas ou opções com uma relação entre elas mesmas.',
    exemploCodigo: '<etiqueta for="frutas"> Escolha uma fruta: </etiqueta>\n <selecao nome="frutas" id="frutas">\n  <grupo-opções etiqueta="Frutas Vermelhas">\n   <opcao valor="morango"> Morango </opcao>\n   <opcao valor="cereja"> Cereja </opcao>\n  </grupo-opções>\n</seleção>'
  },
  'imagem': {
    nomeHtml: 'img',
    descricao: 'Estrutura que renderiza um arquivo de imagem dentro do documento LMHT. ',
    documentacao: '# `imagem`\n As imagens não são tecnicamente inseridas em uma página da web; as imagens estão vinculadas a páginas da web. A `<imagem>` cria um espaço de retenção para a imagem referenciada.',
    exemploCodigo: '<imagem origem="batata_cozida.png" altura="100" largura="100" />'
  },
  'inserido': {
    nomeHtml: 'ins',
    descricao: 'Estrutura que representa um intervalo de texto que foi adicionado a um documento. ',
    documentacao: '# `inserido`\n Declara um texto com a indicação de que foi inserido a posteriori em um documento. Os navegadores geralmente aplicam o efeito de sublinhado no texto dentro dessa estrutura.',
    exemploCodigo: '<parágrafo>\n Minha comida favorita é <excluído>almôndegas</excluído> <inserido>lasanha</inserido>\n</parágrafo>'
  },
  'invisivel': {
    nomeHtml: 'template',
    descricao: 'Estrutura que armazena um grupo de um ou mais estruturas no qual estará escondido quando a página carregar.',
    documentacao: '# `invisivel`\n Você pode utilizar essa estrutura para armazenar um grupo de estruturas que você utilizará frequentemente.',
    exemploCodigo: '<invisivel>\n <titulo2> Flor </titulo2>\n <imagem origem="flor.png" />\n</invisivel>'
  },
  'invisível': {
    nomeHtml: 'template',
    descricao: 'Estrutura que armazena um grupo de um ou mais estruturas no qual estará escondido quando a página carregar.',
    documentacao: '# `invisível`\n Você pode utilizar essa estrutura para armazenar um grupo de estruturas que você utilizará frequentemente.',
    exemploCodigo: '<invisível>\n <titulo2> Flor </titulo2>\n <imagem origem="flor.png" />\n</invisível>'
  },
  'italico': {
    nomeHtml: 'em',
    descricao: 'Estrutura que renderiza um texto estilizado em itálico.',
    documentacao: '# `italico`\n É utilizado pra dar ênfase em um conteúdo específico de um artigo e/ou texto. O nivel de enfatização é aumentado conforme a quantidade de estruturas `<italico>` são utilizadas ao redor do texto.',
    exemploCodigo: '<paragrafo> LMHT é uma linguagem de <italico> marcação </italico> Hiper Texto </paragrafo>'
  },
  'itálico': {
    nomeHtml: 'em',
    descricao: 'Estrutura que renderiza um texto estilizado em itálico.',
    documentacao: '# `itálico`\n É utilizado pra dar ênfase em um conteúdo específico de um artigo e/ou texto. O nivel de enfatização é aumentado conforme a quantidade de estruturas `<itálico>` são utilizadas ao redor do texto.',
    exemploCodigo: '<paragrafo> LMHT é uma linguagem de <itálico> marcação </itálico> Hiper Texto </paragrafo>'
  },
  'item-lista': {
    nomeHtml: 'li',
    descricao: 'Estrutura que representa um item de uma lista, seja ela uma `<lista-simples>`, `<lista-numerada>` ou `<menu>`.',
    documentacao: '# `item-lista`\n Usado para representar um item que faz parte de uma lista. Este item deve estar contido em um elemento pai: uma lista simples, uma lista numerada ou um menu e representa uma única entidade dessa lista. Em menus e listas simples a relação de itens é exibida normalmente, usando pontos de marcação. ',
    exemploCodigo: '<lista-simples>\n <item-lista> Item 1 </item-lista>\n <item-lista> Item 2 </item-lista>\n <item-lista> Item 3 </item-lista>\n<lista-simples>'
  },
  'ligacao': {
    nomeHtml: 'a',
    descricao: 'Estrutura que define um hiperlink, que é usado para vincular uma página à outra.',
    documentacao: '# `ligacao`\n Declara um link dinâmico, no qual é usado para referenciar ou migrar de uma página para outra, seja externa ou em uma seção dentro da própria página. O atributo mais importante desta estrutura é o destino, pois é através dele que deve ser referenciado o endereço que o usuário acessará após interagir com essa estrutura.',
    exemploCodigo: '<ligacao destino="http://www.meusite.com"> Meu site </ligacao>'
  },
  'ligação': {
    nomeHtml: 'a',
    descricao: 'Estrutura que define um hiperlink, que é usado para vincular uma página à outra.',
    documentacao: '# `ligação`\n Declara um link dinâmico, no qual é usado para referenciar ou migrar de uma página para outra, seja externa ou em uma seção dentro da própria página. O atributo mais importante desta estrutura é o destino, pois é através dele que deve ser referenciado o endereço que o usuário acessará após interagir com essa estrutura.',
    exemploCodigo: '<ligação destino="http://www.meusite.com"> Meu site </ligação>'
  },
  'linha': {
    nomeHtml: 'tr',
    descricao: 'Estrutura que define uma linha dentro de uma tabela.',
    documentacao: '# `linha`\n Representa um bloco de um ou mais linhas dentro da estrutura-pai `<corpo-tabela>`.',
    exemploCodigo: '<tabela>\n <corpo-tabela>\n  <linha>\n  <celula> Nome </celula>\n  <celula> Idade </celula>\n <celula> Cidade </celula>\n <corpo-tabela>\n</tabela>'
  },
  'linha-horizontal': {
    nomeHtml: 'hr',
    descricao: 'Estrutura que representa uma quebra temática entre elementos de nível de parágrafo (por exemplo , uma mudança da cena de uma história, ou uma mudança de tema com uma seção). Nas versões anteriores do HTML, representava uma linha horizontal. ',
    documentacao: '# `linha-horizontal`\n Declara uma separação de tópicos de um parágrafo da página, seja uma história fictícia ou um texto jornalístico, entre outros.',
    exemploCodigo: '<paragrafo>\n Tópico 1\n<paragrafo>\n<linha-horizontal>\n<paragrafo>\n Tópico 2\n<paragrafo>'
  },
  'lista-definicoes': {
    nomeHtml: 'dl',
    descricao: 'Estrutura que representa uma lista associativa consistindo de zero ou mais listas descritivas.',
    documentacao: '# `lista-definicoes`\n Cada lista representada por essa estrutura consiste de uma ou mais estruturas `<termo>` seguindo por um ou mais estruturas `<lista-definições/definicao>`. Deverá declarar somente uma estrutura `<termo>` para cada nome. Listas descritivas podem conter termos e definições, tópicos e valores, perguntas e respostas ou qualquer outro formato de lista descritiva.',
    exemploCodigo: '<lista-definicoes>\n <lista-definicoes/definicao> Item A </lista-definicoes/definicao>\n <lista-definicoes/definicao> Item B </lista-definicoes/definicao>\n <lista-definicoes/definicao> Item C </lista-definicoes/definicao>\n</lista-definicoes>'
  },
  'lista-definições': {
    nomeHtml: 'dl',
    descricao: 'Estrutura que representa uma lista associativa consistindo de zero ou mais listas descritivas.',
    documentacao: '# `lista-definições`\n Cada lista representada por essa estrutura consiste de uma ou mais estruturas `<termo>` seguindo por um ou mais estruturas `<lista-definições/definição>`. Deverá declarar somente uma estrutura `<termo>` para cada nome. Listas descritivas podem conter termos e definições, tópicos e valores, perguntas e respostas ou qualquer outro formato de lista descritiva.',
    exemploCodigo: '<lista-definições>\n <lista-definições/definição> Item A </lista-definições/definição>\n <lista-definições/definição> Item B </lista-definições/definição>\n <lista-definições/definição> Item C </lista-definições/definição>\n</lista-definições>'
  },
  'lista-definicoes/definicao': {
    nomeHtml: 'dd',
    descricao: 'Estrutura que representa a descrição, definição ou valor dentro da estrutura `<lista-definicoes>`.',
    documentacao: '# `lista-definicoes/definicao`\n Pode ser utilizado para fazer um dicionário virtual ou uma enciclopédia dentro da página LMHT',
    exemploCodigo: '<lista-definicoes>\n <lista-definicoes/definicao> Banana </lista-definicoes/definicao>\n <lista-definicoes/definicao> Abacaxi </lista-definicoes/definicao>\n <lista-definicoes/definicao> Uva </lista-definicoes/definicao>\n</lista-definicoes>'
  },
  'lista-definições/definição': {
    nomeHtml: 'dd',
    descricao: 'Estrutura que representa a descrição, definição ou valor dentro da estrutura `<lista-definicoes>`.',
    documentacao: '# `lista-definições/definição`\n Pode ser utilizado para fazer um dicionário virtual ou uma enciclopédia dentro da página LMHT',
    exemploCodigo: '<lista-definicoes>\n <lista-definições/definição> Banana </lista-definições/definição>\n <lista-definições/definição> Abacaxi </lista-definições/definição>\n <lista-definições/definição> Uva </lista-definições/definição>\n</lista-definicoes>'
  },
  'lista-numerada': {
    nomeHtml: 'ol',
    descricao: 'Estrutura que representa uma lista de itens ordenados.',
    documentacao: '# `lista-numerada`\n Declara uma lista propositalmente ordenada, de tal forma que caso sua ordem seja alterada, sua lógica seria afetada. A estrutura `<item-lista>` declara os itens da lista.',
    exemploCodigo: '<lista-numerada>\n <item-lista> Item 1 </item-lista>\n <item-lista> Item 2 </item-lista>\n<lista-numerada>'
  },
  'lista-pesquisavel': {
    nomeHtml: 'datalist',
    descricao: 'Estrutura que especifica uma lista de opções pré-definidas para a estrutura `<entrada>`.',
    documentacao: '# `lista-pesquisavel`\n Geralmente é utilizada para utilizar o recurso "autocompletar" para estruturas `<entrada>`. Além disso, o usuário irá visualizar uma lista suspensa contendo opções pré-definidas assim que o usuário inserir um dado. O atributo id deverá ser o mesmo valor do atributo lista da estrutura `<entrada>`.',
    exemploCodigo: '<etiqueta for-"navegadores"> Escolha seu navegador: </etiqueta>\n<entrada lista="navegadores" nome="navegador" id="navegador">\n<lista-pesquisavel id="navegadores">\n <opcao valor="Chrome">\n <opcao valor="Firefox">\n <opcao valor="Safari">\n <opcao valor="Opera">\n</lista-pesquisavel>'
  },
  'lista-pesquisável': {
    nomeHtml: 'datalist',
    descricao: 'Estrutura que especifica uma lista de opções pré-definidas para a estrutura `<entrada>`.',
    documentacao: '# `lista-pesquisável`\n Geralmente é utilizada para utilizar o recurso "autocompletar" para estruturas `<entrada>`. Além disso, o usuário irá visualizar uma lista suspensa contendo opções pré-definidas assim que o usuário inserir um dado. O atributo id deverá ser o mesmo valor do atributo lista da estrutura `<entrada>`.',
    exemploCodigo: '<etiqueta for-"navegadores"> Escolha seu navegador: </etiqueta>\n<entrada lista="navegadores" nome="navegador" id="navegador">\n<lista-pesquisável id="navegadores">\n <opcao valor="Chrome">\n <opcao valor="Firefox">\n <opcao valor="Safari">\n <opcao valor="Opera">\n</lista-pesquisável>'
  },
  'lista-simples': {
    nomeHtml: 'ul',
    descricao: 'Estrutura que representa uma lista de itens sem ordem rígida, isto é, uma coleção de itens que não trazem uma ordenação numérica e as suas posições, nessa lista, são irrelevantes.',
    documentacao: '# `lista-simples`\n Representa uma lista de forma não-ordenada. Sendo assim, a modificação do seu conteúdo não afetará o significado contextual da página.',
    exemploCodigo: '<lista-simples>\n <item-lista> Item 1 </item-lista>\n <item-lista> Item 2 </item-lista>\n<lista-simples>'
  },
  'marca': {
    nomeHtml: 'mark',
    descricao: 'Estrutura que declara uma marcação ou ênfase em uma parte determinada de um texto.',
    documentacao: '# `marca`\n Representa um trecho de destaque em um texto, por exemplo, uma sequência de texto marcado como referência, devido à sua relevância em um contexto particular.',
    exemploCodigo: '<paragrafo>\n Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut <marca> texto marcado </marca> magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.\n</paragrafo'
  },
  'medidor': {
    nomeHtml: 'meter',
    descricao: 'Estrutura que renderiza uma escala de medição na página LMHT.',
    documentacao: '# `medidor`\n Pode ser utilizada para vários ambientes ou estilos de página, devido a sua configuração livre e independente de outras estruturas para ser utilizada. É possível configurar os seus valores padrão, seja eles o alcance ou o que é considerado um valor baixo na estrutura.',
    exemploCodigo: '<etiqueta para="medidor-altura"> Peso - Pessoa 1</etiqueta>\n<medidor valor="70" minimo="0" maximo="500">70 kg </medidor>'
  },
  'modal': {
    nomeHtml: 'dialog',
    descricao: 'Estrutura que declara uma caixa de diálogo ou subjanela.',
    documentacao: '# `modal`\n Essa estrutura facilita a criação de pop-ups, caixas de diálogos e modais dentro da página LMHT. ',
    exemploCodigo: '<modal abrir> Essa é uma caixa de diálogo aberta </modal>'
  },
  'navegacao': {
    nomeHtml: 'nav',
    descricao: 'Estrutura que representa uma seção de uma página que aponta para outras páginas ou para outras áreas da página, ou seja, uma seção com links de navegação.',
    documentacao: '# `navegacao`\n Declara um conjunto agrupado de links para serem navegados na página, seja esses links internos ou de endereços externos. Pode ser utilizada como recurso de acessibilidade para leitores de tela voltados para pessoas com deficiência visual, com o intuito de filtrar o que deve ser exibido e o que não deve na renderização inicial do navegador.',
    exemploCodigo: '<navegacao>\n <ligacao href="/html/"> HTML </ligacao>\n <ligacao href="/css/"> CSS </ligacao>\n <ligacao href="/js/"> JavaScript </ligacao>\n <ligacao href="/python/"> CSS </ligacao>\n</navegacao>'
  },
  'navegação': {
    nomeHtml: 'nav',
    descricao: 'Estrutura que representa uma seção de uma página que aponta para outras páginas ou para outras áreas da página, ou seja, uma seção com links de navegação.',
    documentacao: '# `navegação`\n Declara um conjunto agrupado de links para serem navegados na página, seja esses links internos ou de endereços externos. Pode ser utilizada como recurso de acessibilidade para leitores de tela voltados para pessoas com deficiência visual, com o intuito de filtrar o que deve ser exibido e o que não deve na renderização inicial do navegador.',
    exemploCodigo: '<navegação>\n <ligacao href="/html/"> HTML </ligacao>\n <ligacao href="/css/"> CSS </ligacao>\n <ligacao href="/js/"> JavaScript </ligacao>\n <ligacao href="/python/"> CSS </ligacao>\n</navegação>'
  },
  'negrito': {
    nomeHtml: 'strong',
    descricao: 'Estrutura que renderiza um texto no formato negrito.',
    documentacao: '# `negrito`\n É utilizado para enfatizar um conteúdo específico de um texto, assim dando valor a sua importância contextual. Quanto maior a quantidade de estruturas `<negrito>`, mais importância terá o texto inserido.',
    exemploCodigo: '<negrito> Esse texto é importante! </negrito>'
  },
  'objeto': {
    nomeHtml: 'object',
    descricao: 'Estrutura que define um contêiner para um recurso externo.',
    documentacao: '# `objeto`\n Declara um contêiner para um recurso externo, seja ele uma página da Web, uma imagem ou uma aplicação em formato Plugin.',
    exemploCodigo: '<objeto dado="video.mp4" altura="500" largura="600"> </objeto>\n\n<objeto dado="foto.png" altura="300" largura="200"> </objeto>\n\n<objeto dado="site.html" altura="500" largura="200"> </objeto>'
  },
  'opcao': {
    nomeHtml: 'option',
    descricao: 'Estrutura usada para criar um controle que representa um item dentro de um elemento.',
    documentacao: '# `opcao`\n Declara um valor como opção dentro da estruturas `<lista-pesquisável>`, `<seleção>` e `<grupo-opções>`.',
    exemploCodigo: '<título1 for="frutas"> Escolha uma fruta: </título1>\n<seleção nome="frutas" id="frutas">\n <opcao>Banana</opcao>\n <opcao>Abacaxi</opcao>\n <opcao>Morango</opcao>\n</seleção>'
  },
  'opção': {
    nomeHtml: 'option',
    descricao: 'Estrutura usada para criar um controle que representa um item dentro de um elemento.',
    documentacao: '# `opção`\n Declara um valor como opção dentro da estruturas `<lista-pesquisável>`, `<seleção>` e `<grupo-opções>`.',
    exemploCodigo: '<título1 for="frutas"> Escolha uma fruta: </título1>\n<seleção nome="frutas" id="frutas">\n <opção>Banana</opção>\n <opção>Abacaxi</opção>\n <opção>Morango</opção>\n</seleção>'
  },
  'p': {
    nomeHtml: 'p',
    descricao: 'Estrutura que declara e renderiza um texto em formato de um parágrafo.',
    documentacao: '# `p`\n Em mídias visuais, parágrafos são representados como blocos indentados de texto com a primeira letra avançada e separados por linhas em branco. Já em LMHT, parágrafos são usados para agrupar conteúdos relacionados de qualquer tipo, como imagens e campos de um formulário.',
    exemploCodigo: '<p>\n Esse é um texto em forma de parágrafo\n</p>'
  },
  'paragrafo': {
    nomeHtml: 'p',
    descricao: 'Estrutura que declara e renderiza um texto em formato de um parágrafo.',
    documentacao: '# `paragrafo`\n Em mídias visuais, parágrafos são representados como blocos indentados de texto com a primeira letra avançada e separados por linhas em branco. Já em LMHT, parágrafos são usados para agrupar conteúdos relacionados de qualquer tipo, como imagens e campos de um formulário.',
    exemploCodigo: '<paragrafo>\n Esse é um texto em forma de parágrafo\n</paragrafo>'
  },
  'parágrafo': {
    nomeHtml: 'p',
    descricao: 'Estrutura que declara e renderiza um texto em formato de um parágrafo.',
    documentacao: '# `parágrafo`\n Em mídias visuais, parágrafos são representados como blocos indentados de texto com a primeira letra avançada e separados por linhas em branco. Já em LMHT, parágrafos são usados para agrupar conteúdos relacionados de qualquer tipo, como imagens e campos de um formulário.',
    exemploCodigo: '<parágrafo>\n Esse é um texto em forma de parágrafo\n</parágrafo>'
  },
  'preformatado': {
    nomeHtml: 'pre',
    descricao: 'Estrutura que declara e renderiza um texto pré-formatado na página.',
    documentacao: '# `preformatado`\n Por padrão, sua fonte tem a largura fixa, além de preservar espaços e quebras de linha. O texto será renderizado exatamante como é exibido no código-fonte da página LMHT. Algumas de suas finalidades de uso são: linhas de códigos de programação, textos feitos via ASCII e inclusão de e-mails, com parágrafos em branco.',
    exemploCodigo: '<preformatado>\n Esse é um texto inserido dentro de uma estrutura chamada preformatado\n</preformatado>'
  },
  'principal': {
    nomeHtml: 'main',
    descricao: 'Estrutura que especifica o conteúdo principal do documento LMHT.',
    documentacao: '# `principal`\n O conteúdo inserido dentro desta estrutura deverá ser único ao documento, sendo assim não deverá ser repetido e/ou replicado através de outros documentos seja eles links de navegação, Informações de Copyright, Logotipos e formulários de pesquisa. Importante notar que não pode existir mais de uma estrutura `<principal>` na página. A estrutura também não pode ser estrutura-filho das estruturas `<artigo>`, `<aparte>` ou `<navegacao>`.',
    exemploCodigo: '<principal>\n <artigo>\n  <titulo2> Maçã </titulo2>\n  <p> A maçã é o pseudofruto pomáceo da macieira ( Malus domestica ), árvore da família Rosaceae. É um dos pseudofrutos de árvore mais cultivados, e o mais conhecido dos muitos membros do género Malus que são usados pelos seres humanos. Fonte: Wikipediqa </p>\n </artigo>\n</principal>'
  },
  'progresso': {
    nomeHtml: 'progress',
    descricao: 'Estrutura usada para visualizar o progresso de uma tarefa.',
    documentacao: '# `progresso`\n Representa o progresso alcançado de uma tarefa, porém não especificando quanto que resta para ser concluída. Lembre-se sempre de adicionar a estrutura `<etiqueta>` para mais práticas de acessibilidade.',
    exemploCodigo: '<etiqueta para="status"> Status de download: </etiqueta>\n<progresso id="status" valor="50" maximo="100"> 50% </progresso>'
  },
  'quebra-linha': {
    nomeHtml: 'br',
    descricao: 'Estrutura usada para aplicar uma quebra de linha no texto.',
    documentacao: '# `quebra-linha`\n Declara uma quebra de linhas dentro de outras estruturas que envolvem produção textual, seja elas textos jornalísticos, produções literárias, etc. Além disso, não necessita de outra estrutura de fechamento. Esta estrutura é comumente utilizada para produção de poemas, citação de endereços físicos dentre outros exemplos similares.',
    exemploCodigo: '<p> Para quebra de linhas <quebra-linha> em um texto, use a estrutura <quebra-linha> Quebra-linha </p>'
  },
  'quebra-linha-oportuna': {
    nomeHtml: 'wbr',
    descricao: 'Estrutura usada para especificar onde deve ocorrer uma quebra de linha no texto.',
    documentacao: '# `quebra-linha-oportuna`\n Especifica em que momento e localização no texto que deverá ocorrer uma quebra de linha no texto, seja parágrafo ou outras estruturas similares. É recomendado usar palavras curtas, caso não queira que o documento faça a quebra de linha em um lugar errado. Você pode usar essa estrutura para delimitar oportunidades de quebras de linha.',
    exemploCodigo: '<p> Para aprender Espanhol, você deverá estar familiarizado com as línguas vindas do <quebra-linha-oportuna>Latim</quebra-linha-oportuna> </p>'
  },
  'recurso': {
    nomeHtml: 'link',
    descricao: 'Estrutura que estabelece um relacionamento entre o documento atual e o conteúdo externo.',
    documentacao: '# `recurso`\n É normalmente utilizada para adicionar a logotipo para a sua página LMHT, porém pode se utilizar de diversas maneiras, devido a sua ampla lista de atributos e sua alta compatibilidade.',
    exemploCodigo: '<cabeca>\n <recurso rel="stylesheet" href="link1.lmht">\n</cabeca>'
  },
  'riscado': {
    nomeHtml: 's',
    descricao: 'Estrutura que renderiza um texto tachado ou uma linha cortando o texto.',
    documentacao: '# `riscado`\n É normalmente utilizada para adicionar a logotipo para a sua página LMHT, porém pode se utilizar de diversas maneiras, devido a sua ampla lista de atributos e sua alta compatibilidade.',
    exemploCodigo: 'Representa um elemento que não é mais relevante ou tecnicamente correto. Esta estrutura não deve ser usada para definir conteúdo deletado. Neste caso, use a estrutura `<excluido>`.'
  },
};