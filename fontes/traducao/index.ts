import * as vscode from 'vscode';
import * as caminho from 'path';
import * as sistemaArquivos from 'fs';

import { traduzirPorMotorFolEs, traduzirPorMotorLinConEs, traduzirPorMotorLmht } from './comum';
import { AvaliadorSintaticoInterface, Lexador } from '@designliquido/delegua';
import { TradutorInterface } from './tradutor-interface';

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
                resultadoTraducao = await traduzirPorMotorDelegua(deLinguagem, paraLinguagem, alvo);
                break;
        }

        if (!resultadoTraducao) {
            return;
        }

        const nomeArquivo = caminho
            .basename(caminhoArquivoAbertoEditor)
            .replace(`.${deLinguagem}`, '');

        // Obter configuração de resultado da tradução
        const configuracao = vscode.workspace.getConfiguration('delegua');
        const resultadoOpcao = configuracao.get<string>('traducao.resultadoTraducao', 'Ambos');

        // Implementar lógica baseada na opção selecionada
        switch (resultadoOpcao) {
            case 'Área de Transferência':
                await vscode.env.clipboard.writeText(resultadoTraducao);
                vscode.window.showInformationMessage(
                    'Tradução copiada para área de transferência'
                );
                break;

            case 'Arquivo':
                const caminhoArquivoDestino = caminhoArquivoAbertoEditor.replace(
                    `.${deLinguagem}`,
                    `.${paraLinguagem}`
                );
                sistemaArquivos.writeFileSync(caminhoArquivoDestino, resultadoTraducao);
                vscode.window.showInformationMessage(
                    `O arquivo foi traduzido e salvo no caminho atual com nome: ${nomeArquivo}.${paraLinguagem}`
                );
                break;

            case 'Ambos':
            default:
                const caminhoArquivoAmb = caminhoArquivoAbertoEditor.replace(
                    `.${deLinguagem}`,
                    `.${paraLinguagem}`
                );
                sistemaArquivos.writeFileSync(caminhoArquivoAmb, resultadoTraducao);
                await vscode.env.clipboard.writeText(resultadoTraducao);
                vscode.window.showInformationMessage(
                    `O arquivo foi traduzido e salvo no caminho atual com nome: ${nomeArquivo}.${paraLinguagem}`
                );
                vscode.window.showInformationMessage(
                    'Tradução copiada para área de transferência'
                );
                break;
        }
    } catch (error: any) {
        return vscode.window.showInformationMessage(`Erro ao traduzir: ${error.message}`);
    }
}

/**
 * Verifica se houve erros na análise léxica e os reporta ao usuário.
 * @param retornoLexador Resultado da análise léxica.
 * @returns true se houve erros, false caso contrário.
 */
function afericaoErrosLexador(retornoLexador: any): boolean {
    if (retornoLexador.erros.length > 0) {
        for (const erroLexador of retornoLexador.erros) {
            vscode.window.showErrorMessage(
                `Erro léxico na linha ${erroLexador.linha}: ${erroLexador.mensagem} no '${erroLexador.caractere}'`
            );
        }
        return true;
    }
    return false;
}

/**
 * Verifica se houve erros na análise sintática e os reporta ao usuário.
 * @param retornoAvaliadorSintatico Resultado da análise sintática.
 * @returns true se houve erros, false caso contrário.
 */
function afericaoErrosAvaliadorSintatico(retornoAvaliadorSintatico: any): boolean {
    if (retornoAvaliadorSintatico.erros && retornoAvaliadorSintatico.erros.length > 0) {
        for (const erroAvaliadorSintatico of retornoAvaliadorSintatico.erros) {
            vscode.window.showErrorMessage(
                `Erro sintático na linha ${erroAvaliadorSintatico.linha}: ${erroAvaliadorSintatico.mensagem}`
            );
        }
        return true;
    }
    return false;
}

/**
 * Traduções pelo motor de Delégua, seja diretas ou reversas.
 * @param deLinguagem Extensão da linguagem de origem.
 * @param paraLinguagem Extensão da linguagem de destino.
 * @param alvo Plataforma alvo para tradução (quando aplicável).
 * @param caminhoArquivoAbertoEditor O arquivo a ser traduzido.
 * @returns O texto com o conteúdo da tradução.
 */
