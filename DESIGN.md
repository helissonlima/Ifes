---
name: SustentaCafé ICSR
description: Instrumento digital de avaliação do Índice Consolidado de Sustentabilidade Rural para técnicos de extensão rural e pesquisadores.
stack: React 19 + Tailwind CSS v4 + Radix UI (sem MUI desde set/2026)
colors:
  # Marca — Verde Caparaó (escala única, âncora em 700)
  caparao-50:  "#F0F7F1"
  caparao-100: "#DCEDE0"
  caparao-200: "#BBDCC3"
  caparao-300: "#8DC29B"
  caparao-400: "#5A9F6E"
  caparao-500: "#35804B"
  caparao-600: "#246237"
  caparao-700: "#1B4D24"
  caparao-800: "#143519"
  caparao-900: "#0F2712"
  # Neutros — escala slate do Tailwind
  fundo-app:        "#F8FAFC"  # slate-50
  superficie:       "#FFFFFF"
  borda:            "#E2E8F0"  # slate-200
  texto-primario:   "#0F172A"  # slate-900
  texto-secundario: "#475569"  # slate-600
  texto-terciario:  "#64748B"  # slate-500
  texto-placeholder: "#94A3B8" # slate-400
  # Dado — dimensões ICSR (definidas no backend, ver models/indicadores.js)
  verde-ambiental:    "#4CAF50"
  azul-economico:     "#2196F3"
  ambar-social:       "#FF9800"
  violeta-governanca: "#9C27B0"
  # Dado — escala de classificação ICSR (5 bandas, ver utils/coresICSR.js)
  vermelho-critico:  "#F44336"
  laranja-atencao:   "#FF9800"
  ambar-moderado:    "#FFC107"
  verde-emergente:   "#8BC34A"
  verde-consolidado: "#4CAF50"
  # Dado — texto acessível sobre fundo branco (≥4.5:1)
  texto-critico:     "#B71C1C"
  texto-atencao:     "#E65100"
  texto-moderado:    "#8B6000"
  texto-emergente:   "#33691E"
  texto-consolidado: "#1B5E20"
typography:
  fontFamily: "Inter, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, system-ui, sans-serif"
  headline:  { class: "text-2xl font-bold tracking-tight",  size: "1.5rem",   weight: 700 }
  title:     { class: "text-base font-bold tracking-tight", size: "1rem",     weight: 700 }
  body:      { class: "text-sm",                            size: "0.875rem", weight: 400 }
  label:     { class: "text-sm font-semibold",              size: "0.875rem", weight: 600 }
  meta:      { class: "text-xs",                            size: "0.75rem",  weight: 400 }
rounded:
  md:   "0.5rem"    # rounded-lg — botões, inputs, badges
  lg:   "0.75rem"   # rounded-xl — cards, alerts
  xl:   "1rem"      # rounded-2xl — diálogos
  pill: "9999px"    # rounded-full — barras de progresso, avatares
spacing:
  xs: "0.25rem"
  sm: "0.5rem"
  md: "1rem"
  lg: "1.25rem"   # padding padrão de card (p-5)
  xl: "1.5rem"    # gap entre blocos de página (space-y-6)
components:
  button-primary:
    class: "bg-caparao-700 text-white hover:bg-caparao-800 active:bg-caparao-900 rounded-lg text-sm font-semibold px-3.5 py-2 shadow-xs"
  button-secondary:
    class: "bg-slate-100 text-slate-800 hover:bg-slate-200 rounded-lg"
  button-outline:
    class: "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 rounded-lg shadow-xs"
  button-ghost:
    class: "text-slate-600 hover:bg-slate-100 hover:text-slate-900 rounded-lg"
  button-danger:
    class: "bg-red-600 text-white hover:bg-red-700 rounded-lg shadow-xs"
  card:
    class: "rounded-xl border border-slate-200/90 bg-white shadow-xs"
    padding: "p-5"
  input:
    class: "rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm shadow-2xs focus:ring-2 focus:ring-caparao-700/20 focus:border-caparao-700"
  badge-default:
    class: "rounded-md bg-slate-100 text-slate-800 border border-slate-200/80 text-xs font-bold px-2.5 py-1"
  dialog:
    class: "sm:rounded-2xl sm:max-h-[85vh] bg-white shadow-xl border border-slate-200"
    mobile: "inset-0 (folha de tela cheia abaixo de 640px)"
