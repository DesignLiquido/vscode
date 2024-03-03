import * as vscode from 'vscode';

import { EventEmitter } from 'events';
import { DebugProtocol } from '@vscode/debugprotocol';

import { cyrb53, PontoParada } from '@designliquido/delegua';

import { ElementoPilhaVsCode } from '../elemento-pilha';
import { AvaliadorSintaticoInterface, InterpretadorComDepuracaoInterface, LexadorInterface, SimboloInterface } from '@designliquido/delegua/interfaces';
import { LexadorPortugolStudio } from '@designliquido/delegua/lexador/dialetos/lexador-portugol-studio';

import { AvaliadorSintaticoPortugolStudio } from '@designliquido/delegua/avaliador-sintatico/dialetos/avaliador-sintatico-portugol-studio';
import { LexadorPitugues } from '@designliquido/delegua/lexador/dialetos/lexador-pitugues';
import { AvaliadorSintaticoPitugues } from '@designliquido/delegua/avaliador-sintatico/dialetos/avaliador-sintatico-pitugues';
import { AvaliadorSintaticoMapler } from '@designliquido/delegua/avaliador-sintatico/dialetos/avaliador-sintatico-mapler';
import { Importador } from '@designliquido/delegua-node/importador';
import { ImportadorInterface } from '@designliquido/delegua-node/interfaces';
import { InterpretadorComDepuracaoImportacao } from '@designliquido/delegua-node/interpretador/interpretador-com-depuracao-importacao';

import { palavrasReservadas } from '@designliquido/delegua/lexador/palavras-reservadas';
import { InterpretadorPortugolStudioComDepuracao } from '@designliquido/delegua/interpretador/dialetos';
import { LexadorBirl, LexadorMapler } from '@designliquido/delegua/lexador/dialetos';
import { AvaliadorSintaticoBirl } from '@designliquido/delegua/avaliador-sintatico/dialetos';
import { Declaracao } from '@designliquido/delegua/declaracoes';
import { Lexador } from '@designliquido/delegua/lexador';
import { AvaliadorSintatico } from '@designliquido/delegua/avaliador-sintatico';

import { LexadorPotigol } from '@designliquido/potigol/lexador';
import { AvaliadorSintaticoPotigol } from '@designliquido/potigol/avaliador-sintatico';
import { InterpretadorPotigolComDepuracao } from '@designliquido/potigol/interpretador';

