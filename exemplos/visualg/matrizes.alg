Algoritmo "uso de matrizes"
//Author: rar

var
//declaração de variaveis

M, N, i, j: inteiro
matA: vetor [0..4, 0..2] de inteiro

inicio
//secao de comandos

escreva("Digite quantas linhas a matriz vai ter: ")
leia(M)
escreva("Digite quantas colunas a matriz vai ter: ")
leia(N)

  para i de 0 ate M-1 faca
    para j de 0 ate N-1 faca
     
     escreva("Elemento: [", i, "," , j, "] : ")
     leia (matA[i, j])
    fimpara
  fimpara

escreval (" ")
escreval ("A matriz digitada é: ")

   para i de 0 ate M-1 faca
    para j de 0 ate N-1 faca
      escreva(matA[i, j], " ")

    fimpara
       escreval(" ")
  fimpara

fimalgoritmo