'use strict';

import * as vscode from 'vscode';

import { FileAccessor } from './assessor-arquivos';
import { DeleguaConfigurationProvider } from './provedores';
import { FabricaAdaptadorDepuracaoEmbutido } from './fabricas';

export function configurarDepuracao(context: vscode.ExtensionContext, factory?: vscode.DebugAdapterDescriptorFactory) {

	context.subscriptions.push(
		vscode.commands.registerCommand('extension.delegua.runEditorContents', (resource: vscode.Uri) => {
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
		vscode.commands.registerCommand('extension.delegua.debugEditorContents', (resource: vscode.Uri) => {
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
		vscode.commands.registerCommand('extension.delegua.toggleFormatting', (variable) => {
			const ds = vscode.debug.activeDebugSession;
			if (ds) {
				ds.customRequest('toggleFormatting');
			}
		})
	);

	context.subscriptions.push(vscode.commands.registerCommand('extension.delegua.getProgramName', config => {
		return vscode.window.showInputBox({
			placeHolder: "Por favor, forneça o nome de um arquivo Delégua no diretório de trabalho",
			value: "index.delegua"
		});
	}));

	// register a configuration provider for 'delegua' debug type
	const provider = new DeleguaConfigurationProvider();
	context.subscriptions.push(vscode.debug.registerDebugConfigurationProvider('delegua', provider));

	// Configurações dinâmicas de inicialização da depuração.
	context.subscriptions.push(vscode.debug.registerDebugConfigurationProvider('delegua', {
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

	if (!factory) {
		factory = new FabricaAdaptadorDepuracaoEmbutido();
	}
	context.subscriptions.push(vscode.debug.registerDebugAdapterDescriptorFactory('delegua', factory));
	if ('dispose' in factory) {
		context.subscriptions.push(factory as any);
	}
}

export const workspaceFileAccessor: FileAccessor = {
	async readFile(path: string): Promise<Uint8Array> {
		let uri: vscode.Uri;
		try {
			uri = pathToUri(path);
		} catch (e) {
			return new TextEncoder().encode(`cannot read '${path}'`);
		}

		return await vscode.workspace.fs.readFile(uri);
	},
	async writeFile(path: string, contents: Uint8Array) {
		await vscode.workspace.fs.writeFile(pathToUri(path), contents);
	}
};

function pathToUri(path: string) {
	try {
		return vscode.Uri.file(path);
	} catch (e) {
		return vscode.Uri.parse(path);
	}
}
