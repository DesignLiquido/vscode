Algoritmo "exemplo_funcoes2"
var
a, b, c : caractere
inicio
a <- "2"
b <- "9"
escreval( b + a ) // será escrito "92" na tela
escreval( caracpnum(b) + caracpnum(a) ) // será escrito 11 na tela
escreval( numpcarac(3+3) + a ) // será escrito "62" na tela
c <- "Brasil"
escreval(maiusc(c)) // será escrito "BRASIL" na tela
escreval(compr(c)) // será escrito 6 na tela
b <- "O melhor do Brasil"
escreval(pos(c,b)) // será escrito 13 na tela
escreval(asc(c)) // será escrito 66 na tela - código ASCII de "B"
a <- carac(65) + carac(66) + carac(67)
escreval(a) // será escrito "ABC" na tela
Fimalgoritmo