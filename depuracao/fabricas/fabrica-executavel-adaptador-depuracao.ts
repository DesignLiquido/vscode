import * as vscode from 'vscode';

/**
 * Classe que descreve como chamar um tradutor de comandos entre Delégua e Visual Studio Code por executável. 
 * Aqui apenas a título de exemplo, mas provavelmente será removida.
 */
export class DeleguaDebugAdapterExecutableFactory implements vscode.DebugAdapterDescriptorFactory {

	// The following use of a DebugAdapter factory shows how to control what debug adapter executable is used.
	// Since the code implements the default behavior, it is absolutely not necessary and we show it here only for educational purposes.

	createDebugAdapterDescriptor(_session: vscode.DebugSession, executable: vscode.DebugAdapterExecutable | undefined): vscode.ProviderResult<vscode.DebugAdapterDescriptor> {
		// param "executable" contains the executable optionally specified in the package.json (if any)

		// use the executable specified in the package.json if it exists or determine it based on some other information (e.g. the session)
		if (!executable) {
			const command = "C:\\Users\\leone\\AppData\\Roaming\\npm\\delegua.cmd";
			const args = [
				"--depurador",
				"D:\\GitHub\\vscode\\exemplos\\index.delegua"
			];
			const options = {
				// cwd: "working directory for executable",
				// env: { "envVariable": "some value" }
			};
			executable = new vscode.DebugAdapterExecutable(command, args, options);
		}

		// make VS Code launch the DA executable
		return executable;
	}
}