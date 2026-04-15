// @ts-nocheck
import { describe, it, expect, jest, beforeEach } from '@jest/globals';

class PositionMock {
    line: number; character: number;
    constructor(line: number, character: number) {
        this.line = line;
        this.character = character;
    }
    translate(dLine: number, dChar: number): PositionMock {
        return new PositionMock(this.line + dLine, this.character + dChar);
    }
    isEqual(other: PositionMock): boolean {
        return this.line === other.line && this.character === other.character;
    }
}

class RangeMock {
    start: PositionMock; end: PositionMock;
    constructor(start: PositionMock, end: PositionMock) {
        this.start = start;
        this.end = end;
    }
}

class SelectionMock {
    start: PositionMock; end: PositionMock; active: PositionMock;
    constructor(start: PositionMock, end: PositionMock) {
        this.start = start;
        this.end = end;
        this.active = start;
    }
}

const mockGetConfiguration = jest.fn();
const mockShowErrorMessage = jest.fn();

jest.mock('vscode', () => ({
    window: { activeTextEditor: null, showErrorMessage: mockShowErrorMessage },
    workspace: { getConfiguration: mockGetConfiguration },
    Position: PositionMock,
    Range: RangeMock,
    Selection: SelectionMock,
}), { virtual: true });

import { tentarFecharTagLmht } from '../../../fontes/linguagens/lmht/fechamento-estruturas';

const mockVscode = jest.requireMock('vscode');

function criarEvento(texto: string, rangeStart = new PositionMock(0, 5), rangeEnd = new PositionMock(0, 5)): any {
    return {
        contentChanges: [{
            text: texto,
            range: new RangeMock(rangeStart, rangeEnd),
        }],
    };
}

function criarEditor(linhaTexto = '<div>', textoDoc = '', selStart = new PositionMock(0, 5)): any {
    return {
        document: {
            getText: jest.fn().mockReturnValue(textoDoc),
            lineAt: jest.fn().mockReturnValue({ text: linhaTexto }),
            uri: 'file:///teste.lmht',
        },
        selection: new SelectionMock(selStart, selStart),
        edit: jest.fn().mockImplementation((cb) => {
            cb({ insert: jest.fn() });
            return Promise.resolve(true);
        }),
        get selection() { return new SelectionMock(selStart, selStart); },
        set selection(_s: any) {},
    };
}

describe('tentarFecharTagLmht', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockVscode.window.activeTextEditor = null;
        mockGetConfiguration.mockReturnValue({
            get: jest.fn((key: string, def?: any) => {
                if (key === 'habilitarFechamentoEstruturasLmht') return true;
                if (key === 'estruturasExcluidas') return [];
                if (key === 'modoSublimeText3') return false;
                if (key === 'habilitarFechamentoAutomaticoEstruturasLmht') return true;
                if (key === 'modoTotal') return false;
                if (key === 'inserirEspacoAntesDeAutoFechamentoDeEstrutura') return false;
                return def;
            }),
        });
    });

    it('retorna cedo quando não há contentChanges', () => {
        tentarFecharTagLmht({ contentChanges: [] } as any);
        // Não lança erro
    });

    it('retorna cedo quando texto não é ">" nem "/"', () => {
        tentarFecharTagLmht(criarEvento('a'));
        // Sem editor ativo, nem mesmo tenta acessar
    });

    it('retorna cedo quando não há editor ativo', () => {
        mockVscode.window.activeTextEditor = null;
        tentarFecharTagLmht(criarEvento('>'));
        // Retorna sem error
    });

    it('retorna cedo quando habilitarFechamentoEstruturasLmht = false', () => {
        const editor = criarEditor();
        mockVscode.window.activeTextEditor = editor;
        mockGetConfiguration.mockReturnValue({
            get: jest.fn((key: string, def?: any) => {
                if (key === 'habilitarFechamentoEstruturasLmht') return false;
                return def;
            }),
        });
        tentarFecharTagLmht(criarEvento('>'));
        expect(editor.edit).not.toHaveBeenCalled();
    });

    it('">" fecha tag aberta — insere tag de fechamento', () => {
        const editor = criarEditor('<div>', '', new PositionMock(0, 4));
        mockVscode.window.activeTextEditor = editor;
        tentarFecharTagLmht(criarEvento('>'));
        expect(editor.edit).toHaveBeenCalled();
    });

    it('">" sem tag para fechar — edit não chamado', () => {
        // Linha sem tag aberta
        const editor = criarEditor('texto simples', '', new PositionMock(0, 13));
        mockVscode.window.activeTextEditor = editor;
        tentarFecharTagLmht(criarEvento('>'));
        // Regex não bate, edit não chamado
        expect(editor.edit).not.toHaveBeenCalled();
    });

    it('"/" com texto "</" insere fechamento (modo sublime)', () => {
        mockGetConfiguration.mockReturnValue({
            get: jest.fn((key: string, def?: any) => {
                if (key === 'habilitarFechamentoEstruturasLmht') return true;
                if (key === 'estruturasExcluidas') return [];
                if (key === 'modoSublimeText3') return true;
                if (key === 'habilitarFechamentoAutomaticoEstruturasLmht') return true;
                if (key === 'modoTotal') return false;
                if (key === 'inserirEspacoAntesDeAutoFechamentoDeEstrutura') return false;
                return def;
            }),
        });
        const textoDoc = '<div></';
        const editor = criarEditor('<div></');
        editor.document.getText = jest.fn().mockReturnValue(textoDoc);
        mockVscode.window.activeTextEditor = editor;
        tentarFecharTagLmht(criarEvento('/'));
        // Em modo sublime com "</", tenta fechar a tag
        expect(editor.edit).toHaveBeenCalled();
    });

    it('auto-fechamento de tag "/" adiciona ">"', () => {
        const linhaTexto = '<div/';
        const editor = criarEditor(linhaTexto, '', new PositionMock(0, 4));
        mockVscode.window.activeTextEditor = editor;
        const evento = criarEvento('/');
        tentarFecharTagLmht(evento);
        expect(editor.edit).toHaveBeenCalled();
    });
});
