import * as vscode from 'vscode';

import { AnalisadorSemantico } from '@designliquido/delegua/analisador-semantico';
import { AvaliadorSintaticoInterface, LexadorInterface, SimboloInterface } from '@designliquido/delegua/interfaces';
import { DiagnosticoAnalisadorSemantico } from '@designliquido/delegua/interfaces/erros';
import { Declaracao } from '@designliquido/delegua/declaracoes';

import { Lexador } from '@designliquido/delegua/lexador';
import { LexadorBirl, LexadorMapler } from '@designliquido/delegua/lexador/dialetos';

import { AvaliadorSintatico } from '@designliquido/delegua/avaliador-sintatico';
import { AvaliadorSintaticoBirl, AvaliadorSintaticoMapler } from '@designliquido/delegua/avaliador-sintatico/dialetos';

import { AnalisadorSemanticoInterface } from '@designliquido/delegua/interfaces/analisador-semantico-interface';
import { AnalisadorSemanticoBirl, AnalisadorSemanticoMapler } from '@designliquido/delegua/analisador-semantico/dialetos';

import { RetornoAvaliadorSintatico, RetornoLexador } from '@designliquido/delegua/interfaces/retornos';
import { RetornoAnalisadorSemantico } from '@designliquido/delegua/interfaces/retornos/retorno-analisador-semantico';

import { LexadorVisuAlg, AvaliadorSintaticoVisuAlg, AnalisadorSemanticoVisuAlg } from '@designliquido/visualg';

const diagnosticSeverityMap = {
    0: vscode.DiagnosticSeverity.Error,
    1: vscode.DiagnosticSeverity.Warning,
    2: vscode.DiagnosticSeverity.Information,
    3: vscode.DiagnosticSeverity.Hint
};


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
            
        case "visualg":
            lexador = new LexadorVisuAlg();
            avaliadorSintatico = new AvaliadorSintaticoVisuAlg();
            analisadorSemantico = new AnalisadorSemanticoVisuAlg();
            break;

        case "alg":
            lexador = new LexadorVisuAlg();
            avaliadorSintatico = new AvaliadorSintaticoVisuAlg();
            analisadorSemantico = new AnalisadorSemanticoVisuAlg(); 
            break;

        default:
            return;
    }

    linhas = documento.getText().split('\n').map(l => l + '\0');
    resultadoLexador = lexador.mapear(linhas, -1);
    resultadoAvaliadorSintatico = avaliadorSintatico.analisar(resultadoLexador, -1);
    resultadoAnalisadorSemantico = analisadorSemantico.analisar(resultadoAvaliadorSintatico.declaracoes);
    popularDiagnosticos(resultadoAnalisadorSemantico.diagnosticos, diagnosticos, documento);
}

function popularDiagnosticos(
    diagnosticosAnaliseSemantica: DiagnosticoAnalisadorSemantico[],
    diagnosticos: vscode.DiagnosticCollection,
    documento: vscode.TextDocument
) {
    const listaOcorrenciasSemanticas: vscode.Diagnostic[] = diagnosticosAnaliseSemantica.map(diagnostico => {
        const numeroLinha = Number(diagnostico.linha) - 1;
        const linha = documento.lineAt(numeroLinha);
        const textoLinha = linha.text;
        const range = new vscode.Range(numeroLinha, 0, numeroLinha, textoLinha.length);

        return new vscode.Diagnostic(
            range,
            String(diagnostico.mensagem),
            diagnosticSeverityMap[diagnostico.severidade]
        );
    });

    diagnosticos.set(documento.uri, listaOcorrenciasSemanticas);
}
