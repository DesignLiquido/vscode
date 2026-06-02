import { AvaliadorSintaticoPitugues } from '@designliquido/delegua/avaliador-sintatico';
import { InformacaoElementoSintatico } from '@designliquido/delegua/informacao-elemento-sintatico';
import { Decorador } from '@designliquido/delegua/construtos';
import tiposDeSimbolos from '@designliquido/delegua/tipos-de-simbolos/pitugues';

export class AvaliadorSintaticoPituguesLiquido extends AvaliadorSintaticoPitugues {
    protected override inicializarPilhaEscopos(): void {
        super.inicializarPilhaEscopos();
        this.pilhaEscopos.definirInformacoesVariavel('liquido', new InformacaoElementoSintatico('liquido', 'módulo'));
        this.pilhaEscopos.definirInformacoesVariavel('requisicao', new InformacaoElementoSintatico('requisicao', 'módulo'));
        this.pilhaEscopos.definirInformacoesVariavel('resposta', new InformacaoElementoSintatico('resposta', 'módulo'));
    }

    protected override async resolverDecoradores(): Promise<void> {
        while (this.verificarTipoSimboloAtual(tiposDeSimbolos.ARROBA)) {
            this.avancarEDevolverAnterior();

            let nomeDecorador = '';
            let linha: number;
            const atributos: { [key: string]: any } = {};

            const primeiraParteNomeDecorador = this.consumir(
                tiposDeSimbolos.IDENTIFICADOR,
                'Esperado nome de decorador após "@".'
            );

            linha = Number(primeiraParteNomeDecorador.linha);
            nomeDecorador += primeiraParteNomeDecorador.lexema;

            while (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.PONTO)) {
                const parteNomeDecorador = this.consumir(
                    tiposDeSimbolos.IDENTIFICADOR,
                    'Esperado nome de decorador após "."'
                );
                nomeDecorador += '.' + parteNomeDecorador.lexema;
            }

            if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.PARENTESE_ESQUERDO)) {
                if (!this.verificarTipoSimboloAtual(tiposDeSimbolos.PARENTESE_DIREITO)) {
                    let indexArgumento = 0;

                    do {
                        // Argumento nomeado: identificador = valor (não é atribuição de variável)
                        if (
                            this.verificarTipoSimboloAtual(tiposDeSimbolos.IDENTIFICADOR) &&
                            this.verificarTipoProximoSimbolo(tiposDeSimbolos.IGUAL)
                        ) {
                            const nomeArgumento = this.avancarEDevolverAnterior().lexema;
                            this.avancarEDevolverAnterior();
                            const valorExpressao = await this.ou();
                            atributos[nomeArgumento] = valorExpressao;
                        } else {
                            const valorExpressao = await this.atribuir();

                            atributos[indexArgumento] = valorExpressao;

                            if (indexArgumento === 0) {
                                atributos['caminho'] = valorExpressao;
                            }

                            indexArgumento++;
                        }
                    } while (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.VIRGULA));
                }

                this.consumir(
                    tiposDeSimbolos.PARENTESE_DIREITO,
                    'Esperado ")" após argumentos do decorador.'
                );
            }

            this.pilhaDecoradores.push(
                new Decorador(this.hashArquivo, linha, nomeDecorador, atributos)
            );
        }
    }
}
