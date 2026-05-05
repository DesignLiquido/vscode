// @ts-nocheck
import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
import * as vscode from 'vscode';

let mockPanel: any;
let capturedOnDidDispose: Function | undefined;

jest.mock('vscode', () => ({
    window: {
        createWebviewPanel: jest.fn()
    },
    ViewColumn: {
        Beside: 2
    }
}), { virtual: true });

import { GerenciadorVisoesFluxograma } from '../../../fontes/visoes/fluxogramas/gerenciador-visoes-fluxograma';

const mockLocalizador = { fsPath: '/extensao' } as any;
const mockWebview = { cspSource: 'vscode-resource:' } as any;

describe('GerenciadorVisoesFluxograma', () => {
    beforeEach(() => {
        capturedOnDidDispose = undefined;
        mockPanel = {
            webview: { html: '', cspSource: 'vscode-resource:' },
            title: '',
            reveal: jest.fn(),
            dispose: jest.fn(),
            onDidDispose: jest.fn((cb: Function) => {
                capturedOnDidDispose = cb;
            })
        };
        (vscode.window.createWebviewPanel as jest.Mock).mockReturnValue(mockPanel);
    });

    afterEach(() => {
        GerenciadorVisoesFluxograma.descartar();
    });

    describe('criarOuExibir', () => {
        it('cria novo painel quando nenhum existe', () => {
            GerenciadorVisoesFluxograma.criarOuExibir('graph TD', 'teste.delegua', mockLocalizador);
            expect(vscode.window.createWebviewPanel).toHaveBeenCalledTimes(1);
        });

        it('cria painel com tipo e título corretos', () => {
            GerenciadorVisoesFluxograma.criarOuExibir('graph TD', 'arquivo.delegua', mockLocalizador);
            expect(vscode.window.createWebviewPanel).toHaveBeenCalledWith(
                'deleguaFluxograma',
                'Fluxograma: arquivo.delegua',
                2,
                expect.objectContaining({ enableScripts: true, retainContextWhenHidden: true })
            );
        });

        it('define html na webview com código mermaid', () => {
            GerenciadorVisoesFluxograma.criarOuExibir('graph TD\n  A --> B', 'teste.delegua', mockLocalizador);
            expect(mockPanel.webview.html).toContain('graph TD\n  A --> B');
        });

        it('retorna o painel criado', () => {
            const resultado = GerenciadorVisoesFluxograma.criarOuExibir('graph TD', 'teste.delegua', mockLocalizador);
            expect(resultado).toBe(mockPanel);
        });

        it('registra handler onDidDispose', () => {
            GerenciadorVisoesFluxograma.criarOuExibir('graph TD', 'teste.delegua', mockLocalizador);
            expect(mockPanel.onDidDispose).toHaveBeenCalled();
        });

        it('revela painel existente sem criar novo', () => {
            GerenciadorVisoesFluxograma.criarOuExibir('graph TD', 'primeiro.delegua', mockLocalizador);
            GerenciadorVisoesFluxograma.criarOuExibir('graph LR', 'segundo.delegua', mockLocalizador);

            expect(vscode.window.createWebviewPanel).toHaveBeenCalledTimes(1);
            expect(mockPanel.reveal).toHaveBeenCalledTimes(1);
        });

        it('atualiza título ao reutilizar painel', () => {
            GerenciadorVisoesFluxograma.criarOuExibir('graph TD', 'primeiro.delegua', mockLocalizador);
            GerenciadorVisoesFluxograma.criarOuExibir('graph LR', 'segundo.delegua', mockLocalizador);

            expect(mockPanel.title).toBe('Fluxograma: segundo.delegua');
        });

        it('atualiza html ao reutilizar painel', () => {
            GerenciadorVisoesFluxograma.criarOuExibir('graph TD', 'primeiro.delegua', mockLocalizador);
            GerenciadorVisoesFluxograma.criarOuExibir('graph LR\n  X --> Y', 'segundo.delegua', mockLocalizador);

            expect(mockPanel.webview.html).toContain('graph LR\n  X --> Y');
        });

        it('cria novo painel após onDidDispose ser disparado', () => {
            GerenciadorVisoesFluxograma.criarOuExibir('graph TD', 'teste.delegua', mockLocalizador);
            capturedOnDidDispose?.();

            GerenciadorVisoesFluxograma.criarOuExibir('graph TD', 'novo.delegua', mockLocalizador);
            expect(vscode.window.createWebviewPanel).toHaveBeenCalledTimes(2);
        });
    });

    describe('atualizarConteudo', () => {
        it('não lança erro quando nenhum painel existe', () => {
            expect(() => {
                GerenciadorVisoesFluxograma.atualizarConteudo('graph TD', 'teste.delegua', mockLocalizador);
            }).not.toThrow();
        });

        it('atualiza título quando painel existe', () => {
            GerenciadorVisoesFluxograma.criarOuExibir('graph TD', 'original.delegua', mockLocalizador);
            GerenciadorVisoesFluxograma.atualizarConteudo('graph LR', 'atualizado.delegua', mockLocalizador);

            expect(mockPanel.title).toBe('Fluxograma: atualizado.delegua');
        });

        it('atualiza html quando painel existe', () => {
            GerenciadorVisoesFluxograma.criarOuExibir('graph TD', 'original.delegua', mockLocalizador);
            GerenciadorVisoesFluxograma.atualizarConteudo('graph LR\n  Z --> W', 'atualizado.delegua', mockLocalizador);

            expect(mockPanel.webview.html).toContain('graph LR\n  Z --> W');
        });
    });

    describe('obterConteudoVisao', () => {
        it('retorna HTML contendo código mermaid', () => {
            const html = GerenciadorVisoesFluxograma.obterConteudoVisao(
                'graph TD\n  A --> B', 'arquivo.delegua', mockWebview, mockLocalizador
            );
            expect(html).toContain('graph TD\n  A --> B');
        });

        it('retorna documento HTML válido', () => {
            const html = GerenciadorVisoesFluxograma.obterConteudoVisao(
                'graph TD', 'arquivo.delegua', mockWebview, mockLocalizador
            );
            expect(html).toContain('<!DOCTYPE html>');
            expect(html).toContain('<html');
        });

        it('inclui CSP com nonce de 32 caracteres', () => {
            const html = GerenciadorVisoesFluxograma.obterConteudoVisao(
                'graph TD', 'arquivo.delegua', mockWebview, mockLocalizador
            );
            expect(html).toMatch(/nonce-[A-Za-z0-9]{32}/);
        });

        it('inclui mermaid do CDN', () => {
            const html = GerenciadorVisoesFluxograma.obterConteudoVisao(
                'graph TD', 'arquivo.delegua', mockWebview, mockLocalizador
            );
            expect(html).toContain('cdn.jsdelivr.net');
            expect(html).toContain('mermaid');
        });

        it('escapa aspas duplas no nome do arquivo', () => {
            const html = GerenciadorVisoesFluxograma.obterConteudoVisao(
                'graph TD', '"malicioso".delegua', mockWebview, mockLocalizador
            );
            expect(html).toContain('&quot;');
            expect(html).not.toContain('"malicioso"');
        });

        it('escapa < no nome do arquivo', () => {
            const html = GerenciadorVisoesFluxograma.obterConteudoVisao(
                'graph TD', '<script>.delegua', mockWebview, mockLocalizador
            );
            expect(html).toContain('&lt;');
        });

        it('escapa > no nome do arquivo', () => {
            const html = GerenciadorVisoesFluxograma.obterConteudoVisao(
                'graph TD', '<script>.delegua', mockWebview, mockLocalizador
            );
            expect(html).toContain('&gt;');
        });

        it('serializa código mermaid como JSON para o script', () => {
            const html = GerenciadorVisoesFluxograma.obterConteudoVisao(
                'graph TD', 'arquivo.delegua', mockWebview, mockLocalizador
            );
            expect(html).toContain(JSON.stringify('graph TD'));
        });

        it('gera nonce diferente a cada chamada', () => {
            const html1 = GerenciadorVisoesFluxograma.obterConteudoVisao(
                'graph TD', 'a.delegua', mockWebview, mockLocalizador
            );
            const html2 = GerenciadorVisoesFluxograma.obterConteudoVisao(
                'graph TD', 'b.delegua', mockWebview, mockLocalizador
            );
            const nonce1 = html1.match(/nonce-([A-Za-z0-9]{32})/)?.[1];
            const nonce2 = html2.match(/nonce-([A-Za-z0-9]{32})/)?.[1];
            expect(nonce1).not.toBe(nonce2);
        });
    });

    describe('descartar', () => {
        it('não lança erro quando nenhum painel existe', () => {
            expect(() => GerenciadorVisoesFluxograma.descartar()).not.toThrow();
        });

        it('chama dispose no painel quando existe', () => {
            GerenciadorVisoesFluxograma.criarOuExibir('graph TD', 'teste.delegua', mockLocalizador);
            GerenciadorVisoesFluxograma.descartar();
            expect(mockPanel.dispose).toHaveBeenCalledTimes(1);
        });

        it('cria novo painel após descartar', () => {
            GerenciadorVisoesFluxograma.criarOuExibir('graph TD', 'primeiro.delegua', mockLocalizador);
            GerenciadorVisoesFluxograma.descartar();
            GerenciadorVisoesFluxograma.criarOuExibir('graph TD', 'segundo.delegua', mockLocalizador);

            expect(vscode.window.createWebviewPanel).toHaveBeenCalledTimes(2);
        });
    });
});
