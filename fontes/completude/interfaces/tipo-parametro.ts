import { MetodoParametro } from "./metodo-parametro";
import { PropriedadeParametro } from "./propriedade-parametro";

export interface TipoParametro {
    nome: string;
    propriedades: PropriedadeParametro[];
    metodos?: MetodoParametro[];
}
