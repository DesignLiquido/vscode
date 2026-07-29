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
    tasks: {
        registerTaskProvider: jest.fn(() => ({ dispose: jest.fn() })),
        fetchTasks: jest.fn(() => Promise.resolve([])),
        executeTask: jest.fn(() => Promise.resolve())
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
        registerRenameProvider: jest.fn(() => ({ dispose: jest.fn() })),
        registerDocumentSymbolProvider: jest.fn(() => ({ dispose: jest.fn() })),
        registerFoldingRangeProvider: jest.fn(() => ({ dispose: jest.fn() })),
        registerCodeLensProvider: jest.fn(() => ({ dispose: jest.fn() })),
        registerInlayHintsProvider: jest.fn(() => ({ dispose: jest.fn() })),
        registerDocumentSemanticTokensProvider: jest.fn(() => ({ dispose: jest.fn() })),
        registerWorkspaceSymbolProvider: jest.fn(() => ({ dispose: jest.fn() }))
    },
    SemanticTokens: class {
        constructor(data: Uint32Array) { this.data = data; }
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
    DeleguaTestesProvedorDocumentacaoEmEditor: class {},
    DeleguaProvedorLinksDocumentacao: class {},
    DelpropsProvedorDocumentacaoEmEditor: class {},
    FolesProvedorDocumentacaoEmEditor: class {},
    LinConEsProvedorDocumentacaoEmEditor: class {},
    PortugolStudioProvedorDocumentacaoEmEditor: class {},
    PituguesProvedorDocumentacaoEmEditor: class {}
}));

