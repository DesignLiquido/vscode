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
