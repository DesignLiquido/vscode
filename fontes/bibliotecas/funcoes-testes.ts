import { FuncaoNativaOuMetodoPrimitiva } from './tipos';

export const funcoesModuloTestesDelegua: FuncaoNativaOuMetodoPrimitiva[] = [
    {
        nome: 'grupo',
        assinaturas: [
            {
                formato: 'grupo(nome: texto, funcao: função)',
                parametros: [
                    {
                        nome: 'nome',
                        documentacao: 'Nome do grupo (suíte) de testes.'
                    },
                    {
                        nome: 'funcao',
                        documentacao: 'Função contendo os testes e subgrupos deste grupo.'
                    }
                ]
            }
        ],
        documentacao:
            '### grupo\n\n' +
            'Define um grupo (suíte) de testes. Grupos podem ser aninhados — o nome hierárquico é separado por ` > `.\n\n' +
            '### Exemplo de Código\n\n' +
            '```delegua\nimportar "testes"\n\n' +
            'testes.grupo("Calculadora", funcao() {\n' +
            '    testes.teste("soma positiva", funcao() {\n' +
            '        testes.afirmar.igual(2 + 2, 4)\n' +
            '    })\n' +
            '})\n```',
        exemploCodigo: 'testes.grupo(nome: texto, funcao: função)'
    },
    {
        nome: 'teste',
        assinaturas: [
            {
                formato: 'teste(nome: texto, funcao: função)',
                parametros: [
                    {
                        nome: 'nome',
                        documentacao: 'Nome do caso de teste.'
                    },
                    {
                        nome: 'funcao',
                        documentacao: 'Função contendo as assertivas do teste.'
                    }
                ]
            }
        ],
        documentacao:
            '### teste\n\n' +
            'Define um caso de teste individual. Registra o resultado como `passou` ou `falhou`.\n\n' +
            '### Exemplo de Código\n\n' +
            '```delegua\nimportar "testes"\n\n' +
            'testes.teste("deve somar corretamente", funcao() {\n' +
            '    testes.afirmar.igual(1 + 1, 2)\n' +
            '})\n```',
        exemploCodigo: 'testes.teste(nome: texto, funcao: função)'
    },
    {
        nome: 'lancarErro',
        assinaturas: [
            {
                formato: 'lancarErro(mensagem: texto)',
                parametros: [
                    {
                        nome: 'mensagem',
                        documentacao: 'Mensagem do erro de assertiva a ser lançado.'
                    }
                ]
            }
        ],
        documentacao:
            '### lancarErro\n\n' +
            'Lança um `ErroDeAssertiva` com a mensagem informada, reprovando o teste imediatamente.\n\n' +
            '### Exemplo de Código\n\n' +
            '```delegua\nimportar "testes"\n\n' +
            'testes.teste("falha proposital", funcao() {\n' +
            '    testes.lancarErro("Esta situação não deveria ocorrer.")\n' +
            '})\n```',
        exemploCodigo: 'testes.lancarErro(mensagem: texto)'
    },
    {
        nome: 'afirmar',
        assinaturas: [],
        documentacao:
            '### afirmar\n\n' +
            'Submódulo com funções de assertiva: `igual`, `diferente`, `verdadeiro`, `falso`, `nulo`, `erro`.',
        exemploCodigo: 'testes.afirmar'
    },
    {
        nome: 'antesDeCada',
        assinaturas: [
            {
                formato: 'antesDeCada(funcao: função)',
                parametros: [
                    {
                        nome: 'funcao',
                        documentacao: 'Função executada antes de cada teste no grupo atual.'
                    }
                ]
            }
        ],
        documentacao:
            '### antesDeCada\n\n' +
            'Registra um hook executado antes de cada `teste` no grupo corrente. Suporta aninhamento de grupos.\n\n' +
            '### Exemplo de Código\n\n' +
            '```delegua\nimportar { afirmar, teste, grupo, antesDeCada } de "testes"\n\n' +
            'grupo("Suite", funcao() {\n' +
            '    var contador = 0\n' +
            '    antesDeCada(funcao() { contador = contador + 1 })\n' +
            '    teste("t1", funcao() { afirmar.igual(1, contador) })\n' +
            '    teste("t2", funcao() { afirmar.igual(2, contador) })\n' +
            '})\n```',
        exemploCodigo: 'antesDeCada(funcao: função)'
    },
    {
        nome: 'antesDeTodos',
        assinaturas: [
            {
                formato: 'antesDeTodos(funcao: função)',
                parametros: [
                    {
                        nome: 'funcao',
                        documentacao: 'Função executada uma única vez antes de todos os testes do grupo.'
                    }
                ]
            }
        ],
        documentacao:
            '### antesDeTodos\n\n' +
            'Registra um hook executado uma única vez antes de todos os `teste`s no grupo corrente.\n\n' +
            '### Exemplo de Código\n\n' +
            '```delegua\nimportar { afirmar, teste, grupo, antesDeTodos } de "testes"\n\n' +
            'grupo("Suite", funcao() {\n' +
            '    var executou = 0\n' +
            '    antesDeTodos(funcao() { executou = executou + 1 })\n' +
            '    teste("t1", funcao() { afirmar.igual(1, executou) })\n' +
            '    teste("t2", funcao() { afirmar.igual(1, executou) })\n' +
            '})\n```',
        exemploCodigo: 'antesDeTodos(funcao: função)'
    },
    {
        nome: 'depoisDeCada',
        assinaturas: [
            {
                formato: 'depoisDeCada(funcao: função)',
                parametros: [
                    {
                        nome: 'funcao',
                        documentacao: 'Função executada após cada teste no grupo atual.'
                    }
                ]
            }
        ],
        documentacao:
            '### depoisDeCada\n\n' +
            'Registra um hook executado após cada `teste` no grupo corrente. Suporta aninhamento de grupos.\n\n' +
            '### Exemplo de Código\n\n' +
            '```delegua\nimportar { afirmar, teste, grupo, depoisDeCada } de "testes"\n\n' +
            'grupo("Suite", funcao() {\n' +
            '    var contador = 0\n' +
            '    depoisDeCada(funcao() { contador = contador + 1 })\n' +
            '    teste("t1", funcao() { afirmar.igual(0, contador) })\n' +
            '    teste("t2", funcao() { afirmar.igual(1, contador) })\n' +
            '})\n```',
        exemploCodigo: 'depoisDeCada(funcao: função)'
    },
    {
        nome: 'depoisDeTodos',
        assinaturas: [
            {
                formato: 'depoisDeTodos(funcao: função)',
                parametros: [
                    {
                        nome: 'funcao',
                        documentacao: 'Função executada uma única vez após todos os testes do grupo.'
                    }
                ]
            }
        ],
        documentacao:
            '### depoisDeTodos\n\n' +
            'Registra um hook executado uma única vez após todos os `teste`s no grupo corrente.\n\n' +
            '### Exemplo de Código\n\n' +
            '```delegua\nimportar { afirmar, teste, grupo, depoisDeTodos } de "testes"\n\n' +
            'grupo("Suite", funcao() {\n' +
            '    var executou = 0\n' +
            '    depoisDeTodos(funcao() { executou = executou + 1 })\n' +
            '    teste("t1", funcao() { afirmar.igual(0, executou) })\n' +
            '    teste("t2", funcao() { afirmar.igual(0, executou) })\n' +
            '})\n```',
        exemploCodigo: 'depoisDeTodos(funcao: função)'
    }
];

