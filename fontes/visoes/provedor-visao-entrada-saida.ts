import * as vscode from 'vscode';
import { Subject } from 'await-notify';

/**
 * O provedor de visão de entrada e saída. Esta visão é aberta na mesma seção do 
 * terminal e do console de depuração.
 */
export class ProvedorVisaoEntradaSaida implements vscode.WebviewViewProvider {

    public static readonly viewType = 'extension.designliquido.entradaESaida';

    promessaLeitura: { 
        wait: () => Promise<any>,
        notify: () => void,
        notifyAll: () => void
    };

    private entrada: string;
    copiaEntrada: string;

    private _view?: vscode.WebviewView;

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
			// Allow scripts in the webview
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
                        this.promessaLeitura.notify();
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

        const htmlFinal = `<!DOCTYPE html>
        <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <script src="${scriptUri}"></script>
                <script src="${addonFitUrl}"></script>
                <link href="${estilosTerminal}" rel="stylesheet">
            </head>
            <body>
                <div id="terminal"></div>

                <script>
                    const vscode = acquireVsCodeApi();

                    const oldState = vscode.getState() || {};

                    const terminal = new Terminal({
                        fontFamily: '"Cascadia Code", Menlo, monospace',
                        allowProposedApi: true
                    });
                    let resultadoLeia = "";
                    let ultimoBuffer = 0;

                    const fitAddon = new FitAddon.FitAddon();
                    terminal.loadAddon(fitAddon);

                    terminal.open(document.getElementById("terminal"));
                    fitAddon.fit();

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
}