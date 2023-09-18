export default {
  'abreviacao': {
    nomeHtml: 'abbr',
    descricao: 'Estrutura utilizada como forma de abreviar uma parte específica do texto (ou criar um acrônimo), seja dentro de uma outra estrutura ou não.',
    documentacao: '# `abreviacao`\nGeralmente, nos artigos jornalísticos ou até mesmo textos dissertativos, deve-se utilizar a abreviação para que não seja necessário utilizar o termo inteiro, ou para que seja um informativo para o leitor.',
    exemploCodigo: '<titulo1>\n A Linguagem de Marcação Hiper-Texto <abreviacao> LMHT </abreviacao> foi criada por Leonel \n</titulo1>\n'
  },
  'abreviação': {
    nomeHtml: 'abbr',
    descricao: 'Estrutura utilizada como forma de abreviar uma parte específica do texto (ou criar um acrônimo), seja dentro de uma outra estrutura ou não.',
    documentacao: '# `abreviação`\nGeralmente, nos artigos jornalísticos ou até mesmo textos dissertativos, deve-se utilizar a abreviação para que não seja necessário utilizar o termo inteiro, ou para que seja um informativo para o leitor.',
    exemploCodigo: '<titulo1>\n A Linguagem de Marcação Hiper-Texto <abreviação> LMHT </abreviação> foi criada por Leonel \n</titulo1>\n'
  },
  'aparte': {
    nomeHtml: 'aside',
    descricao: 'Estrutura utilizada com o propósito de separação de conteúdos de uma página: o objetivo é deixar claro ao leitor qual é o tema principal da página.',
    documentacao: '# `aparte`\nÉ comum em páginas de Turismo, por exemplo, quando for feita alguma descrição de algum ponto turístico específico ou prato típico, de utilizar essa estrutura para que a leitura não seja desorganizada, e para que o conteúdo adicional sirva de apoio para a compreensão do assunto.',
    exemploCodigo: '<p>Meu nome é João. Tenho 34 anos, moro em Curitiba e gosto muito de bananas.</p>\n <aparte>\n <p>Banana é uma fruta com a cor amarela, originária da Indonésia. É encontrada em fazendas hortifruti e supermercados.</p>\n </aparte>'
  },
  'area': {
    nomeHtml: 'area',
    descricao: 'Estrutura que define uma área dentro de uma imagem.',
    documentacao: '# `area`\nA área definida permite que o usuário possa interagir com cliques, seja para acessar outras páginas, seja para ativar eventos na página a qual pertence.',
    exemploCodigo: '<imagem fonte="quadrado.png">\n <mapa nome="imagem-1">\n <area forma="retangulo" coordenadas="12,12,123,123" texto="retangulo.htm">\n </mapa>'
  },
  'área': {
    nomeHtml: 'área',
    descricao: 'Estrutura que define uma área dentro de uma imagem.',
    documentacao: '# `área`\nA área definida permite que o usuário possa interagir com cliques, seja para acessar outras páginas, seja para ativar eventos na página a qual pertence.',
    exemploCodigo: '<imagem fonte="quadrado.png">\n <mapa nome="imagem-1">\n <área forma="retangulo" coordenadas="12,12,123,123" texto="retangulo.htm">\n </mapa>'
  },
  'area-texto': {
    nomeHtml: 'textarea',
    descricao: 'Estrutura que declara um campo de entrada em que o usuário pode inserir um texto de várias linhas.',
    documentacao: '# `area-texto`\nPara definir as especificações da área de texto, a estrutura pode receber alguns atributos, tais como `autofoco`, `colunas`, `direção-texto` e `desabilitada`.',
    exemploCodigo: '<area-texto id="formulario" nome="area-formulario" linhas="4" colunas="40">\n Insira aqui uma descrição sobre a sua experiência profissional. \n <\area-texto>'
  },
  'área-texto': {
    nomeHtml: 'textarea',
    descricao: 'Estrutura que declara um campo de entrada em que o usuário pode inserir um texto de várias linhas.',
    documentacao: '# `área-texto`\nPara definir as especificações da área de texto, a estrutura pode receber alguns atributos, tais como `autofoco`, `colunas`, `direção-texto` e `desabilitada`.',
    exemploCodigo: '<área-texto id="formulario" nome="area-formulario" linhas="4" colunas="40">\n Insira aqui uma descrição sobre a sua experiência profissional. \n <\área-texto>'
  },
  'artigo': {
    nomeHtml: 'article',
    descricao: 'Estrutura que especifica um conteúdo independente e autocontido.',
    documentacao: '# `artigo`\nUm artigo deve fazer sentido por si só e deve ser possível distribuí-lo independentemente do resto do site. Seus usos potenciais são, por exemplo, para postagem em fórum, postagem em blog ou notícias. A estrutura <artigo> não é renderizada como algo especial em um navegador. No entanto, você pode usar CSS para estilizá-la.',
    exemploCodigo: '<artigo>\n <titulo2>Meu exemplo de artigo</titulo2>\n <p>Este é um artigo dentro de uma página HTML.</p>\n </artigo>'
  },
  'aspas': {
    nomeHtml: 'q',
    descricao: 'Estrutura que indica que o texto dentro da tag é uma pequena citação.',
    documentacao: '# `aspas`\nEste elemento destina-se a citações curtas que não requerem marcações de parágrafo.',
    exemploCodigo: '<paragrafo>\n De acordo com a Wikipédia, \n <aspas citar="https://pt.wikipedia.org/wiki/Miss%C3%A3o_tripulada_a_Marte">o congresso dos Estados Unidos apoiou uma missão tripulada para a Lua, seguida pela exploração de um asteroide em 2025 e Marte na década de 2030.</aspas>.\n </paragrafo>'
  },
  'audio': {
    nomeHtml: 'audio',
    descricao: 'Estrutura que implementa um controle de áudio, tendo como base um arquivo de formato áudio dentro do documento LMHT.',
    documentacao: '# `audio`\nPode usar opções variadas de extensões de arquivos de áudio, como MP3, OGG, WAV, etc. Seus usos potenciais são, por exemplo, programas de web-rádio ou sites de conteúdo educativo.',
    exemploCodigo: '<audio controles>\n <fonte src="audio.ogg" tipo="audio/ogg">\n <fonte src="music.mp3" tipo="audio/mp3">\n </audio>'
  },
  'áudio': {
    nomeHtml: 'audio',
    descricao: 'Estrutura que implementa um controle de áudio, tendo como base um arquivo de formato áudio dentro do documento LMHT.',
    documentacao: '# `áudio`\nPode usar opções variadas de extensões de arquivos de áudio, como MP3, OGG, WAV, etc. Seus usos potenciais são, por exemplo, programas de web-rádio ou sites de conteúdo educativo.',
    exemploCodigo: '<áudio controles>\n <fonte src="á.ogg" tipo="audio/ogg">\n <fonte src="music.mp3" tipo="audio/mp3">\n </áudio>'
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
};