import * as vscode from 'vscode';
import * as Net from 'net';

import { randomBytes } from 'crypto';
import { tmpdir } from 'os';
import { join } from 'path';
import { platform } from 'process';
import { DeleguaSessaoDepuracaoRemota } from '../delegua-sessao-depuracao-remota';

export class DeleguaAdapterNamedPipeServerDescriptorFactory
    implements vscode.DebugAdapterDescriptorFactory
{
    private server?: Net.Server;

    createDebugAdapterDescriptor(
        session: vscode.DebugSession,
        executable: vscode.DebugAdapterExecutable | undefined
    ): vscode.ProviderResult<vscode.DebugAdapterDescriptor> {
        if (!this.server) {
            // start listening on a random named pipe path
            const pipeName = randomBytes(10).toString('utf8');
            const pipePath =
                platform === 'win32'
                    ? join('\\\\.\\pipe\\', pipeName)
                    : join(tmpdir(), pipeName);

            this.server = Net.createServer((socket) => {
                // const session = new DeleguaSessaoDepuracao(workspaceFileAccessor);
                const session = new DeleguaSessaoDepuracaoRemota();
                session.setRunAsServer(true);
                session.start(<NodeJS.ReadableStream>socket, socket);
            }).listen(pipePath);
        }

        // make VS Code connect to debug server
        return new vscode.DebugAdapterNamedPipeServer(
            this.server.address() as string
        );
    }

    dispose() {
        if (this.server) {
            this.server.close();
        }
    }
}
