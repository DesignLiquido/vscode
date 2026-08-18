# Linguagens em Português para Visual Studio Code e derivados

<p align="center">
  <a href="https://marketplace.visualstudio.com/items?itemName=designliquido.designliquido-vscode" title="Extensão no Visual Studio Marketplace">
    <img src="https://img.shields.io/visual-studio-marketplace/i/designliquido.designliquido-vscode?label=Visual%20Studio%20Marketplace" alt="Extensão no Visual Studio Marketplace" />
  </a>
  <a href="https://open-vsx.org/extension/designliquido/designliquido-vscode" title="Extensão na open-vsx.org">
    <img src="https://img.shields.io/open-vsx/dt/designliquido/designliquido-vscode?label=open-vsx.org" alt="Extensão na open-vsx.org" />
  </a>
</p>

Essa extensão visa melhorar a produtividade de projetos escritos usando as linguagens da Design Líquido: 

- [Delégua](https://github.com/DesignLiquido/delegua);
- [LMHT](https://github.com/DesignLiquido/LMHT);
- [FolEs](https://github.com/DesignLiquido/FolEs);
- [LinConEs](https://github.com/DesignLiquido/LinConEs);

Essa extensão também oferece suporte parcial a outras linguagens que são dialetos de Delégua:

- [Egua](https://egua.tech);
- [Pituguês](https://github.com/DesignLiquido/delegua/wiki/Dialetos#pitugues);
- [Portugol Mapler](https://portugol.sourceforge.io/);
- [Portugol Studio](http://lite.acad.univali.br/portugol/);
- [Portugol VisuAlg](https://visualg3.com.br/);
- [Potigol](https://potigol.github.io).

## Instalação

Você pode instalar pesquisando nas extensões do Visual Studio Code [ou por este link](https://marketplace.visualstudio.com/items?itemName=designliquido.designliquido-vscode) (Windows e Mac), ou ainda [por este outro link](https://open-vsx.org/extension/designliquido/designliquido-vscode) (Linux, VSCodium, etc).

Editores suportados:

- [Visual Studio Code](https://code.visualstudio.com/)
- [VSCodium](https://vscodium.com/)
- [Cursor](https://www.cursor.com/)

### 📦 Como Usar

**Na Web:**
1. Acesse [vscode.dev](https://vscode.dev) ou [github.dev](https://github.dev)
2. Instale a extensão "Design Líquido - Linguagens em Português"
3. Abra ou crie arquivos `.delegua`, `.visualg`, `.mapler`, etc.

**No Desktop:**
1. Abra o VS Code
2. Vá em Extensões (Ctrl+Shift+X)
3. Busque por "Design Líquido"
4. Clique em Instalar

## Funcionalidades

- **Sintaxe colorida** para todas as linguagens suportadas
- **Formatação automática** para Delégua, Pituguês, Mapler, VisuAlg, Potigol e Portugol Studio
- **Análise semântica** para Delégua, Pituguês, BIRL, Mapler, VisuAlg, Portugol Studio, Potigol e delprops
- **Trechos de código (snippets)** para Delégua (incluindo rotas Líquido), Pituguês, VisuAlg, Portugol Studio e LinConEs
- **Completude de código (IntelliSense)** para Delégua, Pituguês, FolEs, LMHT, VisuAlg, Portugol Studio, delprops e arquivos de teste Delégua
- **13 comandos de tradução** entre Delégua, JavaScript, Python, Ruby, Elixir, AssemblyScript, CSS↔FolEs, HTML↔LMHT, SQL↔LinConEs e VisuAlg
- **Suporte a depuração** para Delégua, Pituguês, Mapler, VisuAlg, Portugol Studio e Potigol
- **Ícones** para arquivos `.delegua`, `.egua`, `.pitugues`, `.foles`, `.lincones`, `.lmht`, `.birl`, `.delprops`, `.alg` (VisuAlg), `.por` (Portugol Studio), `.poti`/`.potigol` (Potigol), `.mapler` (Mapler)

## ⚙️ Estilizador (apenas Delégua)

O Estilizador é uma ferramenta que aplica regras para melhorar a qualidade e consistência do código Delégua durante a formatação. Diferente de formatadores que apenas ajustam a apresentação visual, o Estilizador modifica a árvore sintática para aplicar convenções e boas práticas.

### Configurações Disponíveis

Você pode configurar o Estilizador acessando as configurações do VS Code (`Ctrl` + `,`) e buscando por "delegua estilizador", ou editando diretamente o arquivo `settings.json`:

#### Habilitar/Desabilitar o Estilizador

```json
{
  "delegua.estilizador.habilitado": true
}
```

**Valor padrão:** `true`
**Descrição:** Controle mestre para habilitar ou desabilitar o Estilizador durante a formatação de código.

#### Fortalecimento de Tipos

```json
{
  "delegua.estilizador.fortalecerTipos.habilitado": false
}
```

**Valor padrão:** `false`
**Descrição:** Converte declarações com tipo `qualquer` para tipos inferidos automaticamente.

**Exemplos:**
- `var x = 5` → `var x: número = 5`
- `var nome = "João"` → `var nome: texto = "João"`
- `constante PI = 3.14` → `constante PI: número = 3.14`

#### Explicitação de Tipos de Parâmetros

```json
{
  "delegua.estilizador.explicitarTiposParametros.habilitado": false
}
```

**Valor padrão:** `false`
**Descrição:** Materializa `: qualquer` em parâmetros de função e método que não tenham anotação explícita.

**Exemplo:**
- `funcao calcularPerimetro(altura, largura)` → `funcao calcularPerimetro(altura: qualquer, largura: qualquer)`

#### Convenção de Nomenclatura

```json
{
  "delegua.estilizador.convencaoNomenclatura.habilitado": false,
  "delegua.estilizador.convencaoNomenclatura.variaveis": "caixaCamelo",
  "delegua.estilizador.convencaoNomenclatura.constantes": "CAIXA_ALTA",
  "delegua.estilizador.convencaoNomenclatura.funcoes": "caixaCamelo"
}
```

**Valor padrão:** `false` (desabilitado)
**Descrição:** Aplica convenções de nomenclatura para identificadores no código.

**Opções para Variáveis e Funções:**
- `caixaCamelo` (camelCase): `minhaVariavel`, `minhaFuncao`
- `caixa_cobra` (snake_case): `minha_variavel`, `minha_funcao`
- `CaixaPascal` (PascalCase): `MinhaVariavel`, `MinhaFuncao`

**Opções para Constantes:**
- `CAIXA_ALTA` (UPPER_CASE): `MINHA_CONSTANTE`
- `caixaCamelo` (camelCase): `minhaConstante`

### Exemplo de Configuração Completa

```json
{
  "delegua.estilizador.habilitado": true,
  "delegua.estilizador.fortalecerTipos.habilitado": true,
  "delegua.estilizador.explicitarTiposParametros.habilitado": false,
  "delegua.estilizador.convencaoNomenclatura.habilitado": true,
  "delegua.estilizador.convencaoNomenclatura.variaveis": "caixaCamelo",
  "delegua.estilizador.convencaoNomenclatura.constantes": "CAIXA_ALTA",
  "delegua.estilizador.convencaoNomenclatura.funcoes": "caixaCamelo"
}
```

### Como Usar

1. Configure as opções desejadas nas configurações do VS Code
2. Abra um arquivo `.delegua`
3. Formate o documento usando:
   - `Shift` + `Alt` + `F` (Windows/Linux)
   - `Shift` + `Option` + `F` (Mac)
   - Ou clique com o botão direito e selecione "Formatar Documento"

O Estilizador aplicará automaticamente as regras configuradas durante a formatação.

## Tradução entre linguagens

Essa extensão oferece **13 comandos de tradução** entre linguagens. Pressione `Ctrl` + `Shift` + `p` (`Cmd` + `Shift` + `p` no Mac) e digite "tradução" para acessá-los.

### Traduções disponíveis

| Origem | Destino |
|--------|---------|
| CSS | FolEs |
| FolEs | CSS |
| HTML | LMHT |
| LMHT | HTML |
| SQL | LinConEs |
| LinConEs | SQL |
| VisuAlg | Delégua |
| JavaScript | Delégua |
| Delégua | JavaScript, Python, Ruby, Elixir, AssemblyScript |

Compilação para arquiteturas de processador (x64, ARM, RISC-V) e WebAssembly não é mais oferecida por esta extensão. Use os pacotes autocontidos [`delegua-x64`](https://github.com/DesignLiquido/delegua-llvm-completo/tree/main/pacotes/delegua-x64), [`delegua-arm`](https://github.com/DesignLiquido/delegua-llvm-completo/tree/main/pacotes/delegua-arm), [`delegua-risc-v`](https://github.com/DesignLiquido/delegua-llvm-completo/tree/main/pacotes/delegua-risc-v) e [`delegua-wasm`](https://github.com/DesignLiquido/delegua-llvm-completo/tree/main/pacotes/delegua-wasm) pela linha de comando.

## Suporte ao Framework Líquido

Esta extensão oferece suporte completo ao [Framework Líquido](https://github.com/DesignLiquido/liquido), um framework web em português para desenvolvimento de APIs e aplicações web:

- **6 comandos** no palete de comandos: Iniciar servidor de desenvolvimento, Novo projeto, Gerar código, Documentação OpenAPI, Inicializar banco de dados, Rodar testes
- **12 snippets de rotas** (`rotaGet`, `rotaPost`, `rotaPut`, `rotaDelete`, etc.) em arquivos Delégua
- **Arquivos `.delprops`** com sintaxe colorida, validação de configuração, autocompletar e documentação contextual para todas as propriedades `liquido.*`
- **Detecção de contexto de rotas**: análise semântica especial para arquivos dentro de `rotas/`, injetando variáveis `liquido`, `requisicao`, `resposta` e `lincones` no escopo
- **Task provider** para executar comandos Líquido diretamente do terminal do VS Code

## Depuração

As linguagens que podem ser depuradas por esta extensão são:

- [Delégua](https://github.com/DesignLiquido/delegua);
- [Pituguês](https://github.com/DesignLiquido/delegua/wiki/Dialetos#pitugues);
- [Portugol Mapler](https://portugol.sourceforge.io/);
- [Portugol Studio](http://lite.acad.univali.br/portugol/);
- [Portugol VisuAlg](https://visualg3.com.br/);
- [Potigol](https://potigol.github.io).

Para depurar seu código, siga os passos de qualquer um dos vídeos abaixo:

- [Depurando Fibonacci em Delégua](https://www.youtube.com/watch?v=TQxLekzvBv8)
- [Depuração com VisuAlg no Visual Studio Code](https://www.youtube.com/watch?v=-L70aVOMduc)
- [Executando Portugol Studio e Portugol Webstudio no Visual Studio Code](https://www.youtube.com/watch?v=joLJo875hMs)

O resultado da execução aparecerá no painel "Entrada e Saída", que fica juntamente com o console de depuração e o terminal.

## 🌐 Versão Web (vscode.dev)

Esta extensão está disponível tanto na versão desktop quanto na versão web do VS Code (vscode.dev e github.dev). 

### ✅ Recursos Disponíveis na Web

- **Destaque de sintaxe** para todas as linguagens suportadas
- **Análise de código em tempo real** com diagnósticos de erros e avisos
- **IntelliSense** com sugestões de código inteligentes
- **Documentação contextual** ao passar o mouse sobre símbolos
- **Formatação automática** para Delégua, Pituguês, Mapler, VisuAlg, Potigol e Portugol Studio
- **Painel de Entrada e Saída** interativo
- **Suporte a depuração** para todas as linguagens
- **Criação de arquivos** Pituguês diretamente do navegador
  
> 💡 **Dica:** Para acesso completo a todos os recursos, instale a extensão na versão _desktop_ do VS Code.

## Quem já Contribuiu

<a href="https://github.com/DesignLiquido/vscode/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=DesignLiquido/vscode" />
</a>
