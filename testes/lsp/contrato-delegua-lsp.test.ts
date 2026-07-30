// @ts-nocheck
import { beforeEach, describe, expect, it, jest } from '@jest/globals';

import * as lsp from '@designliquido/delegua-lsp';
import * as cacheAnalise from '@designliquido/delegua-lsp/analise/cache-analise';
import * as cacheDefinicoes from '@designliquido/delegua-lsp/analise/cache-definicoes';

import { ambienteVscode } from '../../fontes/ambiente/ambiente-vscode';
import { DeleguaProvedorCompletude } from '../../fontes/completude/delegua-provedor-completude';
import { DeleguaProvedorRenomeacao } from '../../fontes/renomeacao/delegua-provedor-renomeacao';

jest.unmock('@designliquido/delegua-lsp');
jest.unmock('@designliquido/delegua-lsp/analise/cache-analise');
jest.unmock('@designliquido/delegua-lsp/analise/cache-definicoes');

const arquivos = new Map<string, string>();

jest.mock('vscode', () => ({
    CompletionItem: class CompletionItem {
        constructor(public label: string, public kind?: number) {}
        documentation: unknown;
        detail: string | undefined;
        insertText: unknown;
        sortText: string | undefined;
    },
    MarkdownString: class MarkdownString {
        constructor(public value: string) {}
    },
    Uri: {
        parse: (caminho: string) => ({ caminho }),
        file: (caminho: string) => ({ caminho }),
    },
    Range: class Range {
        start: { line: number; character: number };
        end: { line: number; character: number };

        constructor(startLine: number, startCharacter: number, endLine: number, endCharacter: number) {
            this.start = { line: startLine, character: startCharacter };
            this.end = { line: endLine, character: endCharacter };
        }
    },
    TextEdit: class TextEdit {
        constructor(public range: unknown, public newText: string) {}
    },
    WorkspaceEdit: class WorkspaceEdit {
        edicoes = new Map<string, unknown[]>();

        set(uri: { caminho: string }, edicoes: unknown[]) {
            this.edicoes.set(uri.caminho, edicoes);
        }
    },
    workspace: {
        workspaceFolders: [{ uri: { fsPath: '/workspace' } }],
        fs: {
            readFile: async (uri: { caminho: string }) => {
                const conteudo = arquivos.get(uri.caminho);
                if (conteudo === undefined) {
                    throw new Error(`Arquivo não encontrado: ${uri.caminho}`);
                }
                return new TextEncoder().encode(conteudo);
            },
            readDirectory: async () => [],
        },
    },
}), { virtual: true });

function criarDocumento(texto: string) {
    return {
        uri: { toString: () => 'file:///workspace/teste.delegua' },
        fileName: '/workspace/teste.delegua',
        getText: () => texto,
        version: 1,
        languageId: 'delegua',
        offsetAt: (posicao: { line: number; character: number }) => texto
            .split('\n')
            .slice(0, posicao.line)
            .reduce((total, linha) => total + linha.length + 1, 0) + posicao.character,
    };
}

describe('contrato com @designliquido/delegua-lsp', () => {
    beforeEach(() => {
        arquivos.clear();
        jest.clearAllMocks();
    });

    describe('verificação do contrato de exports (API pública do LSP)', () => {
        it('expõe as capacidades principais usadas pela extensão', () => {
            expect(lsp.proverItensCompletude).toEqual(expect.any(Function));
            expect(lsp.proverDefinicao).toEqual(expect.any(Function));
            expect(lsp.proverReferencias).toEqual(expect.any(Function));
            expect(lsp.prepareRename).toEqual(expect.any(Function));
            expect(lsp.provideRenameEdits).toEqual(expect.any(Function));
        });

        it('expõe as funções do módulo de cache de análise', () => {
            expect(cacheAnalise.expirarResultado).toEqual(expect.any(Function));
            expect(cacheAnalise.expirarResultados).toEqual(expect.any(Function));
            expect(cacheAnalise.expirarResultadosPorDependenciaArquivo).toEqual(expect.any(Function));
            expect(cacheAnalise.expirarTudo).toEqual(expect.any(Function));
            expect(cacheAnalise.obterResultado).toEqual(expect.any(Function));
            expect(cacheAnalise.definirResultado).toEqual(expect.any(Function));
            expect(cacheAnalise.obterDiagnosticos).toEqual(expect.any(Function));
            expect(cacheAnalise.obterResultadoValido).toEqual(expect.any(Function));
        });

        it('expõe as funções do módulo de cache de definições', () => {
            expect(cacheDefinicoes.expirarTodasDefinicoes).toEqual(expect.any(Function));
            expect(cacheDefinicoes.definirDefinicoes).toEqual(expect.any(Function));
            expect(cacheDefinicoes.obterDefinicoesPorContexto).toEqual(expect.any(Function));
        });
    });

    describe('integração comportamental', () => {
        it('fornece itens reais de completude por meio do provedor da extensão', () => {
            const provedor = new DeleguaProvedorCompletude();
            const itens = provedor.provideCompletionItems(criarDocumento('esc'), { line: 0, character: 3 }, {} as any);

            expect(itens).toEqual(expect.arrayContaining([
                expect.objectContaining({ label: 'escreva' }),
            ]));
        });

        it('gera edições de renomeação reais e as converte para WorkspaceEdit', async () => {
            const provedor = new DeleguaProvedorRenomeacao();
            const documento = criarDocumento('var contador = 1\nescreva(contador)');

            const resultado = await provedor.provideRenameEdits(
                documento,
                { line: 1, character: 10 },
                'total',
                {} as any
            );

            expect(resultado?.edicoes.get('file:///workspace/teste.delegua')).toHaveLength(2);
            expect(resultado?.edicoes.get('file:///workspace/teste.delegua')).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({ newText: 'total' }),
                ])
            );
        });

        it('disponibiliza ao LSP o sistema de arquivos da API do VS Code', async () => {
            arquivos.set('/workspace/biblioteca.delegua', 'var resposta = 42');

            await expect(ambienteVscode.sistemaArquivos.lerArquivoTexto('/workspace/biblioteca.delegua'))
                .resolves.toBe('var resposta = 42');
            await expect(ambienteVscode.sistemaArquivos.lerArquivoTexto('/workspace/inexistente.delegua'))
                .resolves.toBeUndefined();
        });
    });
});
