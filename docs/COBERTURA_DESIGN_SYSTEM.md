# Cobertura do Design System — matriz componente → tela-referência

Este documento é a **fonte de dados única** de cobertura do design system GB CERNE: quais dos
85 componentes de `src/components/ui/` já têm uma tela-referência viva, e qual o veredito de
riqueza de cada um dos 11 padrões-âncora do discovery agro365→GB.Cerne (Dashboards e Relatórios
ficam fora — tratados um a um, separadamente).

Complementa `DESIGN_SYSTEM_COMPLEMENT_PIPELINE.md` (o que foi construído) e
`LINKS_NOVAS_FUNCIONALIDADES.md` (como testar cada âncora). É também a fonte consumida pelo
painel `src/pages/design-system/CoberturaDesignSystemPage.tsx` (dev/PO) — **ao atualizar a
cobertura real, atualize este arquivo primeiro; o painel deriva dele**, não duplique a
informação em dois lugares.

## Resumo executivo

| Métrica | Valor |
|---|---:|
| Componentes de `ui/` com tela-referência viva | **85 / 85** |
| Padrões primários (fora dashboard/relatório) com referência Rica | **11 / 11** |
| Sub-componentes de CRUD com referência Rica | 5 / 5 |
| Lacunas de conteúdo (RBAC visível) | 0 (fechada) |

## Padrões primários — veredito

| # | Padrão | Tela(s)-referência | Veredito |
|---|---|---|---|
| 1 | CRUD base | `cadastros/bancos/BancosPage.tsx` (âncora, simples por design) + `cadastros/embalagens`, `contas-bancarias`, `armazens` (Estrutura) | Rico |
| 2 | Relatório | `relatorios/estoque-consolidado/EstoqueConsolidadoReportPage.tsx` | Fora de escopo |
| 3 | Componente/Infra (AppShell) | `components/layout/AppLayout.tsx` + `Sidebar.tsx` + `Topbar.tsx` + `SecondaryNav.tsx` | Rico |
| 4 | Consulta read-only | `cadastros/cidades/CidadesPage.tsx` (âncora simples) + `cadastros/fazendas/FazendaDetalhe.tsx` + `cadastros/safras/SafraDetalhe.tsx` (referência real de detalhe) | Rico |
| 5 | Dashboard | `pages/dashboards/*` (14 telas) | Fora de escopo |
| 6 | Mapa/espacial/drag-drop | `operacional/mapa-confinamento/MapaConfinamentoPage.tsx` (visualização — por design) + `cadastros/fazendas/steps/Step3Mapa.tsx` (edição: Leaflet+draw, área geodésica, KML) | Rico |
| 7 | Standalone/pública | `pages/Login.tsx` + `components/layout/PublicLayout.tsx` | Rico |
| 8 | SPA/React | `operacional/planejamento-pecuario/PlanejamentoPecuarioPage.tsx` | Rico |
| 9 | Exportação/integração | `integracoes/dominio/IntegracaoDominioPage.tsx` | Rico |
| 10 | Transação/documento | `financeiro/baixa-titulos/BaixaTitulosPage.tsx` | Rico |
| 11 | Workflow/ação | `administrativo/autorizacao/AutorizacaoCompraPage.tsx` | Rico |
| (import embutido) | `financeiro/ofx/OfxImportPage.tsx` | Rico |

## Sub-componentes de CRUD — veredito

| Sub-componente | Tela(s)-referência | Veredito |
|---|---|---|
| Selects AJAX em cascata | `cadastros/produtos/ProdutoForm.tsx` (cascata real 4 níveis) — mais rica que a âncora `pessoas` | Rico |
| Import em massa | `cadastros/plano-contas/PlanoContasImportModal.tsx` (referência) + `cadastros/animais/AnimaisPage.tsx` (parsing real de CSV por linha, upsert por identificação — corrigido, ver Fase B) | Rico |
| Treeview / hierarquia | `cadastros/plano-contas/PlanoContaCadastro.tsx` + `centros-custo/CentroCustoCadastro.tsx` (antecessor, anti-ciclo, código automático) + `cadastros/agrupadores-contabeis/AgrupadoresContabeisPage.tsx` (upgrade em andamento, ver Fase B) | Rico |
| Blocos condicionais (fiscal/produto) | `cadastros/produtos/ProdutoForm.tsx` | Rico |
| Exportação & RBAC | `cadastros/usuarios/UsuariosPage.tsx` (exportação + atribuição de papel) + `pages/design-system/EstadosContaPage.tsx` (RBAC visível em UI — ver nota abaixo) | Rico |

> **Nota de precisão:** `UsuariosPage` demonstra **atribuição de papel a um usuário** (um campo
> de formulário — "este usuário tem o papel X"). Isso é diferente de **UI condicionada à
> permissão de quem está logado** (botão/campo que muda conforme o papel de quem *vê* a tela),
> demonstrado em `EstadosContaPage.tsx` via `PermissionGuard`/`usePermission().can()`. As duas
> coisas juntas fecham a cobertura de RBAC.

