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
        mockReadDirectory.mockResolvedValueOnce([
            ['modelo.delegua', 1], // FileType.File
            ['outro.txt', 1],
        ]).mockRejectedValue(new Error('ENOENT')); // node_modules/@designliquido não existe
        const resultado = await descobrirDefinicoes();
        expect(resultado).toHaveLength(1);
        expect(resultado[0]).toContain('modelo.delegua');
    });

    it('pasta definicoes com diretório ignorado', async () => {
        setWorkspace('/workspace');
        mockReadDirectory.mockResolvedValueOnce([
            ['subdir', 2], // FileType.Directory
            ['modelo.delegua', 1],
        ]).mockRejectedValue(new Error('ENOENT'));
        const resultado = await descobrirDefinicoes();
        expect(resultado).toHaveLength(1);
    });

    it('node_modules/@designliquido não existe → retorna arquivos de definicoes', async () => {
        setWorkspace('/workspace');
        mockReadDirectory
            .mockResolvedValueOnce([['entidade.delegua', 1]]) // definicoes
            .mockRejectedValue(new Error('ENOENT')); // node_modules
        const resultado = await descobrirDefinicoes();
        expect(resultado).toHaveLength(1);
    });

    it('pacote sem campo delegua no package.json é ignorado', async () => {
        setWorkspace('/workspace');
        mockReadDirectory
            .mockResolvedValueOnce([]) // definicoes
            .mockResolvedValueOnce([['delegua-http', 2]]); // node_modules
        mockReadFile.mockResolvedValue(Buffer.from(JSON.stringify({ name: 'delegua-http' })));
        const resultado = await descobrirDefinicoes();
        expect(resultado).toEqual([]);
    });

    it('pacote com campo delegua mas sem definicoes é ignorado', async () => {
        setWorkspace('/workspace');
        mockReadDirectory
            .mockResolvedValueOnce([]) // definicoes
            .mockResolvedValueOnce([['delegua-entidades', 2]]); // node_modules
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
            .mockResolvedValueOnce([]) // definicoes do projeto
            .mockResolvedValueOnce([['delegua-entidades', 2]]) // node_modules
            .mockResolvedValueOnce([['modelo.delegua', 1], ['outro.txt', 1]]); // definicoes do pacote
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
            .mockResolvedValueOnce([['delegua-erro', 2]]);
        mockReadFile.mockRejectedValue(new Error('ENOENT'));
        const resultado = await descobrirDefinicoes();
        expect(resultado).toEqual([]);
    });

    it('erro ao ler pasta de definicoes do pacote → pacote ignorado, continua', async () => {
        setWorkspace('/workspace');
        mockReadDirectory
            .mockResolvedValueOnce([])
            .mockResolvedValueOnce([['delegua-entidades', 2]])
            .mockRejectedValue(new Error('ENOENT')); // leitura das definicoes falha
        mockReadFile.mockResolvedValue(Buffer.from(JSON.stringify({
            delegua: { definicoes: 'definicoes' },
        })));
        const resultado = await descobrirDefinicoes();
        expect(resultado).toEqual([]);
    });
});
