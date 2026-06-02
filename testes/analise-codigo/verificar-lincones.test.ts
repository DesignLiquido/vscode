// @ts-nocheck
import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import * as vscode from 'vscode';

jest.mock('vscode', () => {
    function joinCaminho(base: { path: string }, ...segmentos: string[]): { path: string } {
        const partes = base.path.split('/').filter((p: string) => p !== '');
        for (const seg of segmentos) {
            if (seg === '..') {
                partes.pop();
            } else {
                partes.push(seg);
            }
        }
        return { path: '/' + partes.join('/') };
    }

    class Diagnostic {
        range: any; message: string; severity: number;
        constructor(range: any, message: string, severity: number) {
            this.range = range; this.message = message; this.severity = severity;
        }
    }
    class Range {
        start: any; end: any;
        constructor(sl: number, sc: number, el: number, ec: number) {
            this.start = { line: sl, character: sc };
            this.end = { line: el, character: ec };
        }
    }
    return {
        Diagnostic,
        Range,
        DiagnosticSeverity: { Error: 0, Warning: 1, Information: 2, Hint: 3 },
        Uri: {
            file: (fsPath: string) => ({
                path: '/' + fsPath.replace(/\\/g, '/').replace(/^\//, ''),
            }),
            joinPath: joinCaminho,
        },
        workspace: {
            fs: {
                stat: jest.fn(),
                readFile: jest.fn(),
            },
        },
    };
}, { virtual: true });

import { verificarConfiguracaoLincones } from '../../fontes/analise-codigo/verificar-lincones';

const MENSAGEM_AVISO = "Suporte a LinConEs não parece estar configurado apropriadamente. Verifique se seu arquivo `configuracao.delprops` na raiz do seu projeto possui entradas `liquido.dados.lincones.tecnologia` e `liquido.dados.lincones.caminho` com valores válidos.";

function criarDocumento(fileName: string, conteudo: string): any {
    return {
        fileName,
        uri: { path: fileName.replace(/\\/g, '/') },
        getText: () => conteudo,
    };
}

function codificarDelprops(conteudo: string): Uint8Array {
    return new TextEncoder().encode(conteudo);
}

function configurarDelpropsEncontrado(caminhoDelprops: string, conteudo: string): void {
    (vscode.workspace.fs.stat as any).mockImplementation((uri: any) => {
        if (uri.path === caminhoDelprops) return Promise.resolve({});
        return Promise.reject(new Error('não encontrado'));
    });
    (vscode.workspace.fs.readFile as any).mockResolvedValue(codificarDelprops(conteudo));
}

function configurarDelpropsNaoEncontrado(): void {
    (vscode.workspace.fs.stat as any).mockRejectedValue(new Error('não encontrado'));
}

describe('verificarConfiguracaoLincones', () => {
    describe('arquivo fora do diretório rotas/', () => {
        it('sem lincones no código → sem avisos', async () => {
            const doc = criarDocumento(
                '/projeto/controladores/inicial.delegua',
                'var x = 1'
            );
            const diags = await verificarConfiguracaoLincones(doc);
            expect(diags).toHaveLength(0);
        });

        it('com lincones no código → sem avisos (não é rota Liquido)', async () => {
            const doc = criarDocumento(
                '/projeto/controladores/inicial.delegua',
                'lincones.executar("SELECIONAR * DE clientes")'
            );
            const diags = await verificarConfiguracaoLincones(doc);
            expect(diags).toHaveLength(0);
        });
    });

    describe('arquivo em rotas/ sem menção a lincones', () => {
        it('sem lincones no código → sem avisos', async () => {
            const doc = criarDocumento(
                '/projeto/rotas/clientes/inicial.delegua',
                'liquido.rotaGet(funcao (requisicao, resposta) {\n    resposta.lmht({}).status(200)\n})'
            );
            const diags = await verificarConfiguracaoLincones(doc);
            expect(diags).toHaveLength(0);
        });
    });

    describe('arquivo em rotas/ com lincones, sem configuracao.delprops', () => {
        it('stat sempre rejeita → sem avisos (projeto sem delprops)', async () => {
            configurarDelpropsNaoEncontrado();
            const doc = criarDocumento(
                '/projeto/rotas/clientes/inicial.delegua',
                'lincones.executar("SELECIONAR * DE clientes")'
            );
            const diags = await verificarConfiguracaoLincones(doc);
            expect(diags).toHaveLength(0);
        });
    });

    describe('arquivo em rotas/ com lincones, configuracao.delprops presente', () => {
        it('ambas as entradas configuradas → sem avisos', async () => {
            configurarDelpropsEncontrado('/projeto/configuracao.delprops', [
                "liquido.dados.lincones.tecnologia = 'sqlite'",
                "liquido.dados.lincones.caminho = ':memory:'",
            ].join('\n'));

            const doc = criarDocumento(
                '/projeto/rotas/clientes/inicial.delegua',
                'lincones.executar("SELECIONAR * DE clientes")'
            );
            const diags = await verificarConfiguracaoLincones(doc);
            expect(diags).toHaveLength(0);
        });

        it('tecnologia ausente → aviso na linha com lincones', async () => {
            configurarDelpropsEncontrado('/projeto/configuracao.delprops',
                "liquido.dados.lincones.caminho = ':memory:'"
            );

            const doc = criarDocumento(
                '/projeto/rotas/clientes/inicial.delegua',
                'lincones.executar("SELECIONAR * DE clientes")'
            );
            const diags = await verificarConfiguracaoLincones(doc);
            expect(diags).toHaveLength(1);
            expect(diags[0].severity).toBe(1); // Warning
            expect(diags[0].message).toBe(MENSAGEM_AVISO);
        });

        it('caminho ausente → aviso na linha com lincones', async () => {
            configurarDelpropsEncontrado('/projeto/configuracao.delprops',
                "liquido.dados.lincones.tecnologia = 'sqlite'"
            );

            const doc = criarDocumento(
                '/projeto/rotas/clientes/inicial.delegua',
                'lincones.executar("SELECIONAR * DE clientes")'
            );
            const diags = await verificarConfiguracaoLincones(doc);
            expect(diags).toHaveLength(1);
            expect(diags[0].severity).toBe(1); // Warning
        });

        it('ambas as entradas comentadas → aviso na linha com lincones', async () => {
            configurarDelpropsEncontrado('/projeto/configuracao.delprops', [
                "// liquido.dados.lincones.tecnologia = 'sqlite'",
                "// liquido.dados.lincones.caminho = ':memory:'",
            ].join('\n'));

            const doc = criarDocumento(
                '/projeto/rotas/clientes/inicial.delegua',
                'lincones.executar("SELECIONAR * DE clientes")'
            );
            const diags = await verificarConfiguracaoLincones(doc);
            expect(diags).toHaveLength(1);
            expect(diags[0].severity).toBe(1); // Warning
        });

        it('tecnologia comentada, caminho presente → aviso', async () => {
            configurarDelpropsEncontrado('/projeto/configuracao.delprops', [
                "// liquido.dados.lincones.tecnologia = 'sqlite'",
                "liquido.dados.lincones.caminho = ':memory:'",
            ].join('\n'));

            const doc = criarDocumento(
                '/projeto/rotas/clientes/inicial.delegua',
                'lincones.executar("SELECIONAR * DE clientes")'
            );
            const diags = await verificarConfiguracaoLincones(doc);
            expect(diags).toHaveLength(1);
        });

        it('caminho comentado, tecnologia presente → aviso', async () => {
            configurarDelpropsEncontrado('/projeto/configuracao.delprops', [
                "liquido.dados.lincones.tecnologia = 'sqlite'",
                "// liquido.dados.lincones.caminho = ':memory:'",
            ].join('\n'));

            const doc = criarDocumento(
                '/projeto/rotas/clientes/inicial.delegua',
                'lincones.executar("SELECIONAR * DE clientes")'
            );
            const diags = await verificarConfiguracaoLincones(doc);
            expect(diags).toHaveLength(1);
        });

        it('lincones em múltiplas linhas, sem configuração → um aviso por linha', async () => {
            configurarDelpropsEncontrado('/projeto/configuracao.delprops', '');

            const conteudo = [
                'lincones.executar("CRIAR TABELA clientes (ID INTEIRO)")',
                'lincones.executar("INSERIR EM clientes (NOME) VALORES (\'Pernalonga\')")',
                'var resultado = lincones.executar("SELECIONAR * DE clientes")',
            ].join('\n');

            const doc = criarDocumento('/projeto/rotas/clientes/inicial.delegua', conteudo);
            const diags = await verificarConfiguracaoLincones(doc);
            expect(diags).toHaveLength(3);
            diags.forEach(d => {
                expect(d.severity).toBe(1); // Warning
                expect(d.message).toBe(MENSAGEM_AVISO);
            });
        });

        it('aviso aponta para a linha correta no documento', async () => {
            configurarDelpropsEncontrado('/projeto/configuracao.delprops', '');

            const conteudo = [
                'liquido.rotaGet(funcao (requisicao, resposta) {',
                '    lincones.executar("SELECIONAR * DE clientes")',
                '    resposta.lmht({}).status(200)',
                '})',
            ].join('\n');

            const doc = criarDocumento('/projeto/rotas/clientes/inicial.delegua', conteudo);
            const diags = await verificarConfiguracaoLincones(doc);
            expect(diags).toHaveLength(1);
            expect(diags[0].range.start.line).toBe(1);
            expect(diags[0].range.end.line).toBe(1);
        });

        it('linhas sem lincones não geram aviso mesmo com delprops ausente', async () => {
            configurarDelpropsEncontrado('/projeto/configuracao.delprops', '');

            const conteudo = [
                'liquido.rotaGet(funcao (requisicao, resposta) {',
                '    var x = 1',
                '    resposta.lmht({ x: x }).status(200)',
                '})',
            ].join('\n');

            const doc = criarDocumento('/projeto/rotas/clientes/inicial.delegua', conteudo);
            const diags = await verificarConfiguracaoLincones(doc);
            expect(diags).toHaveLength(0);
        });

        it('delprops com outras fontes de dados não interfere na checagem de lincones', async () => {
            configurarDelpropsEncontrado('/projeto/configuracao.delprops', [
                "liquido.dados.outra.tecnologia = 'mysql'",
                "liquido.dados.outra.caminho = 'localhost'",
            ].join('\n'));

            const doc = criarDocumento(
                '/projeto/rotas/clientes/inicial.delegua',
                'lincones.executar("SELECIONAR * DE clientes")'
            );
            const diags = await verificarConfiguracaoLincones(doc);
            expect(diags).toHaveLength(1);
        });
    });

    describe('detecção do diretório rotas/', () => {
        beforeEach(() => {
            configurarDelpropsNaoEncontrado();
        });

        it('caminho com /rotas/ no meio → tratado como rota Liquido', async () => {
            (vscode.workspace.fs.stat as any).mockImplementation((uri: any) => {
                if (uri.path === '/workspace/rotas/configuracao.delprops') return Promise.resolve({});
                return Promise.reject(new Error('não encontrado'));
            });
            (vscode.workspace.fs.readFile as any).mockResolvedValue(
                codificarDelprops('')
            );

            const doc = criarDocumento(
                '/workspace/rotas/inicial.delegua',
                'lincones.executar("SELECIONAR * DE clientes")'
            );
            const diags = await verificarConfiguracaoLincones(doc);
            expect(diags).toHaveLength(1);
        });

        it('caminho com \\rotas\\ (Windows) → tratado como rota Liquido', async () => {
            const doc = criarDocumento(
                'D:\\projeto\\rotas\\clientes\\inicial.delegua',
                'lincones.executar("SELECIONAR * DE clientes")'
            );
            const diags = await verificarConfiguracaoLincones(doc);
            // stat rejeita → sem delprops → sem aviso (mas chegou até a busca)
            expect(diags).toHaveLength(0);
            expect(vscode.workspace.fs.stat).toHaveBeenCalled();
        });
    });
});