## Componentes antes órfãos — fechados

| Componente | Tela-referência (nova) |
|---|---|
| `AccountStatusBanner` | `pages/design-system/EstadosContaPage.tsx` — grid de estados de conta (trial/atraso/suspensa/expirada) |
| `FeatureGate` | `pages/design-system/EstadosContaPage.tsx` — recurso bloqueado/liberado por plano |
| `UpgradePrompt` | `pages/design-system/EstadosContaPage.tsx` — variantes `card` e `inline` |
| `RadioGroup` | `pages/design-system/EstadosContaPage.tsx` — seleção do papel simulado (RBAC) |

## Componentes de padrão com referência única (frágeis — cientes, não é lacuna)

Cada um destes vive em **uma só tela**. Não exige ação, mas se a tela saísse do catálogo o
componente voltaria a ficar órfão: `TreeView`, `WorkflowTimeline`, `StatusLegend`,
`ReconciliationWorkspace`, `EntityBoard`, `ReportWorkspace`, `TypedConfirmDialog`, `DatePicker`,
`RepeaterList`.

## Âncoras simples por design (não são lacunas)

Confirmado em `LINKS_NOVAS_FUNCIONALIDADES.md` — a simplicidade é intencional, não descuido:

- **Bancos** — "CRUD administrativo simples"; vocabulário de campos demonstrado de propósito em
  Embalagens/Contas Bancárias/Emissores (Estrutura).
- **Mapa de Confinamento** — "visualização geográfica com polígonos"; edição de polígono é uma
  necessidade diferente (delimitar propriedade), resolvida em `Step3Mapa.tsx`.

## Fora de escopo (decisão do usuário)

- **Dashboards (11 padrões do discovery, 14 telas no produto)** — família de gráficos
  (`BarChart`, `LineChart`, `DonutChart`, `StackedBarChart`, `GroupedBarChart`, `GaugeChart`,
  `HeatmapChart`, `SparklineArea`, `SankeyFunnel`, `ChartCard`, `KpiStatCard`, `Trend`) já 100%
  demonstrada; endereçados um a um, separadamente.
- **Relatórios (92 telas no discovery)** — `ReportWorkspace` é a âncora; endereçados um a um.

## Histórico de fechamento (Fases do backlog de cobertura)

| Fase | Item | Status |
|---|---|---|
| A1–A3 | `AccountStatusBanner`/`FeatureGate`/`UpgradePrompt`/`RadioGroup` órfãos + RBAC visível | ✅ Fechado — `pages/design-system/EstadosContaPage.tsx` |
| B2 | Import real (parsing por linha) em `AnimaisPage` | ✅ Fechado |
| B3 | Antecessor/anti-ciclo no treeview de `AgrupadoresContabeisPage` | ✅ Fechado |
| C1 | Stories para os 28 componentes sem story | ✅ Fechado (28/28, build do Storybook validado) |
| C3 | Auditoria de tokens vs. brand oficial + export DTCG | ✅ Verificado (achado abaixo — decisão de humano pendente) |
| D1/D2 | Painel de cobertura + gatilho dev-only | ✅ Fechado — `pages/design-system/CoberturaDesignSystemPage.tsx` |

## C3 — Auditoria de tokens (achado, sem alteração de cor)

- `npm run tokens:export` regerado: **275 tokens em 5 sets** (core · semantic · light · gbMode ·
  component) — `tokens/tokens.json` já estava sincronizado com `tokens.ts` (sem diff), Lei 5
  cumprida.
- **Divergência encontrada, não corrigida:** `tokens.ts` usa `brand[600] = #059669` (emerald do
  Tailwind). O discovery (`05-specs/_DESIGN-CONTEXT.md`) cita `brand.600 = #178048` (light) /
  `brand.400 = #38b76c` (gbMode) — mas o próprio discovery **declara essas cores como
  reconstruídas de menções em um briefing, não oficiais**, e pede que sejam substituídas pelas
  reais assim que disponíveis.
- **Decisão tomada aqui:** não sobrescrever `tokens.ts` com um placeholder que o próprio
  discovery admite não ser confiável — trocar a cor de marca retroativamente afetaria as ~26
  telas-referência já validadas, sem uma fonte oficial real para justificar a mudança.
  `tokens.ts` continua sendo a fonte única de fato (Lei 5) até que exista um `tokens.json`
  oficial do GB.Cerne para comparar de verdade.
- **Ação pendente (fora deste backlog, decisão de negócio):** confirmar com o time de marca/design
  se `#059669` é a cor oficial ou se deve migrar para `#178048`/`#38b76c` — e só então propagar
  via `tokens.ts` → `npm run tokens:export`.
