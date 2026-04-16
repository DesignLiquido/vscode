// @ts-nocheck
import { describe, expect, it } from '@jest/globals';

const gramatica = require('../../gramaticas/delegua.tmLanguage.json');

describe('Gramática de documentário em Delégua', () => {
    it('inclui padrões específicos para tags de documentação', () => {
        const comentarioDocumentario = gramatica.repository.comments.patterns.find(
            (pattern: any) => pattern.name === 'comment.block.documentation.delegua'
        );

        expect(comentarioDocumentario).toBeDefined();
        expect(comentarioDocumentario.patterns).toEqual([
            { include: '#documentation-links' },
            { include: '#documentation-tags' }
        ]);
    });

    it('destaca @veja e o caminho referenciado', () => {
        expect(gramatica.repository['documentation-links'].patterns[0].match).toContain('@(?:veja|see)');
        expect(gramatica.repository['documentation-links'].patterns[0].captures['2'].name).toBe('markup.underline.link.path.delegua');
    });
});