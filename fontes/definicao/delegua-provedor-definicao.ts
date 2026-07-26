import * as vscode from 'vscode';
import { proverDefinicao, DocumentoLSPInterface } from '@designliquido/delegua-lsp';

import { ambienteVscode } from '../ambiente/ambiente-vscode';

function documentoParaLsp(documento: vscode.TextDocument): DocumentoLSPInterface {
    return {
        uri: documento.uri.toString(),
        nomeArquivo: documento.fileName,
        texto: documento.getText(),
        linhas: documento.getText().split('\n'),
        versao: documento.version,
        languageId: documento.languageId,
    };
}

export class DeleguaProvedorDefinicao implements vscode.DefinitionProvider {
    provideDefinition(
        documento: vscode.TextDocument,
        posicao: vscode.Position,
        _token: vscode.CancellationToken
    ): vscode.Location | undefined {
        const resultado = proverDefinicao(
            documentoParaLsp(documento),
            { line: posicao.line, character: posicao.character },
            ambienteVscode
        );
        if (!resultado) return undefined;
        return new vscode.Location(
            vscode.Uri.parse(resultado.uri),
            new vscode.Range(
                resultado.range.start.line,
                resultado.range.start.character,
                resultado.range.end.line,
                resultado.range.end.character
            )
        );
    }
}
