// @ts-nocheck
import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import * as vscode from 'vscode';

jest.mock('vscode', () => ({
    CompletionItemKind: {
        Property: 9,
        Function: 2,
        Method: 1,
        Variable: 5,
        Constant: 4,
        Keyword: 14,
    },
    CompletionItem: class CompletionItem {
        constructor(public label: string, public kind?: number) {}
        documentation: any;
        detail: string;
        insertText: any;
    },
    MarkdownString: class MarkdownString {
        constructor(public value?: string) {}
    },
    SnippetString: class SnippetString {
        constructor(public value: string) {}
    },
}), { virtual: true });

jest.mock('../../fontes/bibliotecas/dialetos/portugol-studio', () => ({
    primitivasEntradaSaidaPortugolStudio: [
        { nome: 'escreva', descricao: 'Escreve na saída padrão.', documentacao: '# `escreva()`\n Escreve na saída.' },
        { nome: 'leia', descricao: 'Lê valores de entrada.', documentacao: '# `leia()`\n Lê da entrada.' },
    ],
    tiposPortugolStudio: [
        { nome: 'inteiro', descricao: 'Tipo numérico sem casas decimais.', documentacao: '# `inteiro`\n Tipo inteiro.' },
        { nome: 'real', descricao: 'Tipo numérico com casas decimais.', documentacao: '# `real`\n Tipo real.' },
        { nome: 'cadeia', descricao: 'Tipo textual.', documentacao: '# `cadeia`\n Tipo cadeia.' },
        { nome: 'caracter', descricao: 'Tipo caractere.', documentacao: '# `caracter`\n Tipo caracter.' },
        { nome: 'logico', descricao: 'Tipo lógico.', documentacao: '# `logico`\n Tipo logico.' },
    ],
    constantesPortugolStudio: [
        { nome: 'verdadeiro', descricao: 'Constante verdadeira.', documentacao: '# `verdadeiro`\n Verdadeiro.' },
        { nome: 'falso', descricao: 'Constante falsa.', documentacao: '# `falso`\n Falso.' },
    ],
    palavrasReservadasPortugolStudio: [
        { nome: 'programa', descricao: 'Bloco principal.', documentacao: '# `programa`\n Bloco principal.' },
        { nome: 'funcao', descricao: 'Declara função.', documentacao: '# `funcao`\n Função.' },
        { nome: 'inicio', descricao: 'Função de entrada.', documentacao: '# `inicio`\n Início.' },
        { nome: 'se', descricao: 'Estrutura de decisão.', documentacao: '# `se`\n Se.' },
        { nome: 'senao', descricao: 'Bloco senão.', documentacao: '# `senao`\n Senão.' },
        { nome: 'enquanto', descricao: 'Loop enquanto.', documentacao: '# `enquanto`\n Enquanto.' },
        { nome: 'para', descricao: 'Loop para.', documentacao: '# `para`\n Para.' },
        { nome: 'faca', descricao: 'Loop faça.', documentacao: '# `faca`\n Faça.' },
        { nome: 'escolha', descricao: 'Seleção múltipla.', documentacao: '# `escolha`\n Escolha.' },
        { nome: 'caso', descricao: 'Caso.', documentacao: '# `caso`\n Caso.' },
        { nome: 'contrario', descricao: 'Caso padrão.', documentacao: '# `contrario`\n Contrário.' },
        { nome: 'pare', descricao: 'Interrompe loop.', documentacao: '# `pare`\n Pare.' },
        { nome: 'retorne', descricao: 'Retorna valor.', documentacao: '# `retorne`\n Retorne.' },
        { nome: 'const', descricao: 'Declara constante.', documentacao: '# `const`\n Const.' },
        { nome: 'inclua', descricao: 'Inclui biblioteca.', documentacao: '# `inclua`\n Inclua.' },
    ],
    calendarioPortugolStudio: [
        { nome: 'dia_mes_atual', descricao: 'Dia do mês.', documentacao: '# `Calendario.dia_mes_atual()`\n Dia.' },
        { nome: 'mes_atual', descricao: 'Mês atual.', documentacao: '# `Calendario.mes_atual()`\n Mês.' },
        { nome: 'ano_atual', descricao: 'Ano atual.', documentacao: '# `Calendario.ano_atual()`\n Ano.' },
        { nome: 'hora_atual', descricao: 'Hora atual.', documentacao: '# `Calendario.hora_atual()`\n Hora.' },
        { nome: 'dia_semana_atual', descricao: 'Dia da semana.', documentacao: '# `Calendario.dia_semana_atual()`\n Dia semana.' },
    ],
    matematicaPortugolStudio: [
        { nome: 'potencia', descricao: 'Exponenciação.', documentacao: '# `Matematica.potencia()`\n Potência.' },
        { nome: 'raiz', descricao: 'Radiciação.', documentacao: '# `Matematica.raiz()`\n Raiz.' },
        { nome: 'PI', descricao: 'Constante Pi.', documentacao: '# `Matematica.PI`\n Pi.' },
        { nome: 'seno', descricao: 'Seno.', documentacao: '# `Matematica.seno()`\n Seno.' },
        { nome: 'cosseno', descricao: 'Cosseno.', documentacao: '# `Matematica.cosseno()`\n Cosseno.' },
    ],
    textoPortugolStudio: [
        { nome: 'numero_caracteres', descricao: 'Conta caracteres.', documentacao: '# `Texto.numero_caracteres()`\n Número.' },
        { nome: 'caixa_alta', descricao: 'Maiúsculas.', documentacao: '# `Texto.caixa_alta()`\n Caixa alta.' },
        { nome: 'caixa_baixa', descricao: 'Minúsculas.', documentacao: '# `Texto.caixa_baixa()`\n Caixa baixa.' },
        { nome: 'substituir', descricao: 'Substitui texto.', documentacao: '# `Texto.substituir()`\n Substituir.' },
    ],
    utilPortugolStudio: [
        { nome: 'sorteia', descricao: 'Sorteia número.', documentacao: '# `Util.sorteia()`\n Sorteia.' },
        { nome: 'aguarde', descricao: 'Aguarda tempo.', documentacao: '# `Util.aguarde()`\n Aguarde.' },
        { nome: 'numero_elementos', descricao: 'Número de elementos.', documentacao: '# `Util.numero_elementos()`\n Elementos.' },
    ],
}));

