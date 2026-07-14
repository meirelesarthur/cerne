# Análise Heurística — GB CERNE (AGRO365)

> Auditoria de usabilidade baseada nas 10 heurísticas de Nielsen, nas 3 leis de Krug e WCAG 2.1 AA,
> por leitura direta do código-fonte. **92 achados**: 6 catastróficos · 36 graves · 36 moderados · 14 cosméticos.
> Este documento é a fonte de verdade da esteira de correção — atualizar o status conforme os itens forem entregues.

**Escala de severidade:** 4 = Catastrófico (impede a tarefa) · 3 = Grave (falha significativa) · 2 = Moderado (atrasa/frustra) · 1 = Cosmético.

---

## Esteira de Implementação

Regras vigentes em toda a esteira:

- Um commit por achado/lote lógico (Conventional Commits), **sem push automático** (Lei 4).
- Todo valor de design via `t.*`; alterações em `src/design/tokens.ts` exigem `npm run tokens:export` + commit do `tokens/tokens.json` (Lei 5).
- Extensão via props no kit, nunca patch local (Lei 2). Reutilizar: `ConfirmDialog`, `Modal` (com `useFocusTrap`), `.gb-focusable` (`src/index.css`), `useToast`/`ToastContainer`, `EmptyState` com `action`.
- Funcionalidades sem backend → **mock funcional** (logout limpa sessão local, filtros filtram dados mock, checkout simulado), prontas para plugar API.

---

## Fase 0 — Catastróficos (Sev. 4)

| # | Status | Entrega | Arquivos |
|---|--------|---------|----------|
| 0.1 | ✅ | **Logout funcional** — menu de conta no avatar do Topbar (`DropdownMenu` do kit) com "Sair" → limpa estado de auth e volta ao Login | `Topbar.tsx`, `AppLayout.tsx`, `App.tsx` |
| 0.2 | ✅ | **Editar Fazenda com dados reais** — `FazendaCadastro` aceita `fazenda?`, popula `formData` via `detalheToForm`, título "Editar Fazenda" | `FazendaCadastro.tsx`, `FazendasPage.tsx` |
| 0.3 | ✅ | **Detalhe da fazenda correta** — `getFazendaDetalhe(id)` resolve pelo id; mock só como base de derivação | `FazendasPage.tsx`, `FazendaDetalhe.tsx`, `fazendas.mock.ts` |
| 0.4 | ✅ | **WeekCanvas acessível** — tiles com `role="button"`, `tabIndex`, `aria-label`, Enter/Espaço pinta, setas navegam; drag-paint em touch | `WeekCanvas.tsx` |
| 0.5 | ✅ | **Checkout de planos (mock)** — Modal de confirmação + toast; trial com feedback; add-ons com toggle; "Saiba mais" desabilitado | `PlanosPage.tsx` |
| 0.6 | ✅ | **Filtros de dashboard funcionais (mock)** — novo `ui/FilterSelect` (listbox acessível, temático) filtrando os mocks nos 13 dashboards | `ui/FilterSelect.tsx` + 13 `Dash*.tsx`/`OverviewPanel.tsx` |

## Fase 1 — Graves no UI Kit (Sev. 3 · propagam para todo o sistema) ✅ concluída

| # | Status | Entrega | Arquivos |
|---|--------|---------|----------|
| 1.1 | ✅ | **Contraste Badge/Tag ≥ 4.5:1** — escurecer tokens de texto (warning/success/cyan/danger/neutral) + export DTCG | `tokens.ts`, `Badge.tsx`, `tokens/tokens.json` |
| 1.2 | ✅ | **Checkbox com useTheme** — remover hardcodes de light mode, suportar GBMode | `Checkbox.tsx` |
| 1.3 | ✅ | **Foco visível** — `.gb-focusable` em DropdownMenu, Tabs, SortHeader, Toast, TableToolbar, BulkActionBar, CollapsibleSection, SearchSelect | 8 componentes |
| 1.4 | ✅ | **Navegação por setas** — DropdownMenu (APG menu, foco no 1º item ao abrir) e Tabs (roving tabindex) | `DropdownMenu.tsx`, `Tabs.tsx` |
| 1.5 | ✅ | **SearchSelect** — `tabIndex={-1}` nas opções do listbox | `SearchSelect.tsx` |
| 1.6 | ✅ | **Toast** — pausa no hover/focus; tipo `error` sem auto-dismiss | `Toast.tsx` |
| 1.7 | ✅ | **Stepper** — passos concluídos como `<button>` (teclado) + transitions com propriedades nomeadas | `Stepper.tsx` |

> Achado extra (fora do escopo original, sinalizado por um subagente): `ProdutosLista.tsx` e `ArmazensLista.tsx` têm a mesma combinação reprovada `neutral[100]`/`neutral[500]` hardcoded fora do componente `Badge` — candidato a lote da Fase 3.

## Fase 2 — Graves nas telas (Sev. 3) ✅ concluída (com 2 itens adiados)

### Casca / Login / Perfil
- ✅ Sidebar: navegar não recolhe o menu (`stopPropagation` no item) — `Sidebar.tsx`
- ✅ Perfil: "Salvar" por seção + toast; "Alterar avatar"/"Excluir conta" com ação real ou desabilitados com tooltip; revogar sessão como `<button aria-label>` (mock) — `PerfilUsuario.tsx`
- ✅ Login: modal "Esqueci a senha" via `Modal` do kit (focus trap); validação inline do e-mail no blur — `Login.tsx`

