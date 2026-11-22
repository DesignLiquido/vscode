// @ts-nocheck - Ignora erros de tipo nos mocks
import { describe, it, expect, jest, beforeEach } from '@jest/globals';

const arquivosExistentes = new Set<string>();

function criarUri(caminho: string) {
    const caminhoNormalizado = caminho.replace(/\\/g, '/');
    return {
        path: caminhoNormalizado,
        fsPath: caminhoNormalizado,
        with: ({ path }: { path: string }) => criarUri(path),
        toString: () => `file://${caminhoNormalizado}`,
    };
}

jest.mock('vscode', () => ({
    FileType: { File: 1, Directory: 2 },
    Uri: {
        // Funções simples (não `jest.fn`), pois a configuração usa `resetMocks`.
        file: (caminho: string) => criarUri(caminho),
        parse: (caminho: string) => criarUri(caminho.replace('file://', '')),
        joinPath: (base: any, ...partes: string[]) => {
            const segmentos = base.path.split('/');
            for (const parte of partes.join('/').split('/')) {
                if (!parte || parte === '.') continue;
                if (parte === '..') { segmentos.pop(); continue; }
                segmentos.push(parte);
            }
            return criarUri(segmentos.join('/'));
        },
    },
    workspace: {
        workspaceFolders: [],
        textDocuments: [],
        fs: {
            stat: async (uri: any) => {
                if (!arquivosExistentes.has(uri.path)) {
                    throw new Error('Arquivo não encontrado');
                }
                return { type: 1 };
            },
            readFile: async (uri: any) => {
                if (!arquivosExistentes.has(uri.path)) {
                    throw new Error('Arquivo não encontrado');
                }
                return Buffer.from('var a = 1');
            },
        },
    },
}), { virtual: true });

import { ehCaminhoRelativo, ImportadorExtensao } from '../../fontes/importador';

describe('importador/ImportadorExtensao', () => {
    let importador: ImportadorExtensao;

    beforeEach(() => {
        arquivosExistentes.clear();
        importador = new ImportadorExtensao({
            mapear: () => ({ simbolos: [], erros: [] }),
        } as any);
        importador.diretorioBase = '/projeto/fontes';
    });

    describe('ehCaminhoRelativo', () => {
        it('reconhece caminhos relativos', () => {
            expect(ehCaminhoRelativo('./registro')).toBe(true);
            expect(ehCaminhoRelativo('../modelos')).toBe(true);
            expect(ehCaminhoRelativo('.\\registro')).toBe(true);
        });

        it('não reconhece bibliotecas nem caminhos absolutos', () => {
            expect(ehCaminhoRelativo('matematica')).toBe(false);
            expect(ehCaminhoRelativo('@designliquido/delegua')).toBe(false);
            expect(ehCaminhoRelativo('/projeto/fontes/registro')).toBe(false);
            expect(ehCaminhoRelativo('.oculto')).toBe(false);
        });
    });

    it('acrescenta .delegua a importação relativa sem extensão', async () => {
        arquivosExistentes.add('/projeto/fontes/registro.delegua');

        const resultado = await importador.importar('./registro', 0);

        expect(resultado.caminhoAbsoluto).toBe('/projeto/fontes/registro.delegua');
    });

    it('resolve importação relativa sem extensão em diretório pai', async () => {
        arquivosExistentes.add('/projeto/modelos.delegua');

        const resultado = await importador.importar('../modelos', 0);

        expect(resultado.caminhoAbsoluto).toBe('/projeto/modelos.delegua');
    });

    it('mantém caminho original quando já possui extensão', async () => {
        arquivosExistentes.add('/projeto/fontes/registro.delegua');

        const resultado = await importador.importar('./registro.delegua', 0);

        expect(resultado.caminhoAbsoluto).toBe('/projeto/fontes/registro.delegua');
    });

    it('prefere arquivo sem extensão quando ele existe', async () => {
        arquivosExistentes.add('/projeto/fontes/registro');
        arquivosExistentes.add('/projeto/fontes/registro.delegua');

        const resultado = await importador.importar('./registro', 0);

        expect(resultado.caminhoAbsoluto).toBe('/projeto/fontes/registro');
    });

    it('lança erro mencionando o caminho quando nenhum arquivo existe', async () => {
        await expect(importador.importar('./inexistente', 0))
            .rejects.toThrow("Erro ao importar arquivo './inexistente'");
    });
});
