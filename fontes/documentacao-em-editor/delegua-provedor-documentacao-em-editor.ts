import * as vscode from 'vscode';

import { Const, Var } from '@designliquido/delegua/declaracoes';

import { obterResultado } from '../analise-codigo/cache-analise';
import { 
    funcoesNativasDelegua,
    primitivas, 
    primitivasDicionarioFormatadas, 
    primitivasNumeroFormatadas, 
    primitivasTextoFormatadas, 
    primitivasVetorFormatadas 
} from '../bibliotecas';

/**
 * Provedor de documentação para `hover` (ponteiro do _mouse_ por cima do elemento de código.)
 */
export class DeleguaProvedorDocumentacaoEmEditor
    implements vscode.HoverProvider 
{
    provideHover(
        documento: vscode.TextDocument,
        posicao: vscode.Position,
        token: vscode.CancellationToken
    ): vscode.ProviderResult<vscode.Hover> {
        const resultadoAnalise = obterResultado(documento.uri.toString());
        const intervalo = documento.getWordRangeAtPosition(posicao);
        const palavra = documento.getText(intervalo);
        const linhaTexto = documento.lineAt(posicao).text;
        const textoAntesPosicao = linhaTexto.substring(0, posicao.character);

        const todasAsVariaveisOuConstantes = resultadoAnalise?.avaliadorSintatico.declaracoes.flatMap(declaracao => {
            if (declaracao instanceof Var) {
                return [{ nome: declaracao.simbolo.lexema, tipo: declaracao.tipo }];
            }

            if (declaracao instanceof Const) {
                return [{ nome: declaracao.simbolo.lexema, tipo: declaracao.tipo }];
            }

            return [];
        }) || [];

        // Primeira tentativa: Há um ponto antes da `palavra`. Portanto, é uma chamada de método.
        const cadeiaTokens = textoAntesPosicao.trim().split(/[\s\(\)\[\]\{\};]+/).pop()?.split('.');
        if (cadeiaTokens && cadeiaTokens.length >= 2) {
            const objeto = cadeiaTokens[cadeiaTokens.length - 2];

            const declaracao = todasAsVariaveisOuConstantes.find(d => d.nome === objeto);
            if (declaracao) {
                const tipo = declaracao.tipo;
                switch (tipo) {
                    case 'dicionario':
                    case 'dicionário':
                        const metodoDicionario = primitivasDicionarioFormatadas.find(m => m.nome === palavra);
                        if (metodoDicionario) {
                            const documentacaoElemento = new vscode.MarkdownString(metodoDicionario.documentacao);
                            if (metodoDicionario.exemploCodigo) {
                                documentacaoElemento.appendCodeblock(metodoDicionario.exemploCodigo, 'delegua');
                            }
                            return new vscode.Hover(documentacaoElemento);
                        }

                        return undefined;
                    case 'numero':
                    case 'número':
                        const metodoNumero = primitivasNumeroFormatadas.find(m => m.nome === palavra);
                        if (metodoNumero) {
                            const documentacaoElemento = new vscode.MarkdownString(metodoNumero.documentacao);
                            if (metodoNumero.exemploCodigo) {
                                documentacaoElemento.appendCodeblock(metodoNumero.exemploCodigo, 'delegua');
                            }
                            return new vscode.Hover(documentacaoElemento);
                        }

                        return undefined;
                    case 'texto':
                        const metodoTexto = primitivasTextoFormatadas.find(m => m.nome === palavra);
                        if (metodoTexto) {
                            const documentacaoElemento = new vscode.MarkdownString(metodoTexto.documentacao);
                            if (metodoTexto.exemploCodigo) {
                                documentacaoElemento.appendCodeblock(metodoTexto.exemploCodigo, 'delegua');
                            }
                            return new vscode.Hover(documentacaoElemento);
                        }

                        return undefined;
                    case 'vetor':
                    case 'dicionario[]':
                    case 'dicionário[]':
                    case 'numero[]':
                    case 'número[]':
                    case 'logico[]':
                    case 'lógico[]':
                    case 'qualquer[]':
                    case 'texto[]':
                        const metodoVetor = primitivasVetorFormatadas.find(m => m.nome === palavra);
                        if (metodoVetor) {
                            const documentacaoElemento = new vscode.MarkdownString(metodoVetor.documentacao);
                            if (metodoVetor.exemploCodigo) {
                                documentacaoElemento.appendCodeblock(metodoVetor.exemploCodigo, 'delegua');
                            }
                            return new vscode.Hover(documentacaoElemento);
                        }

                        return undefined;
                    default:
                        const metodoGlobal = primitivas.find(m => m.nome === palavra);
                        if (metodoGlobal) {
                            const documentacaoElemento = new vscode.MarkdownString(metodoGlobal.documentacao);
                            if (metodoGlobal.exemploCodigo) {
                                documentacaoElemento.appendCodeblock(metodoGlobal.exemploCodigo, 'delegua');
                            }
                            return new vscode.Hover(documentacaoElemento);
                        }

                        return undefined;
                }
            }
        }

        // Segunda tentativa: A `palavra` é uma função nativa.
        const funcaoNativa = funcoesNativasDelegua.find(f => f.nome === palavra);
        if (funcaoNativa) {
            const documentacaoElemento = new vscode.MarkdownString(funcaoNativa.documentacao);
            if (funcaoNativa.exemploCodigo) {
                documentacaoElemento.appendCodeblock(funcaoNativa.exemploCodigo, 'delegua');
            }
            
            return new vscode.Hover(documentacaoElemento);
        }

        // Terceira tentativa: variáveis ou constantes declaradas no código.
        const variavelOuConstanteCorrespondente = todasAsVariaveisOuConstantes.find(declaracao => declaracao.nome === palavra);

        if (variavelOuConstanteCorrespondente) {
            const documentacaoElemento = new vscode.MarkdownString(`**${variavelOuConstanteCorrespondente.nome}**: \`${variavelOuConstanteCorrespondente.tipo}\``);
            return new vscode.Hover(documentacaoElemento);
        }

        return undefined;
    }
}
