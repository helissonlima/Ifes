# Plano de Correção Visual — SustentaCafé ICSR

Auditoria feita em 21/09/2026 sobre o commit `fdc0784` (migração MUI → Tailwind v4 + Radix),
rodando localmente com dados reais restaurados de backup (17 propriedades, 17 avaliações).
Telas percorridas em 1440×900 e 375×812: Login, Visão Geral, Propriedades, Detalhe da
Propriedade, Nova Avaliação (etapas 1 e 2), Laudo, Histórico, Metodologia, Guia, Usuários e Grãos.

A maior parte dos defeitos visíveis vem de **três causas-raiz** da migração. Corrigi-las primeiro
elimina dezenas de sintomas de uma vez; por isso o plano é ordenado por causa, não por tela.

---

## Fase 0 — Bloqueadores (telas quebradas ou fluxo impossível)

### C1. Todos os diálogos do sistema estão quebrados
- **Causa:** `components/ui/Dialog.jsx` exporta como `default` o `DialogPrimitive.Root` do Radix.
  As 9 telas que usam `<Dialog open title footer className>` passam props que o Root ignora;
  sem `DialogContent`/`Portal`, o conteúdo é renderizado **inline, sempre visível**, sem título,
  sem overlay e **sem os botões do `footer`**.
- **Sintomas confirmados:**
  - Propriedades: o formulário "Nova Propriedade" inteiro (com mapa) aparece solto abaixo da
    tabela, e no fim da página lê-se `Excluir "undefined" e todas as avaliações vinculadas?`.
  - Nova Avaliação: texto "Ainda faltam 32 indicador(es)… Deseja concluir mesmo assim?" fixo no rodapé.
  - Confirmar exclusão, salvar propriedade/usuário/grão, restaurar backup e comparar avaliações
    não têm botão de ação — os fluxos ficam impossíveis de concluir.
- **Arquivos afetados:** `ConfirmDialog.jsx`, `BackupCard.jsx`, `ComparativoAvaliacoesDialog.jsx`,
  `Propriedades.jsx`, `NovaAvaliacao.jsx`, `Usuarios.jsx` (3×), `Graos.jsx`.
- **Correção:** fazer o `default export` ser um componente composto
  `Dialog({ open, onOpenChange, title, description, footer, className, children })` que monta
  `Root → DialogContent(className) → DialogHeader/Title → children → DialogFooter`. Corpo com
  `max-h-[85vh] overflow-y-auto`; em <640px o conteúdo vira folha de tela cheia (`inset-0`, sem raio).
  Nenhuma tela chamadora precisa mudar.

### C2. Classes `caparao-*` não existem no tema (130 ocorrências em 16 arquivos)
- **Causa:** o `@theme` do `index.css` define só `primary`, `primary-light`, `primary-dark` etc.
  O código usa `bg-caparao-700`, `text-caparao-800`, `border-caparao-700`, `bg-caparao-50`…
  O Tailwind não gera CSS para nenhuma delas.
- **Sintomas confirmados:**
  - **Estado ativo invisível** (texto branco sem fundo): aba ativa em Detalhe da Propriedade e no
    Laudo ("Detalhamento por Dimensão", "Notas por Indicador"), etapa atual do stepper da Nova
    Avaliação (o círculo "1" some e a etapa corrente nunca é destacada).
  - **Bordas pretas:** `border border-caparao-700` cai em `currentColor` — caixa do gauge na Visão
    Geral, "Plano de Ação Prioritário" e fórmula no Laudo, resumo da propriedade no wizard.
  - Item ativo da sidebar/bottom-nav sem fundo de destaque; fundos `caparao-50` ausentes.
- **Correção:** declarar a escala no `@theme` (`--color-caparao-50 … -900`, ancorada em
  `#1B4D24` = 700) em vez de trocar 130 classes. Remover `primary-*` duplicado ou apontá-lo para a
  mesma escala.

