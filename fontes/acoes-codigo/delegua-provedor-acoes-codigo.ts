import * as vscode from 'vscode';

import { obterResultado } from '../analise-codigo/cache-analise';
import { CorrecaoSugeridaInterface } from '@designliquido/delegua/interfaces';
import { CorrecaoImplementacaoInterface, MembroInterfaceFaltando } from '@designliquido/delegua/avaliador-sintatico';

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

        // Correções rápidas para implementação de interfaces (erros do avaliador sintático).
        const errosSintaticos = resultado.avaliadorSintatico?.erros || [];
        // Agrupa correções de interface por classe+interface para evitar ações duplicadas.
        const correcoesPorInterface = new Map<string, { correcao: CorrecaoImplementacaoInterface; diagnosticos: vscode.Diagnostic[] }>();

        for (const diagnosticoVscode of context.diagnostics) {
            const erroSintatico = errosSintaticos.find(
                e => e.message === diagnosticoVscode.message && e.correcaoSugerida?.tipo === 'implementar-interface'
            );

            if (erroSintatico?.correcaoSugerida) {
                const correcao = erroSintatico.correcaoSugerida as CorrecaoImplementacaoInterface;
                const chave = `${correcao.nomeClasse}::${correcao.nomeInterface}`;

                if (!correcoesPorInterface.has(chave)) {
                    correcoesPorInterface.set(chave, { correcao, diagnosticos: [] });
                }
                correcoesPorInterface.get(chave)!.diagnosticos.push(diagnosticoVscode);
            }
        }

        for (const { correcao, diagnosticos } of correcoesPorInterface.values()) {
            const linhaInsercao = correcao.linhaFinalClasse - 1;
            const membrosOrdenados = [...correcao.membrosFaltando].sort((a, b) => {
                if (a.tipo === b.tipo) return 0;
                return a.tipo === 'propriedade' ? -1 : 1;
            });
            const esbocoCodigo = membrosOrdenados.map(m => this.gerarEsbocoMembro(m)).join('\n');

            const acao = new vscode.CodeAction(
                `Implementar membros de '${correcao.nomeInterface}' em '${correcao.nomeClasse}'`,
                vscode.CodeActionKind.QuickFix
            );

            acao.edit = new vscode.WorkspaceEdit();
            acao.edit.insert(
                documento.uri,
                new vscode.Position(linhaInsercao, 0),
                esbocoCodigo + '\n'
            );

            acao.diagnostics = diagnosticos;
            acao.isPreferred = true;
            acoes.push(acao);
        }

        return acoes;
    }

    private gerarEsbocoMembro(membro: MembroInterfaceFaltando): string {
        if (membro.tipo === 'metodo') {
            const parametros = (membro.parametros || [])
                .map(p => p.tipoDado ? `${p.nome}: ${p.tipoDado}` : p.nome)
                .join(', ');
            const tipoRetorno = membro.tipoRetorno ? `: ${membro.tipoRetorno}` : '';
            return `\t${membro.nome}(${parametros})${tipoRetorno} {\n\t\t// AFAZER\n\t}`;
        }

        const tipo = membro.tipoPropriedade ? `: ${membro.tipoPropriedade}` : '';
        return `\t${membro.nome}${tipo}`;
    }
}