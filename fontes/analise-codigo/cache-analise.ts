import { RetornoLexador, RetornoAvaliadorSintatico } from '@designliquido/delegua/interfaces/retornos';
import { RetornoAnalisadorSemantico } from '@designliquido/delegua/interfaces/retornos/retorno-analisador-semantico';

export interface ResultadoAnalise {
    lexador: RetornoLexador<any>;
    avaliadorSintatico: RetornoAvaliadorSintatico<any>;
    analisadorSemantico: RetornoAnalisadorSemantico;
    declaracoesPreCarregadas?: any[];
}

const cache = new Map<string, ResultadoAnalise>();

export function definirResultado(uri: string, resultado: ResultadoAnalise) {
    cache.set(uri, resultado);
}

export function obterResultado(uri: string): ResultadoAnalise | undefined {
    return cache.get(uri);
}
