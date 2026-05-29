import * as vscode from 'vscode';

import { Classe, Const, Declaracao, Var } from '@designliquido/delegua/declaracoes';

import { obterResultado } from '../analise-codigo/cache-analise';
import { obterDefinicoesPorContexto } from '../analise-codigo/cache-definicoes';

/**
 * Provedor de definição para Delégua, permitindo que os usuários naveguem até a definição de 
 * símbolos no código-fonte.
 */
export class DeleguaProvedorDefinicao implements vscode.DefinitionProvider {
    private normalizarCaminho(caminho: string): string {
        return caminho.replace(/\\/g, '/').toLowerCase();
    }

    private resolverCaminho(base: string, relativo: string): string {
        const partes = base.slice(0, base.lastIndexOf('/')).replace(/\\/g, '/').split('/');
        for (const parte of relativo.replace(/\\/g, '/').split('/')) {
            if (parte === '..') { partes.pop(); }
            else if (parte && parte !== '.') { partes.push(parte); }
        }
        return partes.join('/');
    }

    private obterDefinicoesEmCache(): string[] {
        const todosTipos = {
            ...obterDefinicoesPorContexto('normal'),
            ...obterDefinicoesPorContexto('liquido'),
        };

        return Array.from(new Set(
            Object.values(todosTipos)
                .map((d: any) => d.caminhoArquivoDefinicao as string | undefined)
                .filter((c): c is string => Boolean(c))
        ));
    }

    private obterUriDeclaracao(declaracao: Declaracao, uriPadrao: vscode.Uri): vscode.Uri {
        const caminhoArquivoDefinicao = (declaracao as any).caminhoArquivoDefinicao as string | undefined;
        if (caminhoArquivoDefinicao) {
            return vscode.Uri.file(caminhoArquivoDefinicao);
        }

        return uriPadrao;
    }

    private localizarEmDeclaracoes(
        declaracoes: Declaracao[],
        palavra: string,
        uri: vscode.Uri
    ): vscode.Location | undefined {
        for (const declaracao of declaracoes) {
            const uriDeclaracao = this.obterUriDeclaracao(declaracao, uri);
            const simbolo = (declaracao as any).simbolo;
            if (simbolo?.lexema === palavra) {
                const linha = simbolo.linha - 1;
                const coluna = simbolo.colunaInicio ?? 0;
                return new vscode.Location(uriDeclaracao, new vscode.Position(linha, coluna));
            }

            if (declaracao instanceof Classe) {
                for (const metodo of declaracao.metodos) {
                    if (metodo.simbolo.lexema === palavra) {
                        const linha = metodo.simbolo.linha - 1;
                        const coluna = metodo.simbolo.colunaInicio ?? 0;
                        return new vscode.Location(uriDeclaracao, new vscode.Position(linha, coluna));
                    }
                }
            }
        }

        return undefined;
    }

