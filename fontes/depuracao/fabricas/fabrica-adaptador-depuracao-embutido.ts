import * as vscode from 'vscode';

import { DeleguaSessaoDepuracaoRemota } from '../delegua-sessao-depuracao-remota';

export class InlineDebugAdapterFactory implements vscode.DebugAdapterDescriptorFactory {

	createDebugAdapterDescriptor(_session: vscode.DebugSession): vscode.ProviderResult<vscode.DebugAdapterDescriptor> {
		// return new vscode.DebugAdapterInlineImplementation(new DeleguaSessaoDepuracao(workspaceFileAccessor));
        return new vscode.DebugAdapterInlineImplementation(new DeleguaSessaoDepuracaoRemota());
	}
}