import * as vscode from 'vscode';
import { CompletionItem, InsertTextFormat } from 'vscode-languageserver-types';
import { proverItensCompletude, DocumentoLSP } from '@designliquido/delegua-lsp';

import { ParametroDetectado } from '../interfaces/completude';

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

function converterItemCompletude(item: CompletionItem): vscode.CompletionItem {
    const vsItem = new vscode.CompletionItem(
        item.label as string,
        item.kind !== undefined ? (item.kind - 1) as vscode.CompletionItemKind : undefined
    );
    if (item.documentation) {
        const doc = item.documentation as any;
        vsItem.documentation = new vscode.MarkdownString(doc.value ?? String(item.documentation));
    }
    if (item.detail) vsItem.detail = item.detail;
    if (item.insertText) {
        vsItem.insertText = item.insertTextFormat === InsertTextFormat.Snippet
            ? new vscode.SnippetString(item.insertText as string)
            : item.insertText as string;
    }
    if (item.sortText) vsItem.sortText = item.sortText;
    return vsItem;
}

export class DeleguaProvedorCompletude implements vscode.CompletionItemProvider {
    private _documento: vscode.TextDocument | null = null;
    private _posicao: vscode.Position | null = null;

    provideCompletionItems(
        documento: vscode.TextDocument,
        posicao: vscode.Position,
        _token: vscode.CancellationToken
    ): vscode.CompletionItem[] {
        this._documento = documento;
        this._posicao = posicao;

        const texto = documento.getText();
        const deslocamento = documento.offsetAt(posicao);
        const textoAntesPosicao = texto.substring(0, deslocamento);
        const correspondencia = textoAntesPosicao.match(/(\w+)\s*\.\s*$/);
        const palavraAntesPonto = correspondencia ? correspondencia[1] : null;

        return this.completudesParaDelegua(textoAntesPosicao, palavraAntesPonto, [], undefined);
    }

    protected completudesParaDelegua(
        _textoAntesPosicao: string,
        _palavraAntesPonto: string | null,
        _parametrosDetectados: ParametroDetectado[],
        _declaracaoCorrespondente: { nome: string; tipo: string } | undefined
    ): vscode.CompletionItem[] {
        if (!this._documento || !this._posicao) return [];
        const lspDoc = documentoParaLsp(this._documento);
        const lspPos = { line: this._posicao.line, character: this._posicao.character };
        return proverItensCompletude(lspDoc, lspPos).map(converterItemCompletude);
    }
}
