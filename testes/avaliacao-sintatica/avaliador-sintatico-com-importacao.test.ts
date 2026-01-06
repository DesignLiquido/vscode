// @ts-nocheck - Ignora erros de tipo nos mocks complexos
import { describe, it, expect, jest, beforeEach } from '@jest/globals';

// Mock das dependências do Delegua
jest.mock('@designliquido/delegua', () => ({
    AvaliadorSintatico: class AvaliadorSintatico {
        constructor() {
            this.primitivasConhecidas = {};
            this.tiposDefinidosEmCodigo = {};
            this.pilhaEscopos = {
                pilha: [],
                registrarReferenciaFuncao: jest.fn(),
                definirInformacoesVariavel: jest.fn()
            };
        }
        erro(simbolo: any, mensagem: string) {
            return new Error(mensagem);
        }
        async finalizarChamada(entidadeChamada: any, tipoPrimitiva?: string) {
            return {
                entidadeChamada,
                tipo: tipoPrimitiva
            };
        }
        async analisar(retornoLexador: any, hashArquivo: number) {
            return {
                declaracoes: [],
                erros: []
            };
        }
    },
    AcessoMetodo: class AcessoMetodo {},
    Chamada: class Chamada {},
    Classe: class Classe {},
    Comentario: class Comentario {},
    Const: class Const {},
    Construto: class Construto {},
    Declaracao: class Declaracao {},
    FuncaoDeclaracao: class FuncaoDeclaracao {},
    Literal: class Literal {},
    RetornoAvaliadorSintatico: class RetornoAvaliadorSintatico {},
    RetornoLexador: class RetornoLexador {},
    SimboloInterface: class SimboloInterface {},
    Var: class Var {},
    Variavel: class Variavel {}
}), { virtual: true });

jest.mock('@designliquido/delegua/informacao-elemento-sintatico', () => ({
    InformacaoElementoSintatico: class InformacaoElementoSintatico {
        constructor(public nome: string, public tipo: string, public ehFuncao: boolean = false, public subElementos: any[] = []) {}
    }
}), { virtual: true });

jest.mock('@designliquido/delegua/interpretador/estruturas', () => ({
    FuncaoPadrao: class FuncaoPadrao {
        constructor(public tipoRetorno?: string, public argumentos?: any[]) {}
    }
}), { virtual: true });

jest.mock('@designliquido/delegua/tipos-de-simbolos/delegua', () => ({}), { virtual: true });

jest.mock('../../fontes/construtos', () => ({
    ImportarBiblioteca: class ImportarBiblioteca {
        constructor(public hashArquivo: number, public linha: number, public caminho: string) {}
    },
    ModuloDeclaracoes: class ModuloDeclaracoes {}
}), { virtual: true });

jest.mock('../../fontes/mecanismo-importacao-bibliotecas', () => ({
    carregarBibliotecaDelegua: jest.fn().mockReturnValue({
        componentes: {}
    }),
    verificarModulosDelegua: jest.fn().mockReturnValue(null)
}), { virtual: true });

jest.mock('../../fontes/interpretador/estruturas', () => ({
    ClasseDeModulo: class ClasseDeModulo {}
}), { virtual: true });

jest.mock('../../fontes/importador', () => ({
    ImportadorExtensao: class ImportadorExtensao {
        async importar(caminho: string, hashArquivo: number) {
            return {
                retornoLexador: {
                    simbolos: [],
                    erros: []
                },
                hashArquivo
            };
        }
    }
}), { virtual: true });

