import * as vscode from 'vscode';

import { AnalisadorSemantico } from '@designliquido/delegua/fontes/analisador-semantico';
import { avaliadores, lexadores } from '@designliquido/delegua';
import { AvaliadorSintaticoInterface, LexadorInterface, SimboloInterface } from '@designliquido/delegua/fontes/interfaces';
import { DiagnosticoAnalisadorSemantico } from '@designliquido/delegua/fontes/interfaces/erros';
import { Declaracao } from '@designliquido/delegua/fontes/declaracoes';

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
    let analisadorSemantico: AnalisadorSemantico;
    
    switch (extensaoArquivo) {
        case "delegua":
            lexador = new lexadores.Lexador();
            avaliadorSintatico = new avaliadores.AvaliadorSintatico();
            analisadorSemantico = new AnalisadorSemantico(); 

            const linhas = documento.getText().split('\n').map(l => l + '\0');
            const resultadoLexador = lexador.mapear(linhas, -1);
            const resultadoAvaliadorSintatico = avaliadorSintatico.analisar(resultadoLexador, -1);
            const resultadoAnalisadorSemantico = analisadorSemantico.analisar(resultadoAvaliadorSintatico.declaracoes);
            popularDiagnosticos(resultadoAnalisadorSemantico.diagnosticos, diagnosticos, documento);   
    }
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
