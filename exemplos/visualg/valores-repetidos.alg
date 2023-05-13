algoritmo "valores-repetidos"
var
    li: vetor[0..9] de inteiro
    i, j, k: inteiro
    resposta: caractere

inicio

    i <- 0
    k <- 0

    enquanto resposta <> "N" faca
        escreval("---------------------------")
        escreval("Digite o", i + 1, "º numero: ")
        leia(li[i])

        // j <- 0

        se (i > 0) entao
            para j de 0 ate i - 1 faca
                se li[i] = li[j] entao
                    escreval("Valores repetidos não serão computados.")
                    i <- i - 1
                    interrompa
                fimse
            fimpara
        fimse

        escreval ("Você deseja inserir mais um número? (S/N)")
        leia(resposta)

        se (resposta <> "N") entao
            i <- i + 1
        fimse

    fimenquanto

    para k de 0 ate i faca
        escreva(li[k], " ")
    fimPara

fimAlgoritmo