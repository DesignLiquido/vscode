Algoritmo "Jogo da Velha"
Var
    i, q, t: inteiro
    jogoMatriz : vetor [1..3, 1..3] de caractere
Inicio
    q <- 4
   t <- 7
   para i de 1 ate 3 faca
      jogoMatriz[1,i] <- numpcarac(i)
      jogoMatriz[2,i] <- numpcarac(q)
      jogoMatriz[3,i] <- numpcarac(t)
      q <- q + 1
      t <- t + 1
   fimpara
   Escreval("      | ", jogoMatriz[1,1], " | ", jogoMatriz[1,2], " | ", jogoMatriz[1,3], " |")
   Escreval("      +---+---+---+")
   Escreval("      | ", jogoMatriz[2,1], " | ", jogoMatriz[2,2], " | ", jogoMatriz[2,3], " |")
   Escreval("      +---+---+---+")
   Escreval("      | ", jogoMatriz[3,1], " | ", jogoMatriz[3,2], " | ", jogoMatriz[3,3], " |")
Fimalgoritmo