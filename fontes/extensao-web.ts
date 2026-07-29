import * as vscode from 'vscode';
import { expirarResultado, expirarResultados, expirarResultadosPorDependenciaArquivo, expirarTudo } from '@designliquido/delegua-lsp/analise/cache-analise';
import { expirarTodasDefinicoes } from '@designliquido/delegua-lsp/analise/cache-definicoes';

import tradutorWeb from './traducao/index-web';

import { configurarDepuracao } from './depuracao/configuracao-depuracao';
import { DeleguaProvedorDocumentacaoEmEditor } from './documentacao-em-editor/delegua-provedor-documentacao-em-editor';
import { DeleguaProvedorLinksDocumentacao } from './documentacao-em-editor/delegua-provedor-links-documentacao';
import { PituguesProvedorDocumentacaoEmEditor } from './documentacao-em-editor/pitugues-provedor-documentacao-em-editor';
import { DeleguaProvedorCompletude } from './completude/delegua-provedor-completude';
import { LiquidoProvedorCompletude } from './completude/liquido-provedor-completude';

// Importações individuais dos formatadores
import { DeleguaProvedorFormatacao } from './formatadores/delegua-provedor-formatacao';
import { ProvedorTarefasLiquidoWeb } from './tarefas/provedor-tarefas-web';
import { comandosLiquido, TIPO_TAREFA_LIQUIDO } from './tarefas/comandos-liquido';

import { executarAnalises } from './analise-codigo';
import { DeleguaProvedorAssinaturaMetodos } from './assinaturas-metodos';
import { garantirProvedoresLinguagem } from './ativacao-linguagens';
import { tentarFecharTagLmht } from './linguagens/lmht/fechamento-estruturas';
import { ProvedorVisaoEntradaSaidaWeb } from './visoes';
import { FabricaAdaptadorDepuracaoWeb } from './depuracao/fabricas/fabrica-adaptador-depuracao-web';
import { PituguesProvedorFormatacao } from './formatadores/pitugues-provedor-formatacao';
import { GerenciadorVisoesFluxograma } from './visoes/fluxogramas/gerenciador-visoes-fluxograma';
import { gerarFluxogramaWeb } from './visoes/fluxogramas/geracao-fluxogramas-web';
import { DeleguaProvedorAcoesCodigo } from './acoes-codigo/delegua-provedor-acoes-codigo';
import { DeleguaProvedorDefinicao } from './definicao';
import { DeleguaProvedorReferencias } from './referencias';
import { DeleguaProvedorRenomeacao } from './renomeacao';

let changeTimeout: NodeJS.Timeout | null = null;
const arquivosDependenciasProjeto = new Set([
    'package.json',
    'yarn.lock',
    'package-lock.json',
    'pnpm-lock.yaml',
    'bun.lockb',
]);

function obterNomeArquivo(uri: vscode.Uri): string {
    const partes = uri.path.toLowerCase().split('/');
    return partes[partes.length - 1] || '';
}

function ehArquivoDependenciaProjeto(documento: vscode.TextDocument): boolean {
    return arquivosDependenciasProjeto.has(obterNomeArquivo(documento.uri));
}

function ehArquivoLinguagemAnalise(uri: vscode.Uri): boolean {
    const nomeArquivo = obterNomeArquivo(uri);
    const extensao = nomeArquivo.split('.').pop() || '';
    return ['alg', 'birl', 'delegua', 'egua', 'mapler', 'pitu', 'pitugues', 'por', 'poti', 'potigol', 'visualg'].includes(extensao);
}

/**
 * `garantirProvedoresLinguagem` também sabe ativar provedores de Delégua Propriedades
 * (usado pela extensão desktop), mas o pacote `@designliquido/delprops` usa `require()`
 * dinâmico internamente para acesso a sistema de arquivos, o que o webpack não consegue
 * analisar estaticamente para o alvo `webworker`. Até isso ser verificado como seguro no
 * navegador, a extensão Web mantém o comportamento anterior e não ativa esse grupo.
 */
function ehLinguagemSuportadaNaWeb(languageId: string): boolean {
    return languageId !== 'delprops';
}

/**
 * Versão simplificada de tradução que mostra aviso
 */
async function traduzirWeb(origem: string, destino: string, alvo: string) {
    try {
        // Chama a versão web-safe do tradutor registrada em `fontes/traducao/index-web.ts`.
        // O módulo tratará leitura/escrita via `vscode.workspace.fs` e mostrará mensagens apropriadas.
        await tradutorWeb.traduzir(origem, destino, alvo);
    } catch (error: any) {
        vscode.window.showErrorMessage(`Erro na tradução web: ${error?.message ?? String(error)}`);
    }
}

