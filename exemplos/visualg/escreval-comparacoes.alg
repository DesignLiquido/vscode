algoritmo "Ex-038-1"

var

num, aux: inteiro
listaNumeros: vetor[0..2] de inteiro
i, j, k, cont :inteiro

inicio

para i de 0 ate 2 faca
    escreval("Insira o ", i + 1, "º Número:")
    leia(listaNumeros[i])
fimpara

para k de 0 ate 2 faca
    escreval (listaNumeros[k], " ")
fimpara

cont <- i - 1 // cont = 1

para j de 0 ate cont faca
    escreval("-------------")
    escreval(listaNumeros[j]) // executa normalmente
    escreval(listaNumeros[j+1]) // executa normalmente
    escreval(listaNumeros[j] > 0) // comparação entre item de lista e número não executa (nem dá erro)
    escreval("teste") // linha 31 executa normalmente
    escreval(listaNumeros[j] > listaNumeros[j]) // comparação entre itens de lista não executa (nem dá erro)

fimpara

fimalgoritmo