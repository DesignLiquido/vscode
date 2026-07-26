import { DeleguaModulo, FuncaoPadrao } from '@designliquido/delegua/interpretador/estruturas';

// Fábrica de WebviewPanel injetada pela extensão em activate()
let _fabricaPainelWebView: (() => any) | null = null;

/**
 * Registra a fábrica de WebviewPanel do VS Code usada pela biblioteca InterfaceGrafica.
 * Deve ser chamada em activate() antes de qualquer execução de programa Delégua.
 */
export const definirFabricaPainelWebView = (fabrica: () => any): void => {
    _fabricaPainelWebView = fabrica;
};

function carregarBibliotecaInterfaceGrafica(): DeleguaModulo {
    if (!_fabricaPainelWebView) {
        throw new Error(
            'InterfaceGrafica: fábrica de painel não registrada. ' +
            'Chame definirFabricaPainelWebView() no activate() da extensão.'
        );
    }

    const { InfraestruturaWebView, InterfaceGrafica } = require('@designliquido/delegua-interface-grafica') as typeof import('@designliquido/delegua-interface-grafica');

    const infraestrutura = new InfraestruturaWebView(_fabricaPainelWebView());
    const ig = new InterfaceGrafica(infraestrutura);

    const modulo = new DeleguaModulo('InterfaceGrafica');
    modulo.componentes = {
        janela:          new FuncaoPadrao(3, ig.janela.bind(ig)),
        botao:           new FuncaoPadrao(2, ig.botao.bind(ig)),
        rotulo:          new FuncaoPadrao(2, ig.rotulo.bind(ig)),
        caixaTexto:      new FuncaoPadrao(2, ig.caixaTexto.bind(ig)),
        caixaVertical:   new FuncaoPadrao(1, ig.caixaVertical.bind(ig)),
        caixaHorizontal: new FuncaoPadrao(1, ig.caixaHorizontal.bind(ig)),
        definirTexto:    new FuncaoPadrao(2, ig.definirTexto.bind(ig)),
        obterTexto:      new FuncaoPadrao(1, ig.obterTexto.bind(ig)),
        aoClicar:        new FuncaoPadrao(2, ig.aoClicar.bind(ig)),
        aoAlterar:       new FuncaoPadrao(2, ig.aoAlterar.bind(ig)),
        iniciar:         new FuncaoPadrao(0, ig.iniciar.bind(ig)),
        encerrar:        new FuncaoPadrao(0, ig.encerrar.bind(ig)),
    };
    return modulo;
}

/**
 * Formato de definição de função usado pelos pacotes `@designliquido/delegua-*`
 * em seus arquivos `delegua-modulo`, consumido por ferramentas de documentação/completude
 * e, aqui, para gerar componentes chamáveis em tempo de execução.
 */
interface DefinicaoFuncaoBiblioteca {
    funcao: (...argumentos: any[]) => any;
    argumentos: unknown[];
}

/**
 * Converte um objeto de definições no formato `DeleguaModuloXxx` (exportado pelos
 * pacotes de biblioteca padrão) em um `DeleguaModulo` executável, derivando a aridade
 * de cada função a partir do tamanho de `argumentos`.
 */
function converterDefinicoesParaDeleguaModulo(
    nomeModulo: string,
    definicoes: Record<string, DefinicaoFuncaoBiblioteca>
): DeleguaModulo {
    const modulo = new DeleguaModulo(nomeModulo);
    modulo.componentes = {};
    for (const [nomeComponente, definicao] of Object.entries(definicoes)) {
        modulo.componentes[nomeComponente] = new FuncaoPadrao(definicao.argumentos.length, definicao.funcao);
    }
    return modulo;
}

/**
 * Bibliotecas padrão sem dependências diretas de Node.js (sem `fs`/`path`/rede),
 * portanto seguras para carregar diretamente tanto na extensão desktop quanto na web.
 * Cada pacote expõe suas definições de função em um submódulo `delegua-modulo`,
 * no formato consumido por `converterDefinicaoParaDeleguaModulo`.
 */
