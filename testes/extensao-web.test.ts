// @ts-nocheck
import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import * as vscode from 'vscode';

jest.mock('vscode', () => ({
    window: {
        activeTextEditor: undefined,
        onDidChangeActiveTextEditor: jest.fn(() => ({ dispose: jest.fn() })),
        showInformationMessage: jest.fn(),
        showErrorMessage: jest.fn(),
        showInputBox: jest.fn(async () => undefined),
        showTextDocument: jest.fn(),
        registerWebviewViewProvider: jest.fn(() => ({ dispose: jest.fn() })),
    },
    workspace: {
        workspaceFolders: undefined,
        fs: {
            writeFile: jest.fn(async () => undefined),
        },
        openTextDocument: jest.fn(),
        findFiles: jest.fn(async () => []),
        onDidOpenTextDocument: jest.fn(() => ({ dispose: jest.fn() })),
        onDidSaveTextDocument: jest.fn(() => ({ dispose: jest.fn() })),
        onDidCloseTextDocument: jest.fn(() => ({ dispose: jest.fn() })),
        onDidCreateFiles: jest.fn(() => ({ dispose: jest.fn() })),
        onDidDeleteFiles: jest.fn(() => ({ dispose: jest.fn() })),
        onDidRenameFiles: jest.fn(() => ({ dispose: jest.fn() })),
        onDidChangeTextDocument: jest.fn(() => ({ dispose: jest.fn() })),
    },
    languages: {
        createDiagnosticCollection: jest.fn(() => ({ delete: jest.fn(), dispose: jest.fn() })),
        registerCodeActionsProvider: jest.fn(() => ({ dispose: jest.fn() })),
        registerDocumentFormattingEditProvider: jest.fn(() => ({ dispose: jest.fn() })),
        registerCompletionItemProvider: jest.fn(() => ({ dispose: jest.fn() })),
        registerHoverProvider: jest.fn(() => ({ dispose: jest.fn() })),
        registerDocumentLinkProvider: jest.fn(() => ({ dispose: jest.fn() })),
        registerDefinitionProvider: jest.fn(() => ({ dispose: jest.fn() })),
        registerReferenceProvider: jest.fn(() => ({ dispose: jest.fn() })),
        registerRenameProvider: jest.fn(() => ({ dispose: jest.fn() })),
        registerSignatureHelpProvider: jest.fn(() => ({ dispose: jest.fn() })),
    },
    commands: {
        registerCommand: jest.fn(() => ({ dispose: jest.fn() })),
    },
    Uri: {
        file: jest.fn((path: string) => ({ fsPath: path, path })),
        joinPath: jest.fn((base: any, nome: string) => ({
            fsPath: `${base?.fsPath || ''}/${nome}`,
            path: `${base?.path || ''}/${nome}`,
        })),
    },
}), { virtual: true });

jest.mock('../fontes/traducao/index-web', () => ({
    __esModule: true,
    default: { traduzir: jest.fn(async () => undefined) },
}));

jest.mock('../fontes/depuracao/configuracao-depuracao', () => ({ configurarDepuracao: jest.fn() }));
jest.mock('../fontes/documentacao-em-editor', () => ({
    DeleguaProvedorDocumentacaoEmEditor: class {},
    DeleguaProvedorLinksDocumentacao: class {},
    FolesProvedorDocumentacaoEmEditor: class {},
    LinConEsProvedorDocumentacaoEmEditor: class {},
    VisuAlgProvedorDocumentacaoEmEditor: class {},
    LmhtProvedorDocumentacaoEmEditor: class {},
    PortugolStudioProvedorDocumentacaoEmEditor: class {},
    PituguesProvedorDocumentacaoEmEditor: class {},
}));
jest.mock('../fontes/completude', () => ({
    DeleguaProvedorCompletude: class {},
    FolesProvedorCompletude: class {},
    LiquidoProvedorCompletude: class {},
    VisuAlgProvedorCompletude: class {},
    LmhtProvedorCompletude: class {},
    PortugolStudioProvedorCompletude: class {},
}));

jest.mock('../fontes/formatadores/delegua-provedor-formatacao', () => ({ DeleguaProvedorFormatacao: class {} }));
jest.mock('../fontes/formatadores/visualg-provedor-formatacao', () => ({ VisualgProvedorFormatacao: class {} }));
jest.mock('../fontes/formatadores/mapler-provedor-formatacao', () => ({ MaplerProvedorFormatacao: class {} }));
jest.mock('../fontes/formatadores/potigol-provedor-formatacao', () => ({ PotigolProvedorFormatacao: class {} }));
jest.mock('../fontes/formatadores/portugol-studio-provedor-formatacao', () => ({ PortugolStudioProvedorFormatacao: class {} }));
jest.mock('../fontes/formatadores/pitugues-provedor-formatacao', () => ({ PituguesProvedorFormatacao: class {} }));

jest.mock('../fontes/analise-codigo', () => ({ executarAnalises: jest.fn(async () => undefined) }));
jest.mock('../fontes/assinaturas-metodos', () => ({ DeleguaProvedorAssinaturaMetodos: class {} }));
jest.mock('../fontes/linguagens/lmht/fechamento-estruturas', () => ({ tentarFecharTagLmht: jest.fn() }));
jest.mock('../fontes/visoes', () => ({
    ProvedorVisaoEntradaSaida: class {
        static viewType = 'delegua.entradaSaida';
        ativarVisao() {}
    },
}));
jest.mock('../fontes/depuracao/fabricas/fabrica-adaptador-depuracao-web', () => ({
    FabricaAdaptadorDepuracaoWeb: class {},
}));
jest.mock('../fontes/visoes/fluxogramas/gerenciador-visoes-fluxograma', () => ({
    GerenciadorVisoesFluxograma: { descartar: jest.fn() },
}));
jest.mock('../fontes/visoes/fluxogramas/geracao-fluxogramas-web', () => ({ gerarFluxogramaWeb: jest.fn(async () => undefined) }));
jest.mock('../fontes/acoes-codigo/delegua-provedor-acoes-codigo', () => ({
    DeleguaProvedorAcoesCodigo: class { static tiposAcoesRapidas = []; },
}));
jest.mock('../fontes/definicao', () => ({ DeleguaProvedorDefinicao: class {} }));
jest.mock('../fontes/referencias', () => ({ DeleguaProvedorReferencias: class {} }));
jest.mock('../fontes/renomeacao', () => ({ DeleguaProvedorRenomeacao: class {} }));
jest.mock('../fontes/analise-codigo/cache-analise', () => ({
    expirarResultado: jest.fn(),
    expirarResultados: jest.fn(),
    expirarResultadosPorDependenciaArquivo: jest.fn(),
    expirarTudo: jest.fn(),
}));
jest.mock('../fontes/analise-codigo/cache-definicoes', () => ({ expirarTodasDefinicoes: jest.fn() }));

import { activate } from '../fontes/extensao-web';

describe('Extensão Web', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('registra provedor de renomeação de símbolos Delégua', () => {
        const context: any = {
            subscriptions: [],
            extensionUri: vscode.Uri.file('/test/path'),
        };

        activate(context);

        expect(vscode.languages.registerRenameProvider).toHaveBeenCalledWith(
            { language: 'delegua' },
            expect.anything()
        );
    });
});
