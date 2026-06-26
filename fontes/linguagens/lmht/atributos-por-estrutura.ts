// Atributos cujo significado muda dependendo da estrutura onde aparecem.
// Usado pelo provedor de hover para exibir documentação contextualizada.

type AtributoEstrutura = { documentacao: string; exemploCodigo: string };
type MapaAtributos = { [atributo: string]: AtributoEstrutura };

// --- meta-dados ---

const atributosMetaDados: MapaAtributos = {
    'nome': {
        documentacao: '# `nome` em `meta-dados`\nEspecifica o tipo de metadado que a estrutura descreve. Valores comuns:\n- `descricao`: resumo da página para mecanismos de busca\n- `palavras-chave`: palavras-chave separadas por vírgula\n- `autor`: nome do autor da página\n- `janela-de-visualizacao`: configuração de viewport para dispositivos móveis\n- `robots`: instruções para robôs de indexação\n\nEquivalente HTML: `name`',
        exemploCodigo: '<meta-dados nome="descricao" conteudo="Descrição da minha página">\n<meta-dados nome="janela-de-visualizacao" conteudo="width=device-width, initial-scale=1">'
    },
    'conteudo': {
        documentacao: '# `conteudo` em `meta-dados`\nDefine o valor do metadado, sempre em par com `nome` ou `http-equiv`.\n\nEquivalente HTML: `content`',
        exemploCodigo: '<meta-dados nome="descricao" conteudo="Minha página sobre tecnologia">'
    },
    'charset': {
        documentacao: '# `charset` em `meta-dados`\nDefine a codificação de caracteres do documento. O valor recomendado é `UTF-8`, que suporta todos os caracteres Unicode incluindo acentos do português.\n\nEquivalente HTML: `charset`',
        exemploCodigo: '<meta-dados charset="UTF-8">'
    },
    'http-equiv': {
        documentacao: '# `http-equiv` em `meta-dados`\nSimula um cabeçalho de resposta HTTP. Valores comuns:\n- `refresh`: recarrega ou redireciona a página após N segundos\n- `content-security-policy`: define política de segurança de conteúdo\n- `x-ua-compatible`: controla o modo de renderização no Internet Explorer\n\nEquivalente HTML: `http-equiv`',
        exemploCodigo: '<meta-dados http-equiv="refresh" conteudo="30">\n<meta-dados http-equiv="x-ua-compatible" conteudo="IE=edge">'
    },
    'propriedade': {
        documentacao: '# `propriedade` em `meta-dados`\nEspecifica uma propriedade de metadado, principalmente usada para Open Graph (compartilhamento em redes sociais). Exemplos:\n- `og:titulo`: título exibido ao compartilhar\n- `og:descricao`: descrição exibida ao compartilhar\n- `og:imagem`: imagem de preview ao compartilhar\n- `og:url`: URL canônica da página\n\nEquivalente HTML: `property`',
        exemploCodigo: '<meta-dados propriedade="og:titulo" conteudo="Meu Site Incrível">\n<meta-dados propriedade="og:imagem" conteudo="https://meusite.com/preview.jpg">'
    }
};

// --- campo / entrada-texto (input) ---

const atributosCampo: MapaAtributos = {
    'tipo': {
        documentacao: '# `tipo` em `campo`\nDefine o tipo do campo de entrada. Valores disponíveis:\n- `texto`: campo de texto simples (padrão)\n- `senha`: campo com caracteres ocultados\n- `email`: validação de formato de e-mail\n- `numero`: campo numérico com setas\n- `telefone`: teclado numérico em dispositivos móveis\n- `url`: validação de formato de URL\n- `data`: seletor de data\n- `hora`: seletor de hora\n- `caixa-selecao`: caixa marcável\n- `botao-radio`: opção exclusiva em grupo\n- `arquivo`: seleção de arquivo\n- `enviar`: botão de envio do formulário\n- `redefinir`: botão de reset do formulário\n- `oculto`: campo invisível com valor enviado no formulário\n- `intervalo`: controle deslizante numérico\n- `cor`: seletor de cor\n\nEquivalente HTML: `type`',
        exemploCodigo: '<campo tipo="email" nome="email" placeholder="seu@email.com" obrigatorio>\n<campo tipo="senha" nome="senha" tamanho-minimo="8">\n<campo tipo="caixa-selecao" nome="aceitar" marcado>'
    },
    'nome': {
        documentacao: '# `nome` em `campo`\nIdentifica o campo no envio do formulário. O servidor receberá os dados com este nome como chave (ex.: `nome=valor` na query string ou corpo da requisição).\n\nEquivalente HTML: `name`',
        exemploCodigo: '<campo tipo="texto" nome="nome-completo" placeholder="Seu nome completo">'
    },
    'valor': {
        documentacao: '# `valor` em `campo`\nDefine o valor inicial pré-preenchido do campo. Para campos do tipo `enviar` e `redefinir`, define o texto exibido no botão.\n\nEquivalente HTML: `value`',
        exemploCodigo: '<campo tipo="texto" nome="cidade" valor="São Paulo">\n<campo tipo="enviar" valor="Enviar formulário">'
    },
    'marcado': {
        documentacao: '# `marcado` em `campo`\nAplicável apenas a campos do tipo `caixa-selecao` e `botao-radio`. Indica que o campo deve aparecer marcado/selecionado por padrão ao carregar a página.\n\nEquivalente HTML: `checked`',
        exemploCodigo: '<campo tipo="caixa-selecao" nome="newsletter" marcado> Quero receber novidades\n<campo tipo="botao-radio" nome="genero" valor="f"> Feminino\n<campo tipo="botao-radio" nome="genero" valor="m" marcado> Masculino'
    }
};

