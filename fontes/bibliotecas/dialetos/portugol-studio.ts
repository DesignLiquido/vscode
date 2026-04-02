export const primitivasEntradaSaidaPortugolStudio: {
    nome: string;
    descricao?: string;
    documentacao: string;
    exemploCodigo?: string;
}[] = [
    {
        nome: 'escreva',
        descricao: 'Escreve valores na saída padrão.',
        documentacao:
            '# `escreva()`\n Escreve no dispositivo de saída padrão os valores informados.',
        exemploCodigo: '`escreva("Olá mundo")`',
    },
    {
        nome: 'leia',
        descricao: 'Lê valores de entrada e atribui em variáveis.',
        documentacao:
            '# `leia()`\n Lê valores digitados e atribui nas variáveis informadas.',
        exemploCodigo: '`escreva("Digite sua idade:")`\n`leia(minhaIdade)`',
    },
];

export const tiposPortugolStudio: {
    nome: string;
    descricao?: string;
    documentacao: string;
    exemploCodigo?: string;
}[] = [
    {
        nome: 'inteiro',
        descricao: 'Tipo numérico sem casas decimais.',
        documentacao: '# `inteiro`\n Tipo numérico sem casas decimais.',
        exemploCodigo: '`inteiro idade = 18`',
    },
    {
        nome: 'real',
        descricao: 'Tipo numérico com casas decimais.',
        documentacao: '# `real`\n Tipo numérico com casas decimais.',
        exemploCodigo: '`real media = 7.5`',
    },
    {
        nome: 'cadeia',
        descricao: 'Tipo textual para sequências de caracteres.',
        documentacao: '# `cadeia`\n Tipo para armazenar textos.',
        exemploCodigo: '`cadeia nome = "Maria"`',
    },
    {
        nome: 'caracter',
        descricao: 'Tipo para armazenar um caractere.',
        documentacao: '# `caracter`\n Tipo para armazenar um caractere.',
        exemploCodigo: "`caracter inicial = 'M'`",
    },
    {
        nome: 'logico',
        descricao: 'Tipo lógico booleano.',
        documentacao:
            '# `logico`\n Tipo lógico com valores `verdadeiro` e `falso`.',
        exemploCodigo: '`logico ativo = verdadeiro`',
    },
];

export const constantesPortugolStudio: {
    nome: string;
    descricao?: string;
    documentacao: string;
    exemploCodigo?: string;
}[] = [
    {
        nome: 'verdadeiro',
        descricao: 'Constante lógica para valor verdadeiro.',
        documentacao:
            '# `verdadeiro`\n Constante lógica que representa valor verdadeiro.',
        exemploCodigo: '`logico condicao = verdadeiro`',
    },
    {
        nome: 'falso',
        descricao: 'Constante lógica para valor falso.',
        documentacao:
            '# `falso`\n Constante lógica que representa valor falso.',
        exemploCodigo: '`logico condicao = falso`',
    },
];