jest.mock('../fontes/completude', () => ({
    DeleguaProvedorCompletude: class {},
    DeleguaTestesProvedorCompletude: class {},
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

jest.mock('@designliquido/delegua-lsp/analise/cache-analise');
jest.mock('@designliquido/delegua-lsp/analise/cache-definicoes');

jest.mock('../fontes/importacao/utilitarios-caminho-importacao-delegua', () => ({
    ehArquivoDelegua: jest.fn((uri: any) => uri?.fsPath?.endsWith('.delegua')),
}));

jest.mock('../fontes/assinaturas-metodos', () => ({
    DeleguaProvedorAssinaturaMetodos: class {},
    DeleguaTestesProvedorAssinaturaMetodos: class {}
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

jest.mock('../fontes/dobramento/delegua-base', () => ({ declaracoesParaRangesDobramento: jest.fn(() => []) }));
jest.mock('../fontes/dobramento/delegua', () => ({ DeleguaProvedorDobramento: class {} }));
jest.mock('../fontes/dobramento/pitugues', () => ({ PituguesProvedorDobramento: class {} }));

jest.mock('../fontes/lentes-codigo/delegua-base', () => ({ declaracoesParaLentes: jest.fn(() => []), criarLenteReferencias: jest.fn() }));
jest.mock('../fontes/lentes-codigo/delegua', () => ({ DeleguaProvedorLentesCodigo: class {} }));

jest.mock('../fontes/dicas-insercao/delegua-base', () => ({ declaracoesParaDicasInsercao: jest.fn(() => []) }));
jest.mock('../fontes/dicas-insercao/delegua', () => ({ DeleguaProvedorDicasInsercao: class {} }));
jest.mock('../fontes/dicas-insercao/pitugues', () => ({ PituguesProvedorDicasInsercao: class {} }));

jest.mock('../fontes/tokens-semanticos/delegua-base', () => ({ declaracoesParaTokensSemanticos: jest.fn(() => new (require('vscode').SemanticTokens)(new Uint32Array(0))), LEGENDA_TOKENS_SEMANTICOS: { tokenTypes: [], tokenModifiers: [] }, extrairTokensDeDocumento: jest.fn(() => []), tokensParaSemanticTokens: jest.fn(() => new (require('vscode').SemanticTokens)(new Uint32Array(0))) }));
jest.mock('../fontes/tokens-semanticos/delegua', () => ({ DeleguaProvedorTokensSemanticos: class {}, LEGENDA_TOKENS_SEMANTICOS: { tokenTypes: [], tokenModifiers: [] } }));
jest.mock('../fontes/tokens-semanticos/pitugues', () => ({ PituguesProvedorTokensSemanticos: class {}, LEGENDA_TOKENS_SEMANTICOS: { tokenTypes: [], tokenModifiers: [] } }));

jest.mock('../fontes/simbolos-trabalho/delegua', () => ({ DeleguaProvedorSimbolosTrabalho: class {} }));

import * as extensao from '../fontes/extensao';
import { executarAnalises } from '../fontes/analise-codigo';
import {
    expirarResultados,
    expirarResultadosPorDependenciaArquivo,
    expirarTudo,
} from '@designliquido/delegua-lsp/analise/cache-analise';
import { expirarTodasDefinicoes } from '@designliquido/delegua-lsp/analise/cache-definicoes';
import { GerenciadorVisoesFluxograma } from '../fontes/visoes/fluxogramas/gerenciador-visoes-fluxograma';
import { ehArquivoDelegua } from '../fontes/importacao/utilitarios-caminho-importacao-delegua';

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

            const criarDisposable = () => ({ dispose: jest.fn() });
            (vscode.workspace.onWillRenameFiles as jest.Mock).mockImplementation(() => criarDisposable());
            (vscode.workspace.onDidRenameFiles as jest.Mock).mockImplementation(() => criarDisposable());
            (vscode.workspace.onDidOpenTextDocument as jest.Mock).mockImplementation(() => criarDisposable());
            (vscode.workspace.onDidChangeTextDocument as jest.Mock).mockImplementation(() => criarDisposable());
            (vscode.workspace.onDidCloseTextDocument as jest.Mock).mockImplementation(() => criarDisposable());
            (vscode.workspace.onDidSaveTextDocument as jest.Mock).mockImplementation(() => criarDisposable());
            (vscode.workspace.onDidCreateFiles as jest.Mock).mockImplementation(() => criarDisposable());
            (vscode.workspace.onDidDeleteFiles as jest.Mock).mockImplementation(() => criarDisposable());
            (vscode.window.onDidChangeActiveTextEditor as jest.Mock).mockImplementation(() => criarDisposable());
            (vscode.commands.registerCommand as jest.Mock).mockImplementation(() => criarDisposable());
            (vscode.languages.registerRenameProvider as jest.Mock).mockImplementation(() => criarDisposable());
            (vscode.workspace.findFiles as jest.Mock).mockResolvedValue([]);
            (vscode.workspace.saveAll as jest.Mock).mockResolvedValue(true);
            (ehArquivoDelegua as jest.Mock).mockImplementation((uri: any) => uri?.fsPath?.endsWith('.delegua'));

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

        it('deve expirar caches ao salvar dependência de projeto', () => {
            extensao.activate(context);

            const callback = (vscode.workspace.onDidSaveTextDocument as jest.Mock).mock.calls[0][0];
            callback({ fileName: '/projeto/package-lock.json', uri: { path: '/projeto/package-lock.json' } });

            expect(expirarTudo).toHaveBeenCalledWith('dependencias-atualizadas');
            expect(expirarTodasDefinicoes).toHaveBeenCalledWith('dependencias-atualizadas');
        });

        it('deve expirar resultados ao criar arquivo delegua', () => {
            extensao.activate(context);

            const callback = (vscode.workspace.onDidCreateFiles as jest.Mock).mock.calls[0][0];
            callback({
                files: [
                    { fsPath: '/projeto/um.delegua', toString: () => 'file:///projeto/um.delegua' },
                    { fsPath: '/projeto/anotacao.txt', toString: () => 'file:///projeto/anotacao.txt' },
                ],
            });

            expect(expirarResultados).toHaveBeenCalledWith(
                ['file:///projeto/um.delegua', 'file:///projeto/anotacao.txt'],
                'arquivo-criado'
            );
            expect(expirarResultadosPorDependenciaArquivo).toHaveBeenCalledWith(
                ['/projeto/um.delegua'],
                'arquivo-delegua-criado'
            );
        });

        it('não deve salvar e reanalisar quando renomeação não envolve delegua', async () => {
            extensao.activate(context);

            const callback = (vscode.workspace.onDidRenameFiles as jest.Mock).mock.calls[0][0];
            await callback({
                files: [
                    {
                        oldUri: { fsPath: '/projeto/velho.txt', toString: () => 'file:///projeto/velho.txt' },
                        newUri: { fsPath: '/projeto/novo.txt', toString: () => 'file:///projeto/novo.txt' },
                    },
                ],
            });

            expect(vscode.workspace.saveAll).not.toHaveBeenCalled();
            expect(vscode.workspace.findFiles).not.toHaveBeenCalled();
            expect(executarAnalises).not.toHaveBeenCalled();
        });

        it('deve salvar e reanalisar ao renomear arquivo delegua', async () => {
            extensao.activate(context);

            (vscode.workspace.findFiles as jest.Mock).mockResolvedValueOnce([{ fsPath: '/projeto/um.delegua' }]);
            (vscode.workspace.openTextDocument as jest.Mock).mockResolvedValueOnce({
                languageId: 'delegua',
                fileName: '/projeto/um.delegua',
                uri: { toString: () => 'file:///projeto/um.delegua' },
                getText: () => 'escreva("oi")',
                version: 1,
            });

            const callback = (vscode.workspace.onDidRenameFiles as jest.Mock).mock.calls[0][0];
            await callback({
                files: [
                    {
                        oldUri: { fsPath: '/projeto/velho.delegua', toString: () => 'file:///projeto/velho.delegua' },
                        newUri: { fsPath: '/projeto/novo.delegua', toString: () => 'file:///projeto/novo.delegua' },
                    },
                ],
            });

            expect(vscode.workspace.saveAll).toHaveBeenCalledWith(false);
            expect(vscode.workspace.findFiles).toHaveBeenCalled();
            expect(executarAnalises).toHaveBeenCalled();
        });

        it('deactivate deve descartar gerenciador de fluxogramas', () => {
            extensao.deactivate();
            expect(GerenciadorVisoesFluxograma.descartar).toHaveBeenCalled();
        });
    });
});
