// @ts-nocheck
import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import * as vscode from 'vscode';

const documentos = new Map<string, any>();

jest.mock('vscode', () => ({
    Position: class Position {
        constructor(public line: number, public character: number) {}
    },
    Range: class Range {
        constructor(public start: any, public end: any) {}
    },
    WorkspaceEdit: class WorkspaceEdit {
        public replaces: any[] = [];

        replace(uri: any, range: any, newText: string) {
            this.replaces.push({ uri, range, newText });
        }
    },
    workspace: {
        findFiles: jest.fn(),
        openTextDocument: jest.fn(),
    },
}), { virtual: true });

import { DeleguaProvedorRenomeacao } from '../../fontes/renomeacao/delegua-provedor-renomeacao';

function criarDocumento(uriPath: string, linhas: string[]): any {
    const uri = {
        fsPath: uriPath,
        toString: () => `file://${uriPath}`,
    };

    return {
        uri,
        lineCount: linhas.length,
        lineAt: (indice: number) => ({ text: linhas[indice] }),
        getText: jest.fn((range: any) => {
            if (!range) {
                return '';
            }

            const linha = linhas[range.start.line] ?? '';
            return linha.substring(range.start.character, range.end.character);
        }),
        getWordRangeAtPosition: jest.fn((posicao: any) => {
            const texto = linhas[posicao.line] ?? '';
            const correspondencia = /[_a-zA-Z][_a-zA-Z0-9]*/g;
            let item: RegExpExecArray | null;

            while ((item = correspondencia.exec(texto)) !== null) {
                const inicio = item.index;
                const fim = inicio + item[0].length;
                if (posicao.character >= inicio && posicao.character <= fim) {
                    return {
                        start: { line: posicao.line, character: inicio },
                        end: { line: posicao.line, character: fim },
                    };
                }
            }

            return undefined;
        }),
    };
}

describe('DeleguaProvedorRenomeacao', () => {
    let provedor: DeleguaProvedorRenomeacao;

    beforeEach(() => {
        documentos.clear();
        jest.clearAllMocks();
        (vscode.workspace.findFiles as jest.Mock).mockImplementation(async () =>
            Array.from(documentos.values()).map((d: any) => d.uri)
        );
        (vscode.workspace.openTextDocument as jest.Mock).mockImplementation(async (uri: any) =>
            documentos.get(uri.fsPath || uri.path || uri.toString())
        );
        provedor = new DeleguaProvedorRenomeacao();
    });

    it('prepareRename retorna intervalo e placeholder para identificador válido', () => {
        const documento = criarDocumento('/workspace/a.delegua', ['const simbolo = analisarCaractere(c)']);

        const resultado = provedor.prepareRename(
            documento,
            { line: 0, character: 16 } as any,
            {} as any
        );

        expect(resultado).toBeDefined();
        expect(resultado.placeholder).toBe('analisarCaractere');
    });

    it('provideRenameEdits cria edições em múltiplos arquivos', async () => {
        const documentoA = criarDocumento('/workspace/a.delegua', [
            'funcao analisarCaractere(c) { retorna c }',
            'const simbolo = analisarCaractere(caractereAtual)',
        ]);
        const documentoB = criarDocumento('/workspace/b.delegua', [
            'resultado = analisarCaractere("x")',
        ]);

        documentos.set('/workspace/a.delegua', documentoA);
        documentos.set('/workspace/b.delegua', documentoB);

        const edicoes = await provedor.provideRenameEdits(
            documentoA,
            { line: 1, character: 20 } as any,
            'analisarToken',
            {} as any
        );

        expect(edicoes).toBeDefined();
        expect(edicoes.replaces.length).toBe(3);
        for (const item of edicoes.replaces) {
            expect(item.newText).toBe('analisarToken');
        }
    });

    it('não renomeia quando identificador faz parte de palavra maior', async () => {
        const documento = criarDocumento('/workspace/a.delegua', [
            'analisarCaractere = 1',
            'prefixoanalisarCaractere = 2',
            'analisarCaractereSufixo = 3',
        ]);
        documentos.set('/workspace/a.delegua', documento);

        const edicoes = await provedor.provideRenameEdits(
            documento,
            { line: 0, character: 3 } as any,
            'analisarToken',
            {} as any
        );

        expect(edicoes.replaces.length).toBe(1);
    });

    it('lança erro para novo nome inválido', async () => {
        const documento = criarDocumento('/workspace/a.delegua', ['analisarCaractere()']);
        documentos.set('/workspace/a.delegua', documento);

        await expect(
            provedor.provideRenameEdits(
                documento,
                { line: 0, character: 3 } as any,
                'novo nome',
                {} as any
            )
        ).rejects.toThrow('Novo nome inválido para identificador Delégua.');
    });
});