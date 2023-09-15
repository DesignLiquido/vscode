export type ParametroAssinaturaMetodo = {
    nome: string,
    documentacao: string
};

export type AssinaturaMetodo = {
    formato: string,
    parametros: ParametroAssinaturaMetodo[]
};

export type PrimitivaOuMetodo = {
    nome: string;
    assinaturas?: AssinaturaMetodo[];
    documentacao: string;
    exemploCodigo: string;
};
