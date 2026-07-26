import * as vscode from 'vscode';

/**
 * Cada dialeto secundário (fora da família Delégua/Pituguês) carrega seu próprio
 * pacote de análise léxica/sintática via import dinâmico, só quando um arquivo
 * daquela linguagem é de fato aberto. Isso evita pagar o custo de ativação de
 * todos os dialetos suportados sempre que a extensão é ativada (issue #111).
 */
type RegistradorLinguagem = (context: vscode.ExtensionContext) => Promise<void>;

const gruposAtivados = new Set<string>();

const grupoPorLinguagem: Record<string, string> = {
    foles: 'foles',
    lmht: 'lmht',
    lincones: 'lincones',
    delprops: 'delprops',
    visualg: 'visualg',
    mapler: 'mapler',
    potigol: 'potigol',
    portugolstudio: 'portugolstudio',
};

const registradoresPorGrupo: Record<string, RegistradorLinguagem> = {
    foles: ativarFoles,
    lmht: ativarLmht,
    lincones: ativarLincones,
    delprops: ativarDelprops,
    visualg: ativarVisualg,
    mapler: ativarMapler,
    potigol: ativarPotigol,
    portugolstudio: ativarPortugolStudio,
};

/**
 * Garante que os provedores (completude, documentação em editor, formatação)
 * de uma linguagem secundária estejam registrados, carregando-os sob demanda
 * na primeira vez que um documento daquela linguagem é visto.
 */
export async function garantirProvedoresLinguagem(
    languageId: string,
    context: vscode.ExtensionContext
): Promise<void> {
    const grupo = grupoPorLinguagem[languageId];
    if (!grupo || gruposAtivados.has(grupo)) {
        return;
    }

    gruposAtivados.add(grupo);

    try {
        await registradoresPorGrupo[grupo](context);
    } catch (erro) {
        gruposAtivados.delete(grupo);
        console.error(`Erro ao ativar provedores para linguagem '${languageId}':`, erro);
    }
}

async function ativarFoles(context: vscode.ExtensionContext): Promise<void> {
    const [{ FolesProvedorCompletude }, { FolesProvedorDocumentacaoEmEditor }] = await Promise.all([
        import('./completude/foles-provedor-completude'),
        import('./documentacao-em-editor/foles-provedor-documentacao-em-editor'),
    ]);

    context.subscriptions.push(
        vscode.languages.registerCompletionItemProvider(
            [
                { scheme: 'file', language: 'foles' },
                { scheme: 'untitled', language: 'foles' }
            ],
            new FolesProvedorCompletude()
        ),
        vscode.languages.registerHoverProvider(
            [
                { scheme: 'file', language: 'foles' },
                { scheme: 'untitled', language: 'foles' }
            ],
            new FolesProvedorDocumentacaoEmEditor()
        )
    );
}

async function ativarLmht(context: vscode.ExtensionContext): Promise<void> {
    const [{ LmhtProvedorCompletude }, { LmhtProvedorDocumentacaoEmEditor }] = await Promise.all([
        import('./completude/lmht-provedor-completude'),
        import('./documentacao-em-editor/lmht-provedor-documentacao-em-editor'),
    ]);

    context.subscriptions.push(
        vscode.languages.registerCompletionItemProvider(
            [
                { scheme: 'file', language: 'lmht' },
                { scheme: 'untitled', language: 'lmht' }
            ],
            new LmhtProvedorCompletude()
        ),
        vscode.languages.registerHoverProvider(
            [
                { scheme: 'file', language: 'lmht' },
                { scheme: 'untitled', language: 'lmht' }
            ],
            new LmhtProvedorDocumentacaoEmEditor()
        )
    );
}

async function ativarLincones(context: vscode.ExtensionContext): Promise<void> {
    const { LinConEsProvedorDocumentacaoEmEditor } = await import('./documentacao-em-editor/lincones-provedor-documentacao-em-editor');

    context.subscriptions.push(
        vscode.languages.registerHoverProvider(
            [
                { scheme: 'file', language: 'lincones' },
                { scheme: 'untitled', language: 'lincones' }
            ],
            new LinConEsProvedorDocumentacaoEmEditor()
        )
    );
}

async function ativarDelprops(context: vscode.ExtensionContext): Promise<void> {
    const [{ DelpropsProvedorCompletude }, { DelpropsProvedorDocumentacaoEmEditor }] = await Promise.all([
        import('./completude/delprops-provedor-completude'),
        import('./documentacao-em-editor/delprops-provedor-documentacao-em-editor'),
    ]);

    context.subscriptions.push(
        vscode.languages.registerCompletionItemProvider(
            [
                { scheme: 'file', language: 'delprops' },
                { scheme: 'untitled', language: 'delprops' }
            ],
            new DelpropsProvedorCompletude(),
            '.'
        ),
        vscode.languages.registerHoverProvider(
            [
                { scheme: 'file', language: 'delprops' },
                { scheme: 'untitled', language: 'delprops' }
            ],
            new DelpropsProvedorDocumentacaoEmEditor()
        )
    );
}

async function ativarVisualg(context: vscode.ExtensionContext): Promise<void> {
    const [{ VisuAlgProvedorCompletude }, { VisuAlgProvedorDocumentacaoEmEditor }, { VisualgProvedorFormatacao }] = await Promise.all([
        import('./completude/visualg-provedor-completude'),
        import('./documentacao-em-editor/visualg-provedor-documentacao-em-editor'),
        import('./formatadores/visualg-provedor-formatacao'),
    ]);

    context.subscriptions.push(
        vscode.languages.registerCompletionItemProvider(
            [
                { scheme: 'file', language: 'visualg' },
                { scheme: 'untitled', language: 'visualg' }
            ],
            new VisuAlgProvedorCompletude()
        ),
        vscode.languages.registerHoverProvider(
            [
                { scheme: 'file', language: 'visualg' },
                { scheme: 'untitled', language: 'visualg' }
            ],
            new VisuAlgProvedorDocumentacaoEmEditor()
        ),
        vscode.languages.registerDocumentFormattingEditProvider(
            'visualg',
            new VisualgProvedorFormatacao()
        )
    );
}

async function ativarMapler(context: vscode.ExtensionContext): Promise<void> {
    const { MaplerProvedorFormatacao } = await import('./formatadores/mapler-provedor-formatacao');

    context.subscriptions.push(
        vscode.languages.registerDocumentFormattingEditProvider(
            'mapler',
            new MaplerProvedorFormatacao()
        )
    );
}

async function ativarPotigol(context: vscode.ExtensionContext): Promise<void> {
    const { PotigolProvedorFormatacao } = await import('./formatadores/potigol-provedor-formatacao');

    context.subscriptions.push(
        vscode.languages.registerDocumentFormattingEditProvider(
            'potigol',
            new PotigolProvedorFormatacao()
        )
    );
}

async function ativarPortugolStudio(context: vscode.ExtensionContext): Promise<void> {
    const [{ PortugolStudioProvedorCompletude }, { PortugolStudioProvedorDocumentacaoEmEditor }, { PortugolStudioProvedorFormatacao }] = await Promise.all([
        import('./completude/portugol-studio-provedor-completude'),
        import('./documentacao-em-editor/portugol-studio-provedor-documentacao-em-editor'),
        import('./formatadores/portugol-studio-provedor-formatacao'),
    ]);

    context.subscriptions.push(
        vscode.languages.registerCompletionItemProvider(
            [
                { scheme: 'file', language: 'portugolstudio' },
                { scheme: 'untitled', language: 'portugolstudio' }
            ],
            new PortugolStudioProvedorCompletude()
        ),
        vscode.languages.registerHoverProvider(
            [
                { scheme: 'file', language: 'portugolstudio' },
                { scheme: 'untitled', language: 'portugolstudio' }
            ],
            new PortugolStudioProvedorDocumentacaoEmEditor()
        ),
        vscode.languages.registerDocumentFormattingEditProvider(
            'portugolstudio',
            new PortugolStudioProvedorFormatacao()
        )
    );
}
