import * as vscode from 'vscode';

import { Classe, Const, Declaracao, FuncaoDeclaracao, Var } from '@designliquido/delegua/declaracoes';

import { primitivas, primitivasDicionarioFormatadas, primitivasNumeroFormatadas, primitivasTextoFormatadas, primitivasVetorFormatadas, funcoesNativasDelegua } from '../bibliotecas';
import { FuncaoNativaOuMetodoPrimitiva } from '../bibliotecas/tipos';
import { obterResultado } from '../analise-codigo/cache-analise';

/**
 * Provedor de assinatura de métodos de Delégua.
 */
export class DeleguaProvedorAssinaturaMetodos implements vscode.SignatureHelpProvider {
    /**
     * Calcula qual parâmetro está ativo baseado na posição do cursor
     */
    protected calcularParametroAtivo(textoAntesCursor: string): number {
        // Encontra a última abertura de parêntese
        const ultimoParentese = textoAntesCursor.lastIndexOf('(');
        if (ultimoParentese === -1) return 0;

        // Pega o texto dentro dos parênteses até o cursor
        const textoDentroParenteses = textoAntesCursor.substring(ultimoParentese + 1);
        
        // Conta as vírgulas para determinar qual parâmetro está ativo
        // Ignora vírgulas dentro de strings, parênteses aninhados, etc.
        let parametroAtivo = 0;
        let nivelParenteses = 0;
        let dentroString = false;
        let caracterString = '';

        for (let i = 0; i < textoDentroParenteses.length; i++) {
            const char = textoDentroParenteses[i];
            
            // Gerencia strings
            if ((char === '"' || char === "'") && (i === 0 || textoDentroParenteses[i - 1] !== '\\')) {
                if (!dentroString) {
                    dentroString = true;
                    caracterString = char;
                } else if (char === caracterString) {
                    dentroString = false;
                }
                continue;
            }

            // Se estamos dentro de uma string, ignora tudo
            if (dentroString) continue;

            // Gerencia parênteses aninhados
            if (char === '(') {
                nivelParenteses++;
            } else if (char === ')') {
                nivelParenteses--;
            }

            // Conta vírgulas apenas no nível superior
            if (char === ',' && nivelParenteses === 0) {
                parametroAtivo++;
            }
        }

        return parametroAtivo;
    }

    protected construirObjetoAssinatura(
        primitivaOuMetodoGlobal: FuncaoNativaOuMetodoPrimitiva,
        parametroAtivo?: number
    ): vscode.SignatureHelp {
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

        // Define qual parâmetro está ativo
        if (parametroAtivo !== undefined) {
            topicoAjuda.activeParameter = parametroAtivo;
            topicoAjuda.activeSignature = 0;
        }
        
        return topicoAjuda;
    }

    protected assinaturaParaChamadaMetodo(
        nomeObjeto: string,
        declaracoesPertinentes: { nome: string, tipo: string, declaracao: Declaracao }[],
        parametroAtivo?: number
    ): vscode.SignatureHelp | undefined {
        let tipoObjeto: string | undefined = undefined;

        const variavelOuConst = declaracoesPertinentes.find(
            (decl) => decl.nome === nomeObjeto
        );
        tipoObjeto = variavelOuConst?.tipo;

        if (tipoObjeto) {
            switch (tipoObjeto) {
                case 'dicionario':
                case 'dicionário':
                    const metodoDicionario = primitivasDicionarioFormatadas.find(m => m.nome === nomeObjeto);
                    if (metodoDicionario) {
                        return this.construirObjetoAssinatura(metodoDicionario, parametroAtivo);
                    }

                    return undefined;
                case 'numero':
                case 'número':
                    const metodoNumero = primitivasNumeroFormatadas.find(m => m.nome === nomeObjeto);
                    if (metodoNumero) {
                        return this.construirObjetoAssinatura(metodoNumero, parametroAtivo);
                    }

                    return undefined;
                case 'texto':
                    const metodoTexto = primitivasTextoFormatadas.find(m => m.nome === nomeObjeto);
                    if (metodoTexto) {
                        return this.construirObjetoAssinatura(metodoTexto, parametroAtivo);
                    }

                    return undefined;
                case 'vetor':
                    const metodoVetor = primitivasVetorFormatadas.find(m => m.nome === nomeObjeto);
                    if (metodoVetor) {
                        return this.construirObjetoAssinatura(metodoVetor, parametroAtivo);
                    }

                    return undefined;

                default:
                    const metodoQualquer = primitivas.find(m => m.nome === nomeObjeto);
                    if (metodoQualquer) {
                        return this.construirObjetoAssinatura(metodoQualquer, parametroAtivo);
                    }

                    return undefined;
                }
        }
    }

