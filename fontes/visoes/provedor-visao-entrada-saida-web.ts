import * as vscode from 'vscode';

import { ProvedorVisaoEntradaSaida } from './provedor-visao-entrada-saida';

export class ProvedorVisaoEntradaSaidaWeb extends ProvedorVisaoEntradaSaida {
    protected _obterUrlsXterm(webview: vscode.Webview) {
        const cdnBase = 'https://cdn.jsdelivr.net/npm';
        return {
            scriptUri: `${cdnBase}/@xterm/xterm@5.5.0/lib/xterm.js`,
            addonFitUrl: `${cdnBase}/@xterm/addon-fit@0.10.0/lib/addon-fit.js`,
            estilosTerminal: `${cdnBase}/@xterm/xterm@5.5.0/css/xterm.css`,
            cspScriptSrc: `${webview.cspSource} https://cdn.jsdelivr.net`,
            cspStyleSrc: `${webview.cspSource} https://cdn.jsdelivr.net 'unsafe-inline'`,
            cspFontSrc: `${webview.cspSource} https://cdn.jsdelivr.net`,
        };
    }
}
