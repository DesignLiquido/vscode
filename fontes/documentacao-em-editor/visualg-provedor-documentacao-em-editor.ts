import * as vscode from 'vscode';

import { 
    estruturasDados,
    primitivasCaracteresVisuAlg, 
    primitivasEntradaSaidaVisuAlg, 
    primitivasNumeroVisuAlg 
} from '../primitivas/dialetos/visualg';

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

        const estruturaDados = estruturasDados.find(
            (estrutura) => estrutura.nome === palavra
        );

        if (estruturaDados) {
            const documentacaoElemento = new vscode.MarkdownString(estruturaDados.documentacao);
            if (estruturaDados.exemploCodigo) {
                documentacaoElemento.appendCodeblock(estruturaDados.exemploCodigo);
            }
            
            return new vscode.Hover(documentacaoElemento);
        }

        const primitivaCaracter = primitivasCaracteresVisuAlg.find(
            (primitiva) => primitiva.nome === palavra
        );

        if (primitivaCaracter) {
            const documentacaoElemento = new vscode.MarkdownString(primitivaCaracter.documentacao);
            if (primitivaCaracter.exemploCodigo) {
                documentacaoElemento.appendCodeblock(primitivaCaracter.exemploCodigo);
            }
            
            return new vscode.Hover(documentacaoElemento);
        }

        const primitivaNumero = primitivasNumeroVisuAlg.find(
            (primitiva) => primitiva.nome === palavra
        );

        if (primitivaNumero) {
            const documentacaoElemento = new vscode.MarkdownString(primitivaNumero.documentacao);
            if (primitivaNumero.exemploCodigo) {
                documentacaoElemento.appendCodeblock(primitivaNumero.exemploCodigo);
            }

            return new vscode.Hover(documentacaoElemento);
        }

        const primitivaEntradaSaida = primitivasEntradaSaidaVisuAlg.find(
            (primitiva) => primitiva.nome === palavra
        );

        if (primitivaEntradaSaida) {
            const documentacaoElemento = new vscode.MarkdownString(primitivaEntradaSaida.documentacao);
            if (primitivaEntradaSaida.exemploCodigo) {
                documentacaoElemento.appendCodeblock(primitivaEntradaSaida.exemploCodigo);
            }

            return new vscode.Hover(documentacaoElemento);
        }

        return new vscode.Hover('');
    }
}
