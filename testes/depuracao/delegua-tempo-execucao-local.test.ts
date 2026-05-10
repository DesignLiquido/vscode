import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import * as vscode from 'vscode';

import { cyrb53 } from '@designliquido/delegua';
import { palavrasReservadasDelegua } from '@designliquido/delegua/lexador/palavras-reservadas';
import { DeleguaTempoExecucaoLocal } from '../../fontes/depuracao/local/delegua-tempo-execucao-local';

jest.mock('vscode', () => ({
    window: {
        activeTextEditor: undefined,
    },
}), { virtual: true });

describe('DeleguaTempoExecucaoLocal', () => {
    beforeEach(() => {
        jest.useRealTimers();
    });

    function criarTempoExecucao() {
        const provedorVisao = {
            ativarVisao: jest.fn(),
            limparTerminal: jest.fn(),
            escreverEmSaida: jest.fn(),
            escreverEmSaidaMesmaLinha: jest.fn(),
            promessaLeitura: {
                wait: jest.fn(async () => undefined),
            },
            copiaEntrada: '',
        };

        const diagnosticos = {
            clear: jest.fn(),
            set: jest.fn(),
        };

        return new DeleguaTempoExecucaoLocal(provedorVisao as any, diagnosticos as any) as any;
    }

    it('deve definir pontos de parada com hash de caminho em minusculas', () => {
        const tempoExecucao = criarTempoExecucao();

        tempoExecucao.definirPontosParada([
            { source: { path: 'C:/Projeto/Arquivo.delegua' }, line: 10 },
            { source: { path: 'C:/Projeto/Outro.delegua' }, line: 20 },
        ] as any);

        expect(tempoExecucao._pontosParada).toEqual([
            {
                hashArquivo: cyrb53('c:/projeto/arquivo.delegua'),
                linha: 10,
            },
            {
                hashArquivo: cyrb53('c:/projeto/outro.delegua'),
                linha: 20,
            },
        ]);
    });

    it('deve reiniciar pontos de parada', () => {
        const tempoExecucao = criarTempoExecucao();
        tempoExecucao._pontosParada = [{ hashArquivo: 1, linha: 1 }];

        tempoExecucao.reiniciarPontosParada();

        expect(tempoExecucao._pontosParada).toEqual([]);
    });

    it('deve ignorar busca de variavel quando nome for palavra reservada', () => {
        const tempoExecucao = criarTempoExecucao();
        const chaveReservada = Object.keys(palavrasReservadasDelegua)[0];
        tempoExecucao.interpretador = {
            obterVariavel: jest.fn(() => 'valor-nao-esperado'),
        };

        const resposta = tempoExecucao.obterVariavel(chaveReservada);

        expect(resposta).toBeUndefined();
        expect(tempoExecucao.interpretador.obterVariavel).not.toHaveBeenCalled();
    });

    it('deve delegar busca de variavel para o interpretador', () => {
        const tempoExecucao = criarTempoExecucao();
        const obterVariavel = jest.fn(() => 99);
        tempoExecucao.interpretador = { obterVariavel };

        const resposta = tempoExecucao.obterVariavel('minhaVariavel');

        expect(resposta).toBe(99);
        expect(obterVariavel).toHaveBeenCalledWith('minhaVariavel');
    });

    it('deve pausar e emitir evento pararEmPasso', () => {
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

    it('deve executar passo e emitir evento pararEmPasso', async () => {
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

    it('deve continuar execucao ajustando estado do interpretador', () => {
        const tempoExecucao = criarTempoExecucao();
        const instrucaoContinuarInterpretacao = jest.fn();
        tempoExecucao.interpretador = {
            comando: '',
            pontoDeParadaAtivo: true,
            instrucaoContinuarInterpretacao,
        };

        tempoExecucao.continuar();

        expect(tempoExecucao.interpretador.comando).toBe('continuar');
        expect(tempoExecucao.interpretador.pontoDeParadaAtivo).toBe(false);
        expect(instrucaoContinuarInterpretacao).toHaveBeenCalled();
    });

    it('deve mapear pilha de execucao com declaracao atual e fallback', () => {
        const tempoExecucao = criarTempoExecucao();
        tempoExecucao._arquivoInicial = '/projeto/exemplo.delegua';
        tempoExecucao._conteudoArquivo = ['linha 1', 'linha 2', 'linha 3', 'linha 4'];
        tempoExecucao.interpretador = {
            pilhaEscoposExecucao: {
                pilha: [
                    { declaracoes: [], declaracaoAtual: 0 },
                    {
                        declaracoes: [{ linha: 2 }],
                        declaracaoAtual: 0,
                    },
                    {
                        declaracoes: [{ linha: 3 }, { linha: 4 }],
                        declaracaoAtual: 99,
                    },
                ],
            },
        };

        const pilha = tempoExecucao.pilhaExecucao();

        expect(pilha).toEqual([
            {
                id: 1,
                linha: 4,
                nome: 'linha 4',
                arquivo: '/projeto/exemplo.delegua',
                metodo: '<principal>',
            },
            {
                id: 2,
                linha: 2,
                nome: 'linha 2',
                arquivo: '/projeto/exemplo.delegua',
                metodo: '<principal>',
            },
        ]);
    });

    it('deve delegar adentrarEscopo, sairEscopo e variaveis', () => {
        const tempoExecucao = criarTempoExecucao();
        const adentrarEscopo = jest.fn();
        const instrucaoProximoESair = jest.fn();
        const obterTodasVariaveis = jest.fn(() => [{ nome: 'x', valor: 1 }]);
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
        expect(tempoExecucao.variaveis()).toEqual([{ nome: 'x', valor: 1 }]);
    });

    it('deve emitir eventos de saida, finalizacao e ponto de parada', () => {
        jest.useFakeTimers();
        const tempoExecucao = criarTempoExecucao();
        const eventosSaida: Array<{ mensagem: string; mesmaLinha: boolean }> = [];
        const eventos: string[] = [];

        tempoExecucao.on('saida', (mensagem: string, mesmaLinha = false) => {
            eventosSaida.push({ mensagem, mesmaLinha });
        });
        tempoExecucao.on('finalizar', () => eventos.push('finalizar'));
        tempoExecucao.on('pararEmPontoParada', () => eventos.push('pararEmPontoParada'));

        tempoExecucao.escreverEmSaida('mensagem');
        tempoExecucao.escreverEmSaidaMesmaLinha('mensagem-linha');
        tempoExecucao.finalizacao();
        tempoExecucao.avisoPontoParadaAtivado();
        jest.runAllTimers();

        expect(eventosSaida).toEqual([
            { mensagem: 'mensagem', mesmaLinha: false },
            { mensagem: 'mensagem-linha', mesmaLinha: true },
        ]);
        expect(eventos).toEqual(['finalizar', 'pararEmPontoParada']);
    });

    it('deve falhar ao iniciar sem documento aberto', async () => {
        const tempoExecucao = criarTempoExecucao();

        await expect(tempoExecucao.iniciar(undefined, 'programa.delegua', false)).rejects.toThrow(
            'Por favor, abra um arquivo antes de iniciar uma execução.'
        );
    });

    it('deve iniciar fluxo delegua usando importador por caminho fs', async () => {
        const tempoExecucao = criarTempoExecucao();
        const retornoImportador = {
            conteudoArquivo: ['escreva(1)'],
            retornoLexador: { simbolos: [] },
            hashArquivo: 123,
        };
        const importar = jest.fn(async () => retornoImportador);
        const analisar = jest.fn(async () => ({ erros: [], declaracoes: [{ linha: 1 }] }));
        const prepararParaDepuracao = jest.fn();
        const instrucaoPasso = jest.fn(async () => undefined);

        (tempoExecucao as any).selecionarDialetoPorExtensao = jest.fn(() => {
            tempoExecucao._dialetoSelecionado = 'delegua';
            tempoExecucao.importadorExtensao = {
                importar,
                importarViaFuncaoConteudoDocumento: jest.fn(),
            };
            tempoExecucao.avaliadorSintatico = { analisar };
            tempoExecucao.interpretador = {
                erros: [],
                comando: '',
                pontosParada: [],
                prepararParaDepuracao,
                instrucaoPasso,
                instrucaoContinuarInterpretacao: jest.fn(async () => undefined),
            };
        });

        const documento: any = {
            uri: { path: '/projeto/programa.delegua', fsPath: 'C:/projeto/programa.delegua' },
            getText: jest.fn(() => 'escreva(1)'),
            fileName: 'C:/projeto/programa.delegua',
        };

        await tempoExecucao.iniciar(documento, 'programa.delegua', true);

        expect(importar).toHaveBeenCalledWith('C:/projeto/programa.delegua', -1);
        expect(analisar).toHaveBeenCalledWith(retornoImportador.retornoLexador, 123);
        expect(prepararParaDepuracao).toHaveBeenCalledWith([{ linha: 1 }]);
        expect(instrucaoPasso).toHaveBeenCalled();
        expect(tempoExecucao.interpretador.comando).toBe('proximo');
    });

    it('deve iniciar fluxo nao delegua usando importador por funcao e resolvedor', async () => {
        const tempoExecucao = criarTempoExecucao();
        const retornoImportador = {
            conteudoArquivo: ['inicio'],
            retornoLexador: { simbolos: [] },
            hashArquivo: 987,
        };
        const importarViaFuncaoConteudoDocumento = jest.fn(() => retornoImportador);
        const analisar = jest.fn(async () => ({ erros: [], declaracoes: [{ linha: 7 }] }));
        const resolver = jest.fn(async () => [{ linha: 77 }]);
        const prepararParaDepuracao = jest.fn();
        const instrucaoContinuarInterpretacao = jest.fn(async () => undefined);

        (tempoExecucao as any).selecionarDialetoPorExtensao = jest.fn(() => {
            tempoExecucao._dialetoSelecionado = 'mapler';
            tempoExecucao.importadorExtensao = {
                importar: jest.fn(),
                importarViaFuncaoConteudoDocumento,
            };
            tempoExecucao.avaliadorSintatico = { analisar };
            tempoExecucao.resolvedor = { resolver };
            tempoExecucao.interpretador = {
                erros: [],
                comando: '',
                pontosParada: [],
                prepararParaDepuracao,
                instrucaoPasso: jest.fn(async () => undefined),
                instrucaoContinuarInterpretacao,
            };
        });

        const documento: any = {
            uri: { path: '/projeto/programa.mapler', fsPath: 'C:/projeto/programa.mapler' },
            getText: jest.fn(() => 'inicio'),
            fileName: 'C:/projeto/programa.mapler',
        };

        await tempoExecucao.iniciar(documento, 'programa.mapler', false);

        expect(importarViaFuncaoConteudoDocumento).toHaveBeenCalledWith(documento.getText, documento.fileName);
        expect(analisar).toHaveBeenCalledWith(retornoImportador.retornoLexador, 987);
        expect(resolver).toHaveBeenCalledWith([{ linha: 7 }]);
        expect(prepararParaDepuracao).toHaveBeenCalledWith([{ linha: 77 }]);
        expect(instrucaoContinuarInterpretacao).toHaveBeenCalled();
        expect(tempoExecucao.interpretador.comando).toBe('continuar');
    });

    it('deve registrar diagnosticos e falhar quando houver erros sintaticos', async () => {
        const tempoExecucao = criarTempoExecucao();
        const retornoImportador = {
            conteudoArquivo: ['escreva(1)'],
            retornoLexador: { simbolos: [] },
            hashArquivo: 55,
        };
        const importar = jest.fn(async () => retornoImportador);
        const diagnosticosSet = tempoExecucao.diagnosticos.set as jest.Mock;

        (tempoExecucao as any).selecionarDialetoPorExtensao = jest.fn(() => {
            tempoExecucao._dialetoSelecionado = 'delegua';
            tempoExecucao.importadorExtensao = {
                importar,
                importarViaFuncaoConteudoDocumento: jest.fn(),
            };
            tempoExecucao.avaliadorSintatico = {
                analisar: jest.fn(async () => ({
                    erros: [{}],
                    declaracoes: [],
                })),
            };
            tempoExecucao.interpretador = {
                erros: [],
                comando: '',
                pontosParada: [],
                prepararParaDepuracao: jest.fn(),
                instrucaoPasso: jest.fn(async () => undefined),
                instrucaoContinuarInterpretacao: jest.fn(async () => undefined),
            };
        });

        const documentoAtivo: any = {
            uri: { fsPath: 'C:/projeto/ativo.delegua' },
            lineCount: 0,
            lineAt: jest.fn(),
        };
        (vscode as any).window.activeTextEditor = { document: documentoAtivo };

        const documento: any = {
            uri: { path: '/projeto/programa.delegua', fsPath: 'C:/projeto/programa.delegua' },
            getText: jest.fn(() => 'escreva(1)'),
            fileName: 'C:/projeto/programa.delegua',
        };

        await expect(tempoExecucao.iniciar(documento, 'programa.delegua', false)).rejects.toThrow(
            'Há erros de avaliação sintática no código.'
        );
        expect(diagnosticosSet).toHaveBeenCalled();
    });
});
