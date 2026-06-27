import * as vscode from 'vscode';

const propriedadesRoteador = [
    { nome: 'diretorioEstatico', tipo: 'texto', detalhe: "Caminho do diretório de arquivos estáticos." },
    { nome: 'cors', tipo: 'logico', detalhe: "Habilita CORS." },
    { nome: 'bodyParser', tipo: 'logico', detalhe: "Habilita o body-parser." },
    { nome: 'morgan', tipo: 'logico', detalhe: "Habilita o log de requisições com morgan." },
    { nome: 'cookieParser', tipo: 'logico', detalhe: "Habilita o cookie-parser." },
    { nome: 'passport', tipo: 'logico', detalhe: "Habilita o passport para autenticação." },
    { nome: 'json', tipo: 'logico', detalhe: "Habilita o suporte a JSON no body." },
    { nome: 'helmet', tipo: 'logico', detalhe: "Habilita o helmet para segurança de cabeçalhos HTTP." },
    { nome: 'porta', tipo: 'numero', detalhe: "Porta em que o servidor escutará." },
];

const propriedadesFonteDados = [
    { nome: 'tecnologia', tipo: 'texto', detalhe: "Tecnologia de banco de dados (ex: 'sqlite')." },
    { nome: 'caminho', tipo: 'texto', detalhe: "Caminho do arquivo de banco de dados (ex: ':memory:' para SQLite em memória)." },
    { nome: 'host', tipo: 'texto', detalhe: "Endereço do servidor de banco de dados." },
    { nome: 'porta', tipo: 'numero', detalhe: "Porta do servidor de banco de dados." },
    { nome: 'usuario', tipo: 'texto', detalhe: "Nome de usuário para conexão." },
    { nome: 'senha', tipo: 'texto', detalhe: "Senha para conexão." },
    { nome: 'banco', tipo: 'texto', detalhe: "Nome do banco de dados." },
    { nome: 'autoInicializar', tipo: 'logico', detalhe: "Inicializa o banco automaticamente ao iniciar o servidor." },
    { nome: 'arquivoInicializacao', tipo: 'texto', detalhe: "Arquivo de inicialização do banco (padrão: 'inicializacao.lincones')." },
];

const propriedadesAutenticacao = [
    { nome: 'tecnologia', tipo: 'texto', detalhe: "Tecnologia de autenticação: 'jwt'." },
    { nome: 'segredo', tipo: 'texto', detalhe: "Chave secreta para assinatura de tokens." },
    { nome: 'expiracao', tipo: 'texto', detalhe: "Tempo de expiração do token (ex: '1h', '7d')." },
];

const propriedadesAplicacaoDiretas = [
    { nome: 'nome', tipo: 'texto', detalhe: "Nome da aplicação." },
    { nome: 'versao', tipo: 'texto', detalhe: "Versão da aplicação." },
    { nome: 'descricao', tipo: 'texto', detalhe: "Descrição da aplicação." },
];

const propriedadesLicenca = [
    { nome: 'nome', tipo: 'texto', detalhe: "Nome da licença da aplicação." },
    { nome: 'url', tipo: 'texto', detalhe: "URL da licença da aplicação." },
];

const propriedadesLiquidoDiretas = [
    { nome: 'arquetipo', tipo: 'texto', detalhe: "Arquitetura da aplicação: 'rest' ou 'mvc'." },
    { nome: 'linguagem', tipo: 'texto', detalhe: "Linguagem principal da aplicação: 'delégua' ou 'pituguês'." },
    { nome: 'verboso', tipo: 'logico', detalhe: 'Ativa logs adicionais de carregamento e configuração.' },
];

function itemCompletude(nome: string, tipo: string, detalhe: string): vscode.CompletionItem {
    const item = new vscode.CompletionItem(nome, vscode.CompletionItemKind.Property);
    item.detail = `(${tipo}) ${detalhe}`;
    return item;
}

/**
 * Provedor de completude para arquivos `.delprops`.
 * Oferece sugestões para namespaces e propriedades conhecidas do ecossistema Delégua.
 */
