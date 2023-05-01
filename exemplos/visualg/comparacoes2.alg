Algoritmo "semnome"

Var
// Seção de Declarações das variáveis

num, aux: inteiro
listaNumeros: vetor[0..2] de inteiro
i, j, k, cont :inteiro

Inicio
// Seção de Comandos, procedimento, funções, operadores, etc...
para i de 0 ate 2 faca
    escreval("Insira o ", i + 1, "º Número:")
    leia(listaNumeros[i])
fimpara

para k de 0 ate i faca
    escreval (listaNumeros[k])
fimpara

j <- 1

enquanto j <= i faca // ordena corretamente no VisuAlg, no VSCode não funciona
// enquanto j < i faca // ordena corretamente no VSCode, no VisuAlg  não funciona

    se (j = 0) entao
        j <- 1
    fimse

    se (listaNumeros[j] < listaNumeros[j - 1]) entao
        aux <- listaNumeros[j-1]
        listaNumeros[j-1] <- listaNumeros[j]
        listaNumeros[j] <- aux
        j <- j - 1
    senao
        j <- j + 1
    fimse

fimenquanto

escreval("---------")

para k de 0 ate i faca
    escreval (listaNumeros[k])
fimpara

Fimalgoritmo
