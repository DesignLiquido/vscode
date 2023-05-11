algoritmo "Ex-061"

var

i, j, k: inteiro

inicio

// Passo estático
para i de 0 ate 5 faca
    escreval (i)
fimpara

k <- i

// Passo estático
para j de 0 ate 5 faca
    escreval (k)
    k <- k - 1
fimpara

// Passo dinâmico, decidido em tempo de execução.
para j de i ate 0 faca
    escreval(j)
fimpara

// Passo estático por uso da palavra reservada "passo".
para j de i ate 0 passo -1 faca
    escreval(j)
fimpara

fimalgoritmo