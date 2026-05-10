// @ts-nocheck
import { beforeEach, describe, expect, it, jest } from '@jest/globals';

jest.mock('vscode', () => ({
    Uri: {
        joinPath: jest.fn((base: any, ...partes: string[]) => ({
            path: [base.path || '', ...partes].join('/'),
        })),
    },
}), { virtual: true });

import * as vscode from 'vscode';
import { ProvedorVisaoEntradaSaida } from '../../fontes/visoes/provedor-visao-entrada-saida';

describe('ProvedorVisaoEntradaSaida', () => {
    let callbackMensagem: any;
    let viewMock: any;
    let webviewMock: any;

    function criarProvedor() {
        const extensionUri = { path: '/extensao' } as any;
        return new ProvedorVisaoEntradaSaida(extensionUri);
    }

    beforeEach(() => {
        (vscode.Uri.joinPath as jest.Mock).mockImplementation((base: any, ...partes: string[]) => ({
            path: [base?.path || '', ...partes].join('/'),
        }));

        callbackMensagem = undefined;
        webviewMock = {
            options: undefined,
            html: '',
            cspSource: 'vscode-resource:',
            asWebviewUri: jest.fn((uri: any) => `uri://${uri?.path || 'indefinido'}`),
            onDidReceiveMessage: jest.fn((callback: any) => {
                callbackMensagem = callback;
            }),
            postMessage: jest.fn(),
        };

        viewMock = {
            webview: webviewMock,
            show: jest.fn(),
        };

        jest.useRealTimers();
    });

    it('deve configurar webview com scripts e html ao resolver visao', () => {
        const provedor = criarProvedor();

        provedor.resolveWebviewView(viewMock, {} as any, {} as any);

        expect(webviewMock.options).toEqual({
            enableScripts: true,
            localResourceRoots: [{ path: '/extensao' }],
        });
        expect(webviewMock.html).toContain('<!DOCTYPE html>');
        expect(webviewMock.html).toContain('Content-Security-Policy');
        expect(webviewMock.html).toContain('node_modules/@xterm/xterm/lib/xterm.js');
        expect(webviewMock.onDidReceiveMessage).toHaveBeenCalled();
        expect(vscode.Uri.joinPath).toHaveBeenCalled();
    });

    it('deve acumular caracteres, apagar e enviar entrada ao commandSent', () => {
        const provedor = criarProvedor() as any;
        const notificar = jest.spyOn(provedor.promessaLeitura, 'notify');

        provedor.resolveWebviewView(viewMock, {} as any, {} as any);

        callbackMensagem({ type: 'keyTyped', value: 'a' });
        callbackMensagem({ type: 'keyTyped', value: 'b' });
        callbackMensagem({ type: 'deleteChar' });
        callbackMensagem({ type: 'keyTyped', value: 'c' });

        expect(provedor.entrada).toBe('ac');

        callbackMensagem({ type: 'commandSent' });

        expect(provedor.copiaEntrada).toBe('ac');
        expect(provedor.entrada).toBe('');
        expect(notificar).toHaveBeenCalled();
    });

    it('deve ignorar deleteChar quando entrada estiver vazia', () => {
        const provedor = criarProvedor() as any;
        provedor.resolveWebviewView(viewMock, {} as any, {} as any);

        callbackMensagem({ type: 'deleteChar' });

        expect(provedor.entrada).toBe('');
    });

    it('deve resolver aguardarEntrada no proximo tick ao receber commandSent', async () => {
        jest.useFakeTimers();
        const provedor = criarProvedor() as any;

        provedor.resolveWebviewView(viewMock, {} as any, {} as any);

        const promessaEntrada = provedor.aguardarEntrada();
        callbackMensagem({ type: 'keyTyped', value: 'o' });
        callbackMensagem({ type: 'keyTyped', value: 'k' });
        callbackMensagem({ type: 'commandSent' });

        const resolvidoAntes = jest.fn();
        promessaEntrada.then(resolvidoAntes);

        expect(resolvidoAntes).not.toHaveBeenCalled();

        jest.runAllTimers();

        await expect(promessaEntrada).resolves.toBe('ok');
        expect(resolvidoAntes).toHaveBeenCalled();
        expect(provedor.resolverLeitura).toBeNull();
    });

    it('deve ativar visao e enviar mensagens de saida quando view estiver resolvida', () => {
        const provedor = criarProvedor();
        provedor.resolveWebviewView(viewMock, {} as any, {} as any);

        provedor.ativarVisao();
        provedor.escreverEmSaida('linha completa');
        provedor.escreverEmSaidaMesmaLinha('mesma linha');
        provedor.limparTerminal();

        expect(viewMock.show).toHaveBeenCalledWith(true);
        expect(webviewMock.postMessage).toHaveBeenCalledWith({ type: 'escreverEmSaida', content: 'linha completa' });
        expect(webviewMock.postMessage).toHaveBeenCalledWith({ type: 'escreverEmSaidaMesmaLinha', content: 'mesma linha' });
        expect(webviewMock.postMessage).toHaveBeenCalledWith({ type: 'limparTerminal' });
    });

    it('deve nao falhar ao escrever sem visao resolvida', () => {
        const provedor = criarProvedor();

        expect(() => provedor.ativarVisao()).not.toThrow();
        expect(() => provedor.escreverEmSaida('x')).not.toThrow();
        expect(() => provedor.escreverEmSaidaMesmaLinha('y')).not.toThrow();
        expect(() => provedor.limparTerminal()).not.toThrow();
    });
});
