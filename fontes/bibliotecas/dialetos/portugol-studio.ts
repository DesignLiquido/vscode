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
