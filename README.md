# JUJUTSU RPG — Criador de Fichas

Aplicação estática em HTML, CSS e JavaScript Vanilla para criar e gerenciar fichas de **Feiticeiros & Maldições v2.5.2**. Não requer Node, servidor próprio ou conta.

## Versão atual

O fluxo ativo é `index.html` → `sistema.html#/character/new` → ficha em `sistema.html#/character/ID`. A página `fichas.html` mantém o gerenciamento das fichas. `editor.html` e `ficha.html` são apenas redirecionamentos de compatibilidade.

O núcleo de criação/editor/combate/invocações em `engine/` foi adaptado de [ChrisLordan/fichaonlinev2](https://github.com/ChrisLordan/fichaonlinev2), preservando o tema do site e usando LocalStorage. Há catálogo de habilidades por especialização, aquisição por nível, notas, pesquisa, origens Homebrew, rolagens 1d20, notificações, personalização de cores/RGB e layout móvel. As fórmulas e exceções ainda não foram todas auditadas integralmente contra o livro.

Para publicar, sirva a raiz como site estático, sem etapa de build. O PDF de referência, imagens temporárias e cópias de desenvolvimento não são dependências do site. Fontes externas possuem alternativas locais. Os testes em `tests/` podem ser executados com `node tests/NOME.test.mjs`.

## Como executar

1. Abra esta pasta no Visual Studio Code.
2. Instale a extensão **Live Server**, caso necessário.
3. Clique com o botão direito em `index.html` e escolha **Open with Live Server**.

As fichas são armazenadas no `localStorage` do navegador. Para backup ou migração, use **Exportar** na ficha ou **Importar JSON** em Minhas Fichas. A opção de impressão usa o diálogo nativo do navegador.

## Funcionalidades implementadas

- Página inicial, navegação responsiva, página Minhas Fichas e editor completo.
- Criação, edição, autosave com debounce, listagem, ordenação, duplicação, exclusão com confirmação, exportação e importação validada.
- Avatar local, aspectos pessoais, inventário, feitiços, talentos/aptidões, invocações, votos, anotações e ajustes manuais/Homebrew separados.
- Atributos oficiais: Força, Destreza, Constituição, Inteligência, Sabedoria e Presença.
- Valores fixos, rolagem 4d6 descartando o menor e compra por pontos; validação visual de distribuição.
- Cálculo verificado de modificador, Defesa, Atenção, Iniciativa e deslocamento-base; impressão adaptada.

## Regras verificadas e rastreáveis

| Regra | Referência |
| --- | --- |
| Seis atributos e limite comum de 20 | Livro v2.5.2, p. 17 |
| Valores fixos 15, 14, 13, 12, 10, 8 | Livro v2.5.2, p. 18 |
| Rolagem 4d6, descartar menor dado | Livro v2.5.2, p. 18 |
| Compra por pontos, 17 pontos, faixa 8–15 e custos | Livro v2.5.2, p. 18 |
| Modificadores de atributo | Livro v2.5.2, p. 19 |
| Defesa, Atenção e deslocamento-base | Livro v2.5.2, p. 19 |

## Limites atuais, tratados explicitamente

O livro contém regras extensas para origens, especializações, progressões, perícias, equipamentos, aptidões e criação de técnica. Como elas não foram todas transcritas e verificadas nesta entrega, a aplicação não inventa bônus, custos, pré-requisitos ou progressões: disponibiliza os campos oficiais, registra escolhas e sinaliza o que necessita confirmação do Narrador. Esses módulos devem ser preenchidos com os dados completos e revisados do livro antes de receberem automação mecânica.
