'use strict';

import * as vscode from 'vscode';

import { AcessorArquivos } from './acessor-arquivos';
import { ProvedorConfiguracaoDelegua } from './provedores';

export function configurarDepuracao(
	contexto: vscode.ExtensionContext, 
	fabricaAdaptadorDepuracao: vscode.DebugAdapterDescriptorFactory
) {

	contexto.subscriptions.push(
		vscode.commands.registerCommand('extension.designliquido.runEditorContents', (resource: vscode.Uri) => {
			let targetResource = resource;
			if (!targetResource && vscode.window.activeTextEditor) {
				targetResource = vscode.window.activeTextEditor.document.uri;
			}
			if (targetResource) {
				vscode.debug.startDebugging(undefined, {
					type: 'delegua',
					name: 'Executar Arquivo',
					request: 'launch',
					program: targetResource.fsPath
				},
					{ noDebug: true }
				);
			}
		}),

		vscode.commands.registerCommand('extension.designliquido.debugEditorContents', (resource: vscode.Uri) => {
			let targetResource = resource;
			if (!targetResource && vscode.window.activeTextEditor) {
				targetResource = vscode.window.activeTextEditor.document.uri;
			}
			if (targetResource) {
				vscode.debug.startDebugging(undefined, {
					type: 'delegua',
					name: 'Depurar Arquivo',
					request: 'launch',
					program: targetResource.fsPath,
					stopOnEntry: false
				});
			}
		}),

		vscode.commands.registerCommand('extension.designliquido.toggleFormatting', (variable) => {
			const sessaoDepuracao = vscode.debug.activeDebugSession;
			if (sessaoDepuracao) {
				sessaoDepuracao.customRequest('toggleFormatting');
			}
		})
	);

	contexto.subscriptions.push(vscode.commands.registerCommand('extension.designliquido.getProgramName', config => {
		return vscode.window.showInputBox({
			placeHolder: "Por favor, forneça o nome de um arquivo Delégua no diretório de trabalho",
			value: "index.delegua"
		});
	}));

	// Registra um provedor de configuração de tipo de depuração 'delegua' 
	// (que inclui também todos os dialetos derivados).
	const provedorConfiguracaoDelegua = new ProvedorConfiguracaoDelegua();
	contexto.subscriptions.push(vscode.debug.registerDebugConfigurationProvider('delegua', provedorConfiguracaoDelegua));

	// Configurações dinâmicas de inicialização da depuração.
	contexto.subscriptions.push(vscode.debug.registerDebugConfigurationProvider('delegua', {
		provideDebugConfigurations(folder: vscode.WorkspaceFolder | undefined): vscode.ProviderResult<vscode.DebugConfiguration[]> {
			return [
				{
					name: "Execução do arquivo atual",
					request: "launch",
					type: "delegua",
					program: "${file}"
				}
			];
		}
	}, vscode.DebugConfigurationProviderTriggerKind.Dynamic));

	contexto.subscriptions.push(vscode.debug.registerDebugAdapterDescriptorFactory('delegua', fabricaAdaptadorDepuracao));
	if ('dispose' in fabricaAdaptadorDepuracao) {
		contexto.subscriptions.push(fabricaAdaptadorDepuracao as any);
	}
}

export const workspaceFileAccessor: AcessorArquivos = {
	async lerArquivo(caminho: string): Promise<Uint8Array> {
		let uri: vscode.Uri;
		try {
			uri = pathToUri(caminho);
		} catch (e) {
			return new TextEncoder().encode(`Não foi possível ler '${caminho}'`);
		}

		return await vscode.workspace.fs.readFile(uri);
	},
	
	async escreverArquivo(caminho: string, conteudo: Uint8Array) {
		await vscode.workspace.fs.writeFile(pathToUri(caminho), conteudo);
	}
};

function pathToUri(path: string) {
	try {
		return vscode.Uri.file(path);
	} catch (e) {
		return vscode.Uri.parse(path);
	}
}
