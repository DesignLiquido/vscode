algoritmo "SomaImpares"
var
   X, Y, i, soma : inteiro
inicio
   escreva("Digite o primeiro número: ")
   leia(X)
   escreva("Digite o segundo número: ")
   leia(Y)
   soma <- 0
   se (X % 2 = 0) entao
      X <- X + 1
   senao
      se (Y % 2 = 0) entao
         Y <- Y + 1
      fimse
   fimse
   i <- 0
   se X > Y entao
      para i de Y ate X faca
         se i % 2 <> 0 entao
            escreva(i)
            soma <- soma + i
         fimSe
      fimPara
   senao
      i <- 0
      para i de X ate Y faca
         se i % 2 <> 0 entao
            escreval(i)
            soma <- soma + i
         fimSe
      fimPara
   fimSe
   escreval(" A soma dos números ímpares entre ", X , " e ", Y , " é: " , soma)
fimalgoritmo