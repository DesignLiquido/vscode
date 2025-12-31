import { DeleguaFuncao, DeleguaModulo } from "@designliquido/delegua/interpretador/estruturas";
import { Const, FuncaoDeclaracao } from "@designliquido/delegua/declaracoes";

import { ImportarBiblioteca, ModuloDeclaracoes } from "../construtos";
import { InterpretadorComImportacaoInterface } from "../interfaces/interpretador-com-importacao-interface";
import { carregarBibliotecaDelegua } from '../mecanismo-importacao-bibliotecas';

export async function visitarConstrutoImportarBiblioteca(
    interpretador: InterpretadorComImportacaoInterface,
    importarBiblioteca: ImportarBiblioteca
) {
    try {
        return await carregarBibliotecaDelegua(importarBiblioteca.nomeBiblioteca);
    } catch (erro: any) {
        interpretador.erros.push(erro);
        return null;
    }
}

export async function visitarDeclaracaoConst(
    interpretador: InterpretadorComImportacaoInterface,
    declaracao: Const
): Promise<any> {
    const valorFinal = await (interpretador as any).avaliacaoDeclaracaoVarOuConst(declaracao);
    if (valorFinal && valorFinal.hasOwnProperty('operacao') && valorFinal.operacao === 'DefinicaoFuncao') {
        interpretador.pilhaEscoposExecucao.definirConstante(
            declaracao.simbolo.lexema,
            valorFinal.declaracao,
            declaracao.tipo
        );
    } else {
        interpretador.pilhaEscoposExecucao.definirConstante(
            declaracao.simbolo.lexema,
            valorFinal,
            declaracao.tipo
        );
    }
    return interpretador.pilhaEscoposExecucao.obterValorVariavel(declaracao.simbolo);
}

export async function visitarDeclaracaoDefinicaoFuncao(
    interpretador: InterpretadorComImportacaoInterface,
    funcaoDeclaracao: FuncaoDeclaracao
): Promise<any> {
    const funcao = new DeleguaFuncao(funcaoDeclaracao.simbolo.lexema, funcaoDeclaracao.funcao);
    interpretador.pilhaEscoposExecucao.definirVariavel(funcaoDeclaracao.simbolo.lexema, funcao);
    interpretador.pilhaEscoposExecucao.registrarReferenciaFuncao(funcaoDeclaracao.id, funcao);

    return Promise.resolve({
        id: funcaoDeclaracao.id,
        nome: funcaoDeclaracao.simbolo.lexema,
        operacao: 'DefinicaoFuncao',
        tipo: `função<${funcao.declaracao.tipo || 'qualquer'}>`,
        tipoExplicito: funcao.declaracao.tipoExplicito,
        declaracao: funcao
    });
}

export async function visitarExpressaoModuloDeclaracoes(
    interpretador: InterpretadorComImportacaoInterface,
    declaracao: ModuloDeclaracoes
) {
    const modulo = new DeleguaModulo();
    for (const subdeclaracao of declaracao.declaracoes) {
        const componente = await interpretador.avaliar(subdeclaracao);
        if (componente) {
            if (componente.hasOwnProperty('operacao')) {
                switch (componente.operacao) {
                    case 'DefinicaoFuncao':
                        const definicaoFuncaoCorrespondente: DeleguaFuncao = interpretador.pilhaEscoposExecucao.obterReferenciaFuncao(componente.id);
                        modulo.componentes[componente.nome] = definicaoFuncaoCorrespondente;
                        break;
                    default:
                        console.warn("visitarDeclaracaoModuloDeclaracoes Tratar: ", componente);
                        break;
                }
            }
        }
    }

    return modulo;
}
