import * as vscode from 'vscode';

import { DeleguaSessaoDepuracaoWeb } from '../local/delegua-sessao-depuracao-web';

export class FabricaAdaptadorDepuracaoWeb implements vscode.DebugAdapterDescriptorFactory {

	createDebugAdapterDescriptor(_session: vscode.DebugSession): vscode.ProviderResult<vscode.DebugAdapterDescriptor> {
        return new vscode.DebugAdapterInlineImplementation(new DeleguaSessaoDepuracaoWeb());
	}
}
