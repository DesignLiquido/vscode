import { LexadorInterface, SimboloInterface } from '@designliquido/delegua/interfaces';
import { cyrb53 } from '@designliquido/delegua/depuracao';

import { RetornoImportador } from "@designliquido/delegua-node/importador";

/**
 * Diferentemente do importador de `delegua-node`, este importador
 * não depende das bibliotecas `fs`, `os` e `path` do Node.js.
 * A leitura dos arquivos espera um adaptador do próprio ambiente do VSCode,
 * seja ele na Web ou em execução nativa.
 */
export class ImportadorExtensao {
    lexador: LexadorInterface<SimboloInterface>;

    constructor(
        lexador: LexadorInterface<SimboloInterface>,
    ) {
        this.lexador = lexador;
    }

    importarViaExtensao(
        funcaoObtencaoConteudoDocumento: () => string,
        nomeArquivo: string
    ): RetornoImportador<SimboloInterface> {
        const hashArquivo = cyrb53(nomeArquivo.toLowerCase());
        const conteudoDoArquivo: string[] = funcaoObtencaoConteudoDocumento().split('\n').map(linha => linha + '\0');

        const retornoLexador = this.lexador.mapear(conteudoDoArquivo, hashArquivo);

        return {
            conteudoArquivo: conteudoDoArquivo,
            nomeArquivo,
            hashArquivo,
            retornoLexador
        } as RetornoImportador<SimboloInterface>;
    }
}
