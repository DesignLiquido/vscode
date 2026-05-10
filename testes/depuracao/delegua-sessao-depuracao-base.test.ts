import { beforeEach, describe, expect, it, jest } from '@jest/globals';

const mostrarInformacao = jest.fn();
const mostrarAviso = jest.fn();
const mostrarErro = jest.fn();
const definirStatus = jest.fn();
const uriFile = jest.fn((caminho: string) => ({ fsPath: caminho }));

const mockVscode = {
    window: {
        showInformationMessage: mostrarInformacao,
        showWarningMessage: mostrarAviso,
        showErrorMessage: mostrarErro,
        setStatusBarMessage: definirStatus,
        activeTextEditor: undefined as any,
    },
    Uri: {
        file: uriFile,
    },
    Range: class {
        constructor(
            public readonly startLine: number,
            public readonly startCharacter: number,
            public readonly endLine: number,
            public readonly endCharacter: number
        ) {}
    },
    Diagnostic: class {
        public source?: string;
        constructor(public readonly range: any, public readonly message: string, public readonly severity: number) {}
    },
    DiagnosticSeverity: {
        Error: 0,
    },
};

const loggerSetup = jest.fn();

jest.mock('vscode', () => mockVscode, { virtual: true });

jest.mock('@vscode/debugadapter', () => {
    class LoggingDebugSession {
        public readonly eventosEnviados: any[] = [];
        public respostaEnviada: any;
        setDebuggerLinesStartAt1(_valor: boolean) {}
        setDebuggerColumnsStartAt1(_valor: boolean) {}
        convertDebuggerLineToClient(linha: number) {
            return linha;
        }
        sendResponse(resposta: any) {
            this.respostaEnviada = resposta;
        }
        sendEvent(evento: any) {
            this.eventosEnviados.push(evento);
        }
        configurationDoneRequest(response: any, _args: any) {
            this.sendResponse(response);
        }
        pauseRequest(response: any, _args: any) {
            this.sendResponse(response);
        }
    }

    class Handles<T> {
        private atual = 1;
        create(_valor: T) {
            return this.atual++;
        }
    }

    class InitializedEvent { public readonly event = 'initialized'; }
    class OutputEvent {
        public readonly event = 'output';
        public readonly body: any = {};
        constructor(public readonly output: string, public readonly category?: string) {}
    }
    class StoppedEvent {
        public readonly event = 'stopped';
        constructor(public readonly reason: string, public readonly threadId: number) {}
    }
    class TerminatedEvent { public readonly event = 'terminated'; }
    class BreakpointEvent {
        public readonly event = 'breakpoint';
        constructor(public readonly reason: string, public readonly body: any) {}
    }
    class Breakpoint {
        public id?: number;
        public source?: any;
        constructor(public readonly verified: boolean, public readonly line: number) {}
    }
    class Scope {
        constructor(public readonly name: string, public readonly variablesReference: number, public readonly expensive: boolean) {}
    }
    class Source {
        constructor(
            public readonly name: string,
            public readonly path?: string,
            public readonly sourceReference?: number,
            public readonly origin?: string,
            public readonly adapterData?: string
        ) {}
    }
    class StackFrame {
        constructor(public readonly id: number, public readonly name: string, public readonly source: any, public readonly line: number) {}
    }
    class Thread {
        constructor(public readonly id: number, public readonly name: string) {}
    }

    return {
        LoggingDebugSession,
        Handles,
        InitializedEvent,
        OutputEvent,
        StoppedEvent,
        TerminatedEvent,
        BreakpointEvent,
        Breakpoint,
        Scope,
        Source,
        StackFrame,
        Thread,
        Logger: { LogLevel: { Verbose: 0, Stop: 1 } },
        logger: { setup: loggerSetup },
    };
});

const instanciasTempoExecucao: any[] = [];

