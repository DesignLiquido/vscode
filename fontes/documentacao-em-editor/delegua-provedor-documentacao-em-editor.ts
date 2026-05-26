import * as vscode from 'vscode';

import { Classe, Const, FuncaoDeclaracao, InterfaceDeclaracao, ParaCada, Var } from '@designliquido/delegua/declaracoes';
import { Chamada, ComentarioComoConstruto } from '@designliquido/delegua/construtos';
import primitivasDicionario from '@designliquido/delegua/bibliotecas/primitivas-dicionario';
import primitivasNumero from '@designliquido/delegua/bibliotecas/primitivas-numero';
import primitivasTexto from '@designliquido/delegua/bibliotecas/primitivas-texto';
import primitivasVetor from '@designliquido/delegua/bibliotecas/primitivas-vetor';

import { obterResultado } from '../analise-codigo/cache-analise';
import { obterDefinicoesPorContexto } from '../analise-codigo/cache-definicoes';
import { formatarPrimitivas, funcoesNativasDelegua } from '../bibliotecas';
import { primitivasMetodosLiquido, objetosEmRotaLiquido, metodosRespostaLiquido } from '../bibliotecas/primitivas-liquido';
import { extrairTextoDocumentacao, formatarDocumentacaoDocumentario } from './formatador-documentacao';

const primitivasDicionarioFormatadas = formatarPrimitivas(primitivasDicionario);
const primitivasNumeroFormatadas = formatarPrimitivas(primitivasNumero);
const primitivasTextoFormatadas = formatarPrimitivas(primitivasTexto);
const primitivasVetorFormatadas = formatarPrimitivas(primitivasVetor);

function desembrulharTipoFuncao(tipo: string): string {
    const correspondencia = tipo?.match(/^função<(.+)>$/);
    return correspondencia ? correspondencia[1] : tipo;
}

/**
 * Provedor de documentação para `hover` (ponteiro do _mouse_ por cima do elemento de código.)
 */
