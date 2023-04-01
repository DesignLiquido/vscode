import * as vscode from 'vscode';
import * as caminho from 'path';

import { Delegua } from '@designliquido/delegua-node/fontes/delegua';

export function traduzir(deLinguagem: string, paraLinguagem: string): any {
    try {
        let caminhoDaJanelaAtualAberta =
            vscode.window.activeTextEditor?.document?.fileName ?? '';
        const extensaoArquivo =
            caminhoDaJanelaAtualAberta.split('.').pop() || '';
        if (!extensaoArquivo || extensaoArquivo !== deLinguagem) {
            return vscode.window.showErrorMessage(
                'O arquivo atual não pode ser traduzido para o destino selecionado!'
            );
        }

        let resultadoTraducao = '';
        const traduzirPara = deLinguagem === 'alg' ? 'alg' : paraLinguagem;
        const delegua = new Delegua(
            undefined,
            undefined,
            undefined,
            traduzirPara,
            (traducao) => {
                resultadoTraducao = traducao;
            },
            undefined
        );

        if (!caminhoDaJanelaAtualAberta) {
            return;
        }

        delegua.traduzirArquivo(caminhoDaJanelaAtualAberta, true);

        if (!resultadoTraducao) {
            return;
        }

        const nomeArquivo = caminho
            .basename(caminhoDaJanelaAtualAberta)
            .replace(`.${deLinguagem}`, '');

        vscode.env.clipboard.writeText(resultadoTraducao);
        vscode.window.showInformationMessage(
            `O arquivo foi traduzido e salvo no caminho atual com nome: ${nomeArquivo}.${paraLinguagem}`
        );
        vscode.window.showInformationMessage(
            'Tradução copiada para área de transferência'
        );
    } catch (error: any) {
        return vscode.window.showInformationMessage(`Erro ao traduzir: ${error.message}`);
    }
}