import * as vscode from 'vscode';
import * as caminho from 'path';

import { Delegua } from '@designliquido/delegua-node/fontes/delegua';

// Não conseguimos usar o 'saxon-js' porque o pacote é um lixo.
// Não apenas é muito mal documentado como também falha por motivos misteriosos.
// Da mesma forma, até a versão 0.2.0, o pacote '@designliquido/lmht-js' depende do 'saxon-js'.
// Funciona em aplicações web tradicionais ou no Node.js puro, mas não funciona para o VSCode. 
// O erro é: `Activating extension failed: abstractNode is not defined.`
// Por isso, a tradução de LMHT para HTML e vice-versa por enquanto
// não fica ativada, ou até acharmos um pacote que processe o XSLT de LMHT
// a contento, ou criando um.
// Uma ideia é fazer um _fork_ de https://github.com/fiduswriter/xslt-processor.

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

// Essa seria a forma de usar caso '@designliquido/lmht-js' ou 'saxon-js' funciocnassem da maneira correta.
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