export const calendarioPortugolStudio: {
    nome: string;
    descricao?: string;
    documentacao: string;
    exemploCodigo?: string;
}[] = [
    {
        nome: 'dia_mes_atual',
        descricao: 'Recupera o dia no mês atual do computador.',
        documentacao:
            '# `Calendario.dia_mes_atual()`\n Recupera o dia no mês atual do computador.\n\n **Retorno:** um inteiro com o dia no mês. Ex: 26.',
        exemploCodigo: '`dia = Calendario.dia_mes_atual()`',
    },
    {
        nome: 'dia_semana_atual',
        descricao: 'Recupera o dia da semana de 1 a 7.',
        documentacao:
            '# `Calendario.dia_semana_atual()`\n Recupera o dia da semana de 1 a 7.\n\n **Retorno:** um inteiro com o dia da semana. Ex: 1, para Domingo.',
        exemploCodigo: '`dia = Calendario.dia_semana_atual()`',
    },
    {
        nome: 'mes_atual',
        descricao: 'Recupera o mês atual do computador de 1 a 12.',
        documentacao:
            '# `Calendario.mes_atual()`\n Recupera o mês atual do computador de 1 a 12.\n\n **Retorno:** um inteiro com o mês. Ex: 10.',
        exemploCodigo: '`mes = Calendario.mes_atual()`',
    },
    {
        nome: 'ano_atual',
        descricao: 'Recupera o ano atual do computador.',
        documentacao:
            '# `Calendario.ano_atual()`\n Recupera o ano atual do computador.\n\n **Retorno:** um inteiro com o ano. Ex: 2012.',
        exemploCodigo: '`ano = Calendario.ano_atual()`',
    },
    {
        nome: 'hora_atual',
        descricao: 'Recupera os dígitos da hora atual do computador.',
        documentacao:
            '# `Calendario.hora_atual(formato_12h)`\n Recupera os dígitos da hora atual do computador.\n\n **Parâmetro `formato_12h`:** um lógico que, se verdadeiro, retorna no formato 12h; se falso, retorna no formato 24h.\n\n **Retorno:** um inteiro com a hora atual. Ex: 22 para 24h ou 10 para 12h.',
        exemploCodigo: '`hora = Calendario.hora_atual(falso)`',
    },
    {
        nome: 'minuto_atual',
        descricao: 'Recupera os dígitos do minuto atual do computador.',
        documentacao:
            '# `Calendario.minuto_atual()`\n Recupera os dígitos do minuto atual do computador.\n\n **Retorno:** um inteiro com os minutos atuais. Ex: 45.',
        exemploCodigo: '`minuto = Calendario.minuto_atual()`',
    },
    {
        nome: 'segundo_atual',
        descricao: 'Recupera os dígitos dos segundos atuais do computador.',
        documentacao:
            '# `Calendario.segundo_atual()`\n Recupera os dígitos dos segundos atuais do computador.\n\n **Retorno:** um inteiro com os segundos atuais. Ex: 32.',
        exemploCodigo: '`segundo = Calendario.segundo_atual()`',
    },
    {
        nome: 'milisegundo_atual',
        descricao:
            'Recupera os dígitos dos milissegundos atuais do computador.',
        documentacao:
            '# `Calendario.milisegundo_atual()`\n Recupera os dígitos dos milissegundos atuais do computador.\n\n **Retorno:** um inteiro com os milissegundos atuais, com um, dois ou três dígitos. Ex: 426.',
        exemploCodigo: '`ms = Calendario.milisegundo_atual()`',
    },
    {
        nome: 'dia_semana_completo',
        descricao:
            'De acordo com o valor de 1 a 7 informado retornará um dia da semana completo.',
        documentacao:
            '# `Calendario.dia_semana_completo(numero_dia, caixa_alta, caixa_baixa)`\n De acordo com o valor de 1 a 7 informado retornará um dia da semana completo.\n\n **Parâmetros:**\n- `numero_dia`: um inteiro referente a um dia da semana (1 = Domingo, ..., 7 = Sábado)\n- `caixa_alta`: lógico para retorno em caracteres maiúsculos\n- `caixa_baixa`: lógico para retorno em caracteres minúsculos\n\n **Retorno:** uma cadeia com o dia da semana completo. Ex: Segunda-Feira.',
        exemploCodigo:
            '`nome = Calendario.dia_semana_completo(2, falso, falso)`',
    },
    {
        nome: 'dia_semana_curto',
        descricao:
            'De acordo com o valor de 1 a 7 informado retornará um dia da semana de forma curta.',
        documentacao:
            '# `Calendario.dia_semana_curto(numero_dia, caixa_alta, caixa_baixa)`\n De acordo com o valor de 1 a 7 informado retornará um dia da semana de forma curta.\n\n **Parâmetros:**\n- `numero_dia`: um inteiro referente a um dia da semana (1 = Domingo, ..., 7 = Sábado)\n- `caixa_alta`: lógico para retorno em caracteres maiúsculos\n- `caixa_baixa`: lógico para retorno em caracteres minúsculos\n\n **Retorno:** uma cadeia com o dia da semana de forma curta. Ex: Segunda, para Segunda-Feira.',
        exemploCodigo: '`nome = Calendario.dia_semana_curto(2, falso, falso)`',
    },
    {
        nome: 'dia_semana_abreviado',
        descricao:
            'De acordo com o valor de 1 a 7 informado retornará um dia da semana abreviado.',
        documentacao:
            '# `Calendario.dia_semana_abreviado(numero_dia, caixa_alta, caixa_baixa)`\n De acordo com o valor de 1 a 7 informado retornará um dia da semana abreviado.\n\n **Parâmetros:**\n- `numero_dia`: um inteiro referente a um dia da semana (1 = Domingo, ..., 7 = Sábado)\n- `caixa_alta`: lógico para retorno em caracteres maiúsculos\n- `caixa_baixa`: lógico para retorno em caracteres minúsculos\n\n **Retorno:** uma cadeia com o dia da semana abreviado. Ex: Seg, para Segunda-Feira.',
        exemploCodigo:
            '`nome = Calendario.dia_semana_abreviado(2, falso, falso)`',
    },
];

