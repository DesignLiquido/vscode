// @ts-nocheck
import { describe, it, expect, jest, beforeEach } from '@jest/globals';

const mockShowErrorMessage = jest.fn();
const mockShowInformationMessage = jest.fn();
const mockGetConfiguration = jest.fn();
const mockClipboardWriteText = jest.fn();
const mockWriteFileSync = jest.fn();

jest.mock('vscode', () => ({
    window: {
        activeTextEditor: null,
        showErrorMessage: mockShowErrorMessage,
        showInformationMessage: mockShowInformationMessage,
    },
    workspace: {
        getConfiguration: mockGetConfiguration,
    },
    env: {
        clipboard: { writeText: mockClipboardWriteText },
    },
    EndOfLine: { LF: 1, CRLF: 2 },
}), { virtual: true });

jest.mock('path', () => ({
    basename: (p: string) => p.split('/').pop() || p.split('\\').pop() || p,
}), { virtual: true });

jest.mock('fs', () => ({
    writeFileSync: mockWriteFileSync,
}), { virtual: true });

jest.mock('../../fontes/traducao/comum', () => ({
    traduzirPorMotorFolEs: jest.fn().mockResolvedValue('foles-resultado'),
    traduzirPorMotorLinConEs: jest.fn().mockResolvedValue('lincones-resultado'),
    traduzirPorMotorLmht: jest.fn().mockResolvedValue('lmht-resultado'),
}), { virtual: true });

jest.mock('@designliquido/delegua', () => ({
    Lexador: class Lexador {
        constructor(_modo: boolean) {}
        mapear(linhas: string[], _hash: number) { return { simbolos: [], erros: [] }; }
    },
    TradutorJavaScript: class TradutorJavaScript {
        async traduzir(_decls: any[]) { return 'js traduzido'; }
    },
    TradutorPython: class TradutorPython {
        async traduzir(_decls: any[]) { return 'python traduzido'; }
    },
    TradutorRuby: class TradutorRuby {
        async traduzir(_decls: any[]) { return 'ruby traduzido'; }
    },
    TradutorElixir: class TradutorElixir {
        async traduzir(_decls: any[]) { return 'elixir traduzido'; }
    },
    TradutorAssemblyScript: class TradutorAssemblyScript {
        async traduzir(_decls: any[]) { return 'as traduzido'; }
    },
    TradutorAssemblyARM: class TradutorAssemblyARM {
        constructor(_alvo: string) {}
        async traduzir(_decls: any[]) { return 'arm traduzido'; }
    },
    TradutorAssemblyX64: class TradutorAssemblyX64 {
        constructor(_alvo: string) {}
        async traduzir(_decls: any[]) { return 'x64 traduzido'; }
    },
    TradutorReversoJavaScript: class TradutorReversoJavaScript {
        async traduzir(_decls: any[]) { return 'delegua from js'; }
    },
    PlataformaAlvo: {},
    PlataformaAlvoARM: {},
}), { virtual: true });

jest.mock('@designliquido/delegua/avaliador-sintatico', () => ({
    AvaliadorSintatico: class AvaliadorSintatico {
        async analisar(_retorno: any, _hash: number) {
            return { declaracoes: [{ tipo: 'var' }], erros: [] };
        }
    },
}), { virtual: true });

jest.mock('../../fontes/traducao/tradutor-interface', () => ({}), { virtual: true });

jest.mock('@designliquido/delegua/avaliador-sintatico/traducao/avaliador-sintatico-javascript', () => ({
    AvaliadorSintaticoJavaScript: class AvaliadorSintaticoJavaScript {
        async analisar(_retorno: any) { return { declaracoes: [], erros: [] }; }
    },
}), { virtual: true });

jest.mock('@designliquido/potigol/tradutores/tradutor-reverso-potigol', () => ({
    TradutorReversoPotigol: class TradutorReversoPotigol {
        async traduzir(_decls: any[]) { return 'delegua from potigol'; }
    },
}), { virtual: true });

jest.mock('@designliquido/visualg/avaliador-sintatico', () => ({
    AvaliadorSintaticoVisuAlg: class AvaliadorSintaticoVisuAlg {
        async analisar(_retorno: any) { return { declaracoes: [], erros: [] }; }
    },
}), { virtual: true });

jest.mock('@designliquido/visualg/tradutores', () => ({
    TradutorReversoVisuAlg: class TradutorReversoVisuAlg {
        async traduzir(_decls: any[]) { return 'delegua from visualg'; }
    },
}), { virtual: true });

jest.mock('@designliquido/potigol/avaliador-sintatico', () => ({
    AvaliadorSintaticoPotigol: class AvaliadorSintaticoPotigol {
        async analisar(_retorno: any) { return { declaracoes: [], erros: [] }; }
    },
}), { virtual: true });

import { traduzir } from '../../fontes/traducao';

