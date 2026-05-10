import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { palavrasReservadasDelegua } from '@designliquido/delegua/lexador/palavras-reservadas';

const mockVscode = {
    workspace: {
        workspaceFolders: undefined as any,
    },
};

jest.mock('vscode', () => mockVscode, { virtual: true });

import { DeleguaTempoExecucaoWeb } from '../../fontes/depuracao/web/delegua-tempo-execucao-web';

describe('DeleguaTempoExecucaoWeb', () => {
    beforeEach(() => {
        mockVscode.workspace.workspaceFolders = undefined;
        jest.useRealTimers();
    });

    function criarTempoExecucao() {
        const provedorVisao = {
            ativarVisao: jest.fn(),
            limparTerminal: jest.fn(),
            escreverEmSaida: jest.fn(),
            escreverEmSaidaMesmaLinha: jest.fn(),
            aguardarEntrada: jest.fn(async () => 'entrada'),
        };

        const diagnosticos = {
            clear: jest.fn(),
            set: jest.fn(),
        };

        return new DeleguaTempoExecucaoWeb(provedorVisao as any, diagnosticos as any) as any;
    }

    it('deve obter diretorio base do workspace quando houver pasta aberta', () => {
        mockVscode.workspace.workspaceFolders = [{ uri: { path: '/workspace/projeto' } }];
        const tempoExecucao = criarTempoExecucao();

        const diretorioBase = tempoExecucao.obterDiretorioBase();

        expect(diretorioBase).toBe('/workspace/projeto');
    });

    it('deve retornar diretorio base vazio quando nao houver workspace', () => {
        const tempoExecucao = criarTempoExecucao();

        const diretorioBase = tempoExecucao.obterDiretorioBase();

        expect(diretorioBase).toBe('');
    });

    it('deve definir e reiniciar pontos de parada no interpretador quando hash existir', () => {
        const tempoExecucao = criarTempoExecucao();
        tempoExecucao._hashArquivoInicial = 77;
        tempoExecucao.interpretador = { pontosParada: [] };

        tempoExecucao.definirPontosParada([{ line: 3 }, { line: 9 }]);

        expect(tempoExecucao._pontosParada).toEqual([
            { hashArquivo: 77, linha: 3 },
            { hashArquivo: 77, linha: 9 },
        ]);
        expect(tempoExecucao.interpretador.pontosParada).toEqual(tempoExecucao._pontosParada);

        tempoExecucao.reiniciarPontosParada();

        expect(tempoExecucao._pontosParada).toEqual([]);
        expect(tempoExecucao._linhasPontosParada).toEqual([]);
        expect(tempoExecucao.interpretador.pontosParada).toEqual([]);
    });

    it('deve montar pilha de execucao a partir da pilha do interpretador', () => {
        const tempoExecucao = criarTempoExecucao();
        tempoExecucao._arquivoInicial = '/workspace/arquivo.delegua';
        tempoExecucao._conteudoArquivo = ['linha 1', 'linha 2', 'linha 3'];
        tempoExecucao.interpretador = {
            pilhaEscoposExecucao: {
                pilha: [
                    { declaracoes: [], declaracaoAtual: 0 },
                    {
                        declaracoes: [{ linha: 2 }],
                        declaracaoAtual: 0,
                    },
                    {
                        declaracoes: [{ linha: 3 }],
                        declaracaoAtual: 0,
                    },
                ],
            },
        };

        const pilha = tempoExecucao.pilhaExecucao();

        expect(pilha).toEqual([
            {
                id: 1,
                linha: 3,
                nome: 'linha 3',
                arquivo: '/workspace/arquivo.delegua',
                metodo: '<principal>',
            },
            {
                id: 2,
                linha: 2,
                nome: 'linha 2',
                arquivo: '/workspace/arquivo.delegua',
                metodo: '<principal>',
            },
        ]);
    });

    it('deve retornar pilha vazia quando interpretador nao existir', () => {
        const tempoExecucao = criarTempoExecucao();

        expect(tempoExecucao.pilhaExecucao()).toEqual([]);
    });

    it('deve registrar apenas linhas quando hash do arquivo ainda nao foi definido', () => {
        const tempoExecucao = criarTempoExecucao();
        tempoExecucao._hashArquivoInicial = -1;

        tempoExecucao.definirPontosParada([{ line: 7 }, { line: 11 }]);

        expect(tempoExecucao._linhasPontosParada).toEqual([7, 11]);
        expect(tempoExecucao._pontosParada).toEqual([]);
    });

    it('deve delegar operacoes de escopo e variaveis ao interpretador', () => {
        const tempoExecucao = criarTempoExecucao();
        const adentrarEscopo = jest.fn();
        const instrucaoProximoESair = jest.fn();
        const obterTodasVariaveis = jest.fn(() => [{ nome: 'a', valor: 1 }]);

        tempoExecucao.interpretador = {
            adentrarEscopo,
            instrucaoProximoESair,
            pilhaEscoposExecucao: {
                obterTodasVariaveis,
            },
        };

        tempoExecucao.adentrarEscopo();
        tempoExecucao.sairEscopo();

        expect(adentrarEscopo).toHaveBeenCalled();
        expect(instrucaoProximoESair).toHaveBeenCalled();
        expect(tempoExecucao.variaveis()).toEqual([{ nome: 'a', valor: 1 }]);
    });

    it('deve retornar variaveis vazias sem interpretador', () => {
        const tempoExecucao = criarTempoExecucao();

        expect(tempoExecucao.variaveis()).toEqual([]);
    });

    it('deve ignorar palavra reservada ao obter variavel', () => {
        const tempoExecucao = criarTempoExecucao();
        const chaveReservada = Object.keys(palavrasReservadasDelegua)[0];
        tempoExecucao.interpretador = {
            obterVariavel: jest.fn(() => 'valor-nao-deveria-retornar'),
        };

        const resposta = tempoExecucao.obterVariavel(chaveReservada);

        expect(resposta).toBeUndefined();
        expect(tempoExecucao.interpretador.obterVariavel).not.toHaveBeenCalled();
    });

    it('deve delegar busca de variavel quando nao for palavra reservada', () => {
        const tempoExecucao = criarTempoExecucao();
        const obterVariavel = jest.fn(() => 42);
        tempoExecucao.interpretador = { obterVariavel };

        const resposta = tempoExecucao.obterVariavel('variavelQualquer');

        expect(resposta).toBe(42);
        expect(obterVariavel).toHaveBeenCalledWith('variavelQualquer');
    });

    it('deve emitir evento ao pausar execucao', () => {
        jest.useFakeTimers();
        const tempoExecucao = criarTempoExecucao();
        const eventos: string[] = [];
        tempoExecucao.interpretador = { comando: '' };
        tempoExecucao.on('pararEmPasso', () => eventos.push('pararEmPasso'));

        tempoExecucao.pausar();
        jest.runAllTimers();

        expect(tempoExecucao.interpretador.comando).toBe('pausar');
        expect(eventos).toEqual(['pararEmPasso']);
    });

    it('deve executar passo e emitir evento de parada', async () => {
        jest.useFakeTimers();
        const tempoExecucao = criarTempoExecucao();
        const eventos: string[] = [];
        tempoExecucao.interpretador = {
            comando: '',
            pontoDeParadaAtivo: true,
            instrucaoPasso: jest.fn(async () => undefined),
        };
        tempoExecucao.on('pararEmPasso', () => eventos.push('pararEmPasso'));

        tempoExecucao.passo();
        await Promise.resolve();
        jest.runAllTimers();

        expect(tempoExecucao.interpretador.comando).toBe('proximo');
        expect(tempoExecucao.interpretador.pontoDeParadaAtivo).toBe(false);
        expect(eventos).toEqual(['pararEmPasso']);
    });

    it('deve emitir erro em saida quando passo falhar', async () => {
        jest.useFakeTimers();
        const tempoExecucao = criarTempoExecucao();
        const mensagens: string[] = [];
        tempoExecucao.interpretador = {
            comando: '',
            pontoDeParadaAtivo: true,
            instrucaoPasso: jest.fn(async () => {
                throw new Error('falha-passo');
            }),
        };
        tempoExecucao.on('saida', (mensagem: string) => mensagens.push(mensagem));

        tempoExecucao.passo();
        await Promise.resolve();
        await Promise.resolve();
        jest.runAllTimers();

        expect(mensagens.some(mensagem => mensagem.includes('Erro ao executar passo: falha-passo'))).toBe(true);
    });

    it('deve continuar execucao e emitir erro quando continuar falhar', async () => {
        jest.useFakeTimers();
        const tempoExecucao = criarTempoExecucao();
        const mensagens: string[] = [];
        tempoExecucao.interpretador = {
            comando: '',
            pontoDeParadaAtivo: true,
            instrucaoContinuarInterpretacao: jest.fn(async () => {
                throw new Error('falha-continuar');
            }),
        };
        tempoExecucao.on('saida', (mensagem: string) => mensagens.push(mensagem));

        tempoExecucao.continuar();
        await Promise.resolve();
        await Promise.resolve();
        jest.runAllTimers();

        expect(tempoExecucao.interpretador.comando).toBe('continuar');
        expect(tempoExecucao.interpretador.pontoDeParadaAtivo).toBe(false);
        expect(mensagens.some(mensagem => mensagem.includes('Erro ao continuar: falha-continuar'))).toBe(true);
    });

    it('deve emitir eventos de finalizacao e aviso de ponto de parada', () => {
        jest.useFakeTimers();
        const tempoExecucao = criarTempoExecucao();
        const eventos: string[] = [];

        tempoExecucao.on('finalizar', () => eventos.push('finalizar'));
        tempoExecucao.on('pararEmPontoParada', () => eventos.push('pararEmPontoParada'));

        tempoExecucao.finalizacao();
        tempoExecucao.avisoPontoParadaAtivado();
        jest.runAllTimers();

        expect(eventos).toEqual(['finalizar', 'pararEmPontoParada']);
    });
});
