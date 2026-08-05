import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

import { configurarDepuracao } from './depuracao/configuracao-depuracao';
import { ProvedorTarefasLiquidoDesktop } from './tarefas/provedor-tarefas-desktop';
import { comandosLiquido, TIPO_TAREFA_LIQUIDO } from './tarefas/comandos-liquido';
import { FabricaAdaptadorDepuracaoEmbutido } from './depuracao/fabricas';
import {
    DeleguaAdapterServerDescriptorFactory,
    DeleguaAdapterNamedPipeServerDescriptorFactory,
    DeleguaDebugAdapterExecutableFactory,
} from './depuracao/fabricas/remotas';
import { DeleguaProvedorDocumentacaoEmEditor } from './documentacao-em-editor/delegua-provedor-documentacao-em-editor';
import { DeleguaProvedorLinksDocumentacao } from './documentacao-em-editor/delegua-provedor-links-documentacao';
import { DeleguaTestesProvedorDocumentacaoEmEditor } from './documentacao-em-editor/delegua-testes-provedor-documentacao-em-editor';
import { PituguesProvedorDocumentacaoEmEditor } from './documentacao-em-editor/pitugues-provedor-documentacao-em-editor';
import { DeleguaProvedorCompletude } from './completude/delegua-provedor-completude';
import { DeleguaTestesProvedorCompletude } from './completude/delegua-testes-provedor-completude';
import { LiquidoProvedorCompletude } from './completude/liquido-provedor-completude';
import { PituguesProvedorCompletude } from './completude/pitugues-provedor-completude';
import { validarDelprops } from './linguagens/delprops/validador-delprops';
import { DeleguaProvedorFormatacao } from './formatadores/delegua-provedor-formatacao';

import { traduzir } from './traducao';
import { executarAnalises } from './analise-codigo';
import { ehArquivoConfiguracaoProjetoLiquido } from './liquido/deteccao-projeto-liquido';
import { reanalisarDocumentosAbertosProjetoLiquido } from './liquido/reanalisar-documentos-projeto-liquido';
import { DeleguaProvedorAssinaturaMetodos, DeleguaTestesProvedorAssinaturaMetodos } from './assinaturas-metodos';
import { garantirProvedoresLinguagem } from './ativacao-linguagens';

import { tentarFecharTagLmht } from './linguagens/lmht/fechamento-estruturas';

import { ProvedorVisaoEntradaSaida } from './visoes';
import { PituguesProvedorFormatacao } from './formatadores/pitugues-provedor-formatacao';
import { gerarFluxograma } from './visoes/fluxogramas/geracao-fluxogramas';
import { GerenciadorVisoesFluxograma } from './visoes/fluxogramas/gerenciador-visoes-fluxograma';
import { DeleguaProvedorAcoesCodigo } from './acoes-codigo';
import { DeleguaProvedorSimbolosDocumento } from './simbolos-documento/delegua';
import { PituguesProvedorSimbolosDocumento } from './simbolos-documento/pitugues';
import { DeleguaProvedorDobramento } from './dobramento/delegua';
import { PituguesProvedorDobramento } from './dobramento/pitugues';
import { DeleguaProvedorLentesCodigo } from './lentes-codigo/delegua';
import { DeleguaProvedorDicasInsercao } from './dicas-insercao/delegua';
import { PituguesProvedorDicasInsercao } from './dicas-insercao/pitugues';
import { DeleguaProvedorTokensSemanticos, LEGENDA_TOKENS_SEMANTICOS } from './tokens-semanticos/delegua';
import { PituguesProvedorTokensSemanticos } from './tokens-semanticos/pitugues';
import { DeleguaProvedorSimbolosTrabalho } from './simbolos-trabalho/delegua';
import { DeleguaProvedorDefinicao } from './definicao';
import { definirFabricaPainelWebView } from './mecanismo-importacao-bibliotecas';
import { DeleguaProvedorReferencias } from './referencias';
import { DeleguaProvedorRenomeacao, registrarRenomeacaoArquivosDelegua } from './renomeacao';
import { ehArquivoDelegua } from './importacao/utilitarios-caminho-importacao-delegua';
import { expirarResultado, expirarResultados, expirarResultadosPorDependenciaArquivo, expirarTudo } from '@designliquido/delegua-lsp/analise/cache-analise';
import { expirarTodasDefinicoes } from '@designliquido/delegua-lsp/analise/cache-definicoes';

