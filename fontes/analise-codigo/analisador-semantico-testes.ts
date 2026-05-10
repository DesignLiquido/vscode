import { AnalisadorSemantico } from '@designliquido/delegua/analisador-semantico';
import { Declaracao } from '@designliquido/delegua/declaracoes';
import { RetornoAnalisadorSemanticoInterface } from '@designliquido/delegua/interfaces/retornos';

// Símbolo hipotético usado apenas para marcar os nomes como conhecidos pelo analisador.
// verificarVariavel() só testa se this.funcoes[nome] é truthy — o valor real não importa.
const simboloConhecido = { valor: {} } as any;

/**
 * Analisador semântico para arquivos `.teste.delegua`.
 * Pré-declara os símbolos exportados pelo módulo `testes` (runtime) para
 * evitar falsos positivos de "Variável não definida".
 */
export class AnalisadorSemanticoTestes extends AnalisadorSemantico {
    override async analisar(declaracoes: Declaracao[]): Promise<RetornoAnalisadorSemanticoInterface> {
        // analisar() não reinicia this.funcoes, então esses valores persistem durante toda a análise.
        this.funcoes['grupo'] = simboloConhecido;
        this.funcoes['teste'] = simboloConhecido;
        this.funcoes['lancarErro'] = simboloConhecido;
        this.funcoes['afirmar'] = simboloConhecido;
        return super.analisar(declaracoes);
    }
}
