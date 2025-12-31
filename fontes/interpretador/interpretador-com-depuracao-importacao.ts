import { InterpretadorComDepuracao } from "@designliquido/delegua/interpretador/depuracao";
import { ResultadoParcialInterpretadorInterface, SimboloInterface } from '@designliquido/delegua/interfaces';
import { Const, Declaracao, FuncaoDeclaracao } from "@designliquido/delegua/declaracoes";
import { DescritorTipoClasse } from "@designliquido/delegua/interpretador/estruturas";
import { inferirTipoVariavel } from "@designliquido/delegua/inferenciador";

import { ImportadorInterface } from "../interfaces";
import { InterpretadorComImportacaoInterface } from '../interfaces/interpretador-com-importacao-interface';
import { ImportarBiblioteca, ModuloDeclaracoes } from '../construtos';

import * as comum from './comum';

export class InterpretadorComDepuracaoImportacao
    extends InterpretadorComDepuracao
    implements InterpretadorComImportacaoInterface
{
    importador: ImportadorInterface<SimboloInterface>;

    constructor(
        importador: ImportadorInterface<SimboloInterface>,
        diretorioBase: string,
        funcaoDeRetorno: Function,
        funcaoDeRetornoMesmaLinha: Function
    ) {
        super(diretorioBase, funcaoDeRetorno, funcaoDeRetornoMesmaLinha);
        this.importador = importador;
    }

    override async executar(declaracao: Declaracao): Promise<ResultadoParcialInterpretadorInterface | null> {
        const resultado: any = await declaracao.aceitar(this);

        if (resultado === null || resultado === undefined) {
            return null;
        }

        if (resultado.hasOwnProperty('valorRetornado')) {
            return resultado;
        }

        let tipoResultado = resultado.tipo;
        switch (resultado.constructor) {
            case DescritorTipoClasse:
                tipoResultado = resultado.simboloOriginal.lexema;
                break;
            default:
                if (!tipoResultado) {
                    tipoResultado = inferirTipoVariavel(resultado);
                }
                break;
        }

        return {
            hashArquivo: declaracao.hashArquivo,
            linha: declaracao.linha,
            valorRetornado: resultado,
            tipo: tipoResultado,
        } as ResultadoParcialInterpretadorInterface;
    }

    async visitarConstrutoImportarBiblioteca(importarBiblioteca: ImportarBiblioteca) {
        return comum.visitarConstrutoImportarBiblioteca(this, importarBiblioteca);
    }

    override visitarDeclaracaoConst(declaracao: Const): Promise<any> {
        return comum.visitarDeclaracaoConst(this, declaracao);
    }

    override visitarDeclaracaoDefinicaoFuncao(funcaoDeclaracao: FuncaoDeclaracao) {
        return comum.visitarDeclaracaoDefinicaoFuncao(this, funcaoDeclaracao);
    }

    async visitarDeclaracaoModuloDeclaracoes(declaracao: ModuloDeclaracoes) {
        return comum.visitarExpressaoModuloDeclaracoes(this, declaracao);
    }
}