export const funcoesSubMetodosTeste: FuncaoNativaOuMetodoPrimitiva[] = [
    {
        nome: 'pular',
        assinaturas: [
            {
                formato: 'teste.pular(nome: texto, funcao: função)',
                parametros: [
                    {
                        nome: 'nome',
                        documentacao: 'Nome do caso de teste a ser pulado.'
                    },
                    {
                        nome: 'funcao',
                        documentacao: 'Função do teste — não será executada.'
                    }
                ]
            }
        ],
        documentacao:
            '### teste.pular\n\n' +
            'Registra o teste como `pulado` sem executá-lo. Útil para desabilitar temporariamente um caso de teste.\n\n' +
            '### Exemplo de Código\n\n' +
            '```delegua\nimportar { afirmar, teste, grupo } de "testes"\n\n' +
            'grupo("Suite", funcao() {\n' +
            '    teste.pular("pendente", funcao() { afirmar.igual(1, 2) })\n' +
            '    teste("normal", funcao() { afirmar.verdadeiro(verdadeiro) })\n' +
            '})\n```',
        exemploCodigo: 'teste.pular(nome: texto, funcao: função)'
    },
    {
        nome: 'apenas',
        assinaturas: [
            {
                formato: 'teste.apenas(nome: texto, funcao: função)',
                parametros: [
                    {
                        nome: 'nome',
                        documentacao: 'Nome do caso de teste focado.'
                    },
                    {
                        nome: 'funcao',
                        documentacao: 'Função contendo as assertivas do teste focado.'
                    }
                ]
            }
        ],
        documentacao:
            '### teste.apenas\n\n' +
            'Marca o teste como focado: dentro do grupo, apenas testes com `.apenas` serão executados; os demais são ignorados.\n\n' +
            '### Exemplo de Código\n\n' +
            '```delegua\nimportar { afirmar, teste, grupo } de "testes"\n\n' +
            'grupo("Suite", funcao() {\n' +
            '    teste.apenas("focado", funcao() { afirmar.verdadeiro(verdadeiro) })\n' +
            '    teste("ignorado", funcao() { afirmar.igual(1, 2) })\n' +
            '})\n```',
        exemploCodigo: 'teste.apenas(nome: texto, funcao: função)'
    }
];

