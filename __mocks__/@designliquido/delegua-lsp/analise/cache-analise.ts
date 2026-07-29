import { jest } from '@jest/globals';

export const TEMPO_VIDA_PADRAO_CACHE_ANALISE_MS = 10 * 60 * 1000;

export const definirResultado = jest.fn();
export const obterResultado = jest.fn().mockReturnValue(undefined);
export const obterResultadoValido = jest.fn().mockReturnValue(undefined);
export const obterDiagnosticos = jest.fn().mockReturnValue([]);
export const expirarResultado = jest.fn();
export const expirarResultados = jest.fn();
export const expirarTudo = jest.fn();
export const expirarResultadosPorDependenciaArquivo = jest.fn();
export const limparResultadosExpirados = jest.fn();
export const obterEstatisticasCache = jest.fn().mockReturnValue({});