export const matematicaPortugolStudio: {
    nome: string;
    descricao?: string;
    documentacao: string;
    exemploCodigo?: string;
}[] = [
    {
        nome: 'PI',
        descricao:
            'Constante matemática que representa a relação entre o perímetro de uma circunferência e seu diâmetro.',
        documentacao:
            '# `Matematica.PI`\n Constante matemática que representa a relação entre o perímetro de uma circunferência e seu diâmetro (perímetro/diâmetro), aproximadamente 3.14159265.',
        exemploCodigo: '`area = Matematica.PI * raio * raio`',
    },
    {
        nome: 'potencia',
        descricao:
            'Realiza uma exponenciação através da multiplicação da base por ela mesma tantas vezes quanto indicar o expoente.',
        documentacao:
            '# `Matematica.potencia(base, expoente)`\n Realiza uma exponenciação através da multiplicação da `base` por ela mesma tantas vezes quanto indicar o `expoente`.\n\n **Retorno:** a exponenciação da base pelo expoente.',
        exemploCodigo:
            '`area = Matematica.PI * Matematica.potencia(raio, 2.0)`',
    },
    {
        nome: 'raiz',
        descricao:
            'Realiza a radiciação (extrai a raíz) de um número por um determinado índice.',
        documentacao:
            '# `Matematica.raiz(radicando, indice)`\n Realiza a radiciação (extrai a raíz) de um número por um determinado índice.\n\n **Parâmetros:**\n- `radicando`: o número do qual será extraída a raíz\n- `indice`: indica o grau da radiciação. Quando o índice é 2 a raíz é quadrada, quando é 3 a raíz é cúbica, e assim por diante\n\n **Retorno:** a raíz do número informado.',
        exemploCodigo: '`resultado = Matematica.raiz(27, 3)`',
    },
    {
        nome: 'arredondar',
        descricao:
            'Arredonda um número real para o número de casas decimais informadas.',
        documentacao:
            '# `Matematica.arredondar(numero, casas)`\n Arredonda um número real para o número de casas decimais informadas. Quando o último dígito for maior ou igual a 5, o número será arredondado para cima; quando for menor que 5, será arredondado para baixo.\n\n **Retorno:** o número arredondado.',
        exemploCodigo: '`resultado = Matematica.arredondar(3.14159, 2)`',
    },
    {
        nome: 'logaritmo',
        descricao:
            'Calcula o logaritmo de um número para uma determinada base.',
        documentacao:
            '# `Matematica.logaritmo(numero, base)`\n Calcula o logaritmo de um número para uma determinada base.\n\n **Parâmetros:**\n- `numero`: o número resultante da exponenciação\n- `base`: a base da exponenciação\n\n **Retorno:** o logaritmo.',
        exemploCodigo: '`resultado = Matematica.logaritmo(2, 32)`',
    },
    {
        nome: 'seno',
        descricao: 'Calcula o seno do ângulo informado.',
        documentacao:
            '# `Matematica.seno(angulo)`\n Calcula o seno do `angulo` informado.\n\n **Retorno:** o seno do ângulo informado.',
        exemploCodigo: '`resultado = Matematica.seno(1.5708)`',
    },
    {
        nome: 'cosseno',
        descricao: 'Calcula o cosseno do ângulo informado.',
        documentacao:
            '# `Matematica.cosseno(angulo)`\n Calcula o cosseno do `angulo` informado.\n\n **Retorno:** o cosseno do ângulo informado.',
        exemploCodigo: '`resultado = Matematica.cosseno(0.0)`',
    },
    {
        nome: 'tangente',
        descricao: 'Calcula a tangente do ângulo informado.',
        documentacao:
            '# `Matematica.tangente(angulo)`\n Calcula a tangente do `angulo` informado.\n\n **Retorno:** a tangente do ângulo informado.',
        exemploCodigo: '`resultado = Matematica.tangente(0.7854)`',
    },
    {
        nome: 'valor_absoluto',
        descricao: 'Calcula o valor absoluto do número informado.',
        documentacao:
            '# `Matematica.valor_absoluto(numero)`\n Calcula o valor absoluto do `numero` informado.\n\n **Retorno:** o valor absoluto do número informado.',
        exemploCodigo: '`resultado = Matematica.valor_absoluto(-15)`',
    },
    {
        nome: 'maior_numero',
        descricao: 'Identifica o maior número entre os números informados.',
        documentacao:
            '# `Matematica.maior_numero(numeroA, numeroB)`\n Identifica o maior número entre os números informados.\n\n **Retorno:** o maior número.',
        exemploCodigo: '`resultado = Matematica.maior_numero(10, 20)`',
    },
    {
        nome: 'menor_numero',
        descricao: 'Identifica o menor número entre os números informados.',
        documentacao:
            '# `Matematica.menor_numero(numeroA, numeroB)`\n Identifica o menor número entre os números informados.\n\n **Retorno:** o menor número.',
        exemploCodigo: '`resultado = Matematica.menor_numero(10, 20)`',
    },
];

