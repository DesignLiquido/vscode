**LMHT** (`.lmht`) é o template HTML do Líquido. Crie suas visões em
`fontes/visoes/`:

```lmht
<lmht>
<cabecalho>
    <titulo>Minha Aplicação</titulo>
</cabecalho>
<corpo>
    <div id="app">{{ mensagem }}</div>
</corpo>
</lmht>
```

**FolEs** (`.foles`) é CSS em português para estilizar suas visões:

```foles
#app {
    cor: #333;
    tamanho-fonte: 16px;
    margem: 20px;
}
```

Ambas as linguagens têm realce de sintaxe e snippets na extensão.
