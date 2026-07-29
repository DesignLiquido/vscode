import { jest } from '@jest/globals';

export const TEMPO_VIDA_PADRAO_CACHE_DEFINICOES_MS = 60 * 60 * 1000;

export const definirDefinicoes = jest.fn();
export const obterDefinicoes = jest.fn().mockReturnValue(undefined);
export const obterDefinicoesPorContexto = jest.fn().mockReturnValue({});
export const expirarDefinicoes = jest.fn();
export const expirarTodasDefinicoes = jest.fn();
export const limparDefinicoesExpiradas = jest.fn();
export const obterEstatisticasCacheDefinicoes = jest.fn().mockReturnValue({});
