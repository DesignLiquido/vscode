import { PrimitivaInterface } from '@designliquido/delegua/interfaces';

import primitivasDicionario from '@designliquido/delegua/bibliotecas/dialetos/pitugues/primitivas-dicionario';
import primitivasNumero from '@designliquido/delegua/bibliotecas/dialetos/pitugues/primitivas-numero';
import primitivasTexto from '@designliquido/delegua/bibliotecas/dialetos/pitugues/primitivas-texto';
import primitivasVetor from '@designliquido/delegua/bibliotecas/dialetos/pitugues/primitivas-vetor';

import { funcoesNativasPitugues} from './funcoes-nativas';
import { FuncaoNativaOuMetodoPrimitiva, ParametroAssinaturaMetodo } from '../../tipos';

const ordenar = (a: any, b: any) => {
    const nome1 = a['nome'].toUpperCase();
    const nome2 = b['nome'].toUpperCase();
    
    if (nome1 > nome2) {
        return 1;
    }
        
    if (nome1 < nome2) {
        return -1;
    }

    return 0;
};

function formatarPrimitivas(moduloPrimitivas: {[nome: string]: PrimitivaInterface}) {
    const primitivasFormatadas: FuncaoNativaOuMetodoPrimitiva[] = [];
    for (const [nome, primitiva] of Object.entries(moduloPrimitivas)) {
        primitivasFormatadas.push({
            nome: nome,
            assinaturas: [{
                formato: `${nome}()`,
                parametros: primitiva.argumentos.map(p => ({
                    nome: p.nome,
                    documentacao: p.documentacao
                } as ParametroAssinaturaMetodo))
            }],
            documentacao: primitiva.documentacao,
            exemploCodigo: primitiva.exemploCodigo
        } as FuncaoNativaOuMetodoPrimitiva);
    }

    return primitivasFormatadas;
}

const primitivasDicionarioFormatadas: FuncaoNativaOuMetodoPrimitiva[] = formatarPrimitivas(primitivasDicionario);
const primitivasNumeroFormatadas: FuncaoNativaOuMetodoPrimitiva[] = formatarPrimitivas(primitivasNumero);
const primitivasTextoFormatadas: FuncaoNativaOuMetodoPrimitiva[] = formatarPrimitivas(primitivasTexto);
const primitivasVetorFormatadas: FuncaoNativaOuMetodoPrimitiva[] = formatarPrimitivas(primitivasVetor);

const primitivas: FuncaoNativaOuMetodoPrimitiva[] = [
    ...primitivasDicionarioFormatadas,
    ...primitivasNumeroFormatadas, 
    ...primitivasTextoFormatadas, 
    ...primitivasVetorFormatadas
].sort(ordenar);

export { 
    primitivas, 
    primitivasDicionarioFormatadas,
    primitivasNumeroFormatadas,
    primitivasTextoFormatadas,
    primitivasVetorFormatadas,
    funcoesNativasPitugues
};
