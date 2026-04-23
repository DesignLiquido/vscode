// @ts-nocheck
import { describe, it, expect, jest, beforeEach } from '@jest/globals';

const mockReadDirectory = jest.fn();
const mockReadFile = jest.fn();

jest.mock('vscode', () => ({
    workspace: {
        workspaceFolders: null,
        fs: {
            readDirectory: mockReadDirectory,
            readFile: mockReadFile,
        },
    },
    Uri: {
        joinPath: (base: any, ...parts: string[]) => {
            const basePath = base.path || base.fsPath || '';
            const joined = basePath + '/' + parts.join('/');
            return { path: joined, fsPath: joined };
        },
    },
    FileType: { File: 1, Directory: 2, SymbolicLink: 64, Unknown: 0 },
}), { virtual: true });

jest.mock('../../fontes/interfaces', () => ({}), { virtual: true });

import { descobrirDefinicoes } from '../../fontes/descobridor-definicoes';

const mockVscode = jest.requireMock('vscode');

function setWorkspace(path: string) {
    mockVscode.workspace.workspaceFolders = [
        { uri: { path, fsPath: path } },
    ];
}

// Ordem das chamadas readDirectory em descobrirDefinicoes():
//   Call 1 — pasta 'definicoes' do projeto
//   Call 2 — node_modules/@designliquido  (scan de organização)
//   Call 3 — node_modules  (scan de pacotes de raiz)
//   Call 4+ — pasta de definicoes de cada pacote encontrado

