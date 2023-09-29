import * as vscode from 'vscode';

/**
 * Copiado de https://github.com/formulahendry/vscode-auto-close-tag/blob/master/src/extension.ts, 
 * com diversas adaptações.
 * @param event O evento de mudança de texto.
 * @returns Nada.
 */
export function tentarFecharTagLmht(event: vscode.TextDocumentChangeEvent): void {
    if (!event.contentChanges[0]) {
        return;
    }
    let éSinalMaior = verificarCaracterFechamentoTag(event.contentChanges[0]);
    if (!éSinalMaior && event.contentChanges[0].text !== "/") {
        return;
    }

    const editor = vscode.window.activeTextEditor;
    if (!editor) {
        return;
    }

    let config = vscode.workspace.getConfiguration('designliquido-vscode', editor.document.uri);
    if (!config.get<boolean>("habilitarFechamentoEstruturasLmht", true)) {
        return;
    }

    let selecao = editor.selection;
    let posicaoOriginal = selecao.start.translate(0, 1);
    let estruturasExcluidas = config.get<string[]>("estruturasExcluidas", []);
    let éModoSublimeText3 = config.get<boolean>("modoSublimeText3", false);
    let habilitarFechamentoAutomaticoEstruturasLmht = config.get<boolean>("habilitarFechamentoAutomaticoEstruturasLmht", true);
    let éModoTotal = config.get<boolean>("modoTotal");

    if ((éModoSublimeText3 || éModoTotal) && event.contentChanges[0].text === "/") {
        let texto = editor.document.getText(new vscode.Range(new vscode.Position(0, 0), posicaoOriginal));
        let ultimos2Caracteres = "";
        if (texto.length > 2) {
            ultimos2Caracteres = texto.substr(texto.length - 2);
        }
        if (ultimos2Caracteres === "</") {
            let estruturaFechamento = obterEstruturaFechamento(texto, estruturasExcluidas);
            if (estruturaFechamento) {
                let proximoCaractere = obterProximoCaracter(editor, posicaoOriginal);
                if (proximoCaractere === ">") {
                    estruturaFechamento = estruturaFechamento.substr(0, estruturaFechamento.length - 1);
                }
                editor.edit((editBuilder) => {
                    editBuilder.insert(posicaoOriginal, estruturaFechamento);
                }).then(() => {
                    if (proximoCaractere === ">") {
                        editor.selection = moverSelecaoParaDireita(editor.selection, 1);
                    }
                });
            }
        }
    }

    if (((!éModoSublimeText3 || éModoTotal) && éSinalMaior) ||
        (habilitarFechamentoAutomaticoEstruturasLmht && event.contentChanges[0].text === "/")) {
        let linhaTexto = editor.document.lineAt(selecao.start);
        let texto = linhaTexto.text.substring(0, selecao.start.character + 1);
        const resultado = /<([_a-zA-Z][a-zA-Z0-9:\-_.]*)(?:\s+[^<>]*?[^\s/<>=]+?)*?\s?(\/|>)$/.exec(texto);
        if (resultado !== null && ((contagemOcorrencias(resultado[0], "'") % 2 === 0)
            && (contagemOcorrencias(resultado[0], "\"") % 2 === 0) && (contagemOcorrencias(resultado[0], "`") % 2 === 0))) {
            if (resultado[2] === ">") {
                if (estruturasExcluidas.indexOf(resultado[1].toLowerCase()) === -1) {
                    editor.edit((editBuilder) => {
                        editBuilder.insert(posicaoOriginal, "</" + resultado[1] + ">");
                    }).then(() => {
                        editor.selection = new vscode.Selection(posicaoOriginal, posicaoOriginal);
                    });
                }
            } else {
                if (linhaTexto.text.length <= selecao.start.character + 1 || linhaTexto.text[selecao.start.character + 1] !== '>') { // if not typing "/" just before ">", add the ">" after "/"
                    editor.edit((editBuilder) => {
                        if (config.get<boolean>("inserirEspacoAntesDeAutoFechamentoDeEstrutura")) {
                            const spacePosition = posicaoOriginal.translate(0, -1);
                            editBuilder.insert(spacePosition, " ");
                        }
                        editBuilder.insert(posicaoOriginal, ">");
                    });
                }
            }
        }
    }
}

function verificarCaracterFechamentoTag(eventoMudancaConteudo: vscode.TextDocumentContentChangeEvent): boolean {
    return eventoMudancaConteudo.text === ">" || verificarCaracterFechamentoTagNoVSCode_1_8(eventoMudancaConteudo);
}

function verificarCaracterFechamentoTagNoVSCode_1_8(eventoMudancaConteudo: vscode.TextDocumentContentChangeEvent): boolean {
    return eventoMudancaConteudo.text.endsWith(">") && eventoMudancaConteudo.range.start.character === 0
        && eventoMudancaConteudo.range.start.line === eventoMudancaConteudo.range.end.line
        && !eventoMudancaConteudo.range.end.isEqual(new vscode.Position(0, 0));
}

function inserirFechamentoEstrutura(): void {
    let editor = vscode.window.activeTextEditor;
    if (!editor) {
        return;
    }

    let selection = editor.selection;
    let originalPosition = selection.start;
    let config = vscode.workspace.getConfiguration('designliquido-vscode', editor.document.uri);
    let excludedTags = config.get<string[]>("estruturasExcluidas", []);
    let text = editor.document.getText(new vscode.Range(new vscode.Position(0, 0), originalPosition));
    if (text.length > 2) {
        let closeTag = obterEstruturaFechamento(text, excludedTags);
        if (closeTag) {
            editor.edit((editBuilder) => {
                editBuilder.insert(originalPosition, closeTag);
            });
        }
    }
}

function obterProximoCaracter(editor: vscode.TextEditor, posicao: vscode.Position): string {
    let proximaPosicao = posicao.translate(0, 1);
    let texto = editor.document.getText(new vscode.Range(posicao, proximaPosicao));
    return texto;
}

function obterEstruturaFechamento(texto: string, estruturasExcluidas: string[]): string {
    let regex = /<(\/?[_a-zA-Z][a-zA-Z0-9:\-_.]*)(?:\s+[^<>]*?[^\s/<>=]+?)*?\s?>/g;
    let resultado: RegExpExecArray | null = null;
    let pilha: any[] = [];
    while ((resultado = regex.exec(texto)) !== null) {
        let éInicioEstrutura = resultado[1].substr(0, 1) !== "/";
        const estrutura = éInicioEstrutura ? resultado[1] : resultado[1].substr(1);
        if (estruturasExcluidas.indexOf(estrutura.toLowerCase()) === -1) {
            if (éInicioEstrutura) {
                pilha.push(estrutura);
            } else if (pilha.length > 0) {
                let lastTag = pilha[pilha.length - 1];
                if (lastTag === estrutura) {
                    pilha.pop();
                }
            }
        }
    }

    if (pilha.length > 0) {
        let estruturaFechamento = pilha[pilha.length - 1];
        if (texto.substr(texto.length - 2) === "</") {
            return estruturaFechamento + ">";
        }

        if (texto.substr(texto.length - 1) === "<") {
            return "/" + estruturaFechamento + ">";
        }

        return "</" + estruturaFechamento + ">";
    } 
        
    return '';
}

function moverSelecaoParaDireita(selecao: vscode.Selection, shift: number): vscode.Selection {
    let novaPosicao = selecao.active.translate(0, shift);
    let novaSelecao = new vscode.Selection(novaPosicao, novaPosicao);
    return novaSelecao;
}

function contagemOcorrencias(source: string, find: string): number {
    return source.split(find).length - 1;
}
