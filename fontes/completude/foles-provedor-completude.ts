import * as vscode from 'vscode';

import modificadoresFoles from '../linguagens/foles/modificadores';

export class FolesProvedorCompletude implements vscode.CompletionItemProvider {

    provideCompletionItems(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken, context: vscode.CompletionContext): vscode.ProviderResult<vscode.CompletionList<vscode.CompletionItem> | vscode.CompletionItem[]> 
    {
        const todosModificadores: vscode.CompletionItem[] = [];
        for (let [chave, valor] of Object.entries(modificadoresFoles)) {
            let item = new vscode.CompletionItem(chave, vscode.CompletionItemKind.Property);
            item.documentation = `Equivalente em CSS: ${valor.nomeCss}`;
            todosModificadores.push(item);
        }
        return todosModificadores;
    }
}