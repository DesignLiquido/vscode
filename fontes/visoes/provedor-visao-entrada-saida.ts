import * as vscode from 'vscode';
import { Subject } from 'await-notify';

/**
 * O provedor de visão de entrada e saída. Esta visão é aberta na mesma seção do 
 * terminal e do console de depuração.
 */
export class ProvedorVisaoEntradaSaida implements vscode.WebviewViewProvider {

    public static readonly viewType = 'extension.designliquido.entradaESaida';

    // Legacy Subject for backward compatibility (keep if used elsewhere)
    promessaLeitura: { 
        wait: () => Promise<any>,
        notify: () => void,
        notifyAll: () => void
    };

    private entrada: string;
    copiaEntrada: string;

    private _view?: vscode.WebviewView;

    // NEW: Promise-based input handler for web environment
    private resolverLeitura: ((value: string) => void) | null = null;

    constructor(
		private readonly _extensionUri: vscode.Uri,
	) { 
        this.promessaLeitura = new Subject();
        this.entrada = "";
        this.copiaEntrada = "";
    }

    resolveWebviewView(
        webviewView: vscode.WebviewView, 
        context: vscode.WebviewViewResolveContext<unknown>, 
        token: vscode.CancellationToken
    ): void | Thenable<void> {
        this._view = webviewView;

		webviewView.webview.options = {
			enableScripts: true,
			localResourceRoots: [
				this._extensionUri
			]
		};

		webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);

