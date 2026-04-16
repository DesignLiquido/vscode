import {
    AcessoMetodo,
    AvaliadorSintatico,
    Chamada,
    Classe,
    Comentario,
    Const,
    Construto,
    Declaracao,
    FuncaoDeclaracao,
    Literal,
    RetornoAvaliadorSintatico,
    RetornoLexador,
    SimboloInterface,
    Var,
    Variavel
} from "@designliquido/delegua";

import { InformacaoElementoSintatico } from "@designliquido/delegua/informacao-elemento-sintatico";
import { FuncaoPadrao } from "@designliquido/delegua/interpretador/estruturas";

import tiposDeSimbolos from "@designliquido/delegua/tipos-de-simbolos/delegua";

import * as vscode from "vscode";

import { ImportarBiblioteca, ModuloDeclaracoes } from "../construtos";
import { carregarBibliotecaDelegua, verificarModulosDelegua } from "../mecanismo-importacao-bibliotecas";
import { ClasseDeModulo } from "../interpretador/estruturas";
import { ImportadorExtensao } from "../importador";

export class AvaliadorSintaticoComImportacao extends AvaliadorSintatico {
    tiposDefinidosPorBibliotecas: {
        [nomeTipo: string]: ClasseDeModulo;
    };
    importador: ImportadorExtensao;
    arquivosImportados: string[];
    modoLair: boolean;
    diagnosticos?: vscode.DiagnosticCollection;
    contextoLiquidoHabilitado: boolean;

    constructor(importador: ImportadorExtensao) {
        super();
        this.tiposDefinidosPorBibliotecas = {};
        this.arquivosImportados = [];
        this.importador = importador;
        this.contextoLiquidoHabilitado = false;
    }

    definirContextoLiquido(habilitado: boolean): void {
        this.contextoLiquidoHabilitado = habilitado;
    }

    override async finalizarChamada(entidadeChamada: Construto, tipoPrimitiva?: string | undefined): Promise<Chamada> {
        const chamadaResolvida = await super.finalizarChamada(entidadeChamada, tipoPrimitiva);
        if (chamadaResolvida.entidadeChamada instanceof AcessoMetodo && chamadaResolvida.entidadeChamada.objeto.tipo === 'módulo') {
            // Espera-se que o módulo esteja devidamente registrado.
            const entidadeChamadaResolvida = chamadaResolvida.entidadeChamada as AcessoMetodo;
            const objetoEntidadeChamada = (entidadeChamadaResolvida.objeto as any);
            if (objetoEntidadeChamada && objetoEntidadeChamada.simbolo.lexema in this.primitivasConhecidas) {
                const moduloCorrespondente = this.primitivasConhecidas[objetoEntidadeChamada.simbolo.lexema];
                if (entidadeChamadaResolvida.nomeMetodo in moduloCorrespondente) {
                    const tipoResolvido = moduloCorrespondente[entidadeChamadaResolvida.nomeMetodo].tipo;
                    entidadeChamadaResolvida.tipoRetornoMetodo = tipoResolvido;
                    chamadaResolvida.tipo = tipoResolvido;
                }
            }
        }

        return chamadaResolvida;
    }

    protected importarFuncaoPadraoComoComponente(dadosComponente: any, nomeComponente: string) {
        const dadosComponenteResolvido = dadosComponente as FuncaoPadrao;
        const componente = new InformacaoElementoSintatico(
            nomeComponente,
            dadosComponenteResolvido.tipoRetorno || 'qualquer',
            true,
            []
        );

        if (dadosComponenteResolvido.argumentos) {
            for (const argumento of dadosComponenteResolvido.argumentos) {
                const elemento = new InformacaoElementoSintatico(argumento.nome, argumento.tipo);
                componente.subElementos.push(elemento as any);
            }
        }

        return componente;
    }

