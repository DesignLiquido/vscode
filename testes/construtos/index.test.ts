// @ts-nocheck
import { describe, it, expect } from '@jest/globals';

jest.mock('@designliquido/delegua', () => ({}), { virtual: true });

import { ImportarBiblioteca } from '../../fontes/construtos/importar-biblioteca';
import { ModuloDeclaracoes } from '../../fontes/construtos/modulo-declaracoes';

describe('ImportarBiblioteca', () => {
    it('construtor armazena campos corretamente', () => {
        const c = new ImportarBiblioteca(42, 7, 'minha-lib');
        expect(c.hashArquivo).toBe(42);
        expect(c.linha).toBe(7);
        expect(c.nomeBiblioteca).toBe('minha-lib');
    });

    it('paraTexto retorna tag esperada', () => {
        const c = new ImportarBiblioteca(1, 1, 'lib');
        expect(c.paraTexto()).toBe('<importar-biblioteca />');
    });

    it('paraTextoSaida lança erro', () => {
        const c = new ImportarBiblioteca(1, 1, 'lib');
        expect(() => c.paraTextoSaida()).toThrow();
    });

    it('aceitar chama visitarConstrutoImportarBiblioteca no visitante', async () => {
        const c = new ImportarBiblioteca(1, 1, 'lib');
        const visitante = { visitarConstrutoImportarBiblioteca: jest.fn().mockResolvedValue('ok') };
        const resultado = await c.aceitar(visitante);
        expect(visitante.visitarConstrutoImportarBiblioteca).toHaveBeenCalledWith(c);
        expect(resultado).toBe('ok');
    });
});

describe('ModuloDeclaracoes', () => {
    it('construtor armazena campos corretamente', () => {
        const decls = [{ tipo: 'var' }] as any[];
        const m = new ModuloDeclaracoes(3, 99, decls);
        expect(m.linha).toBe(3);
        expect(m.hashArquivo).toBe(99);
        expect(m.declaracoes).toBe(decls);
    });

    it('nomeModulo é undefined por padrão', () => {
        const m = new ModuloDeclaracoes(0, 0, []);
        expect(m.nomeModulo).toBeUndefined();
    });

    it('paraTexto retorna tag esperada', () => {
        const m = new ModuloDeclaracoes(0, 0, []);
        expect(m.paraTexto()).toContain('módulo');
    });

    it('paraTextoSaida lança erro', () => {
        const m = new ModuloDeclaracoes(0, 0, []);
        expect(() => m.paraTextoSaida()).toThrow();
    });

    it('aceitar chama visitarDeclaracaoModuloDeclaracoes no visitante', async () => {
        const m = new ModuloDeclaracoes(0, 0, []);
        const visitante = { visitarDeclaracaoModuloDeclaracoes: jest.fn().mockResolvedValue('modulo-ok') };
        const resultado = await m.aceitar(visitante);
        expect(visitante.visitarDeclaracaoModuloDeclaracoes).toHaveBeenCalledWith(m);
        expect(resultado).toBe('modulo-ok');
    });
});