export const funcoesSubMetodosGrupo: FuncaoNativaOuMetodoPrimitiva[] = [
    {
        nome: 'pular',
        assinaturas: [
            {
                formato: 'grupo.pular(nome: texto, funcao: função)',
                parametros: [
                    {
                        nome: 'nome',
                        documentacao: 'Nome do grupo a ser pulado.'
                    },
                    {
                        nome: 'funcao',
                        documentacao: 'Função contendo os testes do grupo — não será executada.'
                    }
                ]
            }
        ],
        documentacao:
            '### grupo.pular\n\n' +
            'Pula o grupo inteiro sem executar nenhum de seus testes.\n\n' +
            '### Exemplo de Código\n\n' +
            '```delegua\nimportar { afirmar, teste, grupo } de "testes"\n\n' +
            'grupo.pular("Ignorado", funcao() {\n' +
            '    teste("nunca roda", funcao() { afirmar.igual(1, 2) })\n' +
            '})\n' +
            'grupo("Normal", funcao() {\n' +
            '    teste("roda", funcao() { afirmar.verdadeiro(verdadeiro) })\n' +
            '})\n```',
        exemploCodigo: 'grupo.pular(nome: texto, funcao: função)'
    },
    {
        nome: 'apenas',
        assinaturas: [
            {
                formato: 'grupo.apenas(nome: texto, funcao: função)',
                parametros: [
                    {
                        nome: 'nome',
                        documentacao: 'Nome do grupo focado.'
                    },
                    {
                        nome: 'funcao',
                        documentacao: 'Função contendo os testes do grupo focado.'
                    }
                ]
            }
        ],
        documentacao:
            '### grupo.apenas\n\n' +
            'Marca o grupo como focado: dentro do grupo pai, apenas grupos com `.apenas` serão executados; os demais são ignorados.\n\n' +
            '### Exemplo de Código\n\n' +
            '```delegua\nimportar { afirmar, teste, grupo } de "testes"\n\n' +
            'grupo("Suite pai", funcao() {\n' +
            '    grupo.apenas("Focado", funcao() {\n' +
            '        teste("roda", funcao() { afirmar.verdadeiro(verdadeiro) })\n' +
            '    })\n' +
            '    grupo("Ignorado", funcao() {\n' +
            '        teste("nunca roda", funcao() { afirmar.igual(1, 2) })\n' +
            '    })\n' +
            '})\n```',
        exemploCodigo: 'grupo.apenas(nome: texto, funcao: função)'
    }
];

