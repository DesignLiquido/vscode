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
};