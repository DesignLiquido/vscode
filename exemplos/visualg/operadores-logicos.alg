algoritmo "Exemplo Xou"
var A, B, C, resultA, resultB, resultC: logico
inicio
    A <- verdadeiro
    B <- verdadeiro
    C <- falso
    resultA <- A ou B
    escreval("A ", resultA)
    resultA <- A xou B
    escreval("A ", resultA)
    resultA <- nao B
    escreval("A ", resultA)
    resultB <- B
    resultA <- (A e B) ou (A xou B)
    resultB <- (A ou B) e (A e C)
    resultC <- A ou C e B xou A e nao B
    escreval("A ", resultA)
    escreval("B ", resultB)
    escreval("C ", resultC)
fimalgoritmo