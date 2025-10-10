import * as vscode from 'vscode';

import primitivas from '../primitivas';
import { PrimitivaOuMetodo } from '../primitivas/tipos';

/**
 * Provedor de assinatura de métodos de Delégua.
 */
export class DeleguaProvedorAssinaturaMetodos implements vscode.SignatureHelpProvider {
    provideSignatureHelp(
        document: vscode.TextDocument, 
        position: vscode.Position, 
        token: vscode.CancellationToken, 
        context: vscode.SignatureHelpContext
    ): vscode.ProviderResult<vscode.SignatureHelp> {
        const regexMetodo = /([a-zA-Z_0-9]+)\(/gi;
        const intervalo = document.getWordRangeAtPosition(position, regexMetodo);
        const palavra = document.getText(intervalo);
        const resultadoRegex = regexMetodo.exec(palavra);

        if (!resultadoRegex) {
            return undefined;
        }

        const primitivaOuMetodoGlobal: PrimitivaOuMetodo | undefined = primitivas.find(
            (primitiva) => primitiva.nome === resultadoRegex[1]
        );

        if (primitivaOuMetodoGlobal === undefined) {
            return undefined;    
        }

        const topicoAjuda = new vscode.SignatureHelp();
        topicoAjuda.signatures = [];
        
        for (let assinatura of primitivaOuMetodoGlobal.assinaturas || []) {
            const assinaturaMetodo = new vscode.SignatureInformation(
                assinatura.formato, 
                new vscode.MarkdownString(primitivaOuMetodoGlobal.documentacao)
            );

            assinaturaMetodo.parameters = [];
            for (let parametro of assinatura.parametros) {
                assinaturaMetodo.parameters.push(
                    new vscode.ParameterInformation(
                        parametro.nome,
                        new vscode.MarkdownString(parametro.documentacao)
                    )
                );
            }

            topicoAjuda.signatures.push(assinaturaMetodo);
        }
        
        return topicoAjuda;
    }
}
