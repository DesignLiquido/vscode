import * as vscode from 'vscode';

import { AnalisadorSemantico } from '@designliquido/delegua/analisador-semantico';
import { AvaliadorSintaticoInterface, LexadorInterface, SimboloInterface } from '@designliquido/delegua/interfaces';
import { DiagnosticoAnalisadorSemantico } from '@designliquido/delegua/interfaces/erros';
import { Declaracao } from '@designliquido/delegua/declaracoes';

import { Lexador, LexadorPitugues } from '@designliquido/delegua/lexador';
import { AvaliadorSintaticoPitugues } from '@designliquido/delegua/avaliador-sintatico';
import { AnalisadorSemanticoInterface } from '@designliquido/delegua/interfaces/analisador-semantico-interface';
import { AnalisadorSemanticoPitugues } from '@designliquido/delegua/analisador-semantico/dialetos';

import { LexadorBirl } from '@designliquido/birl/lexador';
import { AvaliadorSintaticoBirl } from '@designliquido/birl/avaliador-sintatico';
import { AnalisadorSemanticoBirl } from '@designliquido/birl/analisador-semantico';

import { LexadorMapler } from '@designliquido/mapler/lexador';
import { AvaliadorSintaticoMapler } from '@designliquido/mapler/avaliador-sintatico';
import { AnalisadorSemanticoMapler } from '@designliquido/mapler/analisador-semantico';

import { RetornoAvaliadorSintatico, RetornoLexador } from '@designliquido/delegua/interfaces/retornos';
import { RetornoAnalisadorSemantico } from '@designliquido/delegua/interfaces/retornos/retorno-analisador-semantico';

import { LexadorPotigol } from '@designliquido/potigol/lexador';
import { AvaliadorSintaticoPotigol } from '@designliquido/potigol/avaliador-sintatico';
import { AnalisadorSemanticoPotigol } from '@designliquido/potigol/analisador-semantico';

import { LexadorPortugolStudio } from "@designliquido/portugol-studio/lexador";
import { AvaliadorSintaticoPortugolStudio } from "@designliquido/portugol-studio/avaliador-sintatico";
import { AnalisadorSemanticoPortugolStudio } from "@designliquido/portugol-studio/analisador-semantico";

import { LexadorVisuAlg, AvaliadorSintaticoVisuAlg, AnalisadorSemanticoVisuAlg } from '@designliquido/visualg';

import { formatarDiagnosticosAvaliacaoSintatica } from '../avaliacao-sintatica';
import { definirResultado, obterDiagnosticos, obterResultadoValido } from './cache-analise';
import { definirDefinicoes } from './cache-definicoes';
import { ImportadorExtensao } from '../importador';
import { AvaliadorSintaticoComImportacao } from '../avaliacao-sintatica/avaliador-sintatico-com-importacao';
import { AnalisadorSemanticoPituguesLiquido } from '../avaliacao-sintatica/analisador-semantico-pitugues-liquido';
import { AvaliadorSintaticoPituguesLiquido } from '../avaliacao-sintatica/avaliador-sintatico-pitugues-liquido';
import { descobrirDefinicoes } from '../descobridor-definicoes';
import { cyrb53 } from '@designliquido/delegua';

const mapaSeveridadeDiagnosticos = {
    0: vscode.DiagnosticSeverity.Error,
    1: vscode.DiagnosticSeverity.Warning,
    2: vscode.DiagnosticSeverity.Information,
    3: vscode.DiagnosticSeverity.Hint,
    'erro': vscode.DiagnosticSeverity.Error,
    'aviso': vscode.DiagnosticSeverity.Warning,
    'informacao': vscode.DiagnosticSeverity.Information,
    'dica': vscode.DiagnosticSeverity.Hint
};

/**
 * Ponto de entrada de todas as análises, léxicas, sintáticas e semânticas, selecionando o dialeto pela extensão de arquivo.
 * Problemas são detectados na análise sintática. Avisos são detectados na análise semântica. Ambos são reportados para o VSCode por meio do objeto `diagnosticos`.
 * @param {vscode.TextDocument} documento O documento aberto no VSCode.
 * @param {vscode.DiagnosticCollection} diagnosticos O objeto de diagnósticos, que instrui o VSCode
 *                                                   a mostrar os problemas atuais.
 */