---

# Design System: SustentaCafé ICSR

> **Escopo deste documento.** Descreve o sistema visual **em vigor**: React 19 +
> Tailwind CSS v4 + Radix UI. A versão anterior deste arquivo descrevia o sistema
> MUI (IBM Plex Sans, fundo `#F1F8E9`, verde `#2E7D32`), removido do código em
> setembro de 2026. As regras de **domínio** — quatro dimensões, cinco bandas de
> classificação, tokens de texto acessível, nomenclatura IGQG — foram preservadas
> na íntegra, porque são metodológicas, não estéticas.

## 1. Overview

**Creative North Star: "O Caderno de Campo Digital"**

Este sistema visual traduz o rigor metodológico do ICSR — instrumento científico
nascido em planilhas e fichas de campo — em uma interface digital que preserva a
seriedade técnica sem criar distância. O ponto de referência não é o dashboard de
BI corporativo nem o SaaS minimalista: é a ficha de avaliação impressa, com
hierarquia de dados clara, tabelas que se leem de cima para baixo, e indicadores
que têm nome, peso e evidência visíveis ao mesmo tempo. O digital acrescenta
cálculo automático, diagnóstico e persistência. O instrumento permanece.

A paleta tem duas camadas que **nunca se cruzam**:

- **Marca e interface** — o Verde Caparaó em escala única sobre neutros slate. Um
  só verde de ação; nenhuma outra cor compete com ele por atenção.
- **Dado** — as quatro cores de dimensão e as cinco bandas de classificação. São
  funcionais: cada cor identifica exatamente uma coisa, em todos os contextos.

Uma cor de dado nunca aparece como cor de ação, e o verde de marca nunca é usado
para representar um valor de dimensão.

## 2. Colors

### Marca — Verde Caparaó

Escala de 50 a 900 declarada em `frontend/src/index.css` (bloco `@theme`),
ancorada em **`#1B4D24` (700)**. Referência: vegetação densa do Parque Nacional
do Caparaó (MG-ES).

| Tom | Hex | Uso |
|-----|-----|-----|
| `caparao-50` | `#F0F7F1` | Fundo de item de navegação ativo, faixas de destaque suaves |
| `caparao-100` / `200` | `#DCEDE0` / `#BBDCC3` | Bordas e divisores em superfícies tintadas |
| `caparao-700` | `#1B4D24` | **Cor primária.** Botões primários, aba ativa, etapa atual, anel de foco |
| `caparao-800` | `#143519` | Hover de botão primário, cabeçalhos de tabela escuros |
| `caparao-900` | `#0F2712` | Estado ativo/pressionado, barra de navegação superior |

**A Regra do Verde Único.** Existe uma escala de verde no sistema. Não introduza
um segundo verde de marca, nem use um tom da escala de classificação (`#4CAF50`,
`#8BC34A`) como cor de ação.

**Em JavaScript**, onde não cabe classe (atributos SVG do Recharts, `style`
inline, props que carregam cor), use as constantes de `utils/coresMarca.js`.
Nunca escreva o hex direto no JSX.

### Neutros

A escala **slate** do Tailwind, sem customização. Fundo da aplicação
`slate-50` (`#F8FAFC`), superfícies brancas, bordas `slate-200`.

| Papel | Classe | Uso |
|-------|--------|-----|
| Texto primário | `text-slate-900` | Corpo, nomes de indicadores, títulos |
| Texto secundário | `text-slate-600` | Critérios, descrições, recomendações |
| Texto terciário | `text-slate-500` | Metadados (data, técnico, município) |
| Placeholder | `text-slate-400` | Campos vazios, ícones de estado vazio |

