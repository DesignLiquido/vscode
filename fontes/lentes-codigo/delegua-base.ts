import * as vscode from 'vscode';
import { Declaracao } from '@designliquido/delegua/declaracoes';
import { Classe, FuncaoDeclaracao, InterfaceDeclaracao } from '@designliquido/delegua/declaracoes';

interface ContagemReferencias {
    linha: number;
    nome: string;
    contagem: number;
}

export function declaracoesParaLentes(declaracoes: Declaracao[]): ContagemReferencias[] {
    const alvos: ContagemReferencias[] = [];
    for (const declaracao of declaracoes) {
        if (declaracao instanceof FuncaoDeclaracao && declaracao.simbolo) {
            alvos.push({ linha: declaracao.linha, nome: declaracao.simbolo.lexema, contagem: 0 });
        } else if (declaracao instanceof Classe && declaracao.simbolo) {
            alvos.push({ linha: declaracao.linha, nome: declaracao.simbolo.lexema, contagem: 0 });
            if (declaracao.metodos) {
                for (const metodo of declaracao.metodos) {
                    if (metodo.simbolo) {
                        alvos.push({ linha: metodo.linha, nome: metodo.simbolo.lexema, contagem: 0 });
                    }
                }
            }
        } else if (declaracao instanceof InterfaceDeclaracao && declaracao.simbolo) {
            alvos.push({ linha: declaracao.linha, nome: declaracao.simbolo.lexema, contagem: 0 });
        }
    }
    return alvos;
}

export function criarLenteReferencias(documento: vscode.TextDocument, alvo: ContagemReferencias, comando: vscode.Command): vscode.CodeLens {
    const linha = Math.min(alvo.linha, documento.lineCount - 1);
    const linhaTexto = documento.lineAt(linha);
    return new vscode.CodeLens(
        new vscode.Range(linha, 0, linha, linhaTexto.text.length),
        comando
    );
}
