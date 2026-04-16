import * as vscode from 'vscode';

import { normalizarEtiquetaDocumentario } from './etiquetas-documentarios';

interface TagDocumentacaoBruta {
    tagOriginal: string;
    tagCanonica: string;
    titulo: string;
    conteudo: string;
}

interface ParametroDocumentado {
    nome: string;
    tipo?: string;
    descricao?: string;
}

function limparLinhasDocumentacao(texto: string): string[] {
    return texto
        .replace(/^\s*\/\*\*?/, '')
        .replace(/\*\/\s*$/, '')
        .split(/\r?\n/)
        .map(linha => linha.replace(/^\s*\*\s?/, '').trimEnd());
}

function analisarTagsDocumentacao(texto: string): { descricao: string; tags: TagDocumentacaoBruta[] } {
    const linhas = limparLinhasDocumentacao(texto);
    const descricao: string[] = [];
    const tags: TagDocumentacaoBruta[] = [];
    let tagAtual: TagDocumentacaoBruta | undefined;

    for (const linha of linhas) {
        const linhaSemEspacos = linha.trim();
        if (!linhaSemEspacos && !tagAtual) {
            descricao.push('');
            continue;
        }

        const correspondenciaTag = linhaSemEspacos.match(/^(@[\w-]+)\b\s*(.*)$/i);
        if (correspondenciaTag) {
            if (tagAtual) {
                tags.push(tagAtual);
            }

            const definicao = normalizarEtiquetaDocumentario(correspondenciaTag[1]);
            tagAtual = {
                tagOriginal: correspondenciaTag[1],
                tagCanonica: definicao?.canonica ?? correspondenciaTag[1].toLowerCase(),
                titulo: definicao?.titulo ?? correspondenciaTag[1],
                conteudo: correspondenciaTag[2]?.trim() ?? ''
            };
            continue;
        }

        if (tagAtual) {
            tagAtual.conteudo = tagAtual.conteudo
                ? `${tagAtual.conteudo}\n${linhaSemEspacos}`
                : linhaSemEspacos;
            continue;
        }

        descricao.push(linhaSemEspacos);
    }

    if (tagAtual) {
        tags.push(tagAtual);
    }

    return {
        descricao: descricao.join('\n').trim(),
        tags
    };
}

function analisarParametro(conteudo: string): ParametroDocumentado {
    const correspondencia = conteudo.match(/^(?:\{([^}]+)\}\s*)?(\[[^\]]+\]|[^\s-]+)?\s*(?:-|:)??\s*(.*)$/s);
    const nome = correspondencia?.[2]?.trim() || 'parametro';
    const tipo = correspondencia?.[1]?.trim();
    const descricao = correspondencia?.[3]?.trim();

    return { nome, tipo, descricao };
}

function anexarListaMarkdown(doc: vscode.MarkdownString, titulo: string, itens: string[]): void {
    if (!itens.length) {
        return;
    }

    doc.appendMarkdown(`\n\n**${titulo}**\n\n`);
    for (const item of itens) {
        doc.appendMarkdown(`- ${item}\n`);
    }
}

export function formatarDocumentacaoDocumentario(
    doc: vscode.MarkdownString,
    textoDocumentacao: string
): vscode.MarkdownString {
    const { descricao, tags } = analisarTagsDocumentacao(textoDocumentacao);
    const parametros: string[] = [];
    const propriedades: string[] = [];
    const vejaTambem: string[] = [];
    const excecoes: string[] = [];
    const pendencias: string[] = [];
    const exemplos: string[] = [];
    const camposSimples: Array<{ titulo: string; conteudo: string }> = [];
    let resumo = '';
    let retorno = '';

    if (descricao) {
        doc.appendMarkdown(`\n\n${descricao}`);
    }

    for (const tag of tags) {
        switch (tag.tagCanonica) {
            case '@param': {
                const parametro = analisarParametro(tag.conteudo);
                const tipo = parametro.tipo ? ` (${parametro.tipo})` : '';
                const descricaoParametro = parametro.descricao ? `: ${parametro.descricao}` : '';
                parametros.push(`\`${parametro.nome}\`${tipo}${descricaoParametro}`);
                break;
            }
            case '@propriedade': {
                const propriedade = analisarParametro(tag.conteudo);
                const tipo = propriedade.tipo ? ` (${propriedade.tipo})` : '';
                const descricaoPropriedade = propriedade.descricao ? `: ${propriedade.descricao}` : '';
                propriedades.push(`\`${propriedade.nome}\`${tipo}${descricaoPropriedade}`);
                break;
            }
            case '@retorna':
            case '@produz': {
                retorno = tag.conteudo.trim();
                break;
            }
            case '@resumo':
            case '@descricao': {
                resumo = tag.conteudo.trim();
                break;
            }
            case '@veja': {
                vejaTambem.push(tag.conteudo.trim());
                break;
            }
            case '@lanca': {
                excecoes.push(tag.conteudo.trim());
                break;
            }
            case '@fazer': {
                pendencias.push(tag.conteudo.trim());
                break;
            }
            case '@exemplo': {
                exemplos.push(tag.conteudo.trim());
                break;
            }
            default: {
                if (tag.conteudo.trim()) {
                    camposSimples.push({ titulo: tag.titulo, conteudo: tag.conteudo.trim() });
                }
                break;
            }
        }
    }

    if (resumo) {
        doc.appendMarkdown(`\n\n**Resumo**\n\n${resumo}`);
    }

    anexarListaMarkdown(doc, 'Parametros', parametros);
    anexarListaMarkdown(doc, 'Propriedades', propriedades);

    if (retorno) {
        doc.appendMarkdown(`\n\n**Retorna**\n\n${retorno}`);
    }

    anexarListaMarkdown(doc, 'Veja tambem', vejaTambem);
    anexarListaMarkdown(doc, 'Lanca', excecoes);
    anexarListaMarkdown(doc, 'Fazer', pendencias);

    for (const campo of camposSimples) {
        doc.appendMarkdown(`\n\n**${campo.titulo}**\n\n${campo.conteudo}`);
    }

    for (const exemplo of exemplos) {
        doc.appendMarkdown('\n\n**Exemplo**\n');
        doc.appendCodeblock(exemplo, 'delegua');
    }

    return doc;
}

export function extrairTextoDocumentacao(conteudo: string | string[]): string {
    return Array.isArray(conteudo) ? conteudo.join('\n') : conteudo;
}