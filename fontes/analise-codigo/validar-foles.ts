import * as vscode from 'vscode';

import { Lexador, AvaliadorSintatico } from '@designliquido/foles';

import listaModificadores from '@designliquido/foles/extensao/lista-modificadores';

const nomesModificadoresValidos = new Set(Object.keys(listaModificadores));

export function validarFoles(documento: vscode.TextDocument): vscode.Diagnostic[] {
    const diagnosticos: vscode.Diagnostic[] = [];
    const linhas = documento.getText().split('\n');

    const lexador = new Lexador();
    const resultadoLexador = lexador.mapear(linhas.map(l => l + '\0'));

    for (const erroLexador of resultadoLexador.erros || []) {
        const numeroLinha = Math.max(0, Number(erroLexador.linha) - 1);
        if (numeroLinha < documento.lineCount) {
            diagnosticos.push(new vscode.Diagnostic(
                new vscode.Range(numeroLinha, 0, numeroLinha, documento.lineAt(numeroLinha).text.length),
                String(erroLexador.mensagem),
                vscode.DiagnosticSeverity.Error
            ));
        }
    }

    const importadorVazio = { importar: () => [], diretorioBase: '' } as any;
    const avaliadorSintatico = new AvaliadorSintatico(importadorVazio);

    try {
        avaliadorSintatico.analisar(resultadoLexador.simbolos);
    } catch (erro: any) {
    }

    for (const erroSintatico of avaliadorSintatico.erros || []) {
        const numeroLinha = Math.max(0, Number(erroSintatico.simbolo?.linha) - 1);
        if (numeroLinha < documento.lineCount) {
            diagnosticos.push(new vscode.Diagnostic(
                new vscode.Range(numeroLinha, 0, numeroLinha, documento.lineAt(numeroLinha).text.length),
                String(erroSintatico.message),
                vscode.DiagnosticSeverity.Error
            ));
        }
    }

    for (let i = 0; i < documento.lineCount; i++) {
        const linhaTexto = documento.lineAt(i).text;
        const semComentario = linhaTexto.replace(/\/\/.*$/, '').replace(/\/\*[\s\S]*?\*\//g, '').trim();

        if (!semComentario || semComentario.startsWith('@')) {
            continue;
        }

        const correspondenciaModificador = /['"]?([a-zA-ZÀ-ž][a-zA-Z0-9À-ž\-]*)['"]?\s*:/;
        const resultadoModificador = correspondenciaModificador.exec(semComentario);
        if (resultadoModificador) {
            const nomeModificador = resultadoModificador[1];
            if (!nomesModificadoresValidos.has(nomeModificador)) {
                const coluna = linhaTexto.indexOf(nomeModificador);
                diagnosticos.push(new vscode.Diagnostic(
                    new vscode.Range(i, Math.max(0, coluna), i, Math.max(0, coluna) + nomeModificador.length),
                    `Modificador FolEs desconhecido: '${nomeModificador}'.`,
                    vscode.DiagnosticSeverity.Warning
                ));
            }
        }
    }

    return diagnosticos;
}