function carregarBibliotecaTempo(): DeleguaModulo {
    const { DeleguaModuloTempo } = require('@designliquido/delegua-tempo/delegua-modulo') as typeof import('@designliquido/delegua-tempo/delegua-modulo');
    return converterDefinicoesParaDeleguaModulo('tempo', DeleguaModuloTempo);
}

function carregarBibliotecaCsv(): DeleguaModulo {
    const { DeleguaModuloCsv } = require('@designliquido/delegua-csv/delegua-modulo') as typeof import('@designliquido/delegua-csv/delegua-modulo');
    return converterDefinicoesParaDeleguaModulo('csv', DeleguaModuloCsv);
}

function carregarBibliotecaCriptografia(): DeleguaModulo {
    const { DeleguaModuloCriptografia } = require('@designliquido/delegua-criptografia/delegua-modulo') as typeof import('@designliquido/delegua-criptografia/delegua-modulo');
    return converterDefinicoesParaDeleguaModulo('criptografia', DeleguaModuloCriptografia);
}

/**
 * Bibliotecas padrão já com suporte a carregamento nesta extensão, indexadas pelo
 * nome do pacote npm (o mesmo valor retornado por `verificarModulosDelegua`).
 * Bibliotecas ausentes deste mapa (ex.: `arquivos`, `json`, `imagens`) dependem de
 * acesso a sistema de arquivos e ainda não têm uma implementação compatível com a
 * API do VSCode/regra de não usar `fs`/`path` diretamente.
 */
const CARREGADORES_BIBLIOTECAS_SEM_DEPENDENCIA_NODE: { [pacoteNpm: string]: () => DeleguaModulo } = {
    '@designliquido/delegua-tempo': carregarBibliotecaTempo,
    '@designliquido/delegua-csv': carregarBibliotecaCsv,
    '@designliquido/delegua-criptografia': carregarBibliotecaCriptografia,
};

/**
 * Mapeamento de nomes de módulos Delégua para seus pacotes npm correspondentes.
 * Esta é uma versão simplificada para a extensão VSCode, limitada aos pacotes Delégua.
 */
const MODULOS_DELEGUA: { [key: string]: string } = {
    'arquivos': '@designliquido/delegua-arquivos',
    'criptografia': '@designliquido/delegua-criptografia',
    'csv': '@designliquido/delegua-csv',
    'estatistica': '@designliquido/delegua-estatistica',
    'estatística': '@designliquido/delegua-estatistica',
    'fisica': '@designliquido/delegua-fisica',
    'física': '@designliquido/delegua-fisica',
    'http': '@designliquido/delegua-http',
    'json': '@designliquido/delegua-json',
    'matematica': '@designliquido/delegua-matematica',
    'matemática': '@designliquido/delegua-matematica',
    'tempo': '@designliquido/delegua-tempo',
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
    const nomeNormalizado = nome.toLowerCase();

    if (nomeNormalizado === 'interfacegrafica') {
        return carregarBibliotecaInterfaceGrafica();
    }

    // `nome` chega em dois formatos diferentes dependendo do chamador: o nome curto
    // digitado pelo usuário (ex.: 'tempo', durante execução) ou o nome do pacote npm
    // já resolvido por `verificarModulosDelegua` (ex.: '@designliquido/delegua-tempo',
    // durante análise semântica). Tentamos resolver o nome curto; se não for um, ele
    // já deve ser o nome do pacote.
    const nomePacote = verificarModulosDelegua(nomeNormalizado) || nomeNormalizado;

    const carregador = CARREGADORES_BIBLIOTECAS_SEM_DEPENDENCIA_NODE[nomePacote];
    if (carregador) {
        return carregador();
    }

    throw new Error(
        `Importação de bibliotecas externas ('${nome}') não é suportada na extensão VSCode para Web. ` +
        `Apenas arquivos .delegua podem ser importados no momento.`
    );
}
