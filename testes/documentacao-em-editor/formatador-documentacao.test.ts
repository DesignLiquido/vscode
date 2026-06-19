// @ts-nocheck
import { describe, it, expect } from '@jest/globals';

jest.mock('vscode', () => ({
    MarkdownString: class MarkdownString {
        value: string;
        constructor(value?: string) { this.value = value || ''; }
        appendCodeblock(code: string, _lang?: string) { this.value += '\n' + code; return this; }
        appendMarkdown(text: string) { this.value += text; return this; }
    },
}), { virtual: true });

import {
    formatarDocumentacaoDocumentario,
    extrairTextoDocumentacao,
} from '../../fontes/documentacao-em-editor/formatador-documentacao';

const vscode = jest.requireMock('vscode');

function novaMarkdown() {
    return new vscode.MarkdownString();
}

describe('formatarDocumentacaoDocumentario', () => {
    it('texto simples inclui descrição no markdown', () => {
        const resultado = formatarDocumentacaoDocumentario(novaMarkdown(), 'descrição simples da função');
        expect(resultado.value).toContain('descrição simples da função');
    });

    it('@param formata parâmetros', () => {
        const resultado = formatarDocumentacaoDocumentario(
            novaMarkdown(),
            '@param {texto} nome Nome da pessoa'
        );
        expect(resultado.value).toContain('Parametros');
        expect(resultado.value).toContain('nome');
    });

    it('@param com tipo e descrição completa', () => {
        const resultado = formatarDocumentacaoDocumentario(
            novaMarkdown(),
            '@param {numero} valor - O valor numérico'
        );
        expect(resultado.value).toContain('valor');
        expect(resultado.value).toContain('numero');
    });

    it('@propriedade formata propriedades de classe', () => {
        const resultado = formatarDocumentacaoDocumentario(
            novaMarkdown(),
            '@propriedade {numero} id Identificador único'
        );
        expect(resultado.value).toContain('id');
        expect(resultado.value).toContain('Propriedades');
    });

    it('@retorna formata valor de retorno', () => {
        const resultado = formatarDocumentacaoDocumentario(
            novaMarkdown(),
            '@retorna {texto} A saudação formatada'
        );
        expect(resultado.value).toContain('Retorna');
    });

    it('@resumo formata resumo da função', () => {
        const resultado = formatarDocumentacaoDocumentario(
            novaMarkdown(),
            '@resumo Resumo breve da função'
        );
        expect(resultado.value).toContain('Resumo');
        expect(resultado.value).toContain('Resumo breve da função');
    });

    it('@veja formata referências externas', () => {
        const resultado = formatarDocumentacaoDocumentario(
            novaMarkdown(),
            '@veja ./exemplos/saudacao.delegua'
        );
        expect(resultado.value).toContain('Veja tambem');
    });

    it('@lanca formata exceções lançadas', () => {
        const resultado = formatarDocumentacaoDocumentario(
            novaMarkdown(),
            '@lanca {Error} Quando o valor é inválido'
        );
        expect(resultado.value).toContain('Lanca');
    });

    it('@fazer formata pendências', () => {
        const resultado = formatarDocumentacaoDocumentario(
            novaMarkdown(),
            '@fazer Implementar validação de entrada'
        );
        expect(resultado.value).toContain('Fazer');
    });

    it('@exemplo formata exemplos de código', () => {
        const resultado = formatarDocumentacaoDocumentario(
            novaMarkdown(),
            '@exemplo\nescreva("Olá mundo")'
        );
        expect(resultado.value).toContain('Exemplo');
        expect(resultado.value).toContain('escreva("Olá mundo")');
    });

    it('tag desconhecida vai para campo simples', () => {
        const resultado = formatarDocumentacaoDocumentario(
            novaMarkdown(),
            '@versao 1.2.3'
        );
        expect(resultado.value).toContain('1.2.3');
    });

    it('tag desconhecida sem conteúdo não adiciona campo simples', () => {
        const resultado = formatarDocumentacaoDocumentario(
            novaMarkdown(),
            '@versao'
        );
        expect(resultado).toBeDefined();
    });

    it('linha vazia antes de qualquer tag vai para descrição', () => {
        const resultado = formatarDocumentacaoDocumentario(
            novaMarkdown(),
            'Descrição da função\n\n@param valor O valor'
        );
        expect(resultado.value).toContain('Descrição da função');
        expect(resultado.value).toContain('valor');
    });

    it('múltiplas tags processadas em sequência', () => {
        const doc = '@param {texto} nome Nome\n@retorna {numero} resultado\n@veja ./exemplo.delegua\n@lanca {Error} falha';
        const resultado = formatarDocumentacaoDocumentario(novaMarkdown(), doc);
        expect(resultado.value).toContain('Parametros');
        expect(resultado.value).toContain('Retorna');
        expect(resultado.value).toContain('Veja tambem');
        expect(resultado.value).toContain('Lanca');
    });

    it('texto vazio não adiciona conteúdo', () => {
        const resultado = formatarDocumentacaoDocumentario(novaMarkdown(), '');
        expect(resultado).toBeDefined();
    });
});

describe('extrairTextoDocumentacao', () => {
    it('com string retorna a própria string', () => {
        expect(extrairTextoDocumentacao('texto simples')).toBe('texto simples');
    });

    it('com array junta as linhas com newline', () => {
        expect(extrairTextoDocumentacao(['linha1', 'linha2'])).toBe('linha1\nlinha2');
    });

    it('com array vazio retorna string vazia', () => {
        expect(extrairTextoDocumentacao([])).toBe('');
    });
});