/**
 * Em teoria runMode é uma "compile time flag", mas nunca foi usado aqui desta forma.
 * Usar 'server' para execução remota e 'inline' para execução embutida.
 * Please note: the test suite only supports 'external' mode.
 */
const runMode: 'external' | 'server' | 'namedPipeServer' | 'inline' = 'inline';
let changeTimeout;
const arquivosDependenciasProjeto = new Set([
    'package.json',
    'yarn.lock',
    'package-lock.json',
    'pnpm-lock.yaml',
    'bun.lockb',
]);

function ehArquivoDependenciaProjeto(documento: vscode.TextDocument): boolean {
    const nomeArquivo = path.basename(documento.fileName).toLowerCase();
    return arquivosDependenciasProjeto.has(nomeArquivo);
}

async function reanalisarArquivosProjeto(
    diagnosticosDelegua: vscode.DiagnosticCollection
): Promise<void> {
    const arquivos = await vscode.workspace.findFiles(
        '**/*.{alg,birl,delegua,egua,mapler,pitu,pitugues,por,poti,potigol,visualg}',
        '**/node_modules/**'
    );

    for (const arquivo of arquivos) {
        const documento = await vscode.workspace.openTextDocument(arquivo);
        await executarAnalises(documento, diagnosticosDelegua);
    }
}

/**
 * O ponto de entrada da extensão. Aqui registramos tudo:
 * - Ponto de entrada de todas as análises semânticas;
 * - Comandos de tradução;
 * - Provedores de completude (também chamado de _IntelliSense_);
 * - Provedores de documentação em editor (vulgo, "documentação quando coloca-se o ponteiro do mouse em cima do símbolo");
 * - Depuradores.
 * @param context O contexto da extensão.
 */
