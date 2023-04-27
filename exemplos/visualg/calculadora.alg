algoritmo "Ex-049"
// Disciplina  :  [Linguagem e Lógica de Programação]
// Professor   : [Nome do Professor]
// Descrição   : Aqui você descreve o que o programa faz! (função)
// Autor(a)    : Nome do(a) aluno(a)
// Data atual  : 26/04/2023

var

operacao, resposta: caractere
num1, num2: real

inicio

resposta <- "S"

enquanto (resposta <> "N") faca
    num1 <- 0
    num2 <- 0

    enquanto (num1 = 0) faca
        escreval ("Insira o primeiro valor")
        leia (num1)
        se (num1 = 0) entao
            escreval ("Valor não pode ser 0 (zero)!")
        fimse
    fimenquanto

    enquanto (num2 = 0) faca
        escreval ("Insira o segundo valor")
        leia (num2)

        se (num2 = 0) entao
            escreval ("Valor não pode ser 0 (zero)!")
        fimse
    fimenquanto

    escreval ("Digite a Operação a ser efetuada (+, -, , /):")
    leia (operacao)

    escolha operacao

        caso "+"
            escreval (num1 + num2)

        caso "-"
            escreval (num1 - num2)

        caso ""
            escreval (num1 * num2)

        caso "/"
            escreval (num1 / num2)

        outrocaso
            escreval ("Operação Inválida")

    fimescolha

    escreval ("Deseja realizar outra operação? (S/N)")
    leia (resposta)
fimenquanto

fimalgoritmo