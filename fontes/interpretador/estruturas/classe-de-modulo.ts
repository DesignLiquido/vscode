import { Chamavel } from '@designliquido/delegua/interpretador/estruturas';

export class ClasseDeModulo extends Chamavel {
    nome: string;
    modulo: string;
    implementacao: any;
    metodos: { [nome: string]: any };
    propriedades: { [nome: string]: any };

    constructor(
        nome: string,
        modulo: string,
        implementacao: any,
        metodos: { [nome: string]: any },
        propriedades: { [nome: string]: any }
    ) {
        super();
        this.nome = nome;
        this.modulo = modulo;
        this.implementacao = implementacao;
        this.metodos = metodos;
        this.propriedades = propriedades;
    }
}
