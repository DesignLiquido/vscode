import { describe, it, expect, beforeEach } from '@jest/globals';
import { definirResultado, obterResultado, ResultadoAnalise } from '../../fontes/analise-codigo/cache-analise';

describe('cache-analise', () => {
    // Mock de ResultadoAnalise para usar nos testes
    const criarResultadoMock = (id: string): ResultadoAnalise => ({
        lexador: {
            simbolos: [],
            erros: []
        },
        avaliadorSintatico: {
            declaracoes: [],
            erros: []
        },
        analisadorSemantico: {
            diagnosticos: []
        }
    });

    describe('definirResultado', () => {
        it('deve armazenar um resultado no cache', () => {
            const uri = 'file:///test/arquivo.delegua';
            const resultado = criarResultadoMock('test1');

            definirResultado(uri, resultado);
            const resultadoObtido = obterResultado(uri);

            expect(resultadoObtido).toBeDefined();
            expect(resultadoObtido).toBe(resultado);
        });

        it('deve sobrescrever resultado existente para mesma URI', () => {
            const uri = 'file:///test/arquivo.delegua';
            const resultado1 = criarResultadoMock('test1');
            const resultado2 = criarResultadoMock('test2');

            definirResultado(uri, resultado1);
            definirResultado(uri, resultado2);

            const resultadoObtido = obterResultado(uri);

            expect(resultadoObtido).toBe(resultado2);
            expect(resultadoObtido).not.toBe(resultado1);
        });

        it('deve permitir armazenar múltiplos resultados com URIs diferentes', () => {
            const uri1 = 'file:///test/arquivo1.delegua';
            const uri2 = 'file:///test/arquivo2.delegua';
            const resultado1 = criarResultadoMock('test1');
            const resultado2 = criarResultadoMock('test2');

            definirResultado(uri1, resultado1);
            definirResultado(uri2, resultado2);

            expect(obterResultado(uri1)).toBe(resultado1);
            expect(obterResultado(uri2)).toBe(resultado2);
        });
    });

    describe('obterResultado', () => {
        it('deve retornar undefined para URI não encontrada', () => {
            const uri = 'file:///test/nao-existe.delegua';
            const resultado = obterResultado(uri);

            expect(resultado).toBeUndefined();
        });

        it('deve retornar o resultado correto para URI existente', () => {
            const uri = 'file:///test/arquivo.delegua';
            const resultado = criarResultadoMock('test');

            definirResultado(uri, resultado);
            const resultadoObtido = obterResultado(uri);

            expect(resultadoObtido).toBe(resultado);
        });

        it('deve retornar undefined após cache ser limpo (implicitamente)', () => {
            // Este teste verifica o comportamento básico
            const uriNaoDefinida = 'file:///test/nunca-definido.delegua';
            expect(obterResultado(uriNaoDefinida)).toBeUndefined();
        });
    });

    describe('Cenários de uso integrados', () => {
        it('deve gerenciar ciclo completo de armazenamento e recuperação', () => {
            const uri = 'file:///test/ciclo.delegua';

            // Verifica que não existe inicialmente
            expect(obterResultado(uri)).toBeUndefined();

            // Define resultado
            const resultado = criarResultadoMock('ciclo');
            definirResultado(uri, resultado);

            // Verifica que existe agora
            expect(obterResultado(uri)).toBe(resultado);

            // Atualiza resultado
            const novoResultado = criarResultadoMock('ciclo-atualizado');
            definirResultado(uri, novoResultado);

            // Verifica que foi atualizado
            expect(obterResultado(uri)).toBe(novoResultado);
        });

        it('deve manter isolamento entre diferentes URIs', () => {
            const uris = [
                'file:///test/arquivo1.delegua',
                'file:///test/arquivo2.delegua',
                'file:///test/arquivo3.delegua'
            ];

            const resultados = uris.map((uri, idx) => ({
                uri,
                resultado: criarResultadoMock(`test${idx}`)
            }));

            // Armazena todos os resultados
            resultados.forEach(({ uri, resultado }) => {
                definirResultado(uri, resultado);
            });

            // Verifica que cada URI retorna o resultado correto
            resultados.forEach(({ uri, resultado }) => {
                expect(obterResultado(uri)).toBe(resultado);
            });
        });

        it('deve lidar com URIs com caracteres especiais', () => {
            const urisEspeciais = [
                'file:///test/arquivo com espaços.delegua',
                'file:///test/arquivo-com-hífens.delegua',
                'file:///test/arquivo_com_underscores.delegua',
                'file:///test/caminho/muito/profundo/arquivo.delegua'
            ];

            urisEspeciais.forEach((uri, idx) => {
                const resultado = criarResultadoMock(`especial${idx}`);
                definirResultado(uri, resultado);
                expect(obterResultado(uri)).toBe(resultado);
            });
        });
    });

    describe('Casos extremos', () => {
        it('deve lidar com URI vazia', () => {
            const uri = '';
            const resultado = criarResultadoMock('vazio');

            definirResultado(uri, resultado);
            expect(obterResultado(uri)).toBe(resultado);
        });

        it('deve lidar com resultados com estruturas vazias', () => {
            const uri = 'file:///test/vazio.delegua';
            const resultadoVazio: ResultadoAnalise = {
                lexador: { simbolos: [], erros: [] },
                avaliadorSintatico: { declaracoes: [], erros: [] },
                analisadorSemantico: { diagnosticos: [] }
            };

            definirResultado(uri, resultadoVazio);
            const obtido = obterResultado(uri);

            expect(obtido).toBeDefined();
            expect(obtido?.lexador.simbolos).toHaveLength(0);
            expect(obtido?.avaliadorSintatico.declaracoes).toHaveLength(0);
            expect(obtido?.analisadorSemantico.diagnosticos).toHaveLength(0);
        });

        it('deve preservar referências aos objetos armazenados', () => {
            const uri = 'file:///test/referencia.delegua';
            const resultado = criarResultadoMock('ref');

            definirResultado(uri, resultado);
            const obtido1 = obterResultado(uri);
            const obtido2 = obterResultado(uri);

            // Deve retornar a mesma referência
            expect(obtido1).toBe(obtido2);
            expect(obtido1).toBe(resultado);
        });
    });
});