export const funcoesAfirmar: FuncaoNativaOuMetodoPrimitiva[] = [
    {
        nome: 'igual',
        assinaturas: [
            {
                formato: 'igual(esperado: qualquer, obtido: qualquer)',
                parametros: [
                    {
                        nome: 'esperado',
                        documentacao: 'Valor esperado.'
                    },
                    {
                        nome: 'obtido',
                        documentacao: 'Valor obtido pela expressão testada.'
                    }
                ]
            }
        ],
        documentacao:
            '### afirmar.igual\n\n' +
            'Verifica igualdade estrita (`===`) entre `esperado` e `obtido`.\n\n' +
            'Em caso de falha: `"Esperava {esperado}, mas obteve {obtido}."`\n\n' +
            '### Exemplo de Código\n\n' +
            '```delegua\ntestes.afirmar.igual(4, 2 + 2)\n```',
        exemploCodigo: 'testes.afirmar.igual(esperado: qualquer, obtido: qualquer)'
    },
    {
        nome: 'diferente',
        assinaturas: [
            {
                formato: 'diferente(valorA: qualquer, valorB: qualquer)',
                parametros: [
                    {
                        nome: 'valorA',
                        documentacao: 'Primeiro valor.'
                    },
                    {
                        nome: 'valorB',
                        documentacao: 'Segundo valor (deve ser diferente de valorA).'
                    }
                ]
            }
        ],
        documentacao:
            '### afirmar.diferente\n\n' +
            'Verifica desigualdade estrita (`!==`) entre `valorA` e `valorB`.\n\n' +
            'Em caso de falha: `"Esperava valores diferentes, mas ambos são {valor}."`\n\n' +
            '### Exemplo de Código\n\n' +
            '```delegua\ntestes.afirmar.diferente(1, 2)\n```',
        exemploCodigo: 'testes.afirmar.diferente(valorA: qualquer, valorB: qualquer)'
    },
    {
        nome: 'verdadeiro',
        assinaturas: [
            {
                formato: 'verdadeiro(valor: qualquer)',
                parametros: [
                    {
                        nome: 'valor',
                        documentacao: 'Valor que deve ser verdadeiro (truthy).'
                    }
                ]
            }
        ],
        documentacao:
            '### afirmar.verdadeiro\n\n' +
            'Verifica se `valor` é verdadeiro (truthy).\n\n' +
            'Em caso de falha: `"Esperava verdadeiro, mas obteve {valor}."`\n\n' +
            '### Exemplo de Código\n\n' +
            '```delegua\ntestes.afirmar.verdadeiro(1 > 0)\n```',
        exemploCodigo: 'testes.afirmar.verdadeiro(valor: qualquer)'
    },
    {
        nome: 'falso',
        assinaturas: [
            {
                formato: 'falso(valor: qualquer)',
                parametros: [
                    {
                        nome: 'valor',
                        documentacao: 'Valor que deve ser falso (falsy).'
                    }
                ]
            }
        ],
        documentacao:
            '### afirmar.falso\n\n' +
            'Verifica se `valor` é falso (falsy).\n\n' +
            'Em caso de falha: `"Esperava falso, mas obteve {valor}."`\n\n' +
            '### Exemplo de Código\n\n' +
            '```delegua\ntestes.afirmar.falso(0 > 1)\n```',
        exemploCodigo: 'testes.afirmar.falso(valor: qualquer)'
    },
    {
        nome: 'nulo',
        assinaturas: [
            {
                formato: 'nulo(valor: qualquer)',
                parametros: [
                    {
                        nome: 'valor',
                        documentacao: 'Valor que deve ser nulo ou indefinido.'
                    }
                ]
            }
        ],
        documentacao:
            '### afirmar.nulo\n\n' +
            'Verifica se `valor` é `nulo` ou indefinido.\n\n' +
            'Em caso de falha: `"Esperava nulo, mas obteve {valor}."`\n\n' +
            '### Exemplo de Código\n\n' +
            '```delegua\ntestes.afirmar.nulo(nulo)\n```',
        exemploCodigo: 'testes.afirmar.nulo(valor: qualquer)'
    },
    {
        nome: 'erro',
        assinaturas: [
            {
                formato: 'erro(funcao: função)',
                parametros: [
                    {
                        nome: 'funcao',
                        documentacao: 'Função que deve lançar um erro ao ser executada.'
                    }
                ]
            }
        ],
        documentacao:
            '### afirmar.erro\n\n' +
            'Verifica se `funcao` lança um erro ao ser executada.\n\n' +
            'Em caso de falha: `"Esperava que a função lançasse um erro, mas ela completou sem erros."`\n\n' +
            '### Exemplo de Código\n\n' +
            '```delegua\ntestes.afirmar.erro(funcao() {\n    lancarErro("ops")\n})\n```',
        exemploCodigo: 'testes.afirmar.erro(funcao: função)'
    }
];
