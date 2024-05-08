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

		// Use a nonce to only allow a specific script to be run.
		const nonce = this.getNonce();

        const htmlFinal = `<!DOCTYPE html>
        <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <script nonce="${nonce}" src="${scriptUri}"></script>
                <link href="${estilosTerminal}" rel="stylesheet">
            </head>
            <body>
                <div id="terminal"></div>

                <script>
                    var terminal = new Terminal({
                        fontFamily: '"Cascadia Code", Menlo, monospace',
                        allowProposedApi: true
                    });

                    terminal.open(document.getElementById("terminal"));
                    terminal.writeln("Painel de Entrada e Saída");
                    terminal.writeln("Execute seu programa para interagir com este painel.");
                </script>
            </body>
        </html>`;

		return htmlFinal;
	}

    private getNonce() {
        let text = '';
        const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        for (let i = 0; i < 32; i++) {
            text += possible.charAt(Math.floor(Math.random() * possible.length));
        }
        return text;
    }
}