import * as vscode from 'vscode';
import * as caminho from 'path';
import * as sistemaArquivos from 'fs';

// import { Delegua } from '@designliquido/delegua-node/delegua';
import { traduzirPorMotorFolEs, traduzirPorMotorLinConEs, traduzirPorMotorLmht } from './comum';

/**
 * Ponto de entrada para todas as traduções desta extensão.
 * 
 * Esta função verifica a extensão do arquivo atual e realiza a tradução
 * do conteúdo do arquivo de acordo com a linguagem de origem e destino
 * especificadas. Se a extensão do arquivo não corresponder à linguagem
 * de origem, uma mensagem de erro será exibida.
 * 
 * @param deLinguagem - Linguagem de origem, representada pela extensão do arquivo.
 * @param paraLinguagem - Linguagem de destino, representada pela extensão do arquivo.
 * @returns Uma Promise que resolve para qualquer mensagem de erro ou `void` se a tradução for bem-sucedida.
 */
export async function traduzir(deLinguagem: string, paraLinguagem: string, alvo: string = ''): Promise<any> {
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
                resultadoTraducao = await traduzirPorMotorLmht(deLinguagem, paraLinguagem, caminhoArquivoAbertoEditor, sistemaArquivos.writeFileSync);
                break;
            case 'css':
            case 'foles':
                resultadoTraducao = await traduzirPorMotorFolEs(deLinguagem, paraLinguagem, caminhoArquivoAbertoEditor, sistemaArquivos.writeFileSync);
                break;
            case 'lincones':
            case 'sql':
                resultadoTraducao = await traduzirPorMotorLinConEs(deLinguagem, paraLinguagem, caminhoArquivoAbertoEditor);
                break;
            default:
                // traduzirPorMotorDelegua is commented out due to removal of delegua-node dependency
                throw new Error('Tradução via motor Delégua não está disponível na versão web da extensão.');
                // resultadoTraducao = traduzirPorMotorDelegua(deLinguagem, paraLinguagem, alvo, caminhoArquivoAbertoEditor);
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
 * NOTA: Esta função foi comentada devido à remoção da dependência delegua-node
 * para compatibilidade com a versão web da extensão.
 * @param deLinguagem Extensão da linguagem de origem.
 * @param paraLinguagem Extensão da linguagem de destino.
 * @param caminhoArquivoAbertoEditor O arquivo a ser traduzido.
 * @returns O texto com o conteúdo da tradução.
 */
/*
function traduzirPorMotorDelegua(deLinguagem: string, paraLinguagem: string, alvo: string, caminhoArquivoAbertoEditor: string): string {
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

    delegua.traduzirArquivo(caminhoArquivoAbertoEditor, `${deLinguagem}-para-${paraLinguagem}`, alvo, true);
    return resultadoTraducao;
}
*/
