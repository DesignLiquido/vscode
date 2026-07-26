import * as vscode from 'vscode';

import { Classe, Const, Declaracao, FuncaoDeclaracao, Var } from '@designliquido/delegua/declaracoes';

import primitivasDicionario from '@designliquido/delegua/bibliotecas/primitivas-dicionario';
import primitivasNumero from '@designliquido/delegua/bibliotecas/primitivas-numero';
import primitivasTexto from '@designliquido/delegua/bibliotecas/primitivas-texto';
import primitivasVetor from '@designliquido/delegua/bibliotecas/primitivas-vetor';
import primitivasDicionarioPitugues from '@designliquido/delegua/bibliotecas/dialetos/pitugues/primitivas-dicionario';
import primitivasNumeroPitugues from '@designliquido/delegua/bibliotecas/dialetos/pitugues/primitivas-numero';
import primitivasTextoPitugues from '@designliquido/delegua/bibliotecas/dialetos/pitugues/primitivas-texto';
import primitivasVetorPitugues from '@designliquido/delegua/bibliotecas/dialetos/pitugues/primitivas-vetor';
import { formatarPrimitivas, funcoesNativasDelegua } from '../bibliotecas';
import { funcoesNativasPitugues } from '../bibliotecas/dialetos/pitugues';
import { FuncaoNativaOuMetodoPrimitiva } from '../bibliotecas/tipos';

const primitivasDicionarioFormatadas = formatarPrimitivas(primitivasDicionario);
const primitivasNumeroFormatadas = formatarPrimitivas(primitivasNumero);
const primitivasTextoFormatadas = formatarPrimitivas(primitivasTexto);
const primitivasVetorFormatadas = formatarPrimitivas(primitivasVetor);
const ordenarPorNome = (a: FuncaoNativaOuMetodoPrimitiva, b: FuncaoNativaOuMetodoPrimitiva) => {
    const nome1 = a.nome.toUpperCase();
    const nome2 = b.nome.toUpperCase();
    return nome1 > nome2 ? 1 : nome1 < nome2 ? -1 : 0;
};
const primitivas = [
    ...primitivasDicionarioFormatadas,
    ...primitivasNumeroFormatadas,
    ...primitivasTextoFormatadas,
    ...primitivasVetorFormatadas
].sort(ordenarPorNome);
const primitivasDicionarioPituguesFormatadas = formatarPrimitivas(primitivasDicionarioPitugues);
const primitivasNumeroPituguesFormatadas = formatarPrimitivas(primitivasNumeroPitugues);
const primitivasTextoPituguesFormatadas = formatarPrimitivas(primitivasTextoPitugues);
const primitivasVetorPituguesFormatadas = formatarPrimitivas(primitivasVetorPitugues);
const primitivasPitugues = [
    ...primitivasDicionarioPituguesFormatadas,
    ...primitivasNumeroPituguesFormatadas,
    ...primitivasTextoPituguesFormatadas,
    ...primitivasVetorPituguesFormatadas
].sort(ordenarPorNome);

/**
 * Coleções de primitivas e funções nativas específicas de cada dialeto.
 * O provedor seleciona o conjunto correto a partir do `languageId` do
 * documento, para que Pituguês reconheça suas próprias primitivas e
 * funções nativas (por exemplo, `escreva` em Delégua e `escrever` em
 * Pituguês).
 */
interface ColecoesDialeto {
    dicionario: FuncaoNativaOuMetodoPrimitiva[];
    numero: FuncaoNativaOuMetodoPrimitiva[];
    texto: FuncaoNativaOuMetodoPrimitiva[];
    vetor: FuncaoNativaOuMetodoPrimitiva[];
    todas: FuncaoNativaOuMetodoPrimitiva[];
    funcoesNativas: FuncaoNativaOuMetodoPrimitiva[];
}

