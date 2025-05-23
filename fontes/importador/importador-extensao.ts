import * as vscode from 'vscode';
import { posix } from 'path';

import { LexadorInterface, SimboloInterface } from '@designliquido/delegua/interfaces';
import { cyrb53 } from '@designliquido/delegua/depuracao';

import { RetornoImportador } from "@designliquido/delegua-node/importador";

/**
 * Diferentemente do importador de `delegua-node`, este importador
 * não depende das bibliotecas `fs` e `os` do Node.js.
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

    async importar(nomeArquivo: string) {
        if (vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders.length > 0) {
            const folderUri = vscode.workspace.workspaceFolders[0].uri;
            // TODO: Verificar se o posix causa algum problema na hora de usar na web.
            const fileUri = folderUri.with({ path: posix.join(folderUri.path, nomeArquivo) });

            const bufferArquivo = await vscode.workspace.fs.readFile(fileUri);
            const conteudoArquivo = Buffer.from(bufferArquivo).toString('utf8').split('\n').map(linha => linha + '\0');

            const hashArquivo = cyrb53(nomeArquivo.toLowerCase());
            const retornoLexador = this.lexador.mapear(conteudoArquivo, hashArquivo);

            return {
                conteudoArquivo: conteudoArquivo,
                nomeArquivo,
                hashArquivo,
                retornoLexador
            } as RetornoImportador<SimboloInterface>;
        } else {
            console.info("Não há workspaces válidos abertos.");
        }
    }

    importarViaFuncaoConteudoDocumento(
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
