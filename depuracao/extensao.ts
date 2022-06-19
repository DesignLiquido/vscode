'use strict';

import * as Net from 'net';
import * as vscode from 'vscode';
import { randomBytes } from 'crypto';
import { tmpdir } from 'os';
import { join } from 'path';
import { platform } from 'process';

import { DeleguaSessaoDepuracao } from './delegua-sessao-depuracao';
import { ativarDepuracao } from './ativacao-depuracao';
import { DeleguaAdapterServerDescriptorFactory, DeleguaDebugAdapterExecutableFactory } from './fabricas';

/*
 * The compile time flag 'runMode' controls how the debug adapter is run.
 * Please note: the test suite only supports 'external' mode.
 */
// const runMode: 'external' | 'server' | 'namedPipeServer' | 'inline' = 'inline';
const runMode: 'external' | 'server' | 'namedPipeServer' | 'inline' = 'server';

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
