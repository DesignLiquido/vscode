import * as vscode from 'vscode';

import { AnalisadorSemantico } from '@designliquido/delegua/analisador-semantico';
import { AvaliadorSintaticoInterface, LexadorInterface, SimboloInterface } from '@designliquido/delegua/interfaces';
import { DiagnosticoAnalisadorSemantico } from '@designliquido/delegua/interfaces/erros';
import { Declaracao } from '@designliquido/delegua/declaracoes';

import { Lexador } from '@designliquido/delegua/lexador';
import { AvaliadorSintatico, ErroAvaliadorSintatico } from '@designliquido/delegua/avaliador-sintatico';
import { AnalisadorSemanticoInterface } from '@designliquido/delegua/interfaces/analisador-semantico-interface';

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

import { LexadorVisuAlg, AvaliadorSintaticoVisuAlg, AnalisadorSemanticoVisuAlg } from '@designliquido/visualg';
// import { LexadorPortugolStudio } from "@designliquido/portugol-studio/lexador";
// import { AvaliadorSintaticoPortugolStudio } from "@designliquido/portugol-studio/avaliador-sintatico";
// import { AnalisadorSemanticoPortugolStudio } from "@designliquido/portugol-studio/analisador-semantico";

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
 * Ponto de entrada de todas as análises semânticas, selecionando o dialeto pela extensão de arquivo.
 * Alguns problemas são detectados na análise sintática.
 * @param {vscode.TextDocument} documento O documento aberto no VSCode.
 * @param {vscode.DiagnosticCollection} diagnosticos O objeto de diagnósticos, que instrui o VSCode
 *                                                   a mostrar os problemas atuais.
 */
export function analiseSemantica(
    documento: vscode.TextDocument,
    diagnosticos: vscode.DiagnosticCollection
): void {
    const extensaoArquivo = documento.fileName.split('.')[1];
    let lexador: LexadorInterface<SimboloInterface>;
    let avaliadorSintatico: AvaliadorSintaticoInterface<SimboloInterface, Declaracao>;
    let analisadorSemantico: AnalisadorSemanticoInterface;
    let linhas: string[];
    let resultadoLexador: RetornoLexador<SimboloInterface>;
    let resultadoAvaliadorSintatico: RetornoAvaliadorSintatico<Declaracao>;
    let resultadoAnalisadorSemantico: RetornoAnalisadorSemantico;

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
            avaliadorSintatico = new AvaliadorSintatico();
            analisadorSemantico = new AnalisadorSemantico();
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
        /* case "por":
            lexador = new LexadorPortugolStudio();
            avaliadorSintatico = new AvaliadorSintaticoPortugolStudio();
            analisadorSemantico = new AnalisadorSemanticoPortugolStudio();
            break; */

        default:
            return;
    }

    linhas = documento.getText().split('\n').map(l => l + '\0');
    resultadoLexador = lexador.mapear(linhas, -1);
    let listaOcorrencias: vscode.Diagnostic[] = [];

    // TODO: Mudar isso quando avaliadores sintáticos não mais emitirem `throw` de erros.
    try {
        resultadoAvaliadorSintatico = avaliadorSintatico.analisar(resultadoLexador, -1);
    } catch (erro: any) {
        resultadoAvaliadorSintatico = {
            declaracoes: [],
            erros: [erro]
        } as RetornoAvaliadorSintatico<Declaracao>;

        listaOcorrencias = listaOcorrencias.concat(
            formatarDiagnosticosAvaliacaoSintatica(
                resultadoAvaliadorSintatico.erros,
                documento
            )
        );
    }

    try {
        resultadoAnalisadorSemantico = analisadorSemantico.analisar(resultadoAvaliadorSintatico.declaracoes);
        listaOcorrencias = listaOcorrencias.concat(formatarDiagnosticosAnaliseSemantica(resultadoAnalisadorSemantico.diagnosticos, documento));
        diagnosticos.set(documento.uri, listaOcorrencias);
    } catch (erro: any) {
        console.error(`Erro ao executar análise semântica para arquivo de extensão ${extensaoArquivo}`, erro);
    }
}

function formatarDiagnosticosAvaliacaoSintatica(
    errosAvaliacaoSintatica: ErroAvaliadorSintatico[],
    documento: vscode.TextDocument
): vscode.Diagnostic[] {
    const listaOcorrenciasSintaticas: vscode.Diagnostic[] = [];
    for (let erro of errosAvaliacaoSintatica) {
        const numeroLinha = Number(erro.simbolo.linha) - 1;
        const linha: vscode.TextLine = documento.lineAt(numeroLinha);
        const textoLinha = linha.text;
        const intervaloTexto = new vscode.Range(numeroLinha, 0, numeroLinha, textoLinha.length);

        listaOcorrenciasSintaticas.push(new vscode.Diagnostic(
            intervaloTexto,
            String(erro.message),
            vscode.DiagnosticSeverity.Error
        ));
    }

    return listaOcorrenciasSintaticas;
}

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
