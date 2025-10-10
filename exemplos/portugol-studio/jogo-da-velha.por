programa
{
	
	funcao inicio()
	{
		//Declaração da matriz de espaços vazios, da variavel de espaços disponíveis e da decisão; 
		inteiro espacos_vazios[3][3] = {{1, 2, 3}, {4, 5, 6}, {7, 8, 9}}, disponivel = 9, decisao
		//Declaração da matriz de espços, matriz que irá guardar a informação de onde foi colocado o "X" e a "O";
		caracter espacos[3][3]
		//Declaração das variáveis lógicas.
		logico vitoria = falso, x = verdadeiro, loop = verdadeiro
		//O laço enquanto é onde o jogo todo roda, ele irá rodar enquanto a vriável vitória for falso e enquanto tiver espaço disponível; 
		enquanto(vitoria == falso e disponivel > 0)
		{
			/*O laço para irá ser responsável por mostrar o jogo na tela. Caso um elemento da matriz de espaços vazios seja igual a zero (o que indica que esse espaço foi utilizado),
			será mostrado na tela o elemento da matriz de espaços.*/
			para(inteiro linha = 0; linha < 3; linha++)
			{
				para(inteiro coluna = 0; coluna < 3; coluna++)
				{
					se(espacos_vazios[linha][coluna] != 0)
					{
						escreva('[', espacos_vazios[linha][coluna], ']')
					}
					senao
					{
						escreva('[', espacos[linha][coluna], ']')
					}
				}
				escreva("\n")
				
			}
			/*Caso a variável lógica x seja verdadeiro (ou seja, caso seja o turno do jogador do 'X') irá rodar o códico dentro do bloco se.*/
			se(x == verdadeiro)
			{
				/*Irá pedir na tela que digite o número do espaço vazio em que irá ser colocado o 'X', rejeitando qualquer tentativa de digitar um número que não tem e/ou quelquer
				tentativa de pegar um espaço que já foi pego, e irá pedir para digitar a decisão novamente.*/
				escreva("Digite o número do espaço que gostaria de por o 'X': ")
				/*Enquanto o loop for verdadeiro, irá ler o número da decisão e vai colocar o 'X' na matriz espaços na posição escolhida e irá atualizar o valor da matriz de espaços vazios para 0. Além disso
				irá diminuir o número de espaços disponíveis em 1, colocar a variável 'x' como falso(indicando que o próximo jogador será o da 'O') e irá colocar a variavel do loop como falso;*/ 
				enquanto(loop == verdadeiro)
				{
					leia(decisao)
					//Bloco da primeira linha;
					se(decisao <= 3)
					{
						se(espacos_vazios[0][decisao-1] != 0)
						{
							espacos_vazios[0][decisao-1] = 0
							espacos[0][decisao-1] = 'X'
							loop = falso
							disponivel--
							x = falso
						}
						senao{escreva("\nEscolha inválida, tente novamente: ")}
					}
					//Bloco da segunda linha;
					senao se(decisao <= 6)
					{
						se(espacos_vazios[1][decisao-4] != 0)
						{
							espacos_vazios[1][decisao-4] = 0
							espacos[1][decisao-4] = 'X'
							loop = falso
							disponivel--
							x = falso
						}
						senao{escreva("\nEscolha inválida, tente novamente: ")}
					}
					//Bloco da terceira linha;
					senao se(decisao <= 9)
					{
						se(espacos_vazios[2][decisao-7] != 0)
						{
							espacos_vazios[2][decisao-7] = 0
							espacos[2][decisao-7] = 'X'
							loop = falso
							disponivel--
							x = falso
						}
						senao{escreva("\nEscolha inválida, tente novamente: ")}
					}
					senao{escreva("\nEscolha inválida, tente novamente: ")}
				}
				//Limpa a tela e coloca a variável loop como verdadeiro novamente; 
				limpa()
				loop = verdadeiro
			}
			senao
			{
				/*Irá pedir na tela que digite o número do espaço vazio em que irá ser colocado o 'O', rejeitando qualquer tentativa de digitar um número que não tem e/ou quelquer
				tentativa de pegar um espaço que já foi pego, e irá pedir para digitar a decisão novamente.*/
				escreva("Digite o número do espaço que gostaria de por o 'O': ")
				/*Enquanto o loop for verdadeiro, irá ler o número da decisão e vai colocar o 'O' na matriz espaços na posição escolhida e irá atualizar o valor da matriz de espaços vazios para 0. Além disso
				irá diminuir o número de espaços disponíveis em 1, colocar a variável 'x' como verdadeiro(indicando que o próximo jogador será o do 'X') e irá colocar a variavel do loop como falso;*/ 
				enquanto(loop == verdadeiro)
				{
					leia(decisao)
					//Bloco da primeira linha;
					se(decisao <= 3)
					{
						se(espacos_vazios[0][decisao-1] != 0)
						{
							espacos_vazios[0][decisao-1] = 0
							espacos[0][decisao-1] = 'O'
							loop = falso
							disponivel--
							x = verdadeiro
						}
						senao{escreva("\nEscolha invélida, tente novamente: ")}
					}
					//Bloco da segunda linha;
					senao se(decisao <= 6)
					{
						se(espacos_vazios[1][decisao-4] != 0)
						{
							espacos_vazios[1][decisao-4] = 0
							espacos[1][decisao-4] = 'O'
							loop = falso
							disponivel--
							x = verdadeiro
						}
						senao{escreva("\nEscolha invélida, tente novamente: ")}
					}
					//Bloco da terceira linha;
					senao se(decisao <= 9)
					{
						se(espacos_vazios[2][decisao-7] != 0)
						{
							espacos_vazios[2][decisao-7] = 0
							espacos[2][decisao-7] = 'O'
							loop = falso
							disponivel--
							x = verdadeiro
						}
						senao{escreva("\nEscolha invélida, tente novamente: ")}
					}
					senao{escreva("\nEscolha invélida, tente novamente: ")}
				}
				//Limpa a tela e coloca a variável loop como verdadeiro novamente; 
				limpa()
				loop = verdadeiro
			}
			/*Esse laço para irá verificar caso todos os elementos, que não são espaços vazios, são iguais, tanto para coluna quanto para linhas. 
			Caso haja uma linha ou coluna tenha todos os elementos iguais, irá colocar a variável vitória como verdadeira, indicando que alguém ganhou;*/
			para(inteiro i = 0; i < 3; i++)
			{
				se(espacos[i][0] == espacos[i][1] e espacos_vazios[i][0] == 0)
				{
					se(espacos[i][0] == espacos[i][2])
					{
						vitoria = verdadeiro
					}
				}
				se(espacos[0][i] == espacos[1][i] e espacos_vazios[0][i] == 0)
				{
					se(espacos[0][i] == espacos[2][i])
					{
						vitoria = verdadeiro
					}
				}
			}
			/*Essas duas estruturas de condição irão verificar se os elementos das diagonais são todos iguais(desde que não seja um espaço vazio);*/
			se(espacos[0][0] == espacos[1][1] e espacos_vazios[0][0] == 0)
			{
				se(espacos[0][0] == espacos[2][2])
				{
					vitoria = verdadeiro
				}
			}
			se(espacos[0][2] == espacos[1][1] e espacos_vazios[0][2] == 0)
			{
				se(espacos[0][2] == espacos[2][0])
				{
					vitoria = verdadeiro
				}
			}
		}
		//Caso a variável vitória seja verdadeira e a variável 'x' seja falsa(indicando que o próximo jogador será a 'O'), irá mostrar na tela que o jogador que é o 'X' ganhou; 
		se(vitoria == verdadeiro e x == falso)
		{
			escreva("\nO jogador que é 'X' ganhou!!!")
		}
		//Caso a última não tenha sido verdadeira e a variável vitória seja verdadeira e a variável 'x' seja verdadeira(indicando que o próximo jogador será o 'X'), irá mostrar na tela que o jogador que é a 'O' ganhou; 
		senao se(vitoria == verdadeiro e x == verdadeiro)
		{
			escreva("\nO jogador que é 'O' ganhou!!!")
		}
		//Caso nenhuma condição tenha sido verdadeira, irá mostrar na tela que deu velha.
		senao
		{
			escreva("\nNinguem ganhou, deu velha.")
		}
	}
}