### C3. Tela "Gestão de Usuários" não abre
- `Usuarios.jsx:712` e `:715` usam `style={{ color }}` mas a prop é `cor` → `ReferenceError`,
  cai no ErrorBoundary ("Algo deu errado"). Trocar por `style={{ color: cor }}`.

### C4. Números errados no Laudo
- `Resultado.jsx:287`: `Peso: 0.35% · Contribuição: 0.2%` — o peso já é fração. Exibir
  `Peso: 35% · Contribuição: 23,8 p.p.` (`info.peso * 100` e `valor * info.peso`).
- Gráfico "Comparativo por Dimensão": barras não batem com os índices (Ambiental 68% aparece
  ~38%). Conferir a `dataKey` — parece plotar contribuição ponderada com eixo 0–100%.
- Data da avaliação grava um dia antes (selecionado 21/09, salvo 20/09): conversão para UTC.
  Enviar `YYYY-MM-DD` puro, sem `toISOString()`.

---

## Fase 1 — Fundação do sistema visual

### F1. Decidir a fonte da verdade: `DESIGN.md` × código
O `DESIGN.md` descreve um sistema que não existe mais: IBM Plex Sans, fundo `#F1F8E9`,
verde `#2E7D32`, tokens MUI. O código usa Inter, fundo slate `#F8FAFC`, verde `#1B4D24`.
**Recomendação:** manter a direção atual (neutros slate + um único verde de ação — mais sóbria e
com melhor contraste) e **reescrever o `DESIGN.md`** para ela, preservando as regras de domínio
(4 cores de dimensão, 5 bandas, tokens de texto acessível, nomenclatura IGQG).

### F2. Tokens em vez de hex solto
- 166 hex hardcoded em JSX (`#1B4D24` 32×, `#64748B` 12×, `#9E9E9E` 8×, `#2E7D32` 8×…).
  Substituir por classes de token; cores de dado vêm só de `utils/coresICSR.js`.
- Cores de dimensão divergem entre fontes: tema diz Ambiental `#1B4D24` e Econômica `#0284C7`,
  as barras usam `#4CAF50`/`#2196F3`. Unificar em um lugar.
- Classes inexistentes no Tailwind v4 sem plugin: `animate-in`, `fade-in-0`, `zoom-in-95`,
  `slide-in-from-*`, `backdrop-blur-2xs`. Instalar `tw-animate-css` ou remover; tirar o blur do
  overlay (superfície sólida `bg-slate-900/50`).

### F3. Limpeza pós-MUI
- `index.css` ainda tem bloco `@media print` com seletores `.MuiAppBar-root`, `.MuiCard-root`,
  `.MuiTabs-root`… que não casam com nada: **a impressão do laudo (Imprimir / PDF) está sem
  regras**. Reescrever com `.no-print`, `[role=tabpanel]`, `break-inside: avoid` nos cards novos.
- Remover o `button { display:none }` global de impressão (esconde abas que viraram `<button>`).

### F4. Escala tipográfica
- 69 usos de `text-[10px]`/`text-[11px]` (metadados de cards, legendas, cabeçalhos de tabela).
  O `PRODUCT.md` exige mínimo de 14px para critérios e recomendações em 360px, uso ao sol.
  Piso: 12px para metadado, 14px para qualquer texto de leitura. Criar `text-meta` e `text-body`.
- Fórmula do ICSR e notas usam `font-mono` (Metodologia) — trocar por `tabular-nums` na Inter.

---

## Fase 2 — Layout e componentes compartilhados

### L1. Banner "Conexão restabelecida" permanente
Fica fixo em todas as telas após qualquer oscilação; no celular ocupa ~40% da primeira dobra.
Já existe o chip "Online" na navbar. → Trocar por toast de 4 s; manter banner só no estado offline.