    protected assinaturaParaFuncaoDefinidaEmCodigo(
        declaracao: FuncaoDeclaracao,
        parametroAtivo?: number
    ) {
        const assinaturaFuncao = new vscode.SignatureHelp();

        const parametros = declaracao.funcao.parametros.map(parametro => ({
            nome: parametro.nome,
            // documentacao: parametro.documentacao || ''
        }));

        const subtipoMatch = declaracao.tipo?.match(/<\s*([^>]+)\s*>/);
        const subtipo = subtipoMatch ? subtipoMatch[1].trim() : 'qualquer';
        const assinaturaMetodo = new vscode.SignatureInformation(
            `${declaracao.simbolo.lexema}(${parametros.map(p => p.nome.lexema).join(', ')})`,
            new vscode.MarkdownString(
                (declaracao.tipo ? `Retorna: ${subtipo}\n\n` : '') +
                '```delegua\n' +
                `${declaracao.simbolo.lexema}(${parametros.map(p => p.nome.lexema).join(', ')})` +
                '\n```'
            )
        );

        assinaturaMetodo.parameters = [];
        for (let parametro of parametros) {
            assinaturaMetodo.parameters.push(
                new vscode.ParameterInformation(
                    parametro.nome.lexema,
                    new vscode.MarkdownString("")
                )
            );
        }

        assinaturaFuncao.signatures = [assinaturaMetodo];

        // Define qual parâmetro está ativo
        if (parametroAtivo !== undefined) {
            assinaturaFuncao.activeParameter = parametroAtivo;
            assinaturaFuncao.activeSignature = 0;
        }

        return assinaturaFuncao;
    }

    provideSignatureHelp(
        document: vscode.TextDocument, 
        position: vscode.Position, 
        token: vscode.CancellationToken, 
        context: vscode.SignatureHelpContext
    ): vscode.ProviderResult<vscode.SignatureHelp> {
        const regexMetodo = /([a-zA-Z_0-9]+)\(/gi;
        const linhaTexto = document.lineAt(position).text;
        const resultadoRegexFuncaoOuMetodo = regexMetodo.exec(linhaTexto);
        const textoAntesCursor = linhaTexto.substring(0, position.character);

        if (!resultadoRegexFuncaoOuMetodo) {
            return undefined;
        }

        // Calcula qual parâmetro está ativo baseado na posição do cursor
        const parametroAtivo = this.calcularParametroAtivo(textoAntesCursor);

        const resultadoAnalise = obterResultado(document.uri.toString());
        const declaracoesPertinentes: { nome: string, tipo: string, declaracao: Declaracao }[] = 
            resultadoAnalise?.avaliadorSintatico.declaracoes.flatMap((declaracao): { nome: string, tipo: string, declaracao: Declaracao }[] => {
                if (declaracao instanceof Var) {
                    return [{ nome: declaracao.simbolo.lexema, tipo: declaracao.tipo, declaracao: declaracao }];
                }

                if (declaracao instanceof Const) {
                    return [{ nome: declaracao.simbolo.lexema, tipo: declaracao.tipo, declaracao: declaracao }];
                }

                if (declaracao instanceof Classe) {
                    return [{ nome: declaracao.simbolo.lexema, tipo: declaracao.simbolo.lexema, declaracao: declaracao }];
                }

                if (declaracao instanceof FuncaoDeclaracao) {
                    return [{ nome: declaracao.simbolo.lexema, tipo: declaracao.tipo, declaracao: declaracao }];
                }

                return [];
            }) || [];

        const regexObjeto = /([a-zA-Z_0-9]+)\.\s*/;
        const resultadoObjeto = regexObjeto.exec(textoAntesCursor);

        // Primeiro caso: A `palavra` é um método de um objeto.
        if (resultadoObjeto) {
            return this.assinaturaParaChamadaMetodo(resultadoObjeto[1], declaracoesPertinentes, parametroAtivo);
        }

        // Segundo caso: A `palavra` é uma função definida em código.
        const possivelFuncaoDefinidaEmCodigo = declaracoesPertinentes.find(
            (decl) => decl.nome === resultadoRegexFuncaoOuMetodo[1] && decl.tipo.startsWith('função')
        );

        if (possivelFuncaoDefinidaEmCodigo) {
            const funcaoDeclaracao = possivelFuncaoDefinidaEmCodigo.declaracao as FuncaoDeclaracao;
            return this.assinaturaParaFuncaoDefinidaEmCodigo(funcaoDeclaracao, parametroAtivo);
        }
        
        // Terceiro caso: A `palavra` é uma função nativa global.
        const possivelFuncaoNativa: FuncaoNativaOuMetodoPrimitiva | undefined = funcoesNativasDelegua.find(
            (funcaoNativa) => funcaoNativa.nome === resultadoRegexFuncaoOuMetodo[1]
        );

        if (!possivelFuncaoNativa) {
            return undefined;    
        }
        
        return this.construirObjetoAssinatura(possivelFuncaoNativa, parametroAtivo);
    }
}
