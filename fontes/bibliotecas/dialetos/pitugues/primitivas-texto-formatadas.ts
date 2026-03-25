import { FuncaoNativaOuMetodoPrimitiva } from "../../tipos";

export const primitivasTextoFormatadas: FuncaoNativaOuMetodoPrimitiva[] = [
    {
        nome: 'aparar',
        assinaturas: [
            {
                formato: 'aparar()',
                parametros: []
            }
        ],
        documentacao: '### Descrição \n \n' +
            'Remover espaços em branco no início e no fim de um texto.' +
            '\n\n ### Exemplo de Código\n' +
            '\n\n```pitugues\nvar t = "   meu texto com espaços no início e no fim       "\n' +
            'escreva("|" + t.aparar() + "|") // "|meu texto com espaços no início e no fim|"\n```' +
            '\n\n ### Formas de uso \n',
        exemploCodigo: 'texto.aparar()'
    },
    {
        nome: 'aparar_fim',
        assinaturas: [
            {
                formato: 'aparar_fim()',
                parametros: []
            }
        ],
        documentacao: '### Descrição \n \n' +
            'Remover espaços em branco no no fim de um texto.' +
            '\n\n ### Exemplo de Código\n' +
            '\n\n```pitugues\nvar t = "   meu texto com espaços no início e no fim       "\n' +
            'escreva("|" + t.aparar_fim() + "|") // "|   meu texto com espaços no início e no fim|"\n```' +
            '\n\n ### Formas de uso \n',
        exemploCodigo: 'texto.aparar_fim()'
    },
    {
        nome: 'aparar_inicio',
        assinaturas: [
            {
                formato: 'aparar_inicio()',
                parametros: []
            }
        ],
        documentacao: '### Descrição \n \n' +
            'Remover espaços em branco no início e no fim de um texto.' +
            '\n\n ### Exemplo de Código\n' +
            '\n\n```pitugues\nvar t = "   meu texto com espaços no início e no fim       "\n' +
            'escreva("|" + t.aparar_inicio() + "|") // "|meu texto com espaços no início e no fim       |"\n```' +
            '\n\n ### Formas de uso \n',
        exemploCodigo: 'texto.aparar_inicio()'
    },
    // Add more as needed
];
