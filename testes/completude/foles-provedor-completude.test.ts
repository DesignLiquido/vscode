// @ts-nocheck
import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';

jest.mock('vscode', () => ({
    CompletionItemKind: {
        Property: 9,
        Function: 2,
        Interface: 7,
        Value: 12,
        Color: 15,
    },
    CompletionItem: class CompletionItem {
        constructor(public label: string, public kind?: number) {}
        documentation: any;
        detail: any;
        insertText: any;
        sortText: any;
    },
}), { virtual: true });

jest.mock('@designliquido/foles/extensao/lista-modificadores', () => ({
    __esModule: true,
    default: {
        'alinhamento': {
            nomeCss: 'text-align',
            descricao: 'Define o alinhamento do texto.',
        },
        'cor': {
            nomeCss: 'color',
            descricao: 'Define a cor do texto.',
        },
        'fundo': {
            nomeCss: 'background',
            descricao: 'Define o fundo.',
        },
        'margem': {
            nomeCss: 'margin',
            descricao: 'Define a margem.',
        },
        'recuo': {
            nomeCss: 'padding',
            descricao: 'Define o recuo interno.',
        },
    }
}));

jest.mock('@designliquido/foles/modificadores', () => ({
    Alinhamento: class Alinhamento {
        static nomeFolEs = 'alinhamento';
        static nomeCss = 'text-align';
        valoresAceitos = {
            esquerda: 'left',
            centro: 'center',
            direita: 'right',
        };
    },
    Fundo: class Fundo {
        static nomeFolEs = 'fundo';
        static nomeCss = 'background';
        valoresAceitos = {
            fixo: 'fixed',
            repetir: 'repeat',
        };
    },
    Margem: class Margem {
        static nomeFolEs = 'margem';
        static nomeCss = 'margin';
        valoresAceitos = {
            auto: 'auto',
        };
    },
}));

jest.mock('@designliquido/foles/modificadores/atributos/cores', () => ({
    cores: {
        azul: 'blue',
        vermelho: 'red',
    },
}));

jest.mock('@designliquido/foles/modificadores/atributos/globais', () => ({
    valoresGlobais: {
        herdar: 'inherit',
        inicial: 'initial',
    },
}));

jest.mock('@designliquido/foles/listas/cores', () => ({
    Cores: ['cor'],
}));

jest.mock('@designliquido/foles/valores/dicionario-valores', () => ({
    DicionarioValores: {
        calcular: class {},
        hsl: class {},
        hsla: class {},
        rgb: class {},
        rgba: class {},
    },
}));

jest.mock('@designliquido/foles/estruturas/dicionario-estruturas-lmht', () => ({
    DicionarioEstruturasLmht: {
        'divisao': class { tagHtml = 'div'; },
        'paragrafo': class { tagHtml = 'p'; },
        'lmht': class { tagHtml = 'html'; },
    }
}));

import { FolesProvedorCompletude } from '../../fontes/completude/foles-provedor-completude';

function criarDocumento(linhas: string[] = ['']): any {
    return {
        lineAt: jest.fn((linha: any) => {
            const indice = typeof linha === 'number' ? linha : linha.line ?? 0;
            return { text: linhas[indice] ?? '' };
        }),
        getText: jest.fn(() => linhas.join('\n')),
    };
}

function criarPosicao(line = 0, character = 0): any {
    return { line, character };
}

function completar(provedor: any, linhas: string[], linha: number, caractere: number): any[] {
    return provedor.provideCompletionItems(
        criarDocumento(linhas),
        criarPosicao(linha, caractere),
        { isCancellationRequested: false },
        {}
    );
}

function rotulos(itens: any[]): string[] {
    return itens.map(item => item.label);
}

