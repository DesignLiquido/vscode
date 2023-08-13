import * as vscode from 'vscode';

export class ProvedorConfiguracaoDelegua
    implements vscode.DebugConfigurationProvider
{
    /**
     * Verifica atributos de inicialização e os configura, adicionando 
	 * valores para atributos não-presentes.
     */
    resolveDebugConfiguration(
        folder: vscode.WorkspaceFolder | undefined,
        config: vscode.DebugConfiguration,
        token?: vscode.CancellationToken
    ): vscode.ProviderResult<vscode.DebugConfiguration> {
        // Se não existe launch.json, ou se launch.json está vazio.
		if (!config.type && !config.request && !config.name) {
			const editor = vscode.window.activeTextEditor;
			if (editor && editor.document.languageId) {
				switch (editor.document.languageId) {
                    case 'birl':
					case 'delegua':
                    case 'pitugues':
                    case 'mapler':
                    case 'portugolstudio':
					case 'visualg':
						config.type = 'delegua';
						config.name = 'Executar arquivo Delégua ou dialeto';
						break;
					default:
						break;
				}

				config.request = 'launch';
				config.program = '${file}';
				config.stopOnEntry = false;
			}
        }

        if (!config.program) {
            return vscode.window
                .showInformationMessage(
                    'Caminho para arquivo fonte a ser depurado não encontrado.'
                )
                .then((_) => {
                    return undefined; // abort launch
                });
        }

        return config;
    }
}
