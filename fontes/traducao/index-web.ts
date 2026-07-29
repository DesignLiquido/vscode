import * as vscode from 'vscode';

async function lerConteudoDocumento(uri: vscode.Uri): Promise<string> {
    const bytes = await vscode.workspace.fs.readFile(uri);
    return new TextDecoder('utf-8').decode(bytes);
}

async function escreverArquivoDestino(uriOrigem: vscode.Uri, extensaoDestino: string, conteudo: string): Promise<void> {
    const caminho = uriOrigem.path;
    const semExt = caminho.replace(/\.[^.]+$/, '');
    const novoPath = semExt + '.' + extensaoDestino;
    const uriDestino = uriOrigem.with({ path: novoPath });
    const bytes = new TextEncoder().encode(conteudo);
    await vscode.workspace.fs.writeFile(uriDestino, bytes);
}

function extrairExtensao(path: string): string {
    const partes = path.split('.');
    return partes.length > 1 ? partes.pop()!.toLowerCase() : '';
}

export async function traduzir(deLinguagem: string, paraLinguagem: string, alvo: string = ''): Promise<any> {
    try {
        const editor = vscode.window.activeTextEditor;
        const documento = editor?.document;
        if (!documento) {
            return vscode.window.showErrorMessage('Nenhum arquivo aberto no editor para traduzir.');
        }

        const uri = documento.uri;
        const extensao = extrairExtensao(uri.path);
        if (!extensao || extensao !== deLinguagem) {
            return vscode.window.showErrorMessage('Extensão do arquivo não corresponde à linguagem de origem.');
        }

        const conteudo = await lerConteudoDocumento(uri);
        let resultado = '';

        // Traduções diretas
        switch (deLinguagem.toLowerCase()) {
            case 'foles': {
                const { FolEs } = await import('@designliquido/foles');
                const foles = new FolEs(false);
                resultado = foles.converterParaCss(conteudo);
                break;
            }
            case 'css': {
                const { FolEs } = await import('@designliquido/foles');
                const foles2 = new FolEs(false);
                resultado = foles2.converterParaFolEs(conteudo);
                break;
            }
            case 'lmht': {
                const { ConversorLmht } = await import('@designliquido/lmht-js');
                const conversorLmht = new ConversorLmht();
                resultado = await conversorLmht.converterPorArquivo(conteudo);
                break;
            }
            case 'html': {
                const { ConversorHtml } = await import('@designliquido/lmht-js');
                const conversorHtml = new ConversorHtml();
                resultado = await conversorHtml.converterPorArquivo(conteudo);
                break;
            }
            case 'lincones': {
                const {
                    Lexador: LexadorLinConEs,
                    AvaliadorSintatico: AvaliadorSintaticoLinConEs,
                    TradutorSqlAnsi
                } = await import('@designliquido/lincones-js');
                const lexador = new LexadorLinConEs();
                const avaliador = new AvaliadorSintaticoLinConEs();
                const tradutor = new TradutorSqlAnsi();
                const linhas = conteudo.split(/\r?\n/);
                const retLexador = lexador.mapear(linhas);
                const retAvaliador = avaliador.analisar(retLexador);
                resultado = tradutor.traduzir(retAvaliador.comandos);
                break;
            }
            case 'sql': {
                const {
                    LexadorSqlAnsi,
                    AvaliadorSintaticoSqlAnsi,
                    TradutorReversoSqlAnsi
                } = await import('@designliquido/lincones-js');
                const lexadorSql = new LexadorSqlAnsi();
                const avaliadorSql = new AvaliadorSintaticoSqlAnsi();
                const tradutorReverso = new TradutorReversoSqlAnsi();
                const linhasSql = conteudo.split(/\r?\n/);
                const retLexadorSql = lexadorSql.mapear(linhasSql);
                const retAvaliadorSql = avaliadorSql.analisar(retLexadorSql);
                resultado = tradutorReverso.traduzir(retAvaliadorSql.comandos);
                break;
            }
            default: {
                const { NucleoTraducaoDeleguaWeb } = await import('./nucleo-traducao-delegua-web');
                const nucleoTraducaoDeleguaWeb = new NucleoTraducaoDeleguaWeb(() => {}, () => {});
                nucleoTraducaoDeleguaWeb.iniciarTradutor(`delegua-para-${paraLinguagem}`);
                resultado = await nucleoTraducaoDeleguaWeb.traduzirArquivo(conteudo);
            }
        }

        if (!resultado) {
            return;
        }

        await escreverArquivoDestino(uri, paraLinguagem, resultado);
        await vscode.env.clipboard.writeText(resultado);
        
        const nomeArquivo = uri.path.split('/').pop()?.replace(`.${deLinguagem}`, `.${paraLinguagem}`) || 'arquivo';
        vscode.window.showInformationMessage(`Arquivo traduzido: ${nomeArquivo}`);
        vscode.window.showInformationMessage('Tradução copiada para área de transferência');
    } catch (error: any) {
        vscode.window.showErrorMessage(`Erro ao traduzir: ${error?.message ?? String(error)}`);
    }
}

export default { traduzir };
