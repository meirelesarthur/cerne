# Design System Complement — esteira de desenvolvimento

## Objetivo

Transformar as 17 especificações de referência em padrões reutilizáveis do GB CERNE.
Cada padrão deve ser consumível por configuração ou composição, manter paridade entre
Light e GBMode e cobrir os estados de carregamento, vazio, erro e sucesso.

## Princípios da esteira

1. Auditar o catálogo antes de criar uma primitiva.
2. Implementar primeiro o componente compartilhado e sua story.
3. Montar a tela âncora apenas com componentes do catálogo.
4. Validar teclado, foco, contraste, 360 px, 1280 px e 1920 px.
5. Executar build e registrar uma unidade lógica em commit convencional.
6. Replicar o padrão nas telas semelhantes somente depois da validação da âncora.

## Matriz das 17 âncoras

| Spec | Âncora | Estratégia | Fase |
|---|---|---|---|
| 11 | Shell / Layout base | Evoluir `AppLayout`, `Sidebar`, `Topbar` e contextos existentes | 0 |
| 01 | Bancos | Criar configuração de CRUD e usar DataTable/Form/Detail compartilhados | 1A |
| 03 | Cidades | Variante read-only do padrão de listagem | 1A |
| 13 | Pessoas | Reusar tela existente; extrair seleção assíncrona/cascata | 1A |
| 15 | Agrupadores Contábeis | Generalizar a hierarquia já validada em Plano de Contas | 1A |
| 16 | Produtos | Reusar tela existente; consolidar seções condicionais e cascata | 1A |
| 17 | Usuários | CRUD + importação/exportação + atribuição RBAC | 1B |
| 14 | Animais | CRUD + importação/exportação + ação em massa protegida | 1B |
| 02 | Baixa de Títulos | Editor transacional + itens/rateio + cálculo monetário | 1B |
| 07 | Autorização de Compra | Workflow, status, cotação e ações por papel | 1B |
| 08 | Importação OFX | Upload, histórico e conciliação | 1C |
| 09 | Integração Domínio | Credencial mascarada, teste e monitor de conexão | 1C |
| 10 | Planejamento Pecuário | Tabela hierárquica e modais de cálculo | 1C |
| 06 | Mapa de Confinamento | Board hierárquico e mapa/polígonos | 1C |
| 04 | Dashboard Financeiro | Reusar dashboard e componentes de gráfico existentes | 1D |
| 05 | Autenticação | Reusar Login; extrair layout público e campo de senha | 1D |
| 12 | Estoque Consolidado | Construtor de relatório, preview e exportações | 2 |

## Componentes compartilhados previstos

- `AsyncSearchSelect` e `CascadingSelect`: busca remota, dependências, loading e erro.
- `DetailGrid` e `ReadOnlyField`: detalhe/show consistente.
- `CrudPattern`: listagem, filtros, paginação, RBAC e estados.
- `CurrencyField`, `PercentField` e `LineItemsEditor`: cálculo e rateio.
- `StatusLegend` e `WorkflowTimeline`: documentos e aprovações.
- `ImportDialog` e `ExportActions`: upload, modelo, validação e exportação.
- `SecretField` e `ConnectionStatus`: integrações externas.
- `TreeView`: hierarquia N-níveis com ações e regras de folha/profundidade.
- `ReportWorkspace`: filtros, preview tabular e exportação.
- `EntityBoard`: composição hierárquica para cenários espaciais.

## Critério de conclusão

Uma spec só passa para concluída quando a tela âncora está navegável no shell, os
componentes novos possuem stories, o build passa e os estados e permissões relevantes
podem ser demonstrados sem depender de código local duplicado.
