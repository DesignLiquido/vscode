programa
{
	inclua biblioteca Util --> util
	
	funcao inicio() 
	{
		inteiro vetor[10]
		
		// preenche o vetor
		para (inteiro posicao = 0; posicao < 10; posicao++)
		{
			vetor[posicao] = util.sorteia(1, 100) // Sorteia um número e atribui à posição do vetor
		}

		// Exibe o vetor na ordem original
		escreva ("Vetor na ordem original:\n")
		
		para(inteiro posicao = 0; posicao < 10; posicao++)
		{
			escreva (vetor[posicao], " ")
		}
		
		// Exibe o vetor na ordem inversa
		escreva ("\n\nVetor na ordem inversa:\n")
		
		para(inteiro posicao = 9; posicao >=0; posicao--)
		{
			escreva (vetor[posicao], " ")
		}
	}
}