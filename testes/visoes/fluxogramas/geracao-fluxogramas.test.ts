// @ts-nocheck
import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import * as vscode from 'vscode';
import * as path from 'path';

jest.mock('vscode', () => ({
    window: {
        activeTextEditor: undefined,
        showErrorMessage: jest.fn(),
        showWarningMessage: jest.fn(),
        withProgress: jest.fn()
    },
    ProgressLocation: { Notification: 15 }
}), { virtual: true });

jest.mock('path', () => ({ basename: jest.fn() }));

jest.mock('@designliquido/delegua/lexador', () => ({
    Lexador: jest.fn()
}));

jest.mock('@designliquido/delegua', () => ({
    AvaliadorSintatico: jest.fn(),
    RetornoLexador: jest.fn(),
    SimboloInterface: jest.fn()
}));

jest.mock('@designliquido/delegua/tradutores', () => ({
    TradutorMermaidJs: jest.fn()
}));

jest.mock('../../../fontes/importador', () => ({
    ImportadorExtensao: jest.fn()
}));

jest.mock('../../../fontes/visoes/fluxogramas/gerenciador-visoes-fluxograma', () => ({
    GerenciadorVisoesFluxograma: {
        criarOuExibir: jest.fn()
    }
}));

import { gerarFluxograma } from '../../../fontes/visoes/fluxogramas/geracao-fluxogramas';
import { GerenciadorVisoesFluxograma } from '../../../fontes/visoes/fluxogramas/gerenciador-visoes-fluxograma';
import { ImportadorExtensao } from '../../../fontes/importador';
import { AvaliadorSintatico } from '@designliquido/delegua';
import { TradutorMermaidJs } from '@designliquido/delegua/tradutores';

const mockUri = { fsPath: '/projeto/arquivo.delegua' } as any;
const mockContext = { extensionUri: { fsPath: '/extensao' } } as any;

let mockImportadorInstance: any;
let mockAvaliadorInstance: any;
let mockTradutorInstance: any;