    protected criarComponenteDeClasse(nomeModulo: string, nome: string, classe: any): InformacaoElementoSintatico {
        const componente = new InformacaoElementoSintatico(nome, 'classe', false, []);

        // Processar métodos
        if (classe.metodos) {
            for (const [nomeMetodo, dadosMetodo] of Object.entries(classe.metodos)) {
                if (dadosMetodo instanceof FuncaoPadrao) {
                    const metodo = dadosMetodo as FuncaoPadrao;
                    const elemMetodo = new InformacaoElementoSintatico(
                        nomeMetodo,
                        metodo.tipoRetorno || 'qualquer',
                        true,
                        []
                    );

                    if (metodo.argumentos) {
                        for (const arg of metodo.argumentos) {
                            const argElem = new InformacaoElementoSintatico(
                                arg.nome,
                                arg.tipo
                            );
                            elemMetodo.subElementos.push(argElem as any);
                        }
                    }

                    componente.subElementos.push(elemMetodo as any);
                } else if (dadosMetodo instanceof ClasseDeModulo) {
                    // Método que retorna/é uma classe de módulo: recursão
                    const componenteDeClasseDerivado = this.criarComponenteDeClasse(nomeModulo, nomeMetodo, dadosMetodo);
                    this.primitivasConhecidas[nomeModulo][nomeMetodo] = componenteDeClasseDerivado;
                    componente.subElementos.push(componenteDeClasseDerivado as any);
                } else {
                    // Caso genérico: tentar inferir tipo
                    const tipoMetodo = (dadosMetodo && (dadosMetodo as any).tipoRetorno) || 'qualquer';
                    componente.subElementos.push(
                        new InformacaoElementoSintatico(nomeMetodo, tipoMetodo, true, []) as any
                    );
                }
            }
        }

        // Processar propriedades
        if (classe.propriedades) {
            for (const [nomeProp, dadosProp] of Object.entries(classe.propriedades)) {
                if (dadosProp instanceof ClasseDeModulo) {
                    const nested = this.criarComponenteDeClasse(nomeModulo, nomeProp, dadosProp);
                    // Registrar a classe interna também nas primitivas do módulo
                    this.primitivasConhecidas[nomeModulo][nomeProp] = nested;
                    componente.subElementos.push(nested as any);
                } else {
                    // Se for um descriptor simples ou tipo primitivo
                    const tipoProp = (dadosProp && (dadosProp as any).tipo) || (typeof dadosProp === 'string' ? dadosProp : 'qualquer');
                    componente.subElementos.push(
                        new InformacaoElementoSintatico(nomeProp, tipoProp, false, []) as any
                    );
                }
            }
        }

        return componente;
    };

    protected importarBibliotecaNode(literalCaminho: Literal): ImportarBiblioteca {
        const caminhoTexto = String(literalCaminho.valor);
        const bibliotecaResolvida = verificarModulosDelegua(caminhoTexto);
        if (bibliotecaResolvida) {
            const moduloResolvido = carregarBibliotecaDelegua(bibliotecaResolvida as string);

            this.primitivasConhecidas[caminhoTexto] = {};
            for (const [nomeComponente, dadosComponente] of Object.entries(moduloResolvido.componentes)) {
                // TODO: Verificar se sempre é o caso de ser função padrão.
                let componente;
                if (dadosComponente instanceof FuncaoPadrao) {
                    componente = this.importarFuncaoPadraoComoComponente(dadosComponente, nomeComponente);
                } else if (dadosComponente instanceof ClasseDeModulo) {
                    const classeModulo = dadosComponente as ClasseDeModulo;

                    componente = this.criarComponenteDeClasse(caminhoTexto, nomeComponente, classeModulo);
                    // Registrar também a própria classe (a atribuição ao mapa acontece mais adiante,
                    // mas garantir que exista agora caso recursão precise dela)
                    this.primitivasConhecidas[caminhoTexto] = this.primitivasConhecidas[caminhoTexto] || {};
                    this.primitivasConhecidas[caminhoTexto][nomeComponente] = componente;
                    this.tiposDefinidosPorBibliotecas[nomeComponente] = classeModulo;

                } else {
                    throw this.erro({
                        hashArquivo: literalCaminho.hashArquivo, linha: literalCaminho.linha
                    } as SimboloInterface,
                        `Tipo de importação inválida: ${JSON.stringify(dadosComponente)}.`
                    );
                }

                this.primitivasConhecidas[caminhoTexto][nomeComponente] = componente;
            }
        }

        return new ImportarBiblioteca(
            literalCaminho.hashArquivo,
            literalCaminho.linha,
            caminhoTexto
        );
    }

