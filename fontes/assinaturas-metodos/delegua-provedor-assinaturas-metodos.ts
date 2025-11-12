import * as vscode from 'vscode';

import { Const, Var } from '@designliquido/delegua/declaracoes';

import { primitivas, primitivasDicionarioFormatadas, primitivasNumeroFormatadas, primitivasTextoFormatadas, primitivasVetorFormatadas, funcoesNativasDelegua } from '../bibliotecas';
import { FuncaoNativaOuMetodoPrimitiva } from '../bibliotecas/tipos';
import { obterResultado } from '../analise-codigo/cache-analise';

/**
 * Provedor de assinatura de métodos de Delégua.
 */
export class DeleguaProvedorAssinaturaMetodos implements vscode.SignatureHelpProvider {
    protected construirObjetoAssinatura(primitivaOuMetodoGlobal: FuncaoNativaOuMetodoPrimitiva): vscode.SignatureHelp {
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

    provideSignatureHelp(
        document: vscode.TextDocument, 
        position: vscode.Position, 
        token: vscode.CancellationToken, 
        context: vscode.SignatureHelpContext
    ): vscode.ProviderResult<vscode.SignatureHelp> {
        const regexMetodo = /([a-zA-Z_0-9]+)\(/gi;
        const linhaTexto = document.lineAt(position).text;
        const resultadoRegex = regexMetodo.exec(linhaTexto);
        const textoAntesCursor = linhaTexto.substring(0, position.character);

        if (!resultadoRegex) {
            return undefined;
        }

        const resultadoAnalise = obterResultado(document.uri.toString());
        const todasAsVariaveisOuConstantes = resultadoAnalise?.avaliadorSintatico.declaracoes.flatMap(declaracao => {
            if (declaracao instanceof Var) {
                return [{ nome: declaracao.simbolo.lexema, tipo: declaracao.tipo }];
            }

            if (declaracao instanceof Const) {
                return [{ nome: declaracao.simbolo.lexema, tipo: declaracao.tipo }];
            }

            return [];
        }) || [];

        const regexObjeto = /([a-zA-Z_0-9]+)\.\s*/;
        const resultadoObjeto = regexObjeto.exec(textoAntesCursor);

        let tipoObjeto: string | undefined = undefined;
        let nomeObjeto: string | undefined = undefined;
        if (resultadoObjeto) {
            nomeObjeto = resultadoObjeto[1];
            const variavelOuConst = todasAsVariaveisOuConstantes.find(
                (decl) => decl.nome === nomeObjeto
            );
            tipoObjeto = variavelOuConst?.tipo;
        }

        // Primeiro caso: A `palavra` é um método de um objeto.
        if (tipoObjeto) {
            switch (tipoObjeto) {
                case 'dicionario':
                case 'dicionário':
                    const metodoDicionario = primitivasDicionarioFormatadas.find(m => m.nome === resultadoRegex[1]);
                    if (metodoDicionario) {
                        return this.construirObjetoAssinatura(metodoDicionario);
                    }

                    return undefined;
                case 'numero':
                case 'número':
                    const metodoNumero = primitivasNumeroFormatadas.find(m => m.nome === resultadoRegex[1]);
                    if (metodoNumero) {
                        return this.construirObjetoAssinatura(metodoNumero);
                    }

                    return undefined;
                case 'texto':
                    const metodoTexto = primitivasTextoFormatadas.find(m => m.nome === resultadoRegex[1]);
                    if (metodoTexto) {
                        return this.construirObjetoAssinatura(metodoTexto);
                    }

                    return undefined;
                case 'vetor':
                    const metodoVetor = primitivasVetorFormatadas.find(m => m.nome === resultadoRegex[1]);
                    if (metodoVetor) {
                        return this.construirObjetoAssinatura(metodoVetor);
                    }

                    return undefined;

                default:
                    const metodoQualquer = primitivas.find(m => m.nome === resultadoRegex[1]);
                    if (metodoQualquer) {
                        return this.construirObjetoAssinatura(metodoQualquer);
                    }

                    return undefined;
                }
        }

        const possivelFuncaoNativa: FuncaoNativaOuMetodoPrimitiva | undefined = funcoesNativasDelegua.find(
            (funcaoNativa) => funcaoNativa.nome === resultadoRegex[1]
        );

        if (!possivelFuncaoNativa) {
            return undefined;    
        }
        
        return this.construirObjetoAssinatura(possivelFuncaoNativa);
    }
}
