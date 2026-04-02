import * as vscode from 'vscode';

import { Classe, Const, FuncaoDeclaracao, InterfaceDeclaracao, Var } from '@designliquido/delegua/declaracoes';
import { ComentarioComoConstruto } from '@designliquido/delegua/construtos';

import { obterResultado } from '../analise-codigo/cache-analise';
import primitivasDicionario from '@designliquido/delegua/bibliotecas/primitivas-dicionario';
import primitivasNumero from '@designliquido/delegua/bibliotecas/primitivas-numero';
import primitivasTexto from '@designliquido/delegua/bibliotecas/primitivas-texto';
import primitivasVetor from '@designliquido/delegua/bibliotecas/primitivas-vetor';
import { formatarPrimitivas, funcoesNativasDelegua } from '../bibliotecas';

const primitivasDicionarioFormatadas = formatarPrimitivas(primitivasDicionario);
const primitivasNumeroFormatadas = formatarPrimitivas(primitivasNumero);
const primitivasTextoFormatadas = formatarPrimitivas(primitivasTexto);
const primitivasVetorFormatadas = formatarPrimitivas(primitivasVetor);
const primitivas = [
    ...primitivasDicionarioFormatadas,
    ...primitivasNumeroFormatadas,
    ...primitivasTextoFormatadas,
    ...primitivasVetorFormatadas
].sort((a, b) => {
    const nome1 = a.nome.toUpperCase();
    const nome2 = b.nome.toUpperCase();
    return nome1 > nome2 ? 1 : nome1 < nome2 ? -1 : 0;
});

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
        const todasDeclaracoes = resultadoAnalise?.avaliadorSintatico.declaracoes || [];

        const declaracoesPertinentes = todasDeclaracoes.flatMap(declaracao => {
            if (declaracao instanceof Var) {
                return [{ nome: declaracao.simbolo.lexema, tipo: declaracao.tipo }];
            }
            if (declaracao instanceof Const) {
                return [{ nome: declaracao.simbolo.lexema, tipo: declaracao.tipo }];
            }
            if (declaracao instanceof FuncaoDeclaracao) {
                return [{ nome: declaracao.simbolo.lexema, tipo: declaracao.tipo }];
            }
            return [];
        });

        return this.hoverMetodoPrimitivo(textoAntesPosicao, palavra, declaracoesPertinentes)
            ?? this.hoverFuncaoNativa(palavra)
            ?? this.hoverVariavelOuConstante(palavra, declaracoesPertinentes)
            ?? this.hoverFuncaoDocumentada(palavra, todasDeclaracoes)
            ?? this.hoverClasseDocumentada(palavra, todasDeclaracoes, documento.getText())
            ?? this.hoverInterfaceDocumentada(palavra, todasDeclaracoes, documento.getText());
    }

    private hoverMetodoPrimitivo(
        textoAntesPosicao: string,
        palavra: string,
        declaracoesPertinentes: { nome: string; tipo: string }[]
    ): vscode.Hover | undefined {
        const cadeiaTokens = textoAntesPosicao.trim().split(/[\s\(\)\[\]\{\};]+/).pop()?.split('.');
        if (!cadeiaTokens || cadeiaTokens.length < 2) {
            return undefined;
        }

        const objeto = cadeiaTokens[cadeiaTokens.length - 2];
        const declaracao = declaracoesPertinentes.find(d => d.nome === objeto);
        if (!declaracao) {
            return undefined;
        }

        const mapaMetodos: Record<string, typeof primitivasDicionarioFormatadas> = {
            'dicionario':   primitivasDicionarioFormatadas,
            'dicionário':   primitivasDicionarioFormatadas,
            'numero':       primitivasNumeroFormatadas,
            'número':       primitivasNumeroFormatadas,
            'texto':        primitivasTextoFormatadas,
            'vetor':        primitivasVetorFormatadas,
            'dicionario[]': primitivasVetorFormatadas,
            'dicionário[]': primitivasVetorFormatadas,
            'numero[]':     primitivasVetorFormatadas,
            'número[]':     primitivasVetorFormatadas,
            'logico[]':     primitivasVetorFormatadas,
            'lógico[]':     primitivasVetorFormatadas,
            'qualquer[]':   primitivasVetorFormatadas,
            'texto[]':      primitivasVetorFormatadas,
        };

        const listaPrimitivas = mapaMetodos[declaracao.tipo] ?? primitivas;
        const metodo = listaPrimitivas.find(m => m.nome === palavra);
        if (!metodo) {
            return undefined;
        }

        const doc = new vscode.MarkdownString(metodo.documentacao);
        if (metodo.exemploCodigo) {
            doc.appendCodeblock(metodo.exemploCodigo, 'delegua');
        }
        return new vscode.Hover(doc);
    }

    private hoverFuncaoNativa(palavra: string): vscode.Hover | undefined {
        const funcaoNativa = funcoesNativasDelegua.find(f => f.nome === palavra);
        if (!funcaoNativa) {
            return undefined;
        }

        const doc = new vscode.MarkdownString(funcaoNativa.documentacao);
        if (funcaoNativa.exemploCodigo) {
            doc.appendCodeblock(funcaoNativa.exemploCodigo, 'delegua');
        }
        return new vscode.Hover(doc);
    }

    private hoverVariavelOuConstante(
        palavra: string,
        declaracoesPertinentes: { nome: string; tipo: string }[]
    ): vscode.Hover | undefined {
        const declaracao = declaracoesPertinentes.find(d => d.nome === palavra);
        if (!declaracao) {
            return undefined;
        }

        const doc = new vscode.MarkdownString();
        doc.appendCodeblock(`${declaracao.nome}: ${declaracao.tipo}`, 'delegua');
        return new vscode.Hover(doc);
    }

    private hoverFuncaoDocumentada(
        palavra: string,
        todasDeclaracoes: any[]
    ): vscode.Hover | undefined {
        let declaracaoFuncao = todasDeclaracoes.find(
            d => d instanceof FuncaoDeclaracao && d.simbolo.lexema === palavra
        ) as FuncaoDeclaracao | undefined;

        if (!declaracaoFuncao) {
            for (const declaracao of todasDeclaracoes) {
                if (declaracao instanceof Classe) {
                    const metodo = declaracao.metodos.find((m: FuncaoDeclaracao) => m.simbolo.lexema === palavra);
                    if (metodo) {
                        declaracaoFuncao = metodo;
                        break;
                    }
                }
            }
        }

        if (!declaracaoFuncao?.documentacao) {
            return undefined;
        }

        const conteudo = declaracaoFuncao.documentacao as ComentarioComoConstruto;
        const texto = Array.isArray(conteudo.conteudo) ? conteudo.conteudo.join('\n') : conteudo.conteudo;
        return new vscode.Hover(new vscode.MarkdownString(texto));
    }

    private hoverClasseDocumentada(
        palavra: string,
        todasDeclaracoes: any[],
        codigoFonte: string
    ): vscode.Hover | undefined {
        const declaracaoClasse = todasDeclaracoes.find(
            d => d instanceof Classe && (d as Classe).simbolo.lexema === palavra
        ) as Classe | undefined;
        if (!declaracaoClasse) {
            return undefined;
        }

        const prefixo = declaracaoClasse.abstrata ? '(classe abstrata)' : '(classe)';
        let assinatura = `${prefixo} ${declaracaoClasse.simbolo.lexema}`;

        if (declaracaoClasse.superClasses?.length) {
            const nomes = declaracaoClasse.superClasses.map((sc: any) => sc.simbolo.lexema).join(', ');
            assinatura += ` herda ${nomes}`;
        }
        if (declaracaoClasse.mesclas?.length) {
            const nomes = declaracaoClasse.mesclas.map((m: any) => m.simbolo.lexema).join(', ');
            assinatura += ` mescla ${nomes}`;
        }
        if (declaracaoClasse.implementa?.length) {
            const nomes = declaracaoClasse.implementa.map((i: any) => i.lexema).join(', ');
            assinatura += ` implementa ${nomes}`;
        }

        const doc = new vscode.MarkdownString();
        doc.appendCodeblock(assinatura, 'delegua');

        const regexDocClasse = /\/\*\*([\s\S]*?)\*\/\s*(?:abstrat[ao]\s+)?classe\s+/g;
        let correspondencia: RegExpExecArray | null;
        while ((correspondencia = regexDocClasse.exec(codigoFonte)) !== null) {
            const posicaoAposComentario = correspondencia.index + correspondencia[0].length;
            const nomeClasse = codigoFonte.slice(posicaoAposComentario).match(/^[\wÀ-úÇç]+/)?.[0];
            if (nomeClasse === palavra) {
                const conteudo = correspondencia[1]
                    .split('\n')
                    .map(l => l.replace(/^\s*\*\s?/, ''))
                    .join('\n')
                    .trim();
                doc.appendMarkdown('\n\n' + conteudo);
                break;
            }
        }

        return new vscode.Hover(doc);
    }

    private hoverInterfaceDocumentada(
        palavra: string,
        todasDeclaracoes: any[],
        codigoFonte: string
    ): vscode.Hover | undefined {
        const existe = todasDeclaracoes.some(
            d => d instanceof InterfaceDeclaracao && (d as InterfaceDeclaracao).simbolo.lexema === palavra
        );
        if (!existe) {
            return undefined;
        }

        const regexDocInterface = /\/\*\*([\s\S]*?)\*\/\s*interface\s+/g;
        let correspondencia: RegExpExecArray | null;
        while ((correspondencia = regexDocInterface.exec(codigoFonte)) !== null) {
            const posicaoAposComentario = correspondencia.index + correspondencia[0].length;
            const nomeInterface = codigoFonte.slice(posicaoAposComentario).match(/^[\wÀ-úÇç]+/)?.[0];
            if (nomeInterface === palavra) {
                const conteudo = correspondencia[1]
                    .split('\n')
                    .map(l => l.replace(/^\s*\*\s?/, ''))
                    .join('\n')
                    .trim();
                return new vscode.Hover(new vscode.MarkdownString(conteudo));
            }
        }

        return undefined;
    }
}