        webviewView.webview.onDidReceiveMessage(data => {
			switch (data.type) {
				case 'commandSent':
					{
                        this.copiaEntrada = this.entrada;
                        this.entrada = "";
                        
                        // Notify legacy Subject (keep for backward compatibility)
                        this.promessaLeitura.notify();
                        
                        // NEW: Resolve Promise-based input handler
                        if (this.resolverLeitura) {
                            const resolver = this.resolverLeitura;
                            const valor = this.copiaEntrada;
                            this.resolverLeitura = null;
                            
                            // Resolve on next tick to yield control to event loop
                            setTimeout(() => {
                                resolver(valor);
                            }, 0);
                        }
						break;
					}
                case 'deleteChar':
                    {
                        if (this.entrada.length > 0) {
                            this.entrada = this.entrada.substr(0, this.entrada.length - 1);
                        }
                        break;
                    }
                case 'keyTyped':
                    {
                        this.entrada += data.value;
                        break;
                    }
			}
		});
    }

    /**
     * NEW: Aguarda entrada do usuário de forma não-bloqueante.
     * Retorna uma Promise que resolve quando o usuário pressiona Enter.
     * Esta implementação é otimizada para o ambiente web e não bloqueia o event loop.
     */
    public aguardarEntrada(): Promise<string> {
        return new Promise((resolve) => {
            // IMPORTANT: Always wait for fresh input, never use stale copiaEntrada
            // The resolver will be called when commandSent is received
            this.resolverLeitura = resolve;
        });
    }

    public ativarVisao(): void {
        if (this._view) {
			this._view.show?.(true);
        }
    }

    public escreverEmSaida(conteudo: string) {
		if (this._view) {
			this._view.show?.(true);
			this._view.webview.postMessage({ type: 'escreverEmSaida', content: conteudo });
		}
	}

    public escreverEmSaidaMesmaLinha(conteudo: string) {
		if (this._view) {
			this._view.show?.(true);
			this._view.webview.postMessage({ type: 'escreverEmSaidaMesmaLinha', content: conteudo });
		}
	}

    public limparTerminal() {
		if (this._view) {
			this._view.show?.(true);
			this._view.webview.postMessage({ type: 'limparTerminal' });
		}
	}

    private _getHtmlForWebview(webview: vscode.Webview) {
		// Get the local path to main script run in the webview, then convert it to a uri we can use in the webview.
		const scriptUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'node_modules', '@xterm', 'xterm', 'lib', 'xterm.js'));
		const addonFitUrl = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'node_modules', '@xterm', 'addon-fit', 'lib', 'addon-fit.js'));

		// Do the same for the stylesheet.
		const estilosTerminal = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'node_modules', '@xterm', 'xterm', 'css', 'xterm.css'));

        // Generate a nonce for inline scripts
        const nonce = this.obterNonce();

        const htmlFinal = `<!DOCTYPE html>
        <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src ${webview.cspSource} https:; script-src ${webview.cspSource} 'nonce-${nonce}'; style-src ${webview.cspSource} 'unsafe-inline'; font-src ${webview.cspSource};">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <script src="${scriptUri}"></script>
                <script src="${addonFitUrl}"></script>
                <link href="${estilosTerminal}" rel="stylesheet">
                <style>
                    html, body {
                        height: 100%;
                        margin: 0;
                        padding: 0;
                        overflow: hidden;
                        background-color: var(--vscode-terminal-background, var(--vscode-editor-background));
                        color: var(--vscode-terminal-foreground, var(--vscode-editor-foreground));
                    }
                    #terminal {
                        height: 100%;
                        width: 100%;
                    }
                    .xterm {
                        height: 100%;
                    }
                </style>
            </head>
            <body>
                <div id="terminal"></div>

                <script nonce="${nonce}">
                    const vscode = acquireVsCodeApi();

                    const oldState = vscode.getState() || {};

                    // Get VS Code theme colors
                    const computedStyle = getComputedStyle(document.documentElement);
                    const backgroundColor = computedStyle.getPropertyValue('--vscode-terminal-background') ||
                                          computedStyle.getPropertyValue('--vscode-editor-background');
                    const foregroundColor = computedStyle.getPropertyValue('--vscode-terminal-foreground') ||
                                          computedStyle.getPropertyValue('--vscode-editor-foreground');

                    const terminal = new Terminal({
                        rows: 20,
                        fontFamily: '"Cascadia Code", Menlo, monospace',
                        allowProposedApi: true,
                        theme: {
                            background: backgroundColor,
                            foreground: foregroundColor
                        }
                    });
                    let resultadoLeia = "";
                    let ultimoBuffer = 0;

                    const fitAddon = new FitAddon.FitAddon();
                    terminal.loadAddon(fitAddon);

                    terminal.open(document.getElementById("terminal"));
                    fitAddon.fit();

                    if (oldState) {
                        terminal.write(oldState);
                    }

                    terminal.onData((e) => {
                        switch (e) {
                            case "\\r": // Enter
                                vscode.postMessage({ type: 'commandSent', value: e });
                                terminal.writeln("");
                                ultimoBuffer = 0;
                                break;
                            case "\\u007F": // Backspace (DEL)
                                // Não excluir o prompt
                                if (terminal._core.buffer.x > ultimoBuffer) {
                                    terminal.write("\b \b");
                                    vscode.postMessage({ type: 'deleteChar', value: e });
                                }
                                break;
                            default:
                                vscode.postMessage({ type: 'keyTyped', value: e });
                                terminal.write(e);
                                break;
                        }
                    });

                    // Handle messages sent from the extension to the webview
                    window.addEventListener('message', event => {
                        const message = event.data; // The json data that the extension sent
                        switch (message.type) {
                            case 'escreverEmSaida':
                                {
                                    terminal.writeln(message.content);
                                    break;
                                }
                            case 'escreverEmSaidaMesmaLinha':
                                {
                                    terminal.write(message.content);
                                    break;
                                }
                            case 'limparTerminal':
                                {
                                    terminal.reset();
                                    break;
                                }
                        }
                    });
                </script>
            </body>
        </html>`;

		return htmlFinal;
	}

    protected obterNonce() {
        let texto = '';
        const caracteresPossiveis = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        for (let i = 0; i < 32; i++) {
            texto += caracteresPossiveis.charAt(Math.floor(Math.random() * caracteresPossiveis.length));
        }
        return texto;
    }
}