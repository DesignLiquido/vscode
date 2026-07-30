import * as vscode from 'vscode';

function assegurar(condicao: unknown, mensagem: string): asserts condicao {
    if (!condicao) {
        throw new Error(mensagem);
    }
}

async function abrirFixture(): Promise<vscode.TextDocument> {
    const pastaWorkspace = vscode.workspace.workspaceFolders?.[0];
    assegurar(pastaWorkspace, 'O workspace de fixtures E2E não foi aberto.');

    const uri = vscode.Uri.joinPath(pastaWorkspace.uri, 'contador.delegua');
    const documento = await vscode.workspace.openTextDocument(uri);
    await vscode.window.showTextDocument(documento);
    return documento;
}

async function testarAtivacao(): Promise<void> {
    const extensao = vscode.extensions.getExtension('designliquido.designliquido-vscode');
    assegurar(extensao, 'A extensão Design Líquido não foi encontrada pelo Extension Host.');

    await extensao.activate();
    assegurar(extensao.isActive, 'A extensão Design Líquido não foi ativada.');
}

async function testarCompletude(documento: vscode.TextDocument): Promise<void> {
    const itens = await vscode.commands.executeCommand<vscode.CompletionList>(
        'vscode.executeCompletionItemProvider',
        documento.uri,
        new vscode.Position(1, 8)
    );

    assegurar(itens?.items.some(item => item.label === 'escreva'),
        'A completude da extensão não retornou a função nativa "escreva".');
}

async function testarHover(documento: vscode.TextDocument): Promise<void> {
    const hovers = await vscode.commands.executeCommand<vscode.Hover[]>(
        'vscode.executeHoverProvider',
        documento.uri,
        new vscode.Position(1, 2)
    );

    assegurar(hovers && hovers.length > 0, 
        'O provedor de Hover não retornou nenhuma informação.');

    const possuiConteudo = hovers.some(h => 
        h.contents.some(c => {
            const texto = typeof c === 'string' ? c : c.value;
            return texto.includes('escreva') || texto.includes('função');
        })
    );

    assegurar(possuiConteudo, 'O Hover sobre a função "escreva" não retornou a documentação esperada.');
}

async function testarDefinicao(documento: vscode.TextDocument): Promise<void> {
    const definicoes = await vscode.commands.executeCommand<vscode.Location[]>(
        'vscode.executeDefinitionProvider',
        documento.uri,
        new vscode.Position(1, 10)
    );

    assegurar(definicoes && definicoes.length > 0, 
        'O provedor de definição não retornou nenhuma localização.');

    const primeiraDefinicao = definicoes[0];
    assegurar(primeiraDefinicao.range.start.line === 0, 
        `A definição deveria apontar para a linha 0, mas apontou para a linha ${primeiraDefinicao.range.start.line}.`);
}

async function testarRenomeacao(documento: vscode.TextDocument): Promise<void> {
    const edicoes = await vscode.commands.executeCommand<vscode.WorkspaceEdit>(
        'vscode.executeDocumentRenameProvider',
        documento.uri,
        new vscode.Position(1, 10),
        'total'
    );

    assegurar(edicoes, 'O provedor de renomeação não retornou edições.');
    const edicoesDocumento = edicoes.get(documento.uri) ?? [];
    assegurar(edicoesDocumento.length === 2,
        `A renomeação deveria editar duas ocorrências, mas retornou ${edicoesDocumento.length}.`);
    assegurar(edicoesDocumento.every(edicao => edicao.newText === 'total'),
        'A renomeação não aplicou o novo identificador a todas as ocorrências.');
}

export async function run(): Promise<void> {
    await testarAtivacao();
    const documento = await abrirFixture();

    await testarCompletude(documento);
    await testarHover(documento);
    await testarDefinicao(documento);
    await testarRenomeacao(documento);
    console.log('Todos os testes E2E passaram com sucesso!');
}
