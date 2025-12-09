import * as vscode from 'vscode';

/**
 * Classe que descreve como chamar um tradutor de comandos entre Delégua e Visual Studio Code por executável.
 * Aqui apenas a título de exemplo, mas provavelmente será removida.
 */
export class DeleguaDebugAdapterExecutableFactory implements vscode.DebugAdapterDescriptorFactory {

	// O uso seguinte de uma fábrica DebugAdapter mostra como controlar qual executável do adaptador de depuração é usado.
	// Como o código implementa o comportamento padrão, não é absolutamente necessário e mostramos aqui apenas para fins educacionais.

	createDebugAdapterDescriptor(_session: vscode.DebugSession, executable: vscode.DebugAdapterExecutable | undefined): vscode.ProviderResult<vscode.DebugAdapterDescriptor> {
		// parâmetro "executable" contém o executável opcionalmente especificado no package.json (se houver)

		// usa o executável especificado no package.json se existir ou o determina com base em outras informações (por exemplo, a sessão)
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

		// faz o VS Code iniciar o executável DA
		return executable;
	}
}