    protected async logicaComumImportacaoModulo(literalCaminho: Literal, simboloReferencia: SimboloInterface): Promise<ModuloDeclaracoes> {
        const caminhoTexto = String(literalCaminho.valor);
        const diretorioBaseAnterior = this.importador.diretorioBase;
        const resultadoImportacao = await this.importador.importar(
            caminhoTexto,
            literalCaminho.hashArquivo
        );

        // Havendo erros no lexador, levantamos um erro de avaliação sintática na
        // importação.
        if (resultadoImportacao.retornoLexador.erros.length > 0) {
            throw this.erro(
                simboloReferencia,
                `Erros encontrados ao importar o arquivo ${caminhoTexto
                }: ${resultadoImportacao.retornoLexador.erros.reduce(
                    (acumulado, proximo) =>
                        (acumulado += proximo.mensagem + "; "),
                    ""
                )}`
            );
        }

        const avaliadorSintaticoModulo = new AvaliadorSintaticoComImportacao(
            this.importador
        );
        const resultadoAvaliacaoSintaticaModulo =
            await avaliadorSintaticoModulo.analisar(
                resultadoImportacao.retornoLexador,
                resultadoImportacao.hashArquivo,
                this.arquivosImportados
            );

        this.arquivosImportados.push(caminhoTexto);

        const definicoesClasse =
            resultadoAvaliacaoSintaticaModulo.declaracoes.filter(
                (d) => d.constructor === Classe
            ) as Classe[];

        for (const definicaoClasse of definicoesClasse) {
            this.tiposDefinidosEmCodigo[definicaoClasse.simbolo.lexema] =
                definicaoClasse;
        }

        // Referências de funções registradas no avaliador sintático do módulo importado
        // precisam ser registradas também no avaliador sintático atual.
        for (const elementoPilha of avaliadorSintaticoModulo.pilhaEscopos.pilha) {
            for (const referenciaFuncao of Object.entries(elementoPilha.referenciasFuncoes)) {
                this.pilhaEscopos.registrarReferenciaFuncao(
                    referenciaFuncao[0],
                    referenciaFuncao[1]
                );

                const variavelCorrespondente = elementoPilha.elementosSintaticos[referenciaFuncao[0]];
                if (!variavelCorrespondente) {
                    throw this.erro(
                        simboloReferencia,
                        `Erro interno na importação do módulo '${literalCaminho.valor}': a função '${referenciaFuncao[0]}' não foi encontrada entre as variáveis do escopo.`
                    );
                }

                this.pilhaEscopos.definirInformacoesVariavel(
                    referenciaFuncao[0],
                    new InformacaoElementoSintatico(
                        referenciaFuncao[0],
                        variavelCorrespondente.tipo,
                        true,
                        []
                    )
                );
            }
        }

        this.importador.diretorioBase = diretorioBaseAnterior;

        return new ModuloDeclaracoes(
            simboloReferencia.linha,
            simboloReferencia.hashArquivo,
            resultadoAvaliacaoSintaticaModulo.declaracoes
        );
    }

    /**
     * Quando válida, devolve a resolução do módulo como construto. 
     * Normalmente usada na importação dinâmica, ou seja, `var algumaCoisa = importar('caminho')`.
     */
    protected override async construtoImportar(): Promise<any> {
        const simboloAbertura = this.consumir(
            tiposDeSimbolos.PARENTESE_ESQUERDO,
            "Esperado '(' após declaração."
        );
        const caminho = await this.expressao();
        this.consumir(
            tiposDeSimbolos.PARENTESE_DIREITO,
            "Esperado ')' após declaração."
        );

        // Chegando aqui sem erros, a importação é sintaticamente válida.
        const literalCaminho = caminho as Literal;
        if (!String(literalCaminho.valor).endsWith('.delegua')) {
            return this.importarBibliotecaNode(literalCaminho);
        }

        return await this.logicaComumImportacaoModulo(literalCaminho, simboloAbertura);
    }

