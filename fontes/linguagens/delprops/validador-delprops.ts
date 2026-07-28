import * as vscode from 'vscode';
import { analisar, validar, registrar, obterTodos, ContribuicaoEsquema, DefinicaoPropriedade } from '@designliquido/delprops';
import * as liquido from '@designliquido/delprops/liquido';

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
): Map<string, readonly DefinicaoPropriedade[]> {
    const aplanado = new Map<string, readonly DefinicaoPropriedade[]>();
    for (const [ns, contribuicoes] of todos) {
        aplanado.set(ns, contribuicoes.flatMap(c => c.definicoes));
    }
    return aplanado;
}

function verificarPropriedadesAusentes(
    propriedades: readonly { chave: string }[],
    esquemas: ReadonlyMap<string, readonly DefinicaoPropriedade[]>
): string[] {
    const avisos: string[] = [];

    for (const [ns, definicoes] of esquemas) {
        const obrigatorias = definicoes.filter(d => !d.padrao);
        if (obrigatorias.length === 0) continue;

        if (ns === 'liquido.dados') {
            const sources = new Map<string, Set<string>>();
            for (const prop of propriedades) {
                if (!prop.chave.startsWith('liquido.dados.')) continue;
                const restante = prop.chave.slice('liquido.dados.'.length);
                const ponto = restante.indexOf('.');
                if (ponto === -1) continue;
                const nome = restante.slice(0, ponto);
                const propName = restante.slice(ponto + 1);
                if (!sources.has(nome)) sources.set(nome, new Set());
                sources.get(nome)!.add(propName);
            }

            for (const [nome, presentes] of sources) {
                for (const req of obrigatorias) {
                    if (!presentes.has(req.nome)) {
                        avisos.push(`Propriedade '${req.nome}' obrigatória ausente em 'liquido.dados.${nome}'.`);
                    }
                }
            }
        } else {
            const preenchidas = new Set<string>();
            for (const prop of propriedades) {
                if (prop.chave.startsWith(ns + '.')) {
                    preenchidas.add(prop.chave.slice(ns.length + 1));
                }
            }

            for (const req of obrigatorias) {
                if (!preenchidas.has(req.nome)) {
                    avisos.push(`Propriedade '${ns}.${req.nome}' obrigatória ausente.`);
                }
            }
        }
    }

    return avisos;
}

export function validarDelprops(documento: vscode.TextDocument): vscode.Diagnostic[] {
    const diagnosticos: vscode.Diagnostic[] = [];

    const linhas: string[] = [];
    for (let i = 0; i < documento.lineCount; i++) {
        linhas.push(removerComentarioLinha(documento.lineAt(i).text));
    }
    const conteudo = linhas.join('\n');

    const parseResult = analisar(conteudo);
    for (const erro of parseResult.erros) {
        diagnosticos.push(new vscode.Diagnostic(
            new vscode.Range(erro.linha - 1, 0, erro.linha - 1, Number.MAX_VALUE),
            erro.mensagem,
            vscode.DiagnosticSeverity.Error
        ));
    }

    const esquemasAplanados = aplanarEsquemas(obterTodos());
    const validateResult = validar(parseResult.propriedades, esquemasAplanados);
    for (const erro of validateResult.erros) {
        diagnosticos.push(new vscode.Diagnostic(
            new vscode.Range(erro.linha - 1, 0, erro.linha - 1, Number.MAX_VALUE),
            erro.mensagem,
            vscode.DiagnosticSeverity.Error
        ));
    }
    for (const aviso of validateResult.avisos) {
        diagnosticos.push(new vscode.Diagnostic(
            new vscode.Range(aviso.linha - 1, 0, aviso.linha - 1, Number.MAX_VALUE),
            aviso.mensagem,
            vscode.DiagnosticSeverity.Warning
        ));
    }

    for (const msg of verificarPropriedadesAusentes(parseResult.propriedades, esquemasAplanados)) {
        diagnosticos.push(new vscode.Diagnostic(
            new vscode.Range(0, 0, 0, 0),
            msg,
            vscode.DiagnosticSeverity.Warning
        ));
    }

    return diagnosticos;
}
