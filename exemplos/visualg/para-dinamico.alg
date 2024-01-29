algoritmo "Aula94_SomaVetor"
// Faça um programa que leia N numeros reais e armazene-os em um vetor. Em seguida:
// - Imprimir todos os elementos do vetor
// - Mostrar na tela a soma e a media dos elementos do vetor
var

N, i : inteiro
soma, media : real
vet : vetor [0..9] de real

inicio

    escreval("Quantos numeros voce vai digitar? ")
    leia(N)

    soma <- 0
    para i de 0 ate N-1 faca
      escreval("Digite um numero:")
      leia(vet[i])
      soma <- soma + vet[i]
    fimpara

    escreva("VALORES: ")
    para i de 0 ate N-1 faca
      escreva(vet[i]:2:2)
    fimpara

    escreval("")
    media <- soma / N
    escreval("SOMA = ", soma)
    escreval("MEDIA = ", media)

fimalgoritmo