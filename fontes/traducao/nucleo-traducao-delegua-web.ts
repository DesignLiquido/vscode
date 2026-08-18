import { Lexador } from '@designliquido/delegua/lexador';
import { AvaliadorSintatico } from '@designliquido/delegua/avaliador-sintatico';
import { TradutorAssemblyScript, TradutorElixir, TradutorJavaScript, TradutorPython, TradutorReversoJavaScript, TradutorRuby } from '@designliquido/delegua/tradutores';
import { AvaliadorSintaticoInterface, TradutorInterface } from '@designliquido/delegua';
import { AvaliadorSintaticoJavaScript } from '@designliquido/delegua/avaliador-sintatico/traducao/avaliador-sintatico-javascript';

import { AvaliadorSintaticoVisuAlg } from '@designliquido/visualg/avaliador-sintatico';
import { TradutorReversoVisuAlg } from '@designliquido/visualg/tradutores';

interface ImportadorInterface {
    diretorioBase: string;
    importar(caminho: string, indice: number): any;
}

export class NucleoTraducaoDeleguaWeb {
    lexador: Lexador;
    avaliadorSintatico: AvaliadorSintaticoInterface<any, any>;
    tradutor: TradutorInterface<any>;
    funcaoDeRetorno: Function;
    funcaoDeRetornoMesmaLinha: Function;
    importador: ImportadorInterface;

    arquivosAbertos: { [identificador: string]: string };
    conteudoArquivosAbertos: { [identificador: string]: string[] };

    comandoTraducao: string = '';

    extensoes = {
        assemblyscript: '.as',
        elixir: '.ex',
        delegua: '.delegua',
        javascript: '.js',
        js: '.js',
        alg: '.alg',
        visualg: '.alg',
        python: '.py',
        py: '.py',
        ruby: '.rb'
    };

    constructor(
        funcaoDeRetorno: Function,
        funcaoDeRetornoMesmaLinha: Function
    ) {
        this.arquivosAbertos = {};
        this.conteudoArquivosAbertos = {};

        this.funcaoDeRetorno = funcaoDeRetorno || console.log;
        this.funcaoDeRetornoMesmaLinha = funcaoDeRetornoMesmaLinha || console.log;
    }

    afericaoErrosLexador(retornoLexador: any): boolean {
        // Verificar se há erros no retorno do lexador
        return retornoLexador && (retornoLexador.erros || retornoLexador.erros?.length > 0);
    }

    iniciarTradutor(comandoTraducao: string, alvo: string = '') {
        this.comandoTraducao = comandoTraducao;
        this.lexador = new Lexador(false);

        switch (comandoTraducao) {
            case 'delegua-para-assemblyscript':
            case 'delegua-para-as':
                this.avaliadorSintatico = new AvaliadorSintatico();
                this.tradutor = new TradutorAssemblyScript();
                break;
            case 'delegua-para-elixir':
                this.avaliadorSintatico = new AvaliadorSintatico();
                this.tradutor = new TradutorElixir();
                break;
            case 'delegua-para-js':
            case 'delegua-para-javascript':
                this.avaliadorSintatico = new AvaliadorSintatico();
                this.tradutor = new TradutorJavaScript();
                break;
            case 'delegua-para-py':
            case 'delegua-para-python':
                this.avaliadorSintatico = new AvaliadorSintatico();
                this.tradutor = new TradutorPython();
                break;
            case 'delegua-para-ruby':
                this.avaliadorSintatico = new AvaliadorSintatico();
                this.tradutor = new TradutorRuby();
                break;
            case 'js-para-delegua':
            case 'javascript-para-delegua':
                this.avaliadorSintatico = new AvaliadorSintaticoJavaScript();
                this.tradutor = new TradutorReversoJavaScript();
                break;
            case 'alg-para-delegua':
            case 'visualg-para-delegua':
                this.avaliadorSintatico = new AvaliadorSintaticoVisuAlg();
                this.tradutor = new TradutorReversoVisuAlg();
                break;
            default:
                throw new Error(`Tradutor '${comandoTraducao}' não implementado.`);
        }
    }

    /**
     * Realiza a tradução do arquivo passado como parâmetro no comando de execução.
     * @param caminhoRelativoArquivo O caminho do arquivo.
     * @param gerarArquivoSaida Se o resultado da tradução deve ser escrito em arquivo.
     *                          Se verdadeiro, os arquivos de saída são escritos no mesmo diretório
     *                          do arquivo passado no primeiro parâmetro.
     */
    async traduzirArquivo(conteudo: string): Promise<any> {
        try {
            const retornoLexador = this.lexador.mapear(
                conteudo.split(`\n`), -1
            );

            if (this.afericaoErrosLexador(retornoLexador)) {
                throw new Error('Erro na análise léxica');
            }

            const retornoAvaliadorSintatico = await this.avaliadorSintatico.analisar(
                retornoLexador,
                -1
            );

            const resultado = await this.tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);

            return resultado;
        } catch (erro: any) {
            this.funcaoDeRetorno(''); // Retornar string vazia em caso de erro
        }
    }
}