// --- formulario / formulário ---

const atributosFormulario: MapaAtributos = {
    'nome': {
        documentacao: '# `nome` em `formulario`\nAtribui um nome ao formulário para que possa ser referenciado por JavaScript (`document.forms["nome"]`). Não afeta o envio dos dados.\n\nEquivalente HTML: `name`',
        exemploCodigo: '<formulario nome="cadastro" acao="/cadastrar" metodo="post">\n ...\n</formulario>'
    },
    'acao': {
        documentacao: '# `acao` em `formulario`\nDefine a URL do servidor que receberá e processará os dados do formulário quando enviado. Se omitido, o formulário é enviado para a URL da página atual.\n\nEquivalente HTML: `action`',
        exemploCodigo: '<formulario acao="/api/contato" metodo="post">\n <campo tipo="email" nome="email">\n <campo tipo="enviar" valor="Enviar">\n</formulario>'
    },
    'metodo': {
        documentacao: '# `metodo` em `formulario`\nDefine o método HTTP para envio dos dados:\n- `obter` (GET): dados enviados na URL — visíveis, limitados em tamanho, adequados para buscas\n- `publicar` (POST): dados enviados no corpo da requisição — mais seguro, sem limite de tamanho, adequado para dados sensíveis\n\nEquivalente HTML: `method`',
        exemploCodigo: '<formulario acao="/login" metodo="post">\n <campo tipo="texto" nome="usuario">\n <campo tipo="senha" nome="senha">\n</formulario>'
    },
    'codificacao': {
        documentacao: '# `codificacao` em `formulario`\nDefine como os dados são codificados antes do envio. Obrigatório ao incluir upload de arquivos:\n- `application/x-www-form-urlencoded`: padrão para texto\n- `multipart/form-data`: necessário para campos do tipo `arquivo`\n- `text/plain`: sem codificação (uso raro)\n\nEquivalente HTML: `enctype`',
        exemploCodigo: '<formulario acao="/upload" metodo="post" codificacao="multipart/form-data">\n <campo tipo="arquivo" nome="foto">\n <campo tipo="enviar" valor="Enviar foto">\n</formulario>'
    }
};

// --- botao / botão ---

const atributosBotao: MapaAtributos = {
    'tipo': {
        documentacao: '# `tipo` em `botao`\nDefine o comportamento do botão dentro de um formulário:\n- `enviar`: envia o formulário (comportamento padrão)\n- `redefinir`: limpa todos os campos do formulário para os valores iniciais\n- `botao`: nenhum comportamento padrão — use com JavaScript\n\nEquivalente HTML: `type`',
        exemploCodigo: '<botao tipo="enviar">Cadastrar</botao>\n<botao tipo="redefinir">Limpar</botao>\n<botao tipo="botao" onclick="confirmar()">Confirmar</botao>'
    },
    'nome': {
        documentacao: '# `nome` em `botao`\nQuando o botão é do tipo `enviar`, este nome é incluído nos dados enviados ao servidor junto com o `valor`, permitindo identificar qual botão foi clicado quando há múltiplos botões de envio.\n\nEquivalente HTML: `name`',
        exemploCodigo: '<botao tipo="enviar" nome="acao" valor="salvar">Salvar</botao>\n<botao tipo="enviar" nome="acao" valor="publicar">Publicar</botao>'
    },
    'valor': {
        documentacao: '# `valor` em `botao`\nO valor enviado ao servidor junto com o `nome` do botão quando ele é clicado para enviar o formulário. Não afeta o texto exibido no botão.\n\nEquivalente HTML: `value`',
        exemploCodigo: '<botao tipo="enviar" nome="acao" valor="salvar-rascunho">Salvar Rascunho</botao>'
    }
};

