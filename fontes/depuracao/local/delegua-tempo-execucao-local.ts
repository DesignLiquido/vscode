import { EventEmitter } from 'events';
import { DebugProtocol } from '@vscode/debugprotocol';

import { AvaliadorSintatico, Importador, InterpretadorComDepuracao, Lexador } from '@designliquido/delegua';
import palavrasReservadas from '@designliquido/delegua/fontes/lexador/palavras-reservadas';

import { ElementoPilhaVsCode } from '../elemento-pilha';

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
    private lexador: Lexador;
    private avaliadorSintatico: AvaliadorSintatico;
    private importador: Importador;
    private interpretador: InterpretadorComDepuracao;

    private _arquivoInicial: string = '';
    private _conteudoArquivo: string[];
    private _hashArquivoInicial = -1;
    private _aguardandoComando: boolean;
    
    constructor() {
        super();

        this.lexador = new Lexador();
        this.avaliadorSintatico = new AvaliadorSintatico();
        this.importador = new Importador(
            this.lexador, 
            this.avaliadorSintatico, 
            {},
            {},
            true);
        this.interpretador = new InterpretadorComDepuracao(this.importador, process.cwd(), 
            this.escreverEmSaida.bind(this));

        this.interpretador.finalizacaoDaExecucao = this.finalizacao.bind(this);
        this.interpretador.avisoPontoParadaAtivado = this.avisoPontoParadaAtivado.bind(this);
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

    iniciar(arquivoInicial: string, pararNaEntrada: boolean) {
        // Por algum motivo, isso gera um hash diferente do importador.
        // this._hashArquivoInicial = cyrb53(arquivoInicial);
        this._arquivoInicial = arquivoInicial;
        const retornoImportador = this.importador.importar(arquivoInicial);
        this._hashArquivoInicial = retornoImportador.hashArquivo;
        this._conteudoArquivo = this.importador.conteudoArquivosAbertos[this._hashArquivoInicial];
        this._aguardandoComando = false;

        // Os pontos de parada são definidos antes da abertura do arquivo.
        // Por isso é necessário atualizar o _hash_ de cada ponto de parada aqui.
        for (let pontoParada of this.interpretador.pontosParada) {
            pontoParada.hashArquivo = retornoImportador.hashArquivo;
        }

        this.interpretador.prepararParaDepuracao(
            retornoImportador.retornoAvaliadorSintatico.declaracoes,
        );

        if (pararNaEntrada) {
            // we step once
            this.interpretador.instrucaoPasso();
        } else {
            // we just start to run until we hit a breakpoint or an exception
            this.interpretador.instrucaoContinuarInterpretacao();
        }
    }

    adentrarEscopo() {
        this.interpretador.adentrarEscopo();
    }

    continuar() {
        this.interpretador.instrucaoContinuarInterpretacao();
    }

    definirPontosParada(pontosParada: DebugProtocol.Breakpoint[]) {
        for (let pontoParada of pontosParada) {
            this.interpretador.pontosParada.push({
                hashArquivo: this._hashArquivoInicial,
                linha: Number(pontoParada.line),
            });
        }
    }

    escreverEmSaida(mensagem: string) {
        this.enviarEvento('saida', mensagem);
    }

    obterVariavel(nome: string) {
        if (Object.keys(palavrasReservadas).includes(nome)) {
            return undefined;
        }

        return this.interpretador.obterVariavel(nome);
    }

    passo() {
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
            pilhaRetorno.push({
                id: ++id,
                linha: declaracaoAtual.linha,
                nome: this._conteudoArquivo[declaracaoAtual.linha - 1].trim(),
                arquivo: this._arquivoInicial,
                metodo: '<principal>'
            });
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