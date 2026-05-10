// @ts-nocheck
import { beforeEach, describe, expect, it, jest } from '@jest/globals';

describe('DeleguaAdapterNamedPipeServerDescriptorFactory', () => {
    beforeEach(() => {
        jest.resetModules();
    });

    function prepararCenario(plataforma: string) {
        const criarServidor = jest.fn();
        const juntar = jest.fn((a: string, b: string) => `${a}|${b}`);
        const obterDiretorioTemporario = jest.fn(() => '/tmp-dir');
        const bytesAleatorios = { toString: jest.fn(() => 'nome-pipe') };
        const callbackConexao = { atual: undefined as any };
        const instanciasSessoes: any[] = [];

        const servidorMock = {
            listen: jest.fn(function (this: any) {
                return this;
            }),
            address: jest.fn(() => 'pipe://delegua'),
            close: jest.fn(),
        };

        jest.doMock('net', () => ({
            createServer: criarServidor.mockImplementation((callback: any) => {
                callbackConexao.atual = callback;
                return servidorMock;
            }),
        }));

        jest.doMock('crypto', () => ({
            randomBytes: jest.fn(() => bytesAleatorios),
        }));

        jest.doMock('path', () => ({
            join: juntar,
        }));

        jest.doMock('os', () => ({
            tmpdir: obterDiretorioTemporario,
        }));

        jest.doMock('process', () => {
            const processoReal = jest.requireActual('process');
            return {
                ...processoReal,
                platform: plataforma,
            };
        });

        jest.doMock('vscode', () => ({
            DebugAdapterNamedPipeServer: class {
                public readonly endereco: string;
                constructor(endereco: string) {
                    this.endereco = endereco;
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

        const { DeleguaAdapterNamedPipeServerDescriptorFactory } = require('../../../../fontes/depuracao/fabricas/remotas/fabrica-adaptador-depuracao-win32-pipe');

        return {
            DeleguaAdapterNamedPipeServerDescriptorFactory,
            criarServidor,
            juntar,
            obterDiretorioTemporario,
            servidorMock,
            callbackConexao,
            instanciasSessoes,
        };
    }

    it('deve usar prefixo de pipe do Windows quando plataforma for win32', () => {
        const contexto = prepararCenario('win32');
        const fabrica = new contexto.DeleguaAdapterNamedPipeServerDescriptorFactory();

        const descritor: any = fabrica.createDebugAdapterDescriptor({} as any, undefined);

        expect(contexto.juntar).toHaveBeenCalledWith('\\\\.\\pipe\\', 'nome-pipe');
        expect(contexto.servidorMock.listen).toHaveBeenCalledWith('\\\\.\\pipe\\|nome-pipe');
        expect(descritor.endereco).toBe('pipe://delegua');
    });

    it('deve usar diretorio temporario quando plataforma nao for win32', () => {
        const contexto = prepararCenario('linux');
        const fabrica = new contexto.DeleguaAdapterNamedPipeServerDescriptorFactory();

        fabrica.createDebugAdapterDescriptor({} as any, undefined);

        expect(contexto.obterDiretorioTemporario).toHaveBeenCalled();
        expect(contexto.juntar).toHaveBeenCalledWith('/tmp-dir', 'nome-pipe');
        expect(contexto.servidorMock.listen).toHaveBeenCalledWith('/tmp-dir|nome-pipe');
    });

    it('deve iniciar sessao remota ao receber conexao e fechar no dispose', () => {
        const contexto = prepararCenario('linux');
        const fabrica = new contexto.DeleguaAdapterNamedPipeServerDescriptorFactory();
        fabrica.createDebugAdapterDescriptor({} as any, undefined);

        const socketFake = { id: 'socket' };
        contexto.callbackConexao.atual(socketFake);

        expect(contexto.instanciasSessoes).toHaveLength(1);
        expect(contexto.instanciasSessoes[0].setRunAsServer).toHaveBeenCalledWith(true);
        expect(contexto.instanciasSessoes[0].start).toHaveBeenCalledWith(socketFake, socketFake);

        fabrica.dispose();

        expect(contexto.servidorMock.close).toHaveBeenCalled();
    });

    it('deve criar servidor apenas uma vez ao solicitar descritor repetidamente', () => {
        const contexto = prepararCenario('linux');
        const fabrica = new contexto.DeleguaAdapterNamedPipeServerDescriptorFactory();

        const descritor1: any = fabrica.createDebugAdapterDescriptor({} as any, undefined);
        const descritor2: any = fabrica.createDebugAdapterDescriptor({} as any, undefined);

        expect(contexto.criarServidor).toHaveBeenCalledTimes(1);
        expect(descritor1.endereco).toBe('pipe://delegua');
        expect(descritor2.endereco).toBe('pipe://delegua');
    });

    it('deve ignorar dispose quando servidor ainda nao foi criado', () => {
        const contexto = prepararCenario('linux');
        const fabrica = new contexto.DeleguaAdapterNamedPipeServerDescriptorFactory();

        expect(() => fabrica.dispose()).not.toThrow();
        expect(contexto.criarServidor).not.toHaveBeenCalled();
    });
});
