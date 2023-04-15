algoritmo "Ex-038"

var
    li : vetor[0..9] de inteiro
    i, j, k, cont : inteiro
    resposta: caractere

inicio

    i <- 0
    k <- 0

    enquanto resposta <> "N" faca
        escreval("---------------------------")
        escreval("Digite a", i + 1, "a nota: ")
        leia(li[i])

        j <- 0
        // cont <- i - 1 // cont criada para substituir o i - 1

        // para j de 0 ate cont faca // cont funciona
        para j de 0 ate i - 1 faca // i - 1 não é aceito
            se li[i] = li[j] entao
                escreval("Valores repetidos não serão computados.")
                li[i] = ""
                i <- i - 1
                interrompa
            fimse
        fimpara

        escreval ("Você deseja inserir mais um número? (S/N)")
        leia(resposta)

        i <- i + 1
    fimenquanto

    para k de 0 ate i faca
        escreva(li[k], " ")
    fimPara

fimAlgoritmo