### Dado — Cores de Dimensão ICSR

Definidas no **backend** (`backend/src/models/indicadores.js`) e entregues pela
API junto com a metodologia. O frontend não tem uma segunda lista.

- **Verde Ambiental** `#4CAF50` — Ambiental (IA), peso 35%
- **Azul Econômico** `#2196F3` — Econômica (IE), peso 30%
- **Âmbar Social** `#FF9800` — Social (IS), peso 20%
- **Violeta Governança** `#9C27B0` — Gestão, Qualidade e Governança (IGQG), peso 15%

### Dado — Escala de Classificação ICSR

Cinco bandas, em `frontend/src/utils/coresICSR.js`. Cada banda tem cor de fundo
**e** cor de texto de alta legibilidade (≥4.5:1 sobre branco):

| Banda | Fundo | Texto legível |
|-------|-------|---------------|
| Muito Baixa | `#F44336` | `#B71C1C` |
| Baixa | `#FF9800` | `#E65100` |
| Moderada | `#FFC107` | `#8B6000` |
| Boa | `#8BC34A` | `#33691E` |
| Alta | `#4CAF50` | `#1B5E20` |

**A Regra do Texto Escuro em Fundo Claro.** Nunca renderize texto branco sobre
`#FFC107` (Moderada) ou `#8BC34A` (Boa): o contraste é 1,07:1 e 2,6:1 —
ilegível. Use sempre os tokens de texto derivados (`COR_NOTA_TEXTO`,
`COR_CLASSIFICACAO_TEXTO`, `COR_CLASSIFICACAO_TEXTO_SOBRE_FUNDO`).

**A Regra das Quatro Dimensões.** As quatro cores de dimensão são fixas e
imutáveis. Nunca reordene, recolorie ou introduza uma quinta.

### Exceção documentada

`Metodologia.jsx` usa `#1565C0` e `#2E7D32` nos dois cards que comparam as
metodologias de origem. São cores de identidade daquela comparação específica,
não da marca nem de dado, e vivem só naquele arquivo.

## 3. Typography

**Família:** Inter (via `@fontsource/inter`), com fallback de sistema.
Uma família em todos os contextos — nenhuma fonte display, nenhuma mono.

**Character:** Inter é uma grotesca neutra de alta legibilidade em tela, com
numerais tabulares que mantêm colunas de notas e percentuais alinhadas. Para
dados numéricos, use `tabular-nums` — nunca `font-mono`.

### Hierarquia

| Nível | Classe | Tamanho | Uso |
|-------|--------|---------|-----|
| Headline | `text-2xl font-bold tracking-tight` | 24px | Título de página. Uma vez por tela |
| Title | `text-base font-bold tracking-tight` | 16px | Cabeçalho de card e de seção |
| Body | `text-sm` | 14px | Critérios, recomendações, descrições, copy |
| Label | `text-sm font-semibold` | 14px | Rótulos de campo, botões, cabeçalho de tabela |
| Meta | `text-xs` | 12px | Data, técnico, município, notas de rodapé |

**A Regra do Piso de 12px.** Nada abaixo de `text-xs` (12px). O sistema é usado
em campo, com sol na tela e telas de 360px. Tamanhos arbitrários
(`text-[10px]`, `text-[11px]`) foram removidos e não devem voltar.

**A Regra dos 14px para Leitura.** Todo texto que o técnico **lê para decidir** —
critério do indicador, descrição das cinco opções de nota, evidência esperada,
recomendação do diagnóstico — é `text-sm` (14px), conforme o `PRODUCT.md`. 12px
é para metadado, não para conteúdo.

**A Regra do Peso.** A hierarquia depende de peso (400/600/700) e tamanho. Nunca
itálico para hierarquia; nunca caixa alta em texto de corpo.

## 4. Elevation

O sistema é **plano por padrão**. Sombras são sutis e existem para separar
superfície de fundo, não para criar drama.