import { PortugolStudioProvedorCompletude } from '../../fontes/completude/portugol-studio-provedor-completude';

function criarDocumento(linhas: string[] = ['']): any {
    return {
        lineAt: jest.fn((linha: any) => {
            const idx = typeof linha === 'number' ? linha : linha.line ?? 0;
            return { text: linhas[idx] ?? '' };
        }),
        getText: jest.fn(() => linhas.join('\n')),
    };
}

function criarPosicao(line = 0, character = 0): any {
    return { line, character };
}

describe('PortugolStudioProvedorCompletude', () => {
    let provedor: any;
    const mockToken: any = { isCancellationRequested: false };
    const mockContext: any = {};

    beforeEach(() => {
        jest.clearAllMocks();
        provedor = new PortugolStudioProvedorCompletude();
    });

    it('instância criada com sucesso', () => {
        expect(provedor).toBeDefined();
        expect(typeof provedor.provideCompletionItems).toBe('function');
    });

    it('retorna array de completion items', () => {
        const doc = criarDocumento(['']);
        const pos = criarPosicao(0, 0);
        const items = provedor.provideCompletionItems(doc, pos, mockToken, mockContext);
        expect(Array.isArray(items)).toBe(true);
        expect(items.length).toBeGreaterThan(0);
    });

    it('todos os itens têm label definido', () => {
        const doc = criarDocumento(['']);
        const pos = criarPosicao(0, 0);
        const items = provedor.provideCompletionItems(doc, pos, mockToken, mockContext);
        items.forEach((item: any) => {
            expect(item.label).toBeDefined();
            expect(typeof item.label).toBe('string');
        });
    });

    it('todos os itens têm documentação', () => {
        const doc = criarDocumento(['']);
        const pos = criarPosicao(0, 0);
        const items = provedor.provideCompletionItems(doc, pos, mockToken, mockContext);
        items.forEach((item: any) => {
            expect(item.documentation).toBeDefined();
        });
    });

    describe('primitivas de entrada/saída', () => {
        it('inclui escreva', () => {
            const doc = criarDocumento(['']);
            const pos = criarPosicao(0, 0);
            const items = provedor.provideCompletionItems(doc, pos, mockToken, mockContext);
            expect(items.some((i: any) => i.label === 'escreva')).toBe(true);
        });

        it('inclui leia', () => {
            const doc = criarDocumento(['']);
            const pos = criarPosicao(0, 0);
            const items = provedor.provideCompletionItems(doc, pos, mockToken, mockContext);
            expect(items.some((i: any) => i.label === 'leia')).toBe(true);
        });

        it('escreva e leia são do tipo Function', () => {
            const doc = criarDocumento(['']);
            const pos = criarPosicao(0, 0);
            const items = provedor.provideCompletionItems(doc, pos, mockToken, mockContext);
            const escreva = items.find((i: any) => i.label === 'escreva');
            const leia = items.find((i: any) => i.label === 'leia');
            expect(escreva.kind).toBe(vscode.CompletionItemKind.Function);
            expect(leia.kind).toBe(vscode.CompletionItemKind.Function);
        });
    });

    describe('tipos', () => {
        it('inclui tipo inteiro', () => {
            const doc = criarDocumento(['']);
            const pos = criarPosicao(0, 0);
            const items = provedor.provideCompletionItems(doc, pos, mockToken, mockContext);
            expect(items.some((i: any) => i.label === 'inteiro')).toBe(true);
        });

        it('inclui tipo real', () => {
            const doc = criarDocumento(['']);
            const pos = criarPosicao(0, 0);
            const items = provedor.provideCompletionItems(doc, pos, mockToken, mockContext);
            expect(items.some((i: any) => i.label === 'real')).toBe(true);
        });

        it('inclui tipo cadeia', () => {
            const doc = criarDocumento(['']);
            const pos = criarPosicao(0, 0);
            const items = provedor.provideCompletionItems(doc, pos, mockToken, mockContext);
            expect(items.some((i: any) => i.label === 'cadeia')).toBe(true);
        });

        it('inclui tipo logico', () => {
            const doc = criarDocumento(['']);
            const pos = criarPosicao(0, 0);
            const items = provedor.provideCompletionItems(doc, pos, mockToken, mockContext);
            expect(items.some((i: any) => i.label === 'logico')).toBe(true);
        });

        it('tipos são do tipo Keyword', () => {
            const doc = criarDocumento(['']);
            const pos = criarPosicao(0, 0);
            const items = provedor.provideCompletionItems(doc, pos, mockToken, mockContext);
            const inteiro = items.find((i: any) => i.label === 'inteiro');
            expect(inteiro.kind).toBe(vscode.CompletionItemKind.Keyword);
        });
    });

    describe('constantes', () => {
        it('inclui verdadeiro', () => {
            const doc = criarDocumento(['']);
            const pos = criarPosicao(0, 0);
            const items = provedor.provideCompletionItems(doc, pos, mockToken, mockContext);
            expect(items.some((i: any) => i.label === 'verdadeiro')).toBe(true);
        });

        it('inclui falso', () => {
            const doc = criarDocumento(['']);
            const pos = criarPosicao(0, 0);
            const items = provedor.provideCompletionItems(doc, pos, mockToken, mockContext);
            expect(items.some((i: any) => i.label === 'falso')).toBe(true);
        });

        it('constantes são do tipo Constant', () => {
            const doc = criarDocumento(['']);
            const pos = criarPosicao(0, 0);
            const items = provedor.provideCompletionItems(doc, pos, mockToken, mockContext);
            const verdadeiro = items.find((i: any) => i.label === 'verdadeiro');
            expect(verdadeiro.kind).toBe(vscode.CompletionItemKind.Constant);
        });
    });

    describe('palavras reservadas', () => {
        it('inclui programa', () => {
            const doc = criarDocumento(['']);
            const pos = criarPosicao(0, 0);
            const items = provedor.provideCompletionItems(doc, pos, mockToken, mockContext);
            expect(items.some((i: any) => i.label === 'programa')).toBe(true);
        });

        it('inclui funcao', () => {
            const doc = criarDocumento(['']);
            const pos = criarPosicao(0, 0);
            const items = provedor.provideCompletionItems(doc, pos, mockToken, mockContext);
            expect(items.some((i: any) => i.label === 'funcao')).toBe(true);
        });

        it('inclui se', () => {
            const doc = criarDocumento(['']);
            const pos = criarPosicao(0, 0);
            const items = provedor.provideCompletionItems(doc, pos, mockToken, mockContext);
            expect(items.some((i: any) => i.label === 'se')).toBe(true);
        });

        it('inclui senao', () => {
            const doc = criarDocumento(['']);
            const pos = criarPosicao(0, 0);
            const items = provedor.provideCompletionItems(doc, pos, mockToken, mockContext);
            expect(items.some((i: any) => i.label === 'senao')).toBe(true);
        });

        it('inclui enquanto', () => {
            const doc = criarDocumento(['']);
            const pos = criarPosicao(0, 0);
            const items = provedor.provideCompletionItems(doc, pos, mockToken, mockContext);
            expect(items.some((i: any) => i.label === 'enquanto')).toBe(true);
        });

        it('inclui para', () => {
            const doc = criarDocumento(['']);
            const pos = criarPosicao(0, 0);
            const items = provedor.provideCompletionItems(doc, pos, mockToken, mockContext);
            expect(items.some((i: any) => i.label === 'para')).toBe(true);
        });

        it('inclui faca', () => {
            const doc = criarDocumento(['']);
            const pos = criarPosicao(0, 0);
            const items = provedor.provideCompletionItems(doc, pos, mockToken, mockContext);
            expect(items.some((i: any) => i.label === 'faca')).toBe(true);
        });

        it('inclui escolha', () => {
            const doc = criarDocumento(['']);
            const pos = criarPosicao(0, 0);
            const items = provedor.provideCompletionItems(doc, pos, mockToken, mockContext);
            expect(items.some((i: any) => i.label === 'escolha')).toBe(true);
        });

        it('inclui caso', () => {
            const doc = criarDocumento(['']);
            const pos = criarPosicao(0, 0);
            const items = provedor.provideCompletionItems(doc, pos, mockToken, mockContext);
            expect(items.some((i: any) => i.label === 'caso')).toBe(true);
        });

        it('inclui contrario', () => {
            const doc = criarDocumento(['']);
            const pos = criarPosicao(0, 0);
            const items = provedor.provideCompletionItems(doc, pos, mockToken, mockContext);
            expect(items.some((i: any) => i.label === 'contrario')).toBe(true);
        });

        it('inclui pare', () => {
            const doc = criarDocumento(['']);
            const pos = criarPosicao(0, 0);
            const items = provedor.provideCompletionItems(doc, pos, mockToken, mockContext);
            expect(items.some((i: any) => i.label === 'pare')).toBe(true);
        });

        it('inclui retorne', () => {
            const doc = criarDocumento(['']);
            const pos = criarPosicao(0, 0);
            const items = provedor.provideCompletionItems(doc, pos, mockToken, mockContext);
            expect(items.some((i: any) => i.label === 'retorne')).toBe(true);
        });

        it('inclui const', () => {
            const doc = criarDocumento(['']);
            const pos = criarPosicao(0, 0);
            const items = provedor.provideCompletionItems(doc, pos, mockToken, mockContext);
            expect(items.some((i: any) => i.label === 'const')).toBe(true);
        });

        it('inclui inclua', () => {
            const doc = criarDocumento(['']);
            const pos = criarPosicao(0, 0);
            const items = provedor.provideCompletionItems(doc, pos, mockToken, mockContext);
            expect(items.some((i: any) => i.label === 'inclua')).toBe(true);
        });

        it('palavras reservadas são do tipo Keyword', () => {
            const doc = criarDocumento(['']);
            const pos = criarPosicao(0, 0);
            const items = provedor.provideCompletionItems(doc, pos, mockToken, mockContext);
            const programa = items.find((i: any) => i.label === 'programa');
            expect(programa.kind).toBe(vscode.CompletionItemKind.Keyword);
        });
    });

    describe('funções de biblioteca', () => {
        describe('Calendario', () => {
            it('inclui dia_mes_atual', () => {
                const doc = criarDocumento(['']);
                const pos = criarPosicao(0, 0);
                const items = provedor.provideCompletionItems(doc, pos, mockToken, mockContext);
                expect(items.some((i: any) => i.label === 'dia_mes_atual')).toBe(true);
            });

            it('inclui mes_atual', () => {
                const doc = criarDocumento(['']);
                const pos = criarPosicao(0, 0);
                const items = provedor.provideCompletionItems(doc, pos, mockToken, mockContext);
                expect(items.some((i: any) => i.label === 'mes_atual')).toBe(true);
            });

            it('inclui ano_atual', () => {
                const doc = criarDocumento(['']);
                const pos = criarPosicao(0, 0);
                const items = provedor.provideCompletionItems(doc, pos, mockToken, mockContext);
                expect(items.some((i: any) => i.label === 'ano_atual')).toBe(true);
            });

            it('funções Calendario são do tipo Function', () => {
                const doc = criarDocumento(['']);
                const pos = criarPosicao(0, 0);
                const items = provedor.provideCompletionItems(doc, pos, mockToken, mockContext);
                const dia = items.find((i: any) => i.label === 'dia_mes_atual');
                expect(dia.kind).toBe(vscode.CompletionItemKind.Function);
            });
        });

        describe('Matematica', () => {
            it('inclui potencia', () => {
                const doc = criarDocumento(['']);
                const pos = criarPosicao(0, 0);
                const items = provedor.provideCompletionItems(doc, pos, mockToken, mockContext);
                expect(items.some((i: any) => i.label === 'potencia')).toBe(true);
            });

            it('inclui raiz', () => {
                const doc = criarDocumento(['']);
                const pos = criarPosicao(0, 0);
                const items = provedor.provideCompletionItems(doc, pos, mockToken, mockContext);
                expect(items.some((i: any) => i.label === 'raiz')).toBe(true);
            });

            it('inclui PI', () => {
                const doc = criarDocumento(['']);
                const pos = criarPosicao(0, 0);
                const items = provedor.provideCompletionItems(doc, pos, mockToken, mockContext);
                expect(items.some((i: any) => i.label === 'PI')).toBe(true);
            });

            it('inclui seno', () => {
                const doc = criarDocumento(['']);
                const pos = criarPosicao(0, 0);
                const items = provedor.provideCompletionItems(doc, pos, mockToken, mockContext);
                expect(items.some((i: any) => i.label === 'seno')).toBe(true);
            });

            it('inclui cosseno', () => {
                const doc = criarDocumento(['']);
                const pos = criarPosicao(0, 0);
                const items = provedor.provideCompletionItems(doc, pos, mockToken, mockContext);
                expect(items.some((i: any) => i.label === 'cosseno')).toBe(true);
            });

            it('funções Matematica são do tipo Function', () => {
                const doc = criarDocumento(['']);
                const pos = criarPosicao(0, 0);
                const items = provedor.provideCompletionItems(doc, pos, mockToken, mockContext);
                const potencia = items.find((i: any) => i.label === 'potencia');
                expect(potencia.kind).toBe(vscode.CompletionItemKind.Function);
            });
        });

        describe('Texto', () => {
            it('inclui numero_caracteres', () => {
                const doc = criarDocumento(['']);
                const pos = criarPosicao(0, 0);
                const items = provedor.provideCompletionItems(doc, pos, mockToken, mockContext);
                expect(items.some((i: any) => i.label === 'numero_caracteres')).toBe(true);
            });

            it('inclui caixa_alta', () => {
                const doc = criarDocumento(['']);
                const pos = criarPosicao(0, 0);
                const items = provedor.provideCompletionItems(doc, pos, mockToken, mockContext);
                expect(items.some((i: any) => i.label === 'caixa_alta')).toBe(true);
            });

            it('inclui caixa_baixa', () => {
                const doc = criarDocumento(['']);
                const pos = criarPosicao(0, 0);
                const items = provedor.provideCompletionItems(doc, pos, mockToken, mockContext);
                expect(items.some((i: any) => i.label === 'caixa_baixa')).toBe(true);
            });

            it('inclui substituir', () => {
                const doc = criarDocumento(['']);
                const pos = criarPosicao(0, 0);
                const items = provedor.provideCompletionItems(doc, pos, mockToken, mockContext);
                expect(items.some((i: any) => i.label === 'substituir')).toBe(true);
            });
        });

        describe('Util', () => {
            it('inclui sorteia', () => {
                const doc = criarDocumento(['']);
                const pos = criarPosicao(0, 0);
                const items = provedor.provideCompletionItems(doc, pos, mockToken, mockContext);
                expect(items.some((i: any) => i.label === 'sorteia')).toBe(true);
            });

            it('inclui aguarde', () => {
                const doc = criarDocumento(['']);
                const pos = criarPosicao(0, 0);
                const items = provedor.provideCompletionItems(doc, pos, mockToken, mockContext);
                expect(items.some((i: any) => i.label === 'aguarde')).toBe(true);
            });

            it('inclui numero_elementos', () => {
                const doc = criarDocumento(['']);
                const pos = criarPosicao(0, 0);
                const items = provedor.provideCompletionItems(doc, pos, mockToken, mockContext);
                expect(items.some((i: any) => i.label === 'numero_elementos')).toBe(true);
            });

            it('funções Util são do tipo Function', () => {
                const doc = criarDocumento(['']);
                const pos = criarPosicao(0, 0);
                const items = provedor.provideCompletionItems(doc, pos, mockToken, mockContext);
                const sorteia = items.find((i: any) => i.label === 'sorteia');
                expect(sorteia.kind).toBe(vscode.CompletionItemKind.Function);
            });
        });
    });

    describe('documentação dos itens', () => {
        it('escreva tem documentação correta', () => {
            const doc = criarDocumento(['']);
            const pos = criarPosicao(0, 0);
            const items = provedor.provideCompletionItems(doc, pos, mockToken, mockContext);
            const escreva = items.find((i: any) => i.label === 'escreva');
            expect(escreva.documentation).toContain('Escreve na saída');
        });

        it('inteiro tem documentação correta', () => {
            const doc = criarDocumento(['']);
            const pos = criarPosicao(0, 0);
            const items = provedor.provideCompletionItems(doc, pos, mockToken, mockContext);
            const inteiro = items.find((i: any) => i.label === 'inteiro');
            expect(inteiro.documentation).toContain('Tipo inteiro');
        });

        it('verdadeiro tem documentação correta', () => {
            const doc = criarDocumento(['']);
            const pos = criarPosicao(0, 0);
            const items = provedor.provideCompletionItems(doc, pos, mockToken, mockContext);
            const verdadeiro = items.find((i: any) => i.label === 'verdadeiro');
            expect(verdadeiro.documentation).toContain('Verdadeiro');
        });

        it('programa (palavra reservada) tem documentação correta', () => {
            const doc = criarDocumento(['']);
            const pos = criarPosicao(0, 0);
            const items = provedor.provideCompletionItems(doc, pos, mockToken, mockContext);
            const programa = items.find((i: any) => i.label === 'programa');
            expect(programa.documentation).toContain('Bloco principal');
        });

        it('potencia tem documentação correta', () => {
            const doc = criarDocumento(['']);
            const pos = criarPosicao(0, 0);
            const items = provedor.provideCompletionItems(doc, pos, mockToken, mockContext);
            const potencia = items.find((i: any) => i.label === 'potencia');
            expect(potencia.documentation).toContain('Potência');
        });

        it('sorteia tem documentação correta', () => {
            const doc = criarDocumento(['']);
            const pos = criarPosicao(0, 0);
            const items = provedor.provideCompletionItems(doc, pos, mockToken, mockContext);
            const sorteia = items.find((i: any) => i.label === 'sorteia');
            expect(sorteia.documentation).toContain('Sorteia');
        });
    });

    describe('contagem total de itens', () => {
        it('retorna todos os itens esperados', () => {
            const doc = criarDocumento(['']);
            const pos = criarPosicao(0, 0);
            const items = provedor.provideCompletionItems(doc, pos, mockToken, mockContext);
            // 2 entrada/saída + 5 tipos + 2 constantes + 15 palavras reservadas +
            // 5 Calendario + 5 Matematica + 4 Texto + 3 Util = 41
            expect(items.length).toBe(41);
        });
    });
});