    protected localizarDeclaracaoPorNomeEmModulo(
        moduloDeclaracoes: ModuloDeclaracoes,
        nome: string,
        simboloReferencia:
            SimboloInterface
    ): [string, Declaracao] {
        for (const declaracao of moduloDeclaracoes.declaracoes) {
            switch (declaracao.constructor) {
                case Classe:
                    const declaracaoClasse = declaracao as Classe;
                    if (declaracaoClasse.simbolo.lexema === nome) {
                        return [declaracaoClasse.simbolo.lexema, declaracaoClasse];
                    }
                    break;
                case Comentario:
                    continue;
                case Const:
                    const declaracaoConst = declaracao as Const;
                    if (declaracaoConst.simbolo.lexema === nome) {
                        return [declaracaoConst.tipo, declaracaoConst];
                    }
                    break;
                case FuncaoDeclaracao:
                    const declaracaoFuncao = declaracao as FuncaoDeclaracao;
                    if (declaracaoFuncao.simbolo.lexema === nome) {
                        return [declaracaoFuncao.tipo, declaracaoFuncao];
                    }
                    break;
                case Var:
                    const declaracaoVar = declaracao as Var;
                    if (declaracaoVar.simbolo.lexema === nome) {
                        return [declaracaoVar.tipo, declaracaoVar];
                    }
                    break;
                default:
                    console.warn(`Declaração de tipo desconhecido na importação estruturada: ${declaracao.constructor.name}.`);
                    break;
            }
        }

        throw this.erro(
            simboloReferencia,
            `O elemento '${nome}' não foi encontrado no módulo importado.`
        );
    }

    /**
     * Quando válida, devolve a resolução do módulo como declaração de constante. 
     * Normalmente usada na importação estruturada, ou seja, `importar tudo de 'caminho'`, 
     * ou então `importar { algo, outro } de 'caminho'`.
     * @returns 
     */
    override async declaracaoImportar(): Promise<any> {
        const declaracaoResolvida = await super.declaracaoImportar();

        const literalCaminho = declaracaoResolvida.caminho as Literal;
        if (declaracaoResolvida.simboloTudo !== null && declaracaoResolvida.simboloTudo !== undefined) {
            if (!String(literalCaminho.valor).endsWith('.delegua')) {
                this.pilhaEscopos.definirInformacoesVariavel(
                    declaracaoResolvida.simboloTudo.lexema,
                    new InformacaoElementoSintatico(declaracaoResolvida.simboloTudo.lexema, 'módulo')
                );
                return new Const(
                    declaracaoResolvida.simboloTudo,
                    this.importarBibliotecaNode(literalCaminho),
                    'módulo',
                    true,
                    declaracaoResolvida.decoradores
                );
            }

            const moduloDeclaracoes = await this.logicaComumImportacaoModulo(literalCaminho, declaracaoResolvida.simboloTudo);
            this.pilhaEscopos.definirInformacoesVariavel(
                declaracaoResolvida.simboloTudo.lexema,
                new InformacaoElementoSintatico(declaracaoResolvida.simboloTudo.lexema, 'módulo')
            );

            return new Const(
                declaracaoResolvida.simboloTudo,
                moduloDeclaracoes,
                'módulo',
                true,
                declaracaoResolvida.decoradores
            );
        }

        if (declaracaoResolvida.elementosImportacao.length === 0) {
            throw this.erro(
                { hashArquivo: literalCaminho.hashArquivo, linha: literalCaminho.linha } as SimboloInterface,
                "Erro interno na importação estruturada: nenhum elemento para importar."
            );
        }

        // No caso da desestruturação de valores de módulo, criamos um nome provisório para o módulo
        // e uma declaração de constante para cada nome mencionado na desestruturação.
        const moduloDeclaracoes = await this.logicaComumImportacaoModulo(literalCaminho, declaracaoResolvida.elementosImportacao[0]);
        const constantesImportadas: Const[] = [];
        const nomeReservadoModulo = `${literalCaminho.hashArquivo}_${literalCaminho.linha}_modulo`;
        const simboloReservadoModulo = { lexema: nomeReservadoModulo, hashArquivo: literalCaminho.hashArquivo, linha: literalCaminho.linha } as SimboloInterface;
        constantesImportadas.push(
            new Const(
                simboloReservadoModulo,
                moduloDeclaracoes,
                'módulo',
                true,
                declaracaoResolvida.decoradores
            )
        );

        for (const simboloImportacao of declaracaoResolvida.elementosImportacao) {
            const declaracaoCorrespondente = this.localizarDeclaracaoPorNomeEmModulo(
                moduloDeclaracoes,
                simboloImportacao.lexema,
                simboloImportacao
            );

            this.pilhaEscopos.definirInformacoesVariavel(
                simboloImportacao.lexema,
                new InformacaoElementoSintatico(simboloImportacao.lexema, declaracaoCorrespondente[0])
            );

            constantesImportadas.push(
                new Const(
                    simboloImportacao,
                    new AcessoMetodo(
                        simboloImportacao.hashArquivo,
                        new Variavel(
                            simboloImportacao.hashArquivo,
                            simboloReservadoModulo,
                            'módulo'
                        ),
                        simboloImportacao.lexema
                    ),
                    declaracaoCorrespondente[0],
                    true,
                    []
                )
            );
        }

        return constantesImportadas;
    }