### L2. Cabeçalho de página
`PageHeaderCard` é um card inteiro só para título + botão; no mobile, somado ao banner, empurra
o conteúdo real para fora da tela (Histórico: nenhuma linha visível na primeira dobra).
→ Cabeçalho sem card (título + ações na mesma linha), filtros recolhidos em "Filtros (n)" no mobile.

### L3. Navegação
- Scroll não volta ao topo ao trocar de rota (abrir Propriedades cai no meio da lista). Adicionar
  reset de scroll no `MainLayout`.
- Bottom-nav mobile tem 4 itens e nenhum caminho para Metodologia, Guia, Usuários e Grãos.
  Adicionar 5º item "Mais" abrindo folha com o restante.
- Item ativo da sidebar: resolvido por C2; conferir contraste e `aria-current="page"`.
- "Voltar" aparece como botão cinza preenchido à esquerda do título; usar ghost com ícone de seta.

### L4. Tabelas
- Dois estilos concorrentes: cabeçalho claro (Propriedades, Histórico, Grãos) × cabeçalho verde
  escuro (Metodologia, Guia). Padronizar no claro.
- Badge de classificação quebra em duas linhas no Histórico ("Moderada / (52.5%)") — `whitespace-nowrap`
  e largura mínima da coluna. No card mobile de Propriedades idem.
- Ações só-ícone (copiar, editar, excluir) com alvo ~24px e 17 `<button>` sem `aria-label`.
  Alvo mínimo 40px, `aria-label` + tooltip, excluir separado das demais.
- Plano de Ação no mobile corta as colunas Status/Impacto/Prazo com scroll horizontal pouco
  perceptível → layout em lista empilhada abaixo de 640px.
- Números: `4.80 ha`, `57.9%` → formato pt-BR (`4,80 ha`, `57,9%`) via `Intl.NumberFormat`.
- "1 avaliação(ões)", "17 propriedade(s)" → pluralização real.

### L5. Badges de nota e status
- Nota `0%` no Plano de Ação: texto vermelho-escuro sobre vermelho sólido (contraste baixo). Aplicar
  a regra dos tokens de texto acessível (`COR_NOTA_TEXTO`) sobre fundo tintado.
- "CRÍTICO / ATENÇÃO / BOM" em caixa alta 10px → caixa normal, 12px, peso 600.

---

## Fase 3 — Tela a tela