describe('avaliacao-sintatica/AvaliadorSintaticoComImportacao', () => {
    let AvaliadorSintaticoComImportacao: any;
    let ImportadorExtensao: any;

    beforeEach(() => {
        jest.clearAllMocks();

        // Importar após os mocks estarem configurados
        const modulo = require('../../fontes/avaliacao-sintatica/avaliador-sintatico-com-importacao');
        AvaliadorSintaticoComImportacao = modulo.AvaliadorSintaticoComImportacao;

        const importadorModule = require('../../fontes/importador');
        ImportadorExtensao = importadorModule.ImportadorExtensao;
    });

    describe('Construtor', () => {
        it('deve criar instância com importador', () => {
            const mockImportador = new ImportadorExtensao();
            const avaliador = new AvaliadorSintaticoComImportacao(mockImportador);

            expect(avaliador).toBeDefined();
            expect(avaliador.importador).toBe(mockImportador);
        });

        it('deve inicializar tiposDefinidosPorBibliotecas como objeto vazio', () => {
            const mockImportador = new ImportadorExtensao();
            const avaliador = new AvaliadorSintaticoComImportacao(mockImportador);

            expect(avaliador.tiposDefinidosPorBibliotecas).toBeDefined();
            expect(typeof avaliador.tiposDefinidosPorBibliotecas).toBe('object');
            expect(Object.keys(avaliador.tiposDefinidosPorBibliotecas)).toHaveLength(0);
        });

        it('deve inicializar arquivosImportados como array vazio', () => {
            const mockImportador = new ImportadorExtensao();
            const avaliador = new AvaliadorSintaticoComImportacao(mockImportador);

            expect(avaliador.arquivosImportados).toBeDefined();
            expect(Array.isArray(avaliador.arquivosImportados)).toBe(true);
            expect(avaliador.arquivosImportados).toHaveLength(0);
        });

        it('deve herdar de AvaliadorSintatico', () => {
            const mockImportador = new ImportadorExtensao();
            const avaliador = new AvaliadorSintaticoComImportacao(mockImportador);

            expect(avaliador.primitivasConhecidas).toBeDefined();
            expect(avaliador.tiposDefinidosEmCodigo).toBeDefined();
        });
    });

    describe('finalizarChamada', () => {
        it('deve existir como método', () => {
            const mockImportador = new ImportadorExtensao();
            const avaliador = new AvaliadorSintaticoComImportacao(mockImportador);

            expect(typeof avaliador.finalizarChamada).toBe('function');
        });

        it('deve ser assíncrono', async () => {
            const mockImportador = new ImportadorExtensao();
            const avaliador = new AvaliadorSintaticoComImportacao(mockImportador);

            const mockEntidadeChamada = {};
            const resultado = avaliador.finalizarChamada(mockEntidadeChamada);

            expect(resultado).toBeInstanceOf(Promise);
        });
    });

    describe('importarFuncaoPadraoComoComponente', () => {
        it('deve ser um método protegido', () => {
            const mockImportador = new ImportadorExtensao();
            const avaliador = new AvaliadorSintaticoComImportacao(mockImportador);

            // Método protegido ainda pode ser acessado em testes
            expect(typeof avaliador.importarFuncaoPadraoComoComponente).toBe('function');
        });

        it('deve criar componente com nome fornecido', () => {
            const { FuncaoPadrao } = require('@designliquido/delegua/interpretador/estruturas');
            const mockImportador = new ImportadorExtensao();
            const avaliador = new AvaliadorSintaticoComImportacao(mockImportador);

            const funcaoPadrao = new FuncaoPadrao('número', []);
            const componente = avaliador.importarFuncaoPadraoComoComponente(funcaoPadrao, 'minhaFuncao');

            expect(componente).toBeDefined();
            expect(componente.nome).toBe('minhaFuncao');
        });

        it('deve definir tipo de retorno da função', () => {
            const { FuncaoPadrao } = require('@designliquido/delegua/interpretador/estruturas');
            const mockImportador = new ImportadorExtensao();
            const avaliador = new AvaliadorSintaticoComImportacao(mockImportador);

            const funcaoPadrao = new FuncaoPadrao('texto');
            const componente = avaliador.importarFuncaoPadraoComoComponente(funcaoPadrao, 'funcao');

            expect(componente.tipo).toBe('texto');
        });

        it('deve usar "qualquer" como tipo padrão quando não especificado', () => {
            const { FuncaoPadrao } = require('@designliquido/delegua/interpretador/estruturas');
            const mockImportador = new ImportadorExtensao();
            const avaliador = new AvaliadorSintaticoComImportacao(mockImportador);

            const funcaoPadrao = new FuncaoPadrao();
            const componente = avaliador.importarFuncaoPadraoComoComponente(funcaoPadrao, 'funcao');

            expect(componente.tipo).toBe('qualquer');
        });

        it('deve processar argumentos da função', () => {
            const { FuncaoPadrao } = require('@designliquido/delegua/interpretador/estruturas');
            const mockImportador = new ImportadorExtensao();
            const avaliador = new AvaliadorSintaticoComImportacao(mockImportador);

            const funcaoPadrao = new FuncaoPadrao('número', [
                { nome: 'a', tipo: 'número' },
                { nome: 'b', tipo: 'número' }
            ]);
            const componente = avaliador.importarFuncaoPadraoComoComponente(funcaoPadrao, 'somar');

            expect(componente.subElementos).toHaveLength(2);
            expect(componente.subElementos[0].nome).toBe('a');
            expect(componente.subElementos[1].nome).toBe('b');
        });

        it('deve marcar componente como função', () => {
            const { FuncaoPadrao } = require('@designliquido/delegua/interpretador/estruturas');
            const mockImportador = new ImportadorExtensao();
            const avaliador = new AvaliadorSintaticoComImportacao(mockImportador);

            const funcaoPadrao = new FuncaoPadrao('qualquer');
            const componente = avaliador.importarFuncaoPadraoComoComponente(funcaoPadrao, 'funcao');

            expect(componente.ehFuncao).toBe(true);
        });
    });

    describe('criarComponenteDeClasse', () => {
        it('deve ser um método protegido', () => {
            const mockImportador = new ImportadorExtensao();
            const avaliador = new AvaliadorSintaticoComImportacao(mockImportador);

            expect(typeof avaliador.criarComponenteDeClasse).toBe('function');
        });

        it('deve criar componente com nome fornecido', () => {
            const mockImportador = new ImportadorExtensao();
            const avaliador = new AvaliadorSintaticoComImportacao(mockImportador);

            const componente = avaliador.criarComponenteDeClasse('modulo', 'MinhaClasse', {});

            expect(componente).toBeDefined();
            expect(componente.nome).toBe('MinhaClasse');
            expect(componente.tipo).toBe('classe');
        });

        it('deve processar métodos da classe', () => {
            const { FuncaoPadrao } = require('@designliquido/delegua/interpretador/estruturas');
            const mockImportador = new ImportadorExtensao();
            const avaliador = new AvaliadorSintaticoComImportacao(mockImportador);

            const classe = {
                metodos: {
                    calcular: new FuncaoPadrao('número', [])
                }
            };

            const componente = avaliador.criarComponenteDeClasse('modulo', 'Calculadora', classe);

            expect(componente.subElementos.length).toBeGreaterThan(0);
        });

        it('deve processar propriedades da classe', () => {
            const mockImportador = new ImportadorExtensao();
            const avaliador = new AvaliadorSintaticoComImportacao(mockImportador);

            const classe = {
                propriedades: {
                    valor: 'número',
                    nome: 'texto'
                }
            };

            const componente = avaliador.criarComponenteDeClasse('modulo', 'MeuObjeto', classe);

            expect(componente.subElementos.length).toBeGreaterThan(0);
        });
    });

    describe('importarBibliotecaNode', () => {
        it('deve ser um método protegido', () => {
            const mockImportador = new ImportadorExtensao();
            const avaliador = new AvaliadorSintaticoComImportacao(mockImportador);

            expect(typeof avaliador.importarBibliotecaNode).toBe('function');
        });

        it('deve retornar ImportarBiblioteca', () => {
            const { Literal } = require('@designliquido/delegua');
            const mockImportador = new ImportadorExtensao();
            const avaliador = new AvaliadorSintaticoComImportacao(mockImportador);

            const literal = {
                valor: '@designliquido/biblioteca-teste',
                hashArquivo: 1,
                linha: 1
            };

            const resultado = avaliador.importarBibliotecaNode(literal);

            expect(resultado).toBeDefined();
            expect(resultado.caminho).toBe('@designliquido/biblioteca-teste');
        });
    });

    describe('logicaComumImportacaoModulo', () => {
        it('deve ser um método protegido assíncrono', () => {
            const mockImportador = new ImportadorExtensao();
            const avaliador = new AvaliadorSintaticoComImportacao(mockImportador);

            expect(typeof avaliador.logicaComumImportacaoModulo).toBe('function');
        });

        it('deve adicionar arquivo à lista de importados', async () => {
            const mockImportador = new ImportadorExtensao();
            const avaliador = new AvaliadorSintaticoComImportacao(mockImportador);

            const literal = {
                valor: './modulo.delegua',
                hashArquivo: 1,
                linha: 1
            };

            const simbolo = { linha: 1 };

            await avaliador.logicaComumImportacaoModulo(literal, simbolo);

            expect(avaliador.arquivosImportados).toContain('./modulo.delegua');
        });
    });

    describe('Integração', () => {
        it('deve ser capaz de criar múltiplas instâncias', () => {
            const importador1 = new ImportadorExtensao();
            const importador2 = new ImportadorExtensao();

            const avaliador1 = new AvaliadorSintaticoComImportacao(importador1);
            const avaliador2 = new AvaliadorSintaticoComImportacao(importador2);

            expect(avaliador1).not.toBe(avaliador2);
            expect(avaliador1.importador).not.toBe(avaliador2.importador);
        });

        it('deve manter estado independente entre instâncias', () => {
            const mockImportador1 = new ImportadorExtensao();
            const mockImportador2 = new ImportadorExtensao();

            const avaliador1 = new AvaliadorSintaticoComImportacao(mockImportador1);
            const avaliador2 = new AvaliadorSintaticoComImportacao(mockImportador2);

            avaliador1.arquivosImportados.push('arquivo1.delegua');
            avaliador2.arquivosImportados.push('arquivo2.delegua');

            expect(avaliador1.arquivosImportados).toEqual(['arquivo1.delegua']);
            expect(avaliador2.arquivosImportados).toEqual(['arquivo2.delegua']);
        });
    });
});
