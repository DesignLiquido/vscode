import * as vscode from 'vscode';

import { LexadorInterface, SimboloInterface } from '@designliquido/delegua/interfaces';
import { RetornoLexador } from '@designliquido/delegua/interfaces/retornos';
import { cyrb53 } from '@designliquido/delegua/geracao-identificadores';
import { ImportadorInterface } from '../interfaces';

export interface RetornoImportador<S extends SimboloInterface> {
    conteudoArquivo: string[];
    nomeArquivo: string;
    hashArquivo: number;
    retornoLexador: RetornoLexador<S>;
}

/**
 * Diferentemente do importador de `delegua-node`, este importador
 * não depende das bibliotecas `fs` e `os` do Node.js.
 * A leitura dos arquivos espera um adaptador do próprio ambiente do VSCode,
 * seja ele na Web ou em execução nativa.
 */
export class ImportadorExtensao implements ImportadorInterface<SimboloInterface> {
    lexador: LexadorInterface<SimboloInterface>;
    diretorioBase: string = '';
    conteudoArquivosAbertos: { [identificador: string]: string[] } = {};

    constructor(
        lexador: LexadorInterface<SimboloInterface>,
    ) {
        this.lexador = lexador;
    }

    async importar(nomeArquivo: string, _: number): Promise<RetornoImportador<SimboloInterface>> {
        let fileUri: vscode.Uri;

        // Check if the path is already an absolute URI or file system path
        try {
            // Try to parse as URI first (handles file:// URIs)
            if (nomeArquivo.startsWith('file://') || nomeArquivo.startsWith('vscode-')) {
                fileUri = vscode.Uri.parse(nomeArquivo);
            }
            // Check if it's an absolute file path (Windows: C:\, D:\, etc. or Unix: /)
            else if (
                nomeArquivo.match(/^[a-zA-Z]:[/\\]/) || // Windows absolute path
                nomeArquivo.startsWith('/') || // Unix absolute path
                nomeArquivo.startsWith('\\\\') // UNC path
            ) {
                fileUri = vscode.Uri.file(nomeArquivo);
            }
            // Otherwise, treat as relative path
            else {
                if (!vscode.workspace.workspaceFolders || vscode.workspace.workspaceFolders.length === 0) {
                    throw new Error("Não há espaços de trabalho abertos válidos.");
                }
                const folderUri = vscode.workspace.workspaceFolders[0].uri;
                fileUri = vscode.Uri.joinPath(folderUri, nomeArquivo);
            }

            const bufferArquivo = await vscode.workspace.fs.readFile(fileUri);
            const conteudoArquivo = Buffer.from(bufferArquivo).toString('utf8').split('\n').map(linha => linha + '\0');

            // Store the content in conteudoArquivosAbertos for potential reuse
            const hashArquivo = cyrb53(nomeArquivo.toLowerCase());
            this.conteudoArquivosAbertos[hashArquivo] = conteudoArquivo;

            const retornoLexador = this.lexador.mapear(conteudoArquivo, hashArquivo);

            return {
                conteudoArquivo: conteudoArquivo,
                nomeArquivo,
                hashArquivo,
                retornoLexador
            } as RetornoImportador<SimboloInterface>;
        } catch (erro: any) {
            throw new Error(`Erro ao importar arquivo '${nomeArquivo}': ${erro.message}`);
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