jest.mock('../../fontes/depuracao/local/delegua-tempo-execucao-local', () => ({
    DeleguaTempoExecucaoLocal: class {
        public readonly callbacks = new Map<string, Function[]>();
        public readonly iniciar = jest.fn(async () => undefined);
        public readonly definirPontosParada = jest.fn();
        public readonly continuar = jest.fn();
        public readonly passo = jest.fn();
        public readonly pausar = jest.fn();
        public readonly adentrarEscopo = jest.fn();
        public readonly sairEscopo = jest.fn();
        public readonly finalizacao = jest.fn();
        public readonly variaveis = jest.fn(() => []);
        public readonly pilhaExecucao = jest.fn(() => []);

        constructor(_provedor: any, _diagnosticos: any) {
            instanciasTempoExecucao.push(this);
        }

        on(evento: string, callback: Function) {
            const lista = this.callbacks.get(evento) || [];
            lista.push(callback);
            this.callbacks.set(evento, lista);
        }

        disparar(evento: string, ...args: any[]) {
            const lista = this.callbacks.get(evento) || [];
            for (const callback of lista) callback(...args);
        }
    },
}));

import { Source } from '@vscode/debugadapter';
import { DeleguaSessaoDepuracaoBase } from '../../fontes/depuracao/delegua-sessao-depuracao-base';

class SessaoDepuracaoTeste extends DeleguaSessaoDepuracaoBase {
    protected criarReferenciaSource(caminho: string): Source {
        return new Source(caminho, caminho, undefined, undefined, 'delegua-adapter-data');
    }
}