// --- area-texto / área-texto ---

const atributosAreaTexto: MapaAtributos = {
    'nome': {
        documentacao: '# `nome` em `area-texto`\nIdentifica o campo de texto longo no envio do formulário. O servidor receberá o conteúdo digitado com este nome como chave.\n\nEquivalente HTML: `name`',
        exemploCodigo: '<area-texto nome="mensagem" linhas="5" colunas="40" placeholder="Escreva sua mensagem...">\n</area-texto>'
    }
};

// --- selecao / seleção ---

const atributosSelecao: MapaAtributos = {
    'nome': {
        documentacao: '# `nome` em `selecao`\nIdentifica a lista de seleção no envio do formulário. O servidor receberá o `valor` da opção selecionada com este nome como chave.\n\nEquivalente HTML: `name`',
        exemploCodigo: '<selecao nome="estado">\n <opcao valor="SP">São Paulo</opcao>\n <opcao valor="RJ">Rio de Janeiro</opcao>\n</selecao>'
    }
};

// --- opcao / opção ---

const atributosOpcao: MapaAtributos = {
    'valor': {
        documentacao: '# `valor` em `opcao`\nDefine o dado enviado ao servidor quando esta opção é selecionada. Pode diferir do texto visível ao usuário — use um identificador significativo para o servidor.\n\nEquivalente HTML: `value`',
        exemploCodigo: '<selecao nome="tamanho">\n <opcao valor="p">Pequeno</opcao>\n <opcao valor="m" selecionado>Médio</opcao>\n <opcao valor="g">Grande</opcao>\n</selecao>'
    },
    'selecionado': {
        documentacao: '# `selecionado` em `opcao`\nMarca esta opção como pré-selecionada quando a lista carrega. Em uma `selecao` simples, apenas uma opção pode estar selecionada; com o atributo `multiplo`, várias podem estar marcadas.\n\nEquivalente HTML: `selected`',
        exemploCodigo: '<selecao nome="pais">\n <opcao valor="br" selecionado>Brasil</opcao>\n <opcao valor="pt">Portugal</opcao>\n</selecao>'
    }
};

// --- rotulo (label) ---

const atributosRotulo: MapaAtributos = {
    'para': {
        documentacao: '# `para` em `rotulo`\nAssocia o rótulo a um campo de formulário específico pelo seu `id`. Clicar no texto do rótulo move o foco para o campo associado, melhorando a usabilidade e acessibilidade.\n\nEquivalente HTML: `for`',
        exemploCodigo: '<rotulo para="campo-email">Endereço de e-mail:</rotulo>\n<campo tipo="email" id="campo-email" nome="email">'
    }
};

// --- imagem ---

const atributosImagem: MapaAtributos = {
    'fonte': {
        documentacao: '# `fonte` em `imagem`\nEspecifica a URL da imagem a ser exibida. Pode ser um caminho relativo, absoluto ou uma URL externa.\n\nEquivalente HTML: `src`',
        exemploCodigo: '<imagem fonte="fotos/perfil.jpg" alt="Foto de perfil" largura="200" altura="200">'
    },
    'largura': {
        documentacao: '# `largura` em `imagem`\nDefine a largura de exibição da imagem em pixels. Especificar as dimensões reais da imagem evita o deslocamento do layout enquanto a página carrega (Cumulative Layout Shift).\n\nEquivalente HTML: `width`',
        exemploCodigo: '<imagem fonte="banner.jpg" largura="1200" altura="400" alt="Banner principal">'
    },
    'altura': {
        documentacao: '# `altura` em `imagem`\nDefine a altura de exibição da imagem em pixels. Especificar as dimensões reais da imagem evita o deslocamento do layout enquanto a página carrega (Cumulative Layout Shift).\n\nEquivalente HTML: `height`',
        exemploCodigo: '<imagem fonte="banner.jpg" largura="1200" altura="400" alt="Banner principal">'
    }
};

