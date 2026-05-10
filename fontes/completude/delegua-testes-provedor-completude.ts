import * as vscode from 'vscode';

import { funcoesAfirmar, funcoesModuloTestesDelegua } from '../bibliotecas/funcoes-testes';
import { FuncaoNativaOuMetodoPrimitiva } from '../bibliotecas/tipos';
import { ParametroDetectado } from '../interfaces/completude';
import { DeleguaProvedorCompletude } from './delegua-provedor-completude';

function criarItemCompletude(funcao: FuncaoNativaOuMetodoPrimitiva): vscode.CompletionItem {
    const temParametros = (funcao.assinaturas?.length ?? 0) > 0 && funcao.assinaturas![0].parametros.length > 0;
    const kind = funcao.nome === 'afirmar'
        ? vscode.CompletionItemKind.Module
        : vscode.CompletionItemKind.Function;
    const item = new vscode.CompletionItem(funcao.nome, kind);
    item.documentation = new vscode.MarkdownString(funcao.documentacao);
    if (temParametros) {
        item.insertText = new vscode.SnippetString(`${funcao.nome}($0)`);
    }
    return item;
}

export class DeleguaTestesProvedorCompletude extends DeleguaProvedorCompletude {
    protected override completudesParaDelegua(
        textoAntesPosicao: string,
        palavraAntesPonto: string | null,
        parametrosDetectados: ParametroDetectado[],
        declaracaoCorrespondente: { nome: string; tipo: string } | undefined
    ): vscode.CompletionItem[] {
        if (textoAntesPosicao.trimEnd().endsWith('.')) {
            // afirmar. → completude das assertivas
            if (palavraAntesPonto === 'afirmar') {
                return funcoesAfirmar.map(criarItemCompletude);
            }
            
            return super.completudesParaDelegua(
                textoAntesPosicao,
                palavraAntesPonto,
                parametrosDetectados,
                declaracaoCorrespondente
            );
        }

        // Escopo global: inclui funções do módulo de testes
        return [
            ...funcoesModuloTestesDelegua.map(criarItemCompletude),
            ...super.completudesParaDelegua(
                textoAntesPosicao,
                palavraAntesPonto,
                parametrosDetectados,
                declaracaoCorrespondente
            )
        ];
    }
}
