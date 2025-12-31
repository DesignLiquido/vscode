import { SimboloInterface } from '@designliquido/delegua/interfaces';
import { RetornoImportador } from '../importador/importador-extensao';

export interface ImportadorInterface<TSimbolo extends SimboloInterface> {
    diretorioBase: string;
    conteudoArquivosAbertos: { [identificador: string]: string[] };
    importar(caminhoRelativoArquivo: string, hashArquivoAnterior: number): RetornoImportador<TSimbolo> | Promise<RetornoImportador<TSimbolo>>;
}
