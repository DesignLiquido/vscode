import * as vscode from 'vscode';

import { primitivasCaracteresVisuAlg, primitivasNumeroVisuAlg } from '../primitivas/dialetos/visualg';

/**
 * Provedor de documentação para "hover" (ponteiro do _mouse_ por cima do elemento de código.)
 */
export class VisuAlgProvedorDocumentacaoEmEditor
    implements vscode.HoverProvider
{
    provideHover(
        document: vscode.TextDocument,
        position: vscode.Position,
        token: vscode.CancellationToken
    ): vscode.ProviderResult<vscode.Hover> {
        const intervalo = document.getWordRangeAtPosition(position);
        const palavra = document.getText(intervalo);

        let mapa = {
            
        };

        const primitivaCaracter = primitivasCaracteresVisuAlg.find(
            (primitiva) => primitiva.nome === palavra
        );

        if (primitivaCaracter) {
            return new vscode.Hover(primitivaCaracter.documentacao);
        }

        const primitivaNumero = primitivasNumeroVisuAlg.find(
            (primitiva) => primitiva.nome === palavra
        );

        if (primitivaNumero) {
            return new vscode.Hover(primitivaNumero.documentacao);
        }

        return new vscode.Hover(mapa[palavra]);
    }
}
