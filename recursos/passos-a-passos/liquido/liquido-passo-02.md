O arquivo `configuracao.delprops` define as propriedades do seu projeto
Líquido:

```
liquido.arquetipo = 'rest'
liquido.linguagem = 'delégua'

liquido.aplicacao.nome = 'MeuApp'
liquido.aplicacao.versao = '1.0.0'

liquido.roteador.cors = verdadeiro
liquido.roteador.porta = 3000

liquido.dados.banco.tecnologia = 'sqlite'
liquido.dados.banco.caminho = ':memory:'

liquido.autenticacao.tecnologia = 'jwt'

liquido.estilos.diretorioBase = 'publico/css'
```

A extensão valida cada propriedade e oferece preenchimento automático ao
digitar `liquido.`. Passe o mouse sobre qualquer propriedade para ver
documentação detalhada.