// --- audio / áudio ---

const atributosAudio: MapaAtributos = {
    'fonte': {
        documentacao: '# `fonte` em `audio`\nEspecifica a URL do arquivo de áudio. Formatos suportados pelos navegadores: MP3 (`.mp3`), OGG (`.ogg`), WAV (`.wav`). Para suportar múltiplos formatos, use estruturas `fonte-midia` filhas em vez deste atributo.\n\nEquivalente HTML: `src`',
        exemploCodigo: '<audio fonte="musica.mp3" controles>\n Seu navegador não suporta áudio.\n</audio>'
    }
};

// --- video ---

const atributosVideo: MapaAtributos = {
    'fonte': {
        documentacao: '# `fonte` em `video`\nEspecifica a URL do arquivo de vídeo. Formatos comuns: MP4 (`.mp4`), WebM (`.webm`), OGG (`.ogv`). Para suportar múltiplos formatos, use estruturas `fonte-midia` filhas em vez deste atributo.\n\nEquivalente HTML: `src`',
        exemploCodigo: '<video fonte="apresentacao.mp4" controles largura="640" altura="360">\n Seu navegador não suporta vídeo.\n</video>'
    },
    'poster': {
        documentacao: '# `poster` em `video`\nEspecifica a URL de uma imagem exibida como miniatura enquanto o vídeo não foi reproduzido ou está sendo baixado. Melhora a experiência visual da página.\n\nEquivalente HTML: `poster`',
        exemploCodigo: '<video fonte="filme.mp4" poster="thumbnail.jpg" controles largura="640" altura="360">\n</video>'
    },
    'largura': {
        documentacao: '# `largura` em `video`\nDefine a largura do player de vídeo em pixels.\n\nEquivalente HTML: `width`',
        exemploCodigo: '<video fonte="video.mp4" largura="854" altura="480" controles></video>'
    },
    'altura': {
        documentacao: '# `altura` em `video`\nDefine a altura do player de vídeo em pixels.\n\nEquivalente HTML: `height`',
        exemploCodigo: '<video fonte="video.mp4" largura="854" altura="480" controles></video>'
    }
};

// --- fonte-midia / fonte-mídia (source) ---

const atributosFonteMidia: MapaAtributos = {
    'fonte': {
        documentacao: '# `fonte` em `fonte-midia`\nEspecifica a URL do arquivo de mídia desta fonte alternativa. O navegador escolhe automaticamente o primeiro formato suportado dentre as `fonte-midia` disponíveis.\n\nEquivalente HTML: `src`',
        exemploCodigo: '<video controles>\n <fonte-midia fonte="video.webm" tipo="video/webm">\n <fonte-midia fonte="video.mp4" tipo="video/mp4">\n Seu navegador não suporta vídeo.\n</video>'
    },
    'tipo': {
        documentacao: '# `tipo` em `fonte-midia`\nEspecifica o tipo MIME do arquivo de mídia desta fonte. Permite ao navegador verificar o suporte sem precisar baixar o arquivo. Exemplos:\n- `audio/mpeg` para MP3\n- `audio/ogg` para OGG\n- `video/mp4` para MP4\n- `video/webm` para WebM\n\nEquivalente HTML: `type`',
        exemploCodigo: '<audio controles>\n <fonte-midia fonte="musica.mp3" tipo="audio/mpeg">\n <fonte-midia fonte="musica.ogg" tipo="audio/ogg">\n</audio>'
    }
};

// --- script ---

const atributosScript: MapaAtributos = {
    'fonte': {
        documentacao: '# `fonte` em `script`\nEspecifica a URL de um arquivo JavaScript externo. Quando presente, o conteúdo interno da estrutura `script` é ignorado.\n\nEquivalente HTML: `src`',
        exemploCodigo: '<script fonte="js/app.js"></script>\n<script fonte="https://cdn.exemplo.com/biblioteca.min.js"></script>'
    },
    'tipo': {
        documentacao: '# `tipo` em `script`\nEspecifica o tipo MIME do script. Valores:\n- Omitido ou `text/javascript`: JavaScript padrão\n- `module`: script ES Module (suporta `import`/`export`)\n- `application/json`: bloco de dados JSON (não executado)\n\nEquivalente HTML: `type`',
        exemploCodigo: '<script tipo="module" fonte="app.mjs"></script>\n<script tipo="application/json" id="dados">\n {"usuario": "joao"}\n</script>'
    }
};

// --- subpagina (iframe) ---

