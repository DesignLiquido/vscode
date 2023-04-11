import * as vscode from 'vscode';

import { EventEmitter } from 'events';
import { DebugProtocol } from '@vscode/debugprotocol';

import { AvaliadorSintatico, cyrb53, Lexador, PontoParada } from '@designliquido/delegua';

import { ElementoPilhaVsCode } from '../elemento-pilha';
import { AvaliadorSintaticoInterface, InterpretadorComDepuracaoInterface, LexadorInterface } from '@designliquido/delegua/fontes/interfaces';
import { LexadorPortugolStudio } from '@designliquido/delegua/fontes/lexador/dialetos/lexador-portugol-studio';
import { LexadorVisuAlg } from '@designliquido/delegua/fontes/lexador/dialetos/lexador-visualg';
import { AvaliadorSintaticoPortugolStudio } from '@designliquido/delegua/fontes/avaliador-sintatico/dialetos/avaliador-sintatico-portugol-studio';
import { AvaliadorSintaticoVisuAlg } from '@designliquido/delegua/fontes/avaliador-sintatico/dialetos/avaliador-sintatico-visualg';
import { LexadorEguaP } from '@designliquido/delegua/fontes/lexador/dialetos/lexador-eguap';
import { AvaliadorSintaticoEguaP } from '@designliquido/delegua/fontes/avaliador-sintatico/dialetos/avaliador-sintatico-eguap';
import { LexadorMapler } from '@designliquido/delegua/fontes/lexador/dialetos/lexador-mapler';
import { AvaliadorSintaticoMapler } from '@designliquido/delegua/fontes/avaliador-sintatico/dialetos/avaliador-sintatico-mapler';
import { Importador } from '@designliquido/delegua-node/fontes/importador';
import { ImportadorInterface } from '@designliquido/delegua-node/fontes/interfaces';
import { InterpretadorComDepuracaoImportacao } from '@designliquido/delegua-node/fontes/interpretador/interpretador-com-depuracao-importacao';
import { InterpretadorVisuAlgComDepuracaoImportacao } from '@designliquido/delegua-node/fontes/interpretador/dialetos/interpretador-visualg-com-depuracao-importacao';

import palavrasReservadas from '@designliquido/delegua/fontes/lexador/palavras-reservadas';
import { InterpretadorPortugolStudioComDepuracao } from '@designliquido/delegua/fontes/interpretador/dialetos';

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
    private lexador: LexadorInterface;
    private avaliadorSintatico: AvaliadorSintaticoInterface;
    private importador: ImportadorInterface;
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
            case "eguap":
                this.lexador = new LexadorEguaP();
                this.avaliadorSintatico = new AvaliadorSintaticoEguaP();
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
        const retornoImportador = this.importador.importar(arquivoInicial, true, false);
        this._hashArquivoInicial = retornoImportador.hashArquivo;
        this._conteudoArquivo = this.importador.conteudoArquivosAbertos[this._hashArquivoInicial];

        this.interpretador.prepararParaDepuracao(
            retornoImportador.retornoAvaliadorSintatico.declaracoes,
        );

        this.interpretador.interfaceEntradaSaida = {
            question: (mensagem: string, callback: Function) => {
                vscode.window.showInputBox({
                    prompt: mensagem,
                    title: mensagem
                }).then((resposta: any) => {
                    callback(resposta);
                });
            }
        };

        if (pararNaEntrada) {
            // Executar apenas um passo na entrada.
            this.interpretador.instrucaoPasso();
        } else {
            // Executamos até encontrar ou um ponto de parada, ou uma exceção.
            this.interpretador.instrucaoContinuarInterpretacao();
        }
    }

    adentrarEscopo() {
        this.interpretador.adentrarEscopo();
    }

    continuar() {
        this.interpretador.comando = undefined;
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