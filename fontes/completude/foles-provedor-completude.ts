import * as vscode from 'vscode';
import listaModificadores from '@designliquido/foles/extensao/lista-modificadores';
import * as modificadoresFolEs from '@designliquido/foles/modificadores';
import { cores } from '@designliquido/foles/modificadores/atributos/cores';
import { valoresGlobais } from '@designliquido/foles/modificadores/atributos/globais';
import { Cores } from '@designliquido/foles/listas/cores';
import { DicionarioEstruturasLmht } from '@designliquido/foles/estruturas/dicionario-estruturas-lmht';
import { DicionarioValores } from '@designliquido/foles/valores/dicionario-valores';

type DicionarioTexto = Record<string, string>;

type ConstrutorModificador = {
    new (valores: unknown[], pragmas?: unknown, variavel?: boolean): {
        valoresAceitos?: DicionarioTexto;
    };
    nomeCss?: string;
    nomeFolEs?: string | string[];
};

interface ContextoDeclaracao {
    nomeModificador?: string;
    possuiDoisPontos: boolean;
}

interface ValorCompletude {
    nomeFolEs: string;
    nomeCss?: string;
    tipo: vscode.CompletionItemKind;
    origem: string;
}

const METODOS_COR = new Set(['hex', 'hsl', 'hsla', 'rgb', 'rgba']);
const MODIFICADORES_COR = new Set(Cores);
const MODIFICADORES = listaModificadores as Record<string, {
    nomeCss: string;
    descricao?: string;
}>;

function nomesFolEs(construtor: ConstrutorModificador): string[] {
    if (!construtor.nomeFolEs) {
        return [];
    }

    return Array.isArray(construtor.nomeFolEs)
        ? construtor.nomeFolEs
        : [construtor.nomeFolEs];
}

function construirValoresPorModificador(): Map<string, DicionarioTexto> {
    const valoresPorNome = new Map<string, DicionarioTexto>();
    const valoresPorNomeCss = new Map<string, DicionarioTexto>();

    for (const exportacao of Object.values(modificadoresFolEs)) {
        if (typeof exportacao !== 'function') {
            continue;
        }

        const construtor = exportacao as ConstrutorModificador;
        const nomes = nomesFolEs(construtor);

        if (nomes.length === 0) {
            continue;
        }

        try {
            const instancia = new construtor([], undefined, true);
            const valoresAceitos = instancia.valoresAceitos;

            if (!valoresAceitos || typeof valoresAceitos !== 'object') {
                continue;
            }

            for (const nome of nomes) {
                valoresPorNome.set(nome, valoresAceitos);
            }

            if (construtor.nomeCss) {
                valoresPorNomeCss.set(construtor.nomeCss, valoresAceitos);
            }
        } catch {
            // Alguns modificadores podem exigir estado adicional em versões futuras
            // do pacote. Nesse caso, a completude mantém os valores globais e os
            // dicionários especializados, sem interromper o provedor.
        }
    }

    for (const [nome, metadados] of Object.entries(MODIFICADORES)) {
        if (valoresPorNome.has(nome)) {
            continue;
        }

        const valoresPeloNomeCss = valoresPorNomeCss.get(metadados.nomeCss);
        if (valoresPeloNomeCss) {
            valoresPorNome.set(nome, valoresPeloNomeCss);
        }
    }

    return valoresPorNome;
}

const VALORES_POR_MODIFICADOR = construirValoresPorModificador();

export class FolesProvedorCompletude implements vscode.CompletionItemProvider {
    private profundidadeNaCursorPosition(document: vscode.TextDocument, position: vscode.Position): number {
        const textoCompleto = document.getText();
        const linhas = textoCompleto.split('\n');
        let offset = 0;

        for (let i = 0; i < position.line; i++) {
            offset += linhas[i].length + 1;
        }

        offset += position.character;
        const trecho = textoCompleto.substring(0, offset);
        let profundidade = 0;

        for (const char of trecho) {
            if (char === '{') profundidade++;
            else if (char === '}') profundidade--;
        }

        return profundidade;
    }

    private contextoDeclaracaoAtual(document: vscode.TextDocument, position: vscode.Position): ContextoDeclaracao {
        const textoLinha = document.lineAt(position.line).text.substring(0, position.character);
        const trechoAtual = textoLinha.split(/[;{}]/).pop() ?? '';
        const correspondencia = trechoAtual.match(/^\s*([\p{L}\p{N}_-]+)\s*:\s*[^;{}]*$/u);

        if (!correspondencia) {
            return { possuiDoisPontos: false };
        }

        return {
            nomeModificador: correspondencia[1],
            possuiDoisPontos: true,
        };
    }

