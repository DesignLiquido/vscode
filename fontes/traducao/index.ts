import * as vscode from 'vscode';
import * as caminho from 'path';
import * as sistemaArquivos from 'fs';

import { Delegua } from '@designliquido/delegua-node/delegua';
import { FolEs } from '@designliquido/foles';
import { ConversorHtml, ConversorLmht } from '@designliquido/lmht-js';

/**
 * Ponto de entrada para todas as traduções desta extensão.
 * @param deLinguagem Linguagem de origem.
 * @param paraLinguagem Linguagem de destino.
 * @returns Normalmente `void`, mas pode retornar mensagens de erro.
 */
export function traduzir(deLinguagem: string, paraLinguagem: string): any {
    try {
        let caminhoArquivoAbertoEditor =
            vscode.window.activeTextEditor?.document?.fileName ?? '';
        const extensaoArquivo =
            caminhoArquivoAbertoEditor.split('.').pop() || '';
        if (!extensaoArquivo || extensaoArquivo !== deLinguagem) {
            return vscode.window.showErrorMessage(
                'O arquivo atual não pode ser traduzido para o destino selecionado: extensão de origem não informada.'
            );
        }

        let resultadoTraducao = '';
        switch (deLinguagem.toLowerCase()) {
            case 'lmht':
            case 'html':
                resultadoTraducao = traduzirPorMotorLmht(deLinguagem, paraLinguagem, caminhoArquivoAbertoEditor);
                break;
            case 'css':
            case 'foles':
                resultadoTraducao = traduzirPorMotorFolEs(deLinguagem, paraLinguagem, caminhoArquivoAbertoEditor);
                break;
            default:
                resultadoTraducao = traduzirPorMotorDelegua(deLinguagem, paraLinguagem, caminhoArquivoAbertoEditor);
                break;
        }

        if (!resultadoTraducao) {
            return;
        }

        const nomeArquivo = caminho
            .basename(caminhoArquivoAbertoEditor)
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

/**
 * Traduções pelo motor de Delégua, seja diretas ou reversas.
 * @param deLinguagem Extensão da linguagem de origem.
 * @param paraLinguagem Extensão da linguagem de destino.
 * @param caminhoArquivoAbertoEditor O arquivo a ser traduzido.
 * @returns O texto com o conteúdo da tradução.
 */
function traduzirPorMotorDelegua(deLinguagem: string, paraLinguagem: string, caminhoArquivoAbertoEditor: string): string {
    let resultadoTraducao = '';
    const delegua = new Delegua(
        undefined,
        (traducao: string) => {
            resultadoTraducao = traducao;
        }
    );

    if (!caminhoArquivoAbertoEditor) {
        return '';
    }

    delegua.traduzirArquivo(caminhoArquivoAbertoEditor, `${deLinguagem}-para-${paraLinguagem}`, true);
    return resultadoTraducao;
}

/**
 * Tradução de FolEs para CSS, ou CSS para FolEs.
 * @param deLinguagem Extensão da linguagem de origem.
 * @param paraLinguagem Extensão da linguagem de destino.
 * @param caminhoArquivoAbertoEditor O arquivo a ser traduzido.
 * @returns O texto com o conteúdo da tradução.
 */
function traduzirPorMotorFolEs(deLinguagem: string, paraLinguagem: string, caminhoArquivoAbertoEditor: string): string {
    const foles = new FolEs(false);
    let resultadoTraducao = '';
    switch (deLinguagem.toLowerCase()) {
        case 'foles':
            resultadoTraducao = foles.converterParaCss(caminhoArquivoAbertoEditor);
            break;
        case 'css':
            resultadoTraducao = foles.converterParaFolEs(caminhoArquivoAbertoEditor);
            break;
    }

    sistemaArquivos.writeFileSync(caminhoArquivoAbertoEditor.split('.')[0] + `.${paraLinguagem}`, resultadoTraducao);
    return resultadoTraducao;
}

/**
 * Tradução de LMHT para HTML, ou HTML para LMHT.
 * @param deLinguagem Extensão da linguagem de origem.
 * @param paraLinguagem Extensão da linguagem de destino.
 * @param caminhoArquivoAbertoEditor O arquivo a ser traduzido.
 * @returns O texto com o conteúdo da tradução.
 */
function traduzirPorMotorLmht(deLinguagem: string, paraLinguagem: string, caminhoArquivoAbertoEditor: string): string {
    let resultadoTraducao = '';
    switch (deLinguagem.toLowerCase()) {
        case 'html':
            const conversorHtml = new ConversorHtml();
            resultadoTraducao = conversorHtml.converterPorArquivo(caminhoArquivoAbertoEditor);
            break;
        case 'lmht':
            const conversorLmht = new ConversorLmht();
            resultadoTraducao = conversorLmht.converterPorArquivo(caminhoArquivoAbertoEditor);
            break;
    }

    sistemaArquivos.writeFileSync(caminhoArquivoAbertoEditor.split('.')[0] + `.${paraLinguagem}`, resultadoTraducao);
    return resultadoTraducao;
}