| Tela | Problema | Correção |
|---|---|---|
| **Visão Geral** | Com 16 avaliações concluídas o texto ainda diz "Cadastre e conclua avaliações… para transformar este painel" | Copy condicional: com dados, mostrar leitura real (dimensão mais frágil, variação, nº de propriedades em Baixa) |
| | Card ICSR médio repete a mesma informação 4× (título, badge, gauge, stat card) | Manter gauge + uma frase; remover o stat card duplicado |
| | "Indicadores: 32 em 4 dimensões científicas" é constante, não métrica | Trocar por dado útil (rascunhos pendentes, avaliações no mês) |
| | Radar monocromático, ordem Econômica→Ambiental→Social→"Gestão" | Ordem canônica Ambiental→Econômica→Social→IGQG; rótulo "IGQG" |
| | Linhas de "Avaliações Recentes" sem hover/foco visível | Estado hover + `focus-visible`, linha inteira clicável |
| **Propriedades** | Formulário e confirmação vazando na página | C1 |
| | Coluna "Área café" mostra `0.00 ha` e `—` para o mesmo caso | Um único tratamento de vazio |
| **Detalhe da Propriedade** | Card "Última avaliação" em gradiente verde escuro com número gigante — anti-padrão explícito do `DESIGN.md` | Fundo branco, `border-top` na cor da banda, gauge |
| | Aba ativa invisível; aba "Comparar" desabilitada sem explicação | C2; tooltip "requer 2 avaliações concluídas" |
| | Rótulos de campo em 10px caixa alta cinza claro | F4 |
| **Nova Avaliação** | Stepper não indica etapa atual nem concluídas; barra "Etapa 1 de 6" mostra 100% e 0% ao mesmo tempo | C2 + corrigir cálculo; concluída = check |
| | Ordem do wizard Econômica→Ambiental, contrária à ordem canônica do instrumento | Alinhar a Ambiental→Econômica→Social→IGQG (validar com a equipe do método) |
| | Título da dimensão em azul claro sobre azul claro | Texto slate-900 + ponto colorido |
| | Opção selecionada quase idêntica à não selecionada (só uma borda cinza) | Fundo sólido na cor da nota + ícone de check, como especificado |
| | "Anterior" desabilitado parece caixa vazia; "Próximo" longe do conteúdo | Barra de ações fixa no rodapé em mobile |
| **Laudo** | Peso/contribuição e gráfico incorretos | C4 |
| | Texto diz "dimensão Econômica" e o chip ao lado "Dimensão mais frágil: Social" | Explicar a diferença (indicador de maior ganho × dimensão mais frágil) ou unificar |
| | Gauge ocupa uma tela inteira no mobile antes do número | Gauge compacto ao lado do valor |
| **Histórico** | Colunas Econômica antes de Ambiental; badge quebrando | Ordem canônica; L4 |
| **Metodologia** | Hero verde escuro; coluna "Gestão & Qualidade" (nome proibido) | Hero claro; "Gestão, Qualidade e Governança (IGQG)" |
| **Guia** | Hero em gradiente; texto "IGS final" (sigla antiga, 5 ocorrências no app) | Sem gradiente; "ICSR" |
| **Login** | Cartão com raio muito grande sobre foto em tela cheia; sem "mostrar senha"; texto de ajuda vago | Raio 12px, overlay mais forte para contraste, alternar visibilidade da senha, mensagem de erro específica |
| **Usuários** | Não abre | C3; depois revisar com os 3 diálogos de C1 |
| **Grãos** | Status "Ativo" idêntico em 50 linhas; código repete o nome | Destacar só os inativos; esconder coluna código no mobile |

---

## Fase 4 — Acessibilidade e estados

- `focus-visible` consistente (anel 2px `caparao-700`, offset 2px) em botões, abas, linhas clicáveis,
  opções de nota e itens de navegação — hoje depende de C2 para aparecer.
- Estados `disabled` distinguíveis (hoje "Salvar" e "Anterior" parecem texto solto).
- `prefers-reduced-motion` para o gauge e transições.
- Skeletons no lugar do layout real (Detalhe e Laudo piscam vazio por ~1 s).
- Corrigir os 30+ erros de lint introduzidos na migração (`setState` em effect, variável usada
  antes da declaração em `NovaAvaliacao.jsx:123/201`, imports não usados) — dois deles são bugs latentes.

---

## Ordem de execução sugerida

| # | Entrega | Esforço | Resultado |
|---|---|---|---|
| 1 | C1 + C2 + C3 | ~½ dia | Sistema volta a ser utilizável; somem abas invisíveis, bordas pretas e formulários vazando |
| 2 | C4 + F3 (impressão) | ~½ dia | Laudo correto na tela e no PDF |
| 3 | F1 + F2 + F4 | 1 dia | Tokens únicos, `DESIGN.md` coerente, tipografia legível em campo |
| 4 | L1–L5 | 1–1½ dia | Navegação mobile completa, tabelas e badges padronizados |
| 5 | Fase 3 | 2 dias | Ajustes por tela |
| 6 | Fase 4 + testes | 1 dia | Acessibilidade, lint limpo, testes de Dialog/Tabs/StatBox para evitar regressão |

**Critério de aceite por fase:** percorrer as 11 telas em 1440px e 375px sem erro no console, sem
conteúdo de diálogo fora de diálogo, com estado ativo visível em toda navegação/aba/etapa, e
`npm run verify:strict` passando.
