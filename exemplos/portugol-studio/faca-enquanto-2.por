programa {

    funcao calculadora (){ 
        inteiro opcao
        faca {
            escreva("Escolha uma opção\n")
            escreva("1 - Soma\n 2 - Subtração\n 0 - Sair")
            leia(opcao)
            escolha (opcao){
                caso 1:
                somar ()
                pare
                caso 2:
                subtrair ()
                pare 
                caso 0:
                escreva("Saindo da calculadora...\n")
                pare
                caso contrario:
                escreva ("Opção invalida")
            } 
        } enquanto(opcao!=0)
    }
    
    funcao somar (){
        real num1,num2
        escreva("Informe o primeiro numero: ")
        leia (num1)
        escreva("Informe o segundo numero: ")
        leia (num2)
        escreva(" A Soma é: ",num1 + num2)
    } 
    
    funcao subtrair (){
        real num1,num2
        escreva("Informe o primeiro numero: ")
        leia (num1)
        escreva("Informe o segundo numero: ")
        leia (num2)
        escreva(" A Soma é: ",num1 - num2)
    }

     funcao inicio(){
            calculadora ()
     }

}