export class DelpropsProvedorCompletude implements vscode.CompletionItemProvider {
    provideCompletionItems(
        document: vscode.TextDocument,
        position: vscode.Position
    ): vscode.ProviderResult<vscode.CompletionItem[]> {
        const textoAntesDosCursor = document.lineAt(position).text.slice(0, position.character);

        // liquido.dados.<nome>. → propriedades da fonte de dados
        if (/^liquido\.dados\.\w+\.$/.test(textoAntesDosCursor)) {
            return propriedadesFonteDados.map(p => itemCompletude(p.nome, p.tipo, p.detalhe));
        }

        // liquido.dados. → placeholder de identificador livre
        if (/^liquido\.dados\.$/.test(textoAntesDosCursor)) {
            const placeholder = new vscode.CompletionItem('nomeFonteDados', vscode.CompletionItemKind.Module);
            placeholder.detail = 'Identificador livre para a fonte de dados (ex: lincones, principal).';
            placeholder.insertText = new vscode.SnippetString('${1:nomeFonteDados}.');
            placeholder.command = { command: 'editor.action.triggerSuggest', title: 'Trigger Suggest' };
            return [placeholder];
        }

        // liquido.roteador. → propriedades do roteador
        if (/^liquido\.roteador\.$/.test(textoAntesDosCursor)) {
            return propriedadesRoteador.map(p => itemCompletude(p.nome, p.tipo, p.detalhe));
        }

        // liquido.autenticacao. → propriedades de autenticação
        if (/^liquido\.autenticacao\.$/.test(textoAntesDosCursor)) {
            return propriedadesAutenticacao.map(p => itemCompletude(p.nome, p.tipo, p.detalhe));
        }

        // liquido.aplicacao.licenca. → propriedades da licença
        if (/^liquido\.aplicacao\.licenca\.$/.test(textoAntesDosCursor)) {
            return propriedadesLicenca.map(p => itemCompletude(p.nome, p.tipo, p.detalhe));
        }

        // liquido.aplicacao. → propriedades diretas + sub-namespace licenca
        if (/^liquido\.aplicacao\.$/.test(textoAntesDosCursor)) {
            const itens = propriedadesAplicacaoDiretas.map(p => itemCompletude(p.nome, p.tipo, p.detalhe));
            const licenca = new vscode.CompletionItem('licenca', vscode.CompletionItemKind.Module);
            licenca.detail = 'Configurações de licença da aplicação.';
            licenca.insertText = new vscode.SnippetString('licenca.');
            licenca.command = { command: 'editor.action.triggerSuggest', title: 'Trigger Suggest' };
            return [...itens, licenca];
        }

        // liquido. → namespaces de primeiro nível
        if (/^liquido\.$/.test(textoAntesDosCursor)) {
            const propriedadesDiretas = propriedadesLiquidoDiretas.map(p => itemCompletude(p.nome, p.tipo, p.detalhe));

            const roteador = new vscode.CompletionItem('roteador', vscode.CompletionItemKind.Module);
            roteador.detail = 'Configurações do roteador web.';

            const dados = new vscode.CompletionItem('dados', vscode.CompletionItemKind.Module);
            dados.detail = 'Configurações de fontes de dados.';

            const autenticacao = new vscode.CompletionItem('autenticacao', vscode.CompletionItemKind.Module);
            autenticacao.detail = 'Configurações de autenticação.';

            const aplicacao = new vscode.CompletionItem('aplicacao', vscode.CompletionItemKind.Module);
            aplicacao.detail = 'Configurações da aplicação.';

            return [...propriedadesDiretas, roteador, dados, autenticacao, aplicacao];
        }

        // Início de linha → namespace raiz
        if (/^$/.test(textoAntesDosCursor)) {
            const liquido = new vscode.CompletionItem('liquido', vscode.CompletionItemKind.Module);
            liquido.detail = 'Framework web Líquido.';
            liquido.insertText = new vscode.SnippetString('liquido.');
            liquido.command = { command: 'editor.action.triggerSuggest', title: 'Trigger Suggest' };
            return [liquido];
        }

        return undefined;
    }
}
