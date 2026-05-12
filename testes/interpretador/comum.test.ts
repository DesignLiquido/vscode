// @ts-nocheck
import { describe, it, expect, jest, beforeEach } from '@jest/globals';

class DeleguaFuncaoMock {
    nome: string;
    declaracao: any;
    constructor(nome: string, declaracao: any) {
        this.nome = nome;
        this.declaracao = declaracao;
    }
}

class DeleguaModuloMock {
    componentes: Record<string, any> = {};
    constructor(_nome?: string) {}
}

jest.mock('@designliquido/delegua/interpretador/estruturas', () => ({
    DeleguaFuncao: DeleguaFuncaoMock,
    DeleguaModulo: DeleguaModuloMock,
}));

jest.mock('@designliquido/delegua/declaracoes', () => ({
    Const: class Const {},
    FuncaoDeclaracao: class FuncaoDeclaracao {},
}));

jest.mock('../../fontes/construtos', () => ({
    ImportarBiblioteca: class ImportarBiblioteca {
        constructor(public hashArquivo: number, public linha: number, public nomeBiblioteca: string) {}
    },
    ModuloDeclaracoes: class ModuloDeclaracoes {
        constructor(public linha: number, public hashArquivo: number, public declaracoes: any[]) {}
    },
}));

jest.mock('../../fontes/interfaces/interpretador-com-importacao-interface', () => ({}));

jest.mock('../../fontes/mecanismo-importacao-bibliotecas', () => ({
    carregarBibliotecaDelegua: jest.fn(),
}));

import {
    visitarConstrutoImportarBiblioteca,
    visitarDeclaracaoConst,
    visitarDeclaracaoDefinicaoFuncao,
    visitarExpressaoModuloDeclaracoes,
} from '../../fontes/interpretador/comum';

const { carregarBibliotecaDelegua } = jest.requireMock('../../fontes/mecanismo-importacao-bibliotecas');

function criarInterpretador(overrides: Partial<any> = {}): any {
    return {
        erros: [],
        avaliacaoDeclaracaoVarOuConst: jest.fn().mockResolvedValue('valor'),
        avaliar: jest.fn().mockResolvedValue(null),
        pilhaEscoposExecucao: {
            definirConstante: jest.fn(),
            definirVariavel: jest.fn(),
            obterValorVariavel: jest.fn().mockReturnValue('resultado'),
            registrarReferenciaFuncao: jest.fn(),
            obterReferenciaFuncao: jest.fn(),
        },
        ...overrides,
    };
}

describe('visitarConstrutoImportarBiblioteca', () => {
    const { ImportarBiblioteca } = jest.requireMock('../../fontes/construtos');

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('retorna módulo carregado quando biblioteca existe', async () => {
        const moduloMock = { nome: 'minha-lib' };
        carregarBibliotecaDelegua.mockResolvedValue(moduloMock);
        const interp = criarInterpretador();
        const ib = new ImportarBiblioteca(1, 1, 'minha-lib');
        const resultado = await visitarConstrutoImportarBiblioteca(interp, ib);
        expect(carregarBibliotecaDelegua).toHaveBeenCalledWith('minha-lib');
        expect(resultado).toBe(moduloMock);
    });

    it('captura erro e retorna null, adicionando ao erros do interpretador', async () => {
        const erro = new Error('biblioteca não encontrada');
        carregarBibliotecaDelegua.mockRejectedValue(erro);
        const interp = criarInterpretador();
        const ib = new ImportarBiblioteca(1, 1, 'inexistente');
        const resultado = await visitarConstrutoImportarBiblioteca(interp, ib);
        expect(resultado).toBeNull();
        expect(interp.erros).toContain(erro);
    });
});