const atributosSubpagina: MapaAtributos = {
    'fonte': {
        documentacao: '# `fonte` em `subpagina`\nEspecifica a URL da página ou recurso a ser incorporado no quadro.\n\nEquivalente HTML: `src`',
        exemploCodigo: '<subpagina fonte="https://maps.google.com/..." largura="600" altura="400" titulo-elemento="Mapa"></subpagina>'
    },
    'nome': {
        documentacao: '# `nome` em `subpagina`\nAtribui um nome ao contexto de navegação do quadro. Este nome pode ser usado como valor do atributo `alvo` em ligações e formulários para que o resultado seja exibido dentro deste quadro.\n\nEquivalente HTML: `name`',
        exemploCodigo: '<subpagina nome="painel-conteudo" fonte="inicio.html"></subpagina>\n<ligacao destino="pagina2.html" alvo="painel-conteudo">Ir para Página 2</ligacao>'
    }
};

// --- celula-cabecalho / célula-cabeçalho (th) ---

const atributosCelulaCabecalho: MapaAtributos = {
    'escopo': {
        documentacao: '# `escopo` em `celula-cabecalho`\nIndica a quais células da tabela este cabeçalho se aplica, melhorando a acessibilidade para leitores de tela:\n- `coluna`: aplica-se a todas as células da coluna abaixo\n- `linha`: aplica-se a todas as células da linha à direita\n- `grupo-colunas`: aplica-se ao grupo de colunas\n- `grupo-linhas`: aplica-se ao grupo de linhas\n\nEquivalente HTML: `scope`',
        exemploCodigo: '<tabela>\n <linha-tabela>\n  <celula-cabecalho escopo="coluna">Nome</celula-cabecalho>\n  <celula-cabecalho escopo="coluna">Idade</celula-cabecalho>\n </linha-tabela>\n</tabela>'
    },
    'colunas-mescladas': {
        documentacao: '# `colunas-mescladas` em `celula-cabecalho`\nFaz o cabeçalho abranger horizontalmente N colunas, mesclando-o com as células de cabeçalho à direita.\n\nEquivalente HTML: `colspan`',
        exemploCodigo: '<tabela>\n <linha-tabela>\n  <celula-cabecalho colunas-mescladas="3">Endereço Completo</celula-cabecalho>\n </linha-tabela>\n</tabela>'
    },
    'linhas-mescladas': {
        documentacao: '# `linhas-mescladas` em `celula-cabecalho`\nFaz o cabeçalho abranger verticalmente N linhas, mesclando-o com as células abaixo.\n\nEquivalente HTML: `rowspan`',
        exemploCodigo: '<tabela>\n <linha-tabela>\n  <celula-cabecalho linhas-mescladas="2">Categoria</celula-cabecalho>\n  <celula-dados>Item 1</celula-dados>\n </linha-tabela>\n</tabela>'
    }
};

// --- celula-dados / célula-dados (td) ---

const atributosCelulaDados: MapaAtributos = {
    'colunas-mescladas': {
        documentacao: '# `colunas-mescladas` em `celula-dados`\nFaz a célula abranger horizontalmente N colunas, mesclando-a com as células de dados à direita da mesma linha.\n\nEquivalente HTML: `colspan`',
        exemploCodigo: '<tabela>\n <linha-tabela>\n  <celula-dados colunas-mescladas="2">Dado que ocupa duas colunas</celula-dados>\n </linha-tabela>\n</tabela>'
    },
    'linhas-mescladas': {
        documentacao: '# `linhas-mescladas` em `celula-dados`\nFaz a célula abranger verticalmente N linhas, mesclando-a com as células abaixo na mesma coluna.\n\nEquivalente HTML: `rowspan`',
        exemploCodigo: '<tabela>\n <linha-tabela>\n  <celula-dados linhas-mescladas="3">Dado que ocupa três linhas</celula-dados>\n  <celula-dados>Linha 1</celula-dados>\n </linha-tabela>\n</tabela>'
    }
};

// --- ligacao / ligação (a) ---

const atributosLigacao: MapaAtributos = {
    'tipo': {
        documentacao: '# `tipo` em `ligacao`\nEspecifica o tipo MIME do recurso vinculado, informando ao navegador o formato do conteúdo antes de acessá-lo (ex.: `text/html`, `application/pdf`, `image/png`).\n\nEquivalente HTML: `type`',
        exemploCodigo: '<ligacao destino="relatorio.pdf" tipo="application/pdf" download>Baixar PDF</ligacao>'
    }
};

