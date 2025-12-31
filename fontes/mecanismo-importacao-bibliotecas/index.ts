/**
 * Mapeamento de nomes de módulos Delégua para seus pacotes npm correspondentes.
 * Esta é uma versão simplificada para a extensão VSCode, limitada aos pacotes Delégua.
 */
const MODULOS_DELEGUA: { [key: string]: string } = {
    'arquivos': '@designliquido/delegua-arquivos',
    'matematica': '@designliquido/delegua-matematica',
    'matemática': '@designliquido/delegua-matematica',
    'tempo': '@designliquido/delegua-tempo',
    'http': '@designliquido/delegua-http',
    'json': '@designliquido/delegua-json',
    'criptografia': '@designliquido/delegua-criptografia',
    'estatistica': '@designliquido/delegua-estatistica',
    'estatística': '@designliquido/delegua-estatistica',
    'fisica': '@designliquido/delegua-fisica',
    'física': '@designliquido/delegua-fisica'
};

/**
 * Verifica se um nome de módulo corresponde a um pacote Delégua conhecido.
 * @param nomeModulo Nome do módulo a verificar
 * @returns O nome do pacote npm correspondente ou false se não for encontrado
 */
export function verificarModulosDelegua(nomeModulo: string): string | false {
    if (nomeModulo in MODULOS_DELEGUA) {
        return MODULOS_DELEGUA[nomeModulo];
    }
    return false;
}

/**
 * Interface que representa um módulo Delégua carregado.
 */
export interface DeleguaModulo {
    componentes: { [nome: string]: any };
}

/**
 * Carrega uma biblioteca Delégua.
 *
 * NOTA: Esta é uma implementação simplificada para a extensão VSCode.
 * Diferentemente do delegua-node, esta versão não pode carregar dinamicamente
 * pacotes npm em tempo de execução.
 *
 * Para suporte completo de bibliotecas, seria necessário:
 * 1. Pré-empacotar as bibliotecas conhecidas na extensão, ou
 * 2. Fornecer um mecanismo de registro de bibliotecas
 *
 * @param nome Nome do pacote a carregar
 * @returns Um objeto DeleguaModulo com os componentes da biblioteca
 * @throws Error indicando que bibliotecas externas não são suportadas na versão web
 */
export function carregarBibliotecaDelegua(nome: string): DeleguaModulo {
    throw new Error(
        `Importação de bibliotecas externas ('${nome}') não é suportada na extensão VSCode para Web. ` +
        `Apenas arquivos .delegua podem ser importados no momento.`
    );
}
