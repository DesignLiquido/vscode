import * as vscode from 'vscode';

export class ProvedorVisaoEntradaSaida implements vscode.WebviewViewProvider {

    public static readonly viewType = 'designliquido.entradaESaida';

    private _view?: vscode.WebviewView;

    constructor(
		private readonly _extensionUri: vscode.Uri,
	) { }

    resolveWebviewView(webviewView: vscode.WebviewView, context: vscode.WebviewViewResolveContext<unknown>, token: vscode.CancellationToken): void | Thenable<void> {
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
                        console.log("Comando enviado");
						break;
					}
                case 'keyTyped':
                    {
                        // vscode.window.activeTextEditor?.insertSnippet(new vscode.SnippetString(`#${data.value}`));
                        console.log("Comando", data);
                        break;
                    }
			}
		});
    }

    public exemploAcaoExterna() {
		if (this._view) {
			this._view.show?.(true); // `show` is not implemented in 1.49 but is for 1.50 insiders
			this._view.webview.postMessage({ type: 'addColor' });
		}
	}

    private _getHtmlForWebview(webview: vscode.Webview) {
		// Get the local path to main script run in the webview, then convert it to a uri we can use in the webview.
		const scriptUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'node_modules', '@xterm', 'xterm', 'lib', 'xterm.js'));
		// const scriptUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'node_modules', '@xterm', 'xterm', 'lib', 'xterm.js'));
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

                    const fitAddon = new FitAddon.FitAddon();
                    terminal.loadAddon(fitAddon);

                    terminal.open(document.getElementById("terminal"));
                    fitAddon.fit();

                    terminal.writeln("Painel de Entrada e Saída");
                    terminal.writeln("Execute seu programa para interagir com este painel.");

                    terminal.onData((e) => {
                        switch (e) {
                            case "\\r": // Enter
                                vscode.postMessage({ type: 'commandSent', value: e });
                                break;
                            default:
                                vscode.postMessage({ type: 'keyTyped', value: e });
                                terminal.write(e);
                                break;
                        }
                    });

                    function onKeyTyped(key) {
                        vscode.postMessage({ type: 'colorSelected', value: color });
                    }
                </script>
            </body>
        </html>`;

		return htmlFinal;
	}
}