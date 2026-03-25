import { FuncaoNativaOuMetodoPrimitiva } from "../../tipos";

export const primitivasDicionarioFormatadas: FuncaoNativaOuMetodoPrimitiva[] = [
    {
        nome: 'chaves',
        assinaturas: [
            {
                formato: 'chaves()',
                parametros: []
            }
        ],
        documentacao:
            '# `dicionário.chaves()`\n\n' +
            'Retorna um vetor de texto com todas as chaves de um dicionário.\n' +
            '\n\n ## Exemplo de Código\n' +
            '\n\n```pitugues\n' +
            'var d = {"a": 1, "b": 2, "c": 3}\n' +
            'escreva(d.chaves()) // ["a", "b", "c"]\n```' +
            '\n\n## Formas de uso\n',
        exemploCodigo: 'dicionário.chaves()',
    },
    {
        nome: 'contem',
        assinaturas: [
            {
                formato: 'contem(chave: qualquer)',
                parametros: [
                    {
                        nome: 'chave',
                        documentacao: 'O elemento como chave do dicionário.'
                    }
                ]
            }
        ],
        documentacao:
            `# \`dicionário.contem(chave)\`\n\n` +
            'Retorna verdadeiro se o elemento passado como parâmetro existe como chave do dicionário. Devolve falso em caso contrário.\n' +
            '\n\n ## Exemplo de Código\n' +
            '\n\n```pitugues\n' +
            'var d = {"a": 1, "b": 2, "c": 3}\n' +
            `escreva(d.contem("a")) // verdadeiro\n` +
            `escreva(d.contem("f")) // falso\n\`\`\`` +
            '\n\n## Formas de uso\n',
        exemploCodigo: 'dicionário.contem("minhaChave")',
    },
    {
        nome: 'contém',
        assinaturas: [
            {
                formato: 'contém(chave: qualquer)',
                parametros: [
                    {
                        nome: 'chave',
                        documentacao: 'O elemento como chave do dicionário.'
                    }
                ]
            }
        ],
        documentacao:
            `# \`dicionário.contém(chave)\`\n\n` +
            'Retorna verdadeiro se o elemento passado como parâmetro existe como chave do dicionário. Devolve falso em caso contrário.\n' +
            '\n\n ## Exemplo de Código\n' +
            '\n\n```pitugues\n' +
            'var d = {"a": 1, "b": 2, "c": 3}\n' +
            `escreva(d.contém("a")) // verdadeiro\n` +
            `escreva(d.contém("f")) // falso\n\`\`\`` +
            '\n\n## Formas de uso\n',
        exemploCodigo: 'dicionário.contém("minhaChave")',
    },
    {
        nome: 'itens',
        assinaturas: [
            {
                formato: 'itens()',
                parametros: []
            }
        ],
        documentacao:
            '# `dicionário.itens()`\n\n' +
            'Retorna um vetor contendo pares `[chave, valor]` de um dicionário. ' +
            'Funciona de maneira semelhante à função `items()` da linguagem Python.\n' +
            '\n\n## Exemplo de Código\n' +
            '\n```pitugues\n' +
            'var d = {"a": 1, "b": 2, "c": 3}\n' +
            'escreva(d.itens())\n' +
            '// [["a", 1], ["b", 2], ["c", 3]]\n' +
            '```\n\n' +
            '## Formas de uso\n',
        exemploCodigo: 'dicionário.itens()',
    },
    {
        nome: 'remover',
        assinaturas: [
            {
                formato: 'remover(chave: qualquer)',
                parametros: [
                    {
                        nome: 'chave',
                        documentacao: 'A chave a ser removida.'
                    }
                ]
            }
        ],
        documentacao: '# `dicionário.remover(chave)`\n\n' + 'Remove a chave especificada do dicionário e retorna verdadeiro se a chave existia, falso caso contrário.\n\n## Exemplo de Código\n\n```pitugues\nvar d = {"a": 1, "b": 2}\nescreva(d.remover("a")) // verdadeiro\nescreva(d) // {"b": 2}\n```\n\n## Formas de uso\n',
        exemploCodigo: 'dicionário.remover("minhaChave")'
    },
    {
        nome: 'valores',
        assinaturas: [
            {
                formato: 'valores()',
                parametros: []
            }
        ],
        documentacao: '# `dicionário.valores()`\n\n' + 'Retorna um vetor com todos os valores do dicionário.\n\n## Exemplo de Código\n\n```pitugues\nvar d = {"a": 1, "b": 2, "c": 3}\nescreva(d.valores()) // [1, 2, 3]\n```\n\n## Formas de uso\n',
        exemploCodigo: 'dicionário.valores()'
    },
];
