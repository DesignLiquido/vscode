import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import * as Path from 'path';

import { DeleguaTempoExecucaoRemoto } from '../../fontes/depuracao/remota/delegua-tempo-execucao-remoto';

describe('DeleguaTempoExecucaoRemoto', () => {
    beforeEach(() => {
        jest.useRealTimers();
    });

    function criarTempoExecucao() {
        return new DeleguaTempoExecucaoRemoto() as any;
    }

    it('deve definir e limpar pontos de parada por arquivo', () => {
        const tempoExecucao = criarTempoExecucao();

        const bp1 = tempoExecucao.definirPontoParada('C:/Projeto/Arquivo.delegua', 10);
        const bp2 = tempoExecucao.definirPontoParada('C:/Projeto/Arquivo.delegua', 20);

        expect(bp1.id).toBe(1);
        expect(bp2.id).toBe(2);
        expect(bp1.verificado).toBe(true);

        const chave = Path.resolve('C:/Projeto/Arquivo.delegua').toLowerCase();
        expect(tempoExecucao._pontosParada.get(chave)).toHaveLength(2);

        tempoExecucao.limparTodosPontosParada('C:/Projeto/Arquivo.delegua');
        expect(tempoExecucao._pontosParada.get(chave)).toBeUndefined();
    });

    it('deve enviar todos os pontos de parada para servidor', () => {
        const tempoExecucao = criarTempoExecucao();
        const enviarParaServidorDepuracao = jest.spyOn(tempoExecucao, 'enviarParaServidorDepuracao').mockImplementation(() => undefined);

        tempoExecucao.definirPontoParada('C:/Projeto/A.delegua', 3);
        tempoExecucao.definirPontoParada('C:/Projeto/A.delegua', 7);

        tempoExecucao.enviarPontosParadaParaServidorDepuracao('C:/Projeto/A.delegua');

        expect(enviarParaServidorDepuracao).toHaveBeenCalledWith(
            'adicionar-ponto-parada',
            `${Path.resolve('C:/Projeto/A.delegua').toLowerCase()} 3`
        );
        expect(enviarParaServidorDepuracao).toHaveBeenCalledWith(
            'adicionar-ponto-parada',
            `${Path.resolve('C:/Projeto/A.delegua').toLowerCase()} 7`
        );
    });

    it('deve montar pilha de execução para VSCode e pedir atualização ao servidor', () => {
        const tempoExecucao = criarTempoExecucao();
        const enviarParaServidorDepuracao = jest.spyOn(tempoExecucao, 'enviarParaServidorDepuracao').mockImplementation(() => undefined);
        tempoExecucao._pilhaExecucao = [
            { id: 1, nome: 'funcaoA', arquivo: '/a.delegua', linha: 9 },
            { id: 2, nome: 'funcaoB', arquivo: '/b.delegua', linha: 13 },
        ];

        const pilha = tempoExecucao.pilhaExecucao();

        expect(enviarParaServidorDepuracao).toHaveBeenCalledWith('pilha-execucao');
        expect(pilha).toEqual([
            { index: 1, name: 'funcaoA', file: '/a.delegua', line: 9 },
            { index: 2, name: 'funcaoB', file: '/b.delegua', line: 13 },
        ]);
    });

    it('deve popular variáveis de resposta do depurador', () => {
        const tempoExecucao = criarTempoExecucao();

        tempoExecucao.popularVariaveis([
            'cabecalho',
            '--- variaveis-resposta ---',
            'nome::texto::valor',
            'idade::número::42',
            'fim',
        ]);

        expect(tempoExecucao.todasVariaveis).toEqual([
            { name: 'nome', type: 'texto', value: 'valor', variablesReference: 0 },
            { name: 'idade', type: 'número', value: '42', variablesReference: 0 },
        ]);
        expect(tempoExecucao.variaveisEscopo).toEqual([]);
    });

    it('deve processar resposta de avaliar-variavel e notificar conclusão', () => {
        const tempoExecucao = criarTempoExecucao();
        const notify = jest.fn();
        tempoExecucao._avaliacaoFinalizada = { notify };

        tempoExecucao.processarDoDepurador(Buffer.from('cmd\n--- avaliar-variavel-resposta ---\nresultado'));

        expect(tempoExecucao._resultadoAvaliacao).toBe('resultado');
        expect(notify).toHaveBeenCalled();
    });

    it('deve processar resposta continuar e solicitar pilha/variáveis', () => {
        jest.useFakeTimers();
        const tempoExecucao = criarTempoExecucao();
        const enviarParaServidorDepuracao = jest.spyOn(tempoExecucao, 'enviarParaServidorDepuracao').mockImplementation(() => undefined);
        const eventos: string[] = [];
        tempoExecucao.on('pararEmEntrada', () => eventos.push('pararEmEntrada'));

        tempoExecucao.processarDoDepurador(Buffer.from('x\n--- continuar-resposta ---\n'));
        jest.runAllTimers();

        expect(enviarParaServidorDepuracao).toHaveBeenCalledWith('pilha-execucao');
        expect(enviarParaServidorDepuracao).toHaveBeenCalledWith('variaveis');
        expect(eventos).toEqual(['pararEmEntrada']);
    });

    it('deve mapear caminho local/servidor quando base remota estiver definida', () => {
        const tempoExecucao = criarTempoExecucao();
        tempoExecucao._serverBase = '/srv/delegua';
        tempoExecucao._localBase = '';

        const local = tempoExecucao.obterCaminhoArquivoLocal('C:/projeto/sub/arquivo.delegua');
        const servidor = tempoExecucao.obterCaminhoServidor('C:/projeto/sub/arquivo.delegua');

        expect(local.endsWith(`projeto${Path.sep}sub${Path.sep}arquivo.delegua`)).toBe(true);
        expect(servidor.replace(/\\/g, '/')).toBe('/srv/delegua/arquivo.delegua');
    });

    it('deve buscar descrição de hover em função e fallback para expressão', () => {
        const tempoExecucao = criarTempoExecucao();

        const hoverFuncao = tempoExecucao.obterValorPonteiroMouse('se');
        const hoverDesconhecido = tempoExecucao.obterValorPonteiroMouse('objeto.inexistente');

        expect(hoverFuncao).toContain('Fluxo se-senaose-senao');
        expect(hoverDesconhecido).toBe('objeto.inexistente');
    });

    it('deve enviar comandos de passo/escopo e variáveis para servidor', () => {
        const tempoExecucao = criarTempoExecucao();
        const enviarParaServidorDepuracao = jest.spyOn(tempoExecucao, 'enviarParaServidorDepuracao').mockImplementation(() => undefined);

        tempoExecucao.passo();
        tempoExecucao.adentrarEscopo();
        tempoExecucao.sairEscopo();
        tempoExecucao.variaveis();

        expect(enviarParaServidorDepuracao).toHaveBeenCalledWith('proximo');
        expect(enviarParaServidorDepuracao).toHaveBeenCalledWith('adentrar-escopo');
        expect(enviarParaServidorDepuracao).toHaveBeenCalledWith('sair-escopo');
        expect(enviarParaServidorDepuracao).toHaveBeenCalledWith('variaveis');
    });

    it('deve validar depuração por extensão e estado de exceção', () => {
        const tempoExecucao = criarTempoExecucao();
        const desconectarDoDepurador = jest.spyOn(tempoExecucao, 'desconectarDoDepurador').mockImplementation(() => undefined);

        expect(tempoExecucao.verificarDepuracao('/a/b/codigo.cs')).toBe(true);
        expect(tempoExecucao.verificarDepuracao('/a/b/codigo.delegua')).toBe(false);

        tempoExecucao._ehExcecao = true;
        expect(tempoExecucao.verificarDepuracao('/a/b/codigo.cs')).toBe(false);
        expect(desconectarDoDepurador).toHaveBeenCalled();
    });
});
