import * as fs from 'fs';
import * as path from 'path';

type CorpoSnippet = string | string[];

interface Snippet {
    prefix: string | string[];
    body: CorpoSnippet;
    description: string;
}

type ArquivoSnippets = Record<string, Snippet>;

const raizRepositorio = path.resolve(__dirname, '../..');

function lerJson<T>(caminhoRelativo: string): T {
    const caminho = path.join(raizRepositorio, caminhoRelativo);
    return JSON.parse(fs.readFileSync(caminho, 'utf-8')) as T;
}

function linhasDoCorpo(corpo: CorpoSnippet): string[] {
    return Array.isArray(corpo) ? corpo : corpo.split('\n');
}

function prefixosDoSnippet(snippet: Snippet): string[] {
    return Array.isArray(snippet.prefix) ? snippet.prefix : [snippet.prefix];
}

function validarContrato(arquivo: ArquivoSnippets): void {
    for (const [nome, snippet] of Object.entries(arquivo)) {
        expect(nome.trim()).not.toBe('');
        expect(snippet).toHaveProperty('prefix');
        expect(snippet).toHaveProperty('body');
        expect(snippet).toHaveProperty('description');

        expect(prefixosDoSnippet(snippet).length).toBeGreaterThan(0);
        expect(prefixosDoSnippet(snippet).every(prefixo => prefixo.trim().length > 0)).toBe(true);
        expect(linhasDoCorpo(snippet.body).length).toBeGreaterThan(0);
        expect(typeof snippet.description).toBe('string');
        expect(snippet.description.trim()).not.toBe('');
    }
}

describe('snippets das linguagens sem cobertura', () => {
    const lmht = lerJson<ArquivoSnippets>('snippets/lmht.code-snippets.json');
    const foles = lerJson<ArquivoSnippets>('snippets/foles.code-snippets.json');
    const liquidoDelegua = lerJson<ArquivoSnippets>('snippets/liquido.code-snippets.json');
    const liquidoPitugues = lerJson<ArquivoSnippets>('snippets/liquido-pitugues.code-snippets.json');
    const pacote = lerJson<any>('package.json');

    it('adiciona os quatro snippets propostos para LMHT', () => {
        expect(Object.keys(lmht)).toEqual([
            'Documento base LMHT',
            'Formulário LMHT',
            'Tabela LMHT',
            'Lista LMHT',
        ]);

        expect(Object.values(lmht).map(snippet => snippet.prefix)).toEqual([
            'lmht-documento',
            'lmht-formulario',
            'lmht-tabela',
            'lmht-lista',
        ]);
    });

    it('adiciona os três snippets propostos para FolEs', () => {
        expect(Object.keys(foles)).toEqual([
            'Regra FolEs',
            'Consulta de mídia FolEs',
            'Variáveis FolEs',
        ]);

        expect(Object.values(foles).map(snippet => snippet.prefix)).toEqual([
            'foles-regra',
            'foles-midia',
            'foles-variaveis',
        ]);
    });

    it('mantém o contrato obrigatório de todos os novos snippets', () => {
        validarContrato(lmht);
        validarContrato(foles);
        validarContrato(liquidoPitugues);
    });

    it('porta os 12 snippets Líquido de Delégua para Pituguês', () => {
        expect(Object.keys(liquidoDelegua)).toHaveLength(12);
        expect(Object.keys(liquidoPitugues)).toHaveLength(12);
        expect(Object.keys(liquidoPitugues)).toEqual(Object.keys(liquidoDelegua));
    });

    it('preserva os prefixos dos snippets Líquido entre as duas linguagens', () => {
        for (const nome of Object.keys(liquidoDelegua)) {
            expect(liquidoPitugues[nome].prefix).toEqual(liquidoDelegua[nome].prefix);
        }
    });

    it('usa sintaxe indentada de Pituguês nos corpos portados', () => {
        const linhas = Object.values(liquidoPitugues).flatMap(snippet =>
            linhasDoCorpo(snippet.body)
        );

        expect(linhas.some(linha => /\bfuncao\b.*:\s*$/.test(linha))).toBe(true);
        expect(linhas.some(linha => /\bfuncao\b.*\{\s*$/.test(linha))).toBe(false);
        expect(linhas.some(linha => /^\s*}\)?;?\s*$/.test(linha))).toBe(false);
        expect(linhas.some(linha => /;\s*$/.test(linha))).toBe(false);
    });

    it('registra os novos arquivos no manifesto da extensão', () => {
        const registros = pacote.contributes.snippets;

        expect(registros).toEqual(
            expect.arrayContaining([
                {
                    language: 'lmht',
                    path: './snippets/lmht.code-snippets.json',
                },
                {
                    language: 'foles',
                    path: './snippets/foles.code-snippets.json',
                },
                {
                    language: 'pitugues',
                    path: './snippets/liquido-pitugues.code-snippets.json',
                },
            ])
        );
    });

    it('não repete prefixos dentro de cada novo arquivo', () => {
        for (const arquivo of [lmht, foles, liquidoPitugues]) {
            const prefixos = Object.values(arquivo).flatMap(prefixosDoSnippet);
            expect(new Set(prefixos).size).toBe(prefixos.length);
        }
    });
});
