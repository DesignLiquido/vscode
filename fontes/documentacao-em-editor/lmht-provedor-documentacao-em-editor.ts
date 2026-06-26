import * as vscode from 'vscode';

import modificadoresLmht from '../linguagens/lmht/estruturas';
import atributosLmht from '../linguagens/lmht/atributos';
import atributosPorEstrutura from '../linguagens/lmht/atributos-por-estrutura';

/**
 * Provedor de documentação para "hover" (ponteiro do _mouse_ por cima do elemento de código.)
 * para LMHT.
 */
export class LmhtProvedorDocumentacaoEmEditor
    implements vscode.HoverProvider
{
    // Detecta o nome da estrutura LMHT que contém a posição do cursor.
    // Varre a linha atual (e até 5 linhas anteriores) para trás em busca
    // de uma abertura de tag que ainda não foi fechada.
    private obterEstruturaNaLinha(
        document: vscode.TextDocument,
        position: vscode.Position
    ): string | undefined {
        for (let numLinha = position.line; numLinha >= Math.max(0, position.line - 5); numLinha--) {
            const limite = numLinha === position.line
                ? position.character
                : document.lineAt(numLinha).text.length;
            const trecho = document.lineAt(numLinha).text.substring(0, limite);
            // Corresponde a <nome-estrutura seguido de atributos, sem fechar com >
            const correspondencia = trecho.match(/<([a-zA-Z0-9À-ž\-]+)[^<>]*$/);
            if (correspondencia) {
                return correspondencia[1];
            }
        }
        return undefined;
    }

    provideHover(
        document: vscode.TextDocument,
        position: vscode.Position,
        token: vscode.CancellationToken
    ): vscode.ProviderResult<vscode.Hover> {
        const intervalo = document.getWordRangeAtPosition(position, /[a-zA-Z0-9À-ž\-]+/);
        const palavra = document.getText(intervalo);

        const modificador = modificadoresLmht[palavra];
        if (modificador) {
            const elementoDocumentacao = new vscode.MarkdownString(modificador.documentacao);
            elementoDocumentacao.appendCodeblock(modificador.exemploCodigo);
            return new vscode.Hover(elementoDocumentacao);
        }

        const nomeEstrutura = this.obterEstruturaNaLinha(document, position);
        const atributoContextual = nomeEstrutura
            ? atributosPorEstrutura[nomeEstrutura]?.[palavra]
            : undefined;
        const atributo = atributoContextual ?? atributosLmht[palavra];

        if (!atributo) { return undefined; }

        const elementoDocumentacao = new vscode.MarkdownString(atributo.documentacao);
        elementoDocumentacao.appendCodeblock(atributo.exemploCodigo);
        return new vscode.Hover(elementoDocumentacao);
    }
}
