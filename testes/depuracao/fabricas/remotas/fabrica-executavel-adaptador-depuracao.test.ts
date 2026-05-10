// @ts-nocheck
import { describe, expect, it, jest } from '@jest/globals';

const construtorExecutavel = jest.fn();

jest.mock('vscode', () => ({
    DebugAdapterExecutable: class {
        public readonly command: string;
        public readonly args: string[];
        public readonly options: any;

        constructor(command: string, args: string[], options: any) {
            construtorExecutavel(command, args, options);
            this.command = command;
            this.args = args;
            this.options = options;
        }
    },
}), { virtual: true });

import { DeleguaDebugAdapterExecutableFactory } from '../../../../fontes/depuracao/fabricas/remotas/fabrica-executavel-adaptador-depuracao';

describe('DeleguaDebugAdapterExecutableFactory', () => {
    it('deve criar executavel padrao quando nao receber executavel', () => {
        construtorExecutavel.mockClear();
        const fabrica = new DeleguaDebugAdapterExecutableFactory();

        const descritor: any = fabrica.createDebugAdapterDescriptor({} as any, undefined);

        expect(construtorExecutavel).toHaveBeenCalledTimes(1);
        expect(construtorExecutavel).toHaveBeenCalledWith(
            'C:\\Users\\leone\\AppData\\Roaming\\npm\\delegua.cmd',
            ['--depurador', 'D:\\GitHub\\vscode\\exemplos\\index.delegua'],
            {}
        );
        expect(descritor.command).toBe('C:\\Users\\leone\\AppData\\Roaming\\npm\\delegua.cmd');
        expect(descritor.args).toEqual([
            '--depurador',
            'D:\\GitHub\\vscode\\exemplos\\index.delegua',
        ]);
        expect(descritor.options).toEqual({});
    });

    it('deve criar um novo executavel padrao a cada chamada sem executavel informado', () => {
        construtorExecutavel.mockClear();
        const fabrica = new DeleguaDebugAdapterExecutableFactory();

        const descritor1: any = fabrica.createDebugAdapterDescriptor({ id: 1 } as any, undefined);
        const descritor2: any = fabrica.createDebugAdapterDescriptor({ id: 2 } as any, undefined);

        expect(construtorExecutavel).toHaveBeenCalledTimes(2);
        expect(descritor1).not.toBe(descritor2);
        expect(descritor1.command).toBe(descritor2.command);
        expect(descritor1.args).toEqual(descritor2.args);
    });

    it('deve reutilizar executavel recebido quando fornecido', () => {
        construtorExecutavel.mockClear();
        const fabrica = new DeleguaDebugAdapterExecutableFactory();
        const executavelExistente = { command: 'delegua', args: ['--depurador'], options: {} };

        const descritor = fabrica.createDebugAdapterDescriptor({} as any, executavelExistente as any);

        expect(descritor).toBe(executavelExistente);
        expect(construtorExecutavel).not.toHaveBeenCalled();
    });
});
