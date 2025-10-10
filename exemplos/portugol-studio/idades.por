programa
{
    inclua biblioteca Texto --> t
    inclua biblioteca Matematica --> m
    inclua biblioteca Calendario  --> c
   
    funcao inicio()
    {
        inteiro p1, idade[500], ano[500],cont
        cadeia nome[500]
        escreva("Quantas Pessoas para o Cadastro : ")
        leia(p1)

        para(cont = 0; cont < p1; cont++)
        {
            escreva("Digite o nome da pessoa Nº ",cont+1," : ")
            leia(nome[cont])        
        }

        para(cont = 0; cont < p1 ; cont++)
        {
            escreva("Digite seu Ano de Nascimento: ")
            leia(ano[cont])
            idade[cont] = c.ano_atual() - ano[cont]
        }
    
        para(cont = 0; cont < p1 ; cont++)
        {    
            escreva( "A Pessoa Nº ",cont+1," " , t.caixa_alta(nome[cont])," Tem Atualmente ",idade[cont],"\n")
        }
    }
}