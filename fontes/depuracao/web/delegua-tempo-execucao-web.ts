import * as vscode from 'vscode';

import { EventEmitter } from 'events';
import { DebugProtocol } from '@vscode/debugprotocol';

import { PontoParada } from '@designliquido/delegua';

import { AvaliadorSintaticoInterface, InterpretadorComDepuracaoInterface, LexadorInterface, SimboloInterface } from '@designliquido/delegua/interfaces';

import { LexadorPitugues } from '@designliquido/delegua/lexador/dialetos/lexador-pitugues';
import { AvaliadorSintaticoPitugues } from '@designliquido/delegua/avaliador-sintatico/dialetos/avaliador-sintatico-pitugues';
import { InterpretadorPituguesComDepuracao } from '@designliquido/delegua/interpretador/dialetos/pitugues';

import { palavrasReservadasDelegua } from '@designliquido/delegua/lexador/palavras-reservadas';

import { Declaracao } from '@designliquido/delegua/declaracoes';
import { Lexador } from '@designliquido/delegua/lexador';
import { AvaliadorSintatico } from '@designliquido/delegua/avaliador-sintatico';
import { InterpretadorComDepuracao } from '@designliquido/delegua/interpretador/depuracao';

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
import { formatarDiagnosticosAvaliacaoSintatica } from '../../avaliacao-sintatica';
import { TempoExecucaoInterface } from '../tempo-execucao-interface';

// Polyfill para setImmediate no ambiente web
const setImmediatePolyfill = (callback: (...args: any[]) => void, ...args: any[]) => {
    setTimeout(() => callback(...args), 0);
};

/**
 * Versão web do tempo de execução local.
 * Esta versão não depende de módulos Node.js como `process` e usa APIs do VSCode para tudo.
 */
export class DeleguaTempoExecucaoWeb extends EventEmitter implements TempoExecucaoInterface {
    private lexador: LexadorInterface<SimboloInterface>;
    private avaliadorSintatico: AvaliadorSintaticoInterface<SimboloInterface, Declaracao>;
    private importadorExtensao: ImportadorExtensao;
    private resolvedor: { resolver(declaracoes: Declaracao[]): Promise<Declaracao[]> };

    interpretador: InterpretadorComDepuracaoInterface;

    private _documento: vscode.TextDocument;
    private _dialetoSelecionado: 'delegua' | 'pitugues' | 'birl' | 'mapler' | 'portugol-studio' | 'potigol' | 'visualg';
    private _arquivoInicial: string = '';
    private _conteudoArquivo: string[];
    private _hashArquivoInicial = -1;
    private _pontosParada: PontoParada[] = [];
    private _diretorioBase: string = '';

    // Armazena linhas de pontos de parada temporariamente até termos o hash do arquivo
    private _linhasPontosParada: number[] = [];
    
    constructor(
        private readonly provedorVisaoEntradaSaida: ProvedorVisaoEntradaSaida,
        private readonly diagnosticos: vscode.DiagnosticCollection
    ) {
        super();
    }

    /**
     * Efetivamente envia o evento para o objeto de sessão de depuração.
     */
    private enviarEvento(evento: string, ...argumentos: any[]) {
        setImmediatePolyfill(() => {
            this.emit(evento, ...argumentos);
        });
    }

    private limparTela() {
        this.enviarEvento('limparTela');
    }

    /**
     * Obtém o diretório base do workspace
     */
    private obterDiretorioBase(): string {
        if (vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders.length > 0) {
            return vscode.workspace.workspaceFolders[0].uri.path;
        }
        return '';
    }

