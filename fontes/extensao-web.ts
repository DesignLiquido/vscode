'use strict';

import * as vscode from 'vscode';

import { configurarDepuracao } from './depuracao/configuracao-depuracao';
import {
    FabricaAdaptadorDepuracaoEmbutido
} from './depuracao/fabricas';
import { DeleguaProvedorDocumentacaoEmEditor } from './documentacao-em-editor';
import { DeleguaProvedorCompletude, LiquidoProvedorCompletude } from './completude';
import { DeleguaProvedorFormatacao } from './formatadores';

export function activate(context: vscode.ExtensionContext) {
    context.subscriptions.push(
        vscode.languages.registerDocumentFormattingEditProvider('delegua', 
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

    // Hovers
    context.subscriptions.push(
        vscode.languages.registerHoverProvider(
            'delegua', 
            new DeleguaProvedorDocumentacaoEmEditor()
        )
    );

    configurarDepuracao(
        context,
        new FabricaAdaptadorDepuracaoEmbutido()
    );
}

export function deactivate() {
    // nothing to do
}