    private itensSeletoresLmht(): vscode.CompletionItem[] {
        const itens: vscode.CompletionItem[] = [];

        for (const [chave, Classe] of Object.entries(DicionarioEstruturasLmht)) {
            const item = new vscode.CompletionItem(chave, vscode.CompletionItemKind.Interface);
            const instancia = new (Classe as any)();
            item.documentation = `Equivalente em HTML: <${instancia.tagHtml}>`;
            itens.push(item);
        }

        return itens;
    }

    private itensModificadores(): vscode.CompletionItem[] {
        const itens: vscode.CompletionItem[] = [];

        for (const [chave, valor] of Object.entries(MODIFICADORES)) {
            const item = new vscode.CompletionItem(chave, vscode.CompletionItemKind.Property);
            item.documentation = valor.descricao
                ? `${valor.descricao}\n\nEquivalente em CSS: ${valor.nomeCss}`
                : `Equivalente em CSS: ${valor.nomeCss}`;
            item.detail = `CSS: ${valor.nomeCss}`;
            itens.push(item);
        }

        return itens;
    }

    private modificadorAceitaCor(nomeModificador: string): boolean {
        if (MODIFICADORES_COR.has(nomeModificador)) {
            return true;
        }

        const nomeCss = MODIFICADORES[nomeModificador]?.nomeCss;
        return typeof nomeCss === 'string' && nomeCss.includes('color');
    }

    private adicionarValor(
        valores: Map<string, ValorCompletude>,
        nomeFolEs: string,
        nomeCss: string | undefined,
        tipo: vscode.CompletionItemKind,
        origem: string
    ): void {
        const existente = valores.get(nomeFolEs);

        if (existente && existente.tipo === vscode.CompletionItemKind.Color) {
            return;
        }

        valores.set(nomeFolEs, {
            nomeFolEs,
            nomeCss,
            tipo,
            origem,
        });
    }

    private valoresDoModificador(nomeModificador: string): ValorCompletude[] {
        if (!MODIFICADORES[nomeModificador]) {
            return [];
        }

        const valores = new Map<string, ValorCompletude>();
        const valoresEspecificos = VALORES_POR_MODIFICADOR.get(nomeModificador) ?? {};

        for (const [nomeFolEs, nomeCss] of Object.entries(valoresEspecificos)) {
            this.adicionarValor(
                valores,
                nomeFolEs,
                nomeCss,
                vscode.CompletionItemKind.Value,
                'Valor aceito pelo modificador'
            );
        }

        for (const [nomeFolEs, nomeCss] of Object.entries(valoresGlobais)) {
            this.adicionarValor(
                valores,
                nomeFolEs,
                nomeCss,
                vscode.CompletionItemKind.Value,
                'Valor global'
            );
        }

        if (this.modificadorAceitaCor(nomeModificador)) {
            for (const [nomeFolEs, nomeCss] of Object.entries(cores)) {
                this.adicionarValor(
                    valores,
                    nomeFolEs,
                    nomeCss,
                    vscode.CompletionItemKind.Color,
                    'Cor'
                );
            }

            for (const nomeMetodo of METODOS_COR) {
                if (DicionarioValores[nomeMetodo]) {
                    this.adicionarValor(
                        valores,
                        nomeMetodo,
                        undefined,
                        vscode.CompletionItemKind.Function,
                        'Função de cor'
                    );
                }
            }
        }

        return Array.from(valores.values()).sort((a, b) => a.nomeFolEs.localeCompare(b.nomeFolEs));
    }

    private itensValores(nomeModificador: string): vscode.CompletionItem[] {
        return this.valoresDoModificador(nomeModificador).map(valor => {
            const item = new vscode.CompletionItem(valor.nomeFolEs, valor.tipo);
            item.insertText = valor.nomeFolEs;
            item.detail = valor.nomeCss
                ? `Equivalente em CSS: ${valor.nomeCss}`
                : valor.origem;
            item.documentation = valor.nomeCss
                ? `${valor.origem}. Equivalente em CSS: ${valor.nomeCss}.`
                : valor.origem;
            item.sortText = `${valor.tipo === vscode.CompletionItemKind.Color ? '0' : '1'}-${valor.nomeFolEs}`;
            return item;
        });
    }

    provideCompletionItems(
        document: vscode.TextDocument,
        position: vscode.Position,
        token: vscode.CancellationToken,
        context: vscode.CompletionContext
    ): vscode.ProviderResult<vscode.CompletionList<vscode.CompletionItem> | vscode.CompletionItem[]> {
        const profundidade = this.profundidadeNaCursorPosition(document, position);

        if (profundidade <= 0) {
            return this.itensSeletoresLmht();
        }

        const contextoDeclaracao = this.contextoDeclaracaoAtual(document, position);

        if (contextoDeclaracao.possuiDoisPontos && contextoDeclaracao.nomeModificador) {
            return this.itensValores(contextoDeclaracao.nomeModificador);
        }

        return this.itensModificadores();
    }
}
