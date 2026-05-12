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
                '### Descrição\n\nEscreve no dispositivo de saída padrão os valores informados. Não quebra linha ao final.\n\n### Parâmetros\n\n- `[valor1], [valor2], ...`: Valores a serem escritos. Devem ser separados por vírgulas.\n\n### Exemplo de Código\n\n```portugol\nprograma {\n    funcao inicio() {\n        escreva("Olá mundo")\n        escreva("Valor: ", resultado)\n        escreva("Nome: ", nome, " | Idade: ", idade)\n    }\n}\n```\n\n### Formas de uso\n\n`escreva([valor1], [valor2], ...)`',
            exemploCodigo: 'escreva("Olá mundo")',
        },
        {
            nome: 'leia',
            descricao: 'Lê valores de entrada e atribui em variáveis.',
            documentacao:
                '### Descrição\n\nLê valores digitados no dispositivo de entrada padrão e atribui nas variáveis informadas.\n\n### Exemplo de Código\n\n```portugol\nescreva("Digite sua idade: ")\nleia(idade)\nescreva("Você tem " + idade + " anos")\n```\n\n### Formas de uso\n\n`leia([variavel1], [variavel2], ...)`',
            exemploCodigo: 'escreva("Digite sua idade: ")\nleia(idade)',
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
            documentacao:
                '### Descrição\n\nTipo numérico que representa números inteiros (sem parte decimal). Pode armazenar valores como 1, 42, -7, 1000.\n\n### Exemplo de Código\n\n```portugol\ninteiro idade = 18\ninteiro contador = 0\nidade = idade + 1\n```\n\n### Formas de uso\n\n`inteiro [nome] = [valor]`\n`inteiro [nome]`',
            exemploCodigo: 'inteiro idade = 18',
        },
        {
            nome: 'real',
            descricao: 'Tipo numérico com casas decimais.',
            documentacao:
                '### Descrição\n\nTipo numérico que representa números reais (com parte decimal). Pode armazenar valores como 3.14, -0.5, 2.71828.\n\n### Exemplo de Código\n\n```portugol\nreal media = 7.5\nreal preco = 19.99\nreal temperatura = -2.5\n```\n\n### Formas de uso\n\n`real [nome] = [valor]`\n`real [nome]`',
            exemploCodigo: 'real media = 7.5',
        },
        {
            nome: 'cadeia',
            descricao: 'Tipo textual para sequências de caracteres.',
            documentacao:
                '### Descrição\n\nTipo que armazena sequências de caracteres (textos). Deve ser delimitado por aspas duplas.\n\n### Exemplo de Código\n\n```portugol\ncadeia nome = "Maria"\ncadeia mensagem = "Olá, mundo!"\ncadeia vazio = ""\n```\n\n### Formas de uso\n\n`cadeia [nome] = "[texto]"`\n`cadeia [nome]`',
            exemploCodigo: 'cadeia nome = "Maria"',
        },
        {
            nome: 'caracter',
            descricao: 'Tipo para armazenar um caractere.',
            documentacao:
                '### Descrição\n\nTipo que armazena um único caractere. Deve ser delimitado por aspas simples.\n\n### Exemplo de Código\n\n```portugol\ncaracter inicial = \'M\'\ncaracter letra = \'a\'\n```\n\n### Formas de uso\n\n`caracter [nome] = \'[caractere]\'`\n`caracter [nome]`',
            exemploCodigo: "caracter inicial = 'M'",
        },
        {
            nome: 'logico',
            descricao: 'Tipo lógico booleano.',
            documentacao:
                '### Descrição\n\nTipo lógico que representa valores booleanos: `verdadeiro` ou `falso`. Usado em condições e expressões lógicas.\n\n### Exemplo de Código\n\n```portugol\nlogico ativo = verdadeiro\nlogico maior = (idade >= 18)\nlogico temPermissao = falso\n```\n\n### Formas de uso\n\n`logico [nome] = [verdadeiro|falso]`\n`logico [nome]`',
            exemploCodigo: 'logico ativo = verdadeiro',
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
                '### Descrição\n\nConstante lógica que representa o valor verdadeiro. Usado em variáveis e expressões booleanas.\n\n### Exemplo de Código\n\n```portugol\nlogico ativo = verdadeiro\nse (ativo == verdadeiro) {\n\tescreva("Está ativo")\n}\n```\n\n### Formas de uso\n\n`logico [nome] = verdadeiro`',
            exemploCodigo: 'logico ativo = verdadeiro',
        },
        {
            nome: 'falso',
            descricao: 'Constante lógica para valor falso.',
            documentacao:
                '### Descrição\n\nConstante lógica que representa o valor falso. Usado em variáveis e expressões booleanas.\n\n### Exemplo de Código\n\n```portugol\nlogico ativo = falso\nse (ativo == falso) {\n\tescreva("Está inativo")\n}\n```\n\n### Formas de uso\n\n`logico [nome] = falso`',
            exemploCodigo: 'logico ativo = falso',
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
                '### Descrição\n\nRecupera o dia no mês atual do computador (1 a 31).\n\n### Exemplo de Código\n\n```portugol\nprograma {\n    funcao inicio() {\n        inteiro dia = Calendario.dia_mes_atual()\n        escreva("Hoje é dia: ", dia)\n    }\n}\n```\n\n### Retorno\n\nInteiro com o dia do mês (1 a 31).\n\n### Formas de uso\n\n`Calendario.dia_mes_atual()`',
            exemploCodigo: 'Calendario.dia_mes_atual()',
        },
        {
            nome: 'dia_semana_atual',
            descricao: 'Recupera o dia da semana de 1 a 7.',
            documentacao:
                '### Descrição\n\nRecupera o dia da semana atual (1 a 7), onde 1 representa Domingo.\n\n### Exemplo de Código\n\n```portugol\nprograma {\n    funcao inicio() {\n        inteiro dia = Calendario.dia_semana_atual()\n        escreva("Dia da semana: ", dia)\n    }\n}\n```\n\n### Retorno\n\nInteiro com o dia da semana (1 = Domingo, 7 = Sábado).\n\n### Formas de uso\n\n`Calendario.dia_semana_atual()`',
            exemploCodigo: 'Calendario.dia_semana_atual()',
        },
        {
            nome: 'mes_atual',
            descricao: 'Recupera o mês atual do computador de 1 a 12.',
            documentacao:
                '### Descrição\n\nRecupera o mês atual do computador (1 a 12).\n\n### Exemplo de Código\n\n```portugol\nprograma {\n    funcao inicio() {\n        inteiro mes = Calendario.mes_atual()\n        escreva("Mês: ", mes)\n    }\n}\n```\n\n### Retorno\n\nInteiro com o mês (1 = Janeiro, 12 = Dezembro).\n\n### Formas de uso\n\n`Calendario.mes_atual()`',
            exemploCodigo: 'Calendario.mes_atual()',
        },
        {
            nome: 'ano_atual',
            descricao: 'Recupera o ano atual do computador.',
            documentacao:
                '### Descrição\n\nRecupera o ano atual do computador.\n\n### Exemplo de Código\n\n```portugol\nprograma {\n    funcao inicio() {\n        inteiro ano = Calendario.ano_atual()\n        escreva("Ano: ", ano)\n    }\n}\n```\n\n### Retorno\n\nInteiro com o ano atual.\n\n### Formas de uso\n\n`Calendario.ano_atual()`',
            exemploCodigo: 'Calendario.ano_atual()',
        },
        {
            nome: 'hora_atual',
            descricao: 'Recupera os dígitos da hora atual do computador.',
            documentacao:
                '### Descrição\n\nRecupera os dígitos da hora atual do computador.\n\n### Parâmetros\n\n- `formato_12h`: Indica se o formato deve ser 12 horas (verdadeiro) ou 24 horas (falso).\n\n### Exemplo de Código\n\n```portugol\nprograma {\n    funcao inicio() {\n        inteiro hora = Calendario.hora_atual(falso)\n        escreva("Hora: ", hora)\n    }\n}\n```\n\n### Retorno\n\nInteiro com a hora atual (0 a 23 ou 1 a 12).\n\n### Formas de uso\n\n`Calendario.hora_atual(formato_12h)`',
            exemploCodigo: 'Calendario.hora_atual(falso)',
        },
        {
            nome: 'minuto_atual',
            descricao: 'Recupera os dígitos do minuto atual do computador.',
            documentacao:
                '### Descrição\n\nRecupera os dígitos do minuto atual do computador.\n\n### Exemplo de Código\n\n```portugol\nprograma {\n    funcao inicio() {\n        inteiro minuto = Calendario.minuto_atual()\n        escreva("Minuto: ", minuto)\n    }\n}\n```\n\n### Retorno\n\nInteiro com os minutos (0 a 59).\n\n### Formas de uso\n\n`Calendario.minuto_atual()`',
            exemploCodigo: 'Calendario.minuto_atual()',
        },
        {
            nome: 'segundo_atual',
            descricao: 'Recupera os dígitos dos segundos atuais do computador.',
            documentacao:
                '### Descrição\n\nRecupera os dígitos dos segundos atuais do computador.\n\n### Exemplo de Código\n\n```portugol\nprograma {\n    funcao inicio() {\n        inteiro segundo = Calendario.segundo_atual()\n        escreva("Segundo: ", segundo)\n    }\n}\n```\n\n### Retorno\n\nInteiro com os segundos (0 a 59).\n\n### Formas de uso\n\n`Calendario.segundo_atual()`',
            exemploCodigo: 'Calendario.segundo_atual()',
        },
        {
            nome: 'milisegundo_atual',
            descricao: 'Recupera os dígitos dos milissegundos atuais do computador.',
            documentacao:
                '### Descrição\n\nRecupera os dígitos dos milissegundos atuais do computador.\n\n### Exemplo de Código\n\n```portugol\nprograma {\n    funcao inicio() {\n        inteiro ms = Calendario.milisegundo_atual()\n        escreva("Milissegundos: ", ms)\n    }\n}\n```\n\n### Retorno\n\nInteiro com os milissegundos (0 a 999).\n\n### Formas de uso\n\n`Calendario.milisegundo_atual()`',
            exemploCodigo: 'Calendario.milisegundo_atual()',
        },
        {
            nome: 'dia_semana_completo',
            descricao: 'Retorna o nome completo do dia da semana.',
            documentacao:
                '### Descrição\n\nRetorna o nome completo do dia da semana com base em um número de 1 a 7.\n\n### Parâmetros\n\n- `numero_dia`: Inteiro de 1 a 7 (1 = Domingo).\n- `caixa_alta`: Se verdadeiro, retorna em maiúsculas.\n- `caixa_baixa`: Se verdadeiro, retorna em minúsculas.\n\n### Exemplo de Código\n\n```portugol\ncadeia nome = Calendario.dia_semana_completo(2, falso, falso)\nescreva(nome) // Segunda-Feira\n```\n\n### Retorno\n\nCadeia com o nome completo do dia da semana.\n\n### Formas de uso\n\n`Calendario.dia_semana_completo(numero_dia, caixa_alta, caixa_baixa)`',
            exemploCodigo: 'Calendario.dia_semana_completo(2, falso, falso)',
        },
        {
            nome: 'dia_semana_curto',
            descricao: 'Retorna o nome curto do dia da semana.',
            documentacao:
                '### Descrição\n\nRetorna o nome curto do dia da semana com base em um número de 1 a 7.\n\n### Parâmetros\n\n- `numero_dia`: Inteiro de 1 a 7 (1 = Domingo).\n- `caixa_alta`: Se verdadeiro, retorna em maiúsculas.\n- `caixa_baixa`: Se verdadeiro, retorna em minúsculas.\n\n### Exemplo de Código\n\n```portugol\ncadeia nome = Calendario.dia_semana_curto(2, falso, falso)\nescreva(nome) // Segunda\n```\n\n### Retorno\n\nCadeia com o nome curto do dia da semana.\n\n### Formas de uso\n\n`Calendario.dia_semana_curto(numero_dia, caixa_alta, caixa_baixa)`',
            exemploCodigo: 'Calendario.dia_semana_curto(2, falso, falso)',
        },
        {
            nome: 'dia_semana_abreviado',
            descricao: 'Retorna o nome abreviado do dia da semana.',
            documentacao:
                '### Descrição\n\nRetorna o nome abreviado do dia da semana com base em um número de 1 a 7.\n\n### Parâmetros\n\n- `numero_dia`: Inteiro de 1 a 7 (1 = Domingo).\n- `caixa_alta`: Se verdadeiro, retorna em maiúsculas.\n- `caixa_baixa`: Se verdadeiro, retorna em minúsculas.\n\n### Exemplo de Código\n\n```portugol\ncadeia nome = Calendario.dia_semana_abreviado(2, falso, falso)\nescreva(nome) // Seg\n```\n\n### Retorno\n\nCadeia com o nome abreviado do dia da semana.\n\n### Formas de uso\n\n`Calendario.dia_semana_abreviado(numero_dia, caixa_alta, caixa_baixa)`',
            exemploCodigo: 'Calendario.dia_semana_abreviado(2, falso, falso)',
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
            descricao: 'Constante matemática que representa o valor de Pi.',
            documentacao:
                '### Descrição\n\nConstante matemática que representa o valor de Pi (aproximadamente 3.14159265).\n\n### Exemplo de Código\n\n```portugol\nprograma {\n    funcao inicio() {\n        real raio = 5.0\n        real area = Matematica.PI * raio * raio\n        escreva("Área: ", area)\n    }\n}\n```\n\n### Retorno\n\nReal com o valor de Pi.\n\n### Formas de uso\n\n`Matematica.PI`',
            exemploCodigo: 'Matematica.PI * raio * raio',
        },
        {
            nome: 'potencia',
            descricao: 'Realiza uma exponenciação através da multiplicação da base por ela mesma.',
            documentacao:
                '### Descrição\n\nRealiza uma exponenciação, multiplicando a base por ela mesma tantas vezes quanto indicar o expoente.\n\n### Parâmetros\n\n- `base`: O número base da exponenciação.\n- `expoente`: O número de vezes que a base será multiplicada.\n\n### Exemplo de Código\n\n```portugol\nprograma {\n    funcao inicio() {\n        real resultado = Matematica.potencia(2, 3)\n        escreva("2^3 = ", resultado) // 8\n    }\n}\n```\n\n### Retorno\n\nReal com o resultado da exponenciação.\n\n### Formas de uso\n\n`Matematica.potencia(base, expoente)`',
            exemploCodigo: 'Matematica.potencia(2, 3)',
        },
        {
            nome: 'raiz',
            descricao: 'Realiza a radiciação (extrai a raíz) de um número por um determinado índice.',
            documentacao:
                '### Descrição\n\nRealiza a radiciação, extraindo a raíz de um número por um determinado índice.\n\n### Parâmetros\n\n- `radicando`: O número do qual será extraída a raíz.\n- `indice`: O grau da radiciação (2 = quadrada, 3 = cúbica, etc.).\n\n### Exemplo de Código\n\n```portugol\nprograma {\n    funcao inicio() {\n        real resultado = Matematica.raiz(27, 3)\n        escreva("Raiz cúbica de 27 = ", resultado) // 3\n    }\n}\n```\n\n### Retorno\n\nReal com o resultado da radiciação.\n\n### Formas de uso\n\n`Matematica.raiz(radicando, indice)`',
            exemploCodigo: 'Matematica.raiz(27, 3)',
        },
        {
            nome: 'arredondar',
            descricao: 'Arredonda um número real para o número de casas decimais informadas.',
            documentacao:
                '### Descrição\n\nArredonda um número real para o número de casas decimais informadas.\n\n### Parâmetros\n\n- `numero`: O número a ser arredondado.\n- `casas`: O número de casas decimais desejadas.\n\n### Exemplo de Código\n\n```portugol\nprograma {\n    funcao inicio() {\n        real resultado = Matematica.arredondar(3.14159, 2)\n        escreva("Arredondado: ", resultado) // 3.14\n    }\n}\n```\n\n### Retorno\n\nReal com o número arredondado.\n\n### Formas de uso\n\n`Matematica.arredondar(numero, casas)`',
            exemploCodigo: 'Matematica.arredondar(3.14159, 2)',
        },
        {
            nome: 'logaritmo',
            descricao: 'Calcula o logaritmo de um número para uma determinada base.',
            documentacao:
                '### Descrição\n\nCalcula o logaritmo de um número para uma determinada base.\n\n### Parâmetros\n\n- `numero`: O número resultante da exponenciação.\n- `base`: A base da exponenciação.\n\n### Exemplo de Código\n\n```portugol\nprograma {\n    funcao inicio() {\n        real resultado = Matematica.logaritmo(32, 2)\n        escreva("log2(32) = ", resultado) // 5\n    }\n}\n```\n\n### Retorno\n\nReal com o resultado do logaritmo.\n\n### Formas de uso\n\n`Matematica.logaritmo(numero, base)`',
            exemploCodigo: 'Matematica.logaritmo(32, 2)',
        },
        {
            nome: 'seno',
            descricao: 'Calcula o seno do ângulo informado (em radianos).',
            documentacao:
                '### Descrição\n\nCalcula o seno de um ângulo informado em radianos.\n\n### Parâmetros\n\n- `angulo`: O ângulo em radianos.\n\n### Exemplo de Código\n\n```portugol\nprograma {\n    funcao inicio() {\n        real resultado = Matematica.seno(1.5708)\n        escreva("sen(1.5708) = ", resultado) // aproximadamente 1\n    }\n}\n```\n\n### Retorno\n\nReal com o seno do ângulo.\n\n### Formas de uso\n\n`Matematica.seno(angulo)`',
            exemploCodigo: 'Matematica.seno(1.5708)',
        },
        {
            nome: 'cosseno',
            descricao: 'Calcula o cosseno do ângulo informado (em radianos).',
            documentacao:
                '### Descrição\n\nCalcula o cosseno de um ângulo informado em radianos.\n\n### Parâmetros\n\n- `angulo`: O ângulo em radianos.\n\n### Exemplo de Código\n\n```portugol\nprograma {\n    funcao inicio() {\n        real resultado = Matematica.cosseno(0.0)\n        escreva("cos(0) = ", resultado) // 1\n    }\n}\n```\n\n### Retorno\n\nReal com o cosseno do ângulo.\n\n### Formas de uso\n\n`Matematica.cosseno(angulo)`',
            exemploCodigo: 'Matematica.cosseno(0.0)',
        },
        {
            nome: 'tangente',
            descricao: 'Calcula a tangente do ângulo informado (em radianos).',
            documentacao:
                '### Descrição\n\nCalcula a tangente de um ângulo informado em radianos.\n\n### Parâmetros\n\n- `angulo`: O ângulo em radianos.\n\n### Exemplo de Código\n\n```portugol\nprograma {\n    funcao inicio() {\n        real resultado = Matematica.tangente(0.7854)\n        escreva("tan(0.7854) = ", resultado) // aproximadamente 1\n    }\n}\n```\n\n### Retorno\n\nReal com a tangente do ângulo.\n\n### Formas de uso\n\n`Matematica.tangente(angulo)`',
            exemploCodigo: 'Matematica.tangente(0.7854)',
        },
        {
            nome: 'valor_absoluto',
            descricao: 'Calcula o valor absoluto do número informado.',
            documentacao:
                '### Descrição\n\nCalcula o valor absoluto de um número, removendo o sinal negativo.\n\n### Parâmetros\n\n- `numero`: O número do qual se deseja o valor absoluto.\n\n### Exemplo de Código\n\n```portugol\nprograma {\n    funcao inicio() {\n        inteiro resultado = Matematica.valor_absoluto(-15)\n        escreva("| -15 | = ", resultado) // 15\n    }\n}\n```\n\n### Retorno\n\nReal com o valor absoluto do número.\n\n### Formas de uso\n\n`Matematica.valor_absoluto(numero)`',
            exemploCodigo: 'Matematica.valor_absoluto(-15)',
        },
        {
            nome: 'maior_numero',
            descricao: 'Identifica o maior número entre os números informados.',
            documentacao:
                '### Descrição\n\nRetorna o maior valor entre dois números informados.\n\n### Parâmetros\n\n- `numeroA`: Primeiro número para comparação.\n- `numeroB`: Segundo número para comparação.\n\n### Exemplo de Código\n\n```portugol\nprograma {\n    funcao inicio() {\n        inteiro resultado = Matematica.maior_numero(10, 20)\n        escreva("Maior: ", resultado) // 20\n    }\n}\n```\n\n### Retorno\n\nReal com o maior número.\n\n### Formas de uso\n\n`Matematica.maior_numero(numeroA, numeroB)`',
            exemploCodigo: 'Matematica.maior_numero(10, 20)',
        },
        {
            nome: 'menor_numero',
            descricao: 'Identifica o menor número entre os números informados.',
            documentacao:
                '### Descrição\n\nRetorna o menor valor entre dois números informados.\n\n### Parâmetros\n\n- `numeroA`: Primeiro número para comparação.\n- `numeroB`: Segundo número para comparação.\n\n### Exemplo de Código\n\n```portugol\nprograma {\n    funcao inicio() {\n        inteiro resultado = Matematica.menor_numero(10, 20)\n        escreva("Menor: ", resultado) // 10\n    }\n}\n```\n\n### Retorno\n\nReal com o menor número.\n\n### Formas de uso\n\n`Matematica.menor_numero(numeroA, numeroB)`',
            exemploCodigo: 'Matematica.menor_numero(10, 20)',
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
                '### Descrição\n\nConta o número de caracteres existentes em uma cadeia de texto.\n\n### Parâmetros\n\n- `cadeia`: A cadeia de texto a ser medida.\n\n### Exemplo de Código\n\n```portugol\nprograma {\n    funcao inicio() {\n        inteiro tamanho = Texto.numero_caracteres("Olá mundo")\n        escreva("Tamanho: ", tamanho) // 9\n    }\n}\n```\n\n### Retorno\n\nInteiro com o número de caracteres na cadeia.\n\n### Formas de uso\n\n`Texto.numero_caracteres(cadeia)`',
            exemploCodigo: 'Texto.numero_caracteres("Olá mundo")',
        },
        {
            nome: 'caixa_alta',
            descricao: 'Transforma os caracteres de uma cadeia em caracteres maiúsculos.',
            documentacao:
                '### Descrição\n\nTransforma todos os caracteres de uma cadeia em caracteres maiúsculos.\n\n### Parâmetros\n\n- `cad`: A cadeia de texto a ser transformada.\n\n### Exemplo de Código\n\n```portugol\nprograma {\n    funcao inicio() {\n        cadeia resultado = Texto.caixa_alta("olá mundo")\n        escreva(resultado) // OLÁ MUNDO\n    }\n}\n```\n\n### Retorno\n\nCadeia com os caracteres transformados para maiúsculas.\n\n### Formas de uso\n\n`Texto.caixa_alta(cad)`',
            exemploCodigo: 'Texto.caixa_alta("olá mundo")',
        },
        {
            nome: 'caixa_baixa',
            descricao: 'Transforma os caracteres de uma cadeia em caracteres minúsculos.',
            documentacao:
                '### Descrição\n\nTransforma todos os caracteres de uma cadeia em caracteres minúsculos.\n\n### Parâmetros\n\n- `cad`: A cadeia de texto a ser transformada.\n\n### Exemplo de Código\n\n```portugol\nprograma {\n    funcao inicio() {\n        cadeia resultado = Texto.caixa_baixa("OLÁ MUNDO")\n        escreva(resultado) // olá mundo\n    }\n}\n```\n\n### Retorno\n\nCadeia com os caracteres transformados para minúsculas.\n\n### Formas de uso\n\n`Texto.caixa_baixa(cad)`',
            exemploCodigo: 'Texto.caixa_baixa("OLÁ MUNDO")',
        },
        {
            nome: 'substituir',
            descricao: 'Pesquisa por um determinado texto em uma cadeia e substitui todas as ocorrências por um texto alternativo.',
            documentacao:
                '### Descrição\n\nPesquisa por um determinado texto em uma cadeia e substitui **todas** as ocorrências por um texto alternativo.\n\n### Parâmetros\n\n- `cad`: A cadeia original.\n- `texto_pesquisa`: O texto a ser buscado na cadeia.\n- `texto_substituto`: O texto que substituirá as ocorrências encontradas.\n\n### Exemplo de Código\n\n```portugol\nprograma {\n    funcao inicio() {\n        cadeia resultado = Texto.substituir("Olá mundo mundo", "mundo", "Portugol")\n        escreva(resultado) // Olá Portugol Portugol\n    }\n}\n```\n\n### Retorno\n\nCadeia resultante da substituição.\n\n### Formas de uso\n\n`Texto.substituir(cad, texto_pesquisa, texto_substituto)`',
            exemploCodigo: 'Texto.substituir("Olá mundo mundo", "mundo", "Portugol")',
        },
        {
            nome: 'preencher_a_esquerda',
            descricao: 'Concatena o caracter informado à esquerda da cadeia até que ela fique do tamanho indicado.',
            documentacao:
                '### Descrição\n\nConcatena o caracter informado à esquerda da cadeia até que ela fique do tamanho indicado. Se o tamanho da cadeia for maior ou igual ao tamanho informado, nada é feito.\n\n### Parâmetros\n\n- `car`: O caracter a ser concatenado.\n- `tamanho`: O tamanho final desejado da cadeia.\n- `cad`: A cadeia original.\n\n### Exemplo de Código\n\n```portugol\nprograma {\n    funcao inicio() {\n        cadeia resultado = Texto.preencher_a_esquerda("0", 5, "42")\n        escreva(resultado) // 00042\n    }\n}\n```\n\n### Retorno\n\nCadeia transformada com o preenchimento à esquerda.\n\n### Formas de uso\n\n`Texto.preencher_a_esquerda(car, tamanho, cad)`',
            exemploCodigo: 'Texto.preencher_a_esquerda("0", 5, "42")',
        },
        {
            nome: 'obter_caracter',
            descricao: 'Obtém um caracter da cadeia a partir de seu índice.',
            documentacao:
                '### Descrição\n\nObtém um caracter da cadeia a partir de seu índice. O índice deve estar entre 0 e o número de caracteres da cadeia.\n\n### Parâmetros\n\n- `cad`: A cadeia de origem.\n- `indice`: A posição do caracter desejado (inicia em 0).\n\n### Exemplo de Código\n\n```portugol\nprograma {\n    funcao inicio() {\n        cadeia texto = "Portugol"\n        cadeia c = Texto.obter_caracter(texto, 0)\n        escreva("Primeiro caractere: ", c) // P\n    }\n}\n```\n\n### Retorno\n\nCaractere no índice informado.\n\n### Formas de uso\n\n`Texto.obter_caracter(cad, indice)`',
            exemploCodigo: 'Texto.obter_caracter("Portugol", 0)',
        },
        {
            nome: 'posicao_texto',
            descricao: 'Procura por um texto dentro de uma cadeia e retorna a posição da primeira ocorrência.',
            documentacao:
                '### Descrição\n\nProcura por um texto dentro de uma cadeia e, caso encontrado, retorna a posição da primeira ocorrência. Para procurar a partir do início da cadeia informe `posicao_inicial` como 0.\n\n### Parâmetros\n\n- `texto`: O texto a ser procurado.\n- `cadeia`: A cadeia onde será feita a pesquisa.\n- `posicao_inicial`: A posição inicial para começar a pesquisa.\n\n### Exemplo de Código\n\n```portugol\nprograma {\n    funcao inicio() {\n        inteiro pos = Texto.posicao_texto("mundo", "Olá mundo", 0)\n        escreva("Posição: ", pos) // 4\n    }\n}\n```\n\n### Retorno\n\nInteiro com a posição da primeira ocorrência, ou -1 caso não seja encontrado.\n\n### Formas de uso\n\n`Texto.posicao_texto(texto, cadeia, posicao_inicial)`',
            exemploCodigo: 'Texto.posicao_texto("mundo", "Olá mundo", 0)',
        },
        {
            nome: 'extrair_subtexto',
            descricao: 'Extrai uma parte da cadeia delimitada pela posição inicial e final.',
            documentacao:
                '### Descrição\n\nExtrai uma parte da cadeia delimitada pela posição inicial e final.\n\n### Parâmetros\n\n- `texto`: A cadeia de origem.\n- `posicao_inicial`: A posição inicial (inclusiva) da extração.\n- `posicao_final`: A posição final (exclusiva) da extração.\n\n### Exemplo de Código\n\n```portugol\nprograma {\n    funcao inicio() {\n        cadeia texto = "salgado"\n        cadeia sub = Texto.extrair_subtexto(texto, 0, 3)\n        escreva("Subtexto: ", sub) // sal\n    }\n}\n```\n\n### Retorno\n\nCadeia contendo o subtexto extraído.\n\n### Formas de uso\n\n`Texto.extrair_subtexto(texto, posicao_inicial, posicao_final)`',
            exemploCodigo: 'Texto.extrair_subtexto("salgado", 0, 3)',
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
            descricao: 'Obtém o caminho utilizado pelo Sistema Operacional como diretório do usuário atual.',
            documentacao:
                '### Descrição\n\nObtém o caminho utilizado pelo Sistema Operacional como diretório do usuário atual.\n\n### Exemplo de Código\n\n```portugol\nprograma {\n    funcao inicio() {\n        cadeia dir = Util.obter_diretorio_usuario()\n        escreva("Diretório: ", dir)\n    }\n}\n```\n\n### Retorno\n\nCadeia com o diretório do usuário.\n\n### Formas de uso\n\n`Util.obter_diretorio_usuario()`',
            exemploCodigo: 'Util.obter_diretorio_usuario()',
        },
        {
            nome: 'numero_elementos',
            descricao: 'Descobre o número de elementos existentes em um vetor.',
            documentacao:
                '### Descrição\n\nDescobre o número de elementos existentes em um vetor.\n\n### Parâmetros\n\n- `vetor`: O vetor do qual se deseja saber o número de elementos.\n\n### Exemplo de Código\n\n```portugol\nprograma {\n    funcao inicio() {\n        inteiro numeros[5] = {1, 2, 3, 4, 5}\n        inteiro tamanho = Util.numero_elementos(numeros)\n        escreva("Tamanho: ", tamanho) // 5\n    }\n}\n```\n\n### Retorno\n\nInteiro com o número de elementos do vetor.\n\n### Formas de uso\n\n`Util.numero_elementos(vetor)`',
            exemploCodigo: 'Util.numero_elementos(numeros)',
        },
        {
            nome: 'numero_linhas',
            descricao: 'Descobre o número de linhas existentes em uma matriz.',
            documentacao:
                '### Descrição\n\nDescobre o número de linhas existentes em uma matriz.\n\n### Parâmetros\n\n- `matriz`: A matriz da qual se deseja saber o número de linhas.\n\n### Exemplo de Código\n\n```portugol\nprograma {\n    funcao inicio() {\n        real matriz[3][2]\n        inteiro linhas = Util.numero_linhas(matriz)\n        escreva("Linhas: ", linhas) // 3\n    }\n}\n```\n\n### Retorno\n\nInteiro com o número de linhas da matriz.\n\n### Formas de uso\n\n`Util.numero_linhas(matriz)`',
            exemploCodigo: 'Util.numero_linhas(matriz)',
        },
        {
            nome: 'numero_colunas',
            descricao: 'Descobre o número de colunas existentes em uma matriz.',
            documentacao:
                '### Descrição\n\nDescobre o número de colunas existentes em uma matriz.\n\n### Parâmetros\n\n- `matriz`: A matriz da qual se deseja saber o número de colunas.\n\n### Exemplo de Código\n\n```portugol\nprograma {\n    funcao inicio() {\n        real matriz[3][2]\n        inteiro colunas = Util.numero_colunas(matriz)\n        escreva("Colunas: ", colunas) // 2\n    }\n}\n```\n\n### Retorno\n\nInteiro com o número de colunas da matriz.\n\n### Formas de uso\n\n`Util.numero_colunas(matriz)`',
            exemploCodigo: 'Util.numero_colunas(matriz)',
        },
        {
            nome: 'sorteia',
            descricao: 'Sorteia um número aleatório entre os valores mínimo e máximo especificados.',
            documentacao:
                '### Descrição\n\nSorteia um número aleatório entre os valores mínimo e máximo especificados.\n\n### Parâmetros\n\n- `minimo`: O menor número que pode ser sorteado.\n- `maximo`: O maior número que pode ser sorteado.\n\n### Exemplo de Código\n\n```portugol\nprograma {\n    funcao inicio() {\n        inteiro numero = Util.sorteia(1, 100)\n        escreva("Número sorteado: ", numero) // Exemplo: 42\n    }\n}\n```\n\n### Retorno\n\nInteiro com o número sorteado.\n\n### Formas de uso\n\n`Util.sorteia(minimo, maximo)`',
            exemploCodigo: 'Util.sorteia(1, 100)',
        },
        {
            nome: 'aguarde',
            descricao: 'Pausa a execução do programa durante o intervalo de tempo especificado.',
            documentacao:
                '### Descrição\n\nPausa a execução do programa durante o intervalo de tempo especificado em milissegundos.\n\n### Parâmetros\n\n- `intervalo`: O tempo em milissegundos que o programa ficará pausado.\n\n### Exemplo de Código\n\n```portugol\nprograma {\n    funcao inicio() {\n        escreva("Aguardando...\")\n        Util.aguarde(1000) // Pausa por 1 segundo\n        escreva("Continuando!")\n    }\n}\n```\n\n### Formas de uso\n\n`Util.aguarde(intervalo)`',
            exemploCodigo: 'Util.aguarde(1000)',
        },
        {
            nome: 'tempo_decorrido',
            descricao: 'Obtém o tempo decorrido (em milissegundos) desde que a biblioteca foi utilizada pela primeira vez.',
            documentacao:
                '### Descrição\n\nObtém o tempo decorrido em milissegundos desde que a biblioteca foi utilizada pela primeira vez.\n\n### Exemplo de Código\n\n```portugol\nprograma {\n    funcao inicio() {\n        Util.aguarde(500)\n        inteiro ms = Util.tempo_decorrido()\n        escreva("Tempo: ", ms, " ms")\n    }\n}\n```\n\n### Retorno\n\nInteiro com o tempo decorrido em milissegundos.\n\n### Formas de uso\n\n`Util.tempo_decorrido()`',
            exemploCodigo: 'Util.tempo_decorrido()',
        },
    ];

