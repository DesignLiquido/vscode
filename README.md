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

## Funcionalidades até então

- Sintaxe colorida
- Formatação de arquivos em Delégua
- Análise semântica para Delégua
- Reconhecimento de expressões comuns das linguagens Delégua, Égua, Pituguês e dialetos de Portugol, como VisuAlg, Portugol Studio/Webstudio e Mapler
- Ícones para arquivos `.delegua`, `.egua`, `.pitugues`, `.foles`, `.lincones` e `.lmht`, `.alg` (VisuAlg), `.por` (Portugol Studio/Webstudio), `.mapler` (Mapler)
- Trechos de códigos para facilitar desenvolvimento em Delégua
- Mecanismo de completude de funções da biblioteca global para Delégua
- Suporte a depuração para Delégua, Pituguês, Portugol VisuAlg, Portugol Studio/Webstudio e Mapler

## ⚙️ Configuração do Estilizador

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

Essa extensão suporta tradução entre linguagens:

- VisuAlg para Delégua;
- Delégua para JavaScript
- JavaScript para Delégua
- Delégua para Python

Pressione `Ctrl` + `Shift` + `p` (`Cmd` + `Shift` + `p` no Mac) e digite "tradução" para ter acesso aos comandos. Você pode atribuir atalhos de teclado a eles se quiser.

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
- **Formatação automática** para Delégua e dialetos de Portugol
- **Painel de Entrada e Saída** interativo
- **Suporte a depuração** para todas as linguagens
- **Criação de arquivos** Pituguês diretamente do navegador

### ❌ Limitações da Versão Web

Devido a restrições do ambiente de navegador, os seguintes recursos não estão disponíveis:

- **Tradução de código** entre linguagens (requer ambiente Node.js)
  
> 💡 **Dica:** Para acesso completo a todos os recursos, instale a extensão na versão _desktop_ do VS Code.

## Quem já Contribuiu

<a href="https://github.com/DesignLiquido/vscode/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=DesignLiquido/vscode" />
</a>