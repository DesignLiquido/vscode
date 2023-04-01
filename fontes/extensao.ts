import * as vscode from 'vscode';
import * as path from 'path';

import { configurarDepuracao } from './depuracao/configuracao-depuracao';
import { FabricaAdaptadorDepuracaoEmbutido } from './depuracao/fabricas';
import {
    DeleguaAdapterServerDescriptorFactory,
    DeleguaAdapterNamedPipeServerDescriptorFactory,
    DeleguaDebugAdapterExecutableFactory,
} from './depuracao/fabricas/remotas';
import {
    DeleguaProvedorDocumentacaoEmEditor,
    FolesProvedorDocumentacaoEmEditor,
} from './documentacao-em-editor';
import {
    DeleguaProvedorCompletude,
    FolesProvedorCompletude,
    LiquidoProvedorCompletude,
} from './completude';
import { DeleguaProvedorFormatacao } from './formatadores';
import { VisuAlgProvedorCompletude } from './completude/visualg-provedor-completude';
import { VisuAlgProvedorDocumentacaoEmEditor } from './documentacao-em-editor/visualg-documentacao-em-editor';

import { Delegua } from '@designliquido/delegua-node/fontes/delegua'

/**
 * Em teoria runMode é uma "compile time flag", mas nunca foi usado aqui desta forma.
 * Usar 'server' para execução remota e 'inline' para execução embutida.
 * Please note: the test suite only supports 'external' mode.
 */
const runMode: 'external' | 'server' | 'namedPipeServer' | 'inline' = 'inline';
let traduzir = {
    deLinguagem: '',
    paraLinguagem: ''
};

function translate(): any {
    try {
        let caminhoDaJanelaAtualAberta = vscode.window.activeTextEditor?.document?.fileName ?? '';
        const extensaoArquivo = caminhoDaJanelaAtualAberta.split('.').pop() || '';
        if (!extensaoArquivo || extensaoArquivo !== traduzir.deLinguagem){
            return vscode.window.showErrorMessage('O arquivo atual não pode ser traduzido para o destino selecionado!');
        }

        let resultadoTraducao = '';
        const traduzirPara = traduzir.deLinguagem === 'alg' ? 'alg' : traduzir.paraLinguagem;
        const delegua = new Delegua(undefined, undefined, undefined, traduzirPara, (traducao) => { resultadoTraducao = traducao; }, undefined);

        if (!caminhoDaJanelaAtualAberta) { return; };

        delegua.traduzirArquivo(caminhoDaJanelaAtualAberta, true);

        if (!resultadoTraducao) { return; };

        const nomeArquivo = path.basename(caminhoDaJanelaAtualAberta).replace(`.${traduzir.deLinguagem}`, '');

        vscode.env.clipboard.writeText(resultadoTraducao);
        vscode.window.showInformationMessage(`O arquivo foi traduzido e salvo no caminho atual com nome: ${nomeArquivo}.${traduzir.paraLinguagem}`);
        vscode.window.showInformationMessage("Tradução copiada para área de transferência");
    } catch (error: any) {
        return vscode.window.showInformationMessage(error.message);
    }
};

const commandTranslate = (deLinguagem, paraLinguagem) => {
    traduzir.deLinguagem = deLinguagem;
    traduzir.paraLinguagem = paraLinguagem;
    return translate();
}

export function activate(context: vscode.ExtensionContext) {    

    context.subscriptions.push(vscode.commands.registerCommand('extension.delegua.translate.delegua', () => commandTranslate('delegua', 'js')));
    context.subscriptions.push(vscode.commands.registerCommand('extension.delegua.translate.javascript', () => commandTranslate('js', 'delegua')));
    context.subscriptions.push(vscode.commands.registerCommand('extension.delegua.translate.visualg', () => commandTranslate('alg', 'delegua')));

    context.subscriptions.push(
        vscode.languages.registerDocumentFormattingEditProvider(
            'delegua',
            new DeleguaProvedorFormatacao()
        )
    );

    // IntelliSense para Delégua e Liquido.
    context.subscriptions.push(
        vscode.languages.registerCompletionItemProvider(
            { language: 'delegua', pattern: 'configuracao.delegua' },
            new LiquidoProvedorCompletude(),
            '.' // acionado quando desenvolvedor/a digita '.'
        )
    );

    context.subscriptions.push(
        vscode.languages.registerCompletionItemProvider(
            'delegua',
            new DeleguaProvedorCompletude()
        )
    );

    // IntelliSense para FolEs
    context.subscriptions.push(
        vscode.languages.registerCompletionItemProvider(
            'foles',
            new FolesProvedorCompletude()
        )
    );

    // IntelliSense para VisuAlg
    context.subscriptions.push(
        vscode.languages.registerCompletionItemProvider(
            'visualg',
            new VisuAlgProvedorCompletude()
        )
    );

    // Hovers
    context.subscriptions.push(
        vscode.languages.registerHoverProvider(
            'delegua',
            new DeleguaProvedorDocumentacaoEmEditor()
        )
    );

    context.subscriptions.push(
        vscode.languages.registerHoverProvider(
            'foles',
            new FolesProvedorDocumentacaoEmEditor()
        )
    );

    context.subscriptions.push(
        vscode.languages.registerHoverProvider(
            'visualg',
            new VisuAlgProvedorDocumentacaoEmEditor()
        )
    );

    // debug adapters can be run in different ways by using a vscode.DebugAdapterDescriptorFactory:
    switch (runMode) {
        case 'server':
            // run the debug adapter as a server inside the extension and communicate via a socket
            configurarDepuracao(
                context,
                new DeleguaAdapterServerDescriptorFactory()
            );
            break;

        case 'namedPipeServer':
            // run the debug adapter as a server inside the extension and communicate via a named pipe (Windows) or UNIX domain socket (non-Windows)
            configurarDepuracao(
                context,
                new DeleguaAdapterNamedPipeServerDescriptorFactory()
            );
            break;

        case 'external':
        default:
            // run the debug adapter as a separate process
            configurarDepuracao(
                context,
                new DeleguaDebugAdapterExecutableFactory()
            );
            break;

        case 'inline':
            // run the debug adapter inside the extension and directly talk to it
            configurarDepuracao(
                context,
                new FabricaAdaptadorDepuracaoEmbutido()
            );
            break;
    }
}

export function deactivate() {
    // nothing to do
}
