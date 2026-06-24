import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { palavrasReservadasDelegua } from '@designliquido/delegua/lexador/palavras-reservadas';

const mockVscode = {
    workspace: {
        workspaceFolders: undefined as any,
    },
    window: {
        activeTextEditor: undefined as any,
    },
};

jest.mock('vscode', () => mockVscode, { virtual: true });

import { DeleguaTempoExecucaoWeb } from '../../fontes/depuracao/web/delegua-tempo-execucao-web';

describe('DeleguaTempoExecucaoWeb', () => {
    beforeEach(() => {
        mockVscode.workspace.workspaceFolders = undefined;
        mockVscode.window.activeTextEditor = undefined;
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

    it('deve falhar ao iniciar sem documento aberto', async () => {
        const tempoExecucao = criarTempoExecucao();
        await expect(tempoExecucao.iniciar(undefined, 'programa.delegua', false)).rejects.toThrow(
            'Por favor, abra um arquivo antes de iniciar uma execução.'
        );
    });

    it('deve emitir evento saida ao escrever e saida na mesma linha ao escrever', () => {
        jest.useFakeTimers();
        const tempoExecucao = criarTempoExecucao();
        const eventosRecebidos: any[][] = [];
        tempoExecucao.on('saida', (...args: any[]) => eventosRecebidos.push(args));

        tempoExecucao.escreverEmSaida('mensagem-normal');
        tempoExecucao.escreverEmSaidaMesmaLinha('mensagem-linha');
        jest.runAllTimers();

        expect(eventosRecebidos[0]).toEqual(['mensagem-normal']);
        expect(eventosRecebidos[1]).toEqual(['mensagem-linha', true]);
    });

    it('deve iniciar com pararNaEntrada verdadeiro e executar instrucaoPasso', async () => {
        const tempoExecucao = criarTempoExecucao();
        const retornoImportador = {
            conteudoArquivo: [],
            retornoLexador: { simbolos: [] },
            hashArquivo: 42,
        };
        const instrucaoPasso = jest.fn(async () => undefined);
        const prepararParaDepuracao = jest.fn();

        (tempoExecucao as any).selecionarDialetoPorExtensao = jest.fn(() => {
            (tempoExecucao as any).importadorExtensao = {
                importarViaFuncaoConteudoDocumento: jest.fn(() => retornoImportador),
            };
            (tempoExecucao as any).avaliadorSintatico = {
                analisar: jest.fn(async () => ({ erros: [], declaracoes: [{ linha: 1 }] })),
            };
            tempoExecucao.interpretador = {
                erros: [],
                comando: '',
                pontosParada: [],
                diretorioBase: '',
                prepararParaDepuracao,
                instrucaoPasso,
                instrucaoContinuarInterpretacao: jest.fn(async () => undefined),
            } as any;
        });

        const documento: any = {
            uri: { path: '/projeto/programa.delegua' },
            getText: jest.fn(() => ''),
            fileName: 'C:/projeto/programa.delegua',
        };

        await tempoExecucao.iniciar(documento, 'programa.delegua', true);
        await Promise.resolve();

        expect(instrucaoPasso).toHaveBeenCalled();
        expect(tempoExecucao.interpretador.comando).toBe('proximo');
        expect(prepararParaDepuracao).toHaveBeenCalledWith([{ linha: 1 }]);
    });

    it('deve iniciar com pararNaEntrada falso e executar instrucaoContinuarInterpretacao', async () => {
        const tempoExecucao = criarTempoExecucao();
        const retornoImportador = {
            conteudoArquivo: [],
            retornoLexador: { simbolos: [] },
            hashArquivo: 99,
        };
        const instrucaoContinuarInterpretacao = jest.fn(async () => undefined);
        const prepararParaDepuracao = jest.fn();

        (tempoExecucao as any).selecionarDialetoPorExtensao = jest.fn(() => {
            (tempoExecucao as any).importadorExtensao = {
                importarViaFuncaoConteudoDocumento: jest.fn(() => retornoImportador),
            };
            (tempoExecucao as any).avaliadorSintatico = {
                analisar: jest.fn(async () => ({ erros: [], declaracoes: [{ linha: 5 }] })),
            };
            tempoExecucao.interpretador = {
                erros: [],
                comando: '',
                pontosParada: [],
                diretorioBase: '',
                prepararParaDepuracao,
                instrucaoPasso: jest.fn(async () => undefined),
                instrucaoContinuarInterpretacao,
            } as any;
        });

        const documento: any = {
            uri: { path: '/projeto/programa.delegua' },
            getText: jest.fn(() => ''),
            fileName: 'C:/projeto/programa.delegua',
        };

        await tempoExecucao.iniciar(documento, 'programa.delegua', false);
        await Promise.resolve();

        expect(instrucaoContinuarInterpretacao).toHaveBeenCalled();
        expect(tempoExecucao.interpretador.comando).toBe('continuar');
        expect(prepararParaDepuracao).toHaveBeenCalledWith([{ linha: 5 }]);
    });

    it('deve registrar diagnosticos e lancar erro com erros sintaticos ao iniciar', async () => {
        mockVscode.window.activeTextEditor = {
            document: {
                uri: { fsPath: 'C:/projeto/ativo.delegua' },
                lineCount: 0,
                lineAt: jest.fn(),
            },
        };
        const tempoExecucao = criarTempoExecucao();
        const retornoImportador = {
            conteudoArquivo: [],
            retornoLexador: { simbolos: [] },
            hashArquivo: 55,
        };

        (tempoExecucao as any).selecionarDialetoPorExtensao = jest.fn(() => {
            (tempoExecucao as any).importadorExtensao = {
                importarViaFuncaoConteudoDocumento: jest.fn(() => retornoImportador),
            };
            (tempoExecucao as any).avaliadorSintatico = {
                analisar: jest.fn(async () => ({ erros: [{}], declaracoes: [] })),
            };
            tempoExecucao.interpretador = { erros: [], comando: '', pontosParada: [] } as any;
        });

        const documento: any = {
            uri: { path: '/projeto/programa.delegua' },
            getText: jest.fn(() => 'codigo invalido'),
            fileName: 'C:/projeto/programa.delegua',
        };

        await expect(tempoExecucao.iniciar(documento, 'programa.delegua', false)).rejects.toThrow(
            'Há erros de avaliação sintática no código.'
        );
        expect(tempoExecucao.diagnosticos.set).toHaveBeenCalled();
    });

    it('deve usar resolvedor quando disponivel ao iniciar', async () => {
        const tempoExecucao = criarTempoExecucao();
        const retornoImportador = {
            conteudoArquivo: [],
            retornoLexador: { simbolos: [] },
            hashArquivo: 77,
        };
        const resolver = jest.fn(async () => [{ linha: 10 }]);
        const prepararParaDepuracao = jest.fn();

        (tempoExecucao as any).selecionarDialetoPorExtensao = jest.fn(() => {
            (tempoExecucao as any).importadorExtensao = {
                importarViaFuncaoConteudoDocumento: jest.fn(() => retornoImportador),
            };
            (tempoExecucao as any).avaliadorSintatico = {
                analisar: jest.fn(async () => ({ erros: [], declaracoes: [{ linha: 1 }] })),
            };
            (tempoExecucao as any).resolvedor = { resolver };
            tempoExecucao.interpretador = {
                erros: [],
                comando: '',
                pontosParada: [],
                diretorioBase: '',
                prepararParaDepuracao,
                instrucaoPasso: jest.fn(async () => undefined),
                instrucaoContinuarInterpretacao: jest.fn(async () => undefined),
            } as any;
        });

        const documento: any = {
            uri: { path: '/projeto/programa.mapler' },
            getText: jest.fn(() => ''),
            fileName: 'C:/projeto/programa.mapler',
        };

        await tempoExecucao.iniciar(documento, 'programa.mapler', false);

        expect(resolver).toHaveBeenCalledWith([{ linha: 1 }]);
        expect(prepararParaDepuracao).toHaveBeenCalledWith([{ linha: 10 }]);
    });

    it('deve remover barra inicial do diretorio base durante inicializacao', async () => {
        const tempoExecucao = criarTempoExecucao();
        const retornoImportador = { conteudoArquivo: [], retornoLexador: { simbolos: [] }, hashArquivo: 1 };

        (tempoExecucao as any).selecionarDialetoPorExtensao = jest.fn(() => {
            (tempoExecucao as any).importadorExtensao = {
                importarViaFuncaoConteudoDocumento: jest.fn(() => retornoImportador),
            };
            (tempoExecucao as any).avaliadorSintatico = {
                analisar: jest.fn(async () => ({ erros: [], declaracoes: [] })),
            };
            tempoExecucao.interpretador = {
                erros: [],
                comando: '',
                pontosParada: [],
                diretorioBase: '',
                prepararParaDepuracao: jest.fn(),
                instrucaoPasso: jest.fn(async () => undefined),
                instrucaoContinuarInterpretacao: jest.fn(async () => undefined),
            } as any;
        });

        const documento: any = {
            uri: { path: '/projeto/programa.delegua' },
            getText: jest.fn(() => ''),
            fileName: 'C:/projeto/programa.delegua',
        };

        await tempoExecucao.iniciar(documento, 'programa.delegua', false);

        expect(tempoExecucao.interpretador.diretorioBase).toBe('projeto');
    });

    it('deve usar ultima declaracao como fallback na pilha de execucao', () => {
        const tempoExecucao = criarTempoExecucao();
        tempoExecucao._arquivoInicial = '/projeto/exemplo.delegua';
        tempoExecucao._conteudoArquivo = ['linha 1', 'linha 2', 'linha 3'];
        tempoExecucao.interpretador = {
            pilhaEscoposExecucao: {
                pilha: [
                    { declaracoes: [], declaracaoAtual: 0 },
                    {
                        declaracoes: [{ linha: 2 }, { linha: 3 }],
                        declaracaoAtual: 99,
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
                arquivo: '/projeto/exemplo.delegua',
                metodo: '<principal>',
            },
        ]);
    });

    it('deve continuar execucao com sucesso atualizando estado do interpretador', () => {
        const tempoExecucao = criarTempoExecucao();
        const instrucaoContinuarInterpretacao = jest.fn(() => Promise.resolve());
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

    it('deve propagar erros do interpretador como evento saida apos instrucao passo', async () => {
        jest.useFakeTimers();
        const tempoExecucao = criarTempoExecucao();
        const retornoImportador = { conteudoArquivo: [], retornoLexador: { simbolos: [] }, hashArquivo: 1 };
        const eventosRecebidos: any[][] = [];
        tempoExecucao.on('saida', (...args: any[]) => eventosRecebidos.push(args));

        (tempoExecucao as any).selecionarDialetoPorExtensao = jest.fn(() => {
            (tempoExecucao as any).importadorExtensao = {
                importarViaFuncaoConteudoDocumento: jest.fn(() => retornoImportador),
            };
            (tempoExecucao as any).avaliadorSintatico = {
                analisar: jest.fn(async () => ({ erros: [], declaracoes: [] })),
            };
            tempoExecucao.interpretador = {
                erros: [{ simbolo: { linha: 3 }, mensagem: 'erro-teste' }],
                comando: '',
                pontosParada: [],
                diretorioBase: '',
                prepararParaDepuracao: jest.fn(),
                instrucaoPasso: jest.fn(async () => undefined),
                instrucaoContinuarInterpretacao: jest.fn(async () => undefined),
            } as any;
        });

        const documento: any = {
            uri: { path: '/projeto/programa.delegua' },
            getText: jest.fn(() => ''),
            fileName: 'C:/projeto/programa.delegua',
        };

        await tempoExecucao.iniciar(documento, 'programa.delegua', true);
        await Promise.resolve();
        await Promise.resolve();
        jest.runAllTimers();

        expect(eventosRecebidos[0]).toEqual([
            { simbolo: { linha: 3 }, mensagem: 'erro-teste' },
            false,
            'programa.delegua',
            3,
        ]);
    });

    it('deve propagar erros do interpretador como evento saida apos continuar', async () => {
        jest.useFakeTimers();
        const tempoExecucao = criarTempoExecucao();
        const retornoImportador = { conteudoArquivo: [], retornoLexador: { simbolos: [] }, hashArquivo: 2 };
        const eventosRecebidos: any[][] = [];
        tempoExecucao.on('saida', (...args: any[]) => eventosRecebidos.push(args));

        (tempoExecucao as any).selecionarDialetoPorExtensao = jest.fn(() => {
            (tempoExecucao as any).importadorExtensao = {
                importarViaFuncaoConteudoDocumento: jest.fn(() => retornoImportador),
            };
            (tempoExecucao as any).avaliadorSintatico = {
                analisar: jest.fn(async () => ({ erros: [], declaracoes: [] })),
            };
            tempoExecucao.interpretador = {
                erros: [{ simbolo: null, mensagem: 'erro-continuar' }],
                comando: '',
                pontosParada: [],
                diretorioBase: '',
                prepararParaDepuracao: jest.fn(),
                instrucaoPasso: jest.fn(async () => undefined),
                instrucaoContinuarInterpretacao: jest.fn(async () => undefined),
            } as any;
        });

        const documento: any = {
            uri: { path: '/projeto/programa.delegua' },
            getText: jest.fn(() => ''),
            fileName: 'C:/projeto/programa.delegua',
        };

        await tempoExecucao.iniciar(documento, 'programa.delegua', false);
        await Promise.resolve();
        await Promise.resolve();
        jest.runAllTimers();

        expect(eventosRecebidos[0]).toEqual([
            { simbolo: null, mensagem: 'erro-continuar' },
            false,
            'programa.delegua',
            0,
        ]);
    });

    it('deve ignorar adentrarEscopo e sairEscopo sem interpretador', () => {
        const tempoExecucao = criarTempoExecucao();
        expect(() => tempoExecucao.adentrarEscopo()).not.toThrow();
        expect(() => tempoExecucao.sairEscopo()).not.toThrow();
    });

    it('deve ignorar passo sem interpretador', () => {
        const tempoExecucao = criarTempoExecucao();
        expect(() => tempoExecucao.passo()).not.toThrow();
    });

    it('deve ignorar continuar sem interpretador', () => {
        const tempoExecucao = criarTempoExecucao();
        expect(() => tempoExecucao.continuar()).not.toThrow();
    });

    it('deve ignorar pausar sem interpretador', () => {
        const tempoExecucao = criarTempoExecucao();
        expect(() => tempoExecucao.pausar()).not.toThrow();
    });

    it('deve extrair localizacao de erro com simbolo contendo linha', () => {
        const tempoExecucao = criarTempoExecucao();
        (tempoExecucao as any)._arquivoInicial = '/projeto/arquivo.delegua';

        const resultado = (tempoExecucao as any).extrairLocalizacaoErro({ simbolo: { linha: 5 } });

        expect(resultado.caminhoArquivo).toBe('/projeto/arquivo.delegua');
        expect(resultado.linha).toBe(5);
    });

    it('deve extrair localizacao de erro sem simbolo retornando linha zero', () => {
        const tempoExecucao = criarTempoExecucao();
        (tempoExecucao as any)._arquivoInicial = '/projeto/arquivo.delegua';

        const resultado = (tempoExecucao as any).extrairLocalizacaoErro({});

        expect(resultado.caminhoArquivo).toBe('/projeto/arquivo.delegua');
        expect(resultado.linha).toBe(0);
    });
});
