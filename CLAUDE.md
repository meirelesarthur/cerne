# AGRO365 Panel — Instruções para Claude Code

## Roteamento de Modelos (Orquestração Multi-Model)

Opus é o orquestrador deste projeto. Ao spawnar subagentes via Agent tool, use o modelo adequado à tarefa:

### Haiku — tarefas leves e rápidas
Use `model: "haiku"` para:
- Busca de arquivos (Glob, Grep, exploração de estrutura)
- Leitura de arquivos isolados
- Verificações rápidas (existe arquivo? qual o conteúdo de X?)
- Tarefas de listagem e indexação
- Subagentes do tipo `Explore` com escopo pequeno (`quick`)

### Sonnet — implementação e análise
Use `model: "sonnet"` para:
- Geração e edição de código (componentes, hooks, utilitários)
- Refatoração de arquivos existentes
- Análise de código com múltiplos arquivos
- Subagentes do tipo `Explore` com escopo médio/amplo
- Subagentes do tipo `general-purpose` para tarefas de implementação
- Criação de testes

### Opus — reservado para o orquestrador
Não spawne subagentes com `model: "opus"` — Opus já é você (o orquestrador). Use sua própria capacidade para:
- Planejamento de arquitetura e decisões de design
- Integração e revisão dos resultados dos subagentes
- Tarefas que exigem raciocínio profundo sobre múltiplos contextos

---

## Stack do Projeto

- **React 18 + TypeScript** (strict mode)
- **Vite 5** — build tool, dev server em `http://localhost:5173`
- **Tailwind CSS 3** com tokens customizados (fonte Outfit, paleta emerald)
- **Chakra UI 3** + Emotion (peer deps instalados)
- **Storybook 10** em `http://localhost:6006`
- **Vitest + Playwright** para testes

## Comandos principais

```bash
npm run dev        # Dev server → http://localhost:5173
npm run storybook  # Storybook → http://localhost:6006
npm run build      # Build de produção (TS check + Vite)
```

## Estrutura src/

- `components/layout/` — AppLayout, Sidebar, Topbar, SecondaryNav
- `components/ui/` — componentes reutilizáveis (Badge, FormField, DataTable…)
- `components/*.stories.tsx` — stories do Storybook

---

## Leis do Projeto

Estas políticas são invioláveis e se aplicam a toda geração de código neste projeto.

### Lei 1 — Component-First (Componentização Obrigatória)

Todo elemento visível na tela é um componente de `src/components/ui/`.

**Proibido usar diretamente em páginas:** `<button>`, `<input>`, `<select>`, `<table>`, `<thead>`, `<tr>`, `<td>`, `<h1>`–`<h6>`.

- Ao criar uma nova tela, apenas **importar e chamar** componentes existentes
- Se o componente necessário não existe no catálogo, criá-lo em `src/components/ui/` **antes** de usá-lo na tela
- Catálogo atual: `Button`, `FormField`, `FormSelect`, `DataTable`, `Badge`, `PageHeader`, `PageContainer`, `Stepper`, `StepHeader`, `StepFooter`, `FilterDrawer`, `FormSection`

### Lei 2 — Fonte Única de Verdade (Propagação Global)

Alterações em componentes de `src/components/ui/` refletem automaticamente em todas as telas — esse é o objetivo.

**Proibido em páginas/telas:**
- Sobrescrever estilos com `style={}` inline sobre um componente existente
- Duplicar lógica de estilo que o componente já oferece via prop (ex.: criar spinner manual quando `Button` tem `loading`)
- Clonar/reimplementar um componente UI dentro de uma página

Extensões de comportamento são feitas adicionando props ao componente em `src/components/ui/`, nunca por patch local.

### Lei 3 — Fonte & Tokenização Acima de Tudo

**Tipografia:** única fonte permitida é **Outfit**. Não usar `font-montserrat`, fontes do sistema ou qualquer alternativa como valor de apresentação.

**Tokens:** todo valor de design (cor, espaço, raio, sombra, tamanho de fonte, peso) vem de `src/design/tokens.ts` via `t.*`.

```ts
// Correto
color: t.color.brand[600]
fontSize: t.font.size.sm
padding: t.space[4]

// Violação — hardcoded fora do arquivo de tokens
color: '#059669'
fontSize: '0.875rem'
padding: '16px'
```

Valores hardcoded fora de `src/design/tokens.ts` e `tailwind.config.ts` são violação de política.

### Lei 4 — Commits Obrigatórios, Push sob Demanda

Após toda mudança concluída, um commit **deve ser criado imediatamente** — sem aguardar solicitação.

- O push **nunca é feito automaticamente** — somente quando o usuário solicitar explicitamente
- Mensagens de commit seguem o padrão Conventional Commits (`feat:`, `fix:`, `style:`, `refactor:`, `docs:`, etc.)
- Um commit por unidade lógica de mudança — não acumular alterações não relacionadas no mesmo commit
