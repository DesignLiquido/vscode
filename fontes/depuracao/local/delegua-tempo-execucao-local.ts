import * as vscode from 'vscode';

import { EventEmitter } from 'events';
import { DebugProtocol } from '@vscode/debugprotocol';

import { cyrb53, PontoParada } from '@designliquido/delegua';

import { AvaliadorSintaticoInterface, InterpretadorComDepuracaoInterface, LexadorInterface, SimboloInterface } from '@designliquido/delegua/interfaces';

import { Importador, RetornoImportador } from '@designliquido/delegua-node/importador';
import { InterpretadorComDepuracaoImportacao } from '@designliquido/delegua-node/interpretador/interpretador-com-depuracao-importacao';
import { ImportadorInterface } from '@designliquido/delegua-node/interfaces';
import { AvaliadorSintaticoComImportacao } from '@designliquido/delegua-node/avaliador-sintatico';

import { LexadorPitugues } from '@designliquido/delegua/lexador/dialetos/lexador-pitugues';
import { AvaliadorSintaticoPitugues } from '@designliquido/delegua/avaliador-sintatico/dialetos/avaliador-sintatico-pitugues';

import { palavrasReservadas } from '@designliquido/delegua/lexador/palavras-reservadas';

import { Declaracao } from '@designliquido/delegua/declaracoes';
import { Lexador } from '@designliquido/delegua/lexador';

import { LexadorBirl } from '@designliquido/birl/lexador';
import { AvaliadorSintaticoBirl } from '@designliquido/birl/avaliador-sintatico';
import { InterpretadorBirlComDepuracao } from '@designliquido/birl/interpretador';

import { LexadorMapler } from '@designliquido/mapler/lexador';
import { AvaliadorSintaticoMapler } from '@designliquido/mapler/avaliador-sintatico';
import { ResolvedorMapler } from '@designliquido/mapler/resolvedor';
import { InterpretadorMaplerComDepuracao } from '@designliquido/mapler/interpretador';

import { LexadorPortugolStudio } from '@designliquido/portugol-studio/lexador';
import { AvaliadorSintaticoPortugolStudio } from '@designliquido/portugol-studio/avaliador-sintatico';
import { InterpretadorPortugolStudioComDepuracao } from '@designliquido/portugol-studio/interpretador';

import { LexadorPotigol } from '@designliquido/potigol/lexador';
import { AvaliadorSintaticoPotigol } from '@designliquido/potigol/avaliador-sintatico';
import { InterpretadorPotigolComDepuracao } from '@designliquido/potigol/interpretador';

import { LexadorVisuAlg, AvaliadorSintaticoVisuAlg } from '@designliquido/visualg';
import { InterpretadorVisuAlgComDepuracao } from '@designliquido/visualg/interpretador';

import { ElementoPilhaVsCode } from '../elemento-pilha';
import { ProvedorVisaoEntradaSaida } from '../../visoes';
import { ImportadorExtensao } from '../../importador';
import { formatarDiagnosticosAvaliacaoSintatica } from 'fontes/avaliacao-sintatica';

/**
 * Em teoria não precisaria uma classe de tempo de execução local, mas,
 * aparentemente, a sessão de depuração precisa trabalhar com um EventEmitter
 * para funcionar corretamente.
 * 
 * Classe responsável por se comunicar com a linguagem Delégua, traduzindo 
 * as requisições do Visual Studio Code para o núcleo da linguagem, e também 
 * recebendo instruções da linguagem e emitindo os eventos correspondentes.
 */
export class DeleguaTempoExecucaoLocal extends EventEmitter {
    private lexador: LexadorInterface<SimboloInterface>;
    private avaliadorSintatico: AvaliadorSintaticoInterface<SimboloInterface, Declaracao>;
    private importador: ImportadorInterface<SimboloInterface>;
    private importadorExtensao: ImportadorExtensao;
    private interpretador: InterpretadorComDepuracaoInterface;
    private resolvedor: { resolver(declaracoes: Declaracao[]): Promise<Declaracao[]> };

    private _documento: vscode.TextDocument;
    private _dialetoSelecionado: 'delegua' | 'pitugues' | 'birl' | 'mapler' | 'portugol-studio' | 'potigol' | 'visualg';
    private _arquivoInicial: string = '';
    private _conteudoArquivo: string[];
    private _hashArquivoInicial = -1;
    private _pontosParada: PontoParada[] = [];
    
