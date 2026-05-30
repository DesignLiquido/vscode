import * as vscode from 'vscode';
import { provideReferences, DocumentoLSP } from '@designliquido/delegua-lsp';

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

export class DeleguaProvedorReferencias implements vscode.ReferenceProvider {
    provideReferences(
        documento: vscode.TextDocument,
        posicao: vscode.Position,
        contexto: vscode.ReferenceContext,
        _token: vscode.CancellationToken
    ): vscode.Location[] {
        const pastaWorkspace = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath || '';
        const resultados = provideReferences(
            documentoParaLsp(documento),
            { line: posicao.line, character: posicao.character },
            contexto.includeDeclaration,
            pastaWorkspace
        );
        return resultados.map(loc =>
            new vscode.Location(
                vscode.Uri.parse(loc.uri),
                new vscode.Range(
                    loc.range.start.line,
                    loc.range.start.character,
                    loc.range.end.line,
                    loc.range.end.character
                )
            )
        );
    }
}