describe('gerarFluxograma', () => {
    beforeEach(() => {
        (path.basename as jest.Mock).mockImplementation((p: string) => {
            const parts = p.replace(/\\/g, '/').split('/');
            return parts[parts.length - 1] || p;
        });

        mockImportadorInstance = {
            importar: jest.fn().mockResolvedValue({
                retornoLexador: { simbolos: [], erros: [] }
            })
        };
        (ImportadorExtensao as jest.Mock).mockImplementation(() => mockImportadorInstance);

        mockAvaliadorInstance = {
            analisar: jest.fn().mockResolvedValue({ declaracoes: ['decl'], erros: [] })
        };
        (AvaliadorSintatico as jest.Mock).mockImplementation(() => mockAvaliadorInstance);

        mockTradutorInstance = {
            traduzir: jest.fn().mockResolvedValue('graph TD\n  A --> B')
        };
        (TradutorMermaidJs as jest.Mock).mockImplementation(() => mockTradutorInstance);

        (vscode.window.withProgress as jest.Mock).mockImplementation(async (opts, callback) => {
            const progress = { report: jest.fn() };
            return callback(progress, { isCancellationRequested: false });
        });

        (vscode.window.showWarningMessage as jest.Mock).mockResolvedValue('Sim');
        (vscode.window as any).activeTextEditor = undefined;
    });

    describe('validação de URI', () => {
        it('exibe erro quando uri é undefined e sem editor ativo', async () => {
            await gerarFluxograma(undefined, mockContext);
            expect(vscode.window.showErrorMessage).toHaveBeenCalledWith('Nenhum arquivo Delégua selecionado.');
        });

        it('não chama withProgress quando sem URI', async () => {
            await gerarFluxograma(undefined, mockContext);
            expect(vscode.window.withProgress).not.toHaveBeenCalled();
        });

        it('usa editor ativo quando uri não fornecida', async () => {
            (vscode.window as any).activeTextEditor = { document: { uri: mockUri } };
            await gerarFluxograma(undefined, mockContext);
            expect(vscode.window.withProgress).toHaveBeenCalled();
        });
    });

    describe('validação de extensão', () => {
        it('não exibe aviso para arquivo .delegua', async () => {
            await gerarFluxograma(mockUri, mockContext);
            expect(vscode.window.showWarningMessage).not.toHaveBeenCalled();
        });

        it('não exibe aviso para arquivo .delégua', async () => {
            const uri = { fsPath: '/projeto/programa.delégua' } as any;
            await gerarFluxograma(uri, mockContext);
            expect(vscode.window.showWarningMessage).not.toHaveBeenCalled();
        });

        it('exibe aviso para arquivo com extensão inválida', async () => {
            const uri = { fsPath: '/projeto/script.js' } as any;
            await gerarFluxograma(uri, mockContext);
            expect(vscode.window.showWarningMessage).toHaveBeenCalledWith(
                expect.stringContaining('arquivo Delégua válido'),
                'Sim',
                'Não'
            );
        });

        it('retorna sem gerar quando usuário nega continuar', async () => {
            const uri = { fsPath: '/projeto/script.js' } as any;
            (vscode.window.showWarningMessage as jest.Mock).mockResolvedValue('Não');
            await gerarFluxograma(uri, mockContext);
            expect(vscode.window.withProgress).not.toHaveBeenCalled();
        });

        it('prossegue quando usuário confirma extensão inválida', async () => {
            const uri = { fsPath: '/projeto/script.js' } as any;
            (vscode.window.showWarningMessage as jest.Mock).mockResolvedValue('Sim');
            await gerarFluxograma(uri, mockContext);
            expect(vscode.window.withProgress).toHaveBeenCalled();
        });
    });

    describe('geração do fluxograma', () => {
        it('chama criarOuExibir com diagrama e nome de arquivo corretos', async () => {
            await gerarFluxograma(mockUri, mockContext);
            expect(GerenciadorVisoesFluxograma.criarOuExibir).toHaveBeenCalledWith(
                'graph TD\n  A --> B',
                'arquivo.delegua',
                mockContext.extensionUri
            );
        });

        it('passa retornoLexador do importador para o avaliador', async () => {
            const retornoLexador = { simbolos: ['s1'], erros: [] };
            mockImportadorInstance.importar.mockResolvedValue({ retornoLexador });
            await gerarFluxograma(mockUri, mockContext);
            expect(mockAvaliadorInstance.analisar).toHaveBeenCalledWith(retornoLexador, -1);
        });

        it('passa declarações do avaliador para o tradutor', async () => {
            const declaracoes = ['decl1', 'decl2'];
            mockAvaliadorInstance.analisar.mockResolvedValue({ declaracoes, erros: [] });
            await gerarFluxograma(mockUri, mockContext);
            expect(mockTradutorInstance.traduzir).toHaveBeenCalledWith(declaracoes);
        });

        it('exibe aviso quando diagrama está vazio', async () => {
            mockTradutorInstance.traduzir.mockResolvedValue('');
            await gerarFluxograma(mockUri, mockContext);
            expect(vscode.window.showWarningMessage).toHaveBeenCalledWith(
                expect.stringContaining('não contém declarações')
            );
        });

        it('não chama criarOuExibir quando diagrama está vazio', async () => {
            mockTradutorInstance.traduzir.mockResolvedValue('');
            await gerarFluxograma(mockUri, mockContext);
            expect(GerenciadorVisoesFluxograma.criarOuExibir).not.toHaveBeenCalled();
        });

        it('exibe aviso quando diagrama é apenas espaços', async () => {
            mockTradutorInstance.traduzir.mockResolvedValue('   ');
            await gerarFluxograma(mockUri, mockContext);
            expect(vscode.window.showWarningMessage).toHaveBeenCalled();
            expect(GerenciadorVisoesFluxograma.criarOuExibir).not.toHaveBeenCalled();
        });
    });

    describe('tratamento de erros', () => {
        it('exibe mensagem de erro quando exceção é lançada', async () => {
            (vscode.window.withProgress as jest.Mock).mockRejectedValue(new Error('Falha de rede'));
            await gerarFluxograma(mockUri, mockContext);
            expect(vscode.window.showErrorMessage).toHaveBeenCalledWith(
                expect.stringContaining('Falha de rede')
            );
        });

        it('exibe mensagem de erro para valor não-Error lançado', async () => {
            (vscode.window.withProgress as jest.Mock).mockRejectedValue('erro string');
            await gerarFluxograma(mockUri, mockContext);
            expect(vscode.window.showErrorMessage).toHaveBeenCalledWith(
                expect.stringContaining('erro string')
            );
        });

        it('não propaga exceção para o chamador', async () => {
            (vscode.window.withProgress as jest.Mock).mockRejectedValue(new Error('boom'));
            await expect(gerarFluxograma(mockUri, mockContext)).resolves.not.toThrow();
        });
    });
});
