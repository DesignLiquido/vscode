jest.unmock('@designliquido/delegua-lsp/analise/cache-definicoes');

import {
    definirDefinicoes,
    expirarDefinicoes,
    expirarTodasDefinicoes,
    limparDefinicoesExpiradas,
    obterDefinicoes,
} from '@designliquido/delegua-lsp/analise/cache-definicoes';

describe('cache-definicoes', () => {
    beforeEach(() => {
        jest.useRealTimers();
        expirarTodasDefinicoes();
    });

    it('deve armazenar e recuperar definicoes por chave', () => {
        const chave = 'workspace::normal';
        const definicoes = { ClasseA: {} as any, ClasseB: {} as any };

        definirDefinicoes(chave, definicoes);

        expect(obterDefinicoes(chave)).toEqual(definicoes);
    });

    it('deve expirar definicoes pelo TTL informado', () => {
        jest.useFakeTimers();
        const chave = 'workspace::liquido';

        definirDefinicoes(chave, { Liquido: {} as any }, { tempoVidaMs: 1000 });
        expect(obterDefinicoes(chave)).toBeDefined();

        jest.advanceTimersByTime(1001);
        expect(obterDefinicoes(chave)).toBeUndefined();
    });

    it('deve expirar uma chave especifica manualmente', () => {
        const chave = 'workspace::normal';

        definirDefinicoes(chave, { ClasseA: {} as any });
        expirarDefinicoes(chave, 'teste');

        expect(obterDefinicoes(chave)).toBeUndefined();
    });

    it('deve limpar todo o cache manualmente', () => {
        definirDefinicoes('workspace::normal', { ClasseA: {} as any });
        definirDefinicoes('workspace::liquido', { Liquido: {} as any });

        expirarTodasDefinicoes('teste');

        expect(obterDefinicoes('workspace::normal')).toBeUndefined();
        expect(obterDefinicoes('workspace::liquido')).toBeUndefined();
    });

    it('deve remover apenas entradas expiradas na limpeza', () => {
        jest.useFakeTimers();

        definirDefinicoes('workspace::rapido', { ClasseA: {} as any }, { tempoVidaMs: 1000 });
        definirDefinicoes('workspace::lento', { ClasseB: {} as any }, { ttlMs: 5000 });

        jest.advanceTimersByTime(1500);
        const removidos = limparDefinicoesExpiradas();

        expect(removidos).toBe(1);
        expect(obterDefinicoes('workspace::rapido')).toBeUndefined();
        expect(obterDefinicoes('workspace::lento')).toBeDefined();
    });
});
