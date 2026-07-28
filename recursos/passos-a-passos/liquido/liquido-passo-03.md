Crie um arquivo `.delegua` em `fontes/rotas/` e defina os endpoints da sua
API usando as funções `liquido.rota*`:

```delegua
liquido.rotaGet("/", funcao(requisicao, resposta) {
    resposta.enviar("{ 'mensagem': 'Olá, Líquido!' }")
})

liquido.rotaPost("/usuarios", funcao(requisicao, resposta) {
    var dados = requisicao.corpo
    resposta.enviar("{ 'criado': verdadeiro }")
})
```

**Dica:** digite `liquido.` e veja todas as funções disponíveis
no preenchimento automático. Há snippets para `liquido.rotaGet`,
`liquido.rotaPost`, `liquido.rotaPut`, `liquido.rotaDelete` e mais.
