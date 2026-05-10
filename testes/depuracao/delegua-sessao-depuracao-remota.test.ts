import { beforeEach, describe, expect, it, jest } from '@jest/globals';

const mostrarInformacao = jest.fn();
const mostrarAviso = jest.fn();
const mostrarErro = jest.fn();
const definirStatus = jest.fn();

const mockVscode = {
    window: {
        showInformationMessage: mostrarInformacao,
        showWarningMessage: mostrarAviso,
        showErrorMessage: mostrarErro,
        setStatusBarMessage: definirStatus,
    },
};

const loggerSetup = jest.fn();

jest.mock('vscode', () => mockVscode, { virtual: true });

jest.mock('@vscode/debugadapter', () => {
    class LoggingDebugSession {
        public readonly eventosEnviados: any[] = [];
        public respostaEnviada: any;
        public erroEnviado: any;
        setDebuggerLinesStartAt1(_valor: boolean) {}
        setDebuggerColumnsStartAt1(_valor: boolean) {}
        convertDebuggerLineToClient(linha: number) {
            return linha;
        }
        convertClientLineToDebugger(linha: number) {
            return linha;
        }
        convertDebuggerColumnToClient(coluna: number) {
            return coluna;
        }
        convertDebuggerPathToClient(caminho: string) {
            return `cliente://${caminho}`;
        }
        sendResponse(resposta: any) {
            this.respostaEnviada = resposta;
        }
        sendEvent(evento: any) {
            this.eventosEnviados.push(evento);
        }
        sendErrorResponse(response: any, erro: any) {
            this.erroEnviado = { response, erro };
        }
        customRequest(_command: string, response: any, _args: any) {
            this.sendResponse(response);
        }
        configurationDoneRequest(response: any, _args: any) {
            this.sendResponse(response);
        }
    }

    class Handles<T> {
        private atual = 1;
        private dados = new Map<number, T>();
        create(valor: T) {
            const referencia = this.atual++;
            this.dados.set(referencia, valor);
            return referencia;
        }
        get(referencia: number) {
            return this.dados.get(referencia);
        }
    }

    class InitializedEvent { public readonly event = 'initialized'; }
    class TerminatedEvent { public readonly event = 'terminated'; }
    class StoppedEvent { public readonly event = 'stopped'; constructor(public readonly reason: string, public readonly threadId: number) {} }
    class BreakpointEvent { public readonly event = 'breakpoint'; constructor(public readonly reason: string, public readonly body: any) {} }
    class OutputEvent { public readonly event = 'output'; public readonly body: any = {}; constructor(public readonly output: string) {} }
    class InvalidatedEvent { public readonly event = 'invalidated'; constructor(public readonly areas: string[]) {} }
    class Thread { constructor(public readonly id: number, public readonly name: string) {} }
    class StackFrame { constructor(public readonly id: number, public readonly name: string, public readonly source: any, public readonly line: number) {} }
    class Scope { constructor(public readonly name: string, public readonly variablesReference: number, public readonly expensive: boolean) {} }
    class Source {
        constructor(
            public readonly name: string,
            public readonly path?: string,
            public readonly sourceReference?: number,
            public readonly origin?: string,
            public readonly adapterData?: string
        ) {}
    }
    class Breakpoint { public id?: number; constructor(public readonly verified: boolean, public readonly line: number) {} }

    return {
        Logger: { LogLevel: { Verbose: 0, Stop: 1 } },
        logger: { setup: loggerSetup },
        LoggingDebugSession,
        InitializedEvent,
        TerminatedEvent,
        StoppedEvent,
        BreakpointEvent,
        OutputEvent,
        InvalidatedEvent,
        Thread,
        StackFrame,
        Scope,
        Source,
        Handles,
        Breakpoint,
    };
});

const instanciasTempoExecucao: any[] = [];

