import * as vscode from 'vscode';

function escaparRegex(texto: string): string {
    return texto.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function eCaracterPalavra(caractere: string): boolean {
    return /[_a-zA-Z0-9]/.test(caractere);
}

function identificarOcorrenciasLinha(textoLinha: string, palavra: string): number[] {
    const ocorrencias: number[] = [];
    const regex = new RegExp(escaparRegex(palavra), 'g');
    let correspondencia: RegExpExecArray | null;

    while ((correspondencia = regex.exec(textoLinha)) !== null) {
        const indice = correspondencia.index;
        const antes = indice > 0 ? textoLinha[indice - 1] : '';
        const depois = textoLinha[indice + palavra.length] ?? '';

        if (!eCaracterPalavra(antes) && !eCaracterPalavra(depois)) {
            ocorrencias.push(indice);
        }
    }

    return ocorrencias;
}

function coletarEdicoesDocumento(
    documento: vscode.TextDocument,
    palavra: string,
    novoNome: string,
    edicoes: vscode.WorkspaceEdit
): void {
    for (let indiceLinha = 0; indiceLinha < documento.lineCount; indiceLinha++) {
        const textoLinha = documento.lineAt(indiceLinha).text;
        const ocorrencias = identificarOcorrenciasLinha(textoLinha, palavra);

        for (const coluna of ocorrencias) {
            const range = new vscode.Range(
                new vscode.Position(indiceLinha, coluna),
                new vscode.Position(indiceLinha, coluna + palavra.length)
            );
            edicoes.replace(documento.uri, range, novoNome);
        }
    }
}

export class DeleguaProvedorRenomeacao implements vscode.RenameProvider {
    prepareRename(
        documento: vscode.TextDocument,
        posicao: vscode.Position,
        _token: vscode.CancellationToken
    ): vscode.ProviderResult<vscode.Range | { range: vscode.Range; placeholder: string }> {
        const intervaloWord = documento.getWordRangeAtPosition(posicao, /[_a-zA-Z][_a-zA-Z0-9]*/);
        if (!intervaloWord) {
            return undefined;
        }

        const simbolo = documento.getText(intervaloWord);
        if (!simbolo) {
            return undefined;
        }

        return {
            range: intervaloWord,
            placeholder: simbolo,
        };
    }

    async provideRenameEdits(
        documento: vscode.TextDocument,
        posicao: vscode.Position,
        novoNome: string,
        _token: vscode.CancellationToken
    ): Promise<vscode.WorkspaceEdit | undefined> {
        if (!/^[_a-zA-Z][_a-zA-Z0-9]*$/.test(novoNome)) {
            throw new Error('Novo nome inválido para identificador Delégua.');
        }

        const intervaloWord = documento.getWordRangeAtPosition(posicao, /[_a-zA-Z][_a-zA-Z0-9]*/);
        if (!intervaloWord) {
            return undefined;
        }

        const palavra = documento.getText(intervaloWord);
        if (!palavra || palavra === novoNome) {
            return new vscode.WorkspaceEdit();
        }

        const edicoes = new vscode.WorkspaceEdit();
        coletarEdicoesDocumento(documento, palavra, novoNome, edicoes);

        const arquivos = await vscode.workspace.findFiles('**/*.{delegua,egua}', '**/node_modules/**');
        for (const arquivo of arquivos) {
            if (arquivo.toString() === documento.uri.toString()) {
                continue;
            }

            const documentoArquivo = await vscode.workspace.openTextDocument(arquivo);
            coletarEdicoesDocumento(documentoArquivo, palavra, novoNome, edicoes);
        }

        return edicoes;
    }
}