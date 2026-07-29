import * as vscode from 'vscode';
import { Lexador } from '@designliquido/foles/lexador';
import { AvaliadorSintatico } from '@designliquido/foles/avaliador-sintatico';
import { ImportadorInterface } from '@designliquido/foles/interfaces';
import { Valor, ValorVirgula, ValorAbreviacao } from '@designliquido/foles/valores';
import { ReferenciaVariavel } from '@designliquido/foles/valores/referencia-variavel';
import { BlocoDeclaracao } from '@designliquido/foles/declaracoes';
import { DeclaracaoVariavel } from '@designliquido/foles/declaracoes/declaracao-variavel';
import { SeletorEstrutura } from '@designliquido/foles/seletores/seletor-estrutura';
import { SeletorId } from '@designliquido/foles/seletores/seletor-id';
import { SeletorClasse } from '@designliquido/foles/seletores/seletor-classe';

function valorParaTexto(valor: Valor): string {
    if (valor instanceof ReferenciaVariavel) {
        return `$${valor.nomeVariavel}`;
    }
    return valor.paraTexto();
}

function formatarValores(valores: Valor[]): string {
    const partes: string[] = [];
    for (const valor of valores) {
        if (valor instanceof ValorVirgula) {
            partes.push(', ');
        } else if (valor instanceof ValorAbreviacao) {
            partes.push('/');
        } else {
            partes.push(valorParaTexto(valor));
        }
    }
    let resultado = partes.join(' ');
    resultado = resultado.replace(/ , /g, ', ');
    return resultado.trim();
}

function formatarBlocoDeclaracao(
    declaracao: BlocoDeclaracao,
    indentacao: number,
    tamanhoIdentacao: number,
    caracterFimDaLinha: string
): string {
    const ident = ' '.repeat(indentacao);
    const identInterno = ' '.repeat(indentacao + tamanhoIdentacao);
    let resultado = '';

    const textosSeletores: string[] = [];
    for (const seletor of declaracao.seletores) {
        if (seletor instanceof SeletorEstrutura || seletor instanceof SeletorId || seletor instanceof SeletorClasse) {
            textosSeletores.push(seletor.paraTexto());
        }
    }

    if (textosSeletores.length === 0) {
        return '';
    }

    resultado += `${ident}${textosSeletores.join(', ')} {${caracterFimDaLinha}`;

    for (const modificador of declaracao.modificadores) {
        const valoresTexto = formatarValores(modificador.valores);
        resultado += `${identInterno}${modificador.nomeFoles}: ${valoresTexto};${caracterFimDaLinha}`;
    }

    for (const aninhada of declaracao.declaracoesAninhadas) {
        if (aninhada instanceof BlocoDeclaracao) {
            resultado += formatarBlocoDeclaracao(
                aninhada,
                indentacao + tamanhoIdentacao,
                tamanhoIdentacao,
                caracterFimDaLinha
            );
        }
    }

    resultado += `${ident}}${caracterFimDaLinha}`;
    return resultado;
}

export class FolesProvedorFormatacao implements vscode.DocumentFormattingEditProvider {
    provideDocumentFormattingEdits(documento: vscode.TextDocument): vscode.TextEdit[] {
        const caracterFimDaLinha = documento.eol === vscode.EndOfLine.CRLF ? '\r\n' : '\n';
        const texto = documento.getText();
        const linhas = texto.split(/\r?\n/);

        const importadorMock: ImportadorInterface = {
            importar: () => [[], { simbolos: [], erros: [] }],
        };

        const lexador = new Lexador();
        const resultadoLexador = lexador.mapear(linhas);

        if (resultadoLexador.erros.length > 0) {
            return [];
        }

        const avaliador = new AvaliadorSintatico(importadorMock);
        const declaracoes = avaliador.analisar(resultadoLexador.simbolos);

        if (avaliador.erros.length > 0) {
            return [];
        }

        let codigoFormatado = '';
        const tamanhoIdentacao = 4;

        for (const declaracao of declaracoes) {
            if (!declaracao) {
                continue;
            }

            if (declaracao instanceof BlocoDeclaracao) {
                codigoFormatado += formatarBlocoDeclaracao(
                    declaracao,
                    0,
                    tamanhoIdentacao,
                    caracterFimDaLinha
                );
            } else if (declaracao instanceof DeclaracaoVariavel) {
                const valoresTexto = formatarValores(declaracao.valores);
                codigoFormatado += `$${declaracao.nome} = ${valoresTexto};${caracterFimDaLinha}`;
            }
        }

        if (!codigoFormatado) {
            return [];
        }

        return [vscode.TextEdit.replace(
            new vscode.Range(
                documento.lineAt(0).range.start,
                documento.lineAt(documento.lineCount - 1).range.end
            ),
            codigoFormatado.trimEnd()
        )];
    }
}
