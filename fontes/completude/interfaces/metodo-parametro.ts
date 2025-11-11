export interface MetodoParametro {
    nome: string;
    parametros: string[];
    tipoRetorno?: string;
    documentacao: string;
    snippet?: string;
    permiteEncadeamento?: boolean;
}