export const textoPortugolStudio: {
    nome: string;
    descricao?: string;
    documentacao: string;
    exemploCodigo?: string;
}[] = [
    {
        nome: 'numero_caracteres',
        descricao: 'Conta o número de caracteres existentes em uma cadeia.',
        documentacao:
            '# `Texto.numero_caracteres(cadeia)`\n Conta o número de caracteres existentes em uma cadeia.\n\n **Retorno:** o número de caracteres na cadeia.',
        exemploCodigo: '`tamanho = Texto.numero_caracteres("Olá mundo")`',
    },
    {
        nome: 'caixa_alta',
        descricao:
            'Transforma os caracteres de uma cadeia em caracteres maiúsculos.',
        documentacao:
            '# `Texto.caixa_alta(cad)`\n Transforma os caracteres de uma cadeia em caracteres maiúsculos.\n\n **Retorno:** a cadeia com os caracteres transformados.',
        exemploCodigo: '`resultado = Texto.caixa_alta("olá mundo")`',
    },
    {
        nome: 'caixa_baixa',
        descricao:
            'Transforma os caracteres de uma cadeia em caracteres minúsculos.',
        documentacao:
            '# `Texto.caixa_baixa(cad)`\n Transforma os caracteres de uma cadeia em caracteres minúsculos.\n\n **Retorno:** a cadeia com os caracteres transformados.',
        exemploCodigo: '`resultado = Texto.caixa_baixa("OLÁ MUNDO")`',
    },
    {
        nome: 'substituir',
        descricao:
            'Pesquisa por um determinado texto em uma cadeia e substitui todas as ocorrências por um texto alternativo.',
        documentacao:
            '# `Texto.substituir(cad, texto_pesquisa, texto_substituto)`\n Pesquisa por um determinado texto em uma cadeia e substitui **todas** as ocorrências por um texto alternativo.\n\n **Retorno:** a cadeia resultante da substituição.',
        exemploCodigo:
            '`resultado = Texto.substituir("Olá mundo mundo", "mundo", "Portugol")`',
    },
    {
        nome: 'preencher_a_esquerda',
        descricao:
            'Concatena o caracter informado à esquerda da cadeia até que ela fique do tamanho indicado.',
        documentacao:
            '# `Texto.preencher_a_esquerda(car, tamanho, cad)`\n Concatena o `car` informado à esquerda da cadeia `cad` até que ela fique do `tamanho` indicado.\n\n Se o tamanho da cadeia for maior ou igual ao tamanho informado, nada é feito.\n\n **Retorno:** a cadeia transformada.',
        exemploCodigo: '`resultado = Texto.preencher_a_esquerda("0", 5, "42")`',
    },
    {
        nome: 'obter_caracter',
        descricao: 'Obtém um caracter da cadeia a partir de seu índice.',
        documentacao:
            '# `Texto.obter_caracter(cad, indice)`\n Obtém um caracter da cadeia a partir de seu índice.\n\n O índice deve estar entre 0 e o número de caracteres da cadeia.\n\n **Retorno:** o caracter no índice informado.',
        exemploCodigo: '`c = Texto.obter_caracter("Portugol", 0)`',
    },
    {
        nome: 'posicao_texto',
        descricao:
            'Procura por um texto dentro de uma cadeia e retorna a posição da primeira ocorrência.',
        documentacao:
            '# `Texto.posicao_texto(cadeia, texto, posicao_inicial)`\n Procura por um `texto` dentro de uma `cadeia` e, caso encontrado, retorna a posição da primeira ocorrência. Para procurar a partir do início da cadeia informe `posicao_inicial` como 0.\n\n **Retorno:** a posição da primeira ocorrência do texto, ou -1 caso não seja encontrado.',
        exemploCodigo: '`pos = Texto.posicao_texto("Olá mundo", "mundo", 0)`',
    },
    {
        nome: 'extrair_subtexto',
        descricao:
            'Extrai uma parte da cadeia delimitada pela posição inicial e final.',
        documentacao:
            '# `Texto.extrair_subtexto(cadeia, posicao_inicial, posicao_final)`\n Extrai uma parte da cadeia delimitada pela posição inicial e final.\n\n **Exemplos:**\n- `extrair_subtexto("salgado", 0, 3)` → `"sal"`\n- `extrair_subtexto("salgado", 3, 7)` → `"gado"`\n- `extrair_subtexto("salgado", 1, 5)` → `"alga"`\n\n **Retorno:** uma cadeia contendo o subtexto.',
        exemploCodigo: '`sub = Texto.extrair_subtexto("salgado", 0, 3)`',
    },
];

