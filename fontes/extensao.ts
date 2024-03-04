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
    LinConEsProvedorDocumentacaoEmEditor
} from './documentacao-em-editor';
import {
    DeleguaProvedorCompletude,
    FolesProvedorCompletude,
    LiquidoProvedorCompletude,
} from './completude';
import { DeleguaProvedorFormatacao, VisualgProvedorFormatacao } from './formatadores';
import { VisuAlgProvedorCompletude } from './completude/visualg-provedor-completude';
import { VisuAlgProvedorDocumentacaoEmEditor } from './documentacao-em-editor/visualg-provedor-documentacao-em-editor';
import { traduzir } from './traducao';
import { analiseSemantica } from './analise-semantica';
import { DeleguaProvedorAssinaturaMetodos } from './assinaturas-metodos';
import { LmhtProvedorCompletude } from './completude/lmht-provedor-completude';
import { LmhtProvedorDocumentacaoEmEditor } from './documentacao-em-editor/lmht-provedor-documentacao-em-editor';
import { tentarFecharTagLmht } from './linguagens/lmht/fechamento-estruturas';
import { PotigolProvedorFormatacao } from './formatadores/potigol-provedor-formatacao';

/**
 * Em teoria runMode é uma "compile time flag", mas nunca foi usado aqui desta forma.
 * Usar 'server' para execução remota e 'inline' para execução embutida.
 * Please note: the test suite only supports 'external' mode.
 */
const runMode: 'external' | 'server' | 'namedPipeServer' | 'inline' = 'inline';
let changeTimeout;

/**
 * O ponto de entrada da extensão. Aqui registramos tudo:
 * - Ponto de entrada de todas as análises semânticas;
 * - Comandos de tradução;
 * - Provedores de completude (também chamado de _IntelliSense_);
 * - Provedores de documentação em editor (vulgo, "documentação quando coloca-se o ponteiro do mouse em cima do símbolo");
 * - Depuradores.
 * @param context O contexto da extensão.
 */
export function activate(context: vscode.ExtensionContext) {
    const diagnosticosDelegua = vscode.languages.createDiagnosticCollection("delegua");
	context.subscriptions.push(diagnosticosDelegua);

    if (vscode.window.activeTextEditor) {
		analiseSemantica(vscode.window.activeTextEditor.document, diagnosticosDelegua);
	}

    context.subscriptions.push(
		vscode.workspace.onDidChangeTextDocument((evento) => {
            switch (evento.document.languageId) {
                case 'birl':
                case 'delegua':
                case 'mapler':
                case 'visualg':
                    if (changeTimeout !== null) {
                        clearTimeout(changeTimeout);
                    }
                    changeTimeout = setInterval(function () {
                        clearTimeout(changeTimeout);
                        changeTimeout = null;
                        analiseSemantica(evento.document, diagnosticosDelegua);
                    }, 500);
                    break;
                case 'lmht':
                    tentarFecharTagLmht(evento);
                    break;
                default:
                    break;
            }
        })
	);

	context.subscriptions.push(
		vscode.workspace.onDidCloseTextDocument(doc => diagnosticosDelegua.delete(doc.uri))
	);

    // Traduções

    context.subscriptions.push(
        vscode.commands.registerCommand(
            'extension.designliquido.traduzir.css.para.foles',
            () => traduzir('css', 'foles')
        )
    );

    context.subscriptions.push(
        vscode.commands.registerCommand(
            'extension.designliquido.traduzir.delegua.para.assemblyscript',
            () => traduzir('delegua', 'assemblyscript')
        )
    );

    context.subscriptions.push(
        vscode.commands.registerCommand(
            'extension.designliquido.traduzir.delegua.para.javascript',
            () => traduzir('delegua', 'js')
        )
    );

    context.subscriptions.push(
        vscode.commands.registerCommand(
            'extension.designliquido.traduzir.delegua.para.python',
            () => traduzir('delegua', 'py')
        )
    );

    context.subscriptions.push(
        vscode.commands.registerCommand(
            'extension.designliquido.traduzir.foles.para.css',
            () => traduzir('foles', 'css')
        )
    );

    context.subscriptions.push(
        vscode.commands.registerCommand(
            'extension.designliquido.traduzir.html.para.lmht',
            () => traduzir('html', 'lmht')
        )
    );

    context.subscriptions.push(
        vscode.commands.registerCommand(
            'extension.designliquido.traduzir.javascript.para.delegua',
            () => traduzir('js', 'delegua')
        )
    );

    context.subscriptions.push(
        vscode.commands.registerCommand(
            'extension.designliquido.traduzir.lmht.para.html',
            () => traduzir('lmht', 'html')
        )
    );
    
    context.subscriptions.push(
        vscode.commands.registerCommand(
            'extension.designliquido.traduzir.visualg.para.delegua',
            () => traduzir('alg', 'delegua')
        )
    );    

    context.subscriptions.push(
        vscode.languages.registerDocumentFormattingEditProvider(
            'delegua',
            new DeleguaProvedorFormatacao()
        )
    );

    context.subscriptions.push(
        vscode.languages.registerDocumentFormattingEditProvider(
            'visualg',
            new VisualgProvedorFormatacao()
        )
    );
    
    context.subscriptions.push(
        vscode.languages.registerDocumentFormattingEditProvider(
            'potigol',
            new PotigolProvedorFormatacao()
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

    // IntelliSense para LMHT
    context.subscriptions.push(
        vscode.languages.registerCompletionItemProvider(
            'lmht',
            new LmhtProvedorCompletude()
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
            'lincones',
            new LinConEsProvedorDocumentacaoEmEditor()
        )
    );
    context.subscriptions.push(
        vscode.languages.registerHoverProvider(
            'lmht',
            new LmhtProvedorDocumentacaoEmEditor()
        )
    );

    context.subscriptions.push(
        vscode.languages.registerHoverProvider(
            'visualg',
            new VisuAlgProvedorDocumentacaoEmEditor()
        )
    );

    // Assinaturas de funções e métodos
    context.subscriptions.push(
        vscode.languages.registerSignatureHelpProvider(
            'delegua',
            new DeleguaProvedorAssinaturaMetodos()
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
