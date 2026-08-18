import * as vscode from 'vscode';

import modificadoresLmht from '../linguagens/lmht/estruturas';
import atributosLmht from '../linguagens/lmht/atributos';

/**
 * Estruturas LMHT que correspondem a tags vazias (_void_) em HTML e, portanto,
 * não devem gerar par de abertura e fechamento na completude.
 */
const ESTRUTURAS_VAZIAS = new Set<string>([
    'area',
    'campo',
    'coluna',
    // `conteudo`/`conteúdo` são marcadores de composição de layout, sem conteúdo
    // próprio — sempre usados de forma auto-fechante, como `<conteudo />`.
    'conteudo',
    'conteúdo',
    'imagem',
    'linha-horizontal',
    'quebra-linha',
    'quebra-linha-oportuna',
    'recurso'
]);

/**
 * Contexto do cursor no momento da completude, para decidir o que sugerir.
 */
enum ContextoCompletude {
    /** Dentro de um comentário: não sugerir nada. */
    Comentario,
    /** Dentro da abertura de uma tag (após `<nome ...`): sugerir atributos. */
    AtributosDeTag,
    /** Em posição de estrutura (início de arquivo, após `>` ou após `<`): sugerir tags. */
    Estruturas
}

/**
 * Provedor de completude para LMHT, sensível ao contexto do cursor.
 *
 * - Suprime sugestões dentro de comentários `<!-- -->`.
 * - Dentro da abertura de uma tag, sugere atributos em vez de estruturas.
 * - Em posição de estrutura, sugere as tags LMHT já como _snippet_, inserindo
 *   `<tag>|</tag>` (ou `<tag />` para estruturas vazias) com o cursor no lugar
 *   certo.
 */
export class LmhtProvedorCompletude implements vscode.CompletionItemProvider {
    provideCompletionItems(
        document: vscode.TextDocument,
        position: vscode.Position,
        token: vscode.CancellationToken,
        context: vscode.CompletionContext
    ): vscode.ProviderResult<
        vscode.CompletionList<vscode.CompletionItem> | vscode.CompletionItem[]
    > {
        switch (this.determinarContexto(document, position)) {
            case ContextoCompletude.Comentario:
                return [];
            case ContextoCompletude.AtributosDeTag:
                return this.itensAtributos();
            case ContextoCompletude.Estruturas:
            default:
                return this.itensEstruturas();
        }
    }

    /**
     * Determina o contexto do cursor analisando o texto do início do documento
     * até a posição atual.
     */
    private determinarContexto(
        document: vscode.TextDocument,
        position: vscode.Position
    ): ContextoCompletude {
        const textoAnterior = document.getText(
            new vscode.Range(new vscode.Position(0, 0), position)
        );

        // Comentário: há um `<!--` sem `-->` correspondente antes do cursor.
        const ultimoAbreComentario = textoAnterior.lastIndexOf('<!--');
        const ultimoFechaComentario = textoAnterior.lastIndexOf('-->');
        if (ultimoAbreComentario > ultimoFechaComentario) {
            return ContextoCompletude.Comentario;
        }

        // Abertura de tag: há um `<` (que inicia um nome de tag, não `</` nem
        // `<!`) sem o `>` correspondente antes do cursor, e já existe pelo menos
        // um espaço após o nome — ou seja, estamos na região de atributos.
        const ultimoMenor = textoAnterior.lastIndexOf('<');
        const ultimoMaior = textoAnterior.lastIndexOf('>');
        if (ultimoMenor > ultimoMaior) {
            const trechoTag = textoAnterior.substring(ultimoMenor);
            const ehAberturaDeTag = /^<[A-Za-zÀ-ú]/.test(trechoTag);
            const jaTemEspaco = /\s/.test(trechoTag);
            if (ehAberturaDeTag && jaTemEspaco) {
                return ContextoCompletude.AtributosDeTag;
            }
        }

        return ContextoCompletude.Estruturas;
    }

    /**
     * Itens de completude para estruturas (tags), inseridas como _snippet_.
     */
    private itensEstruturas(): vscode.CompletionItem[] {
        const itens: vscode.CompletionItem[] = [];
        for (const [chave, valor] of Object.entries(modificadoresLmht)) {
            const item = new vscode.CompletionItem(
                chave,
                vscode.CompletionItemKind.Property
            );
            item.documentation = new vscode.MarkdownString(
                `Equivalente em HTML: \`${valor.nomeHtml}\``
            );

            if (ESTRUTURAS_VAZIAS.has(chave)) {
                item.insertText = new vscode.SnippetString(`<${chave} $0/>`);
            } else {
                item.insertText = new vscode.SnippetString(`<${chave}>$0</${chave}>`);
            }

            itens.push(item);
        }
        return itens;
    }

    /**
     * Itens de completude para atributos, sugeridos dentro da abertura de tag.
     */
    private itensAtributos(): vscode.CompletionItem[] {
        const itens: vscode.CompletionItem[] = [];
        for (const [chave, valor] of Object.entries(atributosLmht)) {
            const item = new vscode.CompletionItem(
                chave,
                vscode.CompletionItemKind.Field
            );
            item.documentation = new vscode.MarkdownString(
                `Equivalente em HTML: \`${valor.nomeHtml}\``
            );
            item.insertText = new vscode.SnippetString(`${chave}="$0"`);
            itens.push(item);
        }
        return itens;
    }
}
