import * as vscode from 'vscode';

import { Classe } from '@designliquido/delegua/declaracoes/classe';
import { Declaracao } from '@designliquido/delegua/declaracoes';

import { obterResultado } from '../analise-codigo/cache-analise';

function escaparRegex(texto: string): string {
    return texto.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function eCaracterPalavra(caractere: string): boolean {
    return /[_a-zA-Z0-9]/.test(caractere);
}

function encontrarOcorrenciasLinha(textoLinha: string, palavra: string): number[] {
    const ocorrencias: number[] = [];
    const regex = new RegExp(escaparRegex(palavra), 'g');
    let correspondencia: RegExpExecArray | null;

    while ((correspondencia = regex.exec(textoLinha)) !== null) {
        const indice = correspondencia.index;
        const antes = indice > 0 ? textoLinha[indice - 1] : '';
        const depois = textoLinha[indice + palavra.length] ?? '';

        if (!eCaracterPalavra(antes) && !eCaracterPalavra(depois)) {
            ocorrencias.push(indice);
        }
    }

    return ocorrencias;
}

function coletarPosicoesDeclaracao(
    declaracoes: Declaracao[],
    palavra: string,
    uriPadrao: vscode.Uri
): Set<string> {
    const posicoes = new Set<string>();

    for (const declaracao of declaracoes) {
        const simbolo = (declaracao as any).simbolo;
        const uri = vscode.Uri.file((declaracao as any).caminhoArquivoDefinicao || uriPadrao.fsPath);

        if (simbolo?.lexema === palavra) {
            posicoes.add(`${uri.toString()}#${simbolo.linha - 1}:${simbolo.colunaInicio ?? 0}`);
        }

        if (declaracao instanceof Classe) {
            if (declaracao.simbolo?.lexema === palavra) {
                posicoes.add(
                    `${uri.toString()}#${declaracao.simbolo.linha - 1}:${declaracao.simbolo.colunaInicio ?? 0}`
                );
            }

            for (const metodo of declaracao.metodos || []) {
                if (metodo.simbolo?.lexema === palavra) {
                    posicoes.add(
                        `${uri.toString()}#${metodo.simbolo.linha - 1}:${metodo.simbolo.colunaInicio ?? 0}`
                    );
                }
            }

            for (const propriedade of declaracao.propriedades || []) {
                if (propriedade.nome?.lexema === palavra) {
                    posicoes.add(
                        `${uri.toString()}#${propriedade.nome.linha - 1}:${propriedade.nome.colunaInicio ?? 0}`
                    );
                }
            }
        }
    }

    return posicoes;
}

export class DeleguaProvedorReferencias implements vscode.ReferenceProvider {
    async provideReferences(
        documento: vscode.TextDocument,
        posicao: vscode.Position,
        contexto: vscode.ReferenceContext,
        _token: vscode.CancellationToken
    ): Promise<vscode.Location[]> {
        const intervaloWord = documento.getWordRangeAtPosition(posicao, /[_a-zA-Z0-9]+/);
        if (!intervaloWord) {
            return [];
        }

        const palavra = documento.getText(intervaloWord);
        if (!palavra) {
            return [];
        }

        const arquivos = await vscode.workspace.findFiles('**/*.{delegua,egua}', '**/node_modules/**');
        const localizacoes: vscode.Location[] = [];

        for (const arquivo of arquivos) {
            const doc = await vscode.workspace.openTextDocument(arquivo);

            for (let indiceLinha = 0; indiceLinha < doc.lineCount; indiceLinha++) {
                const textoLinha = doc.lineAt(indiceLinha).text;
                const ocorrencias = encontrarOcorrenciasLinha(textoLinha, palavra);

                for (const coluna of ocorrencias) {
                    localizacoes.push(
                        new vscode.Location(
                            doc.uri,
                            new vscode.Position(indiceLinha, coluna)
                        )
                    );
                }
            }
        }

        if (contexto.includeDeclaration) {
            return localizacoes;
        }

        const resultado = obterResultado(documento.uri.toString());
        const declaracoes = [
            ...(resultado?.declaracoesPreCarregadas || []),
            ...(resultado?.avaliadorSintatico?.declaracoes || [])
        ];
        const posicoesDeclaracao = coletarPosicoesDeclaracao(declaracoes, palavra, documento.uri);

        return localizacoes.filter(localizacao => {
            const chave = `${localizacao.uri.toString()}#${localizacao.range.start.line}:${localizacao.range.start.character}`;
            return !posicoesDeclaracao.has(chave);
        });
    }
}
