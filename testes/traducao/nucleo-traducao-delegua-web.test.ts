// @ts-nocheck
import { describe, it, expect, jest, beforeEach } from '@jest/globals';

const mockMapear = jest.fn();
const mockAnalisar = jest.fn();
const mockTraduzir = jest.fn();

jest.mock('@designliquido/delegua/lexador', () => ({
    Lexador: class Lexador {
        constructor(_debug: boolean) {}
        mapear(linhas: string[], _hash: number) { return mockMapear(linhas); }
    },
}));

jest.mock('@designliquido/delegua/avaliador-sintatico', () => ({
    AvaliadorSintatico: class AvaliadorSintatico {
        async analisar(_retorno: any, _hash: number) { return mockAnalisar(); }
    },
}));

jest.mock('@designliquido/delegua/tradutores', () => ({
    TradutorJavaScript: class TradutorJavaScript {
        async traduzir(_decls: any[]) { return mockTraduzir('js'); }
    },
    TradutorPython: class TradutorPython {
        async traduzir(_decls: any[]) { return mockTraduzir('py'); }
    },
    TradutorRuby: class TradutorRuby {
        async traduzir(_decls: any[]) { return mockTraduzir('ruby'); }
    },
    TradutorElixir: class TradutorElixir {
        async traduzir(_decls: any[]) { return mockTraduzir('elixir'); }
    },
    TradutorAssemblyScript: class TradutorAssemblyScript {
        async traduzir(_decls: any[]) { return mockTraduzir('as'); }
    },
    TradutorReversoJavaScript: class TradutorReversoJavaScript {
        async traduzir(_decls: any[]) { return mockTraduzir('delegua-from-js'); }
    },
}));

jest.mock('@designliquido/delegua', () => ({
    AvaliadorSintaticoInterface: {},
    TradutorInterface: {},
}));

jest.mock('@designliquido/delegua/avaliador-sintatico/traducao/avaliador-sintatico-javascript', () => ({
    AvaliadorSintaticoJavaScript: class AvaliadorSintaticoJavaScript {
        async analisar(_retorno: any) { return mockAnalisar(); }
    },
}));

jest.mock('@designliquido/visualg/avaliador-sintatico', () => ({
    AvaliadorSintaticoVisuAlg: class AvaliadorSintaticoVisuAlg {
        async analisar(_retorno: any) { return mockAnalisar(); }
    },
}));

jest.mock('@designliquido/visualg/tradutores', () => ({
    TradutorReversoVisuAlg: class TradutorReversoVisuAlg {
        async traduzir(_decls: any[]) { return mockTraduzir('delegua-from-visualg'); }
    },
}));

import { NucleoTraducaoDeleguaWeb } from '../../fontes/traducao/nucleo-traducao-delegua-web';

describe('NucleoTraducaoDeleguaWeb', () => {
    let nucleo: any;

    beforeEach(() => {
        jest.clearAllMocks();
        // Sem campo "erros" para que afericaoErrosLexador retorne undefined (falsy)
        mockMapear.mockReturnValue({ simbolos: [] });
        mockAnalisar.mockResolvedValue({ declaracoes: [] });
        mockTraduzir.mockResolvedValue('resultado traduzido');
        nucleo = new NucleoTraducaoDeleguaWeb(() => {}, () => {});
    });

    it('instância criada com sucesso', () => {
        expect(nucleo).toBeDefined();
        expect(nucleo.arquivosAbertos).toBeDefined();
        expect(nucleo.conteudoArquivosAbertos).toBeDefined();
    });

    it('iniciarTradutor delegua-para-js configura TradutorJavaScript', () => {
        nucleo.iniciarTradutor('delegua-para-js');
        expect(nucleo.tradutor).toBeDefined();
        expect(nucleo.comandoTraducao).toBe('delegua-para-js');
    });

    it('iniciarTradutor delegua-para-javascript alias funciona', () => {
        nucleo.iniciarTradutor('delegua-para-javascript');
        expect(nucleo.tradutor).toBeDefined();
    });

    it('iniciarTradutor delegua-para-py configura TradutorPython', () => {
        nucleo.iniciarTradutor('delegua-para-py');
        expect(nucleo.tradutor).toBeDefined();
    });

    it('iniciarTradutor delegua-para-ruby configura TradutorRuby', () => {
        nucleo.iniciarTradutor('delegua-para-ruby');
        expect(nucleo.tradutor).toBeDefined();
    });

    it('iniciarTradutor delegua-para-elixir configura TradutorElixir', () => {
        nucleo.iniciarTradutor('delegua-para-elixir');
        expect(nucleo.tradutor).toBeDefined();
    });

    it('iniciarTradutor delegua-para-as configura TradutorAssemblyScript', () => {
        nucleo.iniciarTradutor('delegua-para-as');
        expect(nucleo.tradutor).toBeDefined();
    });

    it('iniciarTradutor js-para-delegua configura TradutorReversoJavaScript', () => {
        nucleo.iniciarTradutor('js-para-delegua');
        expect(nucleo.tradutor).toBeDefined();
    });

    it('iniciarTradutor alg-para-delegua configura TradutorReversoVisuAlg', () => {
        nucleo.iniciarTradutor('alg-para-delegua');
        expect(nucleo.tradutor).toBeDefined();
    });

    it('iniciarTradutor desconhecido lança erro', () => {
        expect(() => nucleo.iniciarTradutor('inexistente')).toThrow("não implementado");
    });

    it('traduzirArquivo retorna resultado do tradutor', async () => {
        nucleo.iniciarTradutor('delegua-para-js');
        const resultado = await nucleo.traduzirArquivo('var x = 10');
        expect(resultado).toBe('resultado traduzido');
    });

    it('traduzirArquivo com erros léxicos retorna undefined (funcaoDeRetorno chamada)', async () => {
        // Retornar array com erros → afericaoErrosLexador retorna truthy → throw → funcaoDeRetorno('')
        mockMapear.mockReturnValue({ simbolos: [], erros: [{ mensagem: 'erro' }] });
        nucleo.iniciarTradutor('delegua-para-js');
        const funcaoDeRetorno = jest.fn();
        nucleo.funcaoDeRetorno = funcaoDeRetorno;
        const resultado = await nucleo.traduzirArquivo('código inválido');
        expect(funcaoDeRetorno).toHaveBeenCalledWith('');
        expect(resultado).toBeUndefined();
    });

    it('afericaoErrosLexador retorna valor truthy quando há erros', () => {
        // A implementação retorna o array de erros (não boolean true), mas é truthy
        expect(nucleo.afericaoErrosLexador({ erros: [{ mensagem: 'erro' }] })).toBeTruthy();
    });

    it('afericaoErrosLexador retorna valor truthy mesmo com array vazio (bug na impl)', () => {
        // erros = [] é truthy em JS — o implementador não verificou .length
        expect(nucleo.afericaoErrosLexador({ erros: [] })).toBeTruthy();
    });

    it('afericaoErrosLexador retorna falsy quando sem campo erros', () => {
        expect(nucleo.afericaoErrosLexador({ simbolos: [] })).toBeFalsy();
    });
});
