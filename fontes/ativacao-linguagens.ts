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
    birl: 'birl',
    egua: 'egua',
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
    birl: ativarBirl,
    egua: ativarEgua,
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
    const [{ FolesProvedorCompletude }, { FolesProvedorDocumentacaoEmEditor }, { FolesProvedorSimbolosDocumento }, { FolesProvedorDobramento }, { FolesProvedorTokensSemanticos, LEGENDA_TOKENS_SEMANTICOS }, { FolesProvedorFormatacao }] = await Promise.all([
        import('./completude/foles-provedor-completude'),
        import('./documentacao-em-editor/foles-provedor-documentacao-em-editor'),
        import('./simbolos-documento/foles'),
        import('./dobramento/foles'),
        import('./tokens-semanticos/foles'),
        import('./formatadores/foles-provedor-formatacao'),
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
        ),
        vscode.languages.registerDocumentSymbolProvider(
            [
                { scheme: 'file', language: 'foles' },
                { scheme: 'untitled', language: 'foles' }
            ],
            new FolesProvedorSimbolosDocumento()
        ),
        vscode.languages.registerFoldingRangeProvider(
            [
                { scheme: 'file', language: 'foles' },
                { scheme: 'untitled', language: 'foles' }
            ],
            new FolesProvedorDobramento()
        ),
        vscode.languages.registerDocumentSemanticTokensProvider(
            [
                { scheme: 'file', language: 'foles' },
                { scheme: 'untitled', language: 'foles' }
            ],
            new FolesProvedorTokensSemanticos(),
            LEGENDA_TOKENS_SEMANTICOS
        ),
        vscode.languages.registerDocumentFormattingEditProvider(
            'foles',
            new FolesProvedorFormatacao()
        )
    );
}

async function ativarLmht(context: vscode.ExtensionContext): Promise<void> {
    const [{ LmhtProvedorCompletude }, { LmhtProvedorDocumentacaoEmEditor }, { LmhtProvedorSimbolosDocumento }, { LmhtProvedorDobramento }, { LmhtProvedorTokensSemanticos, LEGENDA_TOKENS_SEMANTICOS }, { LmhtProvedorFormatacao }] = await Promise.all([
        import('./completude/lmht-provedor-completude'),
        import('./documentacao-em-editor/lmht-provedor-documentacao-em-editor'),
        import('./simbolos-documento/lmht'),
        import('./dobramento/lmht'),
        import('./tokens-semanticos/lmht'),
        import('./formatadores/lmht-provedor-formatacao'),
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
        ),
        vscode.languages.registerDocumentSymbolProvider(
            [
                { scheme: 'file', language: 'lmht' },
                { scheme: 'untitled', language: 'lmht' }
            ],
            new LmhtProvedorSimbolosDocumento()
        ),
        vscode.languages.registerFoldingRangeProvider(
            [
                { scheme: 'file', language: 'lmht' },
                { scheme: 'untitled', language: 'lmht' }
            ],
            new LmhtProvedorDobramento()
        ),
        vscode.languages.registerDocumentSemanticTokensProvider(
            [
                { scheme: 'file', language: 'lmht' },
                { scheme: 'untitled', language: 'lmht' }
            ],
            new LmhtProvedorTokensSemanticos(),
            LEGENDA_TOKENS_SEMANTICOS
        ),
        vscode.languages.registerDocumentFormattingEditProvider(
            'lmht',
            new LmhtProvedorFormatacao()
        )
    );
}

async function ativarLincones(context: vscode.ExtensionContext): Promise<void> {
    const [{ LinConEsProvedorDocumentacaoEmEditor }, { LinConEsProvedorSimbolosDocumento }, { LinConEsProvedorFormatacao }] = await Promise.all([
        import('./documentacao-em-editor/lincones-provedor-documentacao-em-editor'),
        import('./simbolos-documento/lincones'),
        import('./formatadores/lincones-provedor-formatacao'),
    ]);

    context.subscriptions.push(
        vscode.languages.registerHoverProvider(
            [
                { scheme: 'file', language: 'lincones' },
                { scheme: 'untitled', language: 'lincones' }
            ],
            new LinConEsProvedorDocumentacaoEmEditor()
        ),
        vscode.languages.registerDocumentSymbolProvider(
            [
                { scheme: 'file', language: 'lincones' },
                { scheme: 'untitled', language: 'lincones' }
            ],
            new LinConEsProvedorSimbolosDocumento()
        ),
        vscode.languages.registerDocumentFormattingEditProvider(
            'lincones',
            new LinConEsProvedorFormatacao()
        )
    );
}

