import * as vscode from 'vscode';

import { funcoesAfirmar, funcoesModuloTestesDelegua, funcoesSubMetodosGrupo, funcoesSubMetodosTeste } from '../bibliotecas/funcoes-testes';
import { DeleguaProvedorAssinaturaMetodos } from './delegua-provedor-assinaturas-metodos';

const regexAfirmar       = /afirmar\.(\w+)\s*\(/g;
const regexDireto        = /\b(grupo|teste|lancarErro|antesDeCada|antesDeTodos|depoisDeCada|depoisDeTodos)\s*\(/g;
const regexTesteMetodo   = /\bteste\.(pular|apenas)\s*\(/g;
const regexGrupoMetodo   = /\bgrupo\.(pular|apenas)\s*\(/g;

export class DeleguaTestesProvedorAssinaturaMetodos extends DeleguaProvedorAssinaturaMetodos {
    override provideSignatureHelp(
        documento: vscode.TextDocument,
        posicao: vscode.Position,
        token: vscode.CancellationToken,
        context: vscode.SignatureHelpContext
    ): vscode.ProviderResult<vscode.SignatureHelp> {
        const textoAntesCursor = documento.lineAt(posicao).text.substring(0, posicao.character);
        const parametroAtivo = this.calcularParametroAtivo(textoAntesCursor);

        // afirmar.X( — usa a última ocorrência para suportar aninhamento
        const matchesAfirmar = [...textoAntesCursor.matchAll(regexAfirmar)];
        const matchAfirmar = matchesAfirmar.at(-1);
        if (matchAfirmar) {
            const funcao = funcoesAfirmar.find(f => f.nome === matchAfirmar[1]);
            if (funcao) {
                return this.construirObjetoAssinatura(funcao, parametroAtivo);
            }
        }

        // teste.pular( / teste.apenas(
        const matchesTesteMetodo = [...textoAntesCursor.matchAll(regexTesteMetodo)];
        const matchTesteMetodo = matchesTesteMetodo.at(-1);
        if (matchTesteMetodo) {
            const funcao = funcoesSubMetodosTeste.find(f => f.nome === matchTesteMetodo[1]);
            if (funcao?.assinaturas?.length) {
                return this.construirObjetoAssinatura(funcao, parametroAtivo);
            }
        }

        // grupo.pular( / grupo.apenas(
        const matchesGrupoMetodo = [...textoAntesCursor.matchAll(regexGrupoMetodo)];
        const matchGrupoMetodo = matchesGrupoMetodo.at(-1);
        if (matchGrupoMetodo) {
            const funcao = funcoesSubMetodosGrupo.find(f => f.nome === matchGrupoMetodo[1]);
            if (funcao?.assinaturas?.length) {
                return this.construirObjetoAssinatura(funcao, parametroAtivo);
            }
        }

        // grupo( / teste( / lancarErro( / antesDeCada( / ...
        const matchesDireto = [...textoAntesCursor.matchAll(regexDireto)];
        const matchDireto = matchesDireto.at(-1);
        if (matchDireto) {
            const funcao = funcoesModuloTestesDelegua.find(f => f.nome === matchDireto[1]);
            if (funcao?.assinaturas?.length) {
                return this.construirObjetoAssinatura(funcao, parametroAtivo);
            }
        }

        return super.provideSignatureHelp(documento, posicao, token, context);
    }
}
