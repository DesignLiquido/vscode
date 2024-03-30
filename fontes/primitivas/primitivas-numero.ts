import { PrimitivaOuMetodo } from "./tipos";

export const primitivasNumero: PrimitivaOuMetodo[] = [
    {
        nome: 'arredondarParaBaixo',
        assinaturas: [
            {
                formato: 'arredondarParaBaixo()',
                parametros: []
            }
        ],
        documentacao: '# `arredondarParaBaixo()`\n\n' +
            'Retira as partes decimais de um número com partes decimais. Se o número já é inteiro, devolve apenas o próprio número.' +
            '\n\n ## Exemplo de Código ' +
            '\n\n```delegua\n' +
            'var n = 2.5\n' +
            'escreva(n.arredondarParaBaixo()) // 2\n```\n' +
            '\n\n## Formas de uso\n',
        exemploCodigo: 'numero.arredondarParaBaixo()'
    },
    {
        nome: 'arredondarParaCima',
        assinaturas: [
            {
                formato: 'arredondarParaCima()',
                parametros: []
            }
        ],
        documentacao: '# `arredondarParaCima()`\n\n' +
            'Arredonda um número com partes decimais para cima, ou seja, para o próximo número inteiro.' +
            '\n\n ## Exemplo de Código ' +
            '\n\n```delegua\n' +
            'var n = 2.5\n' +
            'escreva(n.arredondarParaCima()) // 3\n```\n' +
            '\n\n## Formas de uso\n',
        exemploCodigo: 'numero.arredondarParaCima()'
    },
];