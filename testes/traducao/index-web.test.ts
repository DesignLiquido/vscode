// @ts-nocheck
import { describe, it, expect, jest, beforeEach } from '@jest/globals';

const mockShowErrorMessage = jest.fn();
const mockShowInformationMessage = jest.fn();
const mockClipboardWriteText = jest.fn();
const mockFsReadFile = jest.fn();
const mockFsWriteFile = jest.fn();

jest.mock('vscode', () => ({
    window: {
        activeTextEditor: null,
        showErrorMessage: mockShowErrorMessage,
        showInformationMessage: mockShowInformationMessage,
    },
    workspace: {
        fs: {
            readFile: mockFsReadFile,
            writeFile: mockFsWriteFile,
        },
    },
    env: {
        clipboard: { writeText: mockClipboardWriteText },
    },
    EndOfLine: { LF: 1, CRLF: 2 },
}), { virtual: true });

jest.mock('@designliquido/foles', () => ({
    FolEs: class FolEs {
        constructor(_debug: boolean) {}
        converterParaCss(_conteudo: string) { return 'css resultado'; }
        converterParaFolEs(_conteudo: string) { return 'foles resultado'; }
    },
}), { virtual: true });

jest.mock('@designliquido/lmht-js', () => ({
    ConversorHtml: class ConversorHtml {
        async converterPorArquivo(_conteudo: string) { return 'lmht resultado'; }
    },
    ConversorLmht: class ConversorLmht {
        async converterPorArquivo(_conteudo: string) { return 'html resultado'; }
    },
}), { virtual: true });

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
}), { virtual: true });

jest.mock('../../fontes/traducao/nucleo-traducao-delegua-web', () => ({
    NucleoTraducaoDeleguaWeb: class NucleoTraducaoDeleguaWeb {
        constructor(_f1: any, _f2: any) {}
        iniciarTradutor(_cmd: string) {}
        async traduzirArquivo(_conteudo: string) { return 'delegua traduzido'; }
    },
}), { virtual: true });

import { traduzir } from '../../fontes/traducao/index-web';

const mockVscode = jest.requireMock('vscode');

function setActiveEditor(uriPath: string, conteudo = 'var x = 10') {
    const encoder = new TextEncoder();
    mockFsReadFile.mockResolvedValue(encoder.encode(conteudo));
    mockVscode.window.activeTextEditor = {
        document: {
            uri: {
                path: uriPath,
                with: jest.fn((opts: any) => ({ path: opts.path, fsPath: opts.path })),
            },
        },
    };
}

describe('traduzir (web)', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockVscode.window.activeTextEditor = null;
        mockClipboardWriteText.mockResolvedValue(undefined);
        mockFsWriteFile.mockResolvedValue(undefined);
        mockShowErrorMessage.mockResolvedValue(undefined);
        mockShowInformationMessage.mockResolvedValue(undefined);
    });

    it('sem editor → showErrorMessage', async () => {
        await traduzir('foles', 'css');
        expect(mockShowErrorMessage).toHaveBeenCalled();
    });

    it('extensão não bate → showErrorMessage', async () => {
        setActiveEditor('/tmp/arquivo.delegua');
        await traduzir('foles', 'css');
        expect(mockShowErrorMessage).toHaveBeenCalled();
    });

    it('foles → css chama converterParaCss', async () => {
        setActiveEditor('/tmp/estilos.foles');
        await traduzir('foles', 'css');
        expect(mockFsWriteFile).toHaveBeenCalled();
        expect(mockClipboardWriteText).toHaveBeenCalledWith('css resultado');
    });

    it('css → foles chama converterParaFolEs', async () => {
        setActiveEditor('/tmp/estilos.css');
        await traduzir('css', 'foles');
        expect(mockClipboardWriteText).toHaveBeenCalledWith('foles resultado');
    });

    it('lmht → html chama ConversorLmht', async () => {
        setActiveEditor('/tmp/pagina.lmht');
        await traduzir('lmht', 'html');
        expect(mockClipboardWriteText).toHaveBeenCalledWith('html resultado');
    });

    it('html → lmht chama ConversorHtml', async () => {
        setActiveEditor('/tmp/pagina.html');
        await traduzir('html', 'lmht');
        expect(mockClipboardWriteText).toHaveBeenCalledWith('lmht resultado');
    });

    it('lincones → sql', async () => {
        setActiveEditor('/tmp/query.lincones');
        await traduzir('lincones', 'sql');
        expect(mockClipboardWriteText).toHaveBeenCalledWith('sql traduzido');
    });

    it('sql → lincones', async () => {
        setActiveEditor('/tmp/query.sql');
        await traduzir('sql', 'lincones');
        expect(mockClipboardWriteText).toHaveBeenCalledWith('lincones traduzido');
    });

    it('delegua → js usa NucleoTraducaoDeleguaWeb', async () => {
        setActiveEditor('/tmp/programa.delegua');
        await traduzir('delegua', 'js');
        expect(mockClipboardWriteText).toHaveBeenCalledWith('delegua traduzido');
    });

    it('nucleo web com resultado vazio → não escreve nem clipboard', async () => {
        const { NucleoTraducaoDeleguaWeb } = jest.requireMock('../../fontes/traducao/nucleo-traducao-delegua-web');
        jest.spyOn(NucleoTraducaoDeleguaWeb.prototype, 'traduzirArquivo').mockResolvedValue('');
        setActiveEditor('/tmp/arquivo.delegua');
        await traduzir('delegua', 'js');
        expect(mockFsWriteFile).not.toHaveBeenCalled();
        expect(mockClipboardWriteText).not.toHaveBeenCalled();
    });

    it('exceção no tradutor → showErrorMessage', async () => {
        setActiveEditor('/tmp/estilos.foles');
        mockFsReadFile.mockRejectedValue(new Error('Erro de leitura'));
        await traduzir('foles', 'css');
        expect(mockShowErrorMessage).toHaveBeenCalled();
    });
});