async function ativarDelprops(context: vscode.ExtensionContext): Promise<void> {
    const [{ DelpropsProvedorCompletude }, { DelpropsProvedorDocumentacaoEmEditor }, { DelpropsProvedorSimbolosDocumento }, { DelpropsProvedorFormatacao }] = await Promise.all([
        import('./completude/delprops-provedor-completude'),
        import('./documentacao-em-editor/delprops-provedor-documentacao-em-editor'),
        import('./simbolos-documento/delprops'),
        import('./formatadores/delprops-provedor-formatacao'),
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
        ),
        vscode.languages.registerDocumentSymbolProvider(
            [
                { scheme: 'file', language: 'delprops' },
                { scheme: 'untitled', language: 'delprops' }
            ],
            new DelpropsProvedorSimbolosDocumento()
        ),
        vscode.languages.registerDocumentFormattingEditProvider(
            'delprops',
            new DelpropsProvedorFormatacao()
        )
    );
}

async function ativarVisualg(context: vscode.ExtensionContext): Promise<void> {
    const [{ VisuAlgProvedorCompletude }, { VisuAlgProvedorDocumentacaoEmEditor }, { VisualgProvedorFormatacao }, { VisualgProvedorSimbolosDocumento }, { VisualgProvedorDobramento }, { VisualgProvedorTokensSemanticos, LEGENDA_TOKENS_SEMANTICOS }] = await Promise.all([
        import('./completude/visualg-provedor-completude'),
        import('./documentacao-em-editor/visualg-provedor-documentacao-em-editor'),
        import('./formatadores/visualg-provedor-formatacao'),
        import('./simbolos-documento/visualg'),
        import('./dobramento/visualg'),
        import('./tokens-semanticos/visualg'),
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
        ),
        vscode.languages.registerDocumentSymbolProvider(
            [
                { scheme: 'file', language: 'visualg' },
                { scheme: 'untitled', language: 'visualg' }
            ],
            new VisualgProvedorSimbolosDocumento()
        ),
        vscode.languages.registerFoldingRangeProvider(
            [
                { scheme: 'file', language: 'visualg' },
                { scheme: 'untitled', language: 'visualg' }
            ],
            new VisualgProvedorDobramento()
        ),
        vscode.languages.registerDocumentSemanticTokensProvider(
            [
                { scheme: 'file', language: 'visualg' },
                { scheme: 'untitled', language: 'visualg' }
            ],
            new VisualgProvedorTokensSemanticos(),
            LEGENDA_TOKENS_SEMANTICOS
        )
    );
}

async function ativarMapler(context: vscode.ExtensionContext): Promise<void> {
    const [{ MaplerProvedorFormatacao }, { MaplerProvedorSimbolosDocumento }, { MaplerProvedorDobramento }, { MaplerProvedorTokensSemanticos, LEGENDA_TOKENS_SEMANTICOS }] = await Promise.all([
        import('./formatadores/mapler-provedor-formatacao'),
        import('./simbolos-documento/mapler'),
        import('./dobramento/mapler'),
        import('./tokens-semanticos/mapler'),
    ]);

    context.subscriptions.push(
        vscode.languages.registerDocumentFormattingEditProvider(
            'mapler',
            new MaplerProvedorFormatacao()
        ),
        vscode.languages.registerDocumentSymbolProvider(
            [
                { scheme: 'file', language: 'mapler' },
                { scheme: 'untitled', language: 'mapler' }
            ],
            new MaplerProvedorSimbolosDocumento()
        ),
        vscode.languages.registerFoldingRangeProvider(
            [
                { scheme: 'file', language: 'mapler' },
                { scheme: 'untitled', language: 'mapler' }
            ],
            new MaplerProvedorDobramento()
        ),
        vscode.languages.registerDocumentSemanticTokensProvider(
            [
                { scheme: 'file', language: 'mapler' },
                { scheme: 'untitled', language: 'mapler' }
            ],
            new MaplerProvedorTokensSemanticos(),
            LEGENDA_TOKENS_SEMANTICOS
        )
    );
}

async function ativarPotigol(context: vscode.ExtensionContext): Promise<void> {
    const [{ PotigolProvedorFormatacao }, { PotigolProvedorSimbolosDocumento }, { PotigolProvedorDobramento }, { PotigolProvedorTokensSemanticos, LEGENDA_TOKENS_SEMANTICOS }] = await Promise.all([
        import('./formatadores/potigol-provedor-formatacao'),
        import('./simbolos-documento/potigol'),
        import('./dobramento/potigol'),
        import('./tokens-semanticos/potigol'),
    ]);

    context.subscriptions.push(
        vscode.languages.registerDocumentFormattingEditProvider(
            'potigol',
            new PotigolProvedorFormatacao()
        ),
        vscode.languages.registerDocumentSymbolProvider(
            [
                { scheme: 'file', language: 'potigol' },
                { scheme: 'untitled', language: 'potigol' }
            ],
            new PotigolProvedorSimbolosDocumento()
        ),
        vscode.languages.registerFoldingRangeProvider(
            [
                { scheme: 'file', language: 'potigol' },
                { scheme: 'untitled', language: 'potigol' }
            ],
            new PotigolProvedorDobramento()
        ),
        vscode.languages.registerDocumentSemanticTokensProvider(
            [
                { scheme: 'file', language: 'potigol' },
                { scheme: 'untitled', language: 'potigol' }
            ],
            new PotigolProvedorTokensSemanticos(),
            LEGENDA_TOKENS_SEMANTICOS
        )
    );
}