    constructor(
        private readonly provedorVisaoEntradaSaida: ProvedorVisaoEntradaSaida,
        private readonly diagnosticos: vscode.DiagnosticCollection
    ) {
        super();
    }

    /**
     * Efetivamente envia o evento para o objeto de sessão de depuração.
     * @param evento O nome do evento, conforme lista de eventos no construtor da sessão de depuração.
     * @param argumentos Vetor de argumentos adicionais.
     */
    private enviarEvento(evento: string, ...argumentos: any[]) {
        // `setImmediate` libera o _event loop_, permitindo ao VSCode atualizar
        // todos os componentes da tela.
        setImmediate((_) => {
            this.emit(evento, ...argumentos);
        });
    }

    private limparTela() {
        this.enviarEvento('limparTela');
    }

    private selecionarDialetoPorExtensao(extensao: string) {
        switch (extensao.toLowerCase()) {
            case "alg":
                this._dialetoSelecionado = 'visualg';
                this.lexador = new LexadorVisuAlg();
                this.avaliadorSintatico = new AvaliadorSintaticoVisuAlg();
                this.importadorExtensao = new ImportadorExtensao(this.lexador);

                this.interpretador = new InterpretadorVisuAlgComDepuracao(
                    process.cwd(), 
                    this.escreverEmSaida.bind(this), 
                    this.escreverEmSaidaMesmaLinha.bind(this),
                    this.limparTela.bind(this)
                );
                break;
            case "birl":
                this._dialetoSelecionado = 'birl';
                this.lexador = new LexadorBirl();
                this.avaliadorSintatico = new AvaliadorSintaticoBirl();
                this.importadorExtensao = new ImportadorExtensao(this.lexador);

                this.interpretador = new InterpretadorBirlComDepuracao(
                    process.cwd(), 
                    this.escreverEmSaida.bind(this), 
                    this.escreverEmSaidaMesmaLinha.bind(this)
                );
                break;
            case "pitu":
            case "pitugues":
                this._dialetoSelecionado = 'pitugues';
                this.lexador = new LexadorPitugues();
                this.avaliadorSintatico = new AvaliadorSintaticoPitugues();
                this.importador = new Importador(
                    this.lexador,
                    {},
                    {},
                    true);
                this.interpretador = new InterpretadorComDepuracaoImportacao(
                    this.importador as any, 
                    process.cwd(), 
                    this.escreverEmSaida.bind(this), 
                    this.escreverEmSaidaMesmaLinha.bind(this)
                );
                break;
            case "mapler":
                this._dialetoSelecionado = 'mapler';
                this.lexador = new LexadorMapler();
                this.avaliadorSintatico = new AvaliadorSintaticoMapler();
                this.importadorExtensao = new ImportadorExtensao(this.lexador);
                this.resolvedor = new ResolvedorMapler();

                this.interpretador = new InterpretadorMaplerComDepuracao(
                    process.cwd(), 
                    this.escreverEmSaida.bind(this)
                );
                break;
            case "por":
                this._dialetoSelecionado = 'portugol-studio';
                this.lexador = new LexadorPortugolStudio();
                this.avaliadorSintatico = new AvaliadorSintaticoPortugolStudio();
                this.importadorExtensao = new ImportadorExtensao(this.lexador);

                this.interpretador = new InterpretadorPortugolStudioComDepuracao(
                    process.cwd(), 
                    this.escreverEmSaida.bind(this), 
                    this.escreverEmSaidaMesmaLinha.bind(this), 
                    this.limparTela.bind(this)
                );
                break;
            case "poti":
            case "potigol":
                this._dialetoSelecionado = 'potigol';
                this.lexador = new LexadorPotigol();
                this.avaliadorSintatico = new AvaliadorSintaticoPotigol();
                this.importadorExtensao = new ImportadorExtensao(this.lexador);
                
                this.interpretador = new InterpretadorPotigolComDepuracao(
                    process.cwd(), 
                    this.escreverEmSaida.bind(this), 
                    this.escreverEmSaidaMesmaLinha.bind(this)
                );
                break;
            default:
                this._dialetoSelecionado = 'delegua';
                this.lexador = new Lexador();
                this.importador = new Importador(
                    this.lexador, 
                    {},
                    {},
                    true);
                this.avaliadorSintatico = new AvaliadorSintaticoComImportacao(this.importador);
                this.interpretador = new InterpretadorComDepuracaoImportacao(
                    this.importador as any, 
                    process.cwd(), 
                    this.escreverEmSaida.bind(this), 
                    this.escreverEmSaidaMesmaLinha.bind(this)
                );
                break;
        }
    }

