import { ResultadoAnaliseInterface } from "../resultado-analise-interface";

export interface EntradaCacheAnalise {
    resultado: ResultadoAnaliseInterface;
    diagnosticos: any[];
    dependenciasArquivos: string[];
    criadoEm: number;
    expiraEm: number;
    ttlMs: number;
    versaoDocumento?: number;
    hashConteudo?: number;
    motivo?: string;
}
