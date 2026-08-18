// @ts-nocheck
import { describe, it, expect, jest } from '@jest/globals';

jest.mock('vscode', () => ({
    Range: class Range {
        constructor(public startLine: number, public startCharacter: number, public endLine: number, public endCharacter: number) {}
    },
    Diagnostic: class Diagnostic {
        constructor(public range: any, public message: string, public severity: number) {}
    },
    DiagnosticSeverity: {
        Error: 0,
        Warning: 1,
        Information: 2,
        Hint: 3,
    },
}), { virtual: true });

import { validarLmht } from '../../fontes/analise-codigo/validar-lmht';

/**
 * Documento simulado o suficiente para `validarLmht`: `getText()`, `lineCount`
 * e `lineAt(i)`.
 */
function criarDocumento(texto: string): any {
    const linhas = texto.split('\n');
    return {
        getText: jest.fn(() => texto),
        lineCount: linhas.length,
        lineAt: jest.fn((i: number) => ({ text: linhas[i] })),
    };
}

describe('validarLmht', () => {
    it('não reclama de uma estrutura conhecida', () => {
        const documento = criarDocumento('<corpo><paragrafo>Olá</paragrafo></corpo>');
        const diagnosticos = validarLmht(documento);
        expect(diagnosticos.some((d: any) => d.message.includes('desconhecida'))).toBe(false);
    });

    it('reclama de uma estrutura genuinamente desconhecida', () => {
        const documento = criarDocumento('<estrutura-que-nao-existe></estrutura-que-nao-existe>');
        const diagnosticos = validarLmht(documento);
        expect(diagnosticos.some((d: any) => d.message.includes("'estrutura-que-nao-existe'"))).toBe(true);
    });

    it('não reclama de <conteudo /> (marcador especial de layout)', () => {
        const documento = criarDocumento('<corpo><navegacao>Nav</navegacao><conteudo /></corpo>');
        const diagnosticos = validarLmht(documento);
        expect(diagnosticos.some((d: any) => d.message.includes('conteudo'))).toBe(false);
    });

    it('não reclama de <conteúdo /> (forma acentuada)', () => {
        const documento = criarDocumento('<corpo><navegação>Nav</navegação><conteúdo /></corpo>');
        const diagnosticos = validarLmht(documento);
        expect(diagnosticos.some((d: any) => d.message.includes('conteúdo'))).toBe(false);
    });

    it('não reclama do fechamento de <conteudo></conteudo> em par', () => {
        const documento = criarDocumento('<corpo><conteudo></conteudo></corpo>');
        const diagnosticos = validarLmht(documento);
        expect(diagnosticos).toEqual([]);
    });
});