### Fazendas / Pessoas
- ✅ Validar NIRF/CCIR/CAFIR/CAEPI e centros de custo em `validateStep` — `FazendaCadastro.tsx`, steps
- ✅ Hook `useUnsavedChangesGuard` (extraído de `EstoqueInicialForm`); aplicado em Fazenda e Pessoa — `hooks/useUnsavedChangesGuard.ts` + 2 forms
- ✅ `focusFirstError()` após `setErrors`; toast cita o 1º erro — `FazendaCadastro.tsx`, `PessoaForm.tsx`
- ✅ Removida a trava de 3,2s — `FazendaCadastro.tsx`

### CRUDs simples
- ✅ `useUnsavedChangesGuard` nos 5 formulários restantes (Produto, Embalagem, Armazém, Endereço, Centro de Custo)
- ✅ Empty states com `hasSearch` + CTA "Adicionar X" em Embalagens, Armazéns, Estoques Iniciais, Centros de Custo
- ✅ Toast de sucesso em `EstoquesIniciaisPage`; Centro de Custo com toast pós-save + `submitting`
- ✅ "Exportar" (Estoques Iniciais) desabilitado; "Substituir" da duplicidade atualiza o registro existente de fato
- ✅ Exclusão de Centro de Custo trata descendentes (`getAllDescendantCentroIds`, padrão de Endereços) — testado: 20→10 centros ao excluir raiz com 9 filhos

### Safras
- ✅ Linha da tabela operável por teclado; "Reiniciar ciclo" com `ConfirmDialog`; toast pós-save + `nextLoading` no `StepFooter` (evita double-submit) — `SafrasLista.tsx`, `WeekCanvas.tsx`, `SafraCadastro.tsx`, `StepFooter.tsx`
  *(tooltip de semana no focus já havia sido resolvido na Fase 0)*

### Dashboards
- ⏸️ **Adiado para lote futuro:** estados de erro (retry) e vazio nos 13 dashboards — escopo grande, arquitetura por dashboard diverge; melhor como lote dedicado
- ✅ Títulos via `Heading` nos 13 dashboards + `OverviewPanel` + `ChartCard` (usado por Pluviometria); tabela de lotes com `role="table"/"row"/"columnheader"/"cell"` — `DashDesempenhoLotes.tsx`
- ✅ Criticidade de estoque com ícone `AlertTriangle` + prefixo textual, além da cor — `DashEstoqueNutricao.tsx`
- ✅ Heatmap/Sankey acessíveis por teclado (`tabIndex`, foco replica hover) — `HeatmapChart.tsx`, `SankeyFunnel.tsx`. Mapa Leaflet do `OverviewPanel` fica como limitação conhecida (lib não é nativamente acessível)
- ⏸️ **Adiado por decisão de escopo (conforme plano):** unificar shell dos 12 dashboards bespoke em `ChartCard`/`KpiStatCard` — mudança grande, requer commit dedicado

## Fase 3 — Moderados (Sev. 2)

**Kit:** hit targets → `IconButton` (TableToolbar, SearchSelect, BulkActionBar, Toast) · `PageHeader` com `<h1>` · `aria-expanded`/`aria-controls` no CollapsibleSection · Tooltip com Esc + hoverable.

**Casca:** senha preservada no erro de login · links mortos (Termos/Privacidade/Solicitar acesso) · SSO Google desabilitado · contraste `Login.css` · saudação por hora real · `document.title` por rota · notificações mock ou removidas · bloqueio de tentativas comunicando duração.

**Telas:** ordem dos steps de Fazenda (Identificação primeiro) · toast citando linha do repeater (Pessoas) · KPI "Com Acesso" clicável · undo na exclusão de Safras · busca por data formatada · Stepper navegável em Safras · `aria-pressed` na paleta · rótulo de cor no tile · responsividade dos grids (minmax/auto-fit) · `ToastProvider` global único · remoção do loading fake (600ms) · confirmação de exclusão citando o item (Estoques Iniciais) · bulk actions reutilizável · rótulos "Salvar X" padronizados · seletor de período unificado · trend sem "+" contraditório · expand do ChartCard funcional · piso de opacidade do heatmap · MapView com estado vazio · hit targets da paleta em mobile · linhas parciais sinalizadas no modal de múltiplas áreas · asterisco removido de selects binários.

## Fase 4 — Cosméticos (Sev. 1)

`\n` no ConfirmDialog · `useDebouncedValue` compartilhado · componente `Trend` extraído e padronizado · `aria-hidden` no SparklineArea · nomenclatura IconButton/Button documentada · empty state do WeekCanvas com ação · loading artificial removido (Safras).

---

## Verificação por fase

1. `npm run build` (TS strict) sem erros.
2. Verificação visual no dev server nas telas tocadas — **dois temas** (light/GBMode), 360px e 1280px.
3. Navegação por teclado dos fluxos corrigidos (Tab/setas/Esc/Enter).
4. Contraste dos novos tokens ≥ 4.5:1.
5. Storybook para componentes do kit alterados.
6. Checklist do CLAUDE.md antes de cada commit.

## Cadência

| Fase | Achados | Commits (aprox.) |
|------|---------|------------------|
| 0 — Catastróficos | 6 | ~10 |
| 1 — Graves (kit) | 8 | ~8 |
| 2 — Graves (telas) | 28 | ~20 |
| 3 — Moderados | 36 | ~18 lotes |
| 4 — Cosméticos | 14 | ~6 lotes |

Execução sequencial; ao fim de cada fase, reporte de resultado antes de avançar. Push somente sob demanda.