export function activate(context: vscode.ExtensionContext) {
    definirFabricaPainelWebView(() =>
        vscode.window.createWebviewPanel(
            'delegua-interface-grafica',
            'Interface Gráfica – Delégua',
            vscode.ViewColumn.One,
            { enableScripts: true }
        )
    );

    const diagnosticosDelegua = vscode.languages.createDiagnosticCollection("delegua");
	context.subscriptions.push(diagnosticosDelegua);

    const diagnosticsDelprops = vscode.languages.createDiagnosticCollection("delprops");
    context.subscriptions.push(diagnosticsDelprops);

    if (vscode.window.activeTextEditor) {
		executarAnalises(vscode.window.activeTextEditor.document, diagnosticosDelegua).catch(erro => {
			console.error('Erro ao executar análises:', erro);
		});
        garantirProvedoresLinguagem(vscode.window.activeTextEditor.document.languageId, context).catch(erro => {
            console.error('Erro ao ativar provedores de linguagem:', erro);
        });
        if (vscode.window.activeTextEditor.document.languageId === 'delprops') {
            diagnosticsDelprops.set(
                vscode.window.activeTextEditor.document.uri,
                validarDelprops(vscode.window.activeTextEditor.document)
            );
        }
	}

    context.subscriptions.push(
        vscode.workspace.onDidOpenTextDocument(doc => {
            garantirProvedoresLinguagem(doc.languageId, context).catch(erro => {
                console.error('Erro ao ativar provedores de linguagem:', erro);
            });
            if (['birl', 'delegua', 'delegua-testes', 'foles', 'lmht', 'lincones', 'mapler', 'visualg', 'portugolstudio', 'potigol'].includes(doc.languageId)) {
                executarAnalises(doc, diagnosticosDelegua).catch(erro => {
					console.error('Erro ao executar análises:', erro);
				});
            }
            if (doc.languageId === 'delprops') {
                diagnosticsDelprops.set(doc.uri, validarDelprops(doc));
            }
        }),
        vscode.window.onDidChangeActiveTextEditor(editor => {
            if (!editor) {
                return;
            }
            garantirProvedoresLinguagem(editor.document.languageId, context).catch(erro => {
                console.error('Erro ao ativar provedores de linguagem:', erro);
            });
            if (['birl', 'delegua', 'delegua-testes', 'foles', 'lmht', 'lincones', 'mapler', 'visualg', 'portugolstudio', 'potigol'].includes(editor.document.languageId)) {
                executarAnalises(editor.document, diagnosticosDelegua).catch(erro => {
					console.error('Erro ao executar análises:', erro);
				});
            }
            if (editor.document.languageId === 'delprops') {
                diagnosticsDelprops.set(editor.document.uri, validarDelprops(editor.document));
            }
        }),
        vscode.workspace.onDidChangeTextDocument((evento) => {
            switch (evento.document.languageId) {
                case 'birl':
                case 'delegua':
                case 'delegua-testes':
                case 'foles':
                case 'lincones':
                case 'mapler':
                case 'pitugues':
                case 'portugolstudio':
                case 'potigol':
                case 'visualg':
                    if (changeTimeout !== null) {
                        clearTimeout(changeTimeout);
                    }
                    changeTimeout = setTimeout(function () {
                        clearTimeout(changeTimeout);
                        changeTimeout = null;
                        executarAnalises(evento.document, diagnosticosDelegua)
                            .then(() => {
                                if (ehArquivoDelegua(evento.document.uri)) {
                                    expirarResultadosPorDependenciaArquivo([evento.document.uri.fsPath], 'arquivo-delegua-modificado');
                                    for (const editor of vscode.window.visibleTextEditors) {
                                        if (editor.document !== evento.document && ehArquivoDelegua(editor.document.uri)) {
                                            executarAnalises(editor.document, diagnosticosDelegua).catch(erro => {
                                                console.error('Erro ao executar análises de dependentes:', erro);
                                            });
                                        }
                                    }
                                }
                            })
                            .catch(erro => {
                                console.error('Erro ao executar análises:', erro);
                            });
                    }, 500);
                    break;
                case 'lmht':
                    if (changeTimeout !== null) {
                        clearTimeout(changeTimeout);
                    }
                    changeTimeout = setTimeout(function () {
                        clearTimeout(changeTimeout);
                        changeTimeout = null;
                        executarAnalises(evento.document, diagnosticosDelegua).catch(erro => {
                            console.error('Erro ao executar análises:', erro);
                        });
                    }, 500);
                    tentarFecharTagLmht(evento);
                    break;
                case 'delprops':
                    diagnosticsDelprops.set(evento.document.uri, validarDelprops(evento.document));
                    break;
                default:
                    break;
            }
        })
    );

	context.subscriptions.push(
		vscode.workspace.onDidCloseTextDocument(doc => {
            diagnosticosDelegua.delete(doc.uri);
            diagnosticsDelprops.delete(doc.uri);
            expirarResultado(doc.uri.toString(), 'documento-fechado');
        })
	);

    context.subscriptions.push(
        vscode.workspace.onDidSaveTextDocument(async documento => {
            if (ehArquivoDependenciaProjeto(documento)) {
                expirarTudo('dependencias-atualizadas');
                expirarTodasDefinicoes('dependencias-atualizadas');
            }

            if (ehArquivoConfiguracaoProjetoLiquido(documento.uri)) {
                expirarTodasDefinicoes('delprops-atualizado');
                await reanalisarDocumentosAbertosProjetoLiquido(diagnosticosDelegua, {
                    arquivosConfiguracao: [documento.uri],
                    motivo: 'delprops-atualizado',
                });
            }
        })
    );

    context.subscriptions.push(
        vscode.workspace.onDidCreateFiles(async evento => {
            const uris = evento.files.map(arquivo => arquivo.toString());
            expirarResultados(uris, 'arquivo-criado');

            const caminhosAfetados = evento.files
                .filter(arquivo => ehArquivoDelegua(arquivo))
                .map(arquivo => arquivo.fsPath);

            expirarResultadosPorDependenciaArquivo(caminhosAfetados, 'arquivo-delegua-criado');

            const configuracoesLiquido = evento.files.filter(ehArquivoConfiguracaoProjetoLiquido);
            if (configuracoesLiquido.length > 0) {
                expirarTodasDefinicoes('configuracao-liquido-criada');
                await reanalisarDocumentosAbertosProjetoLiquido(diagnosticosDelegua, {
                    arquivosConfiguracao: configuracoesLiquido,
                    motivo: 'configuracao-liquido-criada',
                });
            }
        })
    );

    context.subscriptions.push(
        vscode.workspace.onDidDeleteFiles(async evento => {
            const uris = evento.files.map(arquivo => arquivo.toString());
            expirarResultados(uris, 'arquivo-removido');

            const caminhosAfetados = evento.files
                .filter(arquivo => ehArquivoDelegua(arquivo))
                .map(arquivo => arquivo.fsPath);

            expirarResultadosPorDependenciaArquivo(caminhosAfetados, 'arquivo-delegua-removido');

            const configuracoesLiquido = evento.files.filter(ehArquivoConfiguracaoProjetoLiquido);
            if (configuracoesLiquido.length > 0) {
                expirarTodasDefinicoes('configuracao-liquido-removida');
                await reanalisarDocumentosAbertosProjetoLiquido(diagnosticosDelegua, {
                    arquivosConfiguracao: configuracoesLiquido,
                    incluirDocumentosSemProjeto: true,
                    motivo: 'configuracao-liquido-removida',
                });
            }
        })
    );

    // Comandos de menu

    context.subscriptions.push(
        vscode.commands.registerCommand(
            'extension.designliquido.verFluxograma',
            async (uri: vscode.Uri) => {
                await gerarFluxograma(uri, context);
            }
        )
    );

    // Ações de código
    context.subscriptions.push(
        vscode.languages.registerCodeActionsProvider(
            [
                { language: 'delegua', scheme: 'file' },
                { language: 'pitugues', scheme: 'file' }
            ],
            new DeleguaProvedorAcoesCodigo(),
            { providedCodeActionKinds: DeleguaProvedorAcoesCodigo.tiposAcoesRapidas }
        )
    );

    // Traduções

    context.subscriptions.push(
        vscode.commands.registerCommand(
            'extension.designliquido.traduzir.css.para.foles',
            async () => await traduzir('css', 'foles')
        )
    );

    context.subscriptions.push(
        vscode.commands.registerCommand(
            'extension.designliquido.traduzir.delegua.para.arm.linux',
            async () => await traduzir('delegua', 'arm', 'linux-arm')
        )
    );

    context.subscriptions.push(
        vscode.commands.registerCommand(
            'extension.designliquido.traduzir.delegua.para.arm.android',
            async () => await traduzir('delegua', 'arm', 'android')
        )
    );

    context.subscriptions.push(
        vscode.commands.registerCommand(
            'extension.designliquido.traduzir.delegua.para.assemblyscript',
            async () => await traduzir('delegua', 'assemblyscript')
        )
    );

    context.subscriptions.push(
        vscode.commands.registerCommand(
            'extension.designliquido.traduzir.delegua.para.elixir',
            async () => await traduzir('delegua', 'ex')
        )
    );

    context.subscriptions.push(
        vscode.commands.registerCommand(
            'extension.designliquido.traduzir.delegua.para.javascript',
            async () => await traduzir('delegua', 'js')
        )
    );

    context.subscriptions.push(
        vscode.commands.registerCommand(
            'extension.designliquido.traduzir.delegua.para.python',
            async () => await traduzir('delegua', 'py')
        )
    );

    context.subscriptions.push(
        vscode.commands.registerCommand(
            'extension.designliquido.traduzir.delegua.para.ruby',
            async () => await traduzir('delegua', 'rb')
        )
    );

    context.subscriptions.push(
        vscode.commands.registerCommand(
            'extension.designliquido.traduzir.delegua.para.x64.linux',
            async () => await traduzir('delegua', 'x64', 'linux')
        )
    );

    context.subscriptions.push(
        vscode.commands.registerCommand(
            'extension.designliquido.traduzir.delegua.para.x64.windows',
            async () => await traduzir('delegua', 'x64', 'windows')
        )
    );

    context.subscriptions.push(
        vscode.commands.registerCommand(
            'extension.designliquido.traduzir.foles.para.css',
            async () => await traduzir('foles', 'css')
        )
    );

    context.subscriptions.push(
        vscode.commands.registerCommand(
            'extension.designliquido.traduzir.html.para.lmht',
            async () => await traduzir('html', 'lmht')
        )
    );

    context.subscriptions.push(
        vscode.commands.registerCommand(
            'extension.designliquido.traduzir.javascript.para.delegua',
            async () => await traduzir('js', 'delegua')
        )
    );

    context.subscriptions.push(
        vscode.commands.registerCommand(
            'extension.designliquido.traduzir.lincones.para.sql',
            async () => await traduzir('lincones', 'sql')
        )
    );

    context.subscriptions.push(
        vscode.commands.registerCommand(
            'extension.designliquido.traduzir.lmht.para.html',
            async () => await traduzir('lmht', 'html')
        )
    );

    context.subscriptions.push(
        vscode.commands.registerCommand(
            'extension.designliquido.traduzir.sql.para.lincones',
            async () => await traduzir('sql', 'lincones')
        )
    );
    
    context.subscriptions.push(
        vscode.commands.registerCommand(
            'extension.designliquido.traduzir.visualg.para.delegua',
            async () => await traduzir('alg', 'delegua')
        )
    );    

    context.subscriptions.push(
        vscode.languages.registerDocumentFormattingEditProvider(
            'delegua',
            new DeleguaProvedorFormatacao(diagnosticosDelegua)
        )
    );

    context.subscriptions.push(
        vscode.languages.registerDocumentFormattingEditProvider(
            'pitugues',
            new PituguesProvedorFormatacao(diagnosticosDelegua)
        )
    );

    // Formatadores, completude e documentação em editor de Mapler, Portugol Studio,
    // Potigol, VisuAlg, FolEs, LMHT, LinConEs e Delégua Propriedades são registrados
    // sob demanda em './ativacao-linguagens', na primeira vez que um arquivo daquela
    // linguagem é aberto (ver garantirProvedoresLinguagem acima).

    // IntelliSense para Delégua e Liquido.
    context.subscriptions.push(
        vscode.languages.registerCompletionItemProvider(
            { scheme: 'file', language: 'delegua', pattern: '**/configuracao.delegua' },
            new LiquidoProvedorCompletude(),
            '.' // acionado quando desenvolvedor/a digita '.'
        )
    );

    context.subscriptions.push(
        vscode.languages.registerCompletionItemProvider(
            [
                { scheme: 'file', language: 'delegua' },
                { scheme: 'untitled', language: 'delegua' }
            ],
            new DeleguaProvedorCompletude(),
            '@'
        )
    );

    context.subscriptions.push(
        vscode.languages.registerCompletionItemProvider(
            [
                { scheme: 'file', language: 'delegua-testes' },
                { scheme: 'untitled', language: 'delegua-testes' }
            ],
            new DeleguaTestesProvedorCompletude(),
            '@'
        )
    );

    // IntelliSense para Pituguês
    context.subscriptions.push(
        vscode.languages.registerCompletionItemProvider(
            [
                { scheme: 'file', language: 'pitugues' },
                { scheme: 'untitled', language: 'pitugues' }
            ],
            new PituguesProvedorCompletude()
        )
    );

    // Hovers
    context.subscriptions.push(
        vscode.languages.registerHoverProvider(
            [
                { scheme: 'file', language: 'delegua' },
                { scheme: 'untitled', language: 'delegua' }
            ],
            new DeleguaProvedorDocumentacaoEmEditor()
        )
    );

    context.subscriptions.push(
        vscode.languages.registerHoverProvider(
            [
                { scheme: 'file', language: 'delegua-testes' },
                { scheme: 'untitled', language: 'delegua-testes' }
            ],
            new DeleguaTestesProvedorDocumentacaoEmEditor()
        )
    );

    context.subscriptions.push(
        vscode.languages.registerHoverProvider(
            [
                { scheme: 'file', language: 'pitugues' },
                { scheme: 'untitled', language: 'pitugues' }
            ],
            new PituguesProvedorDocumentacaoEmEditor()
        )
    );

    // Símbolos do documento (Outline, breadcrumbs, Ctrl+Shift+O)
    context.subscriptions.push(
        vscode.languages.registerDocumentSymbolProvider(
            [
                { scheme: 'file', language: 'delegua' },
                { scheme: 'untitled', language: 'delegua' }
            ],
            new DeleguaProvedorSimbolosDocumento()
        )
    );

    context.subscriptions.push(
        vscode.languages.registerDocumentSymbolProvider(
            [
                { scheme: 'file', language: 'pitugues' },
                { scheme: 'untitled', language: 'pitugues' }
            ],
            new PituguesProvedorSimbolosDocumento()
        )
    );

    context.subscriptions.push(
        vscode.languages.registerDocumentSymbolProvider(
            [
                { scheme: 'file', language: 'delegua-testes' },
                { scheme: 'untitled', language: 'delegua-testes' }
            ],
            new DeleguaProvedorSimbolosDocumento()
        )
    );

    // Dobramento (Folding)
    context.subscriptions.push(
        vscode.languages.registerFoldingRangeProvider(
            [
                { scheme: 'file', language: 'delegua' },
                { scheme: 'untitled', language: 'delegua' }
            ],
            new DeleguaProvedorDobramento()
        )
    );

    context.subscriptions.push(
        vscode.languages.registerFoldingRangeProvider(
            [
                { scheme: 'file', language: 'pitugues' },
                { scheme: 'untitled', language: 'pitugues' }
            ],
            new PituguesProvedorDobramento()
        )
    );

    context.subscriptions.push(
        vscode.languages.registerFoldingRangeProvider(
            [
                { scheme: 'file', language: 'delegua-testes' },
                { scheme: 'untitled', language: 'delegua-testes' }
            ],
            new DeleguaProvedorDobramento()
        )
    );

    // Lentes de código (CodeLens)
    context.subscriptions.push(
        vscode.languages.registerCodeLensProvider(
            [
                { scheme: 'file', language: 'delegua' },
                { scheme: 'untitled', language: 'delegua' }
            ],
            new DeleguaProvedorLentesCodigo()
        )
    );

    context.subscriptions.push(
        vscode.languages.registerCodeLensProvider(
            [
                { scheme: 'file', language: 'delegua-testes' },
                { scheme: 'untitled', language: 'delegua-testes' }
            ],
            new DeleguaProvedorLentesCodigo()
        )
    );

    // Dicas de inserção (InlayHints)
    context.subscriptions.push(
        vscode.languages.registerInlayHintsProvider(
            [
                { scheme: 'file', language: 'delegua' },
                { scheme: 'untitled', language: 'delegua' }
            ],
            new DeleguaProvedorDicasInsercao()
        )
    );

    context.subscriptions.push(
        vscode.languages.registerInlayHintsProvider(
            [
                { scheme: 'file', language: 'pitugues' },
                { scheme: 'untitled', language: 'pitugues' }
            ],
            new PituguesProvedorDicasInsercao()
        )
    );

    // Tokens semânticos
    context.subscriptions.push(
        vscode.languages.registerDocumentSemanticTokensProvider(
            [
                { scheme: 'file', language: 'delegua' },
                { scheme: 'untitled', language: 'delegua' },
            ],
            new DeleguaProvedorTokensSemanticos(),
            LEGENDA_TOKENS_SEMANTICOS
        )
    );

    context.subscriptions.push(
        vscode.languages.registerDocumentSemanticTokensProvider(
            [
                { scheme: 'file', language: 'delegua-testes' },
                { scheme: 'untitled', language: 'delegua-testes' },
            ],
            new DeleguaProvedorTokensSemanticos(),
            LEGENDA_TOKENS_SEMANTICOS
        )
    );

    context.subscriptions.push(
        vscode.languages.registerDocumentSemanticTokensProvider(
            [
                { scheme: 'file', language: 'pitugues' },
                { scheme: 'untitled', language: 'pitugues' },
            ],
            new PituguesProvedorTokensSemanticos(),
            LEGENDA_TOKENS_SEMANTICOS
        )
    );

    // Símbolos do espaço de trabalho (Ctrl+T)
    context.subscriptions.push(
        vscode.languages.registerWorkspaceSymbolProvider(
            new DeleguaProvedorSimbolosTrabalho()
        )
    );

    context.subscriptions.push(
        vscode.languages.registerDocumentLinkProvider(
            [
                { scheme: 'file', language: 'delegua' },
                { scheme: 'untitled', language: 'delegua' }
            ],
            new DeleguaProvedorLinksDocumentacao()
        )
    );

    // Ir para definição
    context.subscriptions.push(
        vscode.languages.registerDefinitionProvider(
            [
                { scheme: 'file', language: 'delegua' },
                { scheme: 'untitled', language: 'delegua' },
                { scheme: 'file', language: 'pitugues' },
                { scheme: 'untitled', language: 'pitugues' }
            ],
            new DeleguaProvedorDefinicao()
        )
    );

    // Encontrar todas as referências
    context.subscriptions.push(
        vscode.languages.registerReferenceProvider(
            [
                { scheme: 'file', language: 'delegua' },
                { scheme: 'untitled', language: 'delegua' },
                { scheme: 'file', language: 'pitugues' },
                { scheme: 'untitled', language: 'pitugues' }
            ],
            new DeleguaProvedorReferencias()
        )
    );

    // Renomear símbolos
    context.subscriptions.push(
        vscode.languages.registerRenameProvider(
            [
                { scheme: 'file', language: 'delegua' },
                { scheme: 'untitled', language: 'delegua' },
                { scheme: 'file', language: 'pitugues' },
                { scheme: 'untitled', language: 'pitugues' }
            ],
            new DeleguaProvedorRenomeacao()
        )
    );

    // Ajustar automaticamente caminhos de importação ao renomear arquivos Delégua
    context.subscriptions.push(registrarRenomeacaoArquivosDelegua());

    // Após renomear arquivos Delégua, salvamos tudo e reanalisamos para evitar diagnósticos desatualizados.
    context.subscriptions.push(
        vscode.workspace.onDidRenameFiles(async evento => {
            expirarResultados(
                evento.files.flatMap(arquivo => [arquivo.oldUri.toString(), arquivo.newUri.toString()]),
                'arquivo-renomeado'
            );

            expirarResultadosPorDependenciaArquivo(
                evento.files
                    .filter(arquivo => ehArquivoDelegua(arquivo.oldUri) || ehArquivoDelegua(arquivo.newUri))
                    .flatMap(arquivo => [arquivo.oldUri.fsPath, arquivo.newUri.fsPath]),
                'arquivo-delegua-renomeado'
            );

            const configuracoesLiquido = evento.files
                .flatMap(arquivo => [arquivo.oldUri, arquivo.newUri])
                .filter(ehArquivoConfiguracaoProjetoLiquido);
            if (configuracoesLiquido.length > 0) {
                expirarTodasDefinicoes('configuracao-liquido-renomeada');
                await reanalisarDocumentosAbertosProjetoLiquido(diagnosticosDelegua, {
                    arquivosConfiguracao: configuracoesLiquido,
                    incluirDocumentosSemProjeto: true,
                    motivo: 'configuracao-liquido-renomeada',
                });
            }

            const houveRenomeacaoDelgua = evento.files.some(arquivo =>
                ehArquivoDelegua(arquivo.oldUri) || ehArquivoDelegua(arquivo.newUri)
            );

            if (!houveRenomeacaoDelgua) {
                return;
            }

            try {
                await vscode.workspace.saveAll(false);
                await reanalisarArquivosProjeto(diagnosticosDelegua);
            } catch (erro) {
                console.error('Erro ao salvar e reanalisar após renomeação de arquivos Delégua:', erro);
            }
        })
    );

    // Assinaturas de funções e métodos
    context.subscriptions.push(
        vscode.languages.registerSignatureHelpProvider(
            [
                { scheme: 'file', language: 'delegua' },
                { scheme: 'untitled', language: 'delegua' },
                { scheme: 'file', language: 'pitugues' },
                { scheme: 'untitled', language: 'pitugues' }
            ],
            new DeleguaProvedorAssinaturaMetodos()
        )
    );

    context.subscriptions.push(
        vscode.languages.registerSignatureHelpProvider(
            [
                { scheme: 'file', language: 'delegua-testes' },
                { scheme: 'untitled', language: 'delegua-testes' }
            ],
            new DeleguaTestesProvedorAssinaturaMetodos()
        )
    );

    // Visão de Entrada e Saída
    const provedorEntradaSaida = new ProvedorVisaoEntradaSaida(context.extensionUri);
    context.subscriptions.push(
		vscode.window.registerWebviewViewProvider(
            ProvedorVisaoEntradaSaida.viewType, 
            provedorEntradaSaida, 
            {
                webviewOptions: {
                    retainContextWhenHidden: true
                }
            }
        )
    );

    const criarArquivoPitugues = vscode.commands.registerCommand(
        'extension.designliquido.criarArquivoPitugues',
        async () => {
        const workspaceFolders = vscode.workspace.workspaceFolders;
            if (!workspaceFolders) {
                vscode.window.showErrorMessage('Nenhuma pasta aberta no VS Code.');
                return;
            }

            const rootPath = workspaceFolders[0].uri.fsPath;
            let baseName = 'novo-arquivo';
            let extension = '.pitugues';
            let filePath = path.join(rootPath, baseName + extension);
            let counter = 1;

            while (fs.existsSync(filePath)) {
                filePath = path.join(rootPath, `${baseName}-${counter}${extension}`);
                counter++;
            }

            fs.writeFileSync(filePath, '');
            vscode.window.showInformationMessage(`Arquivo criado: ${path.basename(filePath)}`);

            const doc = await vscode.workspace.openTextDocument(filePath);
            await vscode.window.showTextDocument(doc);
        }
    );
    context.subscriptions.push(criarArquivoPitugues);

    const abrirPainelEntradaESaida = vscode.commands.registerCommand(
        'extension.designliquido.abrirPainelEntradaESaida',
        () => {
            provedorEntradaSaida.ativarVisao();
        }
    );
    context.subscriptions.push(abrirPainelEntradaESaida);

    // Tarefas do Liquido (servidor, novo, gerar, documentar, banco, testes),
    // executadas via ShellExecution no desktop.
    context.subscriptions.push(
        vscode.tasks.registerTaskProvider(
            TIPO_TAREFA_LIQUIDO,
            new ProvedorTarefasLiquidoDesktop()
        )
    );

    // Comandos de conveniência: cada um dispara a tarefa Liquido correspondente,
    // permitindo botões (ex.: na barra de título do editor) e atalhos.
    for (const comando of comandosLiquido) {
        context.subscriptions.push(
            vscode.commands.registerCommand(
                `extension.designliquido.liquido.${comando.id}`,
                async () => {
                    const tarefas = await vscode.tasks.fetchTasks({ type: TIPO_TAREFA_LIQUIDO });
                    const tarefa = tarefas.find(
                        t => (t.definition as any).comando === comando.id
                    );
                    if (tarefa) {
                        await vscode.tasks.executeTask(tarefa);
                    } else {
                        vscode.window.showErrorMessage(
                            `Não foi possível localizar a tarefa Liquido "${comando.id}".`
                        );
                    }
                }
            )
        );
    }


    // adaptadores de depuração podem ser executados de diferentes formas usando um vscode.DebugAdapterDescriptorFactory:
    switch (runMode) {
        case 'server':
            // executa o adaptador de depuração como um servidor dentro da extensão e comunica via socket
            configurarDepuracao(
                context,
                new DeleguaAdapterServerDescriptorFactory()
            );
            break;

        case 'namedPipeServer':
            // executa o adaptador de depuração como um servidor dentro da extensão e comunica via named pipe (Windows) ou socket de domínio UNIX (não-Windows)
            configurarDepuracao(
                context,
                new DeleguaAdapterNamedPipeServerDescriptorFactory()
            );
            break;

        case 'external':
        default:
            // executa o adaptador de depuração como um processo separado
            configurarDepuracao(
                context,
                new DeleguaDebugAdapterExecutableFactory()
            );
            break;

        case 'inline':
            // Roda o adaptador dentro da extensão e fala diretamente com ele.
            configurarDepuracao(
                context,
                new FabricaAdaptadorDepuracaoEmbutido(provedorEntradaSaida, diagnosticosDelegua)
            );
            break;
    }
}

export function deactivate() {
    GerenciadorVisoesFluxograma.descartar();
}
