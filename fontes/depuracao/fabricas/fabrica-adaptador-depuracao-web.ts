import * as vscode from 'vscode';

import { DeleguaSessaoDepuracaoWeb } from '../local/delegua-sessao-depuracao-web';
import { ProvedorVisaoEntradaSaida } from '../../visoes';

export class FabricaAdaptadorDepuracaoWeb implements vscode.DebugAdapterDescriptorFactory {

	constructor(private readonly provedorVisaoEntradaSaida: ProvedorVisaoEntradaSaida) {

	}

	createDebugAdapterDescriptor(_session: vscode.DebugSession): vscode.ProviderResult<vscode.DebugAdapterDescriptor> {
        return new vscode.DebugAdapterInlineImplementation(new DeleguaSessaoDepuracaoWeb(this.provedorVisaoEntradaSaida));
	}
}
