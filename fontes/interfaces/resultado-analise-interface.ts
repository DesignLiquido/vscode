import { Declaracao } from "@designliquido/delegua";
import { RetornoAnalisadorSemantico, RetornoAvaliadorSintatico, RetornoLexador, SimboloInterface } from "@designliquido/delegua/interfaces";

export interface ResultadoAnaliseInterface {
    lexador: RetornoLexador<SimboloInterface>;
    avaliadorSintatico: RetornoAvaliadorSintatico<Declaracao>;
    analisadorSemantico: RetornoAnalisadorSemantico;
    declaracoesPreCarregadas?: any[];
}