describe('FolesProvedorCompletude', () => {
    let provedor: any;

    beforeEach(() => {
        jest.clearAllMocks();
        provedor = new FolesProvedorCompletude();
    });

    it('instância criada com sucesso', () => {
        expect(provedor).toBeDefined();
        expect(typeof provedor.provideCompletionItems).toBe('function');
    });

    describe('nível raiz', () => {
        it('retorna somente seletores LMHT fora de blocos', () => {
            const itens = completar(provedor, [''], 0, 0);

            expect(itens).toHaveLength(3);
            expect(itens.every(item => item.kind === vscode.CompletionItemKind.Interface)).toBe(true);
            expect(rotulos(itens)).toEqual(['divisao', 'paragrafo', 'lmht']);
        });

        it('retorna seletores novamente depois do fechamento do bloco', () => {
            const linhas = ['.classe {', '    cor: vermelho;', '}', ''];
            const itens = completar(provedor, linhas, 3, 0);

            expect(itens).toHaveLength(3);
            expect(itens.every(item => item.kind === vscode.CompletionItemKind.Interface)).toBe(true);
        });

        it('documenta o equivalente HTML do seletor', () => {
            const itens = completar(provedor, [''], 0, 0);
            const divisao = itens.find(item => item.label === 'divisao');

            expect(divisao.documentation).toBe('Equivalente em HTML: <div>');
        });
    });

    describe('dentro de bloco antes dos dois-pontos', () => {
        it('retorna somente modificadores e não inclui seletores', () => {
            const itens = completar(provedor, ['.classe {', '    ', '}'], 1, 4);

            expect(itens).toHaveLength(5);
            expect(itens.every(item => item.kind === vscode.CompletionItemKind.Property)).toBe(true);
            expect(itens.some(item => item.kind === vscode.CompletionItemKind.Interface)).toBe(false);
        });

        it('inclui os modificadores disponíveis', () => {
            const itens = completar(provedor, ['.classe {', '    ', '}'], 1, 4);

            expect(rotulos(itens)).toEqual([
                'alinhamento',
                'cor',
                'fundo',
                'margem',
                'recuo',
            ]);
        });

        it('inclui descrição e equivalente CSS do modificador', () => {
            const itens = completar(provedor, ['.classe {', '    ', '}'], 1, 4);
            const cor = itens.find(item => item.label === 'cor');

            expect(cor.documentation).toContain('Define a cor do texto.');
            expect(cor.documentation).toContain('Equivalente em CSS: color');
            expect(cor.detail).toBe('CSS: color');
        });

        it('volta a sugerir modificadores depois de ponto e vírgula', () => {
            const linha = '    cor: vermelho; ';
            const itens = completar(provedor, ['.classe {', linha, '}'], 1, linha.length);

            expect(itens).toHaveLength(5);
            expect(itens.every(item => item.kind === vscode.CompletionItemKind.Property)).toBe(true);
        });
    });

    describe('após o nome do modificador', () => {
        it('sugere valores específicos do modificador', () => {
            const linha = '    alinhamento: ';
            const itens = completar(provedor, ['.classe {', linha, '}'], 1, linha.length);

            expect(rotulos(itens)).toEqual(expect.arrayContaining([
                'centro',
                'direita',
                'esquerda',
            ]));
            expect(itens.find(item => item.label === 'centro').detail)
                .toBe('Equivalente em CSS: center');
        });

        it('não inclui seletores nem modificadores ao completar valores', () => {
            const linha = '    alinhamento: ';
            const itens = completar(provedor, ['.classe {', linha, '}'], 1, linha.length);

            expect(itens.some(item => item.kind === vscode.CompletionItemKind.Interface)).toBe(false);
            expect(itens.some(item => item.kind === vscode.CompletionItemKind.Property)).toBe(false);
        });

        it('inclui valores globais válidos para qualquer modificador conhecido', () => {
            const linha = '    margem: ';
            const itens = completar(provedor, ['.classe {', linha, '}'], 1, linha.length);

            expect(rotulos(itens)).toEqual(expect.arrayContaining(['herdar', 'inicial']));
            expect(itens.find(item => item.label === 'herdar').kind)
                .toBe(vscode.CompletionItemKind.Value);
        });

        it('não sugere valores para modificador desconhecido', () => {
            const linha = '    inexistente: ';
            const itens = completar(provedor, ['.classe {', linha, '}'], 1, linha.length);

            expect(itens).toEqual([]);
        });

        it('reconhece declaração na mesma linha da abertura do bloco', () => {
            const linha = '.classe { alinhamento: ';
            const itens = completar(provedor, [linha], 0, linha.length);

            expect(rotulos(itens)).toEqual(expect.arrayContaining(['centro', 'esquerda']));
        });
    });

    describe('completude de cores', () => {
        it('sugere nomes de cores após cor:', () => {
            const linha = '    cor: ';
            const itens = completar(provedor, ['.classe {', linha, '}'], 1, linha.length);

            expect(rotulos(itens)).toEqual(expect.arrayContaining(['azul', 'vermelho']));
        });

        it('marca cores com CompletionItemKind.Color para amostra visual', () => {
            const linha = '    cor: ';
            const itens = completar(provedor, ['.classe {', linha, '}'], 1, linha.length);
            const vermelho = itens.find(item => item.label === 'vermelho');

            expect(vermelho.kind).toBe(vscode.CompletionItemKind.Color);
            expect(vermelho.detail).toBe('Equivalente em CSS: red');
            expect(vermelho.insertText).toBe('vermelho');
        });

        it('sugere funções de cor existentes no dicionário de valores', () => {
            const linha = '    cor: ';
            const itens = completar(provedor, ['.classe {', linha, '}'], 1, linha.length);

            expect(rotulos(itens)).toEqual(expect.arrayContaining([
                'hsl',
                'hsla',
                'rgb',
                'rgba',
            ]));
            expect(itens.find(item => item.label === 'rgb').kind)
                .toBe(vscode.CompletionItemKind.Function);
        });

        it('não inclui função genérica que não é função de cor', () => {
            const linha = '    cor: ';
            const itens = completar(provedor, ['.classe {', linha, '}'], 1, linha.length);

            expect(rotulos(itens)).not.toContain('calcular');
        });

        it('não duplica valores quando um valor específico também é uma cor', () => {
            const linha = '    cor: ';
            const itens = completar(provedor, ['.classe {', linha, '}'], 1, linha.length);
            const vermelhos = itens.filter(item => item.label === 'vermelho');

            expect(vermelhos).toHaveLength(1);
        });
    });

    it('registra dois-pontos como gatilho de completude de FolEs', () => {
        const arquivoAtivacao = fs.readFileSync(
            path.resolve(__dirname, '../../fontes/ativacao-linguagens.ts'),
            'utf-8'
        );

        expect(arquivoAtivacao).toMatch(
            /new FolesProvedorCompletude\(\)\s*,\s*['"]:['"]/
        );
    });
});
