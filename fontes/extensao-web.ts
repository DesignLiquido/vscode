import * as vscode from 'vscode';

import { configurarDepuracao } from './depuracao/configuracao-depuracao';
import {
    DeleguaProvedorDocumentacaoEmEditor,
    FolesProvedorDocumentacaoEmEditor,
    LinConEsProvedorDocumentacaoEmEditor,
    VisuAlgProvedorDocumentacaoEmEditor,
    LmhtProvedorDocumentacaoEmEditor
} from './documentacao-em-editor';
import {
    DeleguaProvedorCompletude,
    FolesProvedorCompletude,
    LiquidoProvedorCompletude,
    VisuAlgProvedorCompletude,
    LmhtProvedorCompletude
} from './completude';

// Importações individuais dos formatadores
import { DeleguaProvedorFormatacao } from './formatadores/delegua-provedor-formatacao';
import { VisualgProvedorFormatacao } from './formatadores/visualg-provedor-formatacao';
import { MaplerProvedorFormatacao } from './formatadores/mapler-provedor-formatacao';
import { PotigolProvedorFormatacao } from './formatadores/potigol-provedor-formatacao';
import { PortugolStudioProvedorFormatacao } from './formatadores/portugol-studio-provedor-formatacao';

import { executarAnalises } from './analise-codigo';
import { DeleguaProvedorAssinaturaMetodos } from './assinaturas-metodos';
import { tentarFecharTagLmht } from './linguagens/lmht/fechamento-estruturas';
import { ProvedorVisaoEntradaSaida } from './visoes';
import { FabricaAdaptadorDepuracaoWeb } from './depuracao/fabricas/fabrica-adaptador-depuracao-web';

let changeTimeout: NodeJS.Timeout | null = null;

/**
 * Função auxiliar para mostrar aviso sobre recursos não disponíveis na web
 */
function mostrarAvisoRecursoIndisponivelWeb(recurso: string) {
    vscode.window.showWarningMessage(
        `${recurso} não está disponível na versão web do VSCode. Use a versão desktop para este recurso.`
    );
}

/**
 * Versão simplificada de tradução que mostra aviso
 */
async function traduzirWeb(origem: string, destino: string) {
    mostrarAvisoRecursoIndisponivelWeb('Tradução de código');
}

export function activate(context: vscode.ExtensionContext) {
    const diagnosticosDelegua = vscode.languages.createDiagnosticCollection("delegua");
    context.subscriptions.push(diagnosticosDelegua);

    // Análise de código em tempo real
    if (vscode.window.activeTextEditor) {
        executarAnalises(vscode.window.activeTextEditor.document, diagnosticosDelegua);
    }

    context.subscriptions.push(
        vscode.workspace.onDidOpenTextDocument(doc => {
            if (['birl', 'delegua', 'mapler', 'visualg', 'portugol-studio'].includes(doc.languageId)) {
                executarAnalises(doc, diagnosticosDelegua);
            }
        }),
        vscode.window.onDidChangeActiveTextEditor(editor => {
            if (editor && ['birl', 'delegua', 'mapler', 'visualg', 'portugol-studio'].includes(editor.document.languageId)) {
                executarAnalises(editor.document, diagnosticosDelegua);
            }
        }),
        vscode.workspace.onDidChangeTextDocument((evento) => {
            switch (evento.document.languageId) {
                case 'birl':
                case 'delegua':
                case 'mapler':
                case 'visualg':
                    if (changeTimeout !== null) {
                        clearTimeout(changeTimeout);
                    }
                    changeTimeout = setTimeout(function () {
                        if (changeTimeout) {
                            clearTimeout(changeTimeout);
                        }
                        changeTimeout = null;
                        executarAnalises(evento.document, diagnosticosDelegua);
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
        vscode.workspace.onDidCloseTextDocument(doc => diagnosticosDelegua.delete(doc.uri))
    );

    // Traduções - Com aviso de que não estão disponíveis na web
    const traducoes = [
        ['extension.designliquido.traduzir.css.para.foles', 'css', 'foles'],
        ['extension.designliquido.traduzir.delegua.para.assemblyscript', 'delegua', 'assemblyscript'],
        ['extension.designliquido.traduzir.delegua.para.javascript', 'delegua', 'js'],
        ['extension.designliquido.traduzir.delegua.para.python', 'delegua', 'py'],
        ['extension.designliquido.traduzir.foles.para.css', 'foles', 'css'],
        ['extension.designliquido.traduzir.html.para.lmht', 'html', 'lmht'],
        ['extension.designliquido.traduzir.javascript.para.delegua', 'js', 'delegua'],
        ['extension.designliquido.traduzir.lincones.para.sql', 'lincones', 'sql'],
        ['extension.designliquido.traduzir.lmht.para.html', 'lmht', 'html'],
        ['extension.designliquido.traduzir.sql.para.lincones', 'sql', 'lincones'],
        ['extension.designliquido.traduzir.visualg.para.delegua', 'alg', 'delegua']
    ];

    traducoes.forEach(([comando, origem, destino]) => {
        context.subscriptions.push(
            vscode.commands.registerCommand(
                comando,
                async () => await traduzirWeb(origem, destino)
            )
        );
    });

    // Formatadores - Agora todos funcionam na web!
    const formatadores = [
        ['delegua', new DeleguaProvedorFormatacao(diagnosticosDelegua)],
        ['mapler', new MaplerProvedorFormatacao()],
        ['potigol', new PotigolProvedorFormatacao()],
        ['portugolstudio', new PortugolStudioProvedorFormatacao()],
        ['visualg', new VisualgProvedorFormatacao()]
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
        ['foles', new FolesProvedorCompletude()],
        ['lmht', new LmhtProvedorCompletude()],
        ['visualg', new VisuAlgProvedorCompletude()]
    ];

    completudeProviders.forEach(([linguagem, provedor]) => {
        context.subscriptions.push(
            vscode.languages.registerCompletionItemProvider(
                { language: linguagem as string },
                provedor as any
            )
        );
    });

    // Hovers
    const hoverProviders = [
        ['delegua', new DeleguaProvedorDocumentacaoEmEditor()],
        ['foles', new FolesProvedorDocumentacaoEmEditor()],
        ['lincones', new LinConEsProvedorDocumentacaoEmEditor()],
        ['lmht', new LmhtProvedorDocumentacaoEmEditor()],
        ['visualg', new VisuAlgProvedorDocumentacaoEmEditor()]
    ];

    hoverProviders.forEach(([linguagem, provedor]) => {
        context.subscriptions.push(
            vscode.languages.registerHoverProvider(
                { language: linguagem as string },
                provedor as any
            )
        );
    });

    // Assinaturas de métodos
    context.subscriptions.push(
        vscode.languages.registerSignatureHelpProvider(
            { language: 'delegua' },
            new DeleguaProvedorAssinaturaMetodos()
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

    // Configurar depuração para Web
    configurarDepuracao(
        context,
        new FabricaAdaptadorDepuracaoWeb(provedorEntradaSaida, diagnosticosDelegua)
    );
}

export function deactivate() {
    // nothing to do
}