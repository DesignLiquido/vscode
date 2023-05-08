import * as vscode from 'vscode';

import { AnalisadorSemantico } from '@designliquido/delegua/fontes/analisador-semantico';
import { AvaliadorSintatico, Lexador } from '@designliquido/delegua';
import { AvaliadorSintaticoInterface, LexadorInterface } from '@designliquido/delegua/fontes/interfaces';
import { ErroAnalisadorSemantico } from '@designliquido/delegua/fontes/interfaces/erros';


export function analiseSemantica(e: vscode.TextDocumentChangeEvent): ErroAnalisadorSemantico[] {
    const extensaoArquivo = e.document.fileName.split('.')[1];
    let lexador: LexadorInterface;
    let avaliadorSintatico: AvaliadorSintaticoInterface;
    let analisadorSemantico: AnalisadorSemantico;

    switch (extensaoArquivo) {
        case "delegua":
            lexador = new Lexador();
            avaliadorSintatico = new AvaliadorSintatico();
            analisadorSemantico = new AnalisadorSemantico(); 

            const linhas = e.document.getText().split('\n').map(l => l + '\0');
            const resultadoLexador = lexador.mapear(linhas, -1);
            const resultadoAvaliadorSintatico = avaliadorSintatico.analisar(resultadoLexador, -1);
            const resultadoAnalisadorSemantico = analisadorSemantico.analisar(resultadoAvaliadorSintatico.declaracoes);
            return resultadoAnalisadorSemantico.erros;
    }

    return [];
}