export class DeleguaProvedorDocumentacaoEmEditor
    implements vscode.HoverProvider
{
    async provideHover(
        documento: vscode.TextDocument,
        posicao: vscode.Position,
        _token: vscode.CancellationToken
    ): Promise<vscode.Hover | undefined> {
        const resultadoAnalise = obterResultado(documento.uri.toString());
        const intervalo = documento.getWordRangeAtPosition(posicao);
        if (!intervalo) {
            return undefined;
        }

        const eContextoLiquido = /[\\\/]rotas[\\\/]/i.test(documento.uri.fsPath);
        const palavra = documento.getText(intervalo);
        const linhaTexto = documento.lineAt(posicao).text;
        const textoAntesPosicao = linhaTexto.substring(0, posicao.character);
        const textoAntesPalavra = linhaTexto.substring(0, intervalo.start.character);
        const todasDeclaracoes = [
            ...(resultadoAnalise?.declaracoesPreCarregadas || []),
            ...(resultadoAnalise?.avaliadorSintatico?.declaracoes || [])
        ];

        const declaracoesPertinentes = todasDeclaracoes.flatMap(declaracao => {
            if (declaracao instanceof Var) {
                const tipo = declaracao.inicializador instanceof Chamada
                    ? desembrulharTipoFuncao(declaracao.tipo)
                    : declaracao.tipo;
                return [{ nome: declaracao.simbolo.lexema, tipo }];
            }
            if (declaracao instanceof Const) {
                const tipo = declaracao.inicializador instanceof Chamada
                    ? desembrulharTipoFuncao(declaracao.tipo)
                    : declaracao.tipo;
                return [{ nome: declaracao.simbolo.lexema, tipo }];
            }
            if (declaracao instanceof FuncaoDeclaracao) {
                return [{ nome: declaracao.simbolo.lexema, tipo: declaracao.tipo }];
            }
            return [];
        });

        if (textoAntesPalavra.trimEnd().endsWith('.')) {
            return this.hoverPropriedadeClasse(palavra, textoAntesPalavra, posicao.line + 1, todasDeclaracoes)
                ?? this.hoverMetodoDePrimitiva(textoAntesPosicao, palavra, declaracoesPertinentes)
                ?? this.hoverMetodoDeObjetoLiquido(textoAntesPalavra, palavra, eContextoLiquido)
                ?? this.hoverFuncaoOuMetodoDocumentado(palavra, textoAntesPalavra, todasDeclaracoes);
        }

        return this.hoverVariavelParaCada(palavra, posicao.line + 1, todasDeclaracoes)
            ?? this.hoverObjetoEmRotaLiquido(palavra, eContextoLiquido)
            ?? this.hoverParametroFuncao(palavra, posicao.line + 1, todasDeclaracoes)
            ?? this.hoverFuncaoNativa(palavra)
            ?? this.hoverFuncaoOuMetodoDocumentado(palavra, textoAntesPalavra, todasDeclaracoes)
            ?? this.hoverVariavelOuConstante(palavra, declaracoesPertinentes)
            ?? await this.hoverClasseDocumentada(palavra, todasDeclaracoes, documento.getText())
            ?? this.hoverInterfaceDocumentada(palavra, todasDeclaracoes, documento.getText());
    }

    private hoverPropriedadeClasse(
        palavra: string,
        textoAntesPalavra: string,
        linhaAtual: number,
        todasDeclaracoes: any[]
    ): vscode.Hover | undefined {
        if (!textoAntesPalavra.trimEnd().endsWith('isto.')) {
            return undefined;
        }

        const classesLocais = todasDeclaracoes.filter(
            d => d instanceof Classe && !(d as any).caminhoArquivoDefinicao
        ) as Classe[];

        const classesAnteriores = classesLocais.filter(c => Number(c.simbolo.linha) <= linhaAtual);
        if (!classesAnteriores.length) {
            return undefined;
        }

        const classeAtual = classesAnteriores.reduce((prev, curr) =>
            Number(curr.simbolo.linha) > Number(prev.simbolo.linha) ? curr : prev
        );

        const propriedade = classeAtual.propriedades.find(p => p.nome.lexema === palavra);
        if (!propriedade) {
            return undefined;
        }

        const tipo = propriedade.tipo || 'qualquer';
        const doc = new vscode.MarkdownString();
        doc.appendCodeblock(`(Propriedade de classe) ${palavra}: ${tipo}`, 'delegua');
        return new vscode.Hover(doc);
    }

    private elementoDeIteravel(tipoIteravel: string): string {
        if (tipoIteravel === 'texto') {
            return 'texto';
        }
        if (tipoIteravel.endsWith('[]')) {
            return tipoIteravel.slice(0, -2);
        }
        return 'qualquer';
    }

    private encontrarParaCadaComVariavel(declaracoes: any[], palavra: string): ParaCada | undefined {
        for (const decl of declaracoes) {
            if (decl instanceof ParaCada && (decl.variavelIteracao as any).simbolo?.lexema === palavra) {
                return decl;
            }
            const sub: any[] = (decl as any).corpo?.declaracoes
                ?? (decl as any).caminhoEntao?.declaracoes
                ?? (decl as any).caminhoSenao?.declaracoes
                ?? [];
            const encontrado = this.encontrarParaCadaComVariavel(sub, palavra);
            if (encontrado) {
                return encontrado;
            }
        }
        return undefined;
    }

    private hoverVariavelParaCada(
        palavra: string,
        linhaAtual: number,
        todasDeclaracoes: any[]
    ): vscode.Hover | undefined {
        const todasFuncoes: FuncaoDeclaracao[] = [];
        for (const d of todasDeclaracoes) {
            if (d instanceof FuncaoDeclaracao) {
                todasFuncoes.push(d);
            }
            if (d instanceof Classe) {
                todasFuncoes.push(...d.metodos);
            }
        }

        const funcoesAnteriores = todasFuncoes.filter(f => Number(f.simbolo.linha) <= linhaAtual);
        if (!funcoesAnteriores.length) {
            return undefined;
        }

        const funcaoAtual = funcoesAnteriores.reduce((prev, curr) =>
            Number(curr.simbolo.linha) > Number(prev.simbolo.linha) ? curr : prev
        );

        const corpoDeclaracoes: any[] = Array.isArray(funcaoAtual.funcao.corpo) ? funcaoAtual.funcao.corpo : [];
        const paraCada = this.encontrarParaCadaComVariavel(corpoDeclaracoes, palavra);
        if (!paraCada) {
            return undefined;
        }

        const tipoIteravel = (paraCada.vetorOuDicionario as any).tipo
            || funcaoAtual.funcao.parametros.find(
                p => p.nome.lexema === (paraCada.vetorOuDicionario as any).simbolo?.lexema
            )?.tipoDado
            || 'qualquer';

        const doc = new vscode.MarkdownString();
        doc.appendCodeblock(`(Variável de iteração) ${palavra}: ${this.elementoDeIteravel(tipoIteravel)}`, 'delegua');
        return new vscode.Hover(doc);
    }

    private hoverParametroFuncao(
        palavra: string,
        linhaAtual: number,
        todasDeclaracoes: any[]
    ): vscode.Hover | undefined {
        const todasFuncoes: FuncaoDeclaracao[] = [];

        for (const declaracao of todasDeclaracoes) {
            if (declaracao instanceof FuncaoDeclaracao) {
                todasFuncoes.push(declaracao);
            }
            if (declaracao instanceof Classe) {
                todasFuncoes.push(...declaracao.metodos);
            }
        }

        const funcoesAnteriores = todasFuncoes.filter(
            f => Number(f.simbolo.linha) <= linhaAtual
        );
        if (!funcoesAnteriores.length) {
            return undefined;
        }

        const funcaoAtual = funcoesAnteriores.reduce((prev, curr) =>
            Number(curr.simbolo.linha) > Number(prev.simbolo.linha) ? curr : prev
        );

        const parametro = funcaoAtual.funcao.parametros.find(
            p => p.nome.lexema === palavra
        );
        if (!parametro) {
            return undefined;
        }

        const tipo = parametro.tipoDado || 'qualquer';
        const doc = new vscode.MarkdownString();
        doc.appendCodeblock(`(Parâmetro) ${palavra}: ${tipo}`, 'delegua');
        return new vscode.Hover(doc);
    }

    private hoverMetodoDePrimitiva(
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

        const listaPrimitivas = mapaMetodos[declaracao.tipo];
        if (!listaPrimitivas) {
            return undefined;
        }
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
        if (!declaracao || declaracao.nome === declaracao.tipo) {
            return undefined;
        }

        const doc = new vscode.MarkdownString();
        doc.appendCodeblock(`${declaracao.nome}: ${declaracao.tipo}`, 'delegua');
        return new vscode.Hover(doc);
    }

    private hoverFuncaoOuMetodoDocumentado(
        palavra: string,
        textoAntesPalavra: string,
        todasDeclaracoes: any[]
    ): vscode.Hover | undefined {
        const tiposEmCache = { ...obterDefinicoesPorContexto('normal'), ...obterDefinicoesPorContexto('liquido') };
        const declaracaoCache = tiposEmCache[palavra];
        if (declaracaoCache && !todasDeclaracoes.includes(declaracaoCache)) {
            todasDeclaracoes.push(declaracaoCache);
        }

        let declaracaoFuncao: FuncaoDeclaracao | undefined;

        const correspondenciaReceptor = textoAntesPalavra.trimEnd().match(/(\w+)\.$/);
        if (correspondenciaReceptor) {
            const nomeReceptor = correspondenciaReceptor[1];
            const classeReceptor = (todasDeclaracoes.find(
                d => d instanceof Classe &&
                    (d as Classe).simbolo.lexema.toLowerCase() === nomeReceptor.toLowerCase()
            ) ?? Object.values(tiposEmCache).find(
                d => d instanceof Classe &&
                    (d as Classe).simbolo.lexema.toLowerCase() === nomeReceptor.toLowerCase()
            )) as Classe | undefined;
            if (classeReceptor) {
                declaracaoFuncao = classeReceptor.metodos.find(
                    (m: FuncaoDeclaracao) => m.simbolo.lexema === palavra
                );
            }
        }

        if (!declaracaoFuncao) {
            declaracaoFuncao = todasDeclaracoes.find(
                d => d instanceof FuncaoDeclaracao && d.simbolo.lexema === palavra
            ) as FuncaoDeclaracao | undefined;
        }

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
        const doc = new vscode.MarkdownString();
        return new vscode.Hover(
            formatarDocumentacaoDocumentario(doc, extrairTextoDocumentacao(conteudo.conteudo))
        );
    }

    private async hoverClasseDocumentada(
        palavra: string,
        todasDeclaracoes: any[],
        codigoFonte: string
    ): Promise<vscode.Hover | undefined> {
        const tiposEmCache = { ...obterDefinicoesPorContexto('normal'), ...obterDefinicoesPorContexto('liquido') };
        const declaracaoCache = tiposEmCache[palavra];
        if (declaracaoCache && !todasDeclaracoes.includes(declaracaoCache)) {
            todasDeclaracoes.push(declaracaoCache);
        }

        const declaracaoClasse = todasDeclaracoes.find(
            d => d instanceof Classe && (
                (d as Classe).simbolo.lexema === palavra ||
                (d as Classe).simbolo.lexema.toLowerCase() === palavra.toLowerCase()
            )
        ) as Classe | undefined;
        if (!declaracaoClasse) {
            return undefined;
        }

        const prefixo = (declaracaoClasse as any).abstrata ? '(classe abstrata)' : '(classe)';
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

        if (declaracaoClasse.documentacao) {
            const conteudoComentario = declaracaoClasse.documentacao as unknown as ComentarioComoConstruto;
            formatarDocumentacaoDocumentario(doc, extrairTextoDocumentacao(conteudoComentario.conteudo));
            return new vscode.Hover(doc);
        }

        const caminhoImportado = (declaracaoClasse as any).caminhoArquivoDefinicao as string | undefined;
        const fonteParaPesquisar = caminhoImportado
            ? await this.lerConteudoArquivo(caminhoImportado)
            : codigoFonte;

        const regexDocClasse = /\/\*\*([\s\S]*?)\*\/\s*(?:abstrat[ao]\s+)?classe\s+/g;
        let correspondencia: RegExpExecArray | null;
        while ((correspondencia = regexDocClasse.exec(fonteParaPesquisar)) !== null) {
            const posicaoAposComentario = correspondencia.index + correspondencia[0].length;
            const nomeClasse = fonteParaPesquisar.slice(posicaoAposComentario).match(/^[\wÀ-úÇç]+/)?.[0];
            if (nomeClasse === palavra) {
                const conteudo = correspondencia[1]
                    .split('\n')
                    .map(l => l.replace(/^\s*\*\s?/, ''))
                    .join('\n')
                    .trim();
                formatarDocumentacaoDocumentario(doc, conteudo);
                break;
            }
        }

        return new vscode.Hover(doc);
    }

    private async lerConteudoArquivo(caminho: string): Promise<string> {
        try {
            const buffer = await vscode.workspace.fs.readFile(vscode.Uri.file(caminho));
            return Buffer.from(buffer).toString('utf8');
        } catch {
            return '';
        }
    }

    private hoverMetodoDeObjetoLiquido(
        textoAntesPalavra: string,
        palavra: string,
        eContextoLiquido: boolean
    ): vscode.Hover | undefined {
        if (!eContextoLiquido) {
            return undefined;
        }
        // Strip argument lists so chains like `resposta.enviar("...").` become `resposta.enviar().`
        const textoSemArgs = textoAntesPalavra.replace(/\(.*?\)/g, '()');
        const correspondencia = textoSemArgs.trimEnd().match(/\b(\w+)(?:\.\w+\(\))*\.$/);
        if (!correspondencia) {
            return undefined;
        }
        const objeto = correspondencia[1];
        const mapaMetodosObjetos: Record<string, typeof primitivasMetodosLiquido> = {
            liquido: primitivasMetodosLiquido,
            resposta: metodosRespostaLiquido,
        };
        const listaMetodos = mapaMetodosObjetos[objeto];
        if (!listaMetodos) {
            return undefined;
        }
        const metodo = listaMetodos.find(m => m.nome === palavra);
        if (!metodo) {
            return undefined;
        }
        const doc = new vscode.MarkdownString(metodo.documentacao);
        if (metodo.exemploCodigo) {
            doc.appendCodeblock(metodo.exemploCodigo, 'delegua');
        }
        return new vscode.Hover(doc);
    }

    private hoverObjetoEmRotaLiquido(
        palavra: string,
        eContextoLiquido: boolean
    ): vscode.Hover | undefined {
        if (!eContextoLiquido) {
            return undefined;
        }
        if (palavra === 'liquido') {
            const doc = new vscode.MarkdownString(
                '# Objeto `liquido`\n\nFramework para criação de APIs REST em Delégua.\n\n'
            );
            doc.appendCodeblock(
                'liquido.rotaGet(requisicao, resposta) { ... }\nliquido.rotaPost(requisicao, resposta) { ... }',
                'delegua'
            );
            return new vscode.Hover(doc);
        }
        const objeto = objetosEmRotaLiquido.find(o => o.nome === palavra);
        if (!objeto) {
            return undefined;
        }
        const doc = new vscode.MarkdownString(objeto.documentacao);
        if (objeto.exemploCodigo) {
            doc.appendCodeblock(objeto.exemploCodigo, 'delegua');
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
                return new vscode.Hover(
                    formatarDocumentacaoDocumentario(new vscode.MarkdownString(), conteudo)
                );
            }
        }

        return undefined;
    }
}
