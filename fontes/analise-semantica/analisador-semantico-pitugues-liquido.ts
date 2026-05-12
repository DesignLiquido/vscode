import { Declaracao } from '@designliquido/delegua/declaracoes';
import { AnalisadorSemanticoPitugues } from '@designliquido/delegua/analisador-semantico/dialetos';
import { GerenciadorEscopos } from '@designliquido/delegua/analisador-semantico/gerenciador-escopos';
import { RetornoAnalisadorSemanticoInterface } from '@designliquido/delegua';

const variaveisInjetadasLiquido = ['liquido', 'requisicao', 'resposta', 'lincones'];

export class AnalisadorSemanticoPituguesLiquido extends AnalisadorSemanticoPitugues {
    async analisar(declaracoes: Declaracao[]): Promise<RetornoAnalisadorSemanticoInterface> {
        this.gerenciadorEscopos = new GerenciadorEscopos();
        this.funcoes = {};
        this.atual = 0;
        this.diagnosticos = [];

        for (const nome of variaveisInjetadasLiquido) {
            this.gerenciadorEscopos.declarar(nome, {
                nome,
                tipo: 'módulo',
                imutavel: false,
                inicializada: true,
                usada: true,
                hashArquivo: -1,
                linha: -1
            });
        }

        while (this.atual < declaracoes.length) {
            await declaracoes[this.atual].aceitar(this);
            this.atual++;
        }

        this.verificarVariaveisNaoUsadas();
        return { diagnosticos: this.diagnosticos };
    }
}
