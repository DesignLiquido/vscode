import * as vscode from 'vscode';
import listaModificadores from '@designliquido/foles/extensao/lista-modificadores';
import { DicionarioEstruturasLmht } from '@designliquido/foles/estruturas/dicionario-estruturas-lmht';

export class FolesProvedorCompletude implements vscode.CompletionItemProvider {

    private profundidadeNaCursorPosition(document: vscode.TextDocument, position: vscode.Position): number {
        const textoCompleto = document.getText();
        const linhas = textoCompleto.split('\n');
        let offset = 0;
        for (let i = 0; i < position.line; i++) {
            offset += linhas[i].length + 1;
        }
        offset += position.character;
        const trecho = textoCompleto.substring(0, offset);
        let profundidade = 0;
        for (const char of trecho) {
            if (char === '{') profundidade++;
            else if (char === '}') profundidade--;
        }
        return profundidade;
    }

    private itensSeletoresLmht(): vscode.CompletionItem[] {
        const itens: vscode.CompletionItem[] = [];
        for (const [chave, Classe] of Object.entries(DicionarioEstruturasLmht)) {
            const item = new vscode.CompletionItem(chave, vscode.CompletionItemKind.Interface);
            const instancia = new (Classe as any)();
            item.documentation = `Equivalente em HTML: <${instancia.tagHtml}>`;
            itens.push(item);
        }
        return itens;
    }

    provideCompletionItems(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken, context: vscode.CompletionContext): vscode.ProviderResult<vscode.CompletionList<vscode.CompletionItem> | vscode.CompletionItem[]>
    {
        const itens: vscode.CompletionItem[] = this.itensSeletoresLmht();

        if (this.profundidadeNaCursorPosition(document, position) > 0) {
            for (const [chave, valor] of Object.entries(listaModificadores)) {
                const item = new vscode.CompletionItem(chave, vscode.CompletionItemKind.Property);
                item.documentation = `Equivalente em CSS: ${valor.nomeCss}`;
                itens.push(item);
            }
        }

        return itens;
    }
}