- **`shadow-xs`** — cards, botões primários, barra superior. É a sombra padrão.
- **`shadow-2xs`** — inputs.
- **`shadow-xl`** — apenas diálogos, que flutuam sobre um overlay.

O contraste entre o fundo `slate-50` e as superfícies brancas já cria separação
tonal; a borda `slate-200/90` do card completa a leitura. Componentes internos
(badges, chips, opções de nota) são planos: separam-se por borda ou fundo
tintado, nunca por sombra.

## 5. Components

### Buttons

Cantos `rounded-lg` (8px), peso 600, sem caixa alta automática. Seis variantes:

- **primary** — `bg-caparao-700`, texto branco. Uma ação primária por tela.
- **secondary** — `bg-slate-100`. Ações de mesmo nível (Cancelar ao lado de Salvar).
- **outline** — borda `slate-300` sobre branco. Ações secundárias em barra de ações.
- **ghost** — sem borda nem fundo. Ações terciárias (Voltar).
- **danger** / **dangerOutline** — `red-600`. Só exclusão permanente.

Tamanhos: `sm` (12px), `md` (14px, padrão), `lg` (16px), `icon`.

### Badges

`rounded-md`, `text-xs`, peso 700. Variantes semânticas: `default`, `primary`,
`success`, `warning`, `danger`, `info`, `outline`.

Badges de **classificação ICSR** não usam essas variantes: recebem a cor da
banda via `style`, sempre com o token de texto correspondente.

### Cards

- `rounded-xl`, borda `slate-200/90`, fundo branco, `shadow-xs`.
- Padding interno `p-5`; `CardHeader` + `CardContent` mantêm o ritmo.
- Acento semântico: `border-t-4` na cor da banda ou dimensão. **Nunca**
  `border-left` colorido — o side-stripe é anti-padrão no sistema.

### Dialog

Um único componente (`components/ui/Dialog.jsx`) monta overlay, cabeçalho com
título, **corpo rolável** e **rodapé fixo**. Cabeçalho e rodapé não rolam, para
que as ações continuem visíveis em formulários longos.

- Desktop: caixa centralizada, `sm:max-w-*`, `sm:max-h-[85vh]`, `sm:rounded-2xl`.
- Mobile (<640px): folha de tela cheia, sem raio.
- Overlay sólido `bg-slate-900/50`, sem blur.

API: `<Dialog open onOpenChange title description footer className>`. Não use as
primitivas do Radix diretamente nas telas.

### IndicadorCard (Componente Assinatura)

O bloco de avaliação de um único indicador — o componente central do sistema.

- **Cabeçalho:** ponto na cor da dimensão, nome do indicador, badge de peso
  (`peso 15%`), e o critério em `text-sm`.
- **Cinco opções de nota** (0,00 a 1,00): não selecionada tem fundo tintado
  (`cor + '18'`) e texto no token acessível da nota; selecionada tem fundo sólido
  na cor da nota, texto em `COR_NOTA_BADGE_SELECIONADO` e ícone de check.
- **Tooltip de glossário:** `FiInfo` no nome quando há definição (APP, RL, MIP,
  EPI, FPIC, Due Diligence, Stakeholders).
- **Evidência esperada:** faixa `slate-50` com `FiCheckSquare`, em `text-sm`.
- **Observação:** área colapsável com campo multilinha.

### Inputs

`rounded-lg`, borda `slate-300`, fundo branco. Foco: anel
`ring-caparao-700/20` + borda `caparao-700`. Erro: borda `red-500` com
`helperText`. Disabled: opacidade reduzida e cursor bloqueado.

### Navigation

- **Sidebar desktop (260px):** fundo branco, borda à direita. Item ativo:
  fundo `caparao-50` e texto `caparao-800`. Agrupada por seção
  (Operação de Campo / Metodologia & Referência / Administração).
- **Bottom nav mobile:** fixa, branca, borda no topo. Item ativo em
  `caparao-700`.
