algoritmo "conversor"

var
    mre, dol : real
    cont, num : inteiro
inicio
    cont <- 1
    escreval("Quantas vezes você quer converter: ")
    leia(num)
        enquanto (cont <= num) faca
        escreval("Qual o valor em R$: ")
        leia(mre)
        dol <- mre / 5.47
        escreval("Você tem US$",dol:5:2, " dólares")
        cont <- cont + 1
        fimenquanto
escreval("Conversão Finalizada!")
fimalgoritmo