describe('DeleguaSessaoDepuracaoBase', () => {
    beforeEach(() => {
        instanciasTempoExecucao.length = 0;
        mostrarInformacao.mockReset();
        mostrarAviso.mockReset();
        mostrarErro.mockReset();
        definirStatus.mockReset();
        uriFile.mockReset();
        uriFile.mockImplementation((caminho: string) => ({ fsPath: caminho }));
        mockVscode.window.activeTextEditor = undefined;
    });

    function criarSessao() {
        const provedorVisao = {
            escreverEmSaida: jest.fn(),
            escreverEmSaidaMesmaLinha: jest.fn(),
            limparTerminal: jest.fn(),
        };
        const diagnosticos = { set: jest.fn() };
        const sessao = new SessaoDepuracaoTeste(provedorVisao as any, diagnosticos as any) as any;
        const tempoExecucao = instanciasTempoExecucao[0];

        return { sessao, tempoExecucao, provedorVisao, diagnosticos };
    }

    it('deve configurar capacidades no initializeRequest e enviar evento initialized', () => {
        const { sessao } = criarSessao();
        const resposta: any = {};

        sessao.initializeRequest(resposta, {} as any);

        expect(resposta.body.supportsEvaluateForHovers).toBe(true);
        expect(resposta.body.supportsTerminateRequest).toBe(true);
        expect(sessao.respostaEnviada).toBe(resposta);
        expect(sessao.eventosEnviados.some((evento: any) => evento.event === 'initialized')).toBe(true);
    });

    it('deve definir breakpoints e encaminhar para tempo de execucao', () => {
        const { sessao, tempoExecucao } = criarSessao();
        const resposta: any = {};

        sessao.setBreakPointsRequest(resposta, {
            lines: [3, 8],
            source: { path: 'C:/projeto/arquivo.delegua' },
        } as any);

        expect(tempoExecucao.definirPontosParada).toHaveBeenCalledTimes(1);
        expect(resposta.body.breakpoints).toHaveLength(2);
        expect(resposta.body.breakpoints[0].id).toBe(1);
        expect(resposta.body.breakpoints[1].id).toBe(2);
    });

    it('deve montar scopes e retornar variaveis globais filtradas', () => {
        const { sessao, tempoExecucao } = criarSessao();
        tempoExecucao.variaveis.mockReturnValue([
            { nome: 'ativo', valor: true, tipo: 'logico' },
            { nome: 'nulo', valor: null, tipo: 'qualquer' },
            { nome: 'ativo', valor: false, tipo: 'logico' },
            { nome: '', valor: 1, tipo: 'numero' },
        ]);

        const respostaEscopos: any = {};
        sessao.scopesRequest(respostaEscopos, { frameId: 10 } as any);
        const referenciaGlobal = respostaEscopos.body.scopes[0].variablesReference;

        const respostaVariaveis: any = {};
        sessao.variablesRequest(respostaVariaveis, { variablesReference: referenciaGlobal } as any);

        expect(respostaVariaveis.body.variables).toEqual([
            { name: 'ativo', type: 'logico', value: 'verdadeiro', variablesReference: 0 },
            { name: 'nulo', type: 'qualquer', value: 'nulo', variablesReference: 0 },
        ]);
    });

    it('deve retornar variaveis vazias para referencia nao global', () => {
        const { sessao } = criarSessao();
        const resposta: any = {};

        sessao.variablesRequest(resposta, { variablesReference: 999 } as any);

        expect(resposta.body.variables).toEqual([]);
    });

    it('deve mapear stack trace para StackFrame e total de frames', () => {
        const { sessao, tempoExecucao } = criarSessao();
        tempoExecucao.pilhaExecucao.mockReturnValue([
            { id: 1, nome: 'linha 1', arquivo: '/a.delegua', linha: 7 },
            { id: 2, nome: 'linha 2', arquivo: '/b.delegua', linha: 11 },
        ]);
        const resposta: any = {};

        sessao.stackTraceRequest(resposta, {} as any);

        expect(resposta.body.totalFrames).toBe(2);
        expect(resposta.body.stackFrames[0].line).toBe(7);
        expect(resposta.body.stackFrames[0].source.name).toBe('/a.delegua');
    });

    it('deve encaminhar requests de controle para tempo de execucao', () => {
        const { sessao, tempoExecucao } = criarSessao();

        sessao.continueRequest({} as any, {} as any);
        sessao.nextRequest({} as any, {} as any);
        sessao.pauseRequest({} as any, {} as any);
        sessao.stepInRequest({} as any, {} as any);
        sessao.stepOutRequest({} as any, {} as any);
        sessao.terminateRequest({} as any, {} as any);

        expect(tempoExecucao.continuar).toHaveBeenCalled();
        expect(tempoExecucao.passo).toHaveBeenCalled();
        expect(tempoExecucao.pausar).toHaveBeenCalled();
        expect(tempoExecucao.adentrarEscopo).toHaveBeenCalled();
        expect(tempoExecucao.sairEscopo).toHaveBeenCalled();
        expect(tempoExecucao.finalizacao).toHaveBeenCalled();
    });

    it('deve emitir thread fixa no threadsRequest', () => {
        const { sessao } = criarSessao();
        const resposta: any = {};

        sessao.threadsRequest(resposta);

        expect(resposta.body.threads).toHaveLength(1);
        expect(resposta.body.threads[0].name).toBe('thread 1');
    });

    it('deve tratar evento de saida com erro incluindo diagnostico e terminal', () => {
        const { sessao, tempoExecucao, provedorVisao, diagnosticos } = criarSessao();

        tempoExecucao.disparar('saida', new Error('falha de runtime'), false, 'C:/projeto/erro.delegua', 9);

        expect(sessao.eventosEnviados.some((evento: any) => evento.event === 'output')).toBe(true);
        expect(provedorVisao.escreverEmSaida).toHaveBeenCalledWith('\r\n[Erro] Linha 9: falha de runtime');
        expect(diagnosticos.set).toHaveBeenCalled();
    });

    it('deve tratar evento de saida textual na mesma linha', () => {
        const { tempoExecucao, provedorVisao } = criarSessao();

        tempoExecucao.disparar('saida', 'texto\\ncontinuacao\\titem', true);

        expect(provedorVisao.escreverEmSaidaMesmaLinha).toHaveBeenCalledWith('texto\r\ncontinuacao\titem');
    });
});