    private selecionarDialetoPorExtensao(extensao: string) {
        const diretorioBase = this.obterDiretorioBase();
        
        switch (extensao.toLowerCase()) {
            case "alg":
                this._dialetoSelecionado = 'visualg';
                this.lexador = new LexadorVisuAlg();
                this.avaliadorSintatico = new AvaliadorSintaticoVisuAlg();
                this.importadorExtensao = new ImportadorExtensao(this.lexador);

                this.interpretador = new InterpretadorVisuAlgComDepuracao(
                    diretorioBase,
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
                    diretorioBase,
                    this.escreverEmSaida.bind(this), 
                    this.escreverEmSaidaMesmaLinha.bind(this)
                );
                break;
            case "pitu":
            case "pitugues":
                this._dialetoSelecionado = 'pitugues';
                this.lexador = new LexadorPitugues();
                this.avaliadorSintatico = new AvaliadorSintaticoPitugues();
                this.importadorExtensao = new ImportadorExtensao(this.lexador);
                
                this.interpretador = new InterpretadorPituguesComDepuracao(
                    diretorioBase,
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
                    diretorioBase,
                    this.escreverEmSaida.bind(this)
                );
                break;
            case "por":
                this._dialetoSelecionado = 'portugol-studio';
                this.lexador = new LexadorPortugolStudio();
                this.avaliadorSintatico = new AvaliadorSintaticoPortugolStudio();
                this.importadorExtensao = new ImportadorExtensao(this.lexador);

                this.interpretador = new InterpretadorPortugolStudioComDepuracao(
                    diretorioBase,
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
                    diretorioBase,
                    this.escreverEmSaida.bind(this), 
                    this.escreverEmSaidaMesmaLinha.bind(this)
                );
                break;
            default:
                this._dialetoSelecionado = 'delegua';
                this.lexador = new Lexador();
                this.avaliadorSintatico = new AvaliadorSintatico();
                this.importadorExtensao = new ImportadorExtensao(this.lexador);
                
                this.interpretador = new InterpretadorComDepuracao(
                    diretorioBase,
                    this.escreverEmSaida.bind(this), 
                    this.escreverEmSaidaMesmaLinha.bind(this)
                );
                
                break;
        }
    }

    /**
     * Extrai informações de localização (arquivo e linha) de um erro
     * @param erro Objeto de erro
     * @returns Objeto com caminhoArquivo e linha
     */
    private extrairLocalizacaoErro(erro: any): { caminhoArquivo: string; linha: number } {
        let caminhoArquivo = this._arquivoInicial;
        let linha = 0;

        // Tenta extrair informações do símbolo, se disponível
        if (erro.hasOwnProperty('simbolo') && erro.simbolo) {
            if (erro.simbolo.linha) {
                linha = erro.simbolo.linha;
            }
        }

        return { caminhoArquivo, linha };
    }

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
        let diretorioBase = partesDiretorio.join('/');
        if (diretorioBase.startsWith('/') && diretorioBase.length > 1) {
            diretorioBase = diretorioBase.slice(1);
        }
        
        this._diretorioBase = diretorioBase;
        this.selecionarDialetoPorExtensao(partesNomeArquivo.pop() || '.delegua');

        // Inicialização do interpretador pós escolha de dialeto.
        if (this.interpretador) {
            this.interpretador.diretorioBase = diretorioBase;
            this.interpretador.pontosParada = this._pontosParada;
            this.interpretador.finalizacaoDaExecucao = this.finalizacao.bind(this);
            this.interpretador.avisoPontoParadaAtivado = this.avisoPontoParadaAtivado.bind(this);
        }
        
        this._arquivoInicial = arquivoInicial;

        const retornoImportador = this.importadorExtensao.importarViaFuncaoConteudoDocumento(
            this._documento.getText.bind(this._documento), 
            this._documento.fileName
        );
        this._hashArquivoInicial = retornoImportador.hashArquivo;
        this._conteudoArquivo = retornoImportador.conteudoArquivo;

        const retornoAvaliadorSintatico = await this.avaliadorSintatico.analisar(
            retornoImportador.retornoLexador, 
            retornoImportador.hashArquivo
        );
        
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

        if (!this.interpretador) {
            throw new Error('Interpretador não foi inicializado corretamente.');
        }

        this.interpretador.prepararParaDepuracao(declaracoes);

        // CRÍTICO: Define pontos de parada APÓS prepararParaDepuracao
        // Cria pontos de parada com o hash de arquivo correto usando números de linha armazenados
        this._pontosParada = this._linhasPontosParada.map(linha => ({
            hashArquivo: this._hashArquivoInicial,
            linha: linha
        }));

        // Atribui ao interpretador
        this.interpretador.pontosParada = this._pontosParada;

        this.provedorVisaoEntradaSaida.limparTerminal();

        // Manipulador de entrada não-bloqueante
        this.interpretador.interfaceEntradaSaida = {
            question: async (mensagem: string, callback: Function) => {
                this.provedorVisaoEntradaSaida.escreverEmSaidaMesmaLinha(mensagem);
                const resposta = await this.provedorVisaoEntradaSaida.aguardarEntrada();
                callback(resposta);
                return 0;
            }
        };