async function traduzirPorMotorDelegua(deLinguagem: string, paraLinguagem: string, alvo: string): Promise<string> {
    const lexador = new Lexador(false);
    let avaliadorSintatico: AvaliadorSintaticoInterface<any, any>;
    let tradutor: TradutorInterface<any>;

    switch (deLinguagem) {
        case 'js':
        case 'javascript': {
            const { AvaliadorSintaticoJavaScript } = await import('@designliquido/delegua/avaliador-sintatico/traducao/avaliador-sintatico-javascript');
            const { TradutorReversoJavaScript } = await import('@designliquido/delegua');
            avaliadorSintatico = new AvaliadorSintaticoJavaScript();
            tradutor = new TradutorReversoJavaScript();
            break;
        }
        case 'potigol': {
            const { AvaliadorSintaticoPotigol } = await import('@designliquido/potigol/avaliador-sintatico');
            const { TradutorReversoPotigol } = await import('@designliquido/potigol/tradutores/tradutor-reverso-potigol');
            avaliadorSintatico = new AvaliadorSintaticoPotigol();
            tradutor = new TradutorReversoPotigol();
            break;
        }
        case 'alg':
        case 'visualg': {
            const { AvaliadorSintaticoVisuAlg } = await import('@designliquido/visualg/avaliador-sintatico');
            const { TradutorReversoVisuAlg } = await import('@designliquido/visualg/tradutores');
            avaliadorSintatico = new AvaliadorSintaticoVisuAlg();
            tradutor = new TradutorReversoVisuAlg();
            break;
        }
        default:
            switch (paraLinguagem) {
                case 'assemblyscript':
                case 'as': {
                    const { AvaliadorSintatico } = await import('@designliquido/delegua/avaliador-sintatico');
                    const { TradutorAssemblyScript } = await import('@designliquido/delegua');
                    avaliadorSintatico = new AvaliadorSintatico();
                    tradutor = new TradutorAssemblyScript();
                    break;
                }
                case 'elixir':
                case 'ex': {
                    const { AvaliadorSintatico } = await import('@designliquido/delegua/avaliador-sintatico');
                    const { TradutorElixir } = await import('@designliquido/delegua');
                    avaliadorSintatico = new AvaliadorSintatico();
                    tradutor = new TradutorElixir();
                    break;
                }
                case 'javascript':
                case 'js': {
                    const { AvaliadorSintatico } = await import('@designliquido/delegua/avaliador-sintatico');
                    const { TradutorJavaScript } = await import('@designliquido/delegua');
                    avaliadorSintatico = new AvaliadorSintatico();
                    tradutor = new TradutorJavaScript();
                    break;
                }
                case 'py':
                case 'python': {
                    const { AvaliadorSintatico } = await import('@designliquido/delegua/avaliador-sintatico');
                    const { TradutorPython } = await import('@designliquido/delegua');
                    avaliadorSintatico = new AvaliadorSintatico();
                    tradutor = new TradutorPython();
                    break;
                }
                case 'rb':
                case 'ruby': {
                    const { AvaliadorSintatico } = await import('@designliquido/delegua/avaliador-sintatico');
                    const { TradutorRuby } = await import('@designliquido/delegua');
                    avaliadorSintatico = new AvaliadorSintatico();
                    tradutor = new TradutorRuby();
                    break;
                }
                default:
                    throw new Error(`Tradutor '${paraLinguagem}' não implementado.`);
            }
    }

    try {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showErrorMessage('Nenhum editor ativo encontrado.');
            return '';
        }

        const conteudo = editor.document.getText();

        const retornoLexador = lexador.mapear(
            conteudo.split(`\n`), -1
        );

        if (afericaoErrosLexador(retornoLexador)) {
            return '';
        }

        const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(
            retornoLexador,
            -1
        );

        if (afericaoErrosAvaliadorSintatico(retornoAvaliadorSintatico)) {
            return '';
        }

        const resultado = await tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);

        return resultado;
    } catch (erro: any) {
        vscode.window.showErrorMessage(`Erro durante tradução: ${erro.message}`);
        return '';
    }
}
