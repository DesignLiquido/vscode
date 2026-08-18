import * as vscode from 'vscode';
import { analisar, validar, registrar, obterTodos, ContribuicaoEsquema, DefinicaoPropriedadeInterface, liquido } from '@designliquido/delprops';

registrar('liquido', '@designliquido/vscode', [...liquido.arquetipo, ...liquido.linguagem]);
registrar('liquido.aplicacao', '@designliquido/vscode', liquido.aplicacao);
registrar('liquido.roteador', '@designliquido/vscode', liquido.roteador);
registrar('liquido.dados', '@designliquido/vscode', liquido.dados);
registrar('liquido.autenticacao', '@designliquido/vscode', liquido.autenticacao);
registrar('liquido.estilos', '@designliquido/vscode', liquido.estilos);

function removerComentarioLinha(linha: string): string {
    let emAspasSimples = false;
    let emAspasDuplas = false;
    for (let i = 0; i < linha.length - 1; i++) {
        const c = linha[i];
        if (c === "'" && !emAspasDuplas) {
            emAspasSimples = !emAspasSimples;
        } else if (c === '"' && !emAspasSimples) {
            emAspasDuplas = !emAspasDuplas;
        } else if (c === '/' && linha[i + 1] === '/' && !emAspasSimples && !emAspasDuplas) {
            return linha.slice(0, i);
        }
    }
    return linha;
}

function aplanarEsquemas(
    todos: ReadonlyMap<string, readonly ContribuicaoEsquema[]>
): Map<string, DefinicaoPropriedadeInterface[]> {
    const aplanado = new Map<string, DefinicaoPropriedadeInterface[]>();
    for (const [ns, contribuicoes] of todos) {
        aplanado.set(ns, [...contribuicoes.flatMap(c => c.definicoes)]);
    }
    return aplanado;
}

export function validarDelprops(documento: vscode.TextDocument): vscode.Diagnostic[] {
    const diagnosticos: vscode.Diagnostic[] = [];
    const linhas: string[] = [];
    for (let i = 0; i < documento.lineCount; i++) {
        linhas.push(removerComentarioLinha(documento.lineAt(i).text));
    }
    const conteudo = linhas.join('\n');

    const resultadoCompreensao = analisar(conteudo);
    for (const erroCompreensao of resultadoCompreensao.erros) {
        const numeroLinha = Math.max(0, erroCompreensao.linha - 1);
        if (numeroLinha < documento.lineCount) {
            diagnosticos.push(new vscode.Diagnostic(
                new vscode.Range(numeroLinha, 0, numeroLinha, Number.MAX_VALUE),
                erroCompreensao.mensagem,
                vscode.DiagnosticSeverity.Error
            ));
        }
    }

    const validateResult = validar(resultadoCompreensao.propriedades, aplanarEsquemas(obterTodos()));
    for (const erro of validateResult.erros) {
        const numeroLinha = Math.max(0, erro.linha - 1);
        if (numeroLinha < documento.lineCount) {
            diagnosticos.push(new vscode.Diagnostic(
                new vscode.Range(numeroLinha, 0, numeroLinha, Number.MAX_VALUE),
                erro.mensagem,
                vscode.DiagnosticSeverity.Error
            ));
        }
    }
    for (const aviso of validateResult.avisos) {
        const numeroLinha = Math.max(0, aviso.linha - 1);
        if (numeroLinha < documento.lineCount) {
            diagnosticos.push(new vscode.Diagnostic(
                new vscode.Range(numeroLinha, 0, numeroLinha, Number.MAX_VALUE),
                aviso.mensagem,
                vscode.DiagnosticSeverity.Warning
            ));
        }
    }

    return diagnosticos;
}
