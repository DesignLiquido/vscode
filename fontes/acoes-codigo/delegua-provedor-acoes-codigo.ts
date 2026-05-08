import * as vscode from 'vscode';

import { obterResultado } from '../analise-codigo/cache-analise';
import { CorrecaoSugeridaInterface } from '@designliquido/delegua/interfaces';
import { CorrecaoImplementacaoInterface, MembroInterfaceFaltandoInterface } from '@designliquido/delegua/interfaces/avaliador-sintatico';

const CODIGOS_SIMBOLO_AUSENTE = new Set<string>([
    'SEMANTICO_TIPO_DESCONHECIDO',
    'SEMANTICO_VARIAVEL_NAO_DECLARADA',
]);

/**
 * Provedor de ações de código para Delégua.
 */
export class DeleguaProvedorAcoesCodigo implements vscode.CodeActionProvider {
    public static readonly tiposAcoesRapidas = [
        vscode.CodeActionKind.QuickFix
    ];

    private static readonly regexImport = /^\s*importar\s*\{[^}]*\}\s*de\s*['"][^'"]+['"]\s*;?\s*$/;
    private static readonly regexLinhaVazia = /^\s*$/;
    private static readonly regexIdentificador = /\b[A-Za-z_][A-Za-z0-9_]*\b/g;

    async provideCodeActions(
        documento: vscode.TextDocument,
        range: vscode.Range | vscode.Selection,
        context: vscode.CodeActionContext,
        token: vscode.CancellationToken
    ): Promise<vscode.CodeAction[] | undefined> {
        const resultado = obterResultado(documento.uri.toString());
        if (!resultado?.analisadorSemantico?.diagnosticos) {
            return;
        }

        const acoes: vscode.CodeAction[] = [];

        for (const diagnosticoVscode of context.diagnostics) {
            // Encontra um diagnóstico semântico correspondente ao diagnóstico do VSCode, verificando se há correções disponíveis.
            const diagnosticoSemantico: { correcoes: CorrecaoSugeridaInterface[] } | undefined = resultado.analisadorSemantico.diagnosticos.find(
                d => d.mensagem === diagnosticoVscode.message && d.correcoes?.length
            ) as { correcoes: CorrecaoSugeridaInterface[] } | undefined;

            if (diagnosticoSemantico?.correcoes) {
                for (const correcao of diagnosticoSemantico.correcoes) {
                    const numeroLinha = correcao.linha - 1;
                    const linhaTexto = documento.lineAt(numeroLinha).text;
                    const colunaInicio = linhaTexto.indexOf(correcao.textoOriginal, correcao.colunaInicio);
                    if (colunaInicio < 0) {
                        continue;
                    }

                    const acao = new vscode.CodeAction(
                        correcao.titulo,
                        vscode.CodeActionKind.QuickFix
                    );

                    acao.edit = new vscode.WorkspaceEdit();
                    acao.edit.replace(
                        documento.uri,
                        new vscode.Range(
                            numeroLinha, colunaInicio,
                            numeroLinha, colunaInicio + correcao.textoOriginal.length
                        ),
                        correcao.textoSubstituto
                    );

                    acao.diagnostics = [diagnosticoVscode];
                    acao.isPreferred = true;
                    acoes.push(acao);
                }
            }
        }

        // Correções rápidas para implementação de interfaces (erros do avaliador sintático).
        const errosSintaticos = resultado.avaliadorSintatico?.erros || [];
        // Agrupa correções de interface por classe+interface para evitar ações duplicadas.
        const correcoesPorInterface = new Map<string, { correcao: CorrecaoImplementacaoInterface; diagnosticos: vscode.Diagnostic[] }>();

        for (const diagnosticoVscode of context.diagnostics) {
            const erroSintatico = errosSintaticos.find(
                e => e.message === diagnosticoVscode.message && e.correcaoSugerida?.tipo === 'implementar-interface'
            );

            if (erroSintatico?.correcaoSugerida) {
                const correcao = erroSintatico.correcaoSugerida as CorrecaoImplementacaoInterface;
                const chave = `${correcao.nomeClasse}::${correcao.nomeInterface}`;

                if (!correcoesPorInterface.has(chave)) {
                    correcoesPorInterface.set(chave, { correcao, diagnosticos: [] });
                }
                correcoesPorInterface.get(chave)!.diagnosticos.push(diagnosticoVscode);
            }
        }

        for (const { correcao, diagnosticos } of correcoesPorInterface.values()) {
            const linhaInsercao = correcao.linhaFinalClasse - 1;
            const membrosOrdenados = [...correcao.membrosFaltando].sort((a, b) => {
                if (a.tipo === b.tipo) return 0;
                return a.tipo === 'propriedade' ? -1 : 1;
            });
            const esbocoCodigo = membrosOrdenados.map(m => this.gerarEsbocoMembro(m)).join('\n');

            const acao = new vscode.CodeAction(
                `Implementar membros de '${correcao.nomeInterface}' em '${correcao.nomeClasse}'`,
                vscode.CodeActionKind.QuickFix
            );

            acao.edit = new vscode.WorkspaceEdit();
            acao.edit.insert(
                documento.uri,
                new vscode.Position(linhaInsercao, 0),
                esbocoCodigo + '\n'
            );

            acao.diagnostics = diagnosticos;
            acao.isPreferred = true;
            acoes.push(acao);
        }

        for (const diagnosticoVscode of context.diagnostics) {
            const acoesImportacao = await this.criarAcoesRapidasImportacao(documento, diagnosticoVscode, resultado);
            if (acoesImportacao.length) {
                acoes.push(...acoesImportacao);
            }
        }

        // Quick Fix para implementação de métodos ausentes detectados pelo analisador semântico.
        for (const diagnosticoVscode of context.diagnostics) {
            const diagnosticoSemantico = (resultado?.analisadorSemantico?.diagnosticos || []).find(
                (d: any) => d.mensagem === diagnosticoVscode.message && d.correcaoMetodo?.tipo === 'implementar-metodo'
            );
            if (!diagnosticoSemantico?.correcaoMetodo) {
                continue;
            }

            const correcaoMetodo = diagnosticoSemantico.correcaoMetodo;
            const docAlvo = await this.encontrarDocumentoClasse(documento, correcaoMetodo, resultado);
            if (!docAlvo) {
                continue;
            }

            const linhaFechamento = this.encontrarLinhaFechamentoClasse(docAlvo, correcaoMetodo.linhaDeclaracaoClasse);
            if (linhaFechamento < 0) {
                continue;
            }

            const esbocoMetodo = this.gerarEsbocoMembro({ tipo: 'metodo', nome: correcaoMetodo.nomeMetodo });
            const acao = new vscode.CodeAction(
                `Implementar método '${correcaoMetodo.nomeMetodo}' na classe '${correcaoMetodo.nomeClasse}'`,
                vscode.CodeActionKind.QuickFix
            );

            acao.edit = new vscode.WorkspaceEdit();
            acao.edit.insert(docAlvo.uri, new vscode.Position(linhaFechamento, 0), esbocoMetodo + '\n');
            acao.diagnostics = [diagnosticoVscode];
            acao.isPreferred = false;
            acoes.push(acao);
        }

        // Em alguns cenários (ex.: comando manual de Quick Fix), o contexto pode vir sem diagnósticos.
        if (!context.diagnostics?.length) {
            const acoesSemDiagnostico = await this.criarAcoesRapidasImportacaoSemDiagnostico(documento, range, resultado);
            if (acoesSemDiagnostico.length) {
                acoes.push(...acoesSemDiagnostico);
            }
        }

        return acoes;
    }

    private async criarAcoesRapidasImportacaoSemDiagnostico(
        documento: vscode.TextDocument,
        range: vscode.Range | vscode.Selection,
        resultado: any
    ): Promise<vscode.CodeAction[]> {
        const linhaAtual = (range as any)?.start?.line;
        if (typeof linhaAtual !== 'number') {
            return [];
        }

        if (linhaAtual < 0 || linhaAtual >= documento.lineCount) {
            return [];
        }

        const textoLinha = documento.lineAt(linhaAtual).text;
        const identificadores = [...textoLinha.matchAll(DeleguaProvedorAcoesCodigo.regexIdentificador)]
            .map(c => c[0])
            .filter(Boolean)
            .filter(i => i[0] === i[0].toUpperCase());

        if (!identificadores.length) {
            return [];
        }

        return this.criarAcoesImportacaoParaSimbolo(documento, identificadores[0], undefined, resultado);
    }

    private async criarAcoesRapidasImportacao(
        documento: vscode.TextDocument,
        diagnosticoVscode: vscode.Diagnostic,
        resultado: any
    ): Promise<vscode.CodeAction[]> {
        const diagnosticoSemantico = (resultado?.analisadorSemantico?.diagnosticos || []).find(
            (d: any) => d.mensagem === diagnosticoVscode.message
        );

        // Prefer structured codigoDiagnostico if available.
        if (diagnosticoSemantico?.codigoDiagnostico) {
            if (!CODIGOS_SIMBOLO_AUSENTE.has(diagnosticoSemantico.codigoDiagnostico)) {
                return [];
            }

            const simboloAusente = diagnosticoSemantico.simboloRelacionado?.lexema
                ?? this.extrairSimboloAusente(documento, diagnosticoVscode);

            if (!simboloAusente) {
                return [];
            }

            return this.criarAcoesImportacaoParaSimbolo(documento, simboloAusente, diagnosticoVscode, resultado);
        }

        // Fallback: message-pattern matching for diagnostics without structured codes.
        if (!this.eDiagnosticoSimboloAusente(diagnosticoVscode.message)) {
            return [];
        }

        const simboloAusente = this.extrairSimboloAusente(documento, diagnosticoVscode);
        if (!simboloAusente) {
            return [];
        }

        return this.criarAcoesImportacaoParaSimbolo(documento, simboloAusente, diagnosticoVscode, resultado);
    }

    private async criarAcoesImportacaoParaSimbolo(
        documento: vscode.TextDocument,
        simboloAusente: string,
        diagnosticoVscode: vscode.Diagnostic | undefined,
        resultado: any
    ): Promise<vscode.CodeAction[]> {

        const caminhosCandidatos = await this.descobrirCaminhosImportacao(documento, simboloAusente, resultado);
        if (!caminhosCandidatos.length) {
            return [];
        }

        const acoes: vscode.CodeAction[] = [];
        for (const caminhoImportacao of caminhosCandidatos) {
            const linhaImportacao = `importar { ${simboloAusente} } de "${caminhoImportacao}"`;
            if (this.documentoJaPossuiImportacao(documento, linhaImportacao)) {
                continue;
            }

            const acao = new vscode.CodeAction(
                `Adicionar importação de '${simboloAusente}'`,
                vscode.CodeActionKind.QuickFix
            );

            acao.edit = new vscode.WorkspaceEdit();
            const posicaoInsercao = this.obterPosicaoInsercaoImportacao(documento);
            const prefixo = posicaoInsercao.line > 0 ? '\n' : '';
            const sufixo = '\n';

            acao.edit.insert(
                documento.uri,
                posicaoInsercao,
                `${prefixo}${linhaImportacao}${sufixo}`
            );

            acao.diagnostics = diagnosticoVscode ? [diagnosticoVscode] : [];
            acao.isPreferred = true;
            acoes.push(acao);
        }

        return acoes;
    }

    private eDiagnosticoSimboloAusente(mensagem: string): boolean {
        const normalizada = mensagem
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .toLowerCase();

        return normalizada.includes('nao declarad') ||
            normalizada.includes('nao definid') ||
            normalizada.includes('nao encontrad') ||
            normalizada.includes('tipo de dados desconhecido') ||
            normalizada.includes('undefined') ||
            normalizada.includes('undeclared');
    }

    private extrairSimboloAusente(
        documento: vscode.TextDocument,
        diagnosticoVscode: vscode.Diagnostic
    ): string | undefined {
        const mensagem = diagnosticoVscode.message || '';
        const comAspas = mensagem.match(/["'`“”]([A-Za-z_][A-Za-z0-9_]*)["'`“”]/);
        if (comAspas?.[1]) {
            return comAspas[1];
        }

        const linhaDiagnostico = (diagnosticoVscode as any)?.range?.start?.line;
        if (typeof linhaDiagnostico === 'number' && linhaDiagnostico >= 0 && linhaDiagnostico < documento.lineCount) {
            const linha = documento.lineAt(linhaDiagnostico).text;
            const identificadores = [...linha.matchAll(DeleguaProvedorAcoesCodigo.regexIdentificador)]
                .map(c => c[0])
                .filter(Boolean)
                .filter(i => i[0] === i[0].toUpperCase());

            return identificadores[0];
        }

        return undefined;
    }

    private async descobrirCaminhosImportacao(documento: vscode.TextDocument, simbolo: string, resultado: any): Promise<string[]> {
        const caminhos = new Set<string>();
        let encontrouPorDeclaracao = false;

        const declaracoes = [
            ...(resultado?.declaracoesPreCarregadas || []),
            ...(resultado?.avaliadorSintatico?.declaracoes || []),
        ];

        for (const declaracao of declaracoes) {
            const simboloDeclaracao = (declaracao as any)?.simbolo?.lexema;
            const caminhoArquivoDefinicao = (declaracao as any)?.caminhoArquivoDefinicao;

            if (simboloDeclaracao !== simbolo || !caminhoArquivoDefinicao) {
                continue;
            }

            const caminhoRelativo = this.gerarCaminhoRelativoImportacao(documento.uri, caminhoArquivoDefinicao);
            if (caminhoRelativo) {
                caminhos.add(caminhoRelativo);
                encontrouPorDeclaracao = true;
            }
        }

        // Fallback: busca arquivos reais no workspace com o nome kebab-case do símbolo.
        if (!encontrouPorDeclaracao) {
            const arquivosEncontrados = await this.descobrirArquivosImportacaoLocal(documento, simbolo);
            for (const caminho of arquivosEncontrados) {
                caminhos.add(caminho);
            }
        }

        return Array.from(caminhos);
    }

    private async descobrirArquivosImportacaoLocal(documento: vscode.TextDocument, simbolo: string): Promise<string[]> {
        const nomeKebab = simbolo
            .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
            .replace(/_/g, '-')
            .toLowerCase();

        const arquivos = await vscode.workspace.findFiles(
            `**/${nomeKebab}.delegua`,
            '**/node_modules/**',
            10
        );

        return arquivos
            .map(uri => this.gerarCaminhoRelativoImportacao(documento.uri, uri))
            .filter(Boolean);
    }

    private gerarCaminhoRelativoImportacao(arquivoAtual: vscode.Uri, arquivoDefinicao: string | vscode.Uri): string {
        const origemPath = this.obterDiretorioPath(arquivoAtual);
        const destinoPath = this.obterPath(arquivoDefinicao);
        const origem = this.segmentosPath(origemPath);
        const destino = this.segmentosPath(destinoPath);

        let indiceComum = 0;
        while (
            indiceComum < origem.length &&
            indiceComum < destino.length &&
            origem[indiceComum] === destino[indiceComum]
        ) {
            indiceComum++;
        }

        const segmentosSubida = Array(Math.max(0, origem.length - indiceComum)).fill('..');
        const segmentosDescida = destino.slice(indiceComum);
        let caminhoRelativo = [...segmentosSubida, ...segmentosDescida].join('/');

        if (!caminhoRelativo) {
            caminhoRelativo = '.';
        }

        if (!caminhoRelativo.startsWith('.')) {
            caminhoRelativo = `./${caminhoRelativo}`;
        }

        return caminhoRelativo;
    }

    private obterDiretorioPath(uriArquivo: vscode.Uri): string {
        const caminho = this.obterPath(uriArquivo);
        const ultimoSeparador = caminho.lastIndexOf('/');
        if (ultimoSeparador < 0) {
            return '';
        }

        return caminho.substring(0, ultimoSeparador);
    }

    private obterPath(valor: vscode.Uri | string): string {
        if (typeof valor === 'string') {
            return this.normalizarPath(valor);
        }

        const uriComoAny = valor as any;
        return this.normalizarPath(uriComoAny.path || uriComoAny.fsPath || '');
    }

    private normalizarPath(caminho: string): string {
        return String(caminho).replace(/\\/g, '/');
    }

    private segmentosPath(caminho: string): string[] {
        return this.normalizarPath(caminho).split('/').filter(Boolean);
    }

    private documentoJaPossuiImportacao(documento: vscode.TextDocument, linhaImportacao: string): boolean {
        const texto = documento.getText();
        const normalizada = this.normalizarImportacao(linhaImportacao);
        return texto
            .split(/\r?\n/)
            .some(linha => this.normalizarImportacao(linha) === normalizada);
    }

    private normalizarImportacao(linha: string): string {
        return linha
            .trim()
            .replace(/;$/, '')
            .replace(/\s+/g, ' ');
    }

    private obterPosicaoInsercaoImportacao(documento: vscode.TextDocument): vscode.Position {
        const totalLinhas = documento.lineCount;
        let ultimaLinhaImport = -1;

        for (let linha = 0; linha < totalLinhas; linha++) {
            const textoLinha = documento.lineAt(linha).text;

            if (DeleguaProvedorAcoesCodigo.regexImport.test(textoLinha)) {
                ultimaLinhaImport = linha;
                continue;
            }

            if (ultimaLinhaImport >= 0) {
                return new vscode.Position(ultimaLinhaImport + 1, 0);
            }

            if (!DeleguaProvedorAcoesCodigo.regexLinhaVazia.test(textoLinha)) {
                return new vscode.Position(linha, 0);
            }
        }

        return new vscode.Position(totalLinhas, 0);
    }

    private async encontrarDocumentoClasse(
        documentoAtual: vscode.TextDocument,
        correcaoMetodo: { nomeClasse: string; linhaDeclaracaoClasse: number; hashArquivoClasse?: number },
        resultado: any
    ): Promise<vscode.TextDocument | undefined> {
        const declaracoes = [
            ...(resultado?.declaracoesPreCarregadas || []),
            ...(resultado?.avaliadorSintatico?.declaracoes || []),
        ];

        for (const declaracao of declaracoes) {
            if ((declaracao as any)?.simbolo?.lexema !== correcaoMetodo.nomeClasse) {
                continue;
            }

            const caminho = (declaracao as any)?.caminhoArquivoDefinicao;
            if (!caminho) {
                continue;
            }

            try {
                return await vscode.workspace.openTextDocument(vscode.Uri.file(caminho));
            } catch {
                continue;
            }
        }

        return undefined;
    }

    private encontrarLinhaFechamentoClasse(documento: vscode.TextDocument, linhaDeclaracao: number): number {
        const linhaInicio = Math.max(0, linhaDeclaracao - 1);
        let profundidade = 0;

        for (let i = linhaInicio; i < documento.lineCount; i++) {
            for (const char of documento.lineAt(i).text) {
                if (char === '{') {
                    profundidade++;
                } else if (char === '}') {
                    profundidade--;
                    if (profundidade === 0) {
                        return i;
                    }
                }
            }
        }

        return -1;
    }

    private gerarEsbocoMembro(membro: MembroInterfaceFaltandoInterface): string {
        if (membro.tipo === 'metodo') {
            const parametros = (membro.parametros || [])
                .map(p => p.tipoDado ? `${p.nome}: ${p.tipoDado}` : p.nome)
                .join(', ');
            const tipoRetorno = membro.tipoRetorno ? `: ${membro.tipoRetorno}` : '';
            return `\t${membro.nome}(${parametros})${tipoRetorno} {\n\t\t// AFAZER\n\t}`;
        }

        const tipo = membro.tipoPropriedade ? `: ${membro.tipoPropriedade}` : '';
        return `\t${membro.nome}${tipo}`;
    }
}