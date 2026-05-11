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
