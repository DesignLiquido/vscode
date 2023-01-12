import * as vscode from 'vscode';

/**
 * Classe de provedor de completude de Delégua. 
 * Gera todos os elementos de sugestão de código enquanto o/a
 * desenvolvedor/a edita código em Delégua, pressionando caracteres como
 * ponto e Ctrl + espaço.
 */
export class DeleguaProvedorCompletude implements vscode.CompletionItemProvider {
    provideCompletionItems(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken, context: vscode.CompletionContext): vscode.ProviderResult<vscode.CompletionList<vscode.CompletionItem> | vscode.CompletionItem[]> {
        const aleatorio = new vscode.CompletionItem(
            'aleatorio',
            vscode.CompletionItemKind.Function
        );
        aleatorio.documentation =
            'Retorna um número aleatório entre 0 e 1.';

        return [
            aleatorio,
            new vscode.CompletionItem(
                'aleatorioEntre',
                vscode.CompletionItemKind.Function
            ),
            new vscode.CompletionItem(
                'texto',
                vscode.CompletionItemKind.Function
            ),
        ];
    }
}
