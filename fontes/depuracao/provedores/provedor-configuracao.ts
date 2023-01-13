import * as vscode from 'vscode';

export class DeleguaConfigurationProvider implements vscode.DebugConfigurationProvider {

	/**
	 * Massage a debug configuration just before a debug session is being launched,
	 * e.g. add all missing attributes to the debug configuration.
	 */
	resolveDebugConfiguration(folder: vscode.WorkspaceFolder | undefined, config: vscode.DebugConfiguration, token?: vscode.CancellationToken): vscode.ProviderResult<vscode.DebugConfiguration> {

		// if launch.json is missing or empty
		// if (!config.type && !config.request && !config.name) {
			const editor = vscode.window.activeTextEditor;
			if (editor && editor.document.languageId === 'delegua') {
				config.type = 'delegua';
				config.name = 'Launch';
				config.request = 'launch';
				config.program = '${file}';
				config.stopOnEntry = false;
			}
		// }

		if (!config.program) {
			return vscode.window.showInformationMessage("Caminho para arquivo fonte a ser depurado não encontrado.").then(_ => {
				return undefined;	// abort launch
			});
		}

		return config;
	}
}