const colecoesDelegua: ColecoesDialeto = {
    dicionario: primitivasDicionarioFormatadas,
    numero: primitivasNumeroFormatadas,
    texto: primitivasTextoFormatadas,
    vetor: primitivasVetorFormatadas,
    todas: primitivas,
    funcoesNativas: funcoesNativasDelegua
};

const colecoesPitugues: ColecoesDialeto = {
    dicionario: primitivasDicionarioPituguesFormatadas,
    numero: primitivasNumeroPituguesFormatadas,
    texto: primitivasTextoPituguesFormatadas,
    vetor: primitivasVetorPituguesFormatadas,
    todas: primitivasPitugues,
    funcoesNativas: funcoesNativasPitugues
};

import { obterResultado } from '@designliquido/delegua-lsp/analise/cache-analise';

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
        if (ultimoParentese === -1) {
            return 0;
        }

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
            if (dentroString) {
                continue;
            }

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
        parametroAtivo?: number,
        nomeMetodo?: string,
        colecoes: ColecoesDialeto = colecoesDelegua
    ): vscode.SignatureHelp | undefined {
        let tipoObjeto: string | undefined = undefined;
        const nomeProcurado = nomeMetodo ?? nomeObjeto;

        const variavelOuConst = declaracoesPertinentes.find(
            (decl) => decl.nome === nomeObjeto
        );
        tipoObjeto = variavelOuConst?.tipo;

        if (tipoObjeto) {
            switch (tipoObjeto) {
                case 'dicionario':
                case 'dicionário':
                    const metodoDicionario = colecoes.dicionario.find(m => m.nome === nomeProcurado);
                    if (metodoDicionario) {
                        return this.construirObjetoAssinatura(metodoDicionario, parametroAtivo);
                    }

                    return undefined;
                case 'numero':
                case 'número':
                    const metodoNumero = colecoes.numero.find(m => m.nome === nomeProcurado);
                    if (metodoNumero) {
                        return this.construirObjetoAssinatura(metodoNumero, parametroAtivo);
                    }

                    return undefined;
                case 'texto':
                    const metodoTexto = colecoes.texto.find(m => m.nome === nomeProcurado);
                    if (metodoTexto) {
                        return this.construirObjetoAssinatura(metodoTexto, parametroAtivo);
                    }

                    return undefined;
                case 'vetor':
                    const metodoVetor = colecoes.vetor.find(m => m.nome === nomeProcurado);
                    if (metodoVetor) {
                        return this.construirObjetoAssinatura(metodoVetor, parametroAtivo);
                    }

                    return undefined;

                default:
                    const metodoQualquer = colecoes.todas.find(m => m.nome === nomeProcurado);
                    if (metodoQualquer) {
                        return this.construirObjetoAssinatura(metodoQualquer, parametroAtivo);
                    }

                    return undefined;
                }
        }
    }

    protected assinaturaParaConstrutorClasse(
        classe: Classe,
        construtor: FuncaoDeclaracao,
        parametroAtivo?: number
    ): vscode.SignatureHelp {
        const assinaturaFuncao = new vscode.SignatureHelp();

        const parametros = construtor.funcao.parametros.map(parametro => ({
            rotulo: `${parametro.nome.lexema}: ${parametro.tipoDado || 'qualquer'}`,
        }));

        const assinaturaMetodo = new vscode.SignatureInformation(
            `${classe.simbolo.lexema}(${parametros.map(p => p.rotulo).join(', ')})`,
            new vscode.MarkdownString(
                '```delegua\n' +
                `${classe.simbolo.lexema}(${parametros.map(p => p.rotulo).join(', ')})` +
                '\n```'
            )
        );

        assinaturaMetodo.parameters = [];
        for (let parametro of parametros) {
            assinaturaMetodo.parameters.push(
                new vscode.ParameterInformation(
                    parametro.rotulo,
                    new vscode.MarkdownString("")
                )
            );
        }

        assinaturaFuncao.signatures = [assinaturaMetodo];

        if (parametroAtivo !== undefined) {
            assinaturaFuncao.activeParameter = parametroAtivo;
            assinaturaFuncao.activeSignature = 0;
        }

        return assinaturaFuncao;
    }

    protected assinaturaParaFuncaoDefinidaEmCodigo(
        declaracao: FuncaoDeclaracao,
        parametroAtivo?: number
    ) {
        const assinaturaFuncao = new vscode.SignatureHelp();

        const parametros = declaracao.funcao.parametros.map(parametro => ({
            rotulo: `${parametro.nome.lexema}: ${parametro.tipoDado || 'qualquer'}`,
        }));

        const subtipoMatch = declaracao.tipo?.match(/<\s*([^>]+)\s*>/);
        const subtipo = subtipoMatch ? subtipoMatch[1].trim() : 'qualquer';
        const assinaturaMetodo = new vscode.SignatureInformation(
            `${declaracao.simbolo.lexema}(${parametros.map(p => p.rotulo).join(', ')})`,
            new vscode.MarkdownString(
                (declaracao.tipo ? `Retorna: ${subtipo}\n\n` : '') +
                '```delegua\n' +
                `${declaracao.simbolo.lexema}(${parametros.map(p => p.rotulo).join(', ')})` +
                '\n```'
            )
        );

        assinaturaMetodo.parameters = [];
        for (let parametro of parametros) {
            assinaturaMetodo.parameters.push(
                new vscode.ParameterInformation(
                    parametro.rotulo,
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

        // Seleciona as primitivas e funções nativas do dialeto do documento.
        const colecoes: ColecoesDialeto =
            document.languageId === 'pitugues' ? colecoesPitugues : colecoesDelegua;

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
            return this.assinaturaParaChamadaMetodo(
                resultadoObjeto[1],
                declaracoesPertinentes,
                parametroAtivo,
                resultadoRegexFuncaoOuMetodo[1],
                colecoes
            );
        }

        // Segundo caso: A `palavra` é uma função definida em código.
        const possivelFuncaoDefinidaEmCodigo = declaracoesPertinentes.find(
            (decl) => decl.nome === resultadoRegexFuncaoOuMetodo[1] && decl.tipo.startsWith('função')
        );

        if (possivelFuncaoDefinidaEmCodigo) {
            const funcaoDeclaracao = possivelFuncaoDefinidaEmCodigo.declaracao as FuncaoDeclaracao;
            return this.assinaturaParaFuncaoDefinidaEmCodigo(funcaoDeclaracao, parametroAtivo);
        }

        // Terceiro caso: A `palavra` é um construtor de uma classe (local ou importada).
        const todasAsClasses: Classe[] = [
            ...(resultadoAnalise?.avaliadorSintatico.declaracoes.filter(d => d instanceof Classe) as Classe[] || []),
            ...(resultadoAnalise?.declaracoesPreCarregadas?.filter(d => d instanceof Classe) as Classe[] || [])
        ];

        const possivelClasse = todasAsClasses.find(
            (classe) => classe.simbolo.lexema === resultadoRegexFuncaoOuMetodo[1]
        );

        if (possivelClasse) {
            const construtor = possivelClasse.metodos.find(m => m.simbolo.lexema === 'construtor');
            if (construtor) {
                return this.assinaturaParaConstrutorClasse(possivelClasse, construtor, parametroAtivo);
            }
        }

        // Quarto caso: A `palavra` é uma função nativa global.
        const possivelFuncaoNativa: FuncaoNativaOuMetodoPrimitiva | undefined = colecoes.funcoesNativas.find(
            (funcaoNativa) => funcaoNativa.nome === resultadoRegexFuncaoOuMetodo[1]
        );

        if (!possivelFuncaoNativa) {
            return undefined;    
        }
        
        return this.construirObjetoAssinatura(possivelFuncaoNativa, parametroAtivo);
    }
}
