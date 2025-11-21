import * as vscode from 'vscode';

import { configurarDepuracao } from './depuracao/configuracao-depuracao';
import { DeleguaProvedorDocumentacaoEmEditor } from './documentacao-em-editor';
import { DeleguaProvedorCompletude, LiquidoProvedorCompletude } from './completude';
import { DeleguaProvedorFormatacao } from './formatadores';
import { FabricaAdaptadorDepuracaoWeb } from './depuracao/fabricas/fabrica-adaptador-depuracao-web';
import { ProvedorVisaoEntradaSaida } from './visoes';

export function activate(context: vscode.ExtensionContext) {
    const diagnosticosDelegua = vscode.languages.createDiagnosticCollection("delegua");
    
    context.subscriptions.push(
        vscode.languages.registerDocumentFormattingEditProvider(
            { scheme: 'vscode-vfs', language: 'delegua' },
            new DeleguaProvedorFormatacao(diagnosticosDelegua)
        )
    );

    // IntelliSense para Delégua e Liquido.
    context.subscriptions.push(
        vscode.languages.registerCompletionItemProvider(
            { 
                scheme: 'vscode-vfs', 
                language: 'delegua', 
                pattern: '**/configuracao.delegua' 
            },
            new LiquidoProvedorCompletude(),
            '.' // acionado quando desenvolvedor/a digita '.'
        )
    );

    context.subscriptions.push(
        vscode.languages.registerCompletionItemProvider(
            { scheme: 'vscode-vfs', language: 'delegua' },
            new DeleguaProvedorCompletude()
        )
    );

    // Hovers
    context.subscriptions.push(
        vscode.languages.registerHoverProvider(
            { scheme: 'vscode-vfs', language: 'delegua' },
            new DeleguaProvedorDocumentacaoEmEditor()
        )
    );

    // Visão de Entrada e Saída
    const provedorEntradaSaida = new ProvedorVisaoEntradaSaida(context.extensionUri);
    context.subscriptions.push(
        vscode.window.registerWebviewViewProvider(
            ProvedorVisaoEntradaSaida.viewType, 
            provedorEntradaSaida,
            {
                webviewOptions: {
                    retainContextWhenHidden: true
                }
            }
        )
    );

    configurarDepuracao(
        context,
        new FabricaAdaptadorDepuracaoWeb(provedorEntradaSaida, diagnosticosDelegua)
    );
}

export function deactivate() {
    // nothing to do
}