import { LexadorVisuAlg, AvaliadorSintaticoVisuAlg } from '@designliquido/visualg';
import { InterpretadorVisuAlgComDepuracaoImportacao } from '@designliquido/delegua-node/interpretador/dialetos/interpretador-visualg-com-depuracao-importacao';

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
    private importador: ImportadorInterface<SimboloInterface, Declaracao>;
    private interpretador: InterpretadorComDepuracaoInterface;

    private _arquivoInicial: string = '';
    private _conteudoArquivo: string[];
    private _hashArquivoInicial = -1;
    private _pontosParada: PontoParada[] = [];
    
    constructor() {
        super();
    }

    /**
     * Efetivamente envia o evento para o objeto de sessão de depuração.
     * @param evento O nome do evento, conforme lista de eventos no construtor da sessão de depuração.
     * @param argumentos Vetor de argumentos adicionais.
     */
    private enviarEvento(evento: string, ...argumentos: any[]) {
        setImmediate((_) => {
            this.emit(evento, ...argumentos);
        });
    }

    private selecionarDialetoPorExtensao(extensao: string) {
        switch (extensao.toLowerCase()) {
            case "alg":
                this.lexador = new LexadorVisuAlg();
                this.avaliadorSintatico = new AvaliadorSintaticoVisuAlg();
                this.importador = new Importador(
                    this.lexador, 
                    this.avaliadorSintatico, 
                    {},
                    {},
                    true);
                this.interpretador = new InterpretadorVisuAlgComDepuracaoImportacao(this.importador, process.cwd(), 
                    this.escreverEmSaida.bind(this), this.escreverEmSaidaMesmaLinha.bind(this));
                break;
            case "birl":
                this.lexador = new LexadorBirl();
                this.avaliadorSintatico = new AvaliadorSintaticoBirl();
                this.importador = new Importador(
                    this.lexador, 
                    this.avaliadorSintatico, 
                    {},
                    {},
                    true);
                this.interpretador = new InterpretadorComDepuracaoImportacao(this.importador, process.cwd(), 
                    this.escreverEmSaida.bind(this), this.escreverEmSaidaMesmaLinha.bind(this));
                break;
            case "pitugues":
                this.lexador = new LexadorPitugues();
                this.avaliadorSintatico = new AvaliadorSintaticoPitugues();
                this.importador = new Importador(
                    this.lexador, 
                    this.avaliadorSintatico, 
                    {},
                    {},
                    true);
                this.interpretador = new InterpretadorComDepuracaoImportacao(this.importador, process.cwd(), 
                    this.escreverEmSaida.bind(this), this.escreverEmSaidaMesmaLinha.bind(this));
                break;
            case "mapler":
                this.lexador = new LexadorMapler();
                this.avaliadorSintatico = new AvaliadorSintaticoMapler();
                this.importador = new Importador(
                    this.lexador, 
                    this.avaliadorSintatico, 
                    {},
                    {},
                    true);
                this.interpretador = new InterpretadorComDepuracaoImportacao(this.importador, process.cwd(), 
                    this.escreverEmSaida.bind(this), this.escreverEmSaidaMesmaLinha.bind(this));
                break;
            case "por":
                this.lexador = new LexadorPortugolStudio();
                this.avaliadorSintatico = new AvaliadorSintaticoPortugolStudio();
                this.importador = new Importador(
                    this.lexador, 
                    this.avaliadorSintatico, 
                    {},
                    {},
                    true);
                this.interpretador = new InterpretadorPortugolStudioComDepuracao(process.cwd(), 
                    this.escreverEmSaida.bind(this), this.escreverEmSaidaMesmaLinha.bind(this));
                break;
            case "poti":
            case "potigol":
                this.lexador = new LexadorPotigol();
                this.avaliadorSintatico = new AvaliadorSintaticoPotigol();
                this.importador = new Importador(
                    this.lexador, 
                    this.avaliadorSintatico, 
                    {},
                    {},
                    true);
                this.interpretador = new InterpretadorPotigolComDepuracao(process.cwd(), 
                    this.escreverEmSaida.bind(this), this.escreverEmSaidaMesmaLinha.bind(this));
                break;
            default:
                this.lexador = new Lexador();
                this.avaliadorSintatico = new AvaliadorSintatico();
                this.importador = new Importador(
                    this.lexador, 
                    this.avaliadorSintatico, 
                    {},
                    {},
                    true);
                this.interpretador = new InterpretadorComDepuracaoImportacao(this.importador, process.cwd(), 
                    this.escreverEmSaida.bind(this), this.escreverEmSaidaMesmaLinha.bind(this));
                break;
        }
    }

    /**
     * 
     * @param arquivoInicial 
     * @param pararNaEntrada 
     */
    iniciar(arquivoInicial: string, pararNaEntrada: boolean) {
        const partesNomeArquivo = arquivoInicial.split('.');
        this.selecionarDialetoPorExtensao(partesNomeArquivo.pop() || '.delegua');

        // Inicialização do interpretador pós escolha de dialeto.
        this.interpretador.pontosParada = this._pontosParada;
        this.interpretador.finalizacaoDaExecucao = this.finalizacao.bind(this);
        this.interpretador.avisoPontoParadaAtivado = this.avisoPontoParadaAtivado.bind(this);
        
        this._arquivoInicial = arquivoInicial;
        const retornoImportador = this.importador.importar(arquivoInicial, true);
        this._hashArquivoInicial = retornoImportador.hashArquivo;
        this._conteudoArquivo = this.importador.conteudoArquivosAbertos[this._hashArquivoInicial];

        this.interpretador.prepararParaDepuracao(
            retornoImportador.retornoAvaliadorSintatico.declaracoes,
        );

        this.interpretador.interfaceEntradaSaida = {
            question: async (mensagem: string, callback: Function) => {
                return new Promise<any>((resolve, reject) => {
                    vscode.window.showInputBox({
                        prompt: mensagem,
                        title: mensagem
                    }).then((resposta: any) => {
                        callback(resposta);
                        resolve(0);
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