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
    ProvedorVisaoEntradaSaidaWeb: class {
        static viewType = 'delegua.entradaSaida';
        constructor(_extensionUri: any) {}
        resolveWebviewView() {}
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
jest.mock('@designliquido/delegua-lsp/analise/cache-analise', () => ({
    expirarResultado: jest.fn(),
    expirarResultados: jest.fn(),
    expirarResultadosPorDependenciaArquivo: jest.fn(),
    expirarTudo: jest.fn(),
}));
jest.mock('@designliquido/delegua-lsp/analise/cache-definicoes', () => ({ expirarTodasDefinicoes: jest.fn() }));

import tradutorWeb from '../fontes/traducao/index-web';
import { executarAnalises } from '../fontes/analise-codigo';
import { tentarFecharTagLmht } from '../fontes/linguagens/lmht/fechamento-estruturas';
import {
    expirarResultado,
    expirarResultados,
    expirarResultadosPorDependenciaArquivo,
    expirarTudo,
} from '@designliquido/delegua-lsp/analise/cache-analise';
import { expirarTodasDefinicoes } from '@designliquido/delegua-lsp/analise/cache-definicoes';
import { GerenciadorVisoesFluxograma } from '../fontes/visoes/fluxogramas/gerenciador-visoes-fluxograma';
import { activate, deactivate } from '../fontes/extensao-web';

function obterComando(nomeComando: string): (...argumentos: any[]) => Promise<void> | void {
    const chamada = (vscode.commands.registerCommand as jest.Mock).mock.calls.find(
        ([nome]) => nome === nomeComando
    );
    return chamada?.[1];
}

describe('Extensão Web', () => {
    beforeEach(() => {
        jest.clearAllMocks();

        const criarDisposable = () => ({ dispose: jest.fn() });
        (vscode.workspace.onDidOpenTextDocument as jest.Mock).mockImplementation(() => criarDisposable());
        (vscode.workspace.onDidSaveTextDocument as jest.Mock).mockImplementation(() => criarDisposable());
        (vscode.workspace.onDidCloseTextDocument as jest.Mock).mockImplementation(() => criarDisposable());
        (vscode.workspace.onDidCreateFiles as jest.Mock).mockImplementation(() => criarDisposable());
        (vscode.workspace.onDidDeleteFiles as jest.Mock).mockImplementation(() => criarDisposable());
        (vscode.workspace.onDidRenameFiles as jest.Mock).mockImplementation(() => criarDisposable());
        (vscode.workspace.onDidChangeTextDocument as jest.Mock).mockImplementation(() => criarDisposable());
        (vscode.window.onDidChangeActiveTextEditor as jest.Mock).mockImplementation(() => criarDisposable());
        (vscode.languages.createDiagnosticCollection as jest.Mock).mockImplementation(() => ({
            delete: jest.fn(),
            dispose: jest.fn(),
        }));
        (vscode.workspace.findFiles as jest.Mock).mockResolvedValue([]);
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

    it('expira cache ao salvar arquivo de dependência do projeto', () => {
        const context: any = { subscriptions: [], extensionUri: vscode.Uri.file('/test/path') };
        activate(context);

        const callback = (vscode.workspace.onDidSaveTextDocument as jest.Mock).mock.calls[0][0];
        callback({ uri: { path: '/projeto/package.json' } });

        expect(expirarTudo).toHaveBeenCalledWith('dependencias-atualizadas');
        expect(expirarTodasDefinicoes).toHaveBeenCalledWith('dependencias-atualizadas');
    });

    it('expira resultados de arquivo e dependências ao criar arquivos', () => {
        const context: any = { subscriptions: [], extensionUri: vscode.Uri.file('/test/path') };
        activate(context);

        const callback = (vscode.workspace.onDidCreateFiles as jest.Mock).mock.calls[0][0];
        callback({
            files: [
                { path: '/projeto/novo.delegua', toString: () => 'file:///projeto/novo.delegua' },
                { path: '/projeto/notas.txt', toString: () => 'file:///projeto/notas.txt' },
            ],
        });

        expect(expirarResultados).toHaveBeenCalledWith(
            ['file:///projeto/novo.delegua', 'file:///projeto/notas.txt'],
            'arquivo-criado'
        );
        expect(expirarResultadosPorDependenciaArquivo).toHaveBeenCalledWith(
            ['/projeto/novo.delegua'],
            'arquivo-linguagem-criado'
        );
    });

    it('expira resultados de arquivo ao fechar documento', () => {
        const context: any = { subscriptions: [], extensionUri: vscode.Uri.file('/test/path') };
        activate(context);

        const callback = (vscode.workspace.onDidCloseTextDocument as jest.Mock).mock.calls[0][0];
        callback({ uri: { toString: () => 'file:///projeto/arquivo.delegua' } });

        expect(expirarResultado).toHaveBeenCalledWith('file:///projeto/arquivo.delegua', 'documento-fechado');
    });

    it('encaminha fechamento de tags para LMHT', () => {
        const context: any = { subscriptions: [], extensionUri: vscode.Uri.file('/test/path') };
        activate(context);

        const callback = (vscode.workspace.onDidChangeTextDocument as jest.Mock).mock.calls[0][0];
        const evento = { document: { languageId: 'lmht' } } as any;

        callback(evento);

        expect(tentarFecharTagLmht).toHaveBeenCalledWith(evento);
    });

    it('executa tradução web e mostra erro quando tradutor falha', async () => {
        const context: any = { subscriptions: [], extensionUri: vscode.Uri.file('/test/path') };
        (tradutorWeb.traduzir as jest.Mock).mockRejectedValueOnce(new Error('falhou'));

        activate(context);
        const comando = obterComando('extension.designliquido.traduzir.css.para.foles');
        await comando();

        expect(tradutorWeb.traduzir).toHaveBeenCalledWith('css', 'foles', '');
        expect(vscode.window.showErrorMessage).toHaveBeenCalledWith('Erro na tradução web: falhou');
    });

    it('criar arquivo pituguês mostra erro sem pasta aberta', async () => {
        const context: any = { subscriptions: [], extensionUri: vscode.Uri.file('/test/path') };
        (vscode.workspace as any).workspaceFolders = undefined;

        activate(context);
        const comando = obterComando('extension.designliquido.criarArquivoPitugues');
        await comando();

        expect(vscode.window.showErrorMessage).toHaveBeenCalledWith('Nenhuma pasta aberta no VS Code.');
        expect(vscode.workspace.fs.writeFile).not.toHaveBeenCalled();
    });

    it('criar arquivo pituguês grava arquivo e abre no editor', async () => {
        const context: any = { subscriptions: [], extensionUri: vscode.Uri.file('/test/path') };
        (vscode.workspace as any).workspaceFolders = [{ uri: { fsPath: '/workspace', path: '/workspace' } }];
        (vscode.window.showInputBox as jest.Mock).mockResolvedValueOnce('novo-arquivo');
        (vscode.workspace.openTextDocument as jest.Mock).mockResolvedValueOnce({ uri: { path: '/workspace/novo-arquivo.pitugues' } });

        activate(context);
        const comando = obterComando('extension.designliquido.criarArquivoPitugues');
        await comando();

        expect(vscode.workspace.fs.writeFile).toHaveBeenCalled();
        expect(vscode.window.showInformationMessage).toHaveBeenCalledWith('Arquivo criado: novo-arquivo.pitugues');
        expect(vscode.window.showTextDocument).toHaveBeenCalled();
    });

    it('deactivate descarta gerenciador de fluxogramas', () => {
        deactivate();
        expect(GerenciadorVisoesFluxograma.descartar).toHaveBeenCalled();
    });
});
