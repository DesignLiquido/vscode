import * as vscode from 'vscode';

import { funcoesAfirmar, funcoesModuloTestesDelegua, funcoesSubMetodosGrupo, funcoesSubMetodosTeste } from '../bibliotecas/funcoes-testes';
import { FuncaoNativaOuMetodoPrimitiva } from '../bibliotecas/tipos';
import { DeleguaProvedorDocumentacaoEmEditor } from './delegua-provedor-documentacao-em-editor';

const nomesModuleTestes = new Set(funcoesModuloTestesDelegua.map(f => f.nome));

function criarHover(funcao: FuncaoNativaOuMetodoPrimitiva): vscode.Hover {
    const doc = new vscode.MarkdownString(funcao.documentacao);
    if (funcao.exemploCodigo) {
        doc.appendCodeblock(funcao.exemploCodigo, 'delegua');
    }
    return new vscode.Hover(doc);
}

export class DeleguaTestesProvedorDocumentacaoEmEditor extends DeleguaProvedorDocumentacaoEmEditor {
    override async provideHover(
        documento: vscode.TextDocument,
        posicao: vscode.Position,
        token: vscode.CancellationToken
    ): Promise<vscode.Hover | undefined> {
        const intervalo = documento.getWordRangeAtPosition(posicao);
        if (!intervalo) {
            return super.provideHover(documento, posicao, token);
        }

        const palavra = documento.getText(intervalo);
        const textoAntesPalavra = documento.lineAt(posicao).text
            .substring(0, intervalo.start.character)
            .trimEnd();

        // afirmar.X → documentação da assertiva
        if (textoAntesPalavra.endsWith('afirmar.')) {
            const funcao = funcoesAfirmar.find(f => f.nome === palavra);
            if (funcao) {
                return criarHover(funcao);
            }
        }

        // teste.pular / teste.apenas → documentação do sub-método
        if (textoAntesPalavra.endsWith('teste.')) {
            const funcao = funcoesSubMetodosTeste.find(f => f.nome === palavra);
            if (funcao) {
                return criarHover(funcao);
            }
        }

        // grupo.pular / grupo.apenas → documentação do sub-método
        if (textoAntesPalavra.endsWith('grupo.')) {
            const funcao = funcoesSubMetodosGrupo.find(f => f.nome === palavra);
            if (funcao) {
                return criarHover(funcao);
            }
        }

        // grupo / teste / lancarErro / afirmar / hooks sem ponto anterior → documentação do módulo
        if (!textoAntesPalavra.endsWith('.') && nomesModuleTestes.has(palavra)) {
            const funcao = funcoesModuloTestesDelegua.find(f => f.nome === palavra);
            if (funcao) {
                return criarHover(funcao);
            }
        }

        return super.provideHover(documento, posicao, token);
    }
}
