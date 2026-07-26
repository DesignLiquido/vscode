import { describe, it, expect } from '@jest/globals';
import * as sistemaArquivos from 'fs';
import caminho from 'path';

/**
 * Testes de regressão para o achado A2 (issue #101):
 * Pituguês é uma linguagem indentada por dois-pontos e precisa de
 * indentationRules, onEnterRules, folding e wordPattern, como o LMHT
 * já possui. Estes testes validam os padrões contra código real, para
 * que uma regressão no JSON de configuração seja detectada.
 */
describe('Configuração de linguagem Pituguês', () => {
    const configuracao = JSON.parse(
        sistemaArquivos.readFileSync(
            caminho.join(__dirname, '../../configuracoes/configuracao-pitugues.json'),
            'utf-8'
        )
    );

    it('deve declarar as oito seções de configuração, como o LMHT', () => {
        for (const secao of [
            'comments',
            'brackets',
            'autoClosingPairs',
            'surroundingPairs',
            'indentationRules',
            'onEnterRules',
            'folding',
            'wordPattern'
        ]) {
            expect(configuracao[secao]).toBeDefined();
        }
    });

    describe('increaseIndentPattern', () => {
        const regex = new RegExp(configuracao.indentationRules.increaseIndentPattern);

        it.each([
            'funcao rota(requisicao, resposta):',
            '    se x > 0:',
            'para cada i em intervalo(0, 5):',
            'enquanto verdadeiro:',
            'senao:',
            'senao se y < 2:',
            'escolha chave:',
            '    caso 1:',
            'tente:',
            'pegue erro:',
            'finalmente:',
            'classe Pessoa(Animal):',
            '    construtor(nome):',
            'fazer:'
        ])('aumenta indentação após "%s"', (linha) => {
            expect(regex.test(linha)).toBe(true);
        });

        it.each([
            'x = 10',
            'escreva("texto: com dois pontos")',
            'retorna x',
            '# comentario: com dois pontos',
            'y = {"chave": valor}'
        ])('não aumenta indentação em "%s"', (linha) => {
            expect(regex.test(linha)).toBe(false);
        });
    });

    describe('decreaseIndentPattern', () => {
        const regex = new RegExp(configuracao.indentationRules.decreaseIndentPattern);

        it.each(['senao:', 'senao se y:', 'caso 2:', 'pegue e:', 'finalmente:'])(
            'des-indenta a linha de continuação "%s"',
            (linha) => {
                expect(regex.test(linha)).toBe(true);
            }
        );

        it.each(['se x:', 'funcao f():', 'x = 10'])(
            'não des-indenta "%s"',
            (linha) => {
                expect(regex.test(linha)).toBe(false);
            }
        );
    });

    describe('onEnterRules', () => {
        it('deve indentar a próxima linha após abertura de bloco', () => {
            const regra = configuracao.onEnterRules[0];
            const regex = new RegExp(regra.beforeText.pattern);
            expect(regex.test('funcao rota(requisicao, resposta):')).toBe(true);
            expect(regex.test('x = 10')).toBe(false);
            expect(regra.action.indent).toBe('indent');
        });
    });

    describe('folding', () => {
        it('deve usar dobra por indentação (offSide)', () => {
            expect(configuracao.folding.offSide).toBe(true);
        });
    });

    describe('wordPattern', () => {
        const regex = new RegExp(configuracao.wordPattern);

        it.each(['numero', 'número', 'endereço', 'validação', 'usuário', 'variavel_conta'])(
            'captura o identificador acentuado "%s" como uma palavra única',
            (palavra) => {
                const resultado = regex.exec(palavra);
                expect(resultado).not.toBeNull();
                expect(resultado![0]).toBe(palavra);
            }
        );
    });
});
