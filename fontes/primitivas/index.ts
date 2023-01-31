import { primitivasNumero } from './primitivas-numero';
import { primitivasTexto } from './primitivas-texto';
import { primitivasVetor } from './primitivas-vetor';

const ordenar = (a: any, b: any) => {
    const nome1 = a['nome'].toUpperCase();
    const nome2 = b['nome'].toUpperCase();    
    let comparar = 0;
    
    if (nome1 > nome2) comparar = 1;
    else if (nome1 < nome2) comparar = -1;

    return comparar;
}

const primitivas = [...primitivasNumero, ...primitivasTexto, ...primitivasVetor].sort(ordenar)

export default primitivas;