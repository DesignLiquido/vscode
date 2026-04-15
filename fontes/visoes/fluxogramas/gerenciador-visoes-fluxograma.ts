import * as vscode from 'vscode';

/**
 * Gerencia criação e ciclo de vida de visões de fluxogramas.
 * Compartilhado entre `extensao.ts` e `extensao-web.ts`.
 */
export class GerenciadorVisoesFluxograma {
    private static painelAtual: vscode.WebviewPanel | undefined;

    /**
     * Cria ou revela visão com o fluxograma.
     */
    public static criarOuExibir(
        codigoNotacaoMermaid: string,
        nomeArquivo: string,
        localizadorExtensao: vscode.Uri
    ): vscode.WebviewPanel {
        const coluna = vscode.ViewColumn.Beside;

        // Se painel já existe, atualiza painel existente.
        if (GerenciadorVisoesFluxograma.painelAtual) {
            GerenciadorVisoesFluxograma.painelAtual.reveal(coluna);
            GerenciadorVisoesFluxograma.painelAtual.title = `Fluxograma: ${nomeArquivo}`;
            GerenciadorVisoesFluxograma.painelAtual.webview.html = 
                GerenciadorVisoesFluxograma.obterConteudoVisao(
                    codigoNotacaoMermaid,
                    nomeArquivo,
                    GerenciadorVisoesFluxograma.painelAtual.webview,
                    localizadorExtensao
                );
            return GerenciadorVisoesFluxograma.painelAtual;
        }

        // Senão, cria novo.
        const painel = vscode.window.createWebviewPanel(
            'deleguaFluxograma',
            `Fluxograma: ${nomeArquivo}`,
            coluna,
            {
                enableScripts: true,
                retainContextWhenHidden: true,
                localResourceRoots: [localizadorExtensao]
            }
        );

        GerenciadorVisoesFluxograma.painelAtual = painel;

        // Define o conteúdo HTML.
        painel.webview.html = GerenciadorVisoesFluxograma.obterConteudoVisao(
            codigoNotacaoMermaid,
            nomeArquivo,
            painel.webview,
            localizadorExtensao
        );

        // Reinicia quando o painel é fechado
        painel.onDidDispose(
            () => {
                GerenciadorVisoesFluxograma.painelAtual = undefined;
            },
            null,
            []
        );

        return painel;
    }

    /**
     * Atualiza o conteúdo de uma webview existente
     */
    public static atualizarConteudo(codigoNotacaoMermaid: string, nomeArquivo: string, localizadorExtensao: vscode.Uri): void {
        if (GerenciadorVisoesFluxograma.painelAtual) {
            GerenciadorVisoesFluxograma.painelAtual.title = `Fluxograma: ${nomeArquivo}`;
            GerenciadorVisoesFluxograma.painelAtual.webview.html = 
                GerenciadorVisoesFluxograma.obterConteudoVisao(
                    codigoNotacaoMermaid,
                    nomeArquivo,
                    GerenciadorVisoesFluxograma.painelAtual.webview,
                    localizadorExtensao
                );
        }
    }

