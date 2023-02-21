
import { basename } from 'path';

import { Source } from "@vscode/debugadapter";

import { DeleguaSessaoDepuracaoBase } from './delegua-sessao-depuracao-base';

export class DeleguaSessaoDepuracaoLocal extends DeleguaSessaoDepuracaoBase {
    protected criarReferenciaSource(caminho: string): Source {
        return new Source(
            basename(caminho),
            this.convertDebuggerPathToClient(caminho),
            undefined, 
            undefined,
            // 123,
            // '456',
            'delegua-adapter-data'
        );
    }
}