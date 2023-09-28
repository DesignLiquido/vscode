import * as vscode from 'vscode';

import modificadoresLmht from '../linguagens/lmht/estruturas';

export class LmhtProvedorCompletude implements vscode.CompletionItemProvider {

    provideCompletionItems(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken, context: vscode.CompletionContext): vscode.ProviderResult<vscode.CompletionList<vscode.CompletionItem> | vscode.CompletionItem[]> 
    {
        const todosModificadores: vscode.CompletionItem[] = [];
        for (let [chave, valor] of Object.entries(modificadoresLmht)) {
            let item = new vscode.CompletionItem(chave, vscode.CompletionItemKind.Property);
            item.documentation = `Equivalente em HTML: ${valor.nomeHtml}`;
            todosModificadores.push(item);
        }
        return todosModificadores;
    }
}