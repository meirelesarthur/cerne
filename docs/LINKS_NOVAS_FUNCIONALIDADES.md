# Links para validação — Design System Complement

Este documento reúne os links locais das 17 referências trabalhadas na esteira
**Design System Complement**, explicando o que foi criado ou reaproveitado e o
motivo de cada decisão.

## Como testar

1. Inicie o projeto com `npm run dev`.
2. Acesse um dos links abaixo.
3. Caso ainda não exista uma sessão, faça login normalmente. O destino do link é
   preservado e será aberto automaticamente depois da autenticação.

Base local: [http://localhost:5173](http://localhost:5173)

## Funcionalidades criadas

### 01. Bancos

**Link:** [http://localhost:5173/cadastros/bancos](http://localhost:5173/cadastros/bancos)

CRUD completo com listagem, pesquisa, cadastro, edição, detalhes e exclusão. Foi
criado como referência do CRUD administrativo simples, permitindo que outros
cadastros usem a mesma estrutura sem duplicar layout e comportamento.

### 02. Baixa de Títulos

**Link:** [http://localhost:5173/financeiro/baixa-titulos](http://localhost:5173/financeiro/baixa-titulos)

Editor transacional com campos monetários, percentuais, itens, rateio e
validações. Estabelece o padrão visual e comportamental das operações financeiras
que trabalham com composição e distribuição de valores.

### 03. Cidades

**Link:** [http://localhost:5173/cadastros/cidades](http://localhost:5173/cadastros/cidades)

Consulta somente leitura com pesquisa, tabela e detalhes. Representa cadastros
provenientes de fontes oficiais ou integrações, nos quais o usuário pode consultar,
mas não alterar os registros.

### 04. Mapa de Confinamento

**Link:** [http://localhost:5173/operacional/mapa-confinamento](http://localhost:5173/operacional/mapa-confinamento)

Quadro de pátios, setores e currais com capacidade, alertas de superlotação,
movimentação por arrastar e soltar e uma alternativa acessível por menu. Inclui
também visualização geográfica com polígonos. Resolve o padrão espacial e
operacional do confinamento.

### 05. Autorização de Compra

**Link:** [http://localhost:5173/administrativo/autorizacao](http://localhost:5173/administrativo/autorizacao)

Fluxo de aprovação com status, histórico, cotações e ações condicionadas às
permissões do usuário. Foi criado para padronizar processos que passam por
diferentes responsáveis e etapas de decisão.

### 06. Importação OFX

**Link:** [http://localhost:5173/financeiro/ofx](http://localhost:5173/financeiro/ofx)

Upload do arquivo bancário, histórico de importações, validação e ambiente de
conciliação. Resolve o padrão de importação seguida por conferência, associação e
tratamento dos registros importados.

### 07. Integração Domínio

**Link:** [http://localhost:5173/integracoes/dominio](http://localhost:5173/integracoes/dominio)

Configuração de credenciais protegidas, teste de conexão, acompanhamento de status
e mensagens de falha recuperável. Serve como referência para integrações externas
que envolvem segredos e monitoramento de disponibilidade.

### 08. Planejamento Pecuário

**Link:** [http://localhost:5173/operacional/planejamento-pecuario](http://localhost:5173/operacional/planejamento-pecuario)

Ambiente operacional com planejamento, entidades relacionadas, cálculos, filtros
e modais. Representa telas ricas que funcionam como uma pequena aplicação dentro
do GB CERNE.

### 09. Estoque Consolidado

**Link:** [http://localhost:5173/relatorios/estoque](http://localhost:5173/relatorios/estoque)

Relatório com multisseleção de armazéns, filtros dependentes, pesquisa, prévia
responsiva e ações de exportação para PDF e Excel. Foi criado como padrão
parametrizável para os demais relatórios levantados no discovery.

### 10. Animais / Rebanho

**Link:** [http://localhost:5173/cadastros/rebanho](http://localhost:5173/cadastros/rebanho)

Gestão de animais com seleção múltipla, ações em massa, importação, exportação e
confirmação protegida. Resolve o padrão de grandes cadastros operacionais com
manipulação coletiva de registros.

### 11. Agrupadores Contábeis

**Link:** [http://localhost:5173/cadastros/agrupadores-contabeis](http://localhost:5173/cadastros/agrupadores-contabeis)

Estrutura hierárquica multinível com criação de descendentes, limite de
profundidade e exclusão controlada. Padroniza planos, árvores e classificações
contábeis.

### 12. Usuários

**Link:** [http://localhost:5173/cadastros/usuarios](http://localhost:5173/cadastros/usuarios)

CRUD com atribuição de papéis e permissões, importação, redefinição de senha e
bloqueio de ações não autorizadas. Serve como referência do padrão administrativo
com controle de acesso baseado em papéis — RBAC.

## Funcionalidades complementadas

### 13. Login e autenticação

**Link:** [http://localhost:5173/](http://localhost:5173/)

O login existente foi mantido por já possuir boa fidelidade. O design system foi
complementado com layout público, cartão de autenticação, campo secreto e seletor
de idioma. Isso permite construir reset de senha, cadastro público e páginas
standalone sem copiar a implementação do login.

### 14. Shell principal

**Link:** [http://localhost:5173/](http://localhost:5173/)

O shell foi complementado com deep links, sincronização com o histórico do
navegador, página de erro, rodapé e fundações públicas. Assim, cada funcionalidade
pode ser aberta diretamente por URL e continuar compartilhando navegação, tema e
contextos globais.

## Referências existentes reaproveitadas

### 15. Dashboard Financeiro

**Link:** [http://localhost:5173/dashboards/financeiros](http://localhost:5173/dashboards/financeiros)

Foi reaproveitado como referência para dashboards porque já continha gráficos,
indicadores, filtros e estados maduros. Criar uma segunda referência duplicaria
componentes e reduziria a consistência.

### 16. Pessoas

**Link:** [http://localhost:5173/cadastros/pessoas](http://localhost:5173/cadastros/pessoas)

Foi mantido como referência de cadastro complexo de pessoas. Os componentes novos
de busca assíncrona, detalhes e seleção complementam o padrão sem reconstruir uma
tela já consolidada.

### 17. Produtos

**Link:** [http://localhost:5173/cadastros/produtos/catalogo](http://localhost:5173/cadastros/produtos/catalogo)

Foi reaproveitado como referência de cadastro com seções e campos condicionais. A
esteira acrescentou componentes que permitem replicar essa complexidade em outros
cadastros sem código visual duplicado.

## Resultado para o design system

As referências acima consolidam componentes reutilizáveis para:

- CRUDs configuráveis e tabelas responsivas;
- importação e conciliação;
- busca assíncrona e multisseleção;
- campos monetários, percentuais e rateio;
- workflows e timelines;
- hierarquias e árvores;
- quadros espaciais com movimentação de entidades;
- relatórios com filtros, prévia e exportação;
- confirmações protegidas;
- credenciais e integrações externas;
- layouts públicos, shell autenticado e páginas de erro.

O objetivo é permitir que as próximas telas sejam montadas por composição e
configuração, como peças de Lego, mantendo os mesmos tokens, responsividade,
acessibilidade e comportamento visual.
