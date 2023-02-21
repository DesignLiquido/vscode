import * as vscode from 'vscode';
import * as Net from 'net';

import { DeleguaSessaoDepuracaoRemota } from '../../remota/delegua-sessao-depuracao-remota';

/**
 * Classe que descreve como chamar um tradutor de comandos entre Delégua e Visual Studio Code por servidor Socket. 
 * Este servidor de Socket *não é o mesmo servidor da linguagem Delégua*. Este é o tradutor entre comandos do
 * Visual Studio Code e o servidor de depuração Delégua. Por isso, este servidor abre em uma porta aleatória.
 */
export class DeleguaAdapterServerDescriptorFactory implements vscode.DebugAdapterDescriptorFactory {

	private server?: Net.Server;

	createDebugAdapterDescriptor(session: vscode.DebugSession, executable: vscode.DebugAdapterExecutable | undefined): vscode.ProviderResult<vscode.DebugAdapterDescriptor> {

		if (!this.server) {
			// `.listen(0)` == porta aleatória.
			this.server = Net.createServer(socket => {
				// const session = new DeleguaSessaoDepuracao(workspaceFileAccessor);
                const session = new DeleguaSessaoDepuracaoRemota();
				session.setRunAsServer(true);
				session.start(socket as NodeJS.ReadableStream, socket);
			}).listen(0);
		}

		// VSCode receberá a porta aleatória escolhida pelo tradutor.
		return new vscode.DebugAdapterServer((this.server.address() as Net.AddressInfo).port);
	}

	dispose() {
		if (this.server) {
			this.server.close();
		}
	}
}