    /**
     * Gera o conteúdo para a visão em HTML.
     */
    public static obterConteudoVisao(
        codigoNotacaoMermaid: string,
        nomeArquivo: string,
        visao: vscode.Webview,
        localizadorExtensao: vscode.Uri
    ): string {
        // Gera código único da visão por medida de segurança.
        const nonce = obterNonce();

        // Escapa nome do arquivo para evitar certos tipos de injeção de parâmetros.
        const safeFileName = nomeArquivo.replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

        return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="Content-Security-Policy" content="
        default-src 'none';
        script-src https://cdn.jsdelivr.net 'nonce-${nonce}';
        style-src ${visao.cspSource} 'unsafe-inline';
        img-src ${visao.cspSource} https: data:;
        font-src ${visao.cspSource} https:;
    ">
    <title>Fluxograma - ${safeFileName}</title>
    <script type="module" nonce="${nonce}">
        import mermaid from 'https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.esm.min.mjs';
        mermaid.initialize({ 
            startOnLoad: true,
            theme: 'default',
            flowchart: {
                useMaxWidth: true,
                htmlLabels: true,
                curve: 'basis'
            }
        });
    </script>
    <style>
        body {
            margin: 0;
            padding: 20px;
            display: flex;
            flex-direction: column;
            align-items: center;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            background-color: var(--vscode-editor-background);
            color: var(--vscode-editor-foreground);
        }
        .container {
            width: 100%;
            max-width: 1200px;
        }
        h1 {
            color: var(--vscode-editor-foreground);
            margin-bottom: 20px;
            font-size: 1.5em;
        }
        .mermaid {
            background-color: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            margin-top: 10px;
        }
        .controls {
            margin-bottom: 20px;
            display: flex;
            gap: 10px;
            flex-wrap: wrap;
        }
        button {
            background-color: var(--vscode-button-background);
            color: var(--vscode-button-foreground);
            border: none;
            padding: 8px 16px;
            border-radius: 4px;
            cursor: pointer;
            font-size: 14px;
            transition: background-color 0.2s;
        }
        button:hover {
            background-color: var(--vscode-button-hoverBackground);
        }
        button:active {
            transform: translateY(1px);
        }
        .info {
            margin-bottom: 15px;
            padding: 10px;
            background-color: var(--vscode-textBlockQuote-background);
            border-left: 4px solid var(--vscode-textLink-foreground);
            border-radius: 4px;
            font-size: 0.9em;
        }
        .error {
            color: var(--vscode-errorForeground);
            padding: 20px;
            background-color: var(--vscode-inputValidation-errorBackground);
            border: 1px solid var(--vscode-inputValidation-errorBorder);
            border-radius: 4px;
        }
        @media (prefers-color-scheme: dark) {
            .mermaid {
                background-color: #1e1e1e;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>📊 Fluxograma: ${safeFileName}</h1>
        <div class="info">
            💡 Dica: Use os botões abaixo para exportar o fluxograma como imagem.
        </div>
        <div class="controls">
            <button onclick="downloadSVG()">⬇️ Baixar como SVG</button>
            <button onclick="downloadPNG()">⬇️ Baixar como PNG</button>
            <button onclick="copyToClipboard()">📋 Copiar Código Mermaid</button>
        </div>
        <div class="mermaid">
${codigoNotacaoMermaid}
        </div>
    </div>
    <script nonce="${nonce}">
        const mermaidSource = ${JSON.stringify(codigoNotacaoMermaid)};
        const fileName = ${JSON.stringify(safeFileName)};

        function downloadSVG() {
            const svg = document.querySelector('.mermaid svg');
            if (!svg) {
                alert('Erro: SVG não encontrado');
                return;
            }
            
            const svgData = new XMLSerializer().serializeToString(svg);
            const blob = new Blob([svgData], { type: 'image/svg+xml' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'fluxograma-' + fileName.replace(/[^a-z0-9]/gi, '-') + '.svg';
            a.click();
            URL.revokeObjectURL(url);
        }

        function downloadPNG() {
            const svg = document.querySelector('.mermaid svg');
            if (!svg) {
                alert('Erro: SVG não encontrado');
                return;
            }
            
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const svgData = new XMLSerializer().serializeToString(svg);
            const img = new Image();
            
            img.onload = function() {
                canvas.width = img.width;
                canvas.height = img.height;
                ctx.fillStyle = 'white';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(img, 0, 0);
                canvas.toBlob(function(blob) {
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = 'fluxograma-' + fileName.replace(/[^a-z0-9]/gi, '-') + '.png';
                    a.click();
                    URL.revokeObjectURL(url);
                });
            };
            
            img.onerror = function() {
                alert('Erro ao converter para PNG');
            };
            
            const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
            const url = URL.createObjectURL(svgBlob);
            img.src = url;
        }

        function copyToClipboard() {
            navigator.clipboard.writeText(mermaidSource).then(
                () => {
                    const button = event.target;
                    const originalText = button.textContent;
                    button.textContent = '✅ Copiado!';
                    setTimeout(() => {
                        button.textContent = originalText;
                    }, 2000);
                },
                (err) => {
                    alert('Erro ao copiar: ' + err);
                }
            );
        }
    </script>
</body>
</html>`;
    }

    /**
     * Descarta o painel da memória de execução do VSCode.
     */
    public static descartar(): void {
        if (GerenciadorVisoesFluxograma.painelAtual) {
            GerenciadorVisoesFluxograma.painelAtual.dispose();
            GerenciadorVisoesFluxograma.painelAtual = undefined;
        }
    }
}

/**
 * Gera código aleatório para satisfazer o CSP
 */
function obterNonce(): string {
    let text = '';
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < 32; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}
