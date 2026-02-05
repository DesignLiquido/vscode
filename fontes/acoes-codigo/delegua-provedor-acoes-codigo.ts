import * as vscode from 'vscode';

import { obterResultado } from '../analise-codigo/cache-analise';
import { CorrecaoSugeridaInterface } from '@designliquido/delegua/interfaces';

/**
 * Provedor de ações de código para Delégua.
 */
export class DeleguaProvedorAcoesCodigo implements vscode.CodeActionProvider {
    public static readonly tiposAcoesRapidas = [
        vscode.CodeActionKind.QuickFix
    ];

    provideCodeActions(
        documento: vscode.TextDocument,
        range: vscode.Range | vscode.Selection,
        context: vscode.CodeActionContext,
        token: vscode.CancellationToken
    ): vscode.CodeAction[] | undefined {
        const resultado = obterResultado(documento.uri.toString());
        if (!resultado?.analisadorSemantico?.diagnosticos) {
            return;
        }

        const acoes: vscode.CodeAction[] = [];

        for (const diagnosticoVscode of context.diagnostics) {
            // Encontra um diagnóstico semântico correspondente ao diagnóstico do VSCode, verificando se há correções disponíveis.
            const diagnosticoSemantico: { correcoes: CorrecaoSugeridaInterface[] } | undefined = resultado.analisadorSemantico.diagnosticos.find(
                d => d.mensagem === diagnosticoVscode.message && d.correcoes?.length
            ) as { correcoes: CorrecaoSugeridaInterface[] } | undefined;

            if (diagnosticoSemantico?.correcoes) {
                for (const correcao of diagnosticoSemantico.correcoes) {
                    const numeroLinha = correcao.linha - 1;
                    const linhaTexto = documento.lineAt(numeroLinha).text;
                    const colunaInicio = linhaTexto.indexOf(correcao.textoOriginal, correcao.colunaInicio);
                    if (colunaInicio < 0) {
                        continue;
                    }

                    const acao = new vscode.CodeAction(
                        correcao.titulo,
                        vscode.CodeActionKind.QuickFix
                    );

                    acao.edit = new vscode.WorkspaceEdit();
                    acao.edit.replace(
                        documento.uri,
                        new vscode.Range(
                            numeroLinha, colunaInicio,
                            numeroLinha, colunaInicio + correcao.textoOriginal.length
                        ),
                        correcao.textoSubstituto
                    );

                    acao.diagnostics = [diagnosticoVscode];
                    acao.isPreferred = true;
                    acoes.push(acao);
                }
            }
        }

        return acoes;
    }
}