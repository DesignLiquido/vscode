import * as vscode from 'vscode';
import { primitivasNumero } from './primitivas-numero';
import { primitivasTexto } from './primitivas-texto';
import { primitivasVetor } from './primitivas-vetor';

/**
 * Classe de provedor de completude de Delégua. 
 * Gera todos os elementos de sugestão de código enquanto o/a
 * desenvolvedor/a edita código em Delégua, pressionando caracteres como
 * ponto e Ctrl + espaço.
 */
export class DeleguaProvedorCompletude implements vscode.CompletionItemProvider {

    provideCompletionItems(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken, context: vscode.CompletionContext): vscode.ProviderResult<vscode.CompletionList<vscode.CompletionItem> | vscode.CompletionItem[]> {
        return [...primitivasNumero, ...primitivasTexto, ...primitivasVetor].map(funcaoNativa => {
            let completionItem = new vscode.CompletionItem(funcaoNativa.nome, vscode.CompletionItemKind.Function)
            completionItem.documentation = funcaoNativa.documentacao;
            return completionItem;
        })
    }
}
