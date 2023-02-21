import { Source } from "@vscode/debugadapter";
import { DeleguaSessaoDepuracaoBase } from "./delegua-sessao-depuracao-base";

export class DeleguaSessaoDepuracaoWeb extends DeleguaSessaoDepuracaoBase {
    criarReferenciaSource(caminho: string): Source {
        return new Source(
            caminho,
            this.convertDebuggerPathToClient(caminho),
            undefined, 
            undefined,
            // 123,
            // '456',
            'delegua-adapter-data'
        );
    }
}