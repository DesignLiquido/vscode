// @ts-nocheck - Ignora erros de tipo nos mocks complexos
import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import * as vscode from 'vscode';

jest.mock('vscode', () => ({
    window: {
        activeTextEditor: undefined,
        showInformationMessage: jest.fn(),
        showErrorMessage: jest.fn(),
        showTextDocument: jest.fn(),
        createWebviewPanel: jest.fn(() => ({ webview: {}, dispose: jest.fn() })),
        registerWebviewViewProvider: jest.fn(() => ({ dispose: jest.fn() })),
        onDidChangeActiveTextEditor: jest.fn(() => ({ dispose: jest.fn() }))
    },
    workspace: {
        workspaceFolders: undefined,
        openTextDocument: jest.fn(),
        findFiles: jest.fn(() => Promise.resolve([])),
        saveAll: jest.fn(() => Promise.resolve(true)),
        onWillRenameFiles: jest.fn(() => ({ dispose: jest.fn() })),
        onDidRenameFiles: jest.fn(() => ({ dispose: jest.fn() })),
        onDidOpenTextDocument: jest.fn(() => ({ dispose: jest.fn() })),
        onDidChangeTextDocument: jest.fn(() => ({ dispose: jest.fn() })),
        onDidCloseTextDocument: jest.fn(() => ({ dispose: jest.fn() })),
        onDidSaveTextDocument: jest.fn(() => ({ dispose: jest.fn() })),
        onDidCreateFiles: jest.fn(() => ({ dispose: jest.fn() })),
        onDidDeleteFiles: jest.fn(() => ({ dispose: jest.fn() }))
    },
    languages: {
        createDiagnosticCollection: jest.fn(() => ({
            clear: jest.fn(),
            delete: jest.fn(),
            dispose: jest.fn(),
            set: jest.fn()
        })),
        registerCompletionItemProvider: jest.fn(() => ({ dispose: jest.fn() })),
        registerHoverProvider: jest.fn(() => ({ dispose: jest.fn() })),
        registerDocumentLinkProvider: jest.fn(() => ({ dispose: jest.fn() })),
        registerDocumentFormattingEditProvider: jest.fn(() => ({ dispose: jest.fn() })),
        registerSignatureHelpProvider: jest.fn(() => ({ dispose: jest.fn() })),
        registerCodeActionsProvider: jest.fn(() => ({ dispose: jest.fn() })),
        registerDefinitionProvider: jest.fn(() => ({ dispose: jest.fn() })),
        registerReferenceProvider: jest.fn(() => ({ dispose: jest.fn() })),
        registerRenameProvider: jest.fn(() => ({ dispose: jest.fn() }))
    },
    commands: {
        registerCommand: jest.fn(() => ({ dispose: jest.fn() }))
    },
    ExtensionContext: jest.fn(),
    Uri: {
        file: jest.fn((path: string) => ({ fsPath: path })),
        parse: jest.fn((path: string) => ({ fsPath: path }))
    },
    ViewColumn: { One: 1 }
}), { virtual: true });

jest.mock('../fontes/depuracao/configuracao-depuracao', () => ({
    configurarDepuracao: jest.fn()
}));

jest.mock('../fontes/depuracao/fabricas', () => ({
    FabricaAdaptadorDepuracaoEmbutido: class FabricaAdaptadorDepuracaoEmbutido {
        constructor(...args: any[]) {}
    }
}));

jest.mock('../fontes/depuracao/fabricas/remotas', () => ({
    DeleguaAdapterServerDescriptorFactory: class {},
    DeleguaAdapterNamedPipeServerDescriptorFactory: class {},
    DeleguaDebugAdapterExecutableFactory: class {}
}));

jest.mock('../fontes/documentacao-em-editor', () => ({
    DeleguaProvedorDocumentacaoEmEditor: class {},
    DeleguaProvedorLinksDocumentacao: class {},
    DelpropsProvedorDocumentacaoEmEditor: class {},
    FolesProvedorDocumentacaoEmEditor: class {},
    LinConEsProvedorDocumentacaoEmEditor: class {},
    PortugolStudioProvedorDocumentacaoEmEditor: class {},
    PituguesProvedorDocumentacaoEmEditor: class {}
}));

jest.mock('../fontes/completude', () => ({
    DeleguaProvedorCompletude: class {},
    DelpropsProvedorCompletude: class {},
    FolesProvedorCompletude: class {},
    LiquidoProvedorCompletude: class {},
    PituguesProvedorCompletude: class {},
    PortugolStudioProvedorCompletude: class {}
}));

jest.mock('../fontes/linguagens/delprops/validador-delprops', () => ({
    validarDelprops: jest.fn(() => [])
}));

jest.mock('../fontes/formatadores', () => ({
    DeleguaProvedorFormatacao: class {
        constructor(...args: any[]) {}
    },
    VisualgProvedorFormatacao: class {}
}));

jest.mock('../fontes/completude/lmht-provedor-completude', () => ({
    LmhtProvedorCompletude: class {}
}));

jest.mock('../fontes/completude/visualg-provedor-completude', () => ({
    VisuAlgProvedorCompletude: class {}
}));

jest.mock('../fontes/documentacao-em-editor/visualg-provedor-documentacao-em-editor', () => ({
    VisuAlgProvedorDocumentacaoEmEditor: class {}
}));

