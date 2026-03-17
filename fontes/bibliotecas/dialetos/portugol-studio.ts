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
        exemploCodigo: '`area = Matematica.PI * Matematica.potencia(raio, 2.0)`',
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
