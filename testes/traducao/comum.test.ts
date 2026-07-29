// @ts-nocheck
import { describe, it, expect, jest, beforeEach } from '@jest/globals';

jest.mock('vscode', () => ({
    workspace: {
        openTextDocument: jest.fn(),
    },
    EndOfLine: { LF: 1, CRLF: 2 },
}), { virtual: true });

jest.mock('@designliquido/foles', () => ({
    FolEs: class FolEs {
        constructor(_debug: boolean) {}
        converterParaCss(_caminho: string) { return 'css result'; }
        converterParaFolEs(_caminho: string) { return 'foles result'; }
    },
}));

jest.mock('@designliquido/lincones-js', () => ({
    Lexador: class Lexador {
        mapear(_linhas: string[]) { return { simbolos: [], erros: [] }; }
    },
    LexadorSqlAnsi: class LexadorSqlAnsi {
        mapear(_linhas: string[]) { return { simbolos: [], erros: [] }; }
    },
    AvaliadorSintatico: class AvaliadorSintatico {
        analisar(_retorno: any) { return { comandos: [], erros: [] }; }
    },
    AvaliadorSintaticoSqlAnsi: class AvaliadorSintaticoSqlAnsi {
        analisar(_retorno: any) { return { comandos: [], erros: [] }; }
    },
    TradutorSqlAnsi: class TradutorSqlAnsi {
        traduzir(_comandos: any[]) { return 'sql traduzido'; }
    },
    TradutorReversoSqlAnsi: class TradutorReversoSqlAnsi {
        traduzir(_comandos: any[]) { return 'lincones traduzido'; }
    },
}));

jest.mock('@designliquido/lmht-js', () => ({
    ConversorHtml: class ConversorHtml {
        async converterPorArquivo(_caminho: string) { return 'lmht result'; }
    },
    ConversorLmht: class ConversorLmht {
        async converterPorArquivo(_caminho: string) { return 'html result'; }
    },
}));

import { traduzirPorMotorFolEs, traduzirPorMotorLinConEs, traduzirPorMotorLmht } from '../../fontes/traducao/comum';

const mockVscode = jest.requireMock('vscode');

describe('traduzirPorMotorFolEs', () => {
    it('foles → css chama converterParaCss e grava resultado', async () => {
        const funcaoEscrita = jest.fn();
        const resultado = await traduzirPorMotorFolEs('foles', 'css', '/tmp/estilos.foles', funcaoEscrita);
        expect(resultado).toBe('css result');
        expect(funcaoEscrita).toHaveBeenCalledWith('/tmp/estilos.css', 'css result');
    });

    it('css → foles chama converterParaFolEs', async () => {
        const funcaoEscrita = jest.fn();
        const resultado = await traduzirPorMotorFolEs('css', 'foles', '/tmp/estilos.css', funcaoEscrita);
        expect(resultado).toBe('foles result');
        expect(funcaoEscrita).toHaveBeenCalledWith('/tmp/estilos.foles', 'foles result');
    });

    it('linguagem desconhecida retorna string vazia', async () => {
        const funcaoEscrita = jest.fn();
        const resultado = await traduzirPorMotorFolEs('outro', 'css', '/tmp/x.outro', funcaoEscrita);
        expect(resultado).toBe('');
    });
});

describe('traduzirPorMotorLinConEs', () => {
    beforeEach(() => {
        mockVscode.workspace.openTextDocument.mockResolvedValue({
            eol: 1,
            getText: jest.fn().mockReturnValue('SELECT id FROM usuarios'),
        });
    });

    it('lincones → sql retorna resultado traduzido', async () => {
        const resultado = await traduzirPorMotorLinConEs('lincones', 'sql', '/tmp/query.lincones');
        expect(resultado).toBe('sql traduzido');
    });

    it('sql → lincones retorna resultado traduzido', async () => {
        const resultado = await traduzirPorMotorLinConEs('sql', 'lincones', '/tmp/query.sql');
        expect(resultado).toBe('lincones traduzido');
    });

    it('linguagem desconhecida retorna string vazia', async () => {
        const resultado = await traduzirPorMotorLinConEs('outro', 'sql', '/tmp/x.outro');
        expect(resultado).toBe('');
    });

    it('usa CRLF quando documento tem eol CRLF', async () => {
        mockVscode.workspace.openTextDocument.mockResolvedValue({
            eol: 2, // CRLF
            getText: jest.fn().mockReturnValue('linha1\r\nlinha2'),
        });
        const resultado = await traduzirPorMotorLinConEs('lincones', 'sql', '/tmp/q.lincones');
        expect(resultado).toBe('sql traduzido');
    });
});

describe('traduzirPorMotorLmht', () => {
    it('lmht → html chama ConversorLmht', async () => {
        const funcaoEscrita = jest.fn();
        const resultado = await traduzirPorMotorLmht('lmht', 'html', '/tmp/pagina.lmht', funcaoEscrita);
        expect(resultado).toBe('html result');
        expect(funcaoEscrita).toHaveBeenCalledWith('/tmp/pagina.html', 'html result');
    });

    it('html → lmht chama ConversorHtml', async () => {
        const funcaoEscrita = jest.fn();
        const resultado = await traduzirPorMotorLmht('html', 'lmht', '/tmp/pagina.html', funcaoEscrita);
        expect(resultado).toBe('lmht result');
        expect(funcaoEscrita).toHaveBeenCalledWith('/tmp/pagina.lmht', 'lmht result');
    });

    it('linguagem desconhecida retorna string vazia', async () => {
        const funcaoEscrita = jest.fn();
        const resultado = await traduzirPorMotorLmht('outro', 'html', '/tmp/x.outro', funcaoEscrita);
        expect(resultado).toBe('');
    });
});