jest.mock('../fontes/traducao', () => ({
    traduzir: jest.fn()
}));

jest.mock('../fontes/analise-codigo', () => ({
    executarAnalises: jest.fn(() => Promise.resolve())
}));

jest.mock('../fontes/assinaturas-metodos', () => ({
    DeleguaProvedorAssinaturaMetodos: class {}
}));

jest.mock('../fontes/documentacao-em-editor/lmht-provedor-documentacao-em-editor', () => ({
    LmhtProvedorDocumentacaoEmEditor: class {}
}));

jest.mock('../fontes/linguagens/lmht/fechamento-estruturas', () => ({
    tentarFecharTagLmht: jest.fn()
}));

jest.mock('../fontes/formatadores/portugol-studio-provedor-formatacao', () => ({
    PortugolStudioProvedorFormatacao: class {}
}));

jest.mock('../fontes/formatadores/potigol-provedor-formatacao', () => ({
    PotigolProvedorFormatacao: class {}
}));

jest.mock('../fontes/visoes', () => ({
    ProvedorVisaoEntradaSaida: class ProvedorVisaoEntradaSaida {
        static viewType = 'delegua.entradaSaida';
        constructor(...args: any[]) {}
        ativarVisao() {}
    }
}));

jest.mock('../fontes/formatadores/mapler-provedor-formatacao', () => ({
    MaplerProvedorFormatacao: class {}
}));

jest.mock('../fontes/formatadores/pitugues-provedor-formatacao', () => ({
    PituguesProvedorFormatacao: class {
        constructor(...args: any[]) {}
    }
}));

jest.mock('../fontes/visoes/fluxogramas/geracao-fluxogramas', () => ({
    gerarFluxograma: jest.fn()
}));

jest.mock('../fontes/visoes/fluxogramas/gerenciador-visoes-fluxograma', () => ({
    GerenciadorVisoesFluxograma: { descartar: jest.fn() }
}));

jest.mock('../fontes/acoes-codigo', () => ({
    DeleguaProvedorAcoesCodigo: class DeleguaProvedorAcoesCodigo {
        static tiposAcoesRapidas = [];
    }
}));

jest.mock('../fontes/definicao', () => ({
    DeleguaProvedorDefinicao: class {}
}));

jest.mock('../fontes/referencias', () => ({
    DeleguaProvedorReferencias: class {}
}));

jest.mock('../fontes/renomeacao', () => ({
    DeleguaProvedorRenomeacao: class {},
    registrarRenomeacaoArquivosDelegua: jest.fn(() => ({ dispose: jest.fn() }))
}));

jest.mock('../fontes/mecanismo-importacao-bibliotecas', () => ({
    definirFabricaPainelWebView: jest.fn()
}));

import * as extensao from '../fontes/extensao';

describe('Extensão VSCode - Design Líquido', () => {
    describe('Carregamento da extensão', () => {
        it('deve importar o módulo da extensão sem erros', () => {
            expect(extensao).toBeDefined();
        });
    });

    describe('Funções de ativação', () => {
        let context: any;

        beforeEach(() => {
            jest.clearAllMocks();

            context = {
                subscriptions: [],
                extensionUri: vscode.Uri.file('/test/path'),
                extensionPath: '/test/path'
            };
        });

        it('deve ter uma função activate exportada', () => {
            expect(typeof extensao.activate).toBe('function');
        });

        it('deve ter uma função deactivate exportada', () => {
            expect(typeof extensao.deactivate).toBe('function');
        });

        it('deve registrar comandos durante a ativação', () => {
            extensao.activate(context);

            expect(vscode.commands.registerCommand).toHaveBeenCalled();
            expect(context.subscriptions.length).toBeGreaterThan(0);
        });

        it('deve criar coleção de diagnósticos', () => {
            extensao.activate(context);

            expect(vscode.languages.createDiagnosticCollection).toHaveBeenCalledWith('delegua');
        });

        it('deve registrar provedores de completude', () => {
            extensao.activate(context);

            expect(vscode.languages.registerCompletionItemProvider).toHaveBeenCalled();
        });

        it('deve registrar completude de Delégua com gatilho @', () => {
            extensao.activate(context);

            expect(vscode.languages.registerCompletionItemProvider).toHaveBeenCalledWith(
                [
                    { scheme: 'file', language: 'delegua' },
                    { scheme: 'untitled', language: 'delegua' }
                ],
                expect.anything(),
                '@'
            );
        });

        it('deve registrar provedores de formatação', () => {
            extensao.activate(context);

            expect(vscode.languages.registerDocumentFormattingEditProvider).toHaveBeenCalled();
        });

        it('deve registrar provedores de links em documentários', () => {
            extensao.activate(context);

            expect(vscode.languages.registerDocumentLinkProvider).toHaveBeenCalled();
        });

        it('deve registrar ouvinte de renomeação de arquivos', () => {
            extensao.activate(context);

            expect(vscode.workspace.onDidRenameFiles).toHaveBeenCalled();
        });

        it('deve registrar provedor de renomeação de símbolos Delégua', () => {
            extensao.activate(context);

            expect(vscode.languages.registerRenameProvider).toHaveBeenCalled();
        });
    });
});
