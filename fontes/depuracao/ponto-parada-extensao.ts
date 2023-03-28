import { DebugProtocol } from "@vscode/debugprotocol";

export class PontoParadaExtensao implements DebugProtocol.Breakpoint {
    id?: number | undefined;
    verified: boolean;
    message?: string | undefined;
    source?: DebugProtocol.Source | undefined;
    line?: number | undefined;
    column?: number | undefined;
    endLine?: number | undefined;
    endColumn?: number | undefined;
    instructionReference?: string | undefined;
    offset?: number | undefined;
}