import { describe, expect, it, jest } from '@jest/globals';

jest.mock('../../fontes/depuracao/delegua-sessao-depuracao-base', () => ({
    DeleguaSessaoDepuracaoBase: class {
        convertDebuggerPathToClient(caminho: string) {
            return `cliente://${caminho}`;
        }
    }
}));

jest.mock('@vscode/debugadapter', () => ({
    Source: class {
        public readonly name: string;
        public readonly path: string;
        public readonly adapterData: string;

        constructor(name: string, path: string, _valor1: any, _valor2: any, adapterData: string) {
            this.name = name;
            this.path = path;
            this.adapterData = adapterData;
        }
    }
}));

import { DeleguaSessaoDepuracaoLocal } from '../../fontes/depuracao/local/delegua-sessao-depuracao-local';

describe('DeleguaSessaoDepuracaoLocal', () => {
    it('deve criar referencia source com nome base e metadado do adaptador', () => {
        const sessao = new (DeleguaSessaoDepuracaoLocal as any)();

        const source = sessao.criarReferenciaSource('C:/projeto/pasta/arquivo.delegua');

        expect(source.name).toBe('arquivo.delegua');
        expect(source.path).toBe('cliente://C:/projeto/pasta/arquivo.delegua');
        expect(source.adapterData).toBe('delegua-adapter-data');
    });
});
