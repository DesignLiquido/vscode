import { InterpretadorInterface } from '@designliquido/delegua/interfaces';
import { ImportarBiblioteca, ModuloDeclaracoes } from '../construtos';

export interface InterpretadorComImportacaoInterface extends InterpretadorInterface {
    visitarConstrutoImportarBiblioteca(importarBiblioteca: ImportarBiblioteca): Promise<any> | void;
    visitarDeclaracaoModuloDeclaracoes(declaracao: ModuloDeclaracoes): Promise<any> | void;
}
