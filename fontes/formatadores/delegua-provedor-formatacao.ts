import * as vscode from 'vscode';

import { AvaliadorSintatico } from '@designliquido/delegua/avaliador-sintatico';
import { FormatadorDelegua } from '@designliquido/delegua/formatadores';
import { Lexador } from '@designliquido/delegua/lexador';
import { EstilizadorDelegua } from '@designliquido/delegua';
import { RegraFortalecerTipos, RegraConvencaoNomenclatura, RegraExplicitarTiposParametros } from '@designliquido/delegua/estilizador/regras';
import { OpcoesFormatacaoEstilizadorInterface } from '@designliquido/delegua/interfaces/estilizador';
import { OpcoesFormatadorDeleguaInterface } from '@designliquido/delegua/interfaces/formatador';
import { DelimitadorTextoFormatacao } from '@designliquido/delegua/tipos';

import { formatarDiagnosticosAvaliacaoSintatica } from '../avaliacao-sintatica';

export class DeleguaProvedorFormatacao implements vscode.DocumentFormattingEditProvider {
    constructor(private readonly diagnosticosDelegua: vscode.DiagnosticCollection) {}

    async provideDocumentFormattingEdits(documento: vscode.TextDocument, options: vscode.FormattingOptions, token: vscode.CancellationToken): Promise<vscode.TextEdit[] | null> {
        const lexador = new Lexador();
        const avaliadorSintatico = new AvaliadorSintatico(false);

        // Ler configurações do estilizador
        const configuracao = vscode.workspace.getConfiguration('delegua.estilizador');
        const estilizadorHabilitado = configuracao.get<boolean>('habilitado', true);
        const delimitadorTexto = configuracao.get<DelimitadorTextoFormatacao>('delimitadorTexto', 'preservar');

        // Definição de final da linha.
        const caracterFimDaLinha = documento.eol === vscode.EndOfLine.CRLF ? '\r\n' : '\n';
        const opcoesFormatador: OpcoesFormatadorDeleguaInterface = { delimitadorTexto };
        const formatador = new FormatadorDelegua(caracterFimDaLinha, 4, opcoesFormatador);

        const resultadoLexador = lexador.mapear(documento.getText().split('\n'), -1);
        const resultadoAvaliacaoSintatica = await avaliadorSintatico.analisar(resultadoLexador, -1);

        if (resultadoAvaliacaoSintatica.erros.length > 0) {
            let listaOcorrencias: vscode.Diagnostic[] = [];
            listaOcorrencias = listaOcorrencias.concat(
                formatarDiagnosticosAvaliacaoSintatica(
                    resultadoAvaliacaoSintatica.erros,
                    documento
                )
            );
            this.diagnosticosDelegua.set(documento.uri, listaOcorrencias);

            return null;
        }

        let declaracoesProcessadas = resultadoAvaliacaoSintatica.declaracoes;

        let codigoFormatado: string = documento.getText();
        try {
            if (estilizadorHabilitado) {
                const estilizador = new EstilizadorDelegua();

                // Adicionar regra de fortalecimento de tipos se habilitada
                const fortalecerTiposHabilitado = configuracao.get<boolean>('fortalecerTipos.habilitado', false);
                if (fortalecerTiposHabilitado) {
                    estilizador.adicionarRegra(new RegraFortalecerTipos());
                }

                const explicitarTiposParametrosHabilitado = configuracao.get<boolean>('explicitarTiposParametros.habilitado', false);
                if (explicitarTiposParametrosHabilitado) {
                    estilizador.adicionarRegra(new RegraExplicitarTiposParametros());
                }

                // Adicionar regra de convenção de nomenclatura se habilitada
                const convencaoNomenclaturaHabilitada = configuracao.get<boolean>('convencaoNomenclatura.habilitado', false);
                if (convencaoNomenclaturaHabilitada) {
                    const opcoesConvencao = {
                        variavel: configuracao.get<'caixaCamelo' | 'caixa_cobra' | 'CaixaPascal'>('convencaoNomenclatura.variaveis', 'caixaCamelo'),
                        constante: configuracao.get<'CAIXA_ALTA' | 'caixaCamelo'>('convencaoNomenclatura.constantes', 'CAIXA_ALTA'),
                        funcao: configuracao.get<'caixaCamelo' | 'caixa_cobra' | 'CaixaPascal'>('convencaoNomenclatura.funcoes', 'caixaCamelo')
                    };

                    estilizador.adicionarRegra(new RegraConvencaoNomenclatura(opcoesConvencao));
                }

                const opcoesEstilizador: OpcoesFormatacaoEstilizadorInterface = {
                    delimitadorTexto,
                    quebraLinha: caracterFimDaLinha,
                };
                codigoFormatado = estilizador.estilizarEFormatar(declaracoesProcessadas, opcoesEstilizador);
            } else {
                codigoFormatado = formatador.formatar(declaracoesProcessadas);
            }
        } catch (erro) {
            console.error(erro);
        }

        return [
            vscode.TextEdit.replace(
                new vscode.Range(
                    documento.lineAt(0).range.start,
                    documento.lineAt(documento.lineCount - 1).range.end
                ),
                codigoFormatado
            ),
        ];
    }
}
