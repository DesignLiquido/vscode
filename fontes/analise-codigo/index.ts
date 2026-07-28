import * as vscode from 'vscode';

import { AnalisadorSemantico } from '@designliquido/delegua/analisador-semantico';
import { AvaliadorSintaticoInterface, LexadorInterface, SimboloInterface } from '@designliquido/delegua/interfaces';
import { DiagnosticoAnalisadorSemanticoInterface } from '@designliquido/delegua/interfaces/erros';
import { Classe, Declaracao } from '@designliquido/delegua/declaracoes';

import { Lexador, LexadorPitugues } from '@designliquido/delegua/lexador';
import { AvaliadorSintaticoPitugues } from '@designliquido/delegua/avaliador-sintatico';
import { AnalisadorSemanticoInterface } from '@designliquido/delegua/interfaces/analisador-semantico-interface';
import { AnalisadorSemanticoPitugues } from '@designliquido/delegua/analisador-semantico/dialetos';

import { RetornoAvaliadorSintaticoInterface, RetornoLexadorInterface, RetornoAnalisadorSemanticoInterface } from '@designliquido/delegua/interfaces/retornos';

import { formatarDiagnosticosAvaliacaoSintatica } from '../avaliacao-sintatica';
import { definirResultado, obterDiagnosticos, obterResultadoValido } from '@designliquido/delegua-lsp/analise/cache-analise';
import { definirDefinicoes } from '@designliquido/delegua-lsp/analise/cache-definicoes';
import { ImportadorExtensao } from '../importador';
import { AvaliadorSintaticoComImportacao } from '../avaliacao-sintatica/avaliador-sintatico-com-importacao';
import { AnalisadorSemanticoPituguesLiquido } from '../analise-semantica/analisador-semantico-pitugues-liquido';
import { AvaliadorSintaticoPituguesLiquido } from '../avaliacao-sintatica/avaliador-sintatico-pitugues-liquido';
import { descobrirDefinicoes } from '../descobridor-definicoes';
import { cyrb53 } from '@designliquido/delegua';
import { AnalisadorSemanticoTestes } from './analisador-semantico-testes';
import { verificarConfiguracaoLincones } from './verificar-lincones';
import { validarLmht } from './validar-lmht';
import { validarFoles } from './validar-foles';

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
    const extensaoArquivo = documento.languageId === 'delegua-testes'
        ? 'delegua'
        : documento.fileName.split('.')[1];
    if (!['alg', 'birl', 'delegua', 'mapler', 'pitu', 'pitugues', 'por', 'poti', 'potigol', 'visualg', 'foles', 'lmht', 'lincones'].includes(extensaoArquivo) &&
        !['foles', 'lmht', 'lincones'].includes(documento.languageId)) {
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
    let resultadoLexador: RetornoLexadorInterface<SimboloInterface>;
    let resultadoAvaliadorSintatico: RetornoAvaliadorSintaticoInterface<Declaracao>;
    let resultadoAnalisadorSemantico: RetornoAnalisadorSemanticoInterface | undefined = undefined;
    let declaracoesPreCarregadas: Declaracao[] = [];
    let dependenciasArquivos: string[] = [];

    switch (extensaoArquivo) {
        case "birl": {
            const { LexadorBirl } = await import('@designliquido/birl/lexador');
            const { AvaliadorSintaticoBirl } = await import('@designliquido/birl/avaliador-sintatico');
            const { AnalisadorSemanticoBirl } = await import('@designliquido/birl/analisador-semantico');
            lexador = new LexadorBirl();
            avaliadorSintatico = new AvaliadorSintaticoBirl();
            analisadorSemantico = new AnalisadorSemanticoBirl();
            break;
        }

        case "mapler": {
            const { LexadorMapler } = await import('@designliquido/mapler/lexador');
            const { AvaliadorSintaticoMapler } = await import('@designliquido/mapler/avaliador-sintatico');
            const { AnalisadorSemanticoMapler } = await import('@designliquido/mapler/analisador-semantico');
            lexador = new LexadorMapler();
            avaliadorSintatico = new AvaliadorSintaticoMapler();
            analisadorSemantico = new AnalisadorSemanticoMapler();
            break;
        }

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
                    Lincones: 'lincones',
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
        case "potigol": {
            const { LexadorPotigol } = await import('@designliquido/potigol/lexador');
            const { AvaliadorSintaticoPotigol } = await import('@designliquido/potigol/avaliador-sintatico');
            const { AnalisadorSemanticoPotigol } = await import('@designliquido/potigol/analisador-semantico');
            lexador = new LexadorPotigol();
            avaliadorSintatico = new AvaliadorSintaticoPotigol();
            analisadorSemantico = new AnalisadorSemanticoPotigol();
            break;
        }

        case "alg":
        case "visualg": {
            const { LexadorVisuAlg, AvaliadorSintaticoVisuAlg, AnalisadorSemanticoVisuAlg } = await import('@designliquido/visualg');
            lexador = new LexadorVisuAlg();
            avaliadorSintatico = new AvaliadorSintaticoVisuAlg();
            analisadorSemantico = new AnalisadorSemanticoVisuAlg();
            break;
        }

        case "por": {
            const { LexadorPortugolStudio } = await import('@designliquido/portugol-studio/lexador');
            const { AvaliadorSintaticoPortugolStudio } = await import('@designliquido/portugol-studio/avaliador-sintatico');
            const { AnalisadorSemanticoPortugolStudio } = await import('@designliquido/portugol-studio/analisador-semantico');
            lexador = new LexadorPortugolStudio();
            avaliadorSintatico = new AvaliadorSintaticoPortugolStudio();
            analisadorSemantico = new AnalisadorSemanticoPortugolStudio();
            break;
        }

        case "foles":
            diagnosticos.set(documento.uri, validarFoles(documento));
            return;

        case "lmht":
            diagnosticos.set(documento.uri, validarLmht(documento));
            return;

        case "lincones": {
            const { Lexador: LexadorLinConEs } = await import('@designliquido/lincones-js');
            const { AvaliadorSintatico: AvaliadorSintaticoLinConEs } = await import('@designliquido/lincones-js');

            const diagnosticosLocais: vscode.Diagnostic[] = [];
            const linhasLinConEs = textoDocumento.split('\n');
            const lexadorLinConEs = new LexadorLinConEs();
            const resultadoLexadorLinConEs = lexadorLinConEs.mapear(linhasLinConEs);

            for (const erroLexador of resultadoLexadorLinConEs.erros || []) {
                const numeroLinha = Math.max(0, Number(erroLexador.linha) - 1);
                if (numeroLinha < documento.lineCount) {
                    diagnosticosLocais.push(new vscode.Diagnostic(
                        new vscode.Range(numeroLinha, 0, numeroLinha, documento.lineAt(numeroLinha).text.length),
                        String(erroLexador.mensagem),
                        vscode.DiagnosticSeverity.Error
                    ));
                }
            }

            const avaliadorSintaticoLinConEs = new AvaliadorSintaticoLinConEs();
            const resultadoAvaliadorLinConEs = avaliadorSintaticoLinConEs.analisar(resultadoLexadorLinConEs);

            if (resultadoAvaliadorLinConEs?.erros?.length) {
                for (const erro of resultadoAvaliadorLinConEs.erros) {
                    const numeroLinha = Math.max(0, Number(erro.simbolo?.linha) - 1);
                    if (numeroLinha < documento.lineCount) {
                        diagnosticosLocais.push(new vscode.Diagnostic(
                            new vscode.Range(numeroLinha, 0, numeroLinha, documento.lineAt(numeroLinha).text.length),
                            String(erro.message),
                            vscode.DiagnosticSeverity.Error
                        ));
                    }
                }
            }

            diagnosticos.set(documento.uri, diagnosticosLocais);
            return;
        }

        default:
            return;
    }

    linhas = textoDocumento.split('\n').map(l => l + '\0');
    const hashArquivo = cyrb53(uriDocumento);
    resultadoLexador = lexador!.mapear(linhas, hashArquivo);
    let listaOcorrencias: vscode.Diagnostic[] = [];

    resultadoAvaliadorSintatico = await avaliadorSintatico!.analisar(resultadoLexador, hashArquivo);

    if (avaliadorSintatico instanceof AvaliadorSintaticoComImportacao) {
        declaracoesPreCarregadas = Object.values(avaliadorSintatico.tiposDefinidosEmCodigo);
        (analisadorSemantico as any)?.registrarClassesExternas?.(declaracoesPreCarregadas.filter(d => d instanceof Classe));

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

    // Arquivos de teste: o analisador semântico especializado pré-declara os símbolos
    // do módulo `testes` (runtime). Erros sintáticos são suprimidos porque decorrem
    // da impossibilidade de resolver `importar { ... } de "testes"` estaticamente.
    if (documento.languageId === 'delegua-testes') {
        analisadorSemantico = new AnalisadorSemanticoTestes();
    }

    try {
        if (resultadoAvaliadorSintatico?.erros?.length && documento.languageId !== 'delegua-testes') {
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
                } as RetornoAnalisadorSemanticoInterface;
                console.error(`Erro ao executar análise semântica para arquivo de extensão ${extensaoArquivo}`, erro);
            }
        }
    } catch (erro: any) {
        console.error(`Erro ao formatar diagnósticos para arquivo de extensão ${extensaoArquivo}`, erro);
    }

    const diagnosticosLincones = await verificarConfiguracaoLincones(documento);
    if (diagnosticosLincones.length > 0) {
        listaOcorrencias = listaOcorrencias.concat(diagnosticosLincones);
        diagnosticos.set(documento.uri, listaOcorrencias);
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
    diagnosticosAnaliseSemantica: DiagnosticoAnalisadorSemanticoInterface[],
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
