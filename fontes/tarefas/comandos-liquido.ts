/**
 * Catálogo dos comandos do CLI `liquido`, compartilhado pelos provedores de
 * tarefa do desktop e da Web.
 *
 * Cada comando descreve como é executado:
 * - `argumentosCli`: os argumentos passados ao binário `liquido` (usados pelo
 *   provedor desktop, via ShellExecution);
 * - `disponivelNaWeb`: se o comando pode rodar no host de extensão Web, onde
 *   não há shell nem `child_process` (usado pelo provedor Web, via
 *   CustomExecution);
 * - `requerServidor`: marca o comando que sobe um servidor HTTP de longa
 *   duração, cujo suporte na Web é experimental (Simple Browser).
 */
export interface ComandoLiquido {
    id: string;
    titulo: string;
    descricao: string;
    argumentosCli: string[];
    disponivelNaWeb: boolean;
    requerServidor?: boolean;
}

export const comandosLiquido: ComandoLiquido[] = [
    {
        id: 'servidor',
        titulo: 'Liquido: Iniciar servidor de desenvolvimento',
        descricao: 'Sobe o servidor de desenvolvimento do projeto Liquido.',
        argumentosCli: [],
        disponivelNaWeb: true,
        requerServidor: true
    },
    {
        id: 'novo',
        titulo: 'Liquido: Novo projeto',
        descricao: 'Cria um novo projeto Liquido no diretório atual.',
        argumentosCli: ['novo'],
        disponivelNaWeb: true
    },
    {
        id: 'gerar',
        titulo: 'Liquido: Gerar código',
        descricao: 'Gera código a partir dos modelos do projeto.',
        argumentosCli: ['gerar'],
        disponivelNaWeb: true
    },
    {
        id: 'documentar',
        titulo: 'Liquido: Gerar documentação OpenAPI',
        descricao: 'Lê as rotas do projeto e gera a documentação OpenAPI.',
        argumentosCli: ['documentar'],
        disponivelNaWeb: true
    },
    {
        id: 'banco-iniciar',
        titulo: 'Liquido: Inicializar banco de dados',
        descricao: 'Inicializa a estrutura e os dados do banco de dados do projeto.',
        argumentosCli: ['banco', 'iniciar'],
        disponivelNaWeb: true
    },
    {
        id: 'testes',
        titulo: 'Liquido: Rodar testes',
        descricao: 'Executa a suíte de testes em Delégua do projeto.',
        argumentosCli: ['testes'],
        disponivelNaWeb: true
    }
];

/** Tipo da definição de tarefa contribuída no package.json. */
export const TIPO_TAREFA_LIQUIDO = 'liquido';

export function comandoPorId(id: string): ComandoLiquido | undefined {
    return comandosLiquido.find(comando => comando.id === id);
}
