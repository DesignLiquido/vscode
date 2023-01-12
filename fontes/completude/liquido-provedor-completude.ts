import * as vscode from 'vscode';

/**
 * Classe de provedor de completude de Líquido, ferramentário para a Internet. 
 * Gera todos os elementos de sugestão de código enquanto o/a
 * desenvolvedor/a edita código em arquivos específicos, como `configuracao.delegua`, 
 * pressionando caracteres como ponto e Ctrl + espaço.
 */
export class LiquidoProvedorCompletude implements vscode.CompletionItemProvider {
    provideCompletionItems(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken, context: vscode.CompletionContext): vscode.ProviderResult<vscode.CompletionList<vscode.CompletionItem> | vscode.CompletionItem[]> {
        const texto = document.lineAt(position).text;
        switch (texto) {
            case 'liquido.':
                return [
                    new vscode.CompletionItem(
                        'roteador',
                        vscode.CompletionItemKind.Interface
                    ),
                ];
        }

        return undefined;
    }
}