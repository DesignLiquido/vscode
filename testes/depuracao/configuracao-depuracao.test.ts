import { beforeEach, describe, expect, it, jest } from '@jest/globals';

const registrosComandos = new Map<string, Function>();
const iniciarDepuracao = jest.fn();
const requisicaoPersonalizada = jest.fn();
const registrarComando = jest.fn((nome: string, callback: Function) => {
    registrosComandos.set(nome, callback);
    return { dispose: jest.fn() };
});

const mockVscode = {
    commands: {
        registerCommand: registrarComando
    },
    debug: {
        startDebugging: iniciarDepuracao,
        activeDebugSession: {
            customRequest: requisicaoPersonalizada
        },
        registerDebugConfigurationProvider: jest.fn(() => ({ dispose: jest.fn() })),
        registerDebugAdapterDescriptorFactory: jest.fn(() => ({ dispose: jest.fn() }))
    },
    window: {
        activeTextEditor: {
            document: {
                uri: { fsPath: 'C:/projeto/entrada.delegua' }
            }
        },
        showInputBox: jest.fn()
    },
    workspace: {
        fs: {
            readFile: jest.fn(async () => new Uint8Array([1, 2, 3])),
            writeFile: jest.fn(async () => undefined)
        }
    },
    Uri: {
        file: jest.fn((caminho: string) => ({ fsPath: caminho })),
        parse: jest.fn((caminho: string) => ({ fsPath: `parse:${caminho}` }))
    },
    DebugConfigurationProviderTriggerKind: {
        Dynamic: 2
    }
};

jest.mock('vscode', () => mockVscode, { virtual: true });
jest.mock('../../fontes/depuracao/provedores', () => ({
    ProvedorConfiguracaoDelegua: class {}
}));

import { configurarDepuracao, workspaceFileAccessor } from '../../fontes/depuracao/configuracao-depuracao';

describe('configuracao-depuracao', () => {
    beforeEach(() => {
        registrosComandos.clear();
        iniciarDepuracao.mockClear();
        requisicaoPersonalizada.mockClear();
        registrarComando.mockReset();
        registrarComando.mockImplementation((nome: string, callback: Function) => {
            registrosComandos.set(nome, callback);
            return { dispose: jest.fn() };
        });
        mockVscode.debug.registerDebugConfigurationProvider.mockReset();
        mockVscode.debug.registerDebugConfigurationProvider.mockImplementation(() => ({ dispose: jest.fn() }));
        mockVscode.debug.registerDebugAdapterDescriptorFactory.mockReset();
        mockVscode.debug.registerDebugAdapterDescriptorFactory.mockImplementation(() => ({ dispose: jest.fn() }));
        mockVscode.workspace.fs.readFile.mockClear();
        mockVscode.workspace.fs.readFile.mockImplementation(async () => new Uint8Array([1, 2, 3]));
        mockVscode.workspace.fs.writeFile.mockClear();
        mockVscode.workspace.fs.writeFile.mockImplementation(async () => undefined);
        mockVscode.Uri.file.mockClear();
        mockVscode.Uri.parse.mockClear();
        mockVscode.Uri.file.mockImplementation((caminho: string) => ({ fsPath: caminho }));
        mockVscode.Uri.parse.mockImplementation((caminho: string) => ({ fsPath: `parse:${caminho}` }));
    });

    it('deve iniciar depuracao ao executar comando runEditorContents sem recurso explicito', () => {
        const contexto: any = { subscriptions: [] };
        const fabrica: any = { dispose: jest.fn() };

        configurarDepuracao(contexto, fabrica);

        const comando = registrosComandos.get('extension.designliquido.runEditorContents');
        expect(comando).toBeDefined();

        comando!(undefined);

        expect(iniciarDepuracao).toHaveBeenCalledWith(undefined, expect.objectContaining({
            program: 'C:/projeto/entrada.delegua',
            name: 'Executar Arquivo',
            request: 'launch',
            type: 'delegua'
        }));
    });

    it('deve alternar formatacao quando existir sessao ativa', () => {
        const contexto: any = { subscriptions: [] };

        configurarDepuracao(contexto, {} as any);

        const comando = registrosComandos.get('extension.designliquido.toggleFormatting');
        expect(comando).toBeDefined();

        comando!({});

        expect(requisicaoPersonalizada).toHaveBeenCalledWith('toggleFormatting');
    });

    it('deve retornar mensagem amigavel quando Uri.file falhar na leitura', async () => {
        mockVscode.Uri.file.mockImplementation(() => {
            throw new Error('falhou');
        });
        mockVscode.Uri.parse.mockImplementation(() => {
            throw new Error('falhou-parse');
        });

        const resposta = await workspaceFileAccessor.lerArquivo('conteudo-invalido');
        const mensagem = new TextDecoder().decode(resposta);

        expect(mensagem).toContain("Não foi possível ler 'conteudo-invalido'");
        expect(mockVscode.workspace.fs.readFile).not.toHaveBeenCalled();
    });

    it('deve escrever arquivo usando workspace.fs.writeFile', async () => {
        const conteudo = new Uint8Array([10, 20]);
        const mockEscreverArquivo = mockVscode.workspace.fs.writeFile as jest.Mock;

        await workspaceFileAccessor.escreverArquivo('C:/projeto/saida.delegua', conteudo);

        expect(mockEscreverArquivo).toHaveBeenCalledWith(
            expect.objectContaining({ fsPath: 'C:/projeto/saida.delegua' }),
            conteudo
        );
    });
});
