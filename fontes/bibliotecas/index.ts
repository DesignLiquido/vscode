import { PrimitivaInterface } from '@designliquido/delegua/interfaces';
import { funcoesNativasDelegua } from './funcoes-nativas';
import { FuncaoNativaOuMetodoPrimitiva, ParametroAssinaturaMetodo } from './tipos';

export function formatarPrimitivas(moduloPrimitivas: {[nome: string]: PrimitivaInterface}): FuncaoNativaOuMetodoPrimitiva[] {
    const primitivasFormatadas: FuncaoNativaOuMetodoPrimitiva[] = [];
    for (const [nome, primitiva] of Object.entries(moduloPrimitivas)) {
        primitivasFormatadas.push({
            nome: nome,
            assinaturas: [{
                formato: primitiva.assinaturaFormato || `${nome}()`,
                parametros: primitiva.argumentos.map(p => ({
                    nome: p.nome,
                    documentacao: p.documentacao
                } as ParametroAssinaturaMetodo))
            }],
            documentacao: primitiva.documentacao || '',
            exemploCodigo: primitiva.exemploCodigo || ''
        } as FuncaoNativaOuMetodoPrimitiva);
    }
    return primitivasFormatadas;
}

export { funcoesNativasDelegua };
