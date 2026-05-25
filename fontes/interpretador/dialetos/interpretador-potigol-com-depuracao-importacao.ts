import { AcessoMetodoOuPropriedade } from '@designliquido/delegua/construtos';
import { DeleguaModulo, FuncaoPadrao } from '@designliquido/delegua/interpretador/estruturas';
import { InterpretadorPotigolComDepuracao } from '@designliquido/potigol/interpretador';

import * as arquivo from '../../bibliotecas/dialetos/potigol/arquivo';
import { EstruturaURL, criarURL } from '../../bibliotecas/dialetos/potigol/url';

export class InterpretadorPotigolComDepuracaoImportacao extends InterpretadorPotigolComDepuracao {
    constructor(
        diretorioBase: string,
        funcaoDeRetorno?: Function,
        funcaoDeRetornoMesmaLinha?: Function
    ) {
        super(diretorioBase, funcaoDeRetorno, funcaoDeRetornoMesmaLinha);
        this.registrarBibliotecasExtras();
    }

    private registrarBibliotecasExtras(): void {
        const moduloArquivo = new DeleguaModulo('Arquivo');
        moduloArquivo.componentes = {
            leia: new FuncaoPadrao(1, arquivo.leia),
            salve: new FuncaoPadrao(2, arquivo.salve),
        };
        this.pilhaEscoposExecucao.definirVariavel('Arquivo', moduloArquivo);

        this.pilhaEscoposExecucao.definirVariavel('URL', new FuncaoPadrao(1, criarURL));
    }

    override async visitarExpressaoAcessoMetodoOuPropriedade(
        expressao: AcessoMetodoOuPropriedade
    ): Promise<any> {
        const variavelObjeto = await this.avaliar(expressao.objeto);
        const objeto = variavelObjeto?.hasOwnProperty('valor') ? variavelObjeto.valor : variavelObjeto;

        if (objeto instanceof EstruturaURL) {
            const chave = expressao.simbolo.lexema;
            if (chave === 'conteudo' || chave === 'conteúdo') {
                return objeto.conteudo;
            }
            if (chave === 'erro') {
                return objeto.erro;
            }
        }

        return super.visitarExpressaoAcessoMetodoOuPropriedade(expressao);
    }
}