const mockVscode = jest.requireMock('vscode');
const mockComum = jest.requireMock('../../fontes/traducao/comum');

function setActiveEditor(fileName: string, texto = 'var x = 10') {
    mockVscode.window.activeTextEditor = {
        document: {
            fileName,
            getText: jest.fn().mockReturnValue(texto),
        },
    };
}

describe('traduzir', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockVscode.window.activeTextEditor = null;
        mockGetConfiguration.mockReturnValue({
            get: jest.fn().mockReturnValue('Ambos'),
        });
        mockClipboardWriteText.mockResolvedValue(undefined);
        mockShowErrorMessage.mockResolvedValue(undefined);
        mockShowInformationMessage.mockResolvedValue(undefined);
        mockComum.traduzirPorMotorFolEs.mockResolvedValue('foles-resultado');
        mockComum.traduzirPorMotorLinConEs.mockResolvedValue('lincones-resultado');
        mockComum.traduzirPorMotorLmht.mockResolvedValue('lmht-resultado');
    });

    it('extensão não bate → showErrorMessage', async () => {
        setActiveEditor('/tmp/arquivo.delegua');
        await traduzir('js', 'py');
        expect(mockShowErrorMessage).toHaveBeenCalled();
    });

    it('sem editor ativo → showErrorMessage', async () => {
        mockVscode.window.activeTextEditor = null;
        await traduzir('foles', 'css');
        expect(mockShowErrorMessage).toHaveBeenCalled();
    });

    it('lmht → html chama traduzirPorMotorLmht', async () => {
        setActiveEditor('/tmp/pagina.lmht');
        await traduzir('lmht', 'html');
        expect(mockComum.traduzirPorMotorLmht).toHaveBeenCalled();
    });

    it('html → lmht chama traduzirPorMotorLmht', async () => {
        setActiveEditor('/tmp/pagina.html');
        await traduzir('html', 'lmht');
        expect(mockComum.traduzirPorMotorLmht).toHaveBeenCalled();
    });

    it('foles → css chama traduzirPorMotorFolEs', async () => {
        setActiveEditor('/tmp/estilos.foles');
        await traduzir('foles', 'css');
        expect(mockComum.traduzirPorMotorFolEs).toHaveBeenCalled();
    });

    it('css → foles chama traduzirPorMotorFolEs', async () => {
        setActiveEditor('/tmp/estilos.css');
        await traduzir('css', 'foles');
        expect(mockComum.traduzirPorMotorFolEs).toHaveBeenCalled();
    });

    it('lincones → sql chama traduzirPorMotorLinConEs', async () => {
        setActiveEditor('/tmp/query.lincones');
        await traduzir('lincones', 'sql');
        expect(mockComum.traduzirPorMotorLinConEs).toHaveBeenCalled();
    });

    it('sql → lincones chama traduzirPorMotorLinConEs', async () => {
        setActiveEditor('/tmp/query.sql');
        await traduzir('sql', 'lincones');
        expect(mockComum.traduzirPorMotorLinConEs).toHaveBeenCalled();
    });

    it('resultado vazio não escreve arquivo nem clipboard', async () => {
        setActiveEditor('/tmp/pagina.lmht');
        mockComum.traduzirPorMotorLmht.mockResolvedValue('');
        await traduzir('lmht', 'html');
        expect(mockWriteFileSync).not.toHaveBeenCalled();
        expect(mockClipboardWriteText).not.toHaveBeenCalled();
    });

    it('opção "Arquivo" escreve arquivo sem clipboard', async () => {
        setActiveEditor('/tmp/pagina.lmht');
        mockGetConfiguration.mockReturnValue({
            get: jest.fn().mockReturnValue('Arquivo'),
        });
        await traduzir('lmht', 'html');
        expect(mockWriteFileSync).toHaveBeenCalled();
        expect(mockClipboardWriteText).not.toHaveBeenCalled();
    });

    it('opção "Área de Transferência" escreve clipboard sem arquivo', async () => {
        setActiveEditor('/tmp/pagina.lmht');
        mockGetConfiguration.mockReturnValue({
            get: jest.fn().mockReturnValue('Área de Transferência'),
        });
        await traduzir('lmht', 'html');
        expect(mockClipboardWriteText).toHaveBeenCalledWith('lmht-resultado');
        expect(mockWriteFileSync).not.toHaveBeenCalled();
    });

    it('opção "Ambos" escreve arquivo e clipboard', async () => {
        setActiveEditor('/tmp/pagina.lmht');
        await traduzir('lmht', 'html');
        expect(mockWriteFileSync).toHaveBeenCalled();
        expect(mockClipboardWriteText).toHaveBeenCalled();
    });

    it('paraLinguagem desconhecido no motor Delégua lança erro capturado', async () => {
        setActiveEditor('/tmp/arquivo.delegua');
        await traduzir('delegua', 'inexistente');
        expect(mockShowInformationMessage).toHaveBeenCalled();
    });
});
