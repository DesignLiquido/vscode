import * as vscode from 'vscode';

import {
    calendarioPortugolStudio,
    constantesPortugolStudio,
    matematicaPortugolStudio,
    palavrasReservadasPortugolStudio,
    primitivasEntradaSaidaPortugolStudio,
    textoPortugolStudio,
    tiposPortugolStudio,
    utilPortugolStudio,
} from '../bibliotecas/dialetos/portugol-studio';

/**
 * Classe de provedor de completude do Portugol Studio.
 * Gera todos os elementos de sugestão de código enquanto o/a
 * desenvolvedor/a edita código em Portugol Studio, pressionando caracteres como
 * ponto e Ctrl + espaço.
 */
export class PortugolStudioProvedorCompletude
    implements vscode.CompletionItemProvider
{
    provideCompletionItems(
        document: vscode.TextDocument,
        position: vscode.Position,
        token: vscode.CancellationToken,
        context: vscode.CompletionContext
    ): vscode.ProviderResult<
        vscode.CompletionList<vscode.CompletionItem> | vscode.CompletionItem[]
    > {
        return calendarioPortugolStudio
            .map((funcaoNativa) => {
                let completionItem = new vscode.CompletionItem(
                    funcaoNativa.nome,
                    vscode.CompletionItemKind.Function
                );
                completionItem.documentation = funcaoNativa.documentacao;
                return completionItem;
            })
            .concat(
                matematicaPortugolStudio.map((funcaoNativa) => {
                    let completionItem = new vscode.CompletionItem(
                        funcaoNativa.nome,
                        vscode.CompletionItemKind.Function
                    );
                    completionItem.documentation = funcaoNativa.documentacao;
                    return completionItem;
                })
            )
            .concat(
                textoPortugolStudio.map((funcaoNativa) => {
                    let completionItem = new vscode.CompletionItem(
                        funcaoNativa.nome,
                        vscode.CompletionItemKind.Function
                    );
                    completionItem.documentation = funcaoNativa.documentacao;
                    return completionItem;
                })
            )
            .concat(
                utilPortugolStudio.map((funcaoNativa) => {
                    let completionItem = new vscode.CompletionItem(
                        funcaoNativa.nome,
                        vscode.CompletionItemKind.Function
                    );
                    completionItem.documentation = funcaoNativa.documentacao;
                    return completionItem;
                })
            )
            .concat(
                primitivasEntradaSaidaPortugolStudio.map((comando) => {
                    let completionItem = new vscode.CompletionItem(
                        comando.nome,
                        vscode.CompletionItemKind.Function
                    );
                    completionItem.documentation = comando.documentacao;
                    return completionItem;
                })
            )
            .concat(
                tiposPortugolStudio.map((tipo) => {
                    let completionItem = new vscode.CompletionItem(
                        tipo.nome,
                        vscode.CompletionItemKind.Keyword
                    );
                    completionItem.documentation = tipo.documentacao;
                    return completionItem;
                })
            )
            .concat(
                constantesPortugolStudio.map((constante) => {
                    let completionItem = new vscode.CompletionItem(
                        constante.nome,
                        vscode.CompletionItemKind.Constant
                    );
                    completionItem.documentation = constante.documentacao;
                    return completionItem;
                })
            )
            .concat(
                palavrasReservadasPortugolStudio.map((palavraReservada) => {
                    let completionItem = new vscode.CompletionItem(
                        palavraReservada.nome,
                        vscode.CompletionItemKind.Keyword
                    );
                    completionItem.documentation = palavraReservada.documentacao;
                    return completionItem;
                })
            );
    }
}
