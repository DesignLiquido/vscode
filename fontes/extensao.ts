import * as vscode from 'vscode';

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

import { TradutorJavaScript } from '@designliquido/delegua/fontes/tradutores';
import { AvaliadorSintatico } from '@designliquido/delegua/fontes/avaliador-sintatico';
import { Lexador } from '@designliquido/delegua/fontes/lexador';

/**
 * Em teoria runMode é uma "compile time flag", mas nunca foi usado aqui desta forma.
 * Usar 'server' para execução remota e 'inline' para execução embutida.
 * Please note: the test suite only supports 'external' mode.
 */
const runMode: 'external' | 'server' | 'namedPipeServer' | 'inline' = 'inline';

function selecionarTexto() {
    let editor = vscode.window.activeTextEditor;
    if (!editor) {
        return ''; // No open text editor
    }

    let selection = editor.selection;
    return editor.document.getText(selection);
}

const registrarComandoTraduzirECopiar = vscode.commands.registerCommand('traduzir.clipboard', async function () {
    let text = selecionarTexto();
    if (text == '') return;

    try {            
        let lexador = new Lexador();
        let avaliadorSintatico = new AvaliadorSintatico();
        const tradutorJavaScript = new TradutorJavaScript();
            
        const retornoLexador = lexador.mapear(text.split('\n'),-1);
        const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador);
        
        const resultadoTraducao = tradutorJavaScript.traduzir(retornoAvaliadorSintatico.declaracoes);
        if (!resultadoTraducao) return;

        vscode.env.clipboard.writeText(resultadoTraducao);
        vscode.window.showInformationMessage("cole o resultado da tradução em um novo arquivo");
    } catch (error: any) {
        return vscode.window.showInformationMessage(error.message);
    }
});

export function activate(context: vscode.ExtensionContext) {
    context.subscriptions.push(
        vscode.languages.registerDocumentFormattingEditProvider(
            'delegua',
            new DeleguaProvedorFormatacao()
        )
    );

    context.subscriptions.push(registrarComandoTraduzirECopiar);

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