- **Navbar:** `caparao-900`, altura 60px, `shadow-xs`.

### EmptyState

Padrão uniforme: ícone centralizado esmaecido, título em `slate-600`, descrição
em `slate-400`, botão de ação primária. "Nenhum resultado" sem instrução é
proibido.

### Print

O laudo é o artefato entregue ao produtor. As regras vivem em `index.css`
(`@media print`): o cromo (`header`, `aside`, `nav`, `.no-print`) some, as abas
viram seções em sequência — todas as dimensões saem no papel, não só a ativa — e
as cores são preservadas com `print-color-adjust: exact`.

## 6. Do's and Don'ts

### Do:

- **Do** usar a escala `caparao-*` para tudo que é marca e ação. Um verde só.
- **Do** usar os tokens de `coresICSR.js` para qualquer cor que represente uma
  nota ou classificação, e os tokens de texto correspondentes sobre fundo claro.
- **Do** usar `utils/coresMarca.js` quando precisar da cor da marca em JS
  (Recharts, `style`), em vez de repetir o hex.
- **Do** usar `border-top` para acentuar cards semanticamente.
- **Do** manter nome, peso e evidência visíveis em cada indicador durante a
  avaliação. Transparência metodológica é funcionalidade, não decoração.
- **Do** respeitar a ordem canônica das dimensões: Ambiental (35%) → Econômica
  (30%) → Social (20%) → IGQG (15%).
- **Do** usar `tabular-nums` em qualquer coluna de números.
- **Do** formatar números e datas em pt-BR (`utils/formatarNumero.js`,
  `utils/formatarData.js`): vírgula decimal, `dd/mm/aaaa`.
- **Do** aplicar `EmptyState` com título, descrição e ação sempre que uma lista
  estiver vazia.
- **Do** usar `friendlyError()` para toda mensagem de erro. Nunca exponha
  `err.message` da API.

### Don't:

- **Don't** escrever hex direto em `className` (`bg-[#1B4D24]`). Use o token.
- **Don't** usar `border-left` colorido como acento. É o tell #1 de UI gerada por
  IA. Use `border-top`, fundo tintado ou nada.
- **Don't** usar texto branco sobre `#FFC107` (Moderada) ou `#8BC34A` (Boa).
- **Don't** criar hero card com gradiente escuro e número gigante. O resultado da
  avaliação é apresentado em fundo branco, com `border-top` semântica e gauge.
- **Don't** usar `text-[10px]`/`text-[11px]` nem qualquer tamanho abaixo de 12px.
- **Don't** usar `font-mono` para dados. Inter + `tabular-nums` resolve.
- **Don't** usar classes de animação de plugin (`animate-in`, `fade-in-0`,
  `slide-in-from-*`) sem instalar o plugin — elas não geram CSS e somem sem aviso.
- **Don't** parecer com um SaaS genérico (Notion, Linear): cards brancos sem
  hierarquia de dados, paleta azul-acinzentada fria, tipografia sem peso.
- **Don't** parecer com um dashboard de BI (Power BI, Tableau): gráficos
  empilhados, densidade intimidadora, ausência de fluxo de avaliação.
- **Don't** parecer com um app governamental antiquado: formulários sem
  hierarquia, ausência de feedback, erros sem cor nem ícone.
- **Don't** parecer com um app agro estereotípico: ícones de trator, verde
  saturado em todo lugar, identidade de cooperativa.
- **Don't** introduzir uma quinta cor de dimensão.
- **Don't** usar `background-clip: text` (gradient text). Ênfase vem de peso e
  tamanho.
- **Don't** usar spinner centralizado como carregamento de página. Use
  `<Skeleton>` com o layout real.
- **Don't** nomear a IGQG de "Gestão e Qualidade" ou "IGQ" em texto visível. O
  nome canônico é "Gestão, Qualidade e Governança" e a sigla é IGQG. O código
  interno usa `gestao_qualidade` por compatibilidade de banco.