    /**
     * 
     * @param arquivoInicial 
     * @param pararNaEntrada 
     */
    async iniciar(
        documento: vscode.TextDocument | undefined,
        arquivoInicial: string, 
        pararNaEntrada: boolean
    ) {
        this.diagnosticos.clear();
        if (!documento) {
            throw new Error('Por favor, abra um arquivo antes de iniciar uma execução.');
        }

        this.provedorVisaoEntradaSaida.ativarVisao();
        this._documento = documento;
        const partesNomeArquivo = arquivoInicial.split('.');
        const partesDiretorio = documento.uri.path.split('/').slice(0, -1);
        let diretorioBase = partesDiretorio.reduce((anterior, parte) => anterior + `/${parte}`);
        if (diretorioBase.length > 1) {
            diretorioBase = diretorioBase.slice(1);
        }
        this.selecionarDialetoPorExtensao(partesNomeArquivo.pop() || '.delegua');

        // Inicialização do interpretador pós escolha de dialeto.
        this.interpretador.diretorioBase = diretorioBase;
        this.interpretador.pontosParada = this._pontosParada;
        this.interpretador.finalizacaoDaExecucao = this.finalizacao.bind(this);
        this.interpretador.avisoPontoParadaAtivado = this.avisoPontoParadaAtivado.bind(this);
        
        this._arquivoInicial = arquivoInicial;
        let retornoImportador: RetornoImportador<SimboloInterface>;

        if (['delegua', 'pitugues'].includes(this._dialetoSelecionado)) {
            retornoImportador = this.importador.importar(arquivoInicial, -1);
            this._hashArquivoInicial = retornoImportador.hashArquivo;
            this._conteudoArquivo = this.importador.conteudoArquivosAbertos[this._hashArquivoInicial];
        } else {
            retornoImportador = this.importadorExtensao.importarViaFuncaoConteudoDocumento(
                this._documento.getText, 
                this._documento.fileName
            );
            this._hashArquivoInicial = retornoImportador.hashArquivo;
            this._conteudoArquivo = retornoImportador.conteudoArquivo;
        }

        const retornoAvaliadorSintatico = this.avaliadorSintatico.analisar(retornoImportador.retornoLexador, retornoImportador.hashArquivo);
        if (retornoAvaliadorSintatico.erros.length > 0) {
            const documentoAtivo = vscode.window.activeTextEditor?.document as vscode.TextDocument;
            this.diagnosticos.set(
                documentoAtivo?.uri as vscode.Uri, 
                formatarDiagnosticosAvaliacaoSintatica(retornoAvaliadorSintatico.erros, documentoAtivo)
            );

            throw new Error("Há erros de avaliação sintática no código. Favor verificar o painel de problemas para uma descrição detalhada dos erros.");
        }

        let declaracoes = retornoAvaliadorSintatico.declaracoes;
        if (this.resolvedor) {
            declaracoes = await this.resolvedor.resolver(declaracoes);
        }

        this.interpretador.prepararParaDepuracao(
            declaracoes
        );

        this.provedorVisaoEntradaSaida.limparTerminal();
        this.interpretador.interfaceEntradaSaida = {
            // TODO: Isso só está aqui ainda para servir como referência para
            // funcionalidades futuras da extensão.
            /* question: async (mensagem: string, callback: Function) => {
                return new Promise<any>((resolve, reject) => {
                    vscode.window.showInputBox({
                        prompt: mensagem,
                        title: mensagem
                    }).then((resposta: any) => {
                        callback(resposta);
                        resolve(0);
                    });
                });
            } */
            question: async (mensagem: string, callback: Function) => {
                return new Promise<any>((resolve) => {
                    // `setImmediate` libera o _event loop_, permitindo ao VSCode atualizar
                    // todos os componentes da tela.
                    setImmediate((_) => {
                        this.provedorVisaoEntradaSaida.escreverEmSaidaMesmaLinha(mensagem);
                        this.provedorVisaoEntradaSaida.promessaLeitura.wait().then(_ => {
                            const copiaResultadoLeia = this.provedorVisaoEntradaSaida.copiaEntrada;
                            this.provedorVisaoEntradaSaida.copiaEntrada = "";
                            callback(copiaResultadoLeia);
                            resolve(0);
                        });
                    });
                });
            }
        };

        if (pararNaEntrada) {
            // Executar apenas um passo na entrada.
            this.interpretador.comando = 'proximo';
            this.interpretador.instrucaoPasso().then(_ => {
                // Pós-execução
                for (let erro of this.interpretador.erros) {
                    this.enviarEvento('saida', erro);
                }
            });
        } else {
            // Executamos até encontrar ou um ponto de parada, ou uma exceção.
            this.interpretador.comando = 'continuar';
            this.interpretador.instrucaoContinuarInterpretacao().then(_ => {
                // Pós-execução
                for (let erro of this.interpretador.erros) {
                    this.enviarEvento('saida', erro);
                }
            });
        }
    }

