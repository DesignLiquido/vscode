import * as vscode from 'vscode';
import { DefinicaoPropriedade, liquido } from '@designliquido/delprops';

const nomesTipos: Record<string, string> = {
    logico: 'lógico',
    texto: 'texto',
    numero: 'número',
};

const propriedadesLiquidoDiretas: DefinicaoPropriedade[] = [
    {
        nome: 'arquetipo',
        tipo: 'texto',
        detalhe: "Define o arquétipo da aplicação ('rest' ou 'mvc').",
        valoresPermitidos: ['rest', 'mvc'],
    },
    {
        nome: 'linguagem',
        tipo: 'texto',
        detalhe: "Define a linguagem principal da aplicação ('delégua' ou 'pituguês').",
        valoresPermitidos: ['delégua', 'pituguês'],
    },
    {
        nome: 'verboso',
        tipo: 'logico',
        detalhe: 'Ativa logs adicionais de carregamento e configuração.',
    },
];

const subnamespaces: Record<string, { detalhe: string; propriedades: DefinicaoPropriedade[] }> = {
    roteador:     { detalhe: 'Configurações do roteador HTTP.',   propriedades: liquido.roteador },
    dados:        { detalhe: 'Configurações de fontes de dados.', propriedades: liquido.dados },
    autenticacao: { detalhe: 'Configurações de autenticação.',    propriedades: liquido.autenticacao },
    aplicacao:    { detalhe: 'Configurações da aplicação.',       propriedades: liquido.aplicacao },
};

function tabelaPropriedades(propriedades: DefinicaoPropriedade[]): string {
    const linhas = propriedades.map(p => {
        const valores = p.valoresPermitidos
            ? p.valoresPermitidos.map(v => `\`'${v}'\``).join(', ')
            : p.padrao
            ? `padrão: \`${p.padrao}\``
            : '—';
        return `| \`${p.nome}\` | ${nomesTipos[p.tipo]} | ${valores} |`;
    });
    return [
        '| Propriedade | Tipo | Valores / Padrão |',
        '|---|---|---|',
        ...linhas,
    ].join('\n');
}

function hoverLiquido(): vscode.Hover {
    const doc = new vscode.MarkdownString();
    doc.appendMarkdown('**(espaço de nomes)** `liquido`\n\n');
    doc.appendMarkdown('Framework web Líquido para desenvolvimento de aplicações na internet em português.\n\n');
    doc.appendMarkdown('**Propriedades diretas:**\n\n');
    doc.appendMarkdown(tabelaPropriedades(propriedadesLiquidoDiretas));
    doc.appendMarkdown('\n\n');
    doc.appendMarkdown('**Sub-propriedades disponíveis:**\n\n');
    for (const [nome, info] of Object.entries(subnamespaces)) {
        doc.appendMarkdown(`- \`${nome}\` — ${info.detalhe}\n`);
    }
    return new vscode.Hover(doc);
}

function hoverPropriedadeLiquido(nome: string): vscode.Hover | undefined {
    const definicao = propriedadesLiquidoDiretas.find(p => p.nome === nome);
    if (!definicao) { return undefined; }

    const doc = new vscode.MarkdownString();
    doc.appendMarkdown(`**(${nomesTipos[definicao.tipo]})** \`liquido.${nome}\`\n\n`);
    doc.appendMarkdown(`${definicao.detalhe}\n`);

    if (definicao.valoresPermitidos) {
        doc.appendMarkdown(`\n**Valores permitidos:** ${definicao.valoresPermitidos.map(v => `\`'${v}'\``).join(', ')}`);
    }
    if (definicao.padrao) {
        doc.appendMarkdown(`\n**Padrão:** \`${definicao.padrao}\``);
    }

    return new vscode.Hover(doc);
}

function hoverSubnamespace(nome: string): vscode.Hover | undefined {
    const info = subnamespaces[nome];
    if (!info) { return undefined; }

    const doc = new vscode.MarkdownString();
    doc.appendMarkdown(`**(espaço de nomes)** \`liquido.${nome}\`\n\n`);
    doc.appendMarkdown(`${info.detalhe}\n\n`);
    if (nome === 'dados') {
        doc.appendMarkdown('`<nome>` é um identificador livre para a fonte de dados (ex: `lincones`, `principal`).\n\n');
    }
    doc.appendMarkdown(tabelaPropriedades(info.propriedades));
    return new vscode.Hover(doc);
}

function hoverPropriedade(segmentos: string[], indicePropriedade: number): vscode.Hover | undefined {
    const nomeNamespace = segmentos[1];
    const info = subnamespaces[nomeNamespace];
    if (!info) { return undefined; }

    const nomePropriedade = segmentos[indicePropriedade];
    const definicao = info.propriedades.find(p => p.nome === nomePropriedade);
    if (!definicao) { return undefined; }

    const caminhoCompleto = segmentos.slice(0, indicePropriedade + 1).join('.');
    const doc = new vscode.MarkdownString();
    doc.appendMarkdown(`**(${nomesTipos[definicao.tipo]})** \`${caminhoCompleto}\`\n\n`);
    doc.appendMarkdown(`${definicao.detalhe}\n`);

    if (definicao.valoresPermitidos) {
        doc.appendMarkdown(`\n**Valores permitidos:** ${definicao.valoresPermitidos.map(v => `\`'${v}'\``).join(', ')}`);
    }
    if (definicao.padrao) {
        doc.appendMarkdown(`\n**Padrão:** \`${definicao.padrao}\``);
    }
    return new vscode.Hover(doc);
}

