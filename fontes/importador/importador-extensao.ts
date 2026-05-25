import * as vscode from 'vscode';

import { LexadorInterface, SimboloInterface } from '@designliquido/delegua/interfaces';
import { RetornoLexadorInterface } from '@designliquido/delegua/interfaces/retornos';
import { cyrb53 } from '@designliquido/delegua/geracao-identificadores';
import { ImportadorInterface } from '../interfaces';

export interface RetornoImportador<S extends SimboloInterface> {
    conteudoArquivo: string[];
    nomeArquivo: string;
    caminhoAbsoluto: string;
    hashArquivo: number;
    retornoLexador: RetornoLexadorInterface<S>;
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

        // Verificando se o caminho é um URI absoluto ou um caminho de sistema de arquivos
        try {
            // Tenta interpretar como URI primeiro (lida com URIs file://)
            if (nomeArquivo.startsWith('file://') || nomeArquivo.startsWith('vscode-')) {
                fileUri = vscode.Uri.parse(nomeArquivo);
            }
            // Verifica se é um caminho de arquivo absoluto (Windows: C:\, D:\, etc. ou Unix: /)
            else if (
                nomeArquivo.match(/^[a-zA-Z]:[/\\]/) || // Windows
                nomeArquivo.startsWith('/') || // Unix
                nomeArquivo.startsWith('\\\\') // UNC
            ) {
                fileUri = vscode.Uri.file(nomeArquivo);
            }
            // Caso contrário, trata como caminho relativo
            else {
                if (this.diretorioBase) {
                    fileUri = vscode.Uri.joinPath(vscode.Uri.file(this.diretorioBase), nomeArquivo);
                } else {
                    if (!vscode.workspace.workspaceFolders || vscode.workspace.workspaceFolders.length === 0) {
                        throw new Error("Não há espaços de trabalho abertos válidos.");
                    }
                    const folderUri = vscode.workspace.workspaceFolders[0].uri;
                    fileUri = vscode.Uri.joinPath(folderUri, nomeArquivo);
                }
            }

            const documentoAberto = vscode.workspace.textDocuments.find(
                d => d.uri.fsPath.toLowerCase() === fileUri.fsPath.toLowerCase()
            );
            const conteudoArquivo = documentoAberto
                ? documentoAberto.getText().split('\n').map(linha => linha + '\0')
                : Buffer.from(await vscode.workspace.fs.readFile(fileUri)).toString('utf8').split('\n').map(linha => linha + '\0');

            const caminhoResolvido = fileUri.fsPath;
            const separador = caminhoResolvido.lastIndexOf('/') !== -1 ? '/' : '\\';
            this.diretorioBase = caminhoResolvido.substring(0, caminhoResolvido.lastIndexOf(separador));

            const hashArquivo = cyrb53(nomeArquivo.toLowerCase());
            this.conteudoArquivosAbertos[hashArquivo] = conteudoArquivo;

            const retornoLexador = this.lexador.mapear(conteudoArquivo, hashArquivo);

            return {
                conteudoArquivo: conteudoArquivo,
                nomeArquivo,
                caminhoAbsoluto: caminhoResolvido,
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