    private localizarSimboloImportado(
        declaracoes: Declaracao[],
        palavra: string,
        linhaTexto: string,
        uriDocumento: vscode.Uri
    ): vscode.Location | undefined {
        const correspondencia = linhaTexto.match(/importar\s*\{([^}]*)\}\s*de\s*(["'])([^"']+)\2/);
        if (!correspondencia) {
            return undefined;
        }

        const simbolosImportados = correspondencia[1].split(',').map(s => s.trim());
        if (!simbolosImportados.includes(palavra)) {
            return undefined;
        }

        const caminhoRelativo = correspondencia[3];
        
        // Resolve o caminho importado para um caminho absoluto
        let caminhoAbsoluto: string;
        
        if (caminhoRelativo.startsWith('./') || caminhoRelativo.startsWith('../') || caminhoRelativo.includes('/')) {
            caminhoAbsoluto = this.resolverCaminho(uriDocumento.path, caminhoRelativo);
        } else {
            // Módulo npm bare (ex: 'liquido')
            const pastaDoc = uriDocumento.path.slice(0, uriDocumento.path.lastIndexOf('/'));
            let tentativa = `${pastaDoc}/node_modules/${caminhoRelativo}`;
            if (!this.caminhoExiste(tentativa)) {
                tentativa = `${tentativa}.delegua`;
            }
            caminhoAbsoluto = tentativa;
        }

        const caminhosCandidatos = new Set<string>([
            this.normalizarCaminho(caminhoAbsoluto),
            this.normalizarCaminho(`${caminhoAbsoluto}.delegua`)
        ]);

        if (!caminhoRelativo.startsWith('./') && !caminhoRelativo.startsWith('../')) {
            const fragmentoNodeModules = this.normalizarCaminho(`/node_modules/${caminhoRelativo}/`);
            for (const definicaoCache of this.obterDefinicoesEmCache()) {
                const caminhoDefinicaoNormalizado = this.normalizarCaminho(definicaoCache);
                if (caminhoDefinicaoNormalizado.includes(fragmentoNodeModules)) {
                    caminhosCandidatos.add(caminhoDefinicaoNormalizado);
                }
            }
        }

        // Procura a declaração correspondente
        const declaracao = declaracoes.find(d => {
            const simbolo = (d as any).simbolo;
            const caminho = (d as any).caminhoArquivoDefinicao as string | undefined;
            
            if (simbolo?.lexema !== palavra) {
                return false;
            }

            // Se não tem caminho definido, pula
            if (!caminho) {
                return false;
            }

            // Normaliza ambos os caminhos para comparação robusta
                 const caminhoNormalizado = this.normalizarCaminho(caminho);
                 return caminhosCandidatos.has(caminhoNormalizado);
        });

        if (!declaracao) {
            return undefined;
        }

        const uriDeclaracao = this.obterUriDeclaracao(declaracao, uriDocumento);
        const simbolo = (declaracao as any).simbolo;
        return new vscode.Location(uriDeclaracao, new vscode.Position(Number(simbolo.linha) - 1, simbolo.colunaInicio ?? 0));
    }

    /**
     * Verifica se um caminho existe, ignorando extensões (.delegua/.egua)
     */
    private caminhoExiste(caminhoOuPrefixo: string): boolean {
        // Método simplificado - em produção, usaria fs.existsSync
        // Por enquanto apenas retorna true como fallback
        return true;
    }

    private obterTipoVariavel(declaracoes: Declaracao[], nomeVariavel: string): string | undefined {
        for (const declaracao of declaracoes) {
            const simbolo = (declaracao as any).simbolo;
            if (simbolo?.lexema !== nomeVariavel) {
                continue;
            }
            if (declaracao instanceof Var || declaracao instanceof Const) {
                return (declaracao as any).tipo as string | undefined;
            }
        }
        return undefined;
    }

    private localizarMetodoEmClasse(
        declaracoes: Declaracao[],
        nomeClasse: string,
        nomeMetodo: string,
        uri: vscode.Uri
    ): vscode.Location | undefined {
        for (const declaracao of declaracoes) {
            if (!(declaracao instanceof Classe)) {
                continue;
            }
            const simbolo = (declaracao as any).simbolo;
            if (simbolo?.lexema !== nomeClasse) {
                continue;
            }

            const metodo = declaracao.metodos.find(m => m.simbolo.lexema === nomeMetodo);
            if (!metodo) {
                return undefined;
            }

            const uriDeclaracao = this.obterUriDeclaracao(declaracao, uri);
            const linha = Number(metodo.simbolo.linha) - 1;
            const coluna = metodo.simbolo.colunaInicio ?? 0;
            return new vscode.Location(uriDeclaracao, new vscode.Position(linha, coluna));
        }
        return undefined;
    }

    private localizarPropriedadeClasse(
        declaracoes: Declaracao[],
        palavra: string,
        linhaAtual: number,
        uri: vscode.Uri
    ): vscode.Location | undefined {
        const classesLocais = declaracoes.filter(
            d => d instanceof Classe && !(d as any).caminhoArquivoDefinicao
        ) as Classe[];

        const classesAnteriores = classesLocais.filter(c => Number(c.simbolo.linha) <= linhaAtual);
        if (!classesAnteriores.length) {
            return undefined;
        }

        const classeAtual = classesAnteriores.reduce((prev, curr) =>
            Number(curr.simbolo.linha) > Number(prev.simbolo.linha) ? curr : prev
        );

        const propriedade = classeAtual.propriedades.find(p => p.nome.lexema === palavra);
        if (!propriedade) {
            return undefined;
        }

        const linha = Number(propriedade.nome.linha) - 1;
        const coluna = propriedade.nome.colunaInicio ?? 0;
        return new vscode.Location(uri, new vscode.Position(linha, coluna));
    }

    provideDefinition(
        documento: vscode.TextDocument,
        posicao: vscode.Position,
        _token: vscode.CancellationToken
    ): vscode.ProviderResult<vscode.Definition> {
        const intervaloWord = documento.getWordRangeAtPosition(posicao, /[_a-zA-Z0-9]+/);
        if (!intervaloWord) {
            return undefined;
        }

        const palavra = documento.getText(intervaloWord);
        const resultado = obterResultado(documento.uri.toString());
        const declaracoes = [
            ...(resultado?.declaracoesPreCarregadas || []),
            ...(resultado?.avaliadorSintatico?.declaracoes || [])
        ];

        if (!declaracoes.length) {
            return undefined;
        }

        const linhaTexto = documento.lineAt(posicao).text;

        const localizacaoImportado = this.localizarSimboloImportado(declaracoes, palavra, linhaTexto, documento.uri);
        if (localizacaoImportado) {
            return localizacaoImportado;
        }

        const textoAntesPalavra = linhaTexto.substring(0, intervaloWord.start.character);
        if (textoAntesPalavra.trimEnd().endsWith('isto.')) {
            const localizacao = this.localizarPropriedadeClasse(
                declaracoes,
                palavra,
                posicao.line + 1,
                documento.uri
            );
            if (localizacao) {
                return localizacao;
            }
        }

        const correspondenciaObjeto = textoAntesPalavra.match(/(\w+)\s*\.\s*$/);
        if (correspondenciaObjeto && correspondenciaObjeto[1] !== 'isto') {
            const nomeObjeto = correspondenciaObjeto[1];
            const tipoObjeto = this.obterTipoVariavel(declaracoes, nomeObjeto);
            if (tipoObjeto) {
                return this.localizarMetodoEmClasse(declaracoes, tipoObjeto, palavra, documento.uri);
            }
        }

        return this.localizarEmDeclaracoes(
            declaracoes,
            palavra,
            documento.uri
        );
    }
}
