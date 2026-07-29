import * as vscode from 'vscode';

import estruturasLmht from '../linguagens/lmht/estruturas';
import atributosLmht from '../linguagens/lmht/atributos';
import atributosPorEstrutura from '../linguagens/lmht/atributos-por-estrutura';

const nomesEstruturasValidas = new Set(Object.keys(estruturasLmht));
const nomesAtributosGlobais = new Set(Object.keys(atributosLmht));

function extrairTags(texto: string): { nome: string; linha: number; coluna: number; abertura: boolean; fechamento: boolean }[] {
    const tags: { nome: string; linha: number; coluna: number; abertura: boolean; fechamento: boolean }[] = [];
    const regex = /<\/?([a-zA-Z0-9À-ž\-]+)[^<>]*?\/?\s*>/g;
    let correspondencia: RegExpExecArray | null;

    while ((correspondencia = regex.exec(texto)) !== null) {
        const textoCompleto = correspondencia[0];
        const nomeTag = correspondencia[1];
        const posicao = correspondencia.index;
        const linha = texto.slice(0, posicao).split('\n').length - 1;
        const coluna = posicao - texto.lastIndexOf('\n', posicao - 1) - 1;
        const eFechamento = textoCompleto[1] === '/';
        const eAutoFechavel = textoCompleto.endsWith('/>');

        tags.push({
            nome: nomeTag,
            linha,
            coluna: Math.max(0, coluna),
            abertura: !eFechamento,
            fechamento: eFechamento || eAutoFechavel,
        });
    }

    return tags;
}

function extrairAtributosDaLinha(linha: string): string[] {
    const regex = /\s+([a-zA-Z0-9À-ž\-]+)\s*=/g;
    const atributos: string[] = [];
    let correspondencia: RegExpExecArray | null;

    while ((correspondencia = regex.exec(linha)) !== null) {
        atributos.push(correspondencia[1]);
    }

    const regexBooleano = /\s+([a-zA-Z0-9À-ž\-]+)(?=\s*\/?>|\s+[a-zA-Z])/g;
    while ((correspondencia = regexBooleano.exec(linha)) !== null) {
        const nome = correspondencia[1];
        if (!atributos.includes(nome) && !['e', 'ou', 'nao'].includes(nome.toLowerCase())) {
            atributos.push(nome);
        }
    }

    return atributos;
}

export function validarLmht(documento: vscode.TextDocument): vscode.Diagnostic[] {
    const diagnosticos: vscode.Diagnostic[] = [];
    const texto = documento.getText();
    const textoSemComentarios = texto
        .replace(/<!--[\s\S]*?-->/g, '')
        .replace(/<!--[\s\S]*/g, '');
    const tags = extrairTags(textoSemComentarios);

    for (const tag of tags) {
        if (tag.abertura && !nomesEstruturasValidas.has(tag.nome.toLowerCase())) {
            diagnosticos.push(new vscode.Diagnostic(
                new vscode.Range(tag.linha, tag.coluna, tag.linha, tag.coluna + tag.nome.length + 2),
                `Estrutura LMHT desconhecida: '${tag.nome}'.`,
                vscode.DiagnosticSeverity.Error
            ));
        }
    }

    const linhas = textoSemComentarios.split('\n');
    for (let i = 0; i < linhas.length && i < documento.lineCount; i++) {
        const linhaLimpa = linhas[i];
        const linhaOriginal = documento.lineAt(i).text;

        if (!linhaLimpa.includes('<') || /^\s*$/.test(linhaLimpa)) {
            continue;
        }

        const tagCorrespondencia = /<([a-zA-Z0-9À-ž\-]+)([^>]*?)\/?\s*>/.exec(linhaLimpa);
        if (!tagCorrespondencia) {
            continue;
        }

        const nomeTag = tagCorrespondencia[1].toLowerCase();
        const conteudoAtributos = tagCorrespondencia[2];
        const colunaTag = linhaOriginal.indexOf(tagCorrespondencia[0]);

        if (!nomesEstruturasValidas.has(nomeTag)) {
            continue;
        }

        const atributosEncontrados = extrairAtributosDaLinha(conteudoAtributos);
        const atributosPorTag = atributosPorEstrutura[nomeTag] as Record<string, unknown> | undefined;

        for (const atributo of atributosEncontrados) {
            const eGlobal = nomesAtributosGlobais.has(atributo);
            const eEspecifico = atributosPorTag ? atributo in atributosPorTag : false;

            if (!eGlobal && !eEspecifico) {
                const colunaAtributo = linhaOriginal.indexOf(atributo, colunaTag);
                diagnosticos.push(new vscode.Diagnostic(
                    new vscode.Range(i, Math.max(0, colunaAtributo), i, Math.max(0, colunaAtributo) + atributo.length),
                    `Atributo desconhecido '${atributo}' para a estrutura '${nomeTag}'.`,
                    vscode.DiagnosticSeverity.Warning
                ));
            }
        }
    }

    const pilha: { nome: string; linha: number }[] = [];
    for (const tag of tags) {
        if (tag.abertura && !tag.fechamento) {
            pilha.push({ nome: tag.nome.toLowerCase(), linha: tag.linha });
        } else if (tag.fechamento && !tag.abertura) {
            const ultimaAbertura = pilha.length > 0 ? pilha[pilha.length - 1] : null;
            if (ultimaAbertura && tag.nome.toLowerCase() === ultimaAbertura.nome) {
                pilha.pop();
            } else if (ultimaAbertura) {
                diagnosticos.push(new vscode.Diagnostic(
                    new vscode.Range(tag.linha, tag.coluna, tag.linha, tag.coluna + tag.nome.length + 3),
                    `Fechamento de estrutura inesperado: '</${tag.nome}>'. Esperado '</${ultimaAbertura.nome}>'.`,
                    vscode.DiagnosticSeverity.Error
                ));
            }
        }
    }

    for (const naoFechada of pilha) {
        diagnosticos.push(new vscode.Diagnostic(
            new vscode.Range(naoFechada.linha, 0, naoFechada.linha, Number.MAX_VALUE),
            `Estrutura '${naoFechada.nome}' não foi fechada.`,
            vscode.DiagnosticSeverity.Error
        ));
    }

    return diagnosticos;
}
