// @ts-nocheck
import { describe, it, expect, jest, beforeEach } from '@jest/globals';

jest.mock('vscode', () => ({
    MarkdownString: class MarkdownString {
        value: string;
        constructor(value?: string) { this.value = value || ''; }
        appendCodeblock(code: string, _lang?: string) { this.value += '\n' + code; return this; }
        appendMarkdown(text: string) { this.value += text; return this; }
    },
    Hover: class Hover {
        constructor(public contents: any) {}
    },
}), { virtual: true });

jest.mock('../../fontes/bibliotecas/dialetos/portugol-studio', () => ({
    primitivasEntradaSaidaPortugolStudio: [
        { nome: 'escreva', descricao: 'Escreve na saída padrão.', documentacao: '# `escreva()`\n Escreve no dispositivo de saída padrão.', exemploCodigo: '`escreva("Olá mundo")`' },
        { nome: 'leia', descricao: 'Lê valores de entrada.', documentacao: '# `leia()`\n Lê valores digitados.', exemploCodigo: '`leia(variavel)`' },
    ],
    tiposPortugolStudio: [
        { nome: 'inteiro', descricao: 'Tipo numérico sem casas decimais.', documentacao: '# `inteiro`\n Tipo numérico sem casas decimais.', exemploCodigo: '`inteiro idade = 18`' },
        { nome: 'real', descricao: 'Tipo numérico com casas decimais.', documentacao: '# `real`\n Tipo numérico com casas decimais.', exemploCodigo: '`real media = 7.5`' },
        { nome: 'cadeia', descricao: 'Tipo textual para sequências.', documentacao: '# `cadeia`\n Tipo para textos.', exemploCodigo: '`cadeia nome = "Maria"`' },
        { nome: 'logico', descricao: 'Tipo lógico booleano.', documentacao: '# `logico`\n Tipo booleano.', exemploCodigo: '`logico ativo = verdadeiro`' },
    ],
    constantesPortugolStudio: [
        { nome: 'verdadeiro', descricao: 'Constante lógica verdadeiro.', documentacao: '# `verdadeiro`\n Valor lógico verdadeiro.', exemploCodigo: '`logico ativo = verdadeiro`' },
        { nome: 'falso', descricao: 'Constante lógica falso.', documentacao: '# `falso`\n Valor lógico falso.', exemploCodigo: '`logico ativo = falso`' },
    ],
    palavrasReservadasPortugolStudio: [
        { nome: 'programa', descricao: 'Bloco principal do programa.', documentacao: '# `programa`\n Bloco principal.', exemploCodigo: '`programa { }`' },
        { nome: 'funcao', descricao: 'Declara uma nova função.', documentacao: '# `funcao`\n Declara função.', exemploCodigo: '`funcao inteiro somar() { }`' },
        { nome: 'se', descricao: 'Estrutura de decisão.', documentacao: '# `se`\n Estrutura de decisão.', exemploCodigo: '`se (condicao) { }`' },
        { nome: 'senao', descricao: 'Bloco alternativo.', documentacao: '# `senao`\n Bloco senão.', exemploCodigo: '`senao { }`' },
        { nome: 'enquanto', descricao: 'Loop enquanto.', documentacao: '# `enquanto`\n Loop enquanto.', exemploCodigo: '`enquanto (condicao) { }`' },
        { nome: 'para', descricao: 'Loop para estilo C.', documentacao: '# `para`\n Loop para estilo C.', exemploCodigo: '`para (inteiro i = 0; i < 6; i++) { }`' },
        { nome: 'faca', descricao: 'Loop faça-enquanto.', documentacao: '# `faca`\n Loop faça.', exemploCodigo: '`faca { } enquanto ()`' },
        { nome: 'escolha', descricao: 'Seleção múltipla.', documentacao: '# `escolha`\n Seleção múltipla.', exemploCodigo: '`escolha (x) { caso: }`' },
        { nome: 'caso', descricao: 'Caso em escolha.', documentacao: '# `caso`\n Caso.', exemploCodigo: '`caso valor:`' },
        { nome: 'contrario', descricao: 'Caso padrão.', documentacao: '# `contrario`\n Caso padrão.', exemploCodigo: '`contrario:`' },
        { nome: 'pare', descricao: 'Interrompe loop.', documentacao: '# `pare`\n Interrompe loop.', exemploCodigo: '`pare`' },
        { nome: 'retorne', descricao: 'Retorna valor.', documentacao: '# `retorne`\n Retorna valor.', exemploCodigo: '`retorne x`' },
        { nome: 'const', descricao: 'Declara constante.', documentacao: '# `const`\n Declara constante.', exemploCodigo: '`const inteiro PI = 3.14`' },
        { nome: 'inclua', descricao: 'Inclui biblioteca.', documentacao: '# `inclua`\n Inclui biblioteca.', exemploCodigo: '`inclua biblioteca Matematica`' },
        { nome: 'biblioteca', descricao: 'Palavra-chave biblioteca.', documentacao: '# `biblioteca`\n Palavra-chave.', exemploCodigo: '`inclua biblioteca X`' },
    ],
    calendarioPortugolStudio: [
        { nome: 'dia_mes_atual', descricao: 'Dia do mês.', documentacao: '# `Calendario.dia_mes_atual()`\n Retorna o dia do mês.', exemploCodigo: '`dia = Calendario.dia_mes_atual()`' },
    ],
    matematicaPortugolStudio: [
        { nome: 'potencia', descricao: 'Exponenciação.', documentacao: '# `Matematica.potencia()`\n Potência.', exemploCodigo: '`Matematica.potencia(2, 3)`' },
        { nome: 'raiz', descricao: 'Radiciação.', documentacao: '# `Matematica.raiz()`\n Raiz.', exemploCodigo: '`Matematica.raiz(9, 2)`' },
    ],
    textoPortugolStudio: [
        { nome: 'numero_caracteres', descricao: 'Conta caracteres.', documentacao: '# `Texto.numero_caracteres()`\n Conta.', exemploCodigo: '`Texto.numero_caracteres("abc")`' },
    ],
    utilPortugolStudio: [
        { nome: 'sorteia', descricao: 'Sorteia número.', documentacao: '# `Util.sorteia()`\n Sorteia.', exemploCodigo: '`Util.sorteia(1, 100)`' },
    ],
}), { virtual: true });

