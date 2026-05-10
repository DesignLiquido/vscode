// @ts-nocheck
import { describe, expect, it, jest } from '@jest/globals';

const instanciasSessoes: any[] = [];

jest.mock('vscode', () => ({
    DebugAdapterInlineImplementation: class {
        public readonly sessao: any;
        constructor(sessao: any) {
            this.sessao = sessao;
        }
    },
}), { virtual: true });

jest.mock('../../../fontes/depuracao/local/delegua-sessao-depuracao-local', () => ({
    DeleguaSessaoDepuracaoLocal: class {
        public readonly provedorVisaoEntradaSaida: any;
        public readonly diagnosticos: any;

        constructor(provedorVisaoEntradaSaida: any, diagnosticos: any) {
            this.provedorVisaoEntradaSaida = provedorVisaoEntradaSaida;
            this.diagnosticos = diagnosticos;
            instanciasSessoes.push(this);
        }
    },
}));

import { FabricaAdaptadorDepuracaoEmbutido } from '../../../fontes/depuracao/fabricas/fabrica-adaptador-depuracao-embutido';

describe('FabricaAdaptadorDepuracaoEmbutido', () => {
    it('deve criar adaptador inline com sessao local', () => {
        const provedorVisaoEntradaSaida = { escreverEmSaida: jest.fn() };
        const diagnosticos = { set: jest.fn() };
        const fabrica = new FabricaAdaptadorDepuracaoEmbutido(provedorVisaoEntradaSaida as any, diagnosticos as any);

        const descritor: any = fabrica.createDebugAdapterDescriptor({} as any);

        expect(descritor).toBeDefined();
        expect(descritor.sessao).toBe(instanciasSessoes[0]);
        expect(instanciasSessoes[0].provedorVisaoEntradaSaida).toBe(provedorVisaoEntradaSaida);
        expect(instanciasSessoes[0].diagnosticos).toBe(diagnosticos);
    });
});
