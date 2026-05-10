import { beforeEach, describe, expect, it, jest } from '@jest/globals';

const mostrarInformacao = jest.fn();
const mostrarAviso = jest.fn();
const mostrarErro = jest.fn();
const definirMensagemStatus = jest.fn();

const mockVscode = {
    window: {
        activeTextEditor: undefined as any,
        showInformationMessage: mostrarInformacao,
        showWarningMessage: mostrarAviso,
        showErrorMessage: mostrarErro,
        setStatusBarMessage: definirMensagemStatus,
    },
};

const instanciasTempoExecucao: any[] = [];

jest.mock('vscode', () => mockVscode, { virtual: true });

jest.mock('@vscode/debugadapter', () => ({
    BreakpointEvent: class {
        public readonly event = 'breakpoint';
        constructor(public readonly reason: string, public readonly body: any) {}
    },
    OutputEvent: class {
        public readonly event = 'output';
        public readonly body: any = {};
        constructor(public readonly output: string, public readonly category?: string) {}
    },
    Source: class {
        constructor(
            public readonly name: string,
            public readonly path?: string,
            public readonly sourceReference?: number,
            public readonly origin?: string,
            public readonly adapterData?: string
        ) {}
    },
    StoppedEvent: class {
        public readonly event = 'stopped';
        constructor(public readonly reason: string, public readonly threadId: number) {}
    },
    TerminatedEvent: class {
        public readonly event = 'terminated';
    },
    Breakpoint: class {
        public id?: number;
        public source?: any;
        constructor(public readonly verified: boolean, public readonly line: number) {}
    },
}));

jest.mock('../../fontes/depuracao/delegua-sessao-depuracao-base', () => ({
    DeleguaSessaoDepuracaoBase: class {
        static threadId = 1;
        protected _idPontoParada = 1;
        public tempoExecucao: any;
        public provedorVisaoEntradaSaida: any;
        public eventosEnviados: any[] = [];
        public respostaEnviada: any = undefined;
        public erroEnviado: any = undefined;
        public configuracaoConcluidaArgs: any = undefined;

        constructor(provedorVisaoEntradaSaida: any) {
            this.provedorVisaoEntradaSaida = provedorVisaoEntradaSaida;
        }

        setDebuggerLinesStartAt1(_valor: boolean) {}
        setDebuggerColumnsStartAt1(_valor: boolean) {}

        sendEvent(evento: any) {
            this.eventosEnviados.push(evento);
        }

        sendResponse(resposta: any) {
            this.respostaEnviada = resposta;
        }

        sendErrorResponse(resposta: any, erro: any) {
            this.erroEnviado = { resposta, erro };
        }

        configurationDoneRequest(resposta: any, args: any) {
            this.configuracaoConcluidaArgs = { resposta, args };
        }

        convertDebuggerLineToClient(linha: number) {
            return linha;
        }
    },
}));

jest.mock('../../fontes/depuracao/web/delegua-tempo-execucao-web', () => ({
    DeleguaTempoExecucaoWeb: class {
        public readonly callbacks = new Map<string, Function[]>();
        public readonly iniciar = jest.fn(async () => undefined);
        public readonly reiniciarPontosParada = jest.fn();
        public readonly definirPontosParada = jest.fn();
        public readonly pilhaExecucao = jest.fn(() => []);

        constructor(_provedor: any, _diagnosticos: any) {
            instanciasTempoExecucao.push(this);
        }

        on(evento: string, callback: Function) {
            const callbacksEvento = this.callbacks.get(evento) || [];
            callbacksEvento.push(callback);
            this.callbacks.set(evento, callbacksEvento);
        }

        disparar(evento: string, ...args: any[]) {
            const callbacksEvento = this.callbacks.get(evento) || [];
            for (const callback of callbacksEvento) {
                callback(...args);
            }
        }
    },
}));

import { DeleguaSessaoDepuracaoWeb } from '../../fontes/depuracao/web/delegua-sessao-depuracao-web';

describe('DeleguaSessaoDepuracaoWeb', () => {
    beforeEach(() => {
        instanciasTempoExecucao.length = 0;
        mostrarInformacao.mockReset();
        mostrarAviso.mockReset();
        mostrarErro.mockReset();
        definirMensagemStatus.mockReset();
        mockVscode.window.activeTextEditor = undefined;
    });

    function criarSessao() {
        const provedorVisao = {
            escreverEmSaida: jest.fn(),
            escreverEmSaidaMesmaLinha: jest.fn(),
            limparTerminal: jest.fn(),
        };

        const sessao = new DeleguaSessaoDepuracaoWeb(provedorVisao as any, {} as any) as any;
        const tempoExecucao = instanciasTempoExecucao[0];

        return { sessao, tempoExecucao, provedorVisao };
    }

    it('deve retornar erro em launchRequest quando nao ha documento ativo', async () => {
        const { sessao } = criarSessao();
        const resposta = {};

        await sessao.launchRequest(resposta, { stopOnEntry: true });

        expect(sessao.erroEnviado).toEqual({
            resposta,
            erro: {
                id: 1001,
                format: 'Por favor, abra o arquivo que deseja depurar antes de iniciar a depuração.',
            },
        });
    });

    it('deve armazenar argumentos e responder launchRequest quando houver documento ativo', async () => {
        const { sessao } = criarSessao();
        const documento = { fileName: '/projeto/programa.delegua' };
        mockVscode.window.activeTextEditor = { document: documento };
        const resposta = { chave: 'resposta' };

        await sessao.launchRequest(resposta, { stopOnEntry: 1 });

        expect(sessao.respostaEnviada).toBe(resposta);
        expect(sessao._launchArgs).toEqual({
            documento,
            programPath: '/projeto/programa.delegua',
            stopOnEntry: true,
        });
    });

    it('deve iniciar tempo de execucao ao concluir configuracao', () => {
        const { sessao, tempoExecucao } = criarSessao();
        const documento = { fileName: '/projeto/app.delegua' };
        sessao._launchArgs = {
            documento,
            programPath: documento.fileName,
            stopOnEntry: false,
        };

        sessao.configurationDoneRequest({} as any, {} as any);

        expect(tempoExecucao.iniciar).toHaveBeenCalledWith(documento, '/projeto/app.delegua', false);
    });

    it('deve emitir evento de erro quando iniciar falhar na configuracao', async () => {
        const { sessao, tempoExecucao } = criarSessao();
        tempoExecucao.iniciar.mockRejectedValue(new Error('falha-inicio'));
        sessao._launchArgs = {
            documento: { fileName: '/projeto/app.delegua' },
            programPath: '/projeto/app.delegua',
            stopOnEntry: false,
        };

        sessao.configurationDoneRequest({} as any, {} as any);
        await Promise.resolve();
        await Promise.resolve();

        expect(sessao.eventosEnviados).toHaveLength(1);
        expect(sessao.eventosEnviados[0].event).toBe('output');
        expect(sessao.eventosEnviados[0].output).toContain('Erro: falha-inicio');
        expect(sessao.eventosEnviados[0].category).toBe('stderr');
    });

    it('deve redefinir e registrar pontos de parada', () => {
        const { sessao, tempoExecucao } = criarSessao();
        const resposta: any = {};

        sessao.setBreakPointsRequest(resposta, { lines: [10, 20] } as any);

        expect(tempoExecucao.reiniciarPontosParada).toHaveBeenCalled();
        expect(tempoExecucao.definirPontosParada).toHaveBeenCalledTimes(1);
        expect(tempoExecucao.definirPontosParada.mock.calls[0][0]).toHaveLength(2);
        expect(tempoExecucao.definirPontosParada.mock.calls[0][0][0].id).toBe(1);
        expect(tempoExecucao.definirPontosParada.mock.calls[0][0][1].id).toBe(2);
        expect(resposta.body.breakpoints).toHaveLength(2);
        expect(sessao.respostaEnviada).toBe(resposta);
    });

    it('deve retornar stack trace paginado com source do editor ativo', async () => {
        const { sessao, tempoExecucao } = criarSessao();
        const resposta: any = {};
        tempoExecucao.pilhaExecucao.mockReturnValue([
            { id: 1, metodo: 'metodoA', linha: 11, arquivo: '/a.delegua' },
            { id: 2, metodo: 'metodoB', linha: 22, arquivo: '/b.delegua' },
        ]);
        mockVscode.window.activeTextEditor = {
            document: {
                uri: { toString: () => 'file:///projeto/ativo.delegua' },
            },
        };

        await sessao.stackTraceRequest(resposta, { startFrame: 1, levels: 1 } as any);

        expect(sessao.respostaEnviada).toBe(resposta);
        expect(resposta.body.totalFrames).toBe(2);
        expect(resposta.body.stackFrames).toHaveLength(1);
        expect(resposta.body.stackFrames[0]).toEqual(
            expect.objectContaining({
                id: 2,
                name: 'metodoB',
                line: 22,
            })
        );
        expect(resposta.body.stackFrames[0].source.path).toBe('file:///projeto/ativo.delegua');
        expect(resposta.body.stackFrames[0].source.adapterData).toBe('delegua-adapter-data');
    });

    it('deve encaminhar saida de texto para a visao com escapes convertidos', () => {
        const { tempoExecucao, provedorVisao } = criarSessao();

        tempoExecucao.disparar('saida', 'linha1\\nlinha2\\tvalor', true);

        expect(provedorVisao.escreverEmSaidaMesmaLinha).toHaveBeenCalledWith('linha1\r\nlinha2\tvalor');
    });

    it('deve emitir evento de saida com contexto quando receber erro', () => {
        const { sessao, tempoExecucao } = criarSessao();

        tempoExecucao.disparar('saida', new Error('falha'), false, '/arquivo.delegua', 27);

        expect(sessao.eventosEnviados).toHaveLength(1);
        expect(sessao.eventosEnviados[0].event).toBe('output');
        expect(sessao.eventosEnviados[0].body.source.name).toBe('/arquivo.delegua');
        expect(sessao.eventosEnviados[0].body.line).toBe(27);
    });

    it('deve finalizar sessao quando tempo de execucao emitir finalizar', () => {
        const { sessao, tempoExecucao, provedorVisao } = criarSessao();

        tempoExecucao.disparar('finalizar');

        expect(provedorVisao.escreverEmSaida).toHaveBeenCalledWith('\r\nFim da execução.');
        expect(sessao.eventosEnviados.some((evento: any) => evento.event === 'terminated')).toBe(true);
    });
});
