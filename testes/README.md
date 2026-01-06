# Testes Unitários - Extensão VSCode Design Líquido

Este diretório contém os testes unitários para a extensão VSCode da Design Líquido.

## Estrutura

- `extensao.test.ts` - Testes para as funções principais de ativação/desativação da extensão
- `exemplo-utilitarios.test.ts` - Exemplos de testes unitários para referência

## Como executar os testes

### Executar todos os testes
```bash
yarn testes-unitarios
```

### Executar testes em modo contínuo (desenvolvimento)
```bash
yarn testes-unitarios:continuo
```

### Executar um arquivo de teste específico
```bash
yarn testes-unitarios extensao.test.ts
```

## Escrevendo testes

### Estrutura básica de um teste

```typescript
import { describe, it, expect } from '@jest/globals';

describe('Nome do módulo', () => {
    it('deve fazer algo específico', () => {
        const resultado = minhaFuncao();
        expect(resultado).toBe(valorEsperado);
    });
});
```

### Testando código assíncrono

```typescript
it('deve executar operação assíncrona', async () => {
    const resultado = await funcaoAssincrona();
    expect(resultado).toBe('esperado');
});
```

### Usando mocks

```typescript
import { jest } from '@jest/globals';

const mockFuncao = jest.fn();
mockFuncao.mockReturnValue('valor mockado');

expect(mockFuncao()).toBe('valor mockado');
expect(mockFuncao).toHaveBeenCalled();
```

### Testando módulos VSCode

Para testar código que usa a API do VSCode, você precisa mockar o módulo `vscode`:

```typescript
jest.mock('vscode', () => ({
    window: {
        showInformationMessage: jest.fn()
    },
    // ... outros mocks necessários
}), { virtual: true });
```

## Matchers úteis do Jest

- `toBe(value)` - Comparação estrita (===)
- `toEqual(value)` - Comparação profunda de objetos
- `toHaveProperty(key)` - Verifica se objeto tem propriedade
- `toThrow()` - Verifica se função lança erro
- `toHaveBeenCalled()` - Verifica se mock foi chamado
- `toHaveBeenCalledWith(args)` - Verifica argumentos da chamada

## Configuração

A configuração do Jest está em `jest.config.js` na raiz do projeto.

## Cobertura de código

Os relatórios de cobertura são gerados no diretório `coverage/` após executar `yarn testes-unitarios`.

Para visualizar o relatório HTML:

```bash
# Windows
start coverage/lcov-report/index.html

# Linux/Mac
open coverage/lcov-report/index.html
```

## Boas práticas

1. **Um teste, uma responsabilidade** - Cada teste deve verificar apenas um comportamento
2. **Testes descritivos** - Use nomes claros que descrevam o que está sendo testado
3. **Arrange-Act-Assert** - Organize seus testes em três partes: preparação, ação, verificação
4. **Evite testes frágeis** - Não teste implementação, teste comportamento
5. **Isole testes** - Cada teste deve ser independente dos outros
6. **Use mocks com moderação** - Mock apenas o necessário

## Recursos adicionais

- [Documentação do Jest](https://jestjs.io/)
- [Guia de testes do VSCode](https://code.visualstudio.com/api/working-with-extensions/testing-extension)
- [Best practices para testes](https://github.com/goldbergyoni/javascript-testing-best-practices)
