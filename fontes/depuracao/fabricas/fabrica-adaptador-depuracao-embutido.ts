import * as vscode from 'vscode';

import { DeleguaSessaoDepuracaoLocal } from '../local/delegua-sessao-depuracao-local';
import { ProvedorVisaoEntradaSaida } from '../../visoes';

export class FabricaAdaptadorDepuracaoEmbutido implements vscode.DebugAdapterDescriptorFactory {

	constructor(private readonly provedorVisaoEntradaSaida: ProvedorVisaoEntradaSaida) {

	}

	createDebugAdapterDescriptor(_session: vscode.DebugSession): vscode.ProviderResult<vscode.DebugAdapterDescriptor> {
        return new vscode.DebugAdapterInlineImplementation(new DeleguaSessaoDepuracaoLocal(this.provedorVisaoEntradaSaida));
	}
}