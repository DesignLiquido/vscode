import * as vscode from 'vscode';

import { DeleguaSessaoDepuracaoLocal } from '../local/delegua-sessao-depuracao-local';

export class FabricaAdaptadorDepuracaoEmbutido implements vscode.DebugAdapterDescriptorFactory {

	createDebugAdapterDescriptor(_session: vscode.DebugSession): vscode.ProviderResult<vscode.DebugAdapterDescriptor> {
		// return new vscode.DebugAdapterInlineImplementation(new DeleguaSessaoDepuracao(workspaceFileAccessor));
        return new vscode.DebugAdapterInlineImplementation(new DeleguaSessaoDepuracaoLocal());
	}
}