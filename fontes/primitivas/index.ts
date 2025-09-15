import { PrimitivaInterface } from '@designliquido/delegua/interfaces';

import primitivasDicionario from '@designliquido/delegua/bibliotecas/primitivas-dicionario';
import primitivasNumero from '@designliquido/delegua/bibliotecas/primitivas-numero';
import primitivasTexto from '@designliquido/delegua/bibliotecas/primitivas-texto';
import primitivasVetor from '@designliquido/delegua/bibliotecas/primitivas-vetor';

import { metodosBibliotecaGlobal } from './metodos-biblioteca-global';
import { PrimitivaOuMetodo, ParametroAssinaturaMetodo } from './tipos';

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
    const primitivasFormatadas: PrimitivaOuMetodo[] = [];
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
        } as PrimitivaOuMetodo);
    }

    return primitivasFormatadas;
}

const primitivasDicionarioFormatadas: PrimitivaOuMetodo[] = formatarPrimitivas(primitivasDicionario);
const primitivasNumeroFormatadas: PrimitivaOuMetodo[] = formatarPrimitivas(primitivasNumero);
const primitivasTextoFormatadas: PrimitivaOuMetodo[] = formatarPrimitivas(primitivasTexto);
const primitivasVetorFormatadas: PrimitivaOuMetodo[] = formatarPrimitivas(primitivasVetor);

const primitivas: PrimitivaOuMetodo[] = [
    ...primitivasDicionarioFormatadas,
    ...primitivasNumeroFormatadas, 
    ...primitivasTextoFormatadas, 
    ...primitivasVetorFormatadas,
    ...metodosBibliotecaGlobal
].sort(ordenar);

export default primitivas;
