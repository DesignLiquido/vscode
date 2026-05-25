import { InterpretadorPotigolInterface } from '@designliquido/potigol/interfaces';

export class EstruturaURL {
    caminho: string;
    conteudo: string;
    erro: boolean;

    constructor(caminho: string, conteudo: string) {
        this.caminho = caminho;
        this.conteudo = conteudo;
        this.erro = conteudo === '';
    }
}

export async function criarURL(
    interpretador: InterpretadorPotigolInterface,
    caminho: string
): Promise<EstruturaURL> {
    try {
        const resposta = await fetch(caminho);
        const conteudo = await resposta.text();
        return new EstruturaURL(caminho, conteudo);
    } catch {
        return new EstruturaURL(caminho, '');
    }
}
