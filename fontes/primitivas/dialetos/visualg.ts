export const estruturasDados: {nome: string, descricao?: string, documentacao: string, exemploCodigo?: string}[] = [
    {
        nome: 'inteiro',
        descricao: 'Variável cujo valor é um número, positivo ou negativo, sem casas decimais.',
        documentacao: '# Declaração de `inteiro`\nVariável cujo valor é um número, positivo ou negativo, sem casas decimais.',
        exemploCodigo: 'var meuInteiro: inteiro'
    },
    {
        nome: 'vetor',
        descricao: 'Variável que pode ter uma ou duas dimensões. Um vetor de duas dimensões também é chamado de matriz.',
        documentacao: '# Declaração de `vetor`\nVariável que pode ter uma ou duas dimensões. Um vetor de duas dimensões também é chamado de matriz.',
        exemploCodigo: 'var meuVetor: vetor[1..5] de inteiro'
    }
];

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
        documentacao: '# `abs(expressão)`\n Retorna o valor absoluto de uma expressão do tipo inteiro ou real. Equivale a `expressão` na álgebra. No exemplo abaixo, apesar do resultado da subtração ser -15, a função abs retornará 15 (valor positivo).',
        exemploCodigo: '`a <- 5`\n`b <- 20``escreval(abs(a - b))`'
    },
    {
        nome: 'arccos',
        descricao: 'Função trigonométrica do VisuAlg.',
        documentacao: '# `arccos(expressão)`\n Retorna o ângulo (em radianos) cujo cosseno é representado por `expressão`.',
        exemploCodigo: '`x <- 180`\n`escreval(arccos(x))`'
    },
    {
        nome: 'arcsen',
        descricao: 'Função trigonométrica do VisuAlg.',
        documentacao: '# `arcsen(expressão)`\n Retorna o ângulo (em radianos) cujo seno é representado por `expressão`.',
        exemploCodigo: '`x <- 90`\n`escreval(arcsen(x))`',
    },
    {
        nome: 'arctan',
        descricao: 'Função trigonométrica do VisuAlg.',
        documentacao: '# `arctan(expressão)`\n Retorna o ângulo (em radianos) cuja tangente é representada por `expressão`.',
        exemploCodigo: '`x <- 75`\n`escreval(arctan(x))`',
    },
    {
        nome: 'cos',
        descricao: 'Função trigonométrica do VisuAlg.',
        documentacao: '# `cos(expressão)`\n Retorna o cosseno do ângulo (em radianos) representado por `expressão`.',
        exemploCodigo: '`x <- 90`\n`escreval(cos(x))`',
    },
    {
        nome: 'cotan',
        descricao: 'Função trigonométrica do VisuAlg.',
        documentacao: '# `cotan(expressão)`\n Retorna a co-tangente do ângulo (em radianos) representado por `expressão`.',
        exemploCodigo: '`x <- 90`\n`escreval(cotan(x))`',
    },
    {
        nome: 'exp',
        descricao: 'Função numérica do VisuAlg.',
        documentacao: '# `exp(base, expoente)`\n Retorna o valor de `base` elevado a `expoente`, sendo ambos expressões do tipo real. No exemplo abaixo, a função está elevando a base 9 no expoente 2, resultando no valor 81.',
        exemploCodigo: '`a <- 9`\n`b <- 2`\n`escreval(exp(a, b))`',
    },
    {
        nome: 'grauprad',
        descricao: 'Função trigonométrica do VisuAlg.',
        documentacao: '# `grauprad(expressão)`\n Retorna o valor em radianos, correspondente ao valor em graus representado por `expressão`.',
        exemploCodigo: '`x <- 90`\n`escreval(grauprad(x))`',
    },
    {
        nome: 'int',
        descricao: 'Função algébrica do VisuAlg.',
        documentacao: '# `int(expressão)`\n Retorna a parte inteira do valor representado por `expressão`. No exemplo abaixo, o resultado da divisão de 9 por 2 seria 4.5, mas a função int retornará 4, o número inteiro.',
        exemploCodigo: '`a <- 9`\n`b <- 2`\n`escreval(int(a / b))`',
    },
    {
        nome: 'log',
        descricao: 'Função algébrica do VisuAlg.',
        documentacao: '# `log(expressão)`\n Retorna o logaritmo na base 10 do valor representado por `expressão`. No exemplo abaixo, a função retornará o valor 3, que é o logaritmo de 1000 na base 10.',
        exemploCodigo: '`a <- 1000`\n`escreval(log(a))`',
    },
    {
        nome: 'logn',
        descricao: 'Função algébrica do VisuAlg.',
        documentacao: '# `logn(expressão)`\n Retorna o logaritmo neperiano (base e) do valor representado por `expressão`.',
        exemploCodigo: '`a <- 1000`\n`escreval(logn(a))`',
    },
    {
        nome: 'pi',
        descricao: 'Função numérica do VisuAlg.',
        documentacao: '# `pi`\n Retorna o valor de pi (π), 3.141592, e permite usá-lo em operações matemáticas.',
        exemploCodigo: '`a <- 3`\n`escreval(a * pi)`',
    },
    {
        nome: 'quad',
        descricao: 'Função algébrica do VisuAlg.',
        documentacao: '# `quad(expressão)`\n Retorna o quadrado do valor representado por `expressão`. No exemplo abaixo, a função retornará o valor 9, que é equivalente a 3 elevado ao quadrado.',
        exemploCodigo: '`a <- 3`\n`escreval(quad(a))`',
    },
    {
        nome: 'radpgrau',
        descricao: 'Função trigonométrica do VisuAlg.',
        documentacao: '# `radpgrau(expressão)`\n Retorna o valor em graus correspondente ao valor em radianos, representado por `expressão`.',
        exemploCodigo: '`x <- 90`\n`escreval(radpgrau(x))`',
    },
    {
        nome: 'raizq',
        descricao: 'Função algébrica do VisuAlg.',
        documentacao: '# `raizq(expressão)`\n Retorna a raiz quadrada do valor representado por `expressão`. No exemplo abaixo, a função retornará o valor 5, a raiz quadrada de 25.',
        exemploCodigo: '`a <- 25`\n`escreval(raizq(a))`',
    },
    {
        nome: 'rand',
        descricao: 'Função numérica do VisuAlg.',
        documentacao: '# `rand`\n Retorna um número real gerado aleatoriamente, maior ou igual a 0 e menor do que 1. No exemplo abaixo, rand é multiplicado por 10 para gerar um número aleatório entre 0 e 10, sendo que o resultado muito provavelmente será um número decimal (com casas após a vírgula). Para gerar números inteiros aleatoriamente, é recomendado utilizar a função `randi`.',
        exemploCodigo: '`escreval(rand * 10)`',
    },
    {
        nome: 'randi',
        descricao: 'Função numérica do VisuAlg.',
        documentacao: '# `randi(limite)`\n Retorna um número inteiro gerado aleatoriamente, maior ou igual a 0 e menor do que o `limite` especificado. O exemplo abaixo retornará um número aleatório entre 0 e 100.',
        exemploCodigo: '`escreval(randi(100))`',
    },
    {
        nome: 'sen',
        descricao: 'Função trigonométrica do VisuAlg.',
        documentacao: '# `sen(expressão)`\n Retorna o seno do ângulo (em radianos) representado por `expressão`.',
        exemploCodigo: '`x <- 90`\n`escreval(sen(x))`',
    },
    {
        nome: 'tan',
        descricao: 'Função trigonométrica do VisuAlg.',
        documentacao: '# `tan(expressão)`\n Retorna a tangente do ângulo (em radianos) representado por `expressão`.',
        exemploCodigo: '`x <- 90`\n`escreval(tan(x))`',
    }
];

