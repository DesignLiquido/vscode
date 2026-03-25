import { FuncaoNativaOuMetodoPrimitiva } from "../../tipos";

export const primitivasTuplaFormatadas: FuncaoNativaOuMetodoPrimitiva[] = [
    {
        nome: 'paraVetor',
        assinaturas: [
            {
                formato: 'paraVetor()',
                parametros: []
            }
        ],
        documentacao: '# `tupla.paraVetor()` \n \n' + 'Converte a tupla atual em um array.',
        exemploCodigo: 'tupla.paraVetor()',
    },
];
