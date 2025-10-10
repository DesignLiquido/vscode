programa
{
	inclua biblioteca Matematica --> m
    inclua biblioteca Util --> u

    cadeia clubes[7] = {"Clube A", "Clube B", "Clube C", "Clube D", "Clube E", "Clube F", "MEDFC"}
    inteiro golsMarcadosIda[7], golsMarcadosVolta[7], golsSofridosIda[7], golsSofridosVolta[7]
    inteiro saldoGols[7], totalGolsMarcados = 0, totalGolsSofridos = 0
    inteiro vitoriasMEDFC = 0, empatesMEDFC = 0, derrotasMEDFC = 0

    funcao inicio()
    {
        escreva("Bem Vindo ao Campeonato do Medonho\n\n")

        // Rodadas de Ida
        escreva("Rodadas de Ida:\n")
        para (inteiro i = 0; i < 6; i++) {
            escreva("Rodada ", i + 1, ": MEDFC vs ", clubes[i], ":\n")
            escreva("  Gols do MEDFC: ")
            leia(golsMarcadosIda[6])
            escreva("  Gols do ", clubes[i], ": ")
            leia(golsSofridosIda[6])
        }

        // Rodadas de Volta
        escreva("\nRodadas de Volta:\n")
        para (inteiro i = 0; i < 6; i++) {
            escreva("Rodada ", i + 1, ": ", clubes[i], " vs MEDFC:\n")
            escreva("  Gols do ", clubes[i], ": ")
            leia(golsMarcadosVolta[i])
            escreva("  Gols do MEDFC: ")
            leia(golsSofridosVolta[i])
        }

        // Calcula saldo de gols, total de gols e estatísticas do MEDFC
        escreva("\nTabela de Saldo de Gols:\n")
        para (inteiro i = 0; i < 7; i++) {
            saldoGols[i] = (golsMarcadosIda[i] + golsMarcadosVolta[i]) - (golsSofridosIda[i] + golsSofridosVolta[i])
            escreva(clubes[i], ": ", saldoGols[i], "\n")

            totalGolsMarcados += golsMarcadosIda[i] + golsMarcadosVolta[i]
            totalGolsSofridos += golsSofridosIda[i] + golsSofridosVolta[i]

            se (i < 6) { // Exclui o próprio MEDFC da contagem de vitórias/empates/derrotas
                se (golsMarcadosIda[6] > golsSofridosIda[6]) {
                    vitoriasMEDFC++
                } senao se (golsMarcadosIda[6] == golsSofridosIda[6]) {
                    empatesMEDFC++
                } senao {
                    derrotasMEDFC++
                }
            }
        }

        // Exibe estatísticas do MEDFC
        escreva("\nEstatísticas do MEDFC:\n")
        escreva("  Total de gols a favor: ", totalGolsMarcados, "\n")
        escreva("  Total de gols sofridos: ", totalGolsSofridos, "\n")
        escreva("  Saldo de gols: ", totalGolsMarcados - totalGolsSofridos, "\n")
        escreva("  Média de gols a favor: ", m.arredondar(totalGolsMarcados / 12.0, 2), "\n") // 12 jogos no total
        escreva("  Média de gols sofridos: ", m.arredondar(totalGolsSofridos / 12.0, 2), "\n")

        // Exibe estatísticas de vitórias/empates/derrotas
        escreva("\nVitórias, Empates e Derrotas do MEDFC:\n")
        escreva("  Vitórias: ", vitoriasMEDFC, "\n")
        escreva("  Empates: ", empatesMEDFC, "\n")
        escreva("  Derrotas: ", derrotasMEDFC, "\n")

        // Calcula e exibe porcentagens
        escreva("\nPorcentagens:\n")
        escreva("  Vitórias: ", m.arredondar(vitoriasMEDFC * 100.0 / 6, 2), "%\n") // 6 jogos contra outros clubes
        escreva("  Empates: ", m.arredondar(empatesMEDFC * 100.0 / 6, 2), "%\n")
        escreva("  Derrotas: ", m.arredondar(derrotasMEDFC * 100.0 / 6, 2), "%\n")
    }
}