describe('descobrirDefinicoes', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockVscode.workspace.workspaceFolders = null;
    });

    it('sem workspace retorna array vazio', async () => {
        const resultado = await descobrirDefinicoes();
        expect(resultado).toEqual([]);
    });

    it('pasta definicoes não existe → retorna vazio', async () => {
        setWorkspace('/workspace');
        mockReadDirectory.mockRejectedValue(new Error('ENOENT'));
        const resultado = await descobrirDefinicoes();
        expect(resultado).toEqual([]);
    });

    it('pasta definicoes vazia → retorna vazio', async () => {
        setWorkspace('/workspace');
        mockReadDirectory.mockResolvedValue([]);
        const resultado = await descobrirDefinicoes();
        expect(resultado).toEqual([]);
    });

    it('pasta definicoes com arquivo .delegua → retorna caminho', async () => {
        setWorkspace('/workspace');
        mockReadDirectory
            .mockResolvedValueOnce([['modelo.delegua', 1], ['outro.txt', 1]]) // Call 1: definicoes
            .mockRejectedValue(new Error('ENOENT')); // Calls 2+: node_modules inexistente
        const resultado = await descobrirDefinicoes();
        expect(resultado).toHaveLength(1);
        expect(resultado[0]).toContain('modelo.delegua');
    });

    it('pasta definicoes com diretório ignorado', async () => {
        setWorkspace('/workspace');
        mockReadDirectory
            .mockResolvedValueOnce([['subdir', 2], ['modelo.delegua', 1]]) // Call 1
            .mockRejectedValue(new Error('ENOENT'));
        const resultado = await descobrirDefinicoes();
        expect(resultado).toHaveLength(1);
    });

    it('node_modules/@designliquido não existe → retorna arquivos de definicoes', async () => {
        setWorkspace('/workspace');
        mockReadDirectory
            .mockResolvedValueOnce([['entidade.delegua', 1]]) // Call 1: definicoes
            .mockRejectedValue(new Error('ENOENT')); // Calls 2, 3: node_modules inexistente
        const resultado = await descobrirDefinicoes();
        expect(resultado).toHaveLength(1);
    });

    it('pacote sem campo delegua no package.json é ignorado', async () => {
        setWorkspace('/workspace');
        mockReadDirectory
            .mockResolvedValueOnce([])                     // Call 1: definicoes
            .mockResolvedValueOnce([['delegua-http', 2]])  // Call 2: @designliquido
            .mockResolvedValueOnce([]);                    // Call 3: node_modules raiz
        mockReadFile.mockResolvedValue(Buffer.from(JSON.stringify({ name: 'delegua-http' })));
        const resultado = await descobrirDefinicoes();
        expect(resultado).toEqual([]);
    });

    it('pacote com campo delegua mas sem definicoes é ignorado', async () => {
        setWorkspace('/workspace');
        mockReadDirectory
            .mockResolvedValueOnce([])                         // Call 1: definicoes
            .mockResolvedValueOnce([['delegua-entidades', 2]]) // Call 2: @designliquido
            .mockResolvedValueOnce([]);                        // Call 3: node_modules raiz
        mockReadFile.mockResolvedValue(Buffer.from(JSON.stringify({
            name: 'delegua-entidades',
            delegua: {},
        })));
        const resultado = await descobrirDefinicoes();
        expect(resultado).toEqual([]);
    });

    it('pacote com delegua.definicoes e arquivos .delegua → retorna caminhos', async () => {
        setWorkspace('/workspace');
        mockReadDirectory
            .mockResolvedValueOnce([])                                         // Call 1: definicoes do projeto
            .mockResolvedValueOnce([['delegua-entidades', 2]])                 // Call 2: @designliquido
            .mockResolvedValueOnce([])                                         // Call 3: node_modules raiz
            .mockResolvedValueOnce([['modelo.delegua', 1], ['outro.txt', 1]]); // Call 4: definicoes do pacote
        mockReadFile.mockResolvedValue(Buffer.from(JSON.stringify({
            name: 'delegua-entidades',
            delegua: { definicoes: 'definicoes' },
        })));
        const resultado = await descobrirDefinicoes();
        expect(resultado).toHaveLength(1);
        expect(resultado[0]).toContain('modelo.delegua');
    });

    it('erro ao ler package.json → pacote ignorado, continua', async () => {
        setWorkspace('/workspace');
        mockReadDirectory
            .mockResolvedValueOnce([])
            .mockResolvedValueOnce([['delegua-erro', 2]])
            .mockResolvedValueOnce([]);
        mockReadFile.mockRejectedValue(new Error('ENOENT'));
        const resultado = await descobrirDefinicoes();
        expect(resultado).toEqual([]);
    });

    it('erro ao ler pasta de definicoes do pacote → pacote ignorado, continua', async () => {
        setWorkspace('/workspace');
        mockReadDirectory
            .mockResolvedValueOnce([])
            .mockResolvedValueOnce([['delegua-entidades', 2]])
            .mockRejectedValue(new Error('ENOENT')); // Call 3 (raiz) e Call 4 (definicoes) rejeitam
        mockReadFile.mockResolvedValue(Buffer.from(JSON.stringify({
            delegua: { definicoes: 'definicoes' },
        })));
        const resultado = await descobrirDefinicoes();
        expect(resultado).toEqual([]);
    });
});