export async function executarAnalises(
    documento: vscode.TextDocument,
    diagnosticos: vscode.DiagnosticCollection
): Promise<void> {
    const extensaoArquivo = documento.fileName.split('.')[1];
    if (!['alg', 'birl', 'delegua', 'mapler', 'pitu', 'pitugues', 'por', 'poti', 'potigol', 'visualg'].includes(extensaoArquivo)) {
        return;
    }

    const uriDocumento = documento.uri.toString();
    const textoDocumento = documento.getText();
    const hashConteudo = cyrb53(textoDocumento);

    const resultadoEmCache = obterResultadoValido(uriDocumento, {
        versaoDocumento: documento.version,
        hashConteudo,
    });

    if (resultadoEmCache) {
        diagnosticos.set(documento.uri, obterDiagnosticos(uriDocumento) || []);
        return;
    }

    let lexador: LexadorInterface<SimboloInterface> | undefined = undefined;
    let avaliadorSintatico: AvaliadorSintaticoInterface<SimboloInterface, Declaracao> | undefined = undefined;
    let analisadorSemantico: AnalisadorSemanticoInterface | undefined = undefined;
    let linhas: string[];
    let resultadoLexador: RetornoLexador<SimboloInterface>;
    let resultadoAvaliadorSintatico: RetornoAvaliadorSintatico<Declaracao>;
    let resultadoAnalisadorSemantico: RetornoAnalisadorSemantico | undefined = undefined;
    let declaracoesPreCarregadas: Declaracao[] = [];
    let dependenciasArquivos: string[] = [];

    switch (extensaoArquivo) {
        case "birl":
            lexador = new LexadorBirl();
            avaliadorSintatico = new AvaliadorSintaticoBirl();
            analisadorSemantico = new AnalisadorSemanticoBirl();
            break;

        case "mapler":
            lexador = new LexadorMapler();
            avaliadorSintatico = new AvaliadorSintaticoMapler();
            analisadorSemantico = new AnalisadorSemanticoMapler();
            break;

        case "delegua":
            lexador = new Lexador();
            const importador = new ImportadorExtensao(lexador);
            const separador = documento.fileName.lastIndexOf('/') !== -1 ? '/' : '\\';

            importador.diretorioBase = documento.fileName.substring(0, documento.fileName.lastIndexOf(separador));
            const avaliadorComImportacao = new AvaliadorSintaticoComImportacao(importador);
            const arquivoDeRotaLiquido = /[\\\/]rotas[\\\/]/i.test(documento.fileName);
            
            avaliadorComImportacao.definirContextoLiquido(arquivoDeRotaLiquido);
            avaliadorComImportacao.diagnosticos = diagnosticos;
            await avaliadorComImportacao.preCarregarDefinicoes(await descobrirDefinicoes(arquivoDeRotaLiquido));

            if (arquivoDeRotaLiquido) {
                const aliasesContextoLiquido: Record<string, string> = {
                    Liquido: 'liquido',
                    Requisicao: 'requisicao',
                    Resposta: 'resposta',
                };

                for (const [nomePascal, nomeVariavel] of Object.entries(aliasesContextoLiquido)) {
                    const declaracaoClasse = avaliadorComImportacao.tiposDefinidosEmCodigo[nomePascal];
                    if (declaracaoClasse) {
                        avaliadorComImportacao.tiposDefinidosEmCodigo[nomeVariavel] = {
                            simbolo: { lexema: nomeVariavel, linha: (declaracaoClasse as any).simbolo?.linha ?? 1 },
                            caminhoArquivoDefinicao: (declaracaoClasse as any).caminhoArquivoDefinicao,
                        } as any;
                    }
                }
            }

            const analisadorSemanticoDelegua = new AnalisadorSemantico();
            avaliadorSintatico = avaliadorComImportacao;
            analisadorSemantico = analisadorSemanticoDelegua;
            break;

        case "pitu":
        case "pitugues":
            lexador = new LexadorPitugues();
            const emRotaLiquidoPitu = /[\\\/]rotas[\\\/]/i.test(documento.fileName);
            avaliadorSintatico = emRotaLiquidoPitu
                ? new AvaliadorSintaticoPituguesLiquido()
                : new AvaliadorSintaticoPitugues();
            analisadorSemantico = emRotaLiquidoPitu
                ? new AnalisadorSemanticoPituguesLiquido()
                : new AnalisadorSemanticoPitugues();
            break;

        case "poti":
        case "potigol":
            lexador = new LexadorPotigol();
            avaliadorSintatico = new AvaliadorSintaticoPotigol();
            analisadorSemantico = new AnalisadorSemanticoPotigol();
            break;
            
        case "alg":
        case "visualg":
            lexador = new LexadorVisuAlg();
            avaliadorSintatico = new AvaliadorSintaticoVisuAlg();
            analisadorSemantico = new AnalisadorSemanticoVisuAlg();
            break;
            
        case "por":
            lexador = new LexadorPortugolStudio();
            avaliadorSintatico = new AvaliadorSintaticoPortugolStudio();
            analisadorSemantico = new AnalisadorSemanticoPortugolStudio();
            break;

        default:
            return;
    }

    linhas = textoDocumento.split('\n').map(l => l + '\0');
    const hashArquivo = cyrb53(uriDocumento);
    resultadoLexador = lexador!.mapear(linhas, hashArquivo);
    let listaOcorrencias: vscode.Diagnostic[] = [];

    resultadoAvaliadorSintatico = await avaliadorSintatico!.analisar(resultadoLexador, hashArquivo);

    if (avaliadorSintatico instanceof AvaliadorSintaticoComImportacao) {
        analisadorSemantico?.definirClassesExternasConhecidas?.(
            Object.keys(avaliadorSintatico.tiposDefinidosEmCodigo)
        );
        declaracoesPreCarregadas = Object.values(avaliadorSintatico.tiposDefinidosEmCodigo);

        const chaveWorkspace = vscode.workspace.workspaceFolders?.[0]?.uri.toString() || 'sem-workspace';
        const arquivoDeRotaLiquidoFinal = /[\\\/]rotas[\\\/]/i.test(documento.fileName);
        definirDefinicoes(
            `${chaveWorkspace}::${arquivoDeRotaLiquidoFinal ? 'liquido' : 'normal'}`,
            { ...avaliadorSintatico.tiposDefinidosEmCodigo }
        );

        dependenciasArquivos = Array.from(new Set(
            declaracoesPreCarregadas
                .map((declaracao: any) => declaracao?.caminhoArquivoDefinicao)
                .filter((caminho: string | undefined) => Boolean(caminho))
        )) as string[];
    }

    try {
        if (resultadoAvaliadorSintatico?.erros?.length) {
            listaOcorrencias = listaOcorrencias.concat(
                formatarDiagnosticosAvaliacaoSintatica(
                    resultadoAvaliadorSintatico.erros,
                    documento
                )
            );
        }

        if (analisadorSemantico !== undefined) {
            try {
                resultadoAnalisadorSemantico = await analisadorSemantico.analisar(resultadoAvaliadorSintatico.declaracoes);
                listaOcorrencias = listaOcorrencias.concat(formatarDiagnosticosAnaliseSemantica(resultadoAnalisadorSemantico.diagnosticos, documento));
                diagnosticos.set(documento.uri, listaOcorrencias);
            } catch (erro: any) {
                resultadoAnalisadorSemantico = {
                    diagnosticos: []
                } as RetornoAnalisadorSemantico;
                console.error(`Erro ao executar análise semântica para arquivo de extensão ${extensaoArquivo}`, erro);
            }
        }
    } catch (erro: any) {
        console.error(`Erro ao formatar diagnósticos para arquivo de extensão ${extensaoArquivo}`, erro);
    }

    definirResultado(uriDocumento, {
        lexador: resultadoLexador,
        avaliadorSintatico: resultadoAvaliadorSintatico,
        analisadorSemantico: resultadoAnalisadorSemantico || { diagnosticos: [] },
        declaracoesPreCarregadas
    }, {
        versaoDocumento: documento.version,
        hashConteudo,
        diagnosticos: listaOcorrencias,
        dependenciasArquivos,
    });
}

/**
 * Formata os diagnósticos encontrados na análise semântica para o formato de diagnósticos do VSCode.
 * @param diagnosticosAnaliseSemantica Os diagnósticos encontrados na análise semântica.
 * @param documento O documento aberto no VSCode.
 * @returns {vscode.Diagnostic[]} Uma lista de diagnósticos formatados para o VSCode.
 */
function formatarDiagnosticosAnaliseSemantica(
    diagnosticosAnaliseSemantica: DiagnosticoAnalisadorSemantico[],
    documento: vscode.TextDocument
): vscode.Diagnostic[] {
    const listaOcorrenciasSemanticas: vscode.Diagnostic[] = diagnosticosAnaliseSemantica.map(diagnostico => {
        const numeroLinha = Number(diagnostico.linha) - 1;
        const linha: vscode.TextLine = documento.lineAt(numeroLinha);
        const textoLinha = linha.text;
        const intervaloTexto = new vscode.Range(numeroLinha, 0, numeroLinha, textoLinha.length);

        return new vscode.Diagnostic(
            intervaloTexto,
            String(diagnostico.mensagem),
            mapaSeveridadeDiagnosticos[diagnostico.severidade]
        );
    });

    return listaOcorrenciasSemanticas;
}
