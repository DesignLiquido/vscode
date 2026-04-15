export type TipoValor = 'logico' | 'texto' | 'numero';

export interface EsquemaPropriedade {
    tipo: TipoValor;
    valoresPermitidos?: string[];
}