describe('descobrirDefinicoes — pacotes de raiz em node_modules', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockVscode.workspace.workspaceFolders = null;
    });

    it('pacote de raiz com delegua.definicoes e arquivo .delegua → retorna caminho', async () => {
        setWorkspace('/workspace');
        mockReadDirectory
            .mockResolvedValueOnce([])                      // Call 1: definicoes do projeto
            .mockResolvedValueOnce([])                      // Call 2: @designliquido (vazio)
            .mockResolvedValueOnce([['liquido', 2]])        // Call 3: node_modules raiz
            .mockResolvedValueOnce([['liquido.delegua', 1], ['outro.txt', 1]]); // Call 4: definicoes do pacote
        mockReadFile.mockResolvedValue(Buffer.from(JSON.stringify({
            name: 'liquido',
            delegua: { definicoes: 'definicoes' },
        })));
        const resultado = await descobrirDefinicoes();
        expect(resultado).toHaveLength(1);
        expect(resultado[0]).toContain('liquido.delegua');
    });

    it('pacote de raiz sem campo delegua → ignorado', async () => {
        setWorkspace('/workspace');
        mockReadDirectory
            .mockResolvedValueOnce([])
            .mockResolvedValueOnce([])
            .mockResolvedValueOnce([['algum-pacote', 2]]);
        mockReadFile.mockResolvedValue(Buffer.from(JSON.stringify({ name: 'algum-pacote' })));
        const resultado = await descobrirDefinicoes();
        expect(resultado).toEqual([]);
    });

    it('pacote de raiz com campo delegua mas sem definicoes → ignorado', async () => {
        setWorkspace('/workspace');
        mockReadDirectory
            .mockResolvedValueOnce([])
            .mockResolvedValueOnce([])
            .mockResolvedValueOnce([['algum-pacote', 2]]);
        mockReadFile.mockResolvedValue(Buffer.from(JSON.stringify({
            name: 'algum-pacote',
            delegua: {},
        })));
        const resultado = await descobrirDefinicoes();
        expect(resultado).toEqual([]);
    });

    it('entrada não-diretório em node_modules raiz → ignorada', async () => {
        setWorkspace('/workspace');
        mockReadDirectory
            .mockResolvedValueOnce([])
            .mockResolvedValueOnce([])
            .mockResolvedValueOnce([
                ['algum-arquivo.txt', 1], // FileType.File — deve ser ignorado
                ['liquido', 2],           // FileType.Directory — deve ser processado
            ])
            .mockResolvedValueOnce([['liquido.delegua', 1]]);
        mockReadFile.mockResolvedValue(Buffer.from(JSON.stringify({
            name: 'liquido',
            delegua: { definicoes: 'definicoes' },
        })));
        const resultado = await descobrirDefinicoes();
        expect(resultado).toHaveLength(1);
        expect(resultado[0]).toContain('liquido.delegua');
    });

    it('erro ao ler package.json de pacote de raiz → ignorado, continua', async () => {
        setWorkspace('/workspace');
        mockReadDirectory
            .mockResolvedValueOnce([])
            .mockResolvedValueOnce([])
            .mockResolvedValueOnce([['liquido', 2]]);
        mockReadFile.mockRejectedValue(new Error('ENOENT'));
        const resultado = await descobrirDefinicoes();
        expect(resultado).toEqual([]);
    });

    it('erro ao ler pasta de definicoes de pacote de raiz → ignorado, continua', async () => {
        setWorkspace('/workspace');
        mockReadDirectory
            .mockResolvedValueOnce([])
            .mockResolvedValueOnce([])
            .mockResolvedValueOnce([['liquido', 2]])
            .mockRejectedValue(new Error('ENOENT')); // definicoes do pacote falha
        mockReadFile.mockResolvedValue(Buffer.from(JSON.stringify({
            name: 'liquido',
            delegua: { definicoes: 'definicoes' },
        })));
        const resultado = await descobrirDefinicoes();
        expect(resultado).toEqual([]);
    });

    it('pacote de raiz e pacote @designliquido → retorna arquivos de ambos', async () => {
        setWorkspace('/workspace');
        mockReadDirectory
            .mockResolvedValueOnce([])                             // Call 1: definicoes do projeto
            .mockResolvedValueOnce([['delegua-entidades', 2]])     // Call 2: @designliquido
            .mockResolvedValueOnce([['liquido', 2]])               // Call 3: node_modules raiz
            .mockResolvedValueOnce([['modelo.delegua', 1]])        // Call 4: definicoes de delegua-entidades
            .mockResolvedValueOnce([['liquido.delegua', 1]]);      // Call 5: definicoes de liquido
        mockReadFile.mockResolvedValue(Buffer.from(JSON.stringify({
            delegua: { definicoes: 'definicoes' },
        })));
        const resultado = await descobrirDefinicoes();
        expect(resultado).toHaveLength(2);
        expect(resultado.some(p => p.includes('modelo.delegua'))).toBe(true);
        expect(resultado.some(p => p.includes('liquido.delegua'))).toBe(true);
    });
});