// --- recurso / ligacao-estilo / ligação-estilo (link) ---
// "recurso" é o nome em estruturas.ts (usado no autocomplete);
// "ligacao-estilo" vem do mapeamento-tags.js. Ambos mapeiam para <link>.
// O atributo de URL é "destino" (href), não "fonte" (src).

const atributosRecurso: MapaAtributos = {
    'relacao': {
        documentacao: '# `relacao` em `recurso`\nDefine o relacionamento entre o documento atual e o recurso vinculado. Para folhas de estilo, use `stylesheet`. Outros valores comuns:\n- `preload`: pré-carrega o recurso\n- `prefetch`: busca o recurso antecipadamente\n- `icon`: ícone da página (favicon)\n- `canonical`: URL canônica da página\n\nEquivalente HTML: `rel`',
        exemploCodigo: '<recurso relacao="stylesheet" destino="estilos/principal.css">\n<recurso relacao="icon" destino="favicon.ico">'
    },
    'destino': {
        documentacao: '# `destino` em `recurso`\nEspecifica a URL da folha de estilo, ícone ou outro recurso externo a ser vinculado ao documento.\n\nEquivalente HTML: `href`',
        exemploCodigo: '<recurso relacao="stylesheet" destino="estilos/principal.css">'
    },
    'tipo': {
        documentacao: '# `tipo` em `recurso`\nEspecifica o tipo MIME do recurso vinculado. Para folhas de estilo, use `text/css`. Na maioria dos casos modernos, este atributo pode ser omitido.\n\nEquivalente HTML: `type`',
        exemploCodigo: '<recurso relacao="stylesheet" tipo="text/css" destino="estilos.css">'
    }
};

// --- item-lista (li) ---

const atributosItemLista: MapaAtributos = {
    'valor': {
        documentacao: '# `valor` em `item-lista`\nEm `lista-numerada` (`ol`), redefine o valor numérico deste item e dos seguintes. Útil para reiniciar a contagem ou pular números.\n\nEquivalente HTML: `value`',
        exemploCodigo: '<lista-numerada>\n <item-lista>Primeiro</item-lista>\n <item-lista valor="5">Quinto</item-lista>\n <item-lista>Sexto</item-lista>\n</lista-numerada>'
    }
};

// Exportação: mapeia nome da estrutura LMHT → atributos contextuais

export default {
    // meta-dados
    'meta-dados': atributosMetaDados,
    // campo / entrada-texto (input)
    'campo': atributosCampo,
    'entrada-texto': atributosCampo,
    // formulario
    'formulario': atributosFormulario,
    'formulário': atributosFormulario,
    // botao
    'botao': atributosBotao,
    'botão': atributosBotao,
    // area-texto
    'area-texto': atributosAreaTexto,
    'área-texto': atributosAreaTexto,
    // selecao
    'selecao': atributosSelecao,
    'seleção': atributosSelecao,
    // opcao
    'opcao': atributosOpcao,
    'opção': atributosOpcao,
    // rotulo / etiqueta (label)
    // "etiqueta" é o nome em estruturas.ts; "rotulo" vem do mapeamento-tags.js
    'rotulo': atributosRotulo,
    'etiqueta': atributosRotulo,
    // imagem
    'imagem': atributosImagem,
    // audio
    'audio': atributosAudio,
    'áudio': atributosAudio,
    // video
    'video': atributosVideo,
    // fonte-midia (source)
    'fonte-midia': atributosFonteMidia,
    'fonte-mídia': atributosFonteMidia,
    // script
    'script': atributosScript,
    // subpagina (iframe)
    'subpagina': atributosSubpagina,
    // celula-cabecalho (th)
    'celula-cabecalho': atributosCelulaCabecalho,
    'célula-cabeçalho': atributosCelulaCabecalho,
    // celula-dados (td)
    'celula-dados': atributosCelulaDados,
    'célula-dados': atributosCelulaDados,
    // ligacao (a)
    'ligacao': atributosLigacao,
    'ligação': atributosLigacao,
    // recurso / ligacao-estilo (link)
    // "recurso" é o nome em estruturas.ts (usado no autocomplete)
    'recurso': atributosRecurso,
    'ligacao-estilo': atributosRecurso,
    'ligação-estilo': atributosRecurso,
    // item-lista (li)
    'item-lista': atributosItemLista,
} as { [estrutura: string]: MapaAtributos };