import { PortugolStudioProvedorDocumentacaoEmEditor } from '../../fontes/documentacao-em-editor/portugol-studio-provedor-documentacao-em-editor';

function criarDocumento(palavra: string, linhaTexto?: string): any {
    return {
        lineAt: jest.fn().mockReturnValue({ text: linhaTexto ?? palavra }),
        getText: jest.fn((range?: any) => range ? palavra : ''),
        getWordRangeAtPosition: jest.fn().mockReturnValue({}),
    };
}

describe('PortugolStudioProvedorDocumentacaoEmEditor', () => {
    let provedor: any;
    const mockPos: any = { line: 0, character: 5 };
    const mockToken: any = {};

    beforeEach(() => {
        jest.clearAllMocks();
        provedor = new PortugolStudioProvedorDocumentacaoEmEditor();
    });

    it('instância criada com sucesso', () => {
        expect(provedor).toBeDefined();
        expect(typeof provedor.provideHover).toBe('function');
    });

    it('retorna undefined para palavra não encontrada', () => {
        const result = provedor.provideHover(criarDocumento('desconhecida'), mockPos, mockToken);
        expect(result).toBeUndefined();
    });

    describe('primitivas de entrada/saída', () => {
        it('retorna Hover para escreva', () => {
            const result = provedor.provideHover(criarDocumento('escreva'), mockPos, mockToken);
            expect(result).toBeDefined();
            expect(result.contents).toBeDefined();
        });

        it('retorna Hover para leia', () => {
            const result = provedor.provideHover(criarDocumento('leia'), mockPos, mockToken);
            expect(result).toBeDefined();
            expect(result.contents.value).toContain('Lê valores');
        });

        it('escreva com exemploCodigo contém código', () => {
            const result = provedor.provideHover(criarDocumento('escreva'), mockPos, mockToken);
            expect(result.contents.value).toContain('Olá mundo');
        });
    });

    describe('tipos', () => {
        it('retorna Hover para tipo inteiro', () => {
            const result = provedor.provideHover(criarDocumento('inteiro'), mockPos, mockToken);
            expect(result).toBeDefined();
            expect(result.contents.value).toContain('Tipo numérico');
        });

        it('retorna Hover para tipo real', () => {
            const result = provedor.provideHover(criarDocumento('real'), mockPos, mockToken);
            expect(result).toBeDefined();
            expect(result.contents.value).toContain('casas decimais');
        });

        it('retorna Hover para tipo cadeia', () => {
            const result = provedor.provideHover(criarDocumento('cadeia'), mockPos, mockToken);
            expect(result).toBeDefined();
            expect(result.contents.value).toContain('textos');
        });

        it('retorna Hover para tipo logico', () => {
            const result = provedor.provideHover(criarDocumento('logico'), mockPos, mockToken);
            expect(result).toBeDefined();
            expect(result.contents.value).toContain('booleano');
        });

        it('inteiro com exemploCodigo contém código', () => {
            const result = provedor.provideHover(criarDocumento('inteiro'), mockPos, mockToken);
            expect(result.contents.value).toContain('idade = 18');
        });
    });

    describe('constantes', () => {
        it('retorna Hover para verdadeiro', () => {
            const result = provedor.provideHover(criarDocumento('verdadeiro'), mockPos, mockToken);
            expect(result).toBeDefined();
            expect(result.contents.value).toContain('verdadeiro');
        });

        it('retorna Hover para falso', () => {
            const result = provedor.provideHover(criarDocumento('falso'), mockPos, mockToken);
            expect(result).toBeDefined();
            expect(result.contents.value).toContain('falso');
        });
    });

    describe('palavras reservadas', () => {
        it('retorna Hover para programa', () => {
            const result = provedor.provideHover(criarDocumento('programa'), mockPos, mockToken);
            expect(result).toBeDefined();
            expect(result.contents.value).toContain('Bloco principal');
        });

        it('programa com exemploCodigo contém estrutura', () => {
            const result = provedor.provideHover(criarDocumento('programa'), mockPos, mockToken);
            expect(result.contents.value).toContain('programa { }');
        });

        it('retorna Hover para funcao', () => {
            const result = provedor.provideHover(criarDocumento('funcao'), mockPos, mockToken);
            expect(result).toBeDefined();
            expect(result.contents.value).toContain('Declara');
        });

        it('retorna Hover para se', () => {
            const result = provedor.provideHover(criarDocumento('se'), mockPos, mockToken);
            expect(result).toBeDefined();
            expect(result.contents.value).toContain('decisão');
        });

        it('retorna Hover para senao', () => {
            const result = provedor.provideHover(criarDocumento('senao'), mockPos, mockToken);
            expect(result).toBeDefined();
            expect(result.contents.value).toContain('senão');
        });

        it('retorna Hover para enquanto', () => {
            const result = provedor.provideHover(criarDocumento('enquanto'), mockPos, mockToken);
            expect(result).toBeDefined();
            expect(result.contents.value).toContain('Loop');
        });

        it('retorna Hover para para', () => {
            const result = provedor.provideHover(criarDocumento('para'), mockPos, mockToken);
            expect(result).toBeDefined();
            expect(result.contents.value).toContain('para');
        });

        it('retorna Hover para faca', () => {
            const result = provedor.provideHover(criarDocumento('faca'), mockPos, mockToken);
            expect(result).toBeDefined();
            expect(result.contents.value).toContain('faça');
        });

        it('retorna Hover para escolha', () => {
            const result = provedor.provideHover(criarDocumento('escolha'), mockPos, mockToken);
            expect(result).toBeDefined();
            expect(result.contents.value).toContain('Seleção');
        });

        it('retorna Hover para caso', () => {
            const result = provedor.provideHover(criarDocumento('caso'), mockPos, mockToken);
            expect(result).toBeDefined();
            expect(result.contents.value).toContain('Caso');
        });

        it('retorna Hover para contrario', () => {
            const result = provedor.provideHover(criarDocumento('contrario'), mockPos, mockToken);
            expect(result).toBeDefined();
            expect(result.contents.value).toContain('padrão');
        });

        it('retorna Hover para pare', () => {
            const result = provedor.provideHover(criarDocumento('pare'), mockPos, mockToken);
            expect(result).toBeDefined();
            expect(result.contents.value).toContain('Interrompe');
        });

        it('retorna Hover para retorne', () => {
            const result = provedor.provideHover(criarDocumento('retorne'), mockPos, mockToken);
            expect(result).toBeDefined();
            expect(result.contents.value).toContain('Retorna');
        });

        it('retorna Hover para const', () => {
            const result = provedor.provideHover(criarDocumento('const'), mockPos, mockToken);
            expect(result).toBeDefined();
            expect(result.contents.value).toContain('constante');
        });

        it('retorna Hover para inclua', () => {
            const result = provedor.provideHover(criarDocumento('inclua'), mockPos, mockToken);
            expect(result).toBeDefined();
            expect(result.contents.value).toContain('biblioteca');
        });

        it('retorna Hover para biblioteca', () => {
            const result = provedor.provideHover(criarDocumento('biblioteca'), mockPos, mockToken);
            expect(result).toBeDefined();
            expect(result.contents.value).toContain('Palavra-chave');
        });
    });

    describe('funções de biblioteca', () => {
        it('retorna Hover para função de calendário (dia_mes_atual)', () => {
            const result = provedor.provideHover(criarDocumento('dia_mes_atual'), mockPos, mockToken);
            expect(result).toBeDefined();
            expect(result.contents.value).toContain('dia do mês');
        });

        it('retorna Hover para função matemática (potencia)', () => {
            const result = provedor.provideHover(criarDocumento('potencia'), mockPos, mockToken);
            expect(result).toBeDefined();
            expect(result.contents.value).toContain('Potência');
        });

        it('potencia com exemploCodigo contém código', () => {
            const result = provedor.provideHover(criarDocumento('potencia'), mockPos, mockToken);
            expect(result.contents.value).toContain('potencia(2, 3)');
        });

        it('retorna Hover para função de texto (numero_caracteres)', () => {
            const result = provedor.provideHover(criarDocumento('numero_caracteres'), mockPos, mockToken);
            expect(result).toBeDefined();
            expect(result.contents.value).toContain('Conta');
        });

        it('retorna Hover para função util (sorteia)', () => {
            const result = provedor.provideHover(criarDocumento('sorteia'), mockPos, mockToken);
            expect(result).toBeDefined();
            expect(result.contents.value).toContain('Sorteia');
        });

        it('sorteia com exemploCodigo contém código', () => {
            const result = provedor.provideHover(criarDocumento('sorteia'), mockPos, mockToken);
            expect(result.contents.value).toContain('sorteia(1, 100)');
        });
    });

    describe('exemploCodigo em codeblocks', () => {
        it('palavra com exemploCodigo chama appendCodeblock (inteiro)', () => {
            const result = provedor.provideHover(criarDocumento('inteiro'), mockPos, mockToken);
            expect(result.contents.value).toContain('idade = 18');
        });

        it('palavra com exemploCodigo chama appendCodeblock (potencia)', () => {
            const result = provedor.provideHover(criarDocumento('potencia'), mockPos, mockToken);
            expect(result.contents.value).toContain('Matematica.potencia');
        });

        it('palavra sem exemploCodigo não contém quebra extra', () => {
            const result = provedor.provideHover(criarDocumento('biblioteca'), mockPos, mockToken);
            expect(result.contents.value).toBeDefined();
            expect(result.contents.value).not.toContain('undefined');
        });
    });
});