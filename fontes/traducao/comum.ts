import * as vscode from 'vscode';

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
 * Tradução de FolEs para CSS, ou CSS para FolEs.
 * @param deLinguagem Extensão da linguagem de origem.
 * @param paraLinguagem Extensão da linguagem de destino.
 * @param caminhoArquivoAbertoEditor O arquivo a ser traduzido.
 * @returns O texto com o conteúdo da tradução.
 */
export async function traduzirPorMotorFolEs(
    deLinguagem: string, 
    paraLinguagem: string, 
    caminhoArquivoAbertoEditor: string,
    funcaoEscrita: (arquivoDestino: string, resultadoTraducao: string) => void
): Promise<string> {
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

    // sistemaArquivos.writeFileSync(caminhoArquivoAbertoEditor.split('.')[0] + `.${paraLinguagem}`, resultadoTraducao);
    funcaoEscrita(caminhoArquivoAbertoEditor.split('.')[0] + `.${paraLinguagem}`, resultadoTraducao);
    return Promise.resolve(resultadoTraducao);
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
export async function traduzirPorMotorLinConEs(deLinguagem: string, paraLinguagem: string, caminhoArquivoAbertoEditor: string): Promise<string> {
    let resultadoTraducao = '';
    
    const documento = await vscode.workspace.openTextDocument(caminhoArquivoAbertoEditor);
    const caracterFimDaLinha = documento.eol === vscode.EndOfLine.CRLF ? '\r\n' : '\n';
    const conteudoArquivo = documento.getText();

    switch (deLinguagem.toLowerCase()) {
        case 'lincones':
            const lexador = new LexadorLinConEs();
            const avaliadorSintatico = new AvaliadorSintaticoLinConEs();
            const tradutorSqlAnsi = new TradutorSqlAnsi();

            const resultadoLexador = lexador.mapear(conteudoArquivo.split(caracterFimDaLinha));
            const resultadoAvaliadorSintatico = avaliadorSintatico.analisar(resultadoLexador);
            resultadoTraducao = tradutorSqlAnsi.traduzir(resultadoAvaliadorSintatico.comandos);
            break;
        case 'sql':
            const lexadorReverso = new LexadorSqlAnsi();
            const avaliadorSintaticoReverso = new AvaliadorSintaticoSqlAnsi();
            const tradutorReverso = new TradutorReversoSqlAnsi();

            const resultadoLexadorReverso = lexadorReverso.mapear(conteudoArquivo.split(caracterFimDaLinha));
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
export async function traduzirPorMotorLmht(
    deLinguagem: string, 
    paraLinguagem: string, 
    caminhoArquivoAbertoEditor: string,
    funcaoEscrita: (arquivoDestino: string, resultadoTraducao: string) => void
): Promise<string> {
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

    // sistemaArquivos.writeFileSync(caminhoArquivoAbertoEditor.split('.')[0] + `.${paraLinguagem}`, resultadoTraducao);
    funcaoEscrita(caminhoArquivoAbertoEditor.split('.')[0] + `.${paraLinguagem}`, resultadoTraducao);
    return resultadoTraducao;
}