import { Declaracao } from '@designliquido/delegua';
import { ConstrutoInterface } from '@designliquido/delegua/interfaces/construtos/construto-interface';

export class ModuloDeclaracoes implements ConstrutoInterface {
    linha: number;
    hashArquivo: number;
    nomeModulo?: string;
    declaracoes: Declaracao[];

    constructor(linha: number, hashArquivo: number, declaracoes: Declaracao[]) {
        this.linha = linha;
        this.hashArquivo = hashArquivo;
        this.declaracoes = declaracoes;
    }

    async aceitar(visitante: any): Promise<any> {
        return visitante.visitarDeclaracaoModuloDeclaracoes(this);
    }

    paraTexto(): string {
        return `<módulo-declarações />`;
    }

    paraTextoSaida(): string {
        throw new Error("Método não implementado.");
    }
}