        if (pararNaEntrada) {
            this.interpretador.comando = 'proximo';
            this.interpretador.instrucaoPasso().then(() => {
                for (let erro of this.interpretador.erros) {
                    const { caminhoArquivo, linha } = this.extrairLocalizacaoErro(erro);
                    this.enviarEvento('saida', erro, false, caminhoArquivo, linha);
                }
            }).catch((erro) => {
                this.enviarEvento('saida', `Erro durante execução: ${erro.message || erro}`);
            });
        } else {
            this.interpretador.comando = 'continuar';
            this.interpretador.instrucaoContinuarInterpretacao().then(() => {
                for (let erro of this.interpretador.erros) {
                    const { caminhoArquivo, linha } = this.extrairLocalizacaoErro(erro);
                    this.enviarEvento('saida', erro, false, caminhoArquivo, linha);
                }
            }).catch((erro) => {
                this.enviarEvento('saida', `Erro durante execução: ${erro.message || erro}`);
            });
        }
    }

    adentrarEscopo() {
        if (this.interpretador) {
            this.interpretador.adentrarEscopo();
        }
    }

    continuar() {
        if (this.interpretador) {
            this.interpretador.comando = 'continuar';
            this.interpretador.pontoDeParadaAtivo = false;
            this.interpretador.instrucaoContinuarInterpretacao().catch((erro) => {
                this.enviarEvento('saida', `Erro ao continuar: ${erro.message || erro}`);
            });
        }
    }

    definirPontosParada(pontosParada: DebugProtocol.Breakpoint[]) {
        // Armazena os números de linha - calcularemos os hashes quando tivermos o arquivo
        this._linhasPontosParada = pontosParada.map(bp => Number(bp.line));

        // Se já temos um hash de arquivo (de uma execução anterior), cria os pontos de parada agora
        if (this._hashArquivoInicial !== -1) {
            this._pontosParada = this._linhasPontosParada.map(linha => ({
                hashArquivo: this._hashArquivoInicial,
                linha: linha
            }));
            
            if (this.interpretador) {
                this.interpretador.pontosParada = this._pontosParada;
            }
        }
    }

    reiniciarPontosParada() {
        this._pontosParada = [];
        this._linhasPontosParada = [];
        if (this.interpretador) {
            this.interpretador.pontosParada = this._pontosParada;
        }
    }

    escreverEmSaida(mensagem: string) {
        this.enviarEvento('saida', mensagem);
    }

    escreverEmSaidaMesmaLinha(mensagem: string) {
        this.enviarEvento('saida', mensagem, true);
    }

    obterVariavel(nome: string) {
        if (Object.keys(palavrasReservadasDelegua).includes(nome)) {
            return undefined;
        }

        return this.interpretador?.obterVariavel(nome);
    }

    pausar() {
        if (this.interpretador) {
            this.interpretador.comando = 'pausar';
            this.enviarEvento('pararEmPasso');
        }
    }

    passo() {
        if (this.interpretador) {
            this.interpretador.comando = 'proximo';
            this.interpretador.pontoDeParadaAtivo = false;
            this.interpretador.instrucaoPasso().then(() => {
                this.enviarEvento('pararEmPasso');
            }).catch((erro) => {
                this.enviarEvento('saida', `Erro ao executar passo: ${erro.message || erro}`);
            });
        }
    }

    pilhaExecucao(): ElementoPilhaVsCode[] {
        if (!this.interpretador) {
            return [];
        }

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
                    nome: this._conteudoArquivo[declaracaoAtual.linha - 1]?.trim() || '<desconhecido>',
                    arquivo: this._arquivoInicial,
                    metodo: '<principal>'
                });
            } else {
                const ultimaDeclaracaoEscopo = pilhaElemento.declaracoes[pilhaElemento.declaracoes.length - 1];
                if (ultimaDeclaracaoEscopo) {
                    pilhaRetorno.push({
                        id: ++id,
                        linha: ultimaDeclaracaoEscopo.linha,
                        nome: this._conteudoArquivo[ultimaDeclaracaoEscopo.linha - 1]?.trim() || '<desconhecido>',
                        arquivo: this._arquivoInicial,
                        metodo: '<principal>'
                    });
                }
            }
        }

        return pilhaRetorno;
    }

    sairEscopo() {
        if (this.interpretador) {
            this.interpretador.instrucaoProximoESair();
        }
    }

    variaveis() {
        return this.interpretador?.pilhaEscoposExecucao.obterTodasVariaveis([]) || [];
    }

    finalizacao() {
        this.enviarEvento('finalizar');
    }

    avisoPontoParadaAtivado() {
        this.enviarEvento('pararEmPontoParada');
    }
}