import * as vscode from 'vscode';

import { Classe } from '@designliquido/delegua/declaracoes/classe';
import { Declaracao } from '@designliquido/delegua/declaracoes';

import { obterResultado } from '../analise-codigo/cache-analise';

export class DeleguaProvedorDefinicao implements vscode.DefinitionProvider {
    private obterUriDeclaracao(declaracao: Declaracao, uriPadrao: vscode.Uri): vscode.Uri {
        const caminhoArquivoDefinicao = (declaracao as any).caminhoArquivoDefinicao as string | undefined;
        if (caminhoArquivoDefinicao) {
            return vscode.Uri.file(caminhoArquivoDefinicao);
        }

        return uriPadrao;
    }

    private localizarEmDeclaracoes(
        declaracoes: Declaracao[],
        palavra: string,
        uri: vscode.Uri
    ): vscode.Location | undefined {
        for (const declaracao of declaracoes) {
            const uriDeclaracao = this.obterUriDeclaracao(declaracao, uri);
            const simbolo = (declaracao as any).simbolo;
            if (simbolo?.lexema === palavra) {
                const linha = simbolo.linha - 1;
                const coluna = simbolo.colunaInicio ?? 0;
                return new vscode.Location(uriDeclaracao, new vscode.Position(linha, coluna));
            }

            if (declaracao instanceof Classe) {
                for (const metodo of declaracao.metodos) {
                    if (metodo.simbolo.lexema === palavra) {
                        const linha = metodo.simbolo.linha - 1;
                        const coluna = metodo.simbolo.colunaInicio ?? 0;
                        return new vscode.Location(uriDeclaracao, new vscode.Position(linha, coluna));
                    }
                }
            }
        }

        return undefined;
    }

    private localizarPropriedadeClasse(
        declaracoes: Declaracao[],
        palavra: string,
        linhaAtual: number,
        uri: vscode.Uri
    ): vscode.Location | undefined {
        const classesLocais = declaracoes.filter(
            d => d instanceof Classe && !(d as any).caminhoArquivoDefinicao
        ) as Classe[];

        const classesAnteriores = classesLocais.filter(c => Number(c.simbolo.linha) <= linhaAtual);
        if (!classesAnteriores.length) {
            return undefined;
        }

        const classeAtual = classesAnteriores.reduce((prev, curr) =>
            Number(curr.simbolo.linha) > Number(prev.simbolo.linha) ? curr : prev
        );

        const propriedade = classeAtual.propriedades.find(p => p.nome.lexema === palavra);
        if (!propriedade) {
            return undefined;
        }

        const linha = Number(propriedade.nome.linha) - 1;
        const coluna = propriedade.nome.colunaInicio ?? 0;
        return new vscode.Location(uri, new vscode.Position(linha, coluna));
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
        const declaracoes = [
            ...(resultado?.declaracoesPreCarregadas || []),
            ...(resultado?.avaliadorSintatico?.declaracoes || [])
        ];

        if (!declaracoes.length) {
            return undefined;
        }

        const linhaTexto = documento.lineAt(posicao).text;
        const textoAntesPalavra = linhaTexto.substring(0, intervaloWord.start.character);
        if (textoAntesPalavra.trimEnd().endsWith('isto.')) {
            const localizacao = this.localizarPropriedadeClasse(
                declaracoes,
                palavra,
                posicao.line + 1,
                documento.uri
            );
            if (localizacao) {
                return localizacao;
            }
        }

        return this.localizarEmDeclaracoes(
            declaracoes,
            palavra,
            documento.uri
        );
    }
}
