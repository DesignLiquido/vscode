import { jest } from '@jest/globals';

export const proverItensCompletude = jest.fn().mockReturnValue([]);
export const proverDefinicao = jest.fn().mockReturnValue(undefined);
export const proverReferencias = jest.fn().mockResolvedValue([]);
export const prepareRename = jest.fn().mockReturnValue(undefined);
export const provideRenameEdits = jest.fn().mockResolvedValue(undefined);
export const DocumentoLSP = undefined;
