//https://github.com/DesignLiquido/vscode/issues/44
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