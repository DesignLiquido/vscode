import { describe, it, expect } from '@jest/globals';

/**
 * Este é um arquivo de exemplo mostrando como escrever testes unitários
 * para funções utilitárias.
 *
 * Você pode criar arquivos de teste similares para testar:
 * - Funções auxiliares
 * - Classes de serviço
 * - Lógica de negócio
 * - Transformações de dados
 * - etc.
 */

describe('Exemplo de Testes Unitários', () => {
    describe('Funções básicas', () => {
        it('deve realizar operações matemáticas simples', () => {
            const soma = (a: number, b: number) => a + b;
            expect(soma(2, 3)).toBe(5);
            expect(soma(-1, 1)).toBe(0);
        });

        it('deve manipular strings', () => {
            const capitalize = (str: string) =>
                str.charAt(0).toUpperCase() + str.slice(1);

            expect(capitalize('delegua')).toBe('Delegua');
            expect(capitalize('teste')).toBe('Teste');
        });

        it('deve trabalhar com arrays', () => {
            const numeros = [1, 2, 3, 4, 5];
            const pares = numeros.filter(n => n % 2 === 0);

            expect(pares).toEqual([2, 4]);
            expect(pares.length).toBe(2);
        });
    });

    describe('Funções assíncronas', () => {
        it('deve lidar com promises', async () => {
            const asyncFunction = async () => {
                return new Promise((resolve) => {
                    setTimeout(() => resolve('sucesso'), 10);
                });
            };

            const result = await asyncFunction();
            expect(result).toBe('sucesso');
        });

        it('deve capturar erros em promises', async () => {
            const errorFunction = async () => {
                throw new Error('Erro intencional');
            };

            await expect(errorFunction()).rejects.toThrow('Erro intencional');
        });
    });

    describe('Objetos e tipos', () => {
        interface Usuario {
            nome: string;
            idade: number;
        }

        it('deve validar estrutura de objetos', () => {
            const usuario: Usuario = {
                nome: 'João',
                idade: 25
            };

            expect(usuario).toHaveProperty('nome');
            expect(usuario).toHaveProperty('idade');
            expect(usuario.nome).toBe('João');
        });

        it('deve comparar objetos', () => {
            const obj1 = { a: 1, b: 2 };
            const obj2 = { a: 1, b: 2 };

            expect(obj1).toEqual(obj2);
            expect(obj1).not.toBe(obj2); // Referências diferentes
        });
    });
});

/**
 * Para testar módulos reais da extensão, você pode:
 *
 * 1. Importar funções específicas:
 *    import { minhaFuncao } from '../fontes/modulo';
 *
 * 2. Criar mocks de dependências:
 *    jest.mock('../fontes/dependencia');
 *
 * 3. Testar comportamentos específicos:
 *    - Validação de entrada
 *    - Transformação de dados
 *    - Tratamento de erros
 *    - Casos extremos (edge cases)
 *
 * 4. Usar matchers do Jest:
 *    - toBe, toEqual
 *    - toHaveProperty
 *    - toThrow, rejects.toThrow
 *    - toHaveBeenCalled, toHaveBeenCalledWith
 *    - etc.
 */