describe('visitarDeclaracaoConst', () => {
    it('define constante com valor simples', async () => {
        const interp = criarInterpretador();
        const decl: any = {
            simbolo: { lexema: 'PI' },
            tipo: 'numero',
        };
        interp.avaliacaoDeclaracaoVarOuConst.mockResolvedValue(3.14);
        const resultado = await visitarDeclaracaoConst(interp, decl);
        expect(interp.pilhaEscoposExecucao.definirConstante).toHaveBeenCalledWith('PI', 3.14, 'numero');
        expect(resultado).toBe('resultado');
    });

    it('define constante com DefinicaoFuncao (usa .declaracao)', async () => {
        const interp = criarInterpretador();
        const decl: any = {
            simbolo: { lexema: 'minhaFn' },
            tipo: 'funcao',
        };
        const valorFn = { operacao: 'DefinicaoFuncao', declaracao: { tipo: 'funcao' } };
        interp.avaliacaoDeclaracaoVarOuConst.mockResolvedValue(valorFn);
        await visitarDeclaracaoConst(interp, decl);
        expect(interp.pilhaEscoposExecucao.definirConstante).toHaveBeenCalledWith('minhaFn', valorFn.declaracao, 'funcao');
    });
});

describe('visitarDeclaracaoDefinicaoFuncao', () => {
    it('cria DeleguaFuncao e registra no escopo', async () => {
        const interp = criarInterpretador();
        const funcaoDecl: any = {
            id: 42,
            simbolo: { lexema: 'minhaFuncao' },
            funcao: { tipo: 'texto', tipoExplicito: false },
        };
        const resultado = await visitarDeclaracaoDefinicaoFuncao(interp, funcaoDecl);
        expect(interp.pilhaEscoposExecucao.definirVariavel).toHaveBeenCalledWith(
            'minhaFuncao',
            expect.any(DeleguaFuncaoMock)
        );
        expect(interp.pilhaEscoposExecucao.registrarReferenciaFuncao).toHaveBeenCalledWith(
            42,
            expect.any(DeleguaFuncaoMock)
        );
        expect(resultado.operacao).toBe('DefinicaoFuncao');
        expect(resultado.nome).toBe('minhaFuncao');
        expect(resultado.id).toBe(42);
    });

    it('tipo "qualquer" quando declaracao.tipo não definido', async () => {
        const interp = criarInterpretador();
        const funcaoDecl: any = {
            id: 1,
            simbolo: { lexema: 'fn' },
            funcao: { tipoExplicito: false },
        };
        const resultado = await visitarDeclaracaoDefinicaoFuncao(interp, funcaoDecl);
        expect(resultado.tipo).toContain('qualquer');
    });
});

describe('visitarExpressaoModuloDeclaracoes', () => {
    const { ModuloDeclaracoes } = jest.requireMock('../../fontes/construtos');

    it('módulo vazio retorna DeleguaModulo sem componentes', async () => {
        const interp = criarInterpretador();
        const modDecl = new ModuloDeclaracoes(0, 0, []);
        const resultado = await visitarExpressaoModuloDeclaracoes(interp, modDecl);
        expect(resultado).toBeInstanceOf(DeleguaModuloMock);
        expect(Object.keys(resultado.componentes)).toHaveLength(0);
    });

    it('subdeclaração null é ignorada', async () => {
        const interp = criarInterpretador();
        interp.avaliar.mockResolvedValue(null);
        const modDecl = new ModuloDeclaracoes(0, 0, [{ tipo: 'var' }]);
        const resultado = await visitarExpressaoModuloDeclaracoes(interp, modDecl);
        expect(Object.keys(resultado.componentes)).toHaveLength(0);
    });

    it('DefinicaoFuncao adiciona componente ao módulo', async () => {
        const funcaoMock = new DeleguaFuncaoMock('minhaFn', {});
        const interp = criarInterpretador();
        interp.avaliar.mockResolvedValue({ operacao: 'DefinicaoFuncao', id: 7, nome: 'minhaFn' });
        interp.pilhaEscoposExecucao.obterReferenciaFuncao.mockReturnValue(funcaoMock);
        const modDecl = new ModuloDeclaracoes(0, 0, [{ tipo: 'funcao' }]);
        const resultado = await visitarExpressaoModuloDeclaracoes(interp, modDecl);
        expect(resultado.componentes['minhaFn']).toBe(funcaoMock);
    });

    it('operação desconhecida não lança erro (aviso console)', async () => {
        const interp = criarInterpretador();
        interp.avaliar.mockResolvedValue({ operacao: 'OutraOperacao' });
        const modDecl = new ModuloDeclaracoes(0, 0, [{ tipo: 'outro' }]);
        await expect(visitarExpressaoModuloDeclaracoes(interp, modDecl)).resolves.toBeDefined();
    });
});
