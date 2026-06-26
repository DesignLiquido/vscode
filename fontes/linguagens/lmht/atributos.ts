export default {
    // Atributos globais
    'classe': {
        nomeHtml: 'class',
        descricao: 'Especifica um ou mais nomes de classe CSS para o elemento.',
        documentacao: '# `classe`\nO atributo `classe` é usado para apontar para uma definição de classe em uma folha de estilos FolEs/CSS, ou para identificar um ou mais elementos com JavaScript.\n\nEquivalente HTML: `class`',
        exemploCodigo: '<paragrafo classe="destaque">Texto em destaque</paragrafo>'
    },
    'id': {
        nomeHtml: 'id',
        descricao: 'Especifica um identificador único para o elemento.',
        documentacao: '# `id`\nO atributo `id` especifica um identificador exclusivo para um elemento HTML. O valor do atributo deve ser único dentro do documento.\n\nEquivalente HTML: `id`',
        exemploCodigo: '<divisao id="cabecalho-principal">Conteúdo do cabeçalho</divisao>'
    },
    'estilo': {
        nomeHtml: 'style',
        descricao: 'Especifica estilos CSS embutidos para o elemento.',
        documentacao: '# `estilo`\nO atributo `estilo` é usado para adicionar estilos a um elemento, como cor, fonte e tamanho. Prefira o uso de folhas de estilos externas (FolEs) para manutenção mais fácil.\n\nEquivalente HTML: `style`',
        exemploCodigo: '<paragrafo estilo="cor: azul; tamanho-fonte: 16px;">Texto estilizado</paragrafo>'
    },
    'titulo-elemento': {
        nomeHtml: 'title',
        descricao: 'Especifica informações extras sobre o elemento, exibidas como dica ao passar o mouse.',
        documentacao: '# `titulo-elemento`\nO atributo `titulo-elemento` define um texto de dica (_tooltip_) exibido quando o usuário passa o ponteiro do mouse sobre o elemento.\n\nEquivalente HTML: `title`',
        exemploCodigo: '<paragrafo titulo-elemento="Informação adicional">Passe o mouse aqui</paragrafo>'
    },
    'direcao-texto': {
        nomeHtml: 'dir',
        descricao: 'Especifica a direção do texto do elemento (ltr ou rtl).',
        documentacao: '# `direcao-texto`\nO atributo `direcao-texto` define a direção do texto: `ltr` (da esquerda para a direita) ou `rtl` (da direita para a esquerda). Útil para idiomas como árabe e hebraico.\n\nEquivalente HTML: `dir`',
        exemploCodigo: '<paragrafo direcao-texto="rtl">مرحبا بالعالم</paragrafo>'
    },
    'idioma': {
        nomeHtml: 'lang',
        descricao: 'Especifica o idioma do conteúdo do elemento.',
        documentacao: '# `idioma`\nO atributo `idioma` especifica o idioma do conteúdo do elemento usando códigos de idioma padrão (por exemplo, `pt` para português, `en` para inglês).\n\nEquivalente HTML: `lang`',
        exemploCodigo: '<lmht idioma="pt-BR">\n <corpo>Conteúdo em português</corpo>\n</lmht>'
    },
    'escondido': {
        nomeHtml: 'hidden',
        descricao: 'Oculta o elemento da renderização da página.',
        documentacao: '# `escondido`\nO atributo `escondido` indica que o elemento não é relevante no momento. Um elemento com esse atributo não é renderizado pelo navegador.\n\nEquivalente HTML: `hidden`',
        exemploCodigo: '<divisao escondido>Este conteúdo está oculto</divisao>'
    },
    'tamanho-tab': {
        nomeHtml: 'tabindex',
        descricao: 'Especifica a ordem de tabulação do elemento na navegação por teclado.',
        documentacao: '# `tamanho-tab`\nO atributo `tamanho-tab` determina a ordem em que os elementos recebem foco ao navegar com a tecla Tab. Valores negativos removem o elemento da ordem de tabulação.\n\nEquivalente HTML: `tabindex`',
        exemploCodigo: '<campo tipo="texto" tamanho-tab="1">\n<campo tipo="texto" tamanho-tab="2">'
    },
    'arrastar': {
        nomeHtml: 'draggable',
        descricao: 'Especifica se o elemento pode ser arrastado.',
        documentacao: '# `arrastar`\nO atributo `arrastar` especifica se um elemento pode ser arrastado com o mouse. Use `verdadeiro` para permitir arrastar e `falso` para desativar.\n\nEquivalente HTML: `draggable`',
        exemploCodigo: '<paragrafo arrastar="verdadeiro">Arraste este parágrafo</paragrafo>'
    },
    'conteudo-editavel': {
        nomeHtml: 'contenteditable',
        descricao: 'Especifica se o conteúdo do elemento pode ser editado pelo usuário.',
        documentacao: '# `conteudo-editavel`\nO atributo `conteudo-editavel` torna o conteúdo do elemento editável diretamente no navegador, como um editor de texto simples.\n\nEquivalente HTML: `contenteditable`',
        exemploCodigo: '<divisao conteudo-editavel="verdadeiro">Clique para editar este texto</divisao>'
    },
    // Links e navegação
    'destino': {
        nomeHtml: 'href',
        descricao: 'Especifica a URL de destino de um link.',
        documentacao: '# `destino`\nO atributo `destino` define a URL para a qual o link aponta. Pode ser uma URL absoluta, relativa, um fragmento de página (`#id`) ou um protocolo como `mailto:`.\n\nEquivalente HTML: `href`',
        exemploCodigo: '<ligacao destino="https://designliquido.com.br">Visite o site</ligacao>'
    },
    'alvo': {
        nomeHtml: 'target',
        descricao: 'Especifica onde abrir o documento vinculado.',
        documentacao: '# `alvo`\nO atributo `alvo` define onde o documento vinculado será aberto:\n- `_branco`: nova aba ou janela\n- `_proprio`: mesma aba (padrão)\n- `_pai`: quadro pai\n- `_topo`: janela completa\n\nEquivalente HTML: `target`',
        exemploCodigo: '<ligacao destino="https://exemplo.com" alvo="_branco">Abrir em nova aba</ligacao>'
    },
    'relacao': {
        nomeHtml: 'rel',
        descricao: 'Especifica a relação entre o documento atual e o documento vinculado.',
        documentacao: '# `relacao`\nO atributo `relacao` define o relacionamento entre o documento atual e o vinculado. Valores comuns incluem `stylesheet`, `noopener`, `noreferrer` e `canonical`.\n\nEquivalente HTML: `rel`',
        exemploCodigo: '<ligacao relacao="noopener noreferrer" destino="https://exemplo.com" alvo="_branco">Link seguro</ligacao>'
    },
    'download': {
        nomeHtml: 'download',
        descricao: 'Indica que o recurso vinculado deve ser baixado ao clicar no link.',
        documentacao: '# `download`\nO atributo `download` instrui o navegador a baixar o arquivo vinculado em vez de navegar até ele. O valor do atributo pode sugerir o nome do arquivo para download.\n\nEquivalente HTML: `download`',
        exemploCodigo: '<ligacao destino="relatorio.pdf" download="relatorio-2024.pdf">Baixar relatório</ligacao>'
    },
    // Mídia
    'fonte': {
        nomeHtml: 'src',
        descricao: 'Especifica a URL da mídia ou recurso a ser exibido.',
        documentacao: '# `fonte`\nO atributo `fonte` especifica o caminho (URL) para o recurso de mídia, como uma imagem, vídeo, áudio ou script.\n\nEquivalente HTML: `src`',
        exemploCodigo: '<imagem fonte="foto.jpg" alt="Minha foto">'
    },
    'alt': {
        nomeHtml: 'alt',
        descricao: 'Especifica um texto alternativo para elementos de mídia.',
        documentacao: '# `alt`\nO atributo `alt` fornece um texto alternativo exibido quando a mídia não pode ser carregada. É essencial para acessibilidade e SEO.\n\nEquivalente HTML: `alt`',
        exemploCodigo: '<imagem fonte="logo.png" alt="Logo da empresa">'
    },
    'largura': {
        nomeHtml: 'width',
        descricao: 'Especifica a largura do elemento em pixels.',
        documentacao: '# `largura`\nO atributo `largura` define a largura do elemento em pixels. Para controle mais sofisticado de dimensões, prefira o uso de FolEs.\n\nEquivalente HTML: `width`',
        exemploCodigo: '<imagem fonte="foto.jpg" largura="300" altura="200" alt="Foto">'
    },
    'altura': {
        nomeHtml: 'height',
        descricao: 'Especifica a altura do elemento em pixels.',
        documentacao: '# `altura`\nO atributo `altura` define a altura do elemento em pixels. Para controle mais sofisticado de dimensões, prefira o uso de FolEs.\n\nEquivalente HTML: `height`',
        exemploCodigo: '<imagem fonte="foto.jpg" largura="300" altura="200" alt="Foto">'
    },
    'carregamento': {
        nomeHtml: 'loading',
        descricao: 'Especifica como o navegador deve carregar o elemento.',
        documentacao: '# `carregamento`\nO atributo `carregamento` controla quando o recurso é carregado:\n- `ansioso`: carrega imediatamente (padrão)\n- `preguicoso`: carrega apenas quando o elemento fica visível\n\nEquivalente HTML: `loading`',
        exemploCodigo: '<imagem fonte="foto-grande.jpg" alt="Foto" carregamento="preguicoso">'
    },
    'carregamento-automatico': {
        nomeHtml: 'autoplay',
        descricao: 'Especifica que o áudio ou vídeo deve começar a reproduzir automaticamente.',
        documentacao: '# `carregamento-automatico`\nO atributo `carregamento-automatico` faz com que o elemento de mídia comece a reproduzir assim que estiver pronto, sem interação do usuário. Use com cautela, pois pode ser intrusivo.\n\nEquivalente HTML: `autoplay`',
        exemploCodigo: '<video fonte="intro.mp4" carregamento-automatico silenciado></video>'
    },
    'controles': {
        nomeHtml: 'controls',
        descricao: 'Exibe os controles de reprodução de mídia (play, pause, volume, etc.).',
        documentacao: '# `controles`\nO atributo `controles` faz com que o navegador exiba os controles de reprodução padrão para elementos de áudio e vídeo, permitindo ao usuário controlar a reprodução.\n\nEquivalente HTML: `controls`',
        exemploCodigo: '<audio fonte="musica.mp3" controles></audio>'
    },
    'loop': {
        nomeHtml: 'loop',
        descricao: 'Especifica que a mídia deve reiniciar automaticamente ao terminar.',
        documentacao: '# `loop`\nO atributo `loop` faz com que o áudio ou vídeo reinicie automaticamente quando chega ao fim, criando uma reprodução contínua.\n\nEquivalente HTML: `loop`',
        exemploCodigo: '<audio fonte="ambiente.mp3" loop carregamento-automatico silenciado></audio>'
    },
    'silenciado': {
        nomeHtml: 'muted',
        descricao: 'Especifica que o áudio da mídia deve ser silenciado por padrão.',
        documentacao: '# `silenciado`\nO atributo `silenciado` define que o áudio do elemento de mídia deve começar sem som. É frequentemente usado com `carregamento-automatico`, pois muitos navegadores bloqueiam reprodução automática com som.\n\nEquivalente HTML: `muted`',
        exemploCodigo: '<video fonte="video.mp4" carregamento-automatico silenciado controles></video>'
    },
    'poster': {
        nomeHtml: 'poster',
        descricao: 'Especifica uma imagem a ser exibida enquanto o vídeo está sendo baixado.',
        documentacao: '# `poster`\nO atributo `poster` define uma URL de imagem que será exibida como miniatura do vídeo antes de ele começar a reproduzir.\n\nEquivalente HTML: `poster`',
        exemploCodigo: '<video fonte="filme.mp4" poster="miniatura.jpg" controles></video>'
    },
    // Formulários
    'tipo': {
        nomeHtml: 'type',
        descricao: 'Especifica o tipo do elemento (campo de entrada, botão, link, etc.).',
        documentacao: '# `tipo`\nO atributo `tipo` define o comportamento do elemento. Para campos de entrada, pode ser `texto`, `senha`, `email`, `numero`, `caixa-selecao`, `botao-radio`, `arquivo`, `enviar`, entre outros.\n\nEquivalente HTML: `type`',
        exemploCodigo: '<campo tipo="email" placeholder="seu@email.com">'
    },
    'nome': {
        nomeHtml: 'name',
        descricao: 'Especifica o nome do elemento, usado ao enviar formulários.',
        documentacao: '# `nome`\nO atributo `nome` identifica o campo no envio de formulários. O servidor receberá os dados com este nome como chave.\n\nEquivalente HTML: `name`',
        exemploCodigo: '<campo tipo="texto" nome="nome-completo" placeholder="Seu nome">'
    },
    'valor': {
        nomeHtml: 'value',
        descricao: 'Especifica o valor inicial ou atual do elemento.',
        documentacao: '# `valor`\nO atributo `valor` define o valor padrão de um campo de entrada ou o valor enviado por um botão ou opção de seleção.\n\nEquivalente HTML: `value`',
        exemploCodigo: '<campo tipo="texto" nome="cidade" valor="São Paulo">'
    },
    'placeholder': {
        nomeHtml: 'placeholder',
        descricao: 'Especifica um texto de dica exibido dentro do campo quando está vazio.',
        documentacao: '# `placeholder`\nO atributo `placeholder` exibe um texto guia dentro do campo de entrada enquanto ele está vazio, descrevendo o que o usuário deve inserir.\n\nEquivalente HTML: `placeholder`',
        exemploCodigo: '<campo tipo="texto" placeholder="Digite seu nome completo">'
    },
    'obrigatorio': {
        nomeHtml: 'required',
        descricao: 'Especifica que o campo deve ser preenchido antes de enviar o formulário.',
        documentacao: '# `obrigatorio`\nO atributo `obrigatorio` torna o preenchimento do campo mandatório para o envio do formulário. O navegador exibirá uma mensagem de erro se o campo estiver vazio ao tentar enviar.\n\nEquivalente HTML: `required`',
        exemploCodigo: '<campo tipo="email" nome="email" placeholder="seu@email.com" obrigatorio>'
    },
    'desabilitado': {
        nomeHtml: 'disabled',
        descricao: 'Desabilita o elemento, impedindo interação do usuário.',
        documentacao: '# `desabilitado`\nO atributo `desabilitado` impede que o usuário interaja com o elemento. Campos desabilitados não são enviados no formulário.\n\nEquivalente HTML: `disabled`',
        exemploCodigo: '<campo tipo="texto" valor="Somente leitura" desabilitado>'
    },
    'somente-leitura': {
        nomeHtml: 'readonly',
        descricao: 'Especifica que o campo não pode ser editado pelo usuário.',
        documentacao: '# `somente-leitura`\nO atributo `somente-leitura` impede que o usuário modifique o valor do campo, mas o campo ainda é enviado no formulário e pode receber foco.\n\nEquivalente HTML: `readonly`',
        exemploCodigo: '<campo tipo="texto" valor="Texto fixo" somente-leitura>'
    },
    'multiplo': {
        nomeHtml: 'multiple',
        descricao: 'Permite ao usuário selecionar múltiplos valores em um campo.',
        documentacao: '# `multiplo`\nO atributo `multiplo` permite a seleção de múltiplos arquivos em um campo de arquivo, ou múltiplas opções em uma lista de seleção.\n\nEquivalente HTML: `multiple`',
        exemploCodigo: '<campo tipo="arquivo" nome="fotos" multiplo>'
    },
    'padrao': {
        nomeHtml: 'pattern',
        descricao: 'Especifica uma expressão regular que o valor do campo deve corresponder.',
        documentacao: '# `padrao`\nO atributo `padrao` define uma expressão regular que o valor do campo deve satisfazer para que o formulário seja válido. O navegador valida automaticamente.\n\nEquivalente HTML: `pattern`',
        exemploCodigo: '<campo tipo="texto" padrao="[0-9]{5}-[0-9]{3}" placeholder="CEP: 00000-000">'
    },
    'minimo': {
        nomeHtml: 'min',
        descricao: 'Especifica o valor mínimo permitido para campos numéricos ou de data.',
        documentacao: '# `minimo`\nO atributo `minimo` define o menor valor aceitável para campos do tipo `numero`, `intervalo`, `data`, `hora`, entre outros.\n\nEquivalente HTML: `min`',
        exemploCodigo: '<campo tipo="numero" minimo="0" maximo="100" valor="50">'
    },
    'maximo': {
        nomeHtml: 'max',
        descricao: 'Especifica o valor máximo permitido para campos numéricos ou de data.',
        documentacao: '# `maximo`\nO atributo `maximo` define o maior valor aceitável para campos do tipo `numero`, `intervalo`, `data`, `hora`, entre outros.\n\nEquivalente HTML: `max`',
        exemploCodigo: '<campo tipo="numero" minimo="0" maximo="100" valor="50">'
    },
    'passo': {
        nomeHtml: 'step',
        descricao: 'Especifica o incremento legal para campos numéricos.',
        documentacao: '# `passo`\nO atributo `passo` define o intervalo entre valores válidos para campos numéricos e de intervalo. Por exemplo, `passo="5"` aceita apenas múltiplos de 5.\n\nEquivalente HTML: `step`',
        exemploCodigo: '<campo tipo="numero" minimo="0" maximo="100" passo="5">'
    },
    'tamanho-maximo': {
        nomeHtml: 'maxlength',
        descricao: 'Especifica o número máximo de caracteres permitidos no campo.',
        documentacao: '# `tamanho-maximo`\nO atributo `tamanho-maximo` limita a quantidade de caracteres que o usuário pode digitar em um campo de texto.\n\nEquivalente HTML: `maxlength`',
        exemploCodigo: '<campo tipo="texto" nome="apelido" tamanho-maximo="20" placeholder="Apelido (máx. 20 chars)">'
    },
    'tamanho-minimo': {
        nomeHtml: 'minlength',
        descricao: 'Especifica o número mínimo de caracteres exigidos no campo.',
        documentacao: '# `tamanho-minimo`\nO atributo `tamanho-minimo` define a quantidade mínima de caracteres que o usuário deve digitar para que o campo seja válido.\n\nEquivalente HTML: `minlength`',
        exemploCodigo: '<campo tipo="senha" tamanho-minimo="8" placeholder="Mínimo 8 caracteres">'
    },
    'auto-completar': {
        nomeHtml: 'autocomplete',
        descricao: 'Controla se o navegador pode sugerir valores anteriores para o campo.',
        documentacao: '# `auto-completar`\nO atributo `auto-completar` indica se o navegador pode preencher automaticamente o campo com valores inseridos anteriormente. Use `ligado` para ativar e `desligado` para desativar.\n\nEquivalente HTML: `autocomplete`',
        exemploCodigo: '<campo tipo="email" nome="email" auto-completar="ligado">'
    },
    'auto-foco': {
        nomeHtml: 'autofocus',
        descricao: 'Especifica que o elemento deve receber foco automaticamente ao carregar a página.',
        documentacao: '# `auto-foco`\nO atributo `auto-foco` faz com que o elemento receba o foco do teclado automaticamente quando a página termina de carregar. Apenas um elemento por página deve ter esse atributo.\n\nEquivalente HTML: `autofocus`',
        exemploCodigo: '<campo tipo="texto" nome="busca" placeholder="Pesquisar..." auto-foco>'
    },
    'marcado': {
        nomeHtml: 'checked',
        descricao: 'Especifica que um checkbox ou radio button deve começar marcado.',
        documentacao: '# `marcado`\nO atributo `marcado` define que uma caixa de seleção (`caixa-selecao`) ou botão de opção (`botao-radio`) começa selecionado por padrão ao carregar a página.\n\nEquivalente HTML: `checked`',
        exemploCodigo: '<campo tipo="caixa-selecao" nome="concordo" marcado> Concordo com os termos'
    },
    'selecionado': {
        nomeHtml: 'selected',
        descricao: 'Especifica que uma opção de lista deve aparecer selecionada por padrão.',
        documentacao: '# `selecionado`\nO atributo `selecionado` marca uma opção dentro de uma lista (`selecionar`) como a opção pré-selecionada ao carregar o formulário.\n\nEquivalente HTML: `selected`',
        exemploCodigo: '<selecionar nome="estado">\n <opcao valor="SP" selecionado>São Paulo</opcao>\n <opcao valor="RJ">Rio de Janeiro</opcao>\n</selecionar>'
    },
    'para': {
        nomeHtml: 'for',
        descricao: 'Associa um rótulo a um campo de formulário pelo seu id.',
        documentacao: '# `para`\nO atributo `para` em uma estrutura `rotulo` especifica o `id` do campo de formulário ao qual o rótulo pertence. Clicar no rótulo move o foco para o campo associado.\n\nEquivalente HTML: `for`',
        exemploCodigo: '<rotulo para="campo-nome">Nome:</rotulo>\n<campo tipo="texto" id="campo-nome" nome="nome">'
    },
    'acao': {
        nomeHtml: 'action',
        descricao: 'Especifica a URL para onde os dados do formulário serão enviados.',
        documentacao: '# `acao`\nO atributo `acao` define o endereço do servidor que processará os dados do formulário ao ser enviado. Se omitido, o formulário é enviado para a página atual.\n\nEquivalente HTML: `action`',
        exemploCodigo: '<formulario acao="/processar" metodo="post">\n <campo tipo="texto" nome="nome">\n <campo tipo="enviar" valor="Enviar">\n</formulario>'
    },
    'metodo': {
        nomeHtml: 'method',
        descricao: 'Especifica o método HTTP usado para enviar os dados do formulário.',
        documentacao: '# `metodo`\nO atributo `metodo` define como os dados do formulário são enviados ao servidor:\n- `obter` (GET): dados na URL, visíveis\n- `publicar` (POST): dados no corpo da requisição, mais seguro\n\nEquivalente HTML: `method`',
        exemploCodigo: '<formulario acao="/login" metodo="post">\n <campo tipo="senha" nome="senha">\n</formulario>'
    },
    'codificacao': {
        nomeHtml: 'enctype',
        descricao: 'Especifica como os dados do formulário devem ser codificados ao enviar para o servidor.',
        documentacao: '# `codificacao`\nO atributo `codificacao` define o tipo de codificação dos dados enviados. Necessário quando o formulário inclui upload de arquivos. Valores comuns:\n- `application/x-www-form-urlencoded` (padrão)\n- `multipart/form-data` (para arquivos)\n\nEquivalente HTML: `enctype`',
        exemploCodigo: '<formulario acao="/upload" metodo="post" codificacao="multipart/form-data">\n <campo tipo="arquivo" nome="arquivo">\n</formulario>'
    },
    // Tabelas
    'linhas-mescladas': {
        nomeHtml: 'rowspan',
        descricao: 'Especifica o número de linhas que uma célula de tabela deve abranger.',
        documentacao: '# `linhas-mescladas`\nO atributo `linhas-mescladas` define quantas linhas uma célula da tabela ocupa verticalmente, mesclando-a com as células abaixo.\n\nEquivalente HTML: `rowspan`',
        exemploCodigo: '<tabela>\n <linha>\n  <celula-cabecalho linhas-mescladas="2">Título</celula-cabecalho>\n  <celula>Dado 1</celula>\n </linha>\n</tabela>'
    },
    'colunas-mescladas': {
        nomeHtml: 'colspan',
        descricao: 'Especifica o número de colunas que uma célula de tabela deve abranger.',
        documentacao: '# `colunas-mescladas`\nO atributo `colunas-mescladas` define quantas colunas uma célula da tabela ocupa horizontalmente, mesclando-a com as células à direita.\n\nEquivalente HTML: `colspan`',
        exemploCodigo: '<tabela>\n <linha>\n  <celula colunas-mescladas="3">Célula mesclada</celula>\n </linha>\n</tabela>'
    },
    'cabecalhos': {
        nomeHtml: 'headers',
        descricao: 'Especifica os ids dos cabeçalhos de tabela relacionados à célula.',
        documentacao: '# `cabecalhos`\nO atributo `cabecalhos` lista os `id`s das células de cabeçalho relacionadas a uma célula de dados, melhorando a acessibilidade de tabelas complexas.\n\nEquivalente HTML: `headers`',
        exemploCodigo: '<celula-cabecalho id="col1">Produto</celula-cabecalho>\n<celula cabecalhos="col1">Notebook</celula>'
    },
    'escopo': {
        nomeHtml: 'scope',
        descricao: 'Especifica se um cabeçalho de tabela é para uma coluna, linha ou grupo.',
        documentacao: '# `escopo`\nO atributo `escopo` melhora a acessibilidade de tabelas, indicando se um cabeçalho aplica-se a uma `coluna`, `linha`, `grupo-colunas` ou `grupo-linhas`.\n\nEquivalente HTML: `scope`',
        exemploCodigo: '<celula-cabecalho escopo="coluna">Nome</celula-cabecalho>'
    },
    // Metadados
    'charset': {
        nomeHtml: 'charset',
        descricao: 'Especifica a codificação de caracteres do documento.',
        documentacao: '# `charset`\nO atributo `charset` na estrutura `meta` define a codificação de caracteres usada pelo documento. O valor recomendado é `UTF-8`.\n\nEquivalente HTML: `charset`',
        exemploCodigo: '<meta charset="UTF-8">'
    },
    'conteudo': {
        nomeHtml: 'content',
        descricao: 'Especifica o valor associado ao atributo nome ou http-equiv em uma meta-estrutura.',
        documentacao: '# `conteudo`\nO atributo `conteudo` fornece o valor associado ao atributo `nome` ou `http-equiv` em uma estrutura `meta`. É usado para fornecer metadados sobre o documento.\n\nEquivalente HTML: `content`',
        exemploCodigo: '<meta nome="descricao" conteudo="Descrição da minha página">'
    },
    'propriedade': {
        nomeHtml: 'property',
        descricao: 'Especifica a propriedade de metadados (comum em Open Graph).',
        documentacao: '# `propriedade`\nO atributo `propriedade` é usado principalmente com metadados Open Graph (para redes sociais), definindo o tipo de metadado como `og:titulo`, `og:descricao`, `og:imagem`, etc.\n\nEquivalente HTML: `property`',
        exemploCodigo: '<meta propriedade="og:titulo" conteudo="Meu Site Incrível">'
    },
    'http-equiv': {
        nomeHtml: 'http-equiv',
        descricao: 'Fornece um cabeçalho HTTP equivalente para a informação/valor do atributo conteudo.',
        documentacao: '# `http-equiv`\nO atributo `http-equiv` em uma estrutura `meta` simula cabeçalhos de resposta HTTP. Usos comuns incluem redirecionamentos automáticos e configuração de política de conteúdo.\n\nEquivalente HTML: `http-equiv`',
        exemploCodigo: '<meta http-equiv="refresh" conteudo="30">'
    },
    // Outros
    'dados': {
        nomeHtml: 'data',
        descricao: 'Prefixo para atributos de dados personalizados.',
        documentacao: '# `dados`\nO prefixo `dados-` permite armazenar informações extras em elementos HTML sem interferir nas funcionalidades padrão. Esses dados podem ser acessados via JavaScript com `dataset`.\n\nEquivalente HTML: `data-*`',
        exemploCodigo: '<paragrafo dados-usuario-id="42" dados-perfil="admin">Conteúdo</paragrafo>'
    },
    'aria': {
        nomeHtml: 'aria',
        descricao: 'Prefixo para atributos de acessibilidade ARIA.',
        documentacao: '# `aria`\nOs atributos `aria-*` (Accessible Rich Internet Applications) melhoram a acessibilidade de elementos para tecnologias assistivas como leitores de tela.\n\nEquivalente HTML: `aria-*`',
        exemploCodigo: '<botao aria-rotulo="Fechar janela" aria-pressionado="falso">X</botao>'
    },
    'papel': {
        nomeHtml: 'role',
        descricao: 'Define o papel semântico do elemento para tecnologias assistivas.',
        documentacao: '# `papel`\nO atributo `papel` (ARIA role) define a função semântica de um elemento para tecnologias assistivas. Exemplos: `botao`, `navegacao`, `dialogo`, `alerta`, `grade`.\n\nEquivalente HTML: `role`',
        exemploCodigo: '<divisao papel="navegacao">\n <ligacao destino="/inicio">Início</ligacao>\n <ligacao destino="/sobre">Sobre</ligacao>\n</divisao>'
    }
};