export const primitivasCaracteresVisuAlg: {nome: string, descricao?: string, documentacao: string, exemploCodigo?: string}[] = [
    {
        nome: 'asc',
        descricao: 'Função do VisuAlg para manipulação de cadeias de caracteres (strings).',
        documentacao: '# `asc(expressão)`\n Retorna um inteiro com o código ASCII do primeiro caracter da `expressão`. A função `asc` só tem efeito sobre variáveis do tipo caracter/caractere. No exemplo abaixo, a função retornará o número 76, correspondente ao código ASCII da letra L.',
        exemploCodigo: '`nome <- "Lucas"`\n`escreva(asc(nome))`',
    },
    {
        nome: 'carac',
        descricao: 'Função do VisuAlg para manipulação de cadeias de caracteres (strings).',
        documentacao: '# `carac(expressão)`\n Retorna o caracter cujo código ASCII corresponde à `expressão`. A função `carac` só tem efeito sobre variáveis do tipo inteiro. No exemplo abaixo, a função retornará a letra V, que corresponde ao código ASCII de número 86.',
        exemploCodigo: '`valor <- 86`\n`escreva(carac(valor))`',
    },
    {
        nome: 'caracpnum',
        descricao: 'Função do VisuAlg para manipulação de cadeias de caracteres (strings).',
        documentacao: '# `caracpnum(expressão)`\n Retorna o inteiro ou real representado pela `expressão`. Corresponde a `StrToTin()` ou `StrToFloat()` do Delphi, `Val()` do Basic ou Clipper, etc. A função `caracpnum` só tem efeito sobre variáveis do tipo caracter/caractere.',
        exemploCodigo: '`letra <- "W"`\n`escreva(caracpnum(letra))`',
    },
    {
        nome: 'compr',
        descricao: 'Função do VisuAlg para manipulação de cadeias de caracteres (strings).',
        documentacao: '# `compr(expressão)`\n Retorna um inteiro contendo o comprimento (quantidade de caracteres) da `expressão`. A função `compr` só tem efeito sobre variáveis do tipo caracter/caractere.No exemplo abaixo, a função retornará o número 5, correspondente à quantidade de caracteres do nome "Lucas".',
        exemploCodigo: '`nome <- "Lucas"`\n`escreva(compr(nome))`',
    },
    {
        nome: 'copia',
        descricao: 'Função do VisuAlg para manipulação de cadeias de caracteres (strings).',
        documentacao: '# `copia(expressão1; expressão2, expressão3)`\n Retorna um valor do tipo caracter contendo uma cópia parcial da `expressão1`, a partir da posição especificada por `expressão2` até a posição especificada por `expressão3`. Os caracteres são numerados da esquerda para a direita, começando de 1. Corresponde a `Copy()` do Delphi, `Mid$()` do Basic ou `Substr()` do Clipper. No exemplo abaixo, a função copia a palavra "Matemática" a partir da 5ª letra, retornando 6 caracteres: "mática".',
        exemploCodigo: '`materia <- "Matemática"`\n`escreva(copia(materia; 5, 6))`',
    },
    {
        nome: 'maiusc',
        descricao: 'Função do VisuAlg para manipulação de cadeias de caracteres (strings).',
        documentacao: '# `maiusc(expressão)`\n Retorna um valor caracter contendo a expressão em letras maiúsculas. A função `maiusc` só tem efeito sobre variáveis do tipo caracter/caractere. No exemplo abaixo, a função retornará a string "LUCAS".',
        exemploCodigo: '`nome <- "Lucas"`\n`escreva(maiusc(nome))`',
    },
    {
        nome: 'minusc',
        descricao: 'Função do VisuAlg para manipulação de cadeias de caracteres (strings).',
        documentacao: '# `minusc(expressão)`\n Retorna um valor caracter contendo a expressão em letras minúsculas. A função `minusc` só tem efeito sobre variáveis do tipo caracter/caractere. No exemplo abaixo, a função retornará a string "lucas".',
        exemploCodigo: '`nome <- "LUCAS"`\n`escreva(minusc(nome))`',
    },
    {
        nome: 'numpcarac',
        descricao: 'Função do VisuAlg para manipulação de cadeias de caracteres (strings).',
        documentacao: '# `numpcarac(expressão)`\n Retorna um valor caracter contendo a representação de `expressão` como uma cadeia de caracteres. Corresponde a `IntToStr()` ou `FloatToStr()` do Delphi, `Str()` do Basic ou Clipper. A função `numpcarac` só tem efeito sobre variáveis do tipo inteiro ou real. No exemplo abaixo, a função transforma o número 8 na string "8".',
        exemploCodigo: '`valor <- 8`\n`escreva(numpcarac(valor))`',
    },
    {
        nome: 'pos',
        descricao: 'Função do VisuAlg para manipulação de cadeias de caracteres (strings).',
        documentacao: '# `pos(expressão1, expressão2)`\n Retorna um inteiro que indica a posição em que a `expressão1` se encontra na cadeia `expressão2`, ou zero se a `expressão1` não estiver contida na `expressão2`. Corresponde funcionalmente a `Pos()` do Delphi, `Instr()` do Basic ou `At()` do Clipper, embora a ordem dos parâmetros possa ser diferente em algumas destas linguagens. A função `pos` só tem efeito sobre variáveis do tipo caracter/caractere. No exemplo abaixo, a função retorna o número 3, que é a posição da letra "f" na palavra "Informática".',
        exemploCodigo: '`materia <- "Informática"`\n`escreva(pos("f", materia))`',
    },
];