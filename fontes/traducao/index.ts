import * as vscode from 'vscode';
import * as caminho from 'path';
import * as sistemaArquivos from 'fs';

import { Delegua } from '@designliquido/delegua-node/fontes/delegua';
import { FolEs } from '@designliquido/foles';

// TODO: Ajustar https://github.com/DesignLiquido/xslt-processor para
// funcionar com LMHT, e então se livrar do 'saxon-js'.

// import SaxonJS from 'saxon-js';
// import { ConversorHtml, ConversorLmht } from '@designliquido/lmht-js';

/**
 * Ponto de entrada para todas as traduções desta extensão.
 * @param deLinguagem Linguagem de origem.
 * @param paraLinguagem Linguagem de destino.
 * @returns Normalmente `void`, mas pode retornar mensagens de erro.
 */
export async function traduzir(deLinguagem: string, paraLinguagem: string): Promise<any> {
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
                // resultadoTraducao = await traduzirPorMotorLmht(deLinguagem, paraLinguagem, caminhoArquivoAbertoEditor);
                break;
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

function traduzirPorMotorDelegua(deLinguagem: string, paraLinguagem: string, caminhoArquivoAbertoEditor: string): string {
    let resultadoTraducao = '';
    const delegua = new Delegua(
        undefined,
        undefined,
        undefined,
        `${deLinguagem}-para-${paraLinguagem}`,
        (traducao: string) => {
            resultadoTraducao = traducao;
        },
        undefined
    );

    if (!caminhoArquivoAbertoEditor) {
        return '';
    }

    delegua.traduzirArquivo(caminhoArquivoAbertoEditor, true);
    return resultadoTraducao;
}

function traduzirPorMotorFolEs(deLinguagem: string, paraLinguagem: string, caminhoArquivoAbertoEditor: string): string {
    const foles = new FolEs();
    const resultadoTraducao = foles.converterParaCss(caminhoArquivoAbertoEditor);
    sistemaArquivos.writeFileSync(caminhoArquivoAbertoEditor.split('.')[0] + '.css', resultadoTraducao);
    return resultadoTraducao;
}

// Essa seria a forma de usar caso '@designliquido/lmht-js' ou 'saxon-js' funcionassem da maneira correta.
// Por enquanto esse código fica aqui como referência do que fazer mais adiante.
/* async function traduzirPorMotorLmht(deLinguagem: string, paraLinguagem: string, caminhoArquivoAbertoEditor: string): Promise<string> {
    switch (paraLinguagem.toLowerCase()) {
        case 'html':
            const conversorHtml = new ConversorHtml();
            const resultadoHtml = await conversorHtml.converterPorArquivo(caminhoArquivoAbertoEditor);
            return resultadoHtml;
        case 'lmht':
            const conversorLmht = new ConversorLmht();
            const resultadoLmht = await conversorLmht.converterPorArquivo(caminhoArquivoAbertoEditor);
            return resultadoLmht;
        default:
            return '';
    }
} */