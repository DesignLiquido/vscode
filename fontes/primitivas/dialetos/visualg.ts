export const primitivasEntradaSaidaVisuAlg: {nome: string, descricao?: string, documentacao: string, exemploCodigo?: string}[] = [
    {
        nome: 'escreva',
        descricao: 'Escreve na saída padrão da aplicação, normalmente um prompt ou um console.',
        documentacao: '# `escreva()`\nEscreve no dispositivo de saída padrão (isto é, na área à direita da metade inferior da tela do VisuAlg) o conteúdo de cada uma das expressões passadas como parâmetro. ',
        exemploCodigo: '`escreva("Olá mundo")`\n`escreva(minhaVariavel)`'
    },
    {
        nome: 'escreval',
        descricao: 'Escreve na saída padrão da aplicação, normalmente um prompt ou um console, e quebra a linha.',
        documentacao: '# `escreval()`\nEscreve na saída padrão da aplicação, tal qual o comando escreva(), com a única diferença que pula uma linha em seguida. ',
        exemploCodigo: '`escreval("Olá mundo")`\n`escreval(minhaVariavel)`'
    },
    {
        nome: 'leia',
        descricao: 'A entrada de dados no Visualg é feita através deste comando.',
        documentacao: '# `leia()`\n Este comando recebe valores digitados pelos usuários, atribuindo-os às variáveis especificadas.',
        exemploCodigo: '`escreva("Digite sua idade:")`\n`leia(minhaIdade)`'
    },
];

export const primitivasNumeroVisuAlg: {nome: string, descricao?: string, documentacao: string, exemploCodigo?: string}[] = [
    {
        nome: 'abs',
        descricao: 'Função algébrica do VisuAlg.',
        documentacao: '# `abs()`\n Retorna o valor absoluto de uma expressão do tipo inteiro ou real. Equivale a `|expressão|` na álgebra.',
        exemploCodigo: '`escreval( abs(a - b) )`'
    },
    {
        nome: 'arccos',
        descricao: 'Função trigonométrica do VisuAlg.',
        documentacao: '# `arccos()`\n Retorna o ângulo (em radianos) cujo cosseno é representado por `expressão`.',
        exemploCodigo: '`escreval( arccos(x) )`'
    },
    {
        nome: 'arcsen',
        descricao: 'Função trigonométrica do VisuAlg.',
        documentacao: '# `arcsen(<expressão>)`\n Retorna o ângulo (em radianos) cujo seno é representado por `expressão`.',
        exemploCodigo: '`escreval( arcsen(90) )`',
    },
    {
        nome: 'arctan',
        descricao: 'Função trigonométrica do VisuAlg.',
        documentacao: '# `arctan(<expressão>)`\n Retorna o ângulo (em radianos) cuja tangente é representada por `expressão`.',
        exemploCodigo: '`escreval( arctan(75) )`',
    },
    {
        nome: 'cos',
        descricao: 'Função trigonométrica do VisuAlg.',
        documentacao: '# `cos(<expressão>)`\n Retorna o cosseno do ângulo (em radianos) representado por `expressão`.',
        exemploCodigo: '`escreval( cos(90) )`',
    },
    {
        nome: 'cotan',
        documentacao: 'Retorna a co-tangente do ângulo (em radianos) representado por `expressão`.'
    },
    {
        nome: 'exp',
        documentacao: 'Retorna o valor de `base` elevado a `expoente`, sendo ambos expressões do tipo real.'
    },
    {
        nome: 'grauprad',
        documentacao: 'Retorna o valor em radianos, correspondente ao valor em graus representado por `expressão`.'
    },
    {
        nome: 'int',
        documentacao: 'Retorna a parte inteira do valor representado por `expressão`.'
    },
    {
        nome: 'log',
        documentacao: 'Retorna o logaritmo na base 10 do valor representado por `expressão`.'
    },
    {
        nome: 'logn',
        documentacao: 'Retorna o logaritmo neperiano (base e) do valor representado por `expressão`.'
    },
    {
        nome: 'pi',
        documentacao: 'Retorna o valor 3.141592.'
    },
    {
        nome: 'quad',
        documentacao: 'Retorna o quadrado do valor representado por `expressão`.'
    },
    {
        nome: 'radpgrau',
        documentacao: 'Retorna o valor em graus correspondente ao valor em radianos, representado por `expressão`.'
    },
    {
        nome: 'raizq',
        documentacao: 'Retorna a raiz quadrada do valor representado por `expressão`.'
    },
    {
        nome: 'rand',
        documentacao: 'Retorna um número real gerado aleatoriamente, maior ou igual a zero e menor que um.'
    },
    {
        nome: 'randi',
        documentacao: 'Retorna um número inteiro gerado aleatoriamente, maior ou igual a zero e menor que `limite`.'
    },
    {
        nome: 'sen',
        documentacao: 'Retorna o seno do ângulo (em radianos) representado por `expressão`.'
    },
    {
        nome: 'tan',
        documentacao: 'Retorna a tangente do ângulo (em radianos) representado por `expressão`.'
    }
];

export const primitivasCaracteresVisuAlg: {nome: string, descricao?: string, documentacao: string, exemploCodigo?: string}[] = [
    {
        nome: 'asc',
        documentacao: 'Retorna um inteiro com o código ASCII do primeiro caracter da expressão.'
    },
    {
        nome: 'carac',
        documentacao: 'Retorna o caracter cujo código ASCII corresponde à expressão.'
    },
    {
        nome: 'caracpnum',
        documentacao: 'Retorna o inteiro ou real representado pela expressão. Corresponde a `StrToTin()` ou `StrToFloat()` do Delphi, `Val()` do Basic ou Clipper, etc.'
    },
    {
        nome: 'compr',
        documentacao: 'Retorna um inteiro contendo o comprimento (quantidade de caracteres) da expressão.'
    },
    {
        nome: 'copia',
        documentacao: 'Retorna um valor do tipo caracter contendo uma cópia parcial da expressão, a partir do caracter `p`, contendo `n` caracteres. Os caracteres são numerados da esquerda para a direita, começando de 1. Corresponde a `Copy()` do Delphi, `Mid$()` do Basic ou `Substr()` do Clipper.'
    },
    {
        nome: 'maiusc',
        documentacao: 'Retorna um valor caracter contendo a expressão em maiúsculas.'
    },
    {
        nome: 'minusc',
        documentacao: 'Retorna um valor caracter contendo a expressão em minúsculas.'
    },
    {
        nome: 'numpcarac',
        documentacao: 'Retorna um valor caracter contendo a representação de `n` como uma cadeia de caracteres. Corresponde a `IntToStr()` ou `FloatToStr()` do Delphi, `Str()` do Basic ou Clipper.'
    },
    {
        nome: 'pos',
        documentacao: 'Retorna um inteiro que indica a posição em que a cadeia `subc` se encontra em `c`, ou zero se `subc` não estiver contida em `c`. Corresponde funcionalmente a `Pos()` do Delphi, `Instr()` do Basic ou `At()` do Clipper, embora a ordem dos parâmetros possa ser diferente em algumas destas linguagens.'
    },
];