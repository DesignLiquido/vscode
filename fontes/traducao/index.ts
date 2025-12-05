import * as vscode from 'vscode';
import * as caminho from 'path';
import * as sistemaArquivos from 'fs';
import * as sistemaOperacional from 'os';

import { Delegua } from '@designliquido/delegua-node/delegua';
import { FolEs } from '@designliquido/foles';
import { 
    Lexador as LexadorLinConEs, 
    LexadorSqlAnsi, 
    AvaliadorSintatico as AvaliadorSintaticoLinConEs, 
    AvaliadorSintaticoSqlAnsi, 
    TradutorReversoSqlAnsi, 
    TradutorSqlAnsi 
} from '@designliquido/lincones-js';
import { ConversorHtml, ConversorLmht } from '@designliquido/lmht-js';

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
                resultadoTraducao = await traduzirPorMotorLmht(deLinguagem, paraLinguagem, caminhoArquivoAbertoEditor);
                break;
            case 'css':
            case 'foles':
                resultadoTraducao = traduzirPorMotorFolEs(deLinguagem, paraLinguagem, caminhoArquivoAbertoEditor);
                break;
            case 'lincones':
            case 'sql':
                resultadoTraducao = traduzirPorMotorLinConEs(deLinguagem, paraLinguagem, caminhoArquivoAbertoEditor);
                break;
            default:
                resultadoTraducao = traduzirPorMotorDelegua(deLinguagem, paraLinguagem, alvo, caminhoArquivoAbertoEditor);
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
 * Tradução de LinConEs para SQL, ou SQL para LinConEs.
 * 
 * Esta função realiza a tradução do conteúdo de um arquivo LinConEs
 * para SQL, utilizando um lexador e um avaliador sintático.
 * 
 * @param deLinguagem - Extensão da linguagem de origem.
 * @param paraLinguagem - Extensão da linguagem de destino.
 * @param caminhoArquivoAbertoEditor - O caminho do arquivo a ser traduzido.
 * @returns O texto com o conteúdo da tradução.
 */
function traduzirPorMotorLinConEs(deLinguagem: string, paraLinguagem: string, caminhoArquivoAbertoEditor: string): string {
    let resultadoTraducao = '';
    const conteudoArquivo = sistemaArquivos.readFileSync(caminhoArquivoAbertoEditor, 'utf-8');

    switch (deLinguagem.toLowerCase()) {
        case 'lincones':
            const lexador = new LexadorLinConEs();
            const avaliadorSintatico = new AvaliadorSintaticoLinConEs();
            const tradutorSqlAnsi = new TradutorSqlAnsi();

            const resultadoLexador = lexador.mapear(conteudoArquivo.split(sistemaOperacional.EOL));
            const resultadoAvaliadorSintatico = avaliadorSintatico.analisar(resultadoLexador);
            resultadoTraducao = tradutorSqlAnsi.traduzir(resultadoAvaliadorSintatico.comandos);
            break;
        case 'sql':
            const lexadorReverso = new LexadorSqlAnsi();
            const avaliadorSintaticoReverso = new AvaliadorSintaticoSqlAnsi();
            const tradutorReverso = new TradutorReversoSqlAnsi();

            const resultadoLexadorReverso = lexadorReverso.mapear(conteudoArquivo.split(sistemaOperacional.EOL));
            const resultadoAvaliadorSintaticoReverso = avaliadorSintaticoReverso.analisar(resultadoLexadorReverso);
            resultadoTraducao = tradutorReverso.traduzir(resultadoAvaliadorSintaticoReverso.comandos);
            break;
    }

    return resultadoTraducao;
}

/**
 * Tradução de LMHT para HTML, ou HTML para LMHT.
 * @param deLinguagem Extensão da linguagem de origem.
 * @param paraLinguagem Extensão da linguagem de destino.
 * @param caminhoArquivoAbertoEditor O arquivo a ser traduzido.
 * @returns O texto com o conteúdo da tradução.
 */
async function traduzirPorMotorLmht(deLinguagem: string, paraLinguagem: string, caminhoArquivoAbertoEditor: string): Promise<string> {
    let resultadoTraducao = '';
    switch (deLinguagem.toLowerCase()) {
        case 'html':
            const conversorHtml = new ConversorHtml();
            resultadoTraducao = await conversorHtml.converterPorArquivo(caminhoArquivoAbertoEditor);
            break;
        case 'lmht':
            const conversorLmht = new ConversorLmht();
            resultadoTraducao = await conversorLmht.converterPorArquivo(caminhoArquivoAbertoEditor);
            break;
    }

    sistemaArquivos.writeFileSync(caminhoArquivoAbertoEditor.split('.')[0] + `.${paraLinguagem}`, resultadoTraducao);
    return resultadoTraducao;
}