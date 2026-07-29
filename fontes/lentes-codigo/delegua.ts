import * as vscode from 'vscode';
import { Lexador } from '@designliquido/delegua/lexador';
import { AvaliadorSintaticoComImportacao } from '../avaliacao-sintatica/avaliador-sintatico-com-importacao';
import { declaracoesParaLentes, criarLenteReferencias } from './delegua-base';
import { proverReferencias, DocumentoLSPInterface } from '@designliquido/delegua-lsp';
import { ambienteVscode } from '../ambiente/ambiente-vscode';

function documentoParaLsp(documento: vscode.TextDocument): DocumentoLSPInterface {
    return {
        uri: documento.uri.toString(),
        nomeArquivo: documento.fileName,
        texto: documento.getText(),
        linhas: documento.getText().split('\n'),
        versao: documento.version,
        languageId: documento.languageId,
    };
}

export class DeleguaProvedorLentesCodigo implements vscode.CodeLensProvider {
    async provideCodeLenses(documento: vscode.TextDocument, _token: vscode.CancellationToken): Promise<vscode.CodeLens[]> {
        try {
            const lexador = new Lexador();
            const resultadoLexador = lexador.mapear(documento.getText().split('\n'), -1);
            if (!resultadoLexador || !resultadoLexador.simbolos || resultadoLexador.simbolos.length === 0) return [];

            const avaliador = new AvaliadorSintaticoComImportacao(null as any);
            const resultadoAvaliacao = await avaliador.analisar(resultadoLexador, -1);
            if (!resultadoAvaliacao || !resultadoAvaliacao.declaracoes) return [];

            const alvos = declaracoesParaLentes(resultadoAvaliacao.declaracoes);
            if (alvos.length === 0) return [];

            const pastaWorkspace = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath || '';
            const lenses: vscode.CodeLens[] = [];

            for (const alvo of alvos) {
                const localizacao = {
                    line: alvo.linha,
                    character: 0,
                };
                const referencias = await proverReferencias(
                    documentoParaLsp(documento),
                    localizacao,
                    true,
                    pastaWorkspace,
                    ambienteVscode
                );

                const contagem = referencias.length;
                lenses.push(
                    criarLenteReferencias(documento, alvo, {
                        title: contagem === 1 ? '1 referência' : `${contagem} referências`,
                        command: '',
                        arguments: [],
                    })
                );
            }

            return lenses;
        } catch {
            return [];
        }
    }
}
