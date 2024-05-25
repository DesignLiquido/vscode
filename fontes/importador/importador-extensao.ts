import * as vscode from 'vscode';

import { Declaracao } from "@designliquido/delegua/declaracoes";
import { AvaliadorSintaticoInterface, LexadorInterface, SimboloInterface } from '@designliquido/delegua/interfaces';

import { cyrb53 } from '@designliquido/delegua/depuracao';
import { RetornoImportador } from '../interfaces';

/**
 * Diferentemente do importador de `delegua-node`, este importador
 * não depende das bibliotecas `fs`, `os` e `path` do Node.js.
 * A leitura dos arquivos espera um adaptador do próprio ambiente do VSCode,
 * seja ele na Web ou em execução nativa.
 */
export class ImportadorExtensao {
    lexador: LexadorInterface<SimboloInterface>;
    avaliadorSintatico: AvaliadorSintaticoInterface<SimboloInterface, Declaracao>;

    constructor(
        lexador: LexadorInterface<SimboloInterface>,
        avaliadorSintatico: AvaliadorSintaticoInterface<SimboloInterface, Declaracao>
    ) {
        this.lexador = lexador;
        this.avaliadorSintatico = avaliadorSintatico;
    }

    importar(
        funcaoObtencaoConteudoDocumento: () => string,
        nomeArquivo: string
    ): RetornoImportador<SimboloInterface, Declaracao> {
        const hashArquivo = cyrb53(nomeArquivo.toLowerCase());
        const conteudoDoArquivo: string[] = funcaoObtencaoConteudoDocumento().split('\n').map(linha => linha + '\0');

        const retornoLexador = this.lexador.mapear(conteudoDoArquivo, hashArquivo);
        const retornoAvaliadorSintatico = this.avaliadorSintatico.analisar(retornoLexador, hashArquivo);

        return {
            conteudoArquivo: conteudoDoArquivo,
            nomeArquivo,
            hashArquivo,
            retornoLexador,
            retornoAvaliadorSintatico,
        } as RetornoImportador<SimboloInterface, Declaracao>;
    }
}