function hoverIdentificadorFonteDados(nome: string): vscode.Hover {
    const doc = new vscode.MarkdownString();
    doc.appendMarkdown(`**(fonte de dados)** \`liquido.dados.${nome}\`\n\n`);
    doc.appendMarkdown('Identificador livre para a fonte de dados.\n\n');
    doc.appendMarkdown(tabelaPropriedades(subnamespaces.dados.propriedades));
    return new vscode.Hover(doc);
}

function hoverPropriedadeOuSubNamespace(segmentos: string[]): vscode.Hover | undefined {
    const nomeNamespace = segmentos[1];
    const info = subnamespaces[nomeNamespace];
    if (!info) { return undefined; }

    const chave = segmentos[2];

    // propriedade direta (e.g., liquido.aplicacao.nome, liquido.roteador.cors)
    const definicao = info.propriedades.find(p => p.nome === chave);
    if (definicao) {
        return hoverPropriedade(segmentos, 2);
    }

    // sub-espaço de nomes com nomes compostos (e.g., liquido.aplicacao.licenca → licenca.nome, licenca.url)
    const prefixo = chave + '.';
    const subProps = info.propriedades.filter(p => p.nome.startsWith(prefixo));
    if (subProps.length === 0) { return undefined; }

    const doc = new vscode.MarkdownString();
    doc.appendMarkdown(`**(sub-espaço de nomes)** \`liquido.${nomeNamespace}.${chave}\`\n\n`);
    doc.appendMarkdown(tabelaPropriedades(subProps.map(p => ({ ...p, nome: p.nome.slice(prefixo.length) }))));
    return new vscode.Hover(doc);
}

function hoverPropriedadeComposta(segmentos: string[]): vscode.Hover | undefined {
    const nomeNamespace = segmentos[1];
    const info = subnamespaces[nomeNamespace];
    if (!info) { return undefined; }

    const nomeComposto = segmentos[2] + '.' + segmentos[3];
    const definicao = info.propriedades.find(p => p.nome === nomeComposto);
    if (!definicao) { return undefined; }

    const caminhoCompleto = `liquido.${nomeNamespace}.${nomeComposto}`;
    const doc = new vscode.MarkdownString();
    doc.appendMarkdown(`**(${nomesTipos[definicao.tipo]})** \`${caminhoCompleto}\`\n\n`);
    doc.appendMarkdown(`${definicao.detalhe}\n`);
    if (definicao.valoresPermitidos) {
        doc.appendMarkdown(`\n**Valores permitidos:** ${definicao.valoresPermitidos.map(v => `\`'${v}'\``).join(', ')}`);
    }
    if (definicao.padrao) {
        doc.appendMarkdown(`\n**Padrão:** \`${definicao.padrao}\``);
    }
    return new vscode.Hover(doc);
}

/**
 * Provedor de documentação em hover para arquivos `.delprops`.
 * Exibe informações sobre espaços de nomes e propriedades ao posicionar o ponteiro sobre eles.
 */
export class DelpropsProvedorDocumentacaoEmEditor implements vscode.HoverProvider {
    provideHover(
        documento: vscode.TextDocument,
        posicao: vscode.Position
    ): vscode.ProviderResult<vscode.Hover> {
        const linhaTexto = documento.lineAt(posicao).text;
        const semComentario = linhaTexto.replace(/\/\/.*$/, '');

        // Considerar apenas o lado da chave (antes de '=')
        const indiceIgual = semComentario.indexOf('=');
        const textoChave = (indiceIgual !== -1 ? semComentario.slice(0, indiceIgual) : semComentario).trimEnd();

        const segmentos = textoChave.trim().split('.');
        if (segmentos[0] !== 'liquido') { return undefined; }

        // Encontrar em qual índice de segmento o cursor está
        let segmentoAtual = -1;
        let coluna = textoChave.indexOf('liquido'); // considerar espaço em branco inicial
        for (let i = 0; i < segmentos.length; i++) {
            const fim = coluna + segmentos[i].length;
            if (posicao.character >= coluna && posicao.character <= fim) {
                segmentoAtual = i;
                break;
            }
            coluna = fim + 1; // pular o '.'
        }

        if (segmentoAtual === -1) { return undefined; }

        if (segmentoAtual === 0) { return hoverLiquido(); }
        if (segmentoAtual === 1) {
            return hoverPropriedadeLiquido(segmentos[1]) || hoverSubnamespace(segmentos[1]);
        }

        // liquido.dados.<nome> — identificador livre de fonte de dados
        if (segmentoAtual === 2 && segmentos[1] === 'dados') {
            return hoverIdentificadorFonteDados(segmentos[2]);
        }

        // liquido.dados.<nome>.<prop>
        if (segmentoAtual === 3 && segmentos[1] === 'dados') {
            return hoverPropriedade(segmentos, 3);
        }

        // liquido.<namespace>.<sub-espaço>.<prop> com nomes compostos (e.g., liquido.aplicacao.licenca.url)
        if (segmentoAtual === 3) {
            return hoverPropriedadeComposta(segmentos);
        }

        // liquido.<namespace>.<prop> ou liquido.<namespace>.<sub-espaço>
        if (segmentoAtual === 2) {
            return hoverPropriedadeOuSubNamespace(segmentos);
        }

        return undefined;
    }
}
