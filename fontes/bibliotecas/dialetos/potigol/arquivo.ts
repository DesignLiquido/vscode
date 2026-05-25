import * as fs from 'fs';

import { InterpretadorPotigolInterface } from '@designliquido/potigol/interfaces';

export async function leia(interpretador: InterpretadorPotigolInterface, caminho: string): Promise<string[]> {
    const conteudo = await fs.promises.readFile(caminho, 'utf-8');
    return conteudo.split('\n');
}

export async function salve(
    interpretador: InterpretadorPotigolInterface,
    caminho: string,
    conteudo: string,
    anexar: boolean = false
): Promise<void> {
    if (anexar) {
        await fs.promises.appendFile(caminho, conteudo, 'utf-8');
    } else {
        await fs.promises.writeFile(caminho, conteudo, 'utf-8');
    }
}