export const palavrasReservadasPortugolStudio: {
    nome: string;
    descricao?: string;
    documentacao: string;
    exemploCodigo?: string;
}[] = [
        {
            nome: 'programa',
            descricao: 'Bloco principal do programa Portugol Studio.',
            documentacao:
                '### Descrição\n\nBloco principal do programa Portugol Studio. Todo arquivo deve começar com `programa { ... }`.\n\n### Exemplo de Código\n\n```portugol\nprograma {\n\tfuncao inicio() {\n\t\t// seu código aqui\n\t}\n}\n```\n\n### Formas de uso\n\n`programa { ... }`',
            exemploCodigo:
                'programa {\n\tfuncao inicio() {\n\t\t// seu código aqui\n\t}\n}',
        },
        {
            nome: 'funcao',
            descricao: 'Declara uma nova função.',
            documentacao:
                '### Descrição\n\nDeclara uma nova função no programa. Uma função pode retornar um valor ou ser do tipo `vazio`.\n\n### Exemplo de Código\n\n```portugol\nfuncao inteiro somar(inteiro a, inteiro b) {\n\tretorne a + b\n}\n```\n\n### Formas de uso\n\n`funcao [tipo_retorno] nome_funcao([parametros]) { ... }`\n`funcao vazio nome_funcao([parametros]) { ... }`',
            exemploCodigo:
                'funcao inteiro somar(inteiro a, inteiro b) {\n\tretorne a + b\n}',
        },
        {
            nome: 'inicio',
            descricao: 'Função de entrada padrão do programa.',
            documentacao:
                '### Descrição\n\nFunção de entrada padrão, executada automaticamente ao iniciar o programa. Deve ser definida dentro de `programa { ... }`.\n\n### Exemplo de Código\n\n```portugol\nfuncao inicio() {\n\tescreva("Olá mundo!")\n}\n```\n\n### Formas de uso\n\n`funcao inicio() { ... }`',
            exemploCodigo: 'funcao inicio() {\n\tescreva("Olá mundo!")\n}',
        },
        {
            nome: 'se',
            descricao: 'Estrutura de decisão condicional.',
            documentacao:
                '### Descrição\n\nEstrutura de decisão que executa um bloco de código se a condição for verdadeira. Pode ser combinada com `senao` para executar um bloco alternativo quando a condição é falsa.\n\n### Exemplo de Código\n\n```portugol\nse (idade >= 18) {\n\tescreva("Maior de idade")\n}\n```\n\n### Formas de uso\n\n`se (condicao) { ... }`\n`se (condicao) { ... } senao { ... }`',
            exemploCodigo: 'se (idade >= 18) {\n\tescreva("Maior de idade")\n}',
        },
        {
            nome: 'senao',
            descricao: 'Bloco alternativo ao se, executado quando a condição é falsa.',
            documentacao:
                '### Descrição\n\nBloco alternativo ao `se`, executado quando a condição do `se` é falsa.\n\n### Exemplo de Código\n\n```portugol\nse (x > 0) {\n\tescreva("Positivo")\n} senao {\n\tescreva("Negativo ou zero")\n}\n```\n\n### Formas de uso\n\n`se (condicao) { ... } senao { ... }`\n`senao { ... }`',
            exemploCodigo:
                'se (x > 0) {\n\tescreva("Positivo")\n} senao {\n\tescreva("Negativo ou zero")\n}',
        },
        {
            nome: 'enquanto',
            descricao: 'Estrutura de repetição que executa enquanto a condição for verdadeira.',
            documentacao:
                '### Descrição\n\nEstrutura de repetição que executa um bloco de código enquanto uma condição for verdadeira.\n\n### Exemplo de Código\n\n```portugol\ninteiro i = 0\nenquanto (i < 10) {\n\tescreva(i)\n\ti = i + 1\n}\n```\n\n### Formas de uso\n\n`enquanto (condicao) { ... }`',
            exemploCodigo:
                'inteiro i = 0\nenquanto (i < 10) {\n\tescreva(i)\n\ti = i + 1\n}',
        },
        {
            nome: 'para',
            descricao: 'Estrutura de repetição com contador controlado.',
            documentacao:
                '### Descrição\n\nEstrutura de repetição com contador controlado. Permite especificar a inicialização, condição e incremento.\n\n### Parâmetros\n\n- `inicializacao`: Declaração e atribuição inicial da variável contador.\n- `condicao`: Expressão booleana que é verificada antes de cada iteração.\n- `incremento`: Expressão executada ao final de cada iteração.\n\n### Exemplo de Código\n\n```portugol\nprograma {\n    funcao inicio() {\n        para (inteiro i = 0; i < 6; i++) {\n            escreva(i, " ")\n        }\n    }\n}\n```\n\n### Formas de uso\n\n`para ([tipo] [variavel] = [inicio]; [condicao]; [incremento]) { ... }`',
            exemploCodigo: 'para (inteiro i = 0; i < 6; i++) {\n\tescreva(i)\n}',
        },
        {
            nome: 'faca',
            descricao: 'Estrutura de repetição faça-enquanto (executa pelo menos uma vez).',
            documentacao:
                '### Descrição\n\nEstrutura de repetição que executa o bloco pelo menos uma vez e só então verifica a condição. Se a condição for verdadeira, o bloco é executado novamente.\n\n### Exemplo de Código\n\n```portugol\nfaca {\n\tescreva("Digite um número: ")\n\leia(num)\n} enquanto (num < 0)\n```\n\n### Formas de uso\n\n`faca { ... } enquanto (condicao)`',
            exemploCodigo:
                'faca {\n\tescreva("Digite um número: ")\n\leia(num)\n} enquanto (num < 0)',
        },
        {
            nome: 'escolha',
            descricao: 'Estrutura de seleção múltipla.',
            documentacao:
                '### Descrição\n\nEstrutura de seleção múltipla que compara uma expressão com vários casos. Executa o bloco correspondente ao caso que coincidir com o valor da expressão.\n\n### Exemplo de Código\n\n```portugol\nprograma {\n    funcao inicio() {\n        inteiro numero\n        escreva("Digite um número: ")\n        leia(numero)\n        \n        escolha(numero) {\n            caso 1:\n                escreva("Você escolheu 1")\n            pare\n            caso 2:\n                escreva("Você escolheu 2")\n            pare\n            caso 50:\n                escreva("Você escolheu 50")\n            pare\n            caso contrario:\n                escreva("Opção inválida")\n        }\n    }\n}\n```\n\n### Formas de uso\n\n`escolha ([expressao]) { caso [valor]: ... pare ... caso contrario: ... }`',
            exemploCodigo:
                'escolha (numero) {\n\tcaso 1:\n\t\tescreva("Opção 1")\n\tpare\n\tcaso contrario:\n\t\tescreva("Outra opção")\n}',
        },
        {
            nome: 'caso',
            descricao: 'Define um caso em uma estrutura escolha.',
            documentacao:
                '### Descrição\n\nDefine um caso específico em uma estrutura `escolha`. Deve ser seguido por um valor ou expressão e dois pontos (`:`). Use `pare` para encerrar o caso.\n\n### Exemplo de Código\n\n```portugol\nprograma {\n    funcao inicio() {\n        caracter simbolo\n        leia(simbolo)\n        \n        escolha(simbolo) {\n            caso \'s\':\n                escreva("Você digitou s")\n            pare\n            caso \'[\':\n                escreva("Você digitou [")\n            pare\n            caso \'*\':\n                escreva("Você digitou *")\n            pare\n        }\n    }\n}\n```\n\n### Formas de uso\n\n`caso [valor]:`',
            exemploCodigo: 'caso 1:\n\tescreva("Instruções")\npare',
        },
        {
            nome: 'contrario',
            descricao: 'Caso padrão executado quando nenhum caso é correspondido.',
            documentacao:
                '### Descrição\n\nCaso padrão executado quando nenhum dos casos anteriores é correspondido no `escolha`. Deve ser o último caso da estrutura.\n\n### Exemplo de Código\n\n```portugol\nprograma {\n    funcao inicio() {\n        inteiro opcao\n        leia(opcao)\n        \n        escolha(opcao) {\n            caso 1:\n                escreva("Opção 1")\n            pare\n            caso contrario:\n                escreva("Nenhuma opção válida")\n        }\n    }\n}\n```\n\n### Formas de uso\n\n`caso contrario:`',
            exemploCodigo: 'caso contrario:\n\tescreva("Caso padrão")',
        },
        {
            nome: 'caso',
            descricao: 'Define um caso em uma estrutura escolha.',
            documentacao:
                '### Descrição\n\nDefine um caso específico em uma estrutura `escolha`. Deve ser seguido por um valor ou expressão e dois pontos (`:`).\n\n### Exemplo de Código\n\n```portugol\ncaso 1:\n\tpare\n```\n\n### Formas de uso\n\n`caso [valor]:`',
            exemploCodigo: 'caso 1:\n\tpare',
        },
        {
            nome: 'contrario',
            descricao: 'Caso padrão executado quando nenhum caso é correspondido.',
            documentacao:
                '### Descrição\n\nCaso padrão executado quando nenhum dos casos anteriores é correspondido no `escolha`. Deve ser o último caso da estrutura.\n\n### Exemplo de Código\n\n```portugol\ncaso contrario:\n\tescreva("Opção inválida")\n```\n\n### Formas de uso\n\n`caso contrario:`',
            exemploCodigo: 'caso contrario:\n\tescreva("Opção inválida")',
        },
        {
            nome: 'pare',
            descricao: 'Interrompe a execução de um loop ou caso.',
            documentacao:
                '### Descrição\n\nInterrompe a execução de um loop (`enquanto`, `para`, `faca`) ou encerra um `caso` em uma estrutura `escolha`.\n\n### Exemplo de Código\n\n```portugol\nenquanto (verdadeiro) {\n\tse (x == 0) {\n\t\tpare\n\t}\n\tx = x - 1\n}\n```\n\n### Formas de uso\n\n`pare`',
            exemploCodigo:
                'enquanto (verdadeiro) {\n\tse (x == 0) {\n\t\tpare\n\t}\n\tx = x - 1\n}',
        },
        {
            nome: 'retorne',
            descricao: 'Retorna um valor de uma função.',
            documentacao:
                '### Descrição\n\nEncerra a execução da função e retorna um valor ao chamador. Pode ser usado com ou sem valor de retorno.\n\n### Exemplo de Código\n\n```portugol\nfuncao inteiro dobrar(inteiro n) {\n\tretorne n * 2\n}\n```\n\n### Formas de uso\n\n`retorne [expressao]`\n`retorne`',
            exemploCodigo: 'funcao inteiro dobrar(inteiro n) {\n\tretorne n * 2\n}',
        },
        {
            nome: 'const',
            descricao: 'Declara uma constante (valor imutável).',
            documentacao:
                '### Descrição\n\nDeclara uma constante com valor imutável durante a execução do programa. O valor deve ser atribuído no momento da declaração.\n\n### Exemplo de Código\n\n```portugol\nconst inteiro PI = 3.14159\n```\n\n### Formas de uso\n\n`const [tipo] [nome] = [valor]`',
            exemploCodigo: 'const inteiro PI = 3.14159',
        },
        {
            nome: 'inclua',
            descricao: 'Inclui uma biblioteca externa.',
            documentacao:
                '### Descrição\n\nInclui uma biblioteca externa no programa. Permite usar funcionalidades de bibliotecas como `Matematica`, `Calendario`, `Texto`, `Util`.\n\n### Exemplo de Código\n\n```portugol\ninclua biblioteca Matematica --> Mat\n```\n\n### Formas de uso\n\n`inclua biblioteca [NomeBiblioteca]`\n`inclua biblioteca [NomeBiblioteca] --> [Alias]`',
            exemploCodigo: 'inclua biblioteca Matematica --> Mat',
        },
        {
            nome: 'biblioteca',
            descricao: 'Palavra-chave usada para incluir bibliotecas.',
            documentacao:
                '### Descrição\n\nPalavra-chave usada na sintaxe `inclua biblioteca` para importar funcionalidades externas.\n\n### Exemplo de Código\n\n```portugol\ninclua biblioteca Matematica\n```\n\n### Formas de uso\n\n`inclua biblioteca [NomeBiblioteca]`',
            exemploCodigo: 'inclua biblioteca Matematica',
        },
    ];
