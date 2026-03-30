import * as vscode from 'vscode';

import {
    calendarioPortugolStudio,
    matematicaPortugolStudio,
    textoPortugolStudio,
    utilPortugolStudio,
} from '../bibliotecas/dialetos/portugol-studio';

/**
 * Provedor de documentação para "hover" (ponteiro do _mouse_ por cima do elemento de código.)
 */
export class PortugolStudioProvedorDocumentacaoEmEditor
    implements vscode.HoverProvider
{
    provideHover(
        document: vscode.TextDocument,
        position: vscode.Position,
        token: vscode.CancellationToken
    ): vscode.ProviderResult<vscode.Hover> {
        const intervalo = document.getWordRangeAtPosition(position);
        const palavra = document.getText(intervalo);

        const funcaoCalendario = calendarioPortugolStudio.find(
            (funcao) => funcao.nome === palavra
        );

        if (funcaoCalendario) {
            const documentacaoElemento = new vscode.MarkdownString(
                funcaoCalendario.documentacao
            );
            if (funcaoCalendario.exemploCodigo) {
                documentacaoElemento.appendCodeblock(
                    funcaoCalendario.exemploCodigo
                );
            }

            return new vscode.Hover(documentacaoElemento);
        }

        const funcaoMatematica = matematicaPortugolStudio.find(
            (funcao) => funcao.nome === palavra
        );

        if (funcaoMatematica) {
            const documentacaoElemento = new vscode.MarkdownString(
                funcaoMatematica.documentacao
            );
            if (funcaoMatematica.exemploCodigo) {
                documentacaoElemento.appendCodeblock(
                    funcaoMatematica.exemploCodigo
                );
            }

            return new vscode.Hover(documentacaoElemento);
        }

        const funcaoTexto = textoPortugolStudio.find(
            (funcao) => funcao.nome === palavra
        );

        if (funcaoTexto) {
            const documentacaoElemento = new vscode.MarkdownString(
                funcaoTexto.documentacao
            );
            if (funcaoTexto.exemploCodigo) {
                documentacaoElemento.appendCodeblock(funcaoTexto.exemploCodigo);
            }

            return new vscode.Hover(documentacaoElemento);
        }

        const funcaoUtil = utilPortugolStudio.find(
            (funcao) => funcao.nome === palavra
        );

        if (funcaoUtil) {
            const documentacaoElemento = new vscode.MarkdownString(
                funcaoUtil.documentacao
            );
            if (funcaoUtil.exemploCodigo) {
                documentacaoElemento.appendCodeblock(funcaoUtil.exemploCodigo);
            }

            return new vscode.Hover(documentacaoElemento);
        }

        return undefined;
    }
}