export const utilPortugolStudio: {
    nome: string;
    descricao?: string;
    documentacao: string;
    exemploCodigo?: string;
}[] = [
    {
        nome: 'obter_diretorio_usuario',
        descricao:
            'Obtém o caminho utilizado pelo Sistema Operacional como diretório do usuário atual.',
        documentacao:
            '# `Util.obter_diretorio_usuario()`\n Obtém o caminho utilizado pelo Sistema Operacional como diretório do usuário atual.\n\n **Retorno:** o diretório do usuário.',
        exemploCodigo: '`dir = Util.obter_diretorio_usuario()`',
    },
    {
        nome: 'numero_elementos',
        descricao: 'Descobre o número de elementos existentes em um vetor.',
        documentacao:
            '# `Util.numero_elementos(vetor)`\n Descobre o número de elementos existentes em um vetor.\n\n **Retorno:** o número de elementos existentes no vetor.',
        exemploCodigo: '`tamanho = Util.numero_elementos(meuVetor)`',
    },
    {
        nome: 'numero_linhas',
        descricao: 'Descobre o número de linhas existentes em uma matriz.',
        documentacao:
            '# `Util.numero_linhas(matriz)`\n Descobre o número de linhas existentes em uma matriz.\n\n **Retorno:** o número de linhas existentes na matriz.',
        exemploCodigo: '`linhas = Util.numero_linhas(minhaMatriz)`',
    },
    {
        nome: 'numero_colunas',
        descricao: 'Descobre o número de colunas existentes em uma matriz.',
        documentacao:
            '# `Util.numero_colunas(matriz)`\n Descobre o número de colunas existentes em uma matriz.\n\n **Retorno:** o número de colunas existentes na matriz.',
        exemploCodigo: '`colunas = Util.numero_colunas(minhaMatriz)`',
    },
    {
        nome: 'sorteia',
        descricao:
            'Sorteia um número aleatório entre os valores mínimo e máximo especificados.',
        documentacao:
            '# `Util.sorteia(minimo, maximo)`\n Sorteia um número aleatório entre os valores mínimo e máximo especificados.\n\n **Parâmetros:**\n- `minimo`: o menor número que pode ser sorteado\n- `maximo`: o maior número que pode ser sorteado\n\n **Retorno:** o número sorteado.',
        exemploCodigo: '`numero = Util.sorteia(1, 100)`',
    },
    {
        nome: 'aguarde',
        descricao:
            'Pausa a execução do programa durante o intervalo de tempo especificado.',
        documentacao:
            '# `Util.aguarde(intervalo)`\n Pausa a execução do programa durante o intervalo de tempo especificado.\n\n **Parâmetro `intervalo`:** o intervalo de tempo (em milissegundos) durante o qual o programa ficará pausado.',
        exemploCodigo: '`Util.aguarde(1000)`',
    },
    {
        nome: 'tempo_decorrido',
        descricao:
            'Obtém o tempo decorrido (em milissegundos) desde que a biblioteca foi utilizada pela primeira vez.',
        documentacao:
            '# `Util.tempo_decorrido()`\n Obtém o tempo decorrido (em milissegundos) desde que a biblioteca foi utilizada pela primeira vez.\n\n **Retorno:** o tempo decorrido em milissegundos.',
        exemploCodigo: '`ms = Util.tempo_decorrido()`',
    },
];