    /**
     * No modo LAIR, a pilha de escopos não deve ser reinicializada a cada execução.
     * @returns Nada.
     */
    protected override inicializarPilhaEscopos(): void {
        if (this.modoLair && !this.pilhaEscopos.eVazio()) {
            return;
        }

        super.inicializarPilhaEscopos();

        if (this.contextoLiquidoHabilitado) {
            this.tiposDeFerramentasExternas = {
                ...this.tiposDeFerramentasExternas,
                liquido: {
                    lincones: 'módulo',
                    liquido: 'módulo',
                    requisicao: 'módulo',
                    resposta: 'módulo'
                }
            };

            this.pilhaEscopos.definirInformacoesVariavel('liquido', new InformacaoElementoSintatico('liquido', 'módulo'));
            this.pilhaEscopos.definirInformacoesVariavel('requisicao', new InformacaoElementoSintatico('requisicao', 'módulo'));
            this.pilhaEscopos.definirInformacoesVariavel('resposta', new InformacaoElementoSintatico('resposta', 'módulo'));
        }
    }

    /**
     * Pré-carrega classes marcadas com `@definicao` a partir de arquivos `.delegua`
     * fornecidos por bibliotecas instaladas. Isso permite que superclasses como
     * `Modelo` e `Migracao` sejam reconhecidas pelo avaliador sintático sem que o
     * desenvolvedor precise importá-las explicitamente no código.
     * @param caminhos Lista de caminhos absolutos para arquivos `.delegua` de definição.
     */
    async preCarregarDefinicoes(caminhos: string[]): Promise<void> {
        for (const caminho of caminhos) {
            try {
                const resultadoImportacao = await this.importador.importar(caminho, 0);
                if (resultadoImportacao.retornoLexador.erros.length > 0) {
                    continue;
                }

                const avaliadorModulo = new AvaliadorSintaticoComImportacao(this.importador);
                const resultadoAvaliacao = await avaliadorModulo.analisar(
                    resultadoImportacao.retornoLexador,
                    resultadoImportacao.hashArquivo,
                    this.arquivosImportados
                );

                const classesDefinicao = resultadoAvaliacao.declaracoes.filter(
                    (d) => d.constructor === Classe
                ) as Classe[];

                for (const classeDefinicao of classesDefinicao) {
                    (classeDefinicao as any).caminhoArquivoDefinicao = caminho;
                    this.tiposDefinidosEmCodigo[classeDefinicao.simbolo.lexema] = classeDefinicao;
                }
            } catch (erro: any) {
                // Erros ao pré-carregar definições não devem interromper a análise do arquivo atual.
                if (this.diagnosticos) {
                    const mensagem = erro?.message ?? String(erro);
                    const uri = vscode.Uri.file(caminho);
                    this.diagnosticos.set(uri, [
                        new vscode.Diagnostic(
                            new vscode.Range(0, 0, 0, 0),
                            mensagem,
                            vscode.DiagnosticSeverity.Warning
                        )
                    ]);
                }
            }
        }
    }

    override async analisar(
        retornoLexador: RetornoLexador<SimboloInterface>,
        hashArquivo: number,
        arquivosImportados?: string[]
    ): Promise<RetornoAvaliadorSintatico<Declaracao>> {
        this.arquivosImportados = arquivosImportados || [];
        return super.analisar(retornoLexador, hashArquivo);
    }
}
