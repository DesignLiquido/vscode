algoritmo "Ex-007"

var

    testeA, testeB, testeC, testeX, testeY, testeZ: inteiro

inicio
    escreval (":::: 1 ::::")
    testeA <- 10
    testeB <- 20
    escreval (testeB)
    testeB <- 5
    escreval (testeA + " " + testeB)
    escreval ()

    escreval (":::: 2 ::::")
    testeA <- 10
    testeB <- 20
    testeC <- testeA    // estes tipos de atribuições não executam
    escreval (testeC)   // exibe NaN
    testeB <- testeC
    escreval (testeB)   // exibe NaN
    testeA <- testeB
    escreval (testeA)   // exibe NaN
    escreval (testeA + " " + testeB + " " + testeC) // exibe NaN NaN NaN
    escreval ()
fimalgoritmo