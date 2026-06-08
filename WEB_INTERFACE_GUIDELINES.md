# CERNE — Web Interface Guidelines

> Documento vivo de padrões de interface para o painel AGRO365 / GB CERNE.
> Combina as Leis internas do projeto com melhores práticas derivadas de design systems de referência (Vercel Design Guidelines).
> Toda geração de código deve seguir estas regras. Em caso de conflito, as **Leis** prevalecem.

---

## Índice

1. [As Quatro Leis do Projeto](#1-as-quatro-leis-do-projeto)
2. [Sistema de Tokens](#2-sistema-de-tokens)
3. [Catálogo de Componentes](#3-catálogo-de-componentes)
4. [Tipografia e Conteúdo](#4-tipografia-e-conteúdo)
5. [Layout e Responsividade](#5-layout-e-responsividade)
6. [Interações e Acessibilidade](#6-interações-e-acessibilidade)
7. [Formulários](#7-formulários)
8. [Animações e Transições](#8-animações-e-transições)
9. [Estados da UI](#9-estados-da-ui)
10. [Temas — Light e GBMode](#10-temas--light-e-gbmode)
11. [Performance](#11-performance)
12. [Copy e Mensagens de Interface](#12-copy-e-mensagens-de-interface)
13. [Governança e Commits](#13-governança-e-commits)

---

## 1. As Quatro Leis do Projeto

As Leis são invioláveis. Aplicam-se a toda geração de código, revisão de PR e modificação de componente.

### Lei 1 — Component-First (Componentização Obrigatória)

Todo elemento visível na tela é um componente de `src/components/ui/`.

**Proibido usar diretamente em páginas/telas:**
`<button>` `<input>` `<select>` `<table>` `<thead>` `<tr>` `<td>` `<h1>`–`<h6>`

- Ao criar uma nova tela, apenas **importar e chamar** componentes do catálogo
- Se o componente necessário não existe, criá-lo em `src/components/ui/` **antes** de usá-lo
- Catálogo atual → ver [Seção 3](#3-catálogo-de-componentes)

### Lei 2 — Fonte Única de Verdade (Propagação Global)

Alterações em `src/components/ui/` refletem em todas as telas automaticamente — esse é o objetivo.

**Proibido em páginas/telas:**
- Sobrescrever estilos com `style={}` inline sobre um componente existente
- Duplicar lógica de estilo que o componente já oferece via prop
- Clonar/reimplementar um componente UI dentro de uma página

Extensões de comportamento são feitas **adicionando props ao componente**, nunca por patch local.

### Lei 3 — Fonte e Tokenização Acima de Tudo

**Tipografia:** única fonte permitida é **Outfit**. Qualquer outra fonte é violação.

**Tokens:** todo valor de design vem de `src/design/tokens.ts` via `t.*`.

```ts
// Correto
color: t.color.brand[600]
fontSize: t.font.size.sm
padding: t.space[4]
borderRadius: t.radius.default

// Violação — hardcoded fora do arquivo de tokens
color: '#059669'
fontSize: '0.875rem'
padding: '16px'
```

Valores hardcoded fora de `src/design/tokens.ts` e `tailwind.config.ts` são violação de política.

### Lei 4 — Commits Obrigatórios, Push sob Demanda

Após toda mudança concluída, um commit **deve ser criado imediatamente** — sem aguardar solicitação.

- Push **nunca é automático** — somente quando o usuário solicitar explicitamente
- Mensagens seguem **Conventional Commits**: `feat:`, `fix:`, `style:`, `refactor:`, `docs:`, etc.
- Um commit por unidade lógica — não acumular alterações não relacionadas

---

## 2. Sistema de Tokens

Arquivo de referência: [`src/design/tokens.ts`](src/design/tokens.ts)

### Paleta de Cores

| Token | Valor | Uso |
|---|---|---|
| `t.color.brand[600]` | `#059669` | Cor primária de ação, botões, foco |
| `t.color.brand[700]` | `#047857` | Hover de botões primários |
| `t.color.brand[500]` | `#10b981` | GBMode — cor primária no tema escuro |
| `t.color.neutral[0]` | `#ffffff` | Superfície máxima (cards light) |
| `t.color.neutral[50]` | `#f9fafb` | Background de página (light) |
| `t.color.neutral[200]` | — | Border padrão |
| `t.color.neutral[900]` | `#111827` | Texto primário |
| `t.color.success.*` | — | Estados de sucesso (bg, border, text, solid) |
| `t.color.error.*` | — | Estados de erro |
| `t.color.warning.*` | — | Alertas e avisos |
| `t.color.info.*` | — | Informação contextual |

**Regra de hue consistency (Vercel):** em superfícies com background de cor (ex: card brand, GBMode), bordas, sombras e texto de suporte devem ser tingidos ao mesmo hue — nunca usar cinza neutro puro sobre fundo colorido.

### Escala de Espaçamento

Grid base de 4px: `t.space[1]`=4px → `t.space[20]`=80px. Não usar valores fora da grade sem motivo explícito.

### Border Radius

| Token | Valor | Uso recomendado |
|---|---|---|
| `t.radius.sm` | 4px | Badges, chips pequenos |
| `t.radius.default` | 8px | Inputs, botões |
| `t.radius.lg` | 10px | Cards internos |
| `t.radius.xl` | 12px | Cards de formulário |
| `t.radius.modal` | 20px | Modals, drawers |
| `t.radius.full` | 9999px | Pills, avatares circulares |

**Regra de radii aninhados (Vercel):** o radius de um filho deve ser ≤ radius do pai. Nunca usar `radius.xl` dentro de um container com `radius.sm`. Para alinhamento perfeito de curvas: `radius_filho = radius_pai - padding`.

### Sombras

Mínimo 2 camadas para sombras realistas (ambient + direct). Já implementado nos tokens `t.shadow.*`:

```ts
t.shadow.sm     // cards leves
t.shadow.default // padrão
t.shadow.brand  // glow verde — hover de card fazenda, focus especial
t.shadow.modal  // overlay modals
```

### Z-Index

| Token | Valor | Uso |
|---|---|---|
| `t.zIndex.base` | 1 | Elementos padrão |
| `t.zIndex.dropdown` | 100 | Menus, selects |
| `t.zIndex.overlay` | 200 | Overlays de fundo |
| `t.zIndex.drawer` | 201 | FilterDrawer, sidebars |
| `t.zIndex.toast` | 9999 | Notificações globais |

### Transições

Usar `t.transition.*` para consistência. Nunca usar `transition: all` — listar propriedades explicitamente:

```ts
// Correto
transition: `opacity ${t.transition.default}, transform ${t.transition.default}`

// Violação
transition: 'all 0.2s ease'
```

---

## 3. Catálogo de Componentes

### Componentes Disponíveis

| Componente | Arquivo | Casos de uso |
|---|---|---|
| `Badge` | `Badge.tsx` | Status: success, danger, warning, neutral |
| `Button` | `Button.tsx` | Ações primárias, secundárias, destrutivas, ghost |
| `Card` | `Card.tsx` | Container de superfície genérico |
| `Checkbox` | `Checkbox.tsx` | Seleção booleana acessível |
| `CollapsibleSection` | `CollapsibleSection.tsx` | Acordeão com contagem de campos |
| `DataTable` | `DataTable.tsx` | Tabelas com sort, loading e empty state |
| `Divider` | `Divider.tsx` | Separador horizontal com label opcional |
| `EmptyState` | `EmptyState.tsx` | Estado de lista vazia com CTA |
| `FilterDrawer` | `FilterDrawer.tsx` | Painel lateral de filtros avançados |
| `FormField` | `FormField.tsx` | Input com label, erro, hint, ícones |
| `FormSection` | `FormSection.tsx` | Grupo de campos em grid 1/2/3 colunas |
| `FormSelect` | `FormSelect.tsx` | Select estilizado com ícone customizado |
| `IconButton` | `IconButton.tsx` | Botão apenas-ícone (xs/sm/md) |
| `Modal` | `Modal.tsx` | Diálogo com overlay, ESC, focus trap |
| `PageContainer` | `PageContainer.tsx` | Wrapper padrão de página com padding |
| `PageHeader` | `PageHeader.tsx` | Cabeçalho de página (título, ações, badge) |
| `Pagination` | `Pagination.tsx` | Barra de paginação com ellipsis |
| `ProgressBar` | `ProgressBar.tsx` | Barra de progresso indeterminada/determinada |
| `Skeleton` | `Skeleton.tsx` | Placeholder de carregamento (text/rect/circle) |
| `SSOButton` | `SSOButton.tsx` | Login social (Google, Microsoft) |
| `StepFooter` | `StepFooter.tsx` | Rodapé de wizard multi-etapa |
| `StepHeader` | `StepHeader.tsx` | Cabeçalho de etapa de wizard |
| `Stepper` | `Stepper.tsx` | Indicador de progresso horizontal |
| `TableToolbar` | `TableToolbar.tsx` | SearchInput + FilterChip + FilterButton |
| `ToggleSwitch` | `ToggleSwitch.tsx` | Toggle on/off acessível |

### Criando Novos Componentes

1. Criar em `src/components/ui/NomeComponente.tsx`
2. Exportar como named export
3. Todas as props tipadas com interface explícita
4. Zero valores hardcoded — usar apenas `t.*`
5. Suportar ambos os temas (`light` e `gbMode`) via `useTheme()`
6. Incluir `aria-*` adequados para acessibilidade

---

## 4. Tipografia e Conteúdo

### Fonte

**Outfit** é a única fonte do projeto. Pesos disponíveis: 400, 500, 600, 700, 800.

```ts
fontFamily: t.font.family  // 'Outfit, sans-serif'
```

### Hierarquia de Tamanhos

| Token | px | Uso |
|---|---|---|
| `t.font.size.xs` | 11 | Metadados, rodapés, labels de eixo em charts |
| `t.font.size.sm` | 12 | Labels de campos, badges |
| `t.font.size.base` | 13 | Texto de tabela, listas |
| `t.font.size.md` | 14 | Corpo padrão de formulários |
| `t.font.size.lg` | 15 | Títulos de cards, seções |
| `t.font.size.xl` | 16 | Títulos de página secundários |
| `t.font.size.2xl` | 22 | PageHeader titles |
| `t.font.size.3xl` | 26 | KPIs, números de destaque |

### Regras de Conteúdo (Vercel adaptado)

- **Números tabulares:** em tabelas e comparações, usar `fontVariantNumeric: 'tabular-nums'` para alinhamento preciso
- **Reticências tipográfica:** usar o caractere `…` (U+2026), nunca três pontos `...`
- **Aspas curvas:** `"texto"` em vez de `"texto"` em conteúdo editorial
- **Espaço non-breaking:** `10 kg`, `R$ 10,00`, `5 ha` — evitar quebra de linha entre número e unidade
- **Evitar orfãs e viúvas** em textos longos de descrição
- **Todos os estados desenhados:** toda tela deve ter layout definido para vazio, esparso, denso e com erro

---

## 5. Layout e Responsividade

### Grid e Alinhamento

- Usar CSS Grid e Flexbox nativos — evitar dimensionamento via JS
- **Alinhamento óptico:** ajustar ±1–2px quando percepção supera geometria perfeita (ex: ícones ao lado de texto)
- **Alinhamento deliberado:** cada elemento deve alinhar intencionalmente com algo — grid, baseline, borda ou centro óptico

### Breakpoints de Teste

Toda tela deve ser testada em:
- Mobile (`360px`): verificar que nenhum elemento vaza ou sobrepõe
- Laptop (`1280px`): layout padrão de desenvolvimento
- Wide (`1920px`): verificar que layouts não ficam excessivamente esticados

### Barras de Scroll

- Corrigir `overflow` para evitar scrollbars indesejados
- Em macOS: testar com "Show Scroll Bars: Always" em System Preferences
- Em modals e drawers: aplicar `overscroll-behavior: contain` para evitar scroll da página mãe

### Links e Navegação

- **Links verdadeiros:** usar `<a>` ou `<Link>` para navegação — nunca `<button>` ou `<div onClick>` para URLs
- **Deep-link tudo:** filtros ativos, aba selecionada, página atual, painéis expandidos devem persistir na URL
- Back/Forward do browser deve restaurar estado (incluindo posição de scroll)

---

## 6. Interações e Acessibilidade

### Teclado e Foco

- **100% operável por teclado** — todos os fluxos críticos devem funcionar sem mouse
- Usar `:focus-visible` em vez de `:focus` para não mostrar foco em cliques via mouse
- Focus ring padrão: `t.glow.brand` (box-shadow verde)
- **Focus traps:** modals e drawers devem prender o foco enquanto abertos

```css
/* Correto */
:focus-visible { box-shadow: t.glow.brand; }

/* Evitar — mostra ring mesmo em clique */
:focus { outline: 2px solid green; }
```

### Alvos de Clique (Hit Targets)

- Desktop: mínimo **24×24px** por elemento interativo
- Mobile / touch: mínimo **44×44px**
- Sem dead zones: se a área visual é interativa, toda ela deve ser clicável

### Estados de Loading

- Delay inicial antes de mostrar loading: **~150–300ms** (evitar flash para operações rápidas)
- Tempo mínimo visível do indicador: **~300–500ms** (evitar flicker)
- Botões em loading mantêm o rótulo original + indicador visual (não substituir o texto)
- Implementado em `Button` via prop `loading` — sempre usar, nunca reimplementar

### Atualizações Otimistas

- UI responde imediatamente à ação do usuário
- Reconciliar com resposta do servidor ao receber
- Em caso de erro: mostrar opção de **Undo** ou notificação clara

### Ações Destrutivas

- Sempre exigir confirmação explícita (modal de confirmação ou janela de Undo)
- Usar `Button` variant `destructive` — nunca estilizar um botão de exclusão como primário

### Acessibilidade Semântica

- **Semântica antes de ARIA:** preferir `<button>`, `<a>`, `<label>`, `<table>` nativos — adicionar ARIA apenas quando semântica nativa não for suficiente
- Headings hierárquicos: a estrutura `h1 → h2 → h3` deve ser lógica e nunca pular níveis
- Botões apenas-ícone (`IconButton`) sempre têm `aria-label` descritivo
- Elementos decorativos recebem `aria-hidden="true"`
- Atualizações assíncronas (toasts, validação inline) anunciadas com `aria-live="polite"`

### Mobile

- Inputs com `font-size ≥ 16px` para evitar auto-zoom no iOS Safari
- Usar `touch-action: manipulation` em controles para eliminar delay de double-tap
- Nunca desabilitar zoom do browser
- Nunca bloquear `paste` em campos

---

## 7. Formulários

### Comportamento de Submissão

- `Enter` submete quando há um único campo focado
- Em formulários multi-campo: `Enter` no **último campo** submete
- `<textarea>`: `Ctrl/⌘ + Enter` submete; `Enter` insere nova linha
- Botão de submit fica **habilitado** até o início da submissão; desabilitar **durante** o request + mostrar spinner
- Nunca pré-desabilitar o submit — permitir submissão incompleta para surfar feedback de validação

### Labels e Campos

- Todo campo deve ter `<label>` associado (via `htmlFor` ou wrapping)
- `FormField` e `FormSelect` já implementam isso — usar sempre
- Clicar no label deve focar o controle associado
- Erros exibidos **próximos ao campo** (não apenas no topo do formulário)
- Ao submeter com erros: focar o **primeiro campo com erro**

### Validação

- Não bloquear digitação — mostrar feedback após blur ou submit
- Mensagens de erro guiam a correção: não apenas "campo inválido", mas "CPF deve ter 11 dígitos"
- `spellcheck="false"` em: e-mails, códigos, usernames, tokens de API

### Preenchimento Automático

- Sempre definir `autocomplete` e `name` significativos para habilitar autofill do browser
- Não disparar gerenciadores de senha em campos não-auth: usar `autocomplete="off"` ou valor específico
- Garantir compatibilidade com gerenciadores de senha e preenchimento de 2FA

### Inputs

- Usar `type` e `inputMode` corretos para teclados mobile adequados:
  - Valores numéricos: `inputMode="numeric"`
  - Telefone: `type="tel"`
  - Email: `type="email"`
- Placeholder como **exemplo** de formato, não como label: `+55 (11) 99999-9999`
- Fazer `trim()` no valor antes de validar para evitar erros confusos por espaço

### `<select>` no Windows

- Definir explicitamente `backgroundColor` e `color` no `FormSelect` para evitar inconsistências visuais no Windows

---

## 8. Animações e Transições

### Princípios

- Animar apenas quando **clarifica causa/efeito** ou adiciona **delícia deliberada** — nunca decorativo sem propósito
- Respeitar `prefers-reduced-motion`: fornecer variante reduzida ou desabilitar para acessibilidade

```css
@media (prefers-reduced-motion: reduce) {
  * { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; }
}
```

### Propriedades Seguras (GPU-accelerated)

Animar **apenas** estas propriedades para evitar reflow/repaint:

```ts
// Correto — GPU accelerated
transform: 'translateY(-4px)'
opacity: 0

// Evitar — causa reflow
width, height, top, left, margin, padding
```

### Transform Origin

Ancorar o movimento onde ele começa fisicamente:
- Dropdown que abre abaixo: `transformOrigin: 'top center'`
- Modal que cresce do centro: `transformOrigin: 'center center'`
- Drawer lateral: `transformOrigin: 'right center'`

### Easing

Usar `t.animation.easing.*` — não hardcodar curvas:
- `t.animation.easing.standard`: mudanças de tamanho
- `t.animation.easing.easeOut`: elementos que entram na tela
- `t.animation.easing.easeIn`: elementos que saem da tela
- `t.animation.easing.spring`: interações de drag, hover com "mola"

### Durações

| Token | Valor | Uso |
|---|---|---|
| `t.animation.duration.fast` | 150ms | Hover, foco |
| `t.animation.duration.normal` | 200ms | Mostrar/ocultar pequenos elementos |
| `t.animation.duration.slow` | 300ms | Modals, drawers |
| `t.animation.duration.slower` | 400ms | Page transitions |

### Regras Adicionais

- Animações devem ser **canceláveis** por input do usuário
- Nunca usar `transition: all` — listar propriedades explicitamente
- Evitar autoplay de animações — animar em resposta a ações do usuário
- SVG transforms: aplicar em wrappers `<g>` + `transform-box: fill-box; transform-origin: center`

---

## 9. Estados da UI

Todo componente e toda tela deve ter **todos os estados desenhados** antes de ir para produção:

### Estados Obrigatórios

| Estado | Implementação |
|---|---|
| **Loading** | `Skeleton` (listas/cards) ou spinner em `Button` |
| **Vazio** | `EmptyState` com mensagem + ação de recuperação |
| **Erro** | Mensagem orientada à solução + ação de retry |
| **Sucesso** | Feedback positivo (toast ou Badge success) |
| **Esparso** (1–3 itens) | Layout deve ser bonito, não quebrado |
| **Denso** (+500 itens) | Paginação + virtualização quando necessário |

### Skeletons

- Skeletons **devem refletir a estrutura real** do conteúdo final — evitar placeholders genéricos que causam layout shift ao carregar
- Usar `Skeleton` variant `text`, `rect` ou `circle` conforme o tipo de conteúdo
- Delay de ~150ms antes de exibir skeleton (operações rápidas não devem piscar)

### Sem Dead Ends

Toda tela deve oferecer um próximo passo ou caminho de recuperação. Exemplos:
- Lista vazia → botão "Cadastrar primeiro item"
- Erro de rede → botão "Tentar novamente"
- Sem permissão → link para solicitar acesso

### ProgressBar

Usar `ProgressBar` no topo de cards/seções que têm operação em andamento:
- `idle`: invisível
- `loading`: animação indeterminada (brand color)
- `success`: verde
- `error`: vermelho

---

## 10. Temas — Light e GBMode

### Definição

Gerenciado por `src/context/ThemeContext.tsx`. Acessado via `useTheme()`.

| Propriedade | Light | GBMode |
|---|---|---|
| Background de página | `#f5f5f5` | `#051008` |
| Superfície (cards) | `#ffffff` | `#0e2a1d` |
| Brand principal | `#059669` | `#10b981` |
| Toggle | `useTheme().toggle()` | — |
| Aplicação | `data-theme="light"` em `<body>` | `data-theme="gb"` |

### Regras de Tema

- Todo componente em `src/components/ui/` deve suportar **ambos os temas**
- Usar `useTheme().colors` para superfícies e `isGbMode` para valores específicos do tema escuro
- Nunca hardcodar cores que dependem do tema — sempre via tokens ou `theme.colors`
- Em GBMode: bordas, sombras e textos de suporte devem usar hues verdes (não cinza neutro)
- Definir `color-scheme: dark` no `<html>` quando GBMode ativo para scrollbars e controles nativos do OS alinharem

---

## 11. Performance

### Renderização

- Monitorar re-renders com React DevTools — minimizar re-renders desnecessários
- Prefer `useMemo` e `useCallback` apenas onde profiling confirmar necessidade (não prematuramente)
- Listas com **+100 itens visíveis**: considerar virtualização

### Rede

- `POST`, `PATCH`, `DELETE`: target < **500ms** de latência (UI deve indicar loading acima disso)
- Inputs de busca: debounce de ~300ms antes de disparar request

### Imagens e Assets

- Sempre definir `width` e `height` explícitos em imagens para evitar **CLS** (Cumulative Layout Shift)
- Lazy-load imagens abaixo do fold
- Fontes críticas com `preload` para evitar FOUT

### Main Thread

- Operações pesadas (parsing de dados grandes, cálculos de relatório) fora do main thread — considerar Web Workers para processamentos > 50ms

---

## 12. Copy e Mensagens de Interface

### Voz e Tom

- **Voz ativa:** "Cadastre uma fazenda" em vez de "Uma fazenda deve ser cadastrada"
- **Segunda pessoa:** "Sua safra foi salva" em vez de "A safra do usuário foi salva"
- **Orientado à ação:** "Adicionar produtor" em vez de "É necessário adicionar um produtor"
- **Conciso:** mínimo de palavras com máximo de clareza

### Labels e Botões

- Labels claros e específicos: "Salvar Safra" em vez de "Continuar" ou "OK"
- Ações com consequência futura terminam com reticências: "Excluir safra…", "Arquivar fazenda…"
- Ações em processamento com reticências: "Salvando…", "Carregando…"
- Botões em loading mantêm o texto + spinner — não substituir por "Aguarde"

### Mensagens de Erro

- Erros sempre guiam a saída: não apenas "Erro ao salvar" — mas "Erro ao salvar: verifique sua conexão e tente novamente"
- Linguagem positiva por padrão: frames de problem-solving mesmo em estados de erro
- Evitar linguagem técnica ao usuário final: "Timeout" → "A operação demorou mais que o esperado"

### Números e Formatação

- Numerais para contagens: "8 safras" em vez de "oito safras"
- Moeda: 0 ou 2 decimais — nunca misturar no mesmo contexto
- Espaço entre número e unidade: `10 ha`, `5 kg`, `R$ 100,00` (non-breaking space)
- Datas e horas: formato locale-aware (`pt-BR` como padrão)
- `font-variant-numeric: tabular-nums` em colunas numéricas de tabelas

### Terminologia Consistente

| Usar | Evitar |
|---|---|
| Fazenda | Propriedade, Campo, Terra |
| Safra | Ciclo, Temporada |
| Produtor | Agricultor (salvo contexto específico) |
| Cadastrar | Inserir, Adicionar (escolher um e manter) |
| Excluir | Deletar, Remover (em contextos destrutivos) |

---

## 13. Governança e Commits

### Conventional Commits

```
feat(modulo):     nova funcionalidade
fix(componente):  correção de bug
style(ui):        ajustes visuais sem lógica
refactor(hook):   refatoração sem mudança de comportamento
docs(guidelines): atualização de documentação
chore(deps):      atualização de dependências
```

### Checklist antes de PR

- [ ] Todos os valores de design usam `t.*` (sem hardcode)
- [ ] Todos os componentes vêm de `src/components/ui/`
- [ ] Suporte a ambos os temas (light e GBMode)
- [ ] Todos os estados da UI implementados (loading, vazio, erro)
- [ ] Inputs com `aria-label` ou `label` associado
- [ ] Botões apenas-ícone com `aria-label`
- [ ] Animações com `prefers-reduced-motion` respeitado
- [ ] Nenhum `transition: all`
- [ ] Fonte Outfit em toda tipografia
- [ ] Commit criado com mensagem Conventional Commits

### Atualizando Este Documento

Este documento deve ser atualizado sempre que:
- Um novo componente é adicionado ao catálogo
- Um novo token é criado em `tokens.ts`
- Uma nova lei ou regra é aprovada pela equipe
- Um padrão de interação é definido para casos recorrentes

---

*Documento gerado em 2026-05-27. Baseado nas Leis internas do projeto CERNE e nas Vercel Design Guidelines (vercel.com/design/guidelines).*
