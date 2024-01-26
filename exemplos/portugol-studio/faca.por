https://github.com/DesignLiquido/delegua/issues/595
programa
{
    funcao inicio()
    {
        inteiro valor = 2
                
        logico eNegativo
        faca
        {
            escreva("Ok\t", valor,"\n")
            valor--
            eNegativo = valor < 0            
        }
        enquanto(nao eNegativo)
    }
}