async function ativarPortugolStudio(context: vscode.ExtensionContext): Promise<void> {
    const [{ PortugolStudioProvedorCompletude }, { PortugolStudioProvedorDocumentacaoEmEditor }, { PortugolStudioProvedorFormatacao }, { PortugolStudioProvedorSimbolosDocumento }, { PortugolStudioProvedorDobramento }, { PortugolStudioProvedorTokensSemanticos, LEGENDA_TOKENS_SEMANTICOS }] = await Promise.all([
        import('./completude/portugol-studio-provedor-completude'),
        import('./documentacao-em-editor/portugol-studio-provedor-documentacao-em-editor'),
        import('./formatadores/portugol-studio-provedor-formatacao'),
        import('./simbolos-documento/portugolstudio'),
        import('./dobramento/portugolstudio'),
        import('./tokens-semanticos/portugolstudio'),
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
        ),
        vscode.languages.registerDocumentSymbolProvider(
            [
                { scheme: 'file', language: 'portugolstudio' },
                { scheme: 'untitled', language: 'portugolstudio' }
            ],
            new PortugolStudioProvedorSimbolosDocumento()
        ),
        vscode.languages.registerFoldingRangeProvider(
            [
                { scheme: 'file', language: 'portugolstudio' },
                { scheme: 'untitled', language: 'portugolstudio' }
            ],
            new PortugolStudioProvedorDobramento()
        ),
        vscode.languages.registerDocumentSemanticTokensProvider(
            [
                { scheme: 'file', language: 'portugolstudio' },
                { scheme: 'untitled', language: 'portugolstudio' }
            ],
            new PortugolStudioProvedorTokensSemanticos(),
            LEGENDA_TOKENS_SEMANTICOS
        )
    );
}

async function ativarBirl(context: vscode.ExtensionContext): Promise<void> {
    const [{ BirlProvedorSimbolosDocumento }, { BirlProvedorDobramento }, { BirlProvedorTokensSemanticos, LEGENDA_TOKENS_SEMANTICOS }] = await Promise.all([
        import('./simbolos-documento/birl'),
        import('./dobramento/birl'),
        import('./tokens-semanticos/birl'),
    ]);

    context.subscriptions.push(
        vscode.languages.registerDocumentSymbolProvider(
            [
                { scheme: 'file', language: 'birl' },
                { scheme: 'untitled', language: 'birl' }
            ],
            new BirlProvedorSimbolosDocumento()
        ),
        vscode.languages.registerFoldingRangeProvider(
            [
                { scheme: 'file', language: 'birl' },
                { scheme: 'untitled', language: 'birl' }
            ],
            new BirlProvedorDobramento()
        ),
        vscode.languages.registerDocumentSemanticTokensProvider(
            [
                { scheme: 'file', language: 'birl' },
                { scheme: 'untitled', language: 'birl' }
            ],
            new BirlProvedorTokensSemanticos(),
            LEGENDA_TOKENS_SEMANTICOS
        )
    );
}

async function ativarEgua(context: vscode.ExtensionContext): Promise<void> {
    const [{ EguaProvedorSimbolosDocumento }, { EguaProvedorDobramento }, { EguaProvedorTokensSemanticos, LEGENDA_TOKENS_SEMANTICOS }] = await Promise.all([
        import('./simbolos-documento/egua'),
        import('./dobramento/egua'),
        import('./tokens-semanticos/egua'),
    ]);

    context.subscriptions.push(
        vscode.languages.registerDocumentSymbolProvider(
            [
                { scheme: 'file', language: 'egua' },
                { scheme: 'untitled', language: 'egua' }
            ],
            new EguaProvedorSimbolosDocumento()
        ),
        vscode.languages.registerFoldingRangeProvider(
            [
                { scheme: 'file', language: 'egua' },
                { scheme: 'untitled', language: 'egua' }
            ],
            new EguaProvedorDobramento()
        ),
        vscode.languages.registerDocumentSemanticTokensProvider(
            [
                { scheme: 'file', language: 'egua' },
                { scheme: 'untitled', language: 'egua' }
            ],
            new EguaProvedorTokensSemanticos(),
            LEGENDA_TOKENS_SEMANTICOS
        )
    );
}
