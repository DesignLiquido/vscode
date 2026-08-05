import * as vscode from 'vscode';

import { expirarResultado } from '@designliquido/delegua-lsp/analise/cache-analise';

import { executarAnalises } from '../analise-codigo';
import {
    detectarProjetoLiquido,
    invalidarCacheDeteccaoProjetoLiquido,
} from './deteccao-projeto-liquido';

export interface OpcoesReanaliseProjetoLiquido {
    arquivosConfiguracao?: vscode.Uri[];
    incluirDocumentosSemProjeto?: boolean;
    motivo?: string;
}

const linguagensAnalisaveis = new Set(['delegua', 'delegua-testes', 'pitugues']);

function obterDiretorioUri(uri: vscode.Uri): vscode.Uri {
    const indiceUltimaBarra = uri.path.lastIndexOf('/');
    const caminho = indiceUltimaBarra <= 0 ? '/' : uri.path.slice(0, indiceUltimaBarra);
    return uri.with({ path: caminho, query: '', fragment: '' });
}

function uriEstaSobRaiz(uri: vscode.Uri, raiz: vscode.Uri): boolean {
    if (uri.scheme !== raiz.scheme || uri.authority !== raiz.authority) {
        return false;
    }

    return raiz.path === '/' || uri.path === raiz.path || uri.path.startsWith(`${raiz.path}/`);
}

export async function reanalisarDocumentosAbertosProjetoLiquido(
    diagnosticos: vscode.DiagnosticCollection,
    opcoes: OpcoesReanaliseProjetoLiquido = {}
): Promise<void> {
    invalidarCacheDeteccaoProjetoLiquido();

    const arquivosConfiguracao = opcoes.arquivosConfiguracao ?? [];
    const configuracoesEsperadas = new Set(arquivosConfiguracao.map(uri => uri.toString()));
    const raizesAfetadas = arquivosConfiguracao.map(obterDiretorioUri);
    const motivo = opcoes.motivo ?? 'contexto-liquido-atualizado';

    for (const documento of vscode.workspace.textDocuments) {
        if (!linguagensAnalisaveis.has(documento.languageId)) {
            continue;
        }

        if (raizesAfetadas.length > 0 && !raizesAfetadas.some(raiz => uriEstaSobRaiz(documento.uri, raiz))) {
            continue;
        }

        const contexto = await detectarProjetoLiquido(documento.uri);

        if (contexto) {
            if (
                configuracoesEsperadas.size > 0 &&
                !configuracoesEsperadas.has(contexto.arquivoConfiguracao.toString())
            ) {
                continue;
            }
        } else if (!opcoes.incluirDocumentosSemProjeto) {
            continue;
        }

        expirarResultado(documento.uri.toString(), motivo);

        try {
            await executarAnalises(documento, diagnosticos);
        } catch (erro) {
            console.error(
                `Erro ao reanalisar documento após alteração do contexto Líquido: ${documento.uri.toString()}`,
                erro
            );
        }
    }
}