    adentrarEscopo() {
        this.interpretador.adentrarEscopo();
    }

    continuar() {
        this.interpretador.comando = 'continuar';
        this.interpretador.pontoDeParadaAtivo = false;
        this.interpretador.instrucaoContinuarInterpretacao();
    }

    /**
     * Definição dos pontos de parada. 
     * Ocorre antes de `iniciar()`, quando o interpretador ainda não
     * foi instanciado. Por isso usamos `this._pontosParada`.
     * @param pontosParada Os pontos de parada vindos da extensão.
     */
    definirPontosParada(pontosParada: DebugProtocol.Breakpoint[]) {
        for (let pontoParada of pontosParada) {
            this._pontosParada.push({
                hashArquivo: cyrb53(pontoParada.source?.path?.toLowerCase() || ''),
                linha: Number(pontoParada.line),
            });
        }
    }

    reiniciarPontosParada() {
        this._pontosParada = [];
    }

    escreverEmSaida(mensagem: string) {
        this.enviarEvento('saida', mensagem);
    }

    escreverEmSaidaMesmaLinha(mensagem: string) {
        this.enviarEvento('saida', mensagem, true);
    }

    obterVariavel(nome: string) {
        if (Object.keys(palavrasReservadas).includes(nome)) {
            return undefined;
        }

        return this.interpretador.obterVariavel(nome);
    }

    passo() {
        this.interpretador.comando = 'proximo';
        this.interpretador.pontoDeParadaAtivo = false;
        this.interpretador.instrucaoPasso().then(() => {
            this.enviarEvento('pararEmPasso');
        });
    }

    // TODO: Recolocar quando comando 'pausar' estiver devidamente implementado em Delégua.
    /* pausar() {
        this.interpretador.comando = 'pausar';
        this.enviarEvento('pararEmPasso');
    } */

    pilhaExecucao(): ElementoPilhaVsCode[] {
        // O primeiro elemento da pilha é apenas onde fica o ambiente global.
        // Por isso é descartado.
        const pilha = this.interpretador.pilhaEscoposExecucao.pilha.slice(1);
        const pilhaRetorno: ElementoPilhaVsCode[] = [];

        let id: number = 0;
        for (let i = pilha.length - 1; i >= 0; i--) {
            const pilhaElemento = pilha[i];
            const declaracaoAtual = pilhaElemento.declaracoes[pilhaElemento.declaracaoAtual];
            if (declaracaoAtual) {
                pilhaRetorno.push({
                    id: ++id,
                    linha: declaracaoAtual.linha,
                    nome: this._conteudoArquivo[declaracaoAtual.linha - 1].trim(),
                    arquivo: this._arquivoInicial,
                    metodo: '<principal>'
                });
            } else {
                const ultimaDeclaracaoEscopo = pilhaElemento.declaracoes[pilhaElemento.declaracoes.length - 1];
                pilhaRetorno.push({
                    id: ++id,
                    linha: ultimaDeclaracaoEscopo.linha,
                    nome: this._conteudoArquivo[ultimaDeclaracaoEscopo.linha - 1].trim(),
                    arquivo: this._arquivoInicial,
                    metodo: '<principal>'
                });
            }
        }

        return pilhaRetorno;
    }

    sairEscopo() {
        this.interpretador.instrucaoProximoESair();
    }

    variaveis() {
        return this.interpretador.pilhaEscoposExecucao.obterTodasVariaveis([]);
    }

    /**
     * Usado pelo depurador para dizer que a execução finalizou.
     */
    finalizacao() {
        this.enviarEvento('finalizar');
    }

    avisoPontoParadaAtivado() {
        this.enviarEvento('pararEmPontoParada');
    }
}