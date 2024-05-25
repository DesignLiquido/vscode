import { RetornoImportador } from "./retorno-importador";

export interface ImportadorInterface<TSimbolo, TDeclaracao> {
    importar(
        caminhoRelativoArquivo: string,
        importacaoInicial: boolean
    ): RetornoImportador<TSimbolo, TDeclaracao>;
}
