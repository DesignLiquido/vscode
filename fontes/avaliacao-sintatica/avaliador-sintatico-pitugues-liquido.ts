import { AvaliadorSintaticoPitugues } from '@designliquido/delegua/avaliador-sintatico';
import { InformacaoElementoSintatico } from '@designliquido/delegua/informacao-elemento-sintatico';

export class AvaliadorSintaticoPituguesLiquido extends AvaliadorSintaticoPitugues {
    protected override inicializarPilhaEscopos(): void {
        super.inicializarPilhaEscopos();
        this.pilhaEscopos.definirInformacoesVariavel('liquido', new InformacaoElementoSintatico('liquido', 'módulo'));
        this.pilhaEscopos.definirInformacoesVariavel('requisicao', new InformacaoElementoSintatico('requisicao', 'módulo'));
        this.pilhaEscopos.definirInformacoesVariavel('resposta', new InformacaoElementoSintatico('resposta', 'módulo'));
    }
}
