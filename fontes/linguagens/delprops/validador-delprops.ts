import * as vscode from 'vscode';

import { analisar, validar, registrar, obter, temRegistro } from '@designliquido/delprops';
import * as liquido from '@designliquido/delprops/liquido';

export function validarDelprops(documento: vscode.TextDocument): vscode.Diagnostic[] {
    const diagnosticos: vscode.Diagnostic[] = [];
    const conteudo = documento.getText();

    const resultadoCompreensao = analisar(conteudo);

    for (const erroCompreensao of resultadoCompreensao.erros) {
        const numeroLinha = Math.max(0, erroCompreensao.linha - 1);
        if (numeroLinha < documento.lineCount) {
            diagnosticos.push(new vscode.Diagnostic(
                new vscode.Range(numeroLinha, 0, numeroLinha, Number.MAX_VALUE),
                erroCompreensao.mensagem,
                vscode.DiagnosticSeverity.Error
            ));
        }
    }

    if (!temRegistro('liquido')) {
        registrar('liquido', '@designliquido/delprops', [
            ...(liquido.arquetipo || []),
            ...(liquido.linguagem || []),
        ]);
        registrar('liquido.aplicacao', '@designliquido/delprops', [
            ...(liquido.aplicacao || []),
        ]);
        registrar('liquido.roteador', '@designliquido/delprops', [
            ...(liquido.roteador || []),
        ]);
        registrar('liquido.dados', '@designliquido/delprops', [
            ...(liquido.dados || []),
        ]);
        registrar('liquido.autenticacao', '@designliquido/delprops', [
            ...(liquido.autenticacao || []),
        ]);
    }

    const esquemas = new Map<string, import('@designliquido/delprops').DefinicaoPropriedade[]>();
    const namespaces = ['liquido', 'liquido.aplicacao', 'liquido.aplicacao.licenca', 'liquido.roteador', 'liquido.dados', 'liquido.autenticacao'];
    for (const ns of namespaces) {
        const definicoes = obter(ns);
        if (definicoes.length > 0) {
            esquemas.set(ns, definicoes);
        }
    }

    if (resultadoCompreensao.propriedades.length > 0 && esquemas.size > 0) {
        const resultadoValidacao = validar(resultadoCompreensao.propriedades, esquemas);

        for (const aviso of resultadoValidacao.avisos) {
            const numeroLinha = Math.max(0, aviso.linha - 1);
            if (numeroLinha < documento.lineCount) {
                diagnosticos.push(new vscode.Diagnostic(
                    new vscode.Range(numeroLinha, 0, numeroLinha, Number.MAX_VALUE),
                    aviso.mensagem,
                    vscode.DiagnosticSeverity.Warning
                ));
            }
        }

        for (const erroValidacao of resultadoValidacao.erros) {
            const numeroLinha = Math.max(0, erroValidacao.linha - 1);
            if (numeroLinha < documento.lineCount) {
                diagnosticos.push(new vscode.Diagnostic(
                    new vscode.Range(numeroLinha, 0, numeroLinha, Number.MAX_VALUE),
                    erroValidacao.mensagem,
                    vscode.DiagnosticSeverity.Error
                ));
            }
        }
    }

    return diagnosticos;
}
