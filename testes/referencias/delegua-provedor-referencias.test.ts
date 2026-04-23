// @ts-nocheck
import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import * as vscode from 'vscode';

const documentos = new Map<string, any>();

jest.mock('vscode', () => ({
    Position: class Position {
        constructor(public line: number, public character: number) {}
    },
    Location: class Location {
        public range: any;

        constructor(public uri: any, posicaoOuRange: any) {
            if (typeof posicaoOuRange?.line === 'number') {
                this.range = { start: posicaoOuRange, end: posicaoOuRange };
                return;
            }

            this.range = posicaoOuRange;
        }
    },
    Uri: {
        file: jest.fn((fsPath: string) => ({
            fsPath,
            toString: () => `file://${fsPath}`,
        })),
    },
    workspace: {
        findFiles: jest.fn(),
        openTextDocument: jest.fn(),
    },
}), { virtual: true });

jest.mock('@designliquido/delegua/declaracoes/classe', () => ({
    Classe: class ClasseMock {},
}), { virtual: true });

jest.mock('@designliquido/delegua/declaracoes', () => ({
    Declaracao: class DeclaracaoMock {},
}), { virtual: true });

jest.mock('../../fontes/analise-codigo/cache-analise', () => ({
    obterResultado: jest.fn().mockReturnValue(undefined),
}), { virtual: true });

import { obterResultado } from '../../fontes/analise-codigo/cache-analise';
import { DeleguaProvedorReferencias } from '../../fontes/referencias/delegua-provedor-referencias';

function criarDocumento(uriPath: string, linhas: string[]): any {
    const uri = {
        fsPath: uriPath,
        toString: () => `file://${uriPath}`,
    };

    return {
        uri,
        lineCount: linhas.length,
        lineAt: (indice: number) => ({ text: linhas[indice] }),
        getText: jest.fn(() => 'variavel'),
        getWordRangeAtPosition: jest.fn(() => ({
            start: { line: 0, character: 0 },
            end: { line: 0, character: 8 },
        })),
    };
}

describe('DeleguaProvedorReferencias', () => {
    let provedor: DeleguaProvedorReferencias;

    beforeEach(() => {
        documentos.clear();
        jest.clearAllMocks();
        (vscode.Uri.file as jest.Mock).mockImplementation((fsPath: string) => ({
            fsPath,
            toString: () => `file://${fsPath}`,
        }));
        (vscode.workspace.findFiles as jest.Mock).mockImplementation(async () =>
            Array.from(documentos.values()).map((d: any) => d.uri)
        );
        (vscode.workspace.openTextDocument as jest.Mock).mockImplementation(async (uri: any) =>
            documentos.get(uri.fsPath || uri.path || uri.toString())
        );
        provedor = new DeleguaProvedorReferencias();
    });

    it('retorna vazio quando não há palavra no cursor', async () => {
        const documento = criarDocumento('/workspace/a.delegua', ['escreva("oi")']);
        documento.getWordRangeAtPosition = jest.fn(() => undefined);

        const resultado = await provedor.provideReferences(
            documento,
            { line: 0, character: 0 } as any,
            { includeDeclaration: true } as any,
            {} as any
        );

        expect(resultado).toEqual([]);
    });

    it('encontra ocorrências em múltiplos arquivos', async () => {
        const documentoA = criarDocumento('/workspace/a.delegua', [
            'variavel = 1',
            'escreva(variavel)',
            'variavel2 = 2',
        ]);
        const documentoB = criarDocumento('/workspace/b.delegua', [
            'funcao teste() {',
            '  retorna variavel',
            '}',
        ]);

        documentos.set('/workspace/a.delegua', documentoA);
        documentos.set('/workspace/b.delegua', documentoB);

        const resultado = await provedor.provideReferences(
            documentoA,
            { line: 0, character: 0 } as any,
            { includeDeclaration: true } as any,
            {} as any
        );

        expect(resultado.length).toBe(3);
    });

    it('remove declaração quando includeDeclaration é falso', async () => {
        const documento = criarDocumento('/workspace/a.delegua', [
            'variavel = 1',
            'escreva(variavel)',
        ]);
        documentos.set('/workspace/a.delegua', documento);

        (obterResultado as jest.Mock).mockReturnValue({
            avaliadorSintatico: {
                declaracoes: [
                    {
                        simbolo: {
                            lexema: 'variavel',
                            linha: 1,
                            colunaInicio: 0,
                        },
                    },
                ],
            },
            declaracoesPreCarregadas: [],
        });

        const resultado = await provedor.provideReferences(
            documento,
            { line: 0, character: 0 } as any,
            { includeDeclaration: false } as any,
            {} as any
        );

        expect(resultado.length).toBe(1);
        expect(resultado[0].range.start.line).toBe(1);
    });
});
