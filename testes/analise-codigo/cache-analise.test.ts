// @ts-nocheck
import { describe, it, expect, beforeEach } from '@jest/globals';
import {
    definirResultado,
    expirarResultado,
    expirarResultadosPorDependenciaArquivo,
    expirarTudo,
    limparResultadosExpirados,
    obterDiagnosticos,
    obterResultado,
    obterResultadoValido,
} from '../../fontes/analise-codigo/cache-analise';

describe('cache-analise', () => {
    beforeEach(() => {
        jest.useRealTimers();
        expirarTudo();
    });

    // Mock de ResultadoAnaliseInterface para usar nos testes
    const criarResultadoMock = (id: string): ResultadoAnaliseInterface => ({
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

        it('deve expirar resultado após TTL informado', () => {
            jest.useFakeTimers();
            const uri = 'file:///test/ttl.delegua';
            const resultado = criarResultadoMock('ttl');

            definirResultado(uri, resultado, { ttlMs: 1000 });
            expect(obterResultado(uri)).toBe(resultado);

            jest.advanceTimersByTime(1001);
            expect(obterResultado(uri)).toBeUndefined();
        });
    });

    describe('invalidacao manual', () => {
        it('deve expirar resultado por URI', () => {
            const uri = 'file:///test/manual.delegua';
            definirResultado(uri, criarResultadoMock('manual'));

            expirarResultado(uri, 'teste');
            expect(obterResultado(uri)).toBeUndefined();
        });

        it('deve limpar todos os resultados', () => {
            definirResultado('file:///test/1.delegua', criarResultadoMock('1'));
            definirResultado('file:///test/2.delegua', criarResultadoMock('2'));

            expirarTudo('teste');

            expect(obterResultado('file:///test/1.delegua')).toBeUndefined();
            expect(obterResultado('file:///test/2.delegua')).toBeUndefined();
        });

        it('deve expirar entradas que dependem de arquivo alterado', () => {
            const uriA = 'file:///test/a.delegua';
            const uriB = 'file:///test/b.delegua';

            definirResultado(uriA, criarResultadoMock('a'), {
                dependenciasArquivos: ['C:/projeto/modelos/usuario.delegua']
            });

            definirResultado(uriB, criarResultadoMock('b'), {
                dependenciasArquivos: ['C:/projeto/modelos/produto.delegua']
            });

            expirarResultadosPorDependenciaArquivo(['c:\\projeto\\modelos\\usuario.delegua']);

            expect(obterResultado(uriA)).toBeUndefined();
            expect(obterResultado(uriB)).toBeDefined();
        });
    });

    describe('validacao de versao e hash', () => {
        it('deve retornar resultado valido quando versao e hash corresponderem', () => {
            const uri = 'file:///test/versao-hash.delegua';
            const resultado = criarResultadoMock('vh');

            definirResultado(uri, resultado, {
                versaoDocumento: 7,
                hashConteudo: 123,
            });

            expect(
                obterResultadoValido(uri, {
                    versaoDocumento: 7,
                    hashConteudo: 123,
                })
            ).toBe(resultado);
        });

        it('deve retornar undefined quando versao nao corresponder', () => {
            const uri = 'file:///test/versao-invalida.delegua';
            definirResultado(uri, criarResultadoMock('vi'), { versaoDocumento: 1, hashConteudo: 123 });

            expect(obterResultadoValido(uri, { versaoDocumento: 2, hashConteudo: 123 })).toBeUndefined();
        });

        it('deve retornar undefined quando hash nao corresponder', () => {
            const uri = 'file:///test/hash-invalido.delegua';
            definirResultado(uri, criarResultadoMock('hi'), { versaoDocumento: 1, hashConteudo: 123 });

            expect(obterResultadoValido(uri, { versaoDocumento: 1, hashConteudo: 999 })).toBeUndefined();
        });
    });

    describe('diagnosticos em cache', () => {
        it('deve armazenar e recuperar diagnosticos', () => {
            const uri = 'file:///test/diagnosticos.delegua';
            const diagnosticos = [{ mensagem: 'erro teste' }];

            definirResultado(uri, criarResultadoMock('diag'), { diagnosticos });
            expect(obterDiagnosticos(uri)).toEqual(diagnosticos);
        });
    });

    describe('limpeza de expirados', () => {
        it('deve remover apenas entradas expiradas', () => {
            jest.useFakeTimers();

            definirResultado('file:///test/expira-rapido.delegua', criarResultadoMock('rapido'), { ttlMs: 1000 });
            definirResultado('file:///test/expira-lento.delegua', criarResultadoMock('lento'), { ttlMs: 5000 });

            jest.advanceTimersByTime(1500);
            const removidos = limparResultadosExpirados();

            expect(removidos).toBe(1);
            expect(obterResultado('file:///test/expira-rapido.delegua')).toBeUndefined();
            expect(obterResultado('file:///test/expira-lento.delegua')).toBeDefined();
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
            const resultadoVazio: ResultadoAnaliseInterface = {
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
