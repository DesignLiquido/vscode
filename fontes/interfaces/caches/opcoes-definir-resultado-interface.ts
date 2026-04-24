export interface OpcoesDefinirResultado {
    ttlMs?: number;
    versaoDocumento?: number;
    hashConteudo?: number;
    diagnosticos?: any[];
    dependenciasArquivos?: string[];
    motivo?: string;
}