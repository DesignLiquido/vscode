import { Declaracao } from "@designliquido/delegua/declaracoes";

export interface EntradaCacheDefinicoes {
    definicoes: { [nomeTipo: string]: Declaracao };
    criadoEm: number;
    expiraEm: number;
    ttlMs: number;
    motivo?: string;
}
