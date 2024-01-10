Algoritmo "Aula26Exemplo1"
Var
   largura, comprimento, area, metroQuadrado, valor: real
Inicio

      escreval("Digite a largura do terreno: ")
      leia(largura)
       escreval("Digite o comprimento do terreno: ")
      leia(comprimento)
       escreval("Digite o valor do metro quadrado: ")
      leia(metroQuadrado)

      area <- largura * comprimento
      valor <- area * metroQuadrado

      escreval("DADOS DO TERRENO:")

      escreval("Largura do terreno: ",largura)
      escreval("Comprimento do terreno: ",comprimento)
      escreval("Área do terreno: ",area:8:2)
      escreval("Valor do terreno: ",valor:8:2)

Fimalgoritmo