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

jest.mock('../../../fontes/depuracao/web/delegua-sessao-depuracao-web', () => ({
    DeleguaSessaoDepuracaoWeb: class {
        public readonly provedorVisaoEntradaSaida: any;
        public readonly diagnosticos: any;

        constructor(provedorVisaoEntradaSaida: any, diagnosticos: any) {
            this.provedorVisaoEntradaSaida = provedorVisaoEntradaSaida;
            this.diagnosticos = diagnosticos;
            instanciasSessoes.push(this);
        }
    },
}));

import { FabricaAdaptadorDepuracaoWeb } from '../../../fontes/depuracao/fabricas/fabrica-adaptador-depuracao-web';

describe('FabricaAdaptadorDepuracaoWeb', () => {
    it('deve criar adaptador inline com sessao web', () => {
        const provedorVisaoEntradaSaida = { escreverEmSaida: jest.fn() };
        const diagnosticos = { set: jest.fn() };
        const fabrica = new FabricaAdaptadorDepuracaoWeb(provedorVisaoEntradaSaida as any, diagnosticos as any);

        const descritor: any = fabrica.createDebugAdapterDescriptor({} as any);

        expect(descritor).toBeDefined();
        expect(descritor.sessao).toBe(instanciasSessoes[0]);
        expect(instanciasSessoes[0].provedorVisaoEntradaSaida).toBe(provedorVisaoEntradaSaida);
        expect(instanciasSessoes[0].diagnosticos).toBe(diagnosticos);
    });
});
