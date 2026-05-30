import * as vscode from 'vscode';
import { prepareRename, provideRenameEdits, DocumentoLSP } from '@designliquido/delegua-lsp';

function documentoParaLsp(documento: vscode.TextDocument): DocumentoLSP {
    return {
        uri: documento.uri.toString(),
        nomeArquivo: documento.fileName,
        texto: documento.getText(),
        linhas: documento.getText().split('\n'),
        versao: documento.version,
        languageId: documento.languageId,
    };
}

export class DeleguaProvedorRenomeacao implements vscode.RenameProvider {
    prepareRename(
        documento: vscode.TextDocument,
        posicao: vscode.Position,
        _token: vscode.CancellationToken
    ): vscode.ProviderResult<vscode.Range | { range: vscode.Range; placeholder: string }> {
        const lspRange = prepareRename(
            documentoParaLsp(documento),
            { line: posicao.line, character: posicao.character }
        );
        if (!lspRange) return undefined;
        const range = new vscode.Range(
            lspRange.start.line,
            lspRange.start.character,
            lspRange.end.line,
            lspRange.end.character
        );
        return {
            range,
            placeholder: documento.getText(range),
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

        const pastaWorkspace = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath || '';
        const resultado = provideRenameEdits(
            documentoParaLsp(documento),
            { line: posicao.line, character: posicao.character },
            novoNome,
            pastaWorkspace
        );
        if (!resultado) return undefined;

        const edicoes = new vscode.WorkspaceEdit();
        for (const [uri, textEdits] of Object.entries(resultado.changes ?? {})) {
            edicoes.set(
                vscode.Uri.parse(uri),
                textEdits.map(e => new vscode.TextEdit(
                    new vscode.Range(
                        e.range.start.line,
                        e.range.start.character,
                        e.range.end.line,
                        e.range.end.character
                    ),
                    e.newText
                ))
            );
        }
        return edicoes;
    }
}
