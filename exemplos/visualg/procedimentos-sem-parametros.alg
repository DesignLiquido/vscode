algoritmo "Procedimentos sem parâmetros"
// Disciplina  :  [Linguagem e Lógica de Programação]
// Professor   : [Nome do Professor]
// Descrição   : Aqui você descreve o que o programa faz! (função)
// Autor(a)    : Nome do(a) aluno(a)
// Data atual  : DATA_ATUAL/MES_ATUAL/ANO_ATUAL
procedimento mostraNomeECor()
inicio
    escreval("O nome do usuário é ", nomeUsuario, " e sua cor favorita é ", corFavorita)
fimprocedimento

procedimento recebeDados()
inicio
    escreval("Insira o nome do usuário: ")
    leia(nomeUsuario)
    escreval("Informe sua cor preferida: ")
    leia(corFavorita)
fimprocedimento

var
    nomeUsuario, corFavorita: caractere
inicio
    recebeDados
    mostraNomeECor
fimalgoritmo