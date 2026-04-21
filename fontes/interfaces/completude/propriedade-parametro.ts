import * as vscode from 'vscode';

export interface PropriedadeParametro {
    nome: string;
    tipo: string;
    documentacao: string;
    tipoCompletude?: vscode.CompletionItemKind;
    propriedadesAninhadas?: PropriedadeParametro[];
}
