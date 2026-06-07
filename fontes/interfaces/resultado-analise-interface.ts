import { Declaracao } from "@designliquido/delegua";
import { SimboloInterface } from "@designliquido/delegua/interfaces";
import { RetornoAnalisadorSemanticoInterface, RetornoAvaliadorSintaticoInterface, RetornoLexadorInterface } from "@designliquido/delegua/interfaces/retornos";

export interface ResultadoAnaliseInterface {
    lexador: RetornoLexadorInterface<SimboloInterface>;
    avaliadorSintatico: RetornoAvaliadorSintaticoInterface<Declaracao>;
    analisadorSemantico: RetornoAnalisadorSemanticoInterface;
    declaracoesPreCarregadas?: any[];
}
