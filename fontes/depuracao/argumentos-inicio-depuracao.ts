import { DebugProtocol } from "@vscode/debugprotocol";

export interface LaunchRequestArguments extends DebugProtocol.LaunchRequestArguments {
	/** An absolute path to the "program" to debug. */
	program: string;
	/** Automatically stop target after launch. If not specified, target does not stop. */
	stopOnEntry?: boolean;
	connectType?: string;
	serverPort?: number;
	serverHost?: string;
	serverBase?: string;
	/** enable logging the Debug Adapter Protocol */
	trace?: boolean;
}
