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
 * Indica se o caminho de importação é relativo ao arquivo atual (`./` ou `../`).
 */
export function ehCaminhoRelativo(caminho: string): boolean {
    return /^\.\.?[/\\]/.test(caminho);
}

function possuiExtensao(caminho: string): boolean {
    const ultimaBarra = Math.max(caminho.lastIndexOf('/'), caminho.lastIndexOf('\\'));
    return caminho.slice(ultimaBarra + 1).lastIndexOf('.') > 0;
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

            // Importações relativas sem extensão (por exemplo, `importar { A } de "./modulo"`)
            // apontam para `modulo.delegua`.
            if (ehCaminhoRelativo(nomeArquivo) && !possuiExtensao(nomeArquivo)) {
                fileUri = await this.resolverExtensaoDelegua(fileUri);
            }

            const documentoAberto = this.localizarDocumentoAberto(fileUri);
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

    private localizarDocumentoAberto(uri: vscode.Uri): vscode.TextDocument | undefined {
        return vscode.workspace.textDocuments.find(
            d => d.uri.fsPath.toLowerCase() === uri.fsPath.toLowerCase()
        );
    }

    /**
     * Devolve a URI com a extensão `.delegua` quando a URI original não existe
     * e a variante com extensão existe (aberta no editor ou em disco).
     * Caso nenhuma exista, devolve a URI original, para que o erro de leitura
     * mencione o caminho como escrito.
     */
    private async resolverExtensaoDelegua(uri: vscode.Uri): Promise<vscode.Uri> {
        if (await this.uriExiste(uri)) {
            return uri;
        }

        const uriComExtensao = uri.with({ path: `${uri.path}.delegua` });
        if (await this.uriExiste(uriComExtensao)) {
            return uriComExtensao;
        }

        return uri;
    }

    private async uriExiste(uri: vscode.Uri): Promise<boolean> {
        if (this.localizarDocumentoAberto(uri)) {
            return true;
        }

        try {
            const estatistica = await vscode.workspace.fs.stat(uri);
            return estatistica.type !== vscode.FileType.Directory;
        } catch {
            return false;
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