jest.mock('../../fontes/depuracao/remota/delegua-tempo-execucao-remoto', () => ({
    DeleguaTempoExecucaoRemoto: class {
        public readonly callbacks = new Map<string, Function[]>();
        public sourceFile = '/fonte.delegua';
        public variaveisEscopo = [{ name: 'local', value: '1', type: 'numero', variablesReference: 0 }];
        public todasVariaveis = [{ name: 'global', value: '2', type: 'numero', variablesReference: 0 }];

        public readonly obterPontosParada = jest.fn(() => [3, 9]);
        public readonly continuar = jest.fn();
        public readonly passo = jest.fn();
        public readonly adentrarEscopo = jest.fn();
        public readonly sairEscopo = jest.fn();
        public readonly pilhaExecucao = jest.fn(() => [{ index: 1, name: 'func', file: '/fonte.delegua', line: 7 }]);
        public readonly variaveis = jest.fn();
        public readonly limparTodosPontosParada = jest.fn();
        public readonly definirPontoParada = jest.fn((_path: string, linha: number) => ({ verificado: true, linha, id: linha + 100 }));
        public readonly enviarPontosParadaParaServidorDepuracao = jest.fn();
        public readonly desconectarDoDepurador = jest.fn();
        public readonly obterValorVariavel = jest.fn(async () => '{"valor":42,"tipo":"número"}');
        public readonly iniciar = jest.fn();
        public readonly clearAllDataBreakpoints = jest.fn();
        public readonly setDataBreakpoint = jest.fn(() => true);
        public readonly setExceptionsFilters = jest.fn();
        public readonly getLocalVariable = jest.fn(() => undefined);
        public readonly clearInstructionBreakpoints = jest.fn();
        public readonly setInstructionBreakpoint = jest.fn(() => true);
        public readonly disassemble = jest.fn(() => []);

        constructor() {
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

import { DeleguaSessaoDepuracaoRemota } from '../../fontes/depuracao/remota/delegua-sessao-depuracao-remota';
import { InvocacaoDelegua } from '../../fontes/depuracao/remota/invocacao-delegua';

describe('DeleguaSessaoDepuracaoRemota', () => {
    beforeEach(() => {
        instanciasTempoExecucao.length = 0;
        mostrarInformacao.mockReset();
        mostrarAviso.mockReset();
        mostrarErro.mockReset();
        definirStatus.mockReset();
        (InvocacaoDelegua as any).localizarExecutavel = jest.fn(async () => 'delegua');
        (InvocacaoDelegua as any).invocarDelegua = jest.fn((_caminho: string, _arquivo: string, resolve: Function) => resolve(true));
        loggerSetup.mockClear();
    });

    function criarSessao() {
        const sessao = new DeleguaSessaoDepuracaoRemota() as any;
        const tempoExecucao = instanciasTempoExecucao[0];
        return { sessao, tempoExecucao };
    }

    it('deve configurar capacidades e emitir initialized', () => {
        const { sessao } = criarSessao();
        const resposta: any = {};

        sessao.initializeRequest(resposta, {} as any);

        expect(resposta.body.supportsEvaluateForHovers).toBe(true);
        expect(sessao.eventosEnviados.some((evento: any) => evento.event === 'initialized')).toBe(true);
    });

    it('deve responder breakpointLocations com colunas quando source.path existe', () => {
        const { sessao, tempoExecucao } = criarSessao();
        const resposta: any = {};

        sessao.breakpointLocationsRequest(resposta, { source: { path: '/fonte.delegua' }, line: 15 } as any);

        expect(tempoExecucao.obterPontosParada).toHaveBeenCalledWith('/fonte.delegua', 15);
        expect(resposta.body.breakpoints).toEqual([
            { line: 15, column: 3 },
            { line: 15, column: 9 },
        ]);
    });

    it('deve responder breakpointLocations vazio quando source.path nao existe', () => {
        const { sessao } = criarSessao();
        const resposta: any = {};

        sessao.breakpointLocationsRequest(resposta, { source: {}, line: 1 } as any);

        expect(resposta.body.breakpoints).toEqual([]);
    });

    it('deve definir breakpoints e enviar para servidor remoto', () => {
        const { sessao, tempoExecucao } = criarSessao();
        const resposta: any = {};

        sessao.setBreakPointsRequest(resposta, {
            source: { path: '/fonte.delegua' },
            lines: [4, 8],
        } as any);

        expect(tempoExecucao.limparTodosPontosParada).toHaveBeenCalledWith('/fonte.delegua');
        expect(tempoExecucao.definirPontoParada).toHaveBeenCalledTimes(2);
        expect(tempoExecucao.enviarPontosParadaParaServidorDepuracao).toHaveBeenCalledWith('/fonte.delegua');
        expect(resposta.body.breakpoints[0].id).toBe(104);
        expect(resposta.body.breakpoints[1].id).toBe(108);
    });

    it('deve delegar requests de controle para tempo de execucao', () => {
        const { sessao, tempoExecucao } = criarSessao();

        sessao.continueRequest({} as any, {} as any);
        sessao.nextRequest({} as any, {} as any);
        sessao.stepInRequest({} as any, {} as any);
        sessao.stepOutRequest({} as any, {} as any);
        sessao.disconnectRequest({} as any, {} as any);

        expect(tempoExecucao.continuar).toHaveBeenCalled();
        expect(tempoExecucao.passo).toHaveBeenCalled();
        expect(tempoExecucao.adentrarEscopo).toHaveBeenCalled();
        expect(tempoExecucao.sairEscopo).toHaveBeenCalled();
        expect(tempoExecucao.desconectarDoDepurador).toHaveBeenCalled();
    });

    it('deve avaliar expressao em hover quando nao for palavra reservada', async () => {
        const { sessao, tempoExecucao } = criarSessao();
        const resposta: any = { success: true };
        const expressao = 'minhaVariavelDeTeste';

        sessao.evaluateRequest(resposta, { context: 'hover', expression: expressao } as any);
        await Promise.resolve();

        expect(tempoExecucao.obterValorVariavel).toHaveBeenCalledWith(expressao);
        expect(sessao.respostaEnviada.body).toEqual(
            expect.objectContaining({
                result: '42',
                type: 'número',
            })
        );
    });

    it('deve retornar variaveis conforme escopo local ou global', () => {
        const { sessao, tempoExecucao } = criarSessao();

        const respostaEscopos: any = {};
        sessao.scopesRequest(respostaEscopos, { frameId: 22 } as any);
        const referenciaLocal = respostaEscopos.body.scopes[0].variablesReference;

        const respostaLocal: any = {};
        sessao.variablesRequest(respostaLocal, { variablesReference: referenciaLocal } as any);

        const respostaGlobal: any = {};
        sessao.variablesRequest(respostaGlobal, { variablesReference: 999 } as any);

        expect(tempoExecucao.variaveis).toHaveBeenCalled();
        expect(respostaLocal.body.variables).toEqual(tempoExecucao.variaveisEscopo);
        expect(respostaGlobal.body.variables).toEqual(tempoExecucao.todasVariaveis);
    });

    it('deve iniciar depuracao remota no launchRequest apos configuracao', async () => {
        const { sessao, tempoExecucao } = criarSessao();
        sessao._configuracaoFinalizada = { wait: jest.fn(async () => undefined), notify: jest.fn() };
        sessao._deleguaEstaPronto = Promise.resolve(true);
        const resposta: any = {};

        await sessao.launchRequest(resposta, { program: '/fonte.delegua', stopOnEntry: true, trace: true } as any);
        await Promise.resolve();

        expect(loggerSetup).toHaveBeenCalled();
        expect(tempoExecucao.iniciar).toHaveBeenCalledWith('/fonte.delegua', true, 'sockets', '127.0.0.1', 7777, '');
        expect(sessao.respostaEnviada).toBe(resposta);
    });

    it('deve mapear evento de saida para OutputEvent com source e linha', () => {
        const { sessao, tempoExecucao } = criarSessao();

        tempoExecucao.disparar('saida', 'mensagem', '/arquivo.delegua', 13, 1);

        expect(sessao.eventosEnviados).toHaveLength(1);
        expect(sessao.eventosEnviados[0].event).toBe('output');
        expect(sessao.eventosEnviados[0].output).toBe('mensagem\n');
        expect(sessao.eventosEnviados[0].body.source.name).toBe('arquivo.delegua');
        expect(sessao.eventosEnviados[0].body.line).toBe(13);
    });
});
