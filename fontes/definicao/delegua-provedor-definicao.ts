import * as vscode from 'vscode';

import { Classe } from '@designliquido/delegua/declaracoes/classe';
import { Declaracao } from '@designliquido/delegua/declaracoes';
import { obterResultado } from '../analise-codigo/cache-analise';

export class DeleguaProvedorDefinicao implements vscode.DefinitionProvider {
    private localizarEmDeclaracoes(
        declaracoes: Declaracao[],
        palavra: string,
        uri: vscode.Uri
    ): vscode.Location | undefined {
        for (const declaracao of declaracoes) {
            const simbolo = (declaracao as any).simbolo;
            if (simbolo?.lexema === palavra) {
                const linha = simbolo.linha - 1;
                const coluna = simbolo.colunaInicio ?? 0;
                return new vscode.Location(uri, new vscode.Position(linha, coluna));
            }

            if (declaracao instanceof Classe) {
                for (const metodo of declaracao.metodos) {
                    if (metodo.simbolo.lexema === palavra) {
                        const linha = metodo.simbolo.linha - 1;
                        const coluna = metodo.simbolo.colunaInicio ?? 0;
                        return new vscode.Location(uri, new vscode.Position(linha, coluna));
                    }
                }
            }
        }

        return undefined;
    }

    provideDefinition(
        documento: vscode.TextDocument,
        posicao: vscode.Position,
        _token: vscode.CancellationToken
    ): vscode.ProviderResult<vscode.Definition> {
        const intervaloWord = documento.getWordRangeAtPosition(posicao, /[_a-zA-Z0-9]+/);
        if (!intervaloWord) {
            return undefined;
        }

        const palavra = documento.getText(intervaloWord);
        const resultado = obterResultado(documento.uri.toString());
        if (!resultado?.avaliadorSintatico?.declaracoes?.length) {
            return undefined;
        }

        return this.localizarEmDeclaracoes(
            resultado.avaliadorSintatico.declaracoes,
            palavra,
            documento.uri
        );
    }
}
