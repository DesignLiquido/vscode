import { RetornoAvaliadorSintatico } from '@designliquido/delegua/interfaces/retornos/retorno-avaliador-sintatico';
import { RetornoLexador } from '@designliquido/delegua/interfaces/retornos/retorno-lexador';

export interface RetornoImportador<TSimbolo, TDeclaracao> {
    conteudoArquivo: string[];
    nomeArquivo: string;
    hashArquivo: number;
    retornoLexador: RetornoLexador<TSimbolo>;
    retornoAvaliadorSintatico: RetornoAvaliadorSintatico<TDeclaracao>;
}