/**
 * O ponto de entrada da extensão na Web. Aqui registramos tudo:
 * - Ponto de entrada de todas as análises semânticas;
 * - Comandos de tradução;
 * - Provedores de completude (também chamado de _IntelliSense_);
 * - Provedores de documentação em editor (vulgo, "documentação quando coloca-se o ponteiro do mouse em cima do símbolo");
 * - Depuradores.
 * @param context O contexto da extensão.
 */
export function activate(context: vscode.ExtensionContext) {
    const diagnosticosDelegua = vscode.languages.createDiagnosticCollection("delegua");
    context.subscriptions.push(diagnosticosDelegua);

    // Análise de código em tempo real
    if (vscode.window.activeTextEditor) {
        executarAnalises(vscode.window.activeTextEditor.document, diagnosticosDelegua).catch(erro => {
            console.error('Erro ao executar análises:', erro);
        });
        if (ehLinguagemSuportadaNaWeb(vscode.window.activeTextEditor.document.languageId)) {
            garantirProvedoresLinguagem(vscode.window.activeTextEditor.document.languageId, context).catch(erro => {
                console.error('Erro ao ativar provedores de linguagem:', erro);
            });
        }
    }

    context.subscriptions.push(
        vscode.workspace.onDidOpenTextDocument(doc => {
            if (ehLinguagemSuportadaNaWeb(doc.languageId)) {
                garantirProvedoresLinguagem(doc.languageId, context).catch(erro => {
                    console.error('Erro ao ativar provedores de linguagem:', erro);
                });
            }
            if (['birl', 'delegua', 'mapler', 'visualg', 'portugolstudio'].includes(doc.languageId)) {
                executarAnalises(doc, diagnosticosDelegua).catch(erro => {
                    console.error('Erro ao executar análises:', erro);
                });
            }
        }),
        vscode.window.onDidChangeActiveTextEditor(editor => {
            if (!editor) {
                return;
            }
            if (ehLinguagemSuportadaNaWeb(editor.document.languageId)) {
                garantirProvedoresLinguagem(editor.document.languageId, context).catch(erro => {
                    console.error('Erro ao ativar provedores de linguagem:', erro);
                });
            }
            if (['birl', 'delegua', 'mapler', 'visualg', 'portugolstudio'].includes(editor.document.languageId)) {
                executarAnalises(editor.document, diagnosticosDelegua).catch(erro => {
                    console.error('Erro ao executar análises:', erro);
                });
            }
        }),
        vscode.workspace.onDidChangeTextDocument((evento) => {
            switch (evento.document.languageId) {
                case 'birl':
                case 'delegua':
                case 'mapler':
                case 'pitugues':
                case 'visualg':
                case 'portugolstudio':
                    if (changeTimeout !== null) {
                        clearTimeout(changeTimeout);
                    }
                    changeTimeout = setTimeout(function () {
                        if (changeTimeout) {
                            clearTimeout(changeTimeout);
                        }
                        changeTimeout = null;
                        executarAnalises(evento.document, diagnosticosDelegua).catch(erro => {
                            console.error('Erro ao executar análises:', erro);
                        });
                    }, 500);
                    break;
                case 'lmht':
                    tentarFecharTagLmht(evento);
                    break;
                default:
                    break;
            }
        })
    );

    context.subscriptions.push(
        vscode.workspace.onDidCloseTextDocument(doc => {
            diagnosticosDelegua.delete(doc.uri);
            expirarResultado(doc.uri.toString(), 'documento-fechado');
        })
    );

    context.subscriptions.push(
        vscode.workspace.onDidSaveTextDocument(documento => {
            if (ehArquivoDependenciaProjeto(documento)) {
                expirarTudo('dependencias-atualizadas');
                expirarTodasDefinicoes('dependencias-atualizadas');
            }

            if (documento.uri.path.endsWith('configuracao.delprops')) {
                for (const doc of vscode.workspace.textDocuments) {
                    if (/[\\\/]rotas[\\\/]/i.test(doc.fileName) &&
                        doc.languageId === 'delegua') {
                        expirarResultado(doc.uri.toString(), 'delprops-atualizado');
                        executarAnalises(doc, diagnosticosDelegua).catch(erro => {
                            console.error('Erro ao reanalisar rota após atualização de delprops:', erro);
                        });
                    }
                }
            }
        })
    );

    context.subscriptions.push(
        vscode.workspace.onDidCreateFiles(evento => {
            const uris = evento.files.map(arquivo => arquivo.toString());
            expirarResultados(uris, 'arquivo-criado');

            const caminhosAfetados = evento.files
                .filter(arquivo => ehArquivoLinguagemAnalise(arquivo))
                .map(arquivo => arquivo.path);

            expirarResultadosPorDependenciaArquivo(caminhosAfetados, 'arquivo-linguagem-criado');
        })
    );

    context.subscriptions.push(
        vscode.workspace.onDidDeleteFiles(evento => {
            const uris = evento.files.map(arquivo => arquivo.toString());
            expirarResultados(uris, 'arquivo-removido');

            const caminhosAfetados = evento.files
                .filter(arquivo => ehArquivoLinguagemAnalise(arquivo))
                .map(arquivo => arquivo.path);

            expirarResultadosPorDependenciaArquivo(caminhosAfetados, 'arquivo-linguagem-removido');
        })
    );

    context.subscriptions.push(
        vscode.workspace.onDidRenameFiles(evento => {
            expirarResultados(
                evento.files.flatMap(arquivo => [arquivo.oldUri.toString(), arquivo.newUri.toString()]),
                'arquivo-renomeado'
            );

            expirarResultadosPorDependenciaArquivo(
                evento.files
                    .filter(arquivo => ehArquivoLinguagemAnalise(arquivo.oldUri) || ehArquivoLinguagemAnalise(arquivo.newUri))
                    .flatMap(arquivo => [arquivo.oldUri.path, arquivo.newUri.path]),
                'arquivo-linguagem-renomeado'
            );
        })
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
    const traducoes = [
        ['extension.designliquido.traduzir.css.para.foles', 'css', 'foles', ''],
        ['extension.designliquido.traduzir.delegua.para.arm.android', 'delegua', 'arm', 'android'],
        ['extension.designliquido.traduzir.delegua.para.arm.linux', 'delegua', 'arm', 'linux-arm'],
        ['extension.designliquido.traduzir.delegua.para.assemblyscript', 'delegua', 'assemblyscript', ''],
        ['extension.designliquido.traduzir.delegua.para.javascript', 'delegua', 'js', ''],
        ['extension.designliquido.traduzir.delegua.para.python', 'delegua', 'py', ''],
        ['extension.designliquido.traduzir.delegua.para.x64.linux', 'delegua', 'x64', 'linux'],
        ['extension.designliquido.traduzir.delegua.para.x64.windows', 'delegua', 'x64', 'windows'],
        ['extension.designliquido.traduzir.foles.para.css', 'foles', 'css'],
        ['extension.designliquido.traduzir.html.para.lmht', 'html', 'lmht'],
        ['extension.designliquido.traduzir.javascript.para.delegua', 'js', 'delegua'],
        ['extension.designliquido.traduzir.lincones.para.sql', 'lincones', 'sql'],
        ['extension.designliquido.traduzir.lmht.para.html', 'lmht', 'html'],
        ['extension.designliquido.traduzir.sql.para.lincones', 'sql', 'lincones'],
        ['extension.designliquido.traduzir.visualg.para.delegua', 'alg', 'delegua']
    ];

    traducoes.forEach(([comando, origem, destino, alvo]) => {
        context.subscriptions.push(
            vscode.commands.registerCommand(
                comando,
                async () => await traduzirWeb(origem, destino, alvo)
            )
        );
    });

    // Comandos de menu

    context.subscriptions.push(
        vscode.commands.registerCommand(
            'extension.designliquido.verFluxograma',
            async (uri: vscode.Uri) => {
                await gerarFluxogramaWeb(uri, context);
            }
        )
    );

    // Formatadores da família Delégua/Pituguês. Os demais dialetos (mapler, potigol,
    // portugolstudio, visualg) e as demais linguagens (foles, lmht, lincones) são
    // registrados sob demanda em './ativacao-linguagens', na primeira vez que um
    // arquivo daquela linguagem é aberto (ver garantirProvedoresLinguagem acima).
    const formatadores = [
        ['delegua', new DeleguaProvedorFormatacao(diagnosticosDelegua)],
        ['pitugues', new PituguesProvedorFormatacao(diagnosticosDelegua)],
    ];

    formatadores.forEach(([linguagem, provedor]) => {
        context.subscriptions.push(
            vscode.languages.registerDocumentFormattingEditProvider(
                linguagem as string,
                provedor as any
            )
        );
    });

    // IntelliSense
    context.subscriptions.push(
        vscode.languages.registerCompletionItemProvider(
            { language: 'delegua', pattern: '**/configuracao.delegua' },
            new LiquidoProvedorCompletude(),
            '.'
        )
    );

    const completudeProviders = [
        ['delegua', new DeleguaProvedorCompletude()],
    ];

    completudeProviders.forEach(([linguagem, provedor]) => {
        context.subscriptions.push(
            vscode.languages.registerCompletionItemProvider(
                { language: linguagem as string },
                provedor as any,
                ...(linguagem === 'delegua' ? ['@'] : [])
            )
        );
    });

    // Hovers
    const hoverProviders = [
        ['delegua', new DeleguaProvedorDocumentacaoEmEditor()],
        ['pitugues', new PituguesProvedorDocumentacaoEmEditor()]
    ];

    hoverProviders.forEach(([linguagem, provedor]) => {
        context.subscriptions.push(
            vscode.languages.registerHoverProvider(
                { language: linguagem as string },
                provedor as any
            )
        );
    });

    context.subscriptions.push(
        vscode.languages.registerDocumentLinkProvider(
            { language: 'delegua' },
            new DeleguaProvedorLinksDocumentacao()
        )
    );

    // Ir para definição
    context.subscriptions.push(
        vscode.languages.registerDefinitionProvider(
            [{ language: 'delegua' }, { language: 'pitugues' }],
            new DeleguaProvedorDefinicao()
        )
    );

    // Encontrar todas as referências
    context.subscriptions.push(
        vscode.languages.registerReferenceProvider(
            [{ language: 'delegua' }, { language: 'pitugues' }],
            new DeleguaProvedorReferencias()
        )
    );

    // Renomear símbolos
    context.subscriptions.push(
        vscode.languages.registerRenameProvider(
            [{ language: 'delegua' }, { language: 'pitugues' }],
            new DeleguaProvedorRenomeacao()
        )
    );

    // Assinaturas de métodos
    context.subscriptions.push(
        vscode.languages.registerSignatureHelpProvider(
            [{ language: 'delegua' }, { language: 'pitugues' }],
            new DeleguaProvedorAssinaturaMetodos()
        )
    );

    // Visão de Entrada e Saída
    const provedorEntradaSaida = new ProvedorVisaoEntradaSaidaWeb(context.extensionUri);
    context.subscriptions.push(
        vscode.window.registerWebviewViewProvider(
            ProvedorVisaoEntradaSaidaWeb.viewType,
            provedorEntradaSaida,
            {
                webviewOptions: {
                    retainContextWhenHidden: true
                }
            }
        )
    );

    // Comando para criar arquivo Pitugues
    const criarArquivoPitugues = vscode.commands.registerCommand(
        'extension.designliquido.criarArquivoPitugues',
        async () => {
            const workspaceFolders = vscode.workspace.workspaceFolders;
            if (!workspaceFolders) {
                vscode.window.showErrorMessage('Nenhuma pasta aberta no VS Code.');
                return;
            }

            const nomeArquivo = await vscode.window.showInputBox({
                prompt: 'Nome do arquivo (sem extensão)',
                value: 'novo-arquivo',
                validateInput: (value) => {
                    if (!value || value.trim().length === 0) {
                        return 'O nome do arquivo não pode estar vazio';
                    }
                    if (!/^[a-zA-Z0-9_-]+$/.test(value)) {
                        return 'O nome do arquivo contém caracteres inválidos';
                    }
                    return null;
                }
            });

            if (!nomeArquivo) {
                return;
            }

            const uri = vscode.Uri.joinPath(workspaceFolders[0].uri, `${nomeArquivo}.pitugues`);

            try {
                await vscode.workspace.fs.writeFile(uri, new Uint8Array());
                vscode.window.showInformationMessage(`Arquivo criado: ${nomeArquivo}.pitugues`);

                const doc = await vscode.workspace.openTextDocument(uri);
                await vscode.window.showTextDocument(doc);
            } catch (error) {
                vscode.window.showErrorMessage(`Erro ao criar arquivo: ${error}`);
            }
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

    // Tarefas do Liquido no ambiente Web, executadas via CustomExecution
    // (o host Web não tem shell). O servidor de desenvolvimento é omitido aqui.
    context.subscriptions.push(
        vscode.tasks.registerTaskProvider(
            TIPO_TAREFA_LIQUIDO,
            new ProvedorTarefasLiquidoWeb()
        )
    );

    for (const comando of comandosLiquido) {
        // No Web, não registra o comando do servidor (indisponível).
        if (comando.requerServidor) {
            continue;
        }
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

    // Configurar depuração para Web
    configurarDepuracao(
        context,
        new FabricaAdaptadorDepuracaoWeb(provedorEntradaSaida, diagnosticosDelegua)
    );
}

export function deactivate() {
    GerenciadorVisoesFluxograma.descartar();
}
