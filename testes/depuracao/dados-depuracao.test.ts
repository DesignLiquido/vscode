import { beforeEach, describe, expect, it } from '@jest/globals';

import { DadosDepuracao } from '../../fontes/depuracao/dados-depuracao';

describe('DadosDepuracao', () => {
    beforeEach(() => {
        (DadosDepuracao as any).id = 0;
    });

    it('deve iniciar com identificador zero', () => {
        expect(DadosDepuracao.obterId()).toBe(0);
    });

    it('deve incrementar identificadores e validar mesma instancia', () => {
        const primeiroId = DadosDepuracao.obterProximoId();
        const segundoId = DadosDepuracao.obterProximoId();

        expect(primeiroId).toBe(1);
        expect(segundoId).toBe(2);
        expect(DadosDepuracao.mesmaInstancia(2)).toBe(true);
        expect(DadosDepuracao.mesmaInstancia(1)).toBe(false);
    });
});
