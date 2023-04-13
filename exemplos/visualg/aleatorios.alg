algoritmo "Teste 7"
var
    aleatorioMaximo, aleatorioMinimo, i: inteiro
inicio

repita
    aleatorioMaximo <- int(rand * 100)
    aleatorioMinimo <- int(rand * 100)
ate aleatorioMaximo >= aleatorioMinimo

escreval ("Máximo", aleatorioMaximo)
escreval ("Mínimo", aleatorioMinimo)

para i de aleatorioMinimo ate aleatorioMaximo faca
    escreval(i)
fimpara

fimalgoritmo