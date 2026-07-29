import * as vscode from 'vscode';
import { Declaracao } from '@designliquido/delegua/declaracoes';
import { Var, Const, FuncaoDeclaracao } from '@designliquido/delegua/declaracoes';

export function declaracoesParaDicasInsercao(documento: vscode.TextDocument, declaracoes: Declaracao[]): vscode.InlayHint[] {
    const dicas: vscode.InlayHint[] = [];
    for (const declaracao of declaracoes) {
        if (declaracao instanceof Var && declaracao.simbolo && declaracao.tipo && declaracao.tipoExplicito) {
            const linha = Math.min(declaracao.linha, documento.lineCount - 1);
            const linhaTexto = documento.lineAt(linha);
            const colunaFim = linhaTexto.text.length;
            const hint = new vscode.InlayHint(
                new vscode.Position(linha, colunaFim),
                `: ${declaracao.tipo}`,
                vscode.InlayHintKind.Type
            );
            hint.paddingLeft = true;
            dicas.push(hint);
        }
        if (declaracao instanceof Const && declaracao.simbolo && declaracao.tipo && declaracao.tipoExplicito) {
            const linha = Math.min(declaracao.linha, documento.lineCount - 1);
            const linhaTexto = documento.lineAt(linha);
            const colunaFim = linhaTexto.text.length;
            const hint = new vscode.InlayHint(
                new vscode.Position(linha, colunaFim),
                `: ${declaracao.tipo}`,
                vscode.InlayHintKind.Type
            );
            hint.paddingLeft = true;
            dicas.push(hint);
        }
        if (declaracao instanceof FuncaoDeclaracao && declaracao.simbolo && declaracao.tipo) {
            const linha = Math.min(declaracao.linha, documento.lineCount - 1);
            const linhaTexto = documento.lineAt(linha);
            const colunaFim = linhaTexto.text.length;
            const hint = new vscode.InlayHint(
                new vscode.Position(linha, colunaFim),
                `→ ${declaracao.tipo}`,
                vscode.InlayHintKind.Type
            );
            hint.paddingLeft = true;
            dicas.push(hint);
        }
        if (declaracao instanceof FuncaoDeclaracao && declaracao.funcao && declaracao.funcao.parametros) {
            for (const param of declaracao.funcao.parametros) {
                if (param.nome && param.tipoDado) {
                    const linha = Math.min(param.nome.linha, documento.lineCount - 1);
                    const colunaFim = (param.nome.colunaFim !== undefined ? param.nome.colunaFim : 0) + 1;
                    const hint = new vscode.InlayHint(
                        new vscode.Position(linha, colunaFim),
                        `: ${param.tipoDado}`,
                        vscode.InlayHintKind.Type
                    );
                    hint.paddingLeft = false;
                    dicas.push(hint);
                }
            }
        }
    }
    return dicas;
}
