import { primitivasNumero } from './primitivas-numero';
import { primitivasTexto } from './primitivas-texto';
import { primitivasVetor } from './primitivas-vetor';
import { metodosBibliotecaGlobal } from './metodos-biblioteca-global';

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

const primitivas = [
    ...primitivasNumero, 
    ...primitivasTexto, 
    ...primitivasVetor,
    ...metodosBibliotecaGlobal
].sort(ordenar);

export default primitivas;