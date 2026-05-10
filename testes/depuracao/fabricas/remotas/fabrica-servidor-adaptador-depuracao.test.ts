// @ts-nocheck
import { beforeEach, describe, expect, it, jest } from '@jest/globals';

describe('DeleguaAdapterServerDescriptorFactory', () => {
    beforeEach(() => {
        jest.resetModules();
    });

    function prepararCenario() {
        const instanciasSessoes: any[] = [];
        const callbackConexao = { atual: undefined as any };

        const servidorMock = {
            listen: jest.fn(function (this: any) {
                return this;
            }),
            address: jest.fn(() => ({ port: 43111 })),
            close: jest.fn(),
        };

        jest.doMock('net', () => ({
            createServer: jest.fn((callback: any) => {
                callbackConexao.atual = callback;
                return servidorMock;
            }),
        }));

        jest.doMock('vscode', () => ({
            DebugAdapterServer: class {
                public readonly porta: number;
                constructor(porta: number) {
                    this.porta = porta;
                }
            },
        }), { virtual: true });

        jest.doMock('../../../../fontes/depuracao/remota/delegua-sessao-depuracao-remota', () => ({
            DeleguaSessaoDepuracaoRemota: class {
                public readonly setRunAsServer = jest.fn();
                public readonly start = jest.fn();

                constructor() {
                    instanciasSessoes.push(this);
                }
            },
        }));

        const { DeleguaAdapterServerDescriptorFactory } = require('../../../../fontes/depuracao/fabricas/remotas/fabrica-servidor-adaptador-depuracao');
        const { createServer } = require('net');

        return {
            DeleguaAdapterServerDescriptorFactory,
            createServer,
            servidorMock,
            instanciasSessoes,
            callbackConexao,
        };
    }

    it('deve criar servidor uma vez e retornar DebugAdapterServer com porta', () => {
        const contexto = prepararCenario();
        const fabrica = new contexto.DeleguaAdapterServerDescriptorFactory();

        const descritor1: any = fabrica.createDebugAdapterDescriptor({} as any, undefined);
        const descritor2: any = fabrica.createDebugAdapterDescriptor({} as any, undefined);

        expect(contexto.createServer).toHaveBeenCalledTimes(1);
        expect(contexto.servidorMock.listen).toHaveBeenCalledWith(0);
        expect(descritor1.porta).toBe(43111);
        expect(descritor2.porta).toBe(43111);
    });

    it('deve iniciar sessao remota quando receber conexao no servidor', () => {
        const contexto = prepararCenario();
        const fabrica = new contexto.DeleguaAdapterServerDescriptorFactory();
        fabrica.createDebugAdapterDescriptor({} as any, undefined);

        const socketFake = { id: 'socket' };
        contexto.callbackConexao.atual(socketFake);

        expect(contexto.instanciasSessoes).toHaveLength(1);
        expect(contexto.instanciasSessoes[0].setRunAsServer).toHaveBeenCalledWith(true);
        expect(contexto.instanciasSessoes[0].start).toHaveBeenCalledWith(socketFake, socketFake);
    });

    it('deve fechar servidor no dispose', () => {
        const contexto = prepararCenario();
        const fabrica = new contexto.DeleguaAdapterServerDescriptorFactory();
        fabrica.createDebugAdapterDescriptor({} as any, undefined);

        fabrica.dispose();

        expect(contexto.servidorMock.close).toHaveBeenCalled();
    });

    it('deve ignorar dispose quando servidor ainda nao foi criado', () => {
        const contexto = prepararCenario();
        const fabrica = new contexto.DeleguaAdapterServerDescriptorFactory();

        expect(() => fabrica.dispose()).not.toThrow();
        expect(contexto.createServer).not.toHaveBeenCalled();
    });

    it('deve falhar ao criar descritor quando endereco do servidor nao estiver disponivel', () => {
        const contexto = prepararCenario();
        contexto.servidorMock.address.mockReturnValue(null);
        const fabrica = new contexto.DeleguaAdapterServerDescriptorFactory();

        expect(() => fabrica.createDebugAdapterDescriptor({} as any, undefined)).toThrow();
    });
});
