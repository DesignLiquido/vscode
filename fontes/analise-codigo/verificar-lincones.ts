import * as vscode from 'vscode';

export async function encontrarRaizProjeto(uriArquivo: vscode.Uri): Promise<vscode.Uri | null> {
    let diretorio = vscode.Uri.joinPath(uriArquivo, '..');

    while (true) {
        try {
            await vscode.workspace.fs.stat(vscode.Uri.joinPath(diretorio, 'configuracao.delprops'));
            return diretorio;
        } catch {
            // não encontrado neste nível
        }
        const pai = vscode.Uri.joinPath(diretorio, '..');
        if (pai.path === diretorio.path) break;
        diretorio = pai;
    }

    return null;
}

export async function verificarConfiguracaoLincones(documento: vscode.TextDocument): Promise<vscode.Diagnostic[]> {
    const diagnosticos: vscode.Diagnostic[] = [];

    if (!/[\\\/]rotas[\\\/]/i.test(documento.fileName)) {
        return diagnosticos;
    }

    const linhas = documento.getText().split('\n');
    const linhasComLincones = linhas
        .map((texto, indice) => ({ texto, indice }))
        .filter(({ texto }) => /\blincones\b/i.test(texto));

    if (linhasComLincones.length === 0) {
        return diagnosticos;
    }

    const raizProjeto = await encontrarRaizProjeto(documento.uri);
    if (!raizProjeto) {
        return diagnosticos;
    }

    let conteudoDelprops: string;
    try {
        const bytes = await vscode.workspace.fs.readFile(
            vscode.Uri.joinPath(raizProjeto, 'configuracao.delprops')
        );
        conteudoDelprops = new TextDecoder().decode(bytes);
    } catch {
        return diagnosticos;
    }

    const linhasDelprops = conteudoDelprops.split('\n');
    const temTecnologia = linhasDelprops.some(linha =>
        /^liquido\.dados\.lincones\.tecnologia\s*=\s*.+/.test(linha.replace(/\/\/.*$/, '').trim())
    );
    const temCaminho = linhasDelprops.some(linha =>
        /^liquido\.dados\.lincones\.caminho\s*=\s*.+/.test(linha.replace(/\/\/.*$/, '').trim())
    );

    if (!temTecnologia || !temCaminho) {
        const mensagem = "Suporte a LinConEs não parece estar configurado apropriadamente. Verifique se seu arquivo `configuracao.delprops` na raiz do seu projeto possui entradas `liquido.dados.lincones.tecnologia` e `liquido.dados.lincones.caminho` com valores válidos.";
        for (const { indice, texto } of linhasComLincones) {
            diagnosticos.push(new vscode.Diagnostic(
                new vscode.Range(indice, 0, indice, texto.length),
                mensagem,
                vscode.DiagnosticSeverity.Warning
            ));
        }
    }

    return diagnosticos;
}
