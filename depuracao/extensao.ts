'use strict';

import * as Net from 'net';
import * as vscode from 'vscode';
import { randomBytes } from 'crypto';
import { tmpdir } from 'os';
import { join } from 'path';
import { platform } from 'process';
import { ProviderResult } from 'vscode';

import { DeleguaSessaoDepuracao } from './delegua-sessao-depuracao';
import { ativarDepuracao } from './ativacao-depuracao';

/*
 * The compile time flag 'runMode' controls how the debug adapter is run.
 * Please note: the test suite only supports 'external' mode.
 */
const runMode: 'external' | 'server' | 'namedPipeServer' | 'inline' = 'inline';

export function activate(context: vscode.ExtensionContext) {

	// debug adapters can be run in different ways by using a vscode.DebugAdapterDescriptorFactory:
	switch (runMode) {
		case 'server':
			// run the debug adapter as a server inside the extension and communicate via a socket
			ativarDepuracao(context, new DeleguaAdapterServerDescriptorFactory());
			break;

		case 'namedPipeServer':
			// run the debug adapter as a server inside the extension and communicate via a named pipe (Windows) or UNIX domain socket (non-Windows)
			ativarDepuracao(context, new DeleguaAdapterNamedPipeServerDescriptorFactory());
			break;

		case 'external': default:
			// run the debug adapter as a separate process
			ativarDepuracao(context, new DeleguaDebugAdapterExecutableFactory());
			break;

		case 'inline':
			// run the debug adapter inside the extension and directly talk to it
			ativarDepuracao(context, new DeleguaDebugAdapterExecutableFactory());
			break;
	}
}

export function deactivate() {
	// nothing to do
}

class DeleguaDebugAdapterExecutableFactory implements vscode.DebugAdapterDescriptorFactory {

	// The following use of a DebugAdapter factory shows how to control what debug adapter executable is used.
	// Since the code implements the default behavior, it is absolutely not necessary and we show it here only for educational purposes.

	createDebugAdapterDescriptor(_session: vscode.DebugSession, executable: vscode.DebugAdapterExecutable | undefined): ProviderResult<vscode.DebugAdapterDescriptor> {
		// param "executable" contains the executable optionally specified in the package.json (if any)

		// use the executable specified in the package.json if it exists or determine it based on some other information (e.g. the session)
		// if (!executable) {
			const command = "C:\\Users\\leone\\AppData\\Roaming\\npm\\delegua.cmd";
			const args = [
				"--depurador",
				"D:\\GitHub\\delegua-vscode\\exemplos\\index.delegua"
			];
			const options = {
				// cwd: "working directory for executable",
				// env: { "envVariable": "some value" }
			};
			executable = new vscode.DebugAdapterExecutable(command, args, options);
		// }

		// make VS Code launch the DA executable
		return executable;
	}
}

class DeleguaAdapterServerDescriptorFactory implements vscode.DebugAdapterDescriptorFactory {

	private server?: Net.Server;

	createDebugAdapterDescriptor(session: vscode.DebugSession, executable: vscode.DebugAdapterExecutable | undefined): vscode.ProviderResult<vscode.DebugAdapterDescriptor> {

		if (!this.server) {
			// start listening on a random port
			this.server = Net.createServer(socket => {
				// const session = new DeleguaSessaoDepuracao(workspaceFileAccessor);
                const session = new DeleguaSessaoDepuracao();
				session.setRunAsServer(true);
				session.start(socket as NodeJS.ReadableStream, socket);
			}).listen(0);
		}

		// make VS Code connect to debug server
		return new vscode.DebugAdapterServer((this.server.address() as Net.AddressInfo).port);
	}

	dispose() {
		if (this.server) {
			this.server.close();
		}
	}
}

class DeleguaAdapterNamedPipeServerDescriptorFactory implements vscode.DebugAdapterDescriptorFactory {

	private server?: Net.Server;

	createDebugAdapterDescriptor(session: vscode.DebugSession, executable: vscode.DebugAdapterExecutable | undefined): vscode.ProviderResult<vscode.DebugAdapterDescriptor> {

		if (!this.server) {
			// start listening on a random named pipe path
			const pipeName = randomBytes(10).toString('utf8');
			const pipePath = platform === "win32" ? join('\\\\.\\pipe\\', pipeName) : join(tmpdir(), pipeName);

			this.server = Net.createServer(socket => {
				// const session = new DeleguaSessaoDepuracao(workspaceFileAccessor);
                const session = new DeleguaSessaoDepuracao();
				session.setRunAsServer(true);
				session.start(<NodeJS.ReadableStream>socket, socket);
			}).listen(pipePath);
		}

		// make VS Code connect to debug server
		return new vscode.DebugAdapterNamedPipeServer(this.server.address() as string);
	}

	dispose() {
		if (this.server) {
			this.server.close();
		}
	}
}
