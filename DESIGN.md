---
name: SustentaCafé ICSR
description: Instrumento digital de avaliação do Índice Consolidado de Sustentabilidade Rural para técnicos de extensão rural e pesquisadores.
colors:
  # Primary — Verde Caparaó
  verde-caparao:        "#2E7D32"
  verde-caparao-claro:  "#4CAF50"
  verde-caparao-escuro: "#1B5E20"
  # Secondary — Terracota Seco
  terracota:        "#795548"
  terracota-claro:  "#A1887F"
  terracota-escuro: "#4E342E"
  # Neutral
  fundo-campo: "#F1F8E9"
  superficie:  "#FFFFFF"
  borda:       "#E0E0E0"
  texto-primario:   "#212121"
  texto-secundario: "#757575"
  texto-desativado: "#BDBDBD"
  # Data — Dimensões ICSR (4 cores fixas por dimensão)
  azul-economico:    "#2196F3"
  ambar-social:      "#FF9800"
  violeta-governanca: "#9C27B0"
  # Data — Escala de classificação ICSR (5 bandas)
  vermelho-critico:  "#F44336"
  laranja-atencao:   "#FF9800"
  ambar-moderado:    "#FFC107"
  verde-emergente:   "#8BC34A"
  verde-consolidado: "#4CAF50"
  # Texto acessível sobre fundo branco para cores de dado (≥4.5:1)
  texto-critico:    "#B71C1C"
  texto-atencao:    "#E65100"
  texto-moderado:   "#8B6000"
  texto-emergente:  "#33691E"
  texto-consolidado: "#1B5E20"
typography:
  headline:
    fontFamily: "IBM Plex Sans, Segoe UI, Helvetica, Arial, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "-0.02em"
  title:
    fontFamily: "IBM Plex Sans, Segoe UI, Helvetica, Arial, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 700
    lineHeight: 1.3
    letterSpacing: "-0.01em"
  body:
    fontFamily: "IBM Plex Sans, Segoe UI, Helvetica, Arial, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "normal"
  label:
    fontFamily: "IBM Plex Sans, Segoe UI, Helvetica, Arial, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 600
    lineHeight: 1.4
    letterSpacing: "0.01em"
  caption:
    fontFamily: "IBM Plex Sans, Segoe UI, Helvetica, Arial, sans-serif"
    fontSize: "0.72rem"
    fontWeight: 400
    lineHeight: 1.4
    letterSpacing: "normal"
rounded:
  xs:   "4px"
  sm:   "8px"
  md:   "12px"
  pill: "999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "32px"
components:
  button-primary:
    backgroundColor: "{colors.verde-caparao}"
    textColor:       "#FFFFFF"
    rounded:         "{rounded.sm}"
    padding:         "6px 16px"
    typography:      "{typography.label}"
  button-primary-hover:
    backgroundColor: "{colors.verde-caparao-escuro}"
    textColor:       "#FFFFFF"
    rounded:         "{rounded.sm}"
    padding:         "6px 16px"
  button-outlined:
    backgroundColor: "transparent"
    textColor:       "{colors.verde-caparao}"
    rounded:         "{rounded.sm}"
    padding:         "5px 15px"
  button-ghost:
    backgroundColor: "transparent"
    textColor:       "{colors.texto-secundario}"
    rounded:         "{rounded.sm}"
    padding:         "6px 8px"
  card:
    backgroundColor: "{colors.superficie}"
    rounded:         "{rounded.md}"
    padding:         "16px"
  indicador-card:
    backgroundColor: "{colors.superficie}"
    rounded:         "{rounded.md}"
    padding:         "12px 16px"
  indicador-card-selected:
    backgroundColor: "#2E7D3214"
    textColor:       "{colors.verde-caparao}"
    rounded:         "{rounded.md}"
    padding:         "12px 16px"
  chip-classification-boa:
    backgroundColor: "{colors.verde-emergente}"
    textColor:       "{colors.texto-emergente}"
    rounded:         "{rounded.pill}"
    padding:         "4px 12px"
  chip-classification-moderada:
    backgroundColor: "{colors.ambar-moderado}"
    textColor:       "{colors.texto-moderado}"
    rounded:         "{rounded.pill}"
    padding:         "4px 12px"
  chip-dimensao:
    backgroundColor: "#2196F314"
    textColor:       "{colors.azul-economico}"
    rounded:         "{rounded.pill}"
    padding:         "2px 10px"
---

# Design System: SustentaCafé ICSR

## 1. Overview

**Creative North Star: "O Caderno de Campo Digital"**

Este sistema visual traduz o rigor metodológico do ICSR — instrumento científico nascido em planilhas e fichas de campo da EPAMIG e do INCAPER — em uma interface digital que preserva a seriedade técnica sem criar distância. O ponto de referência não é o dashboard de BI corporativo nem o SaaS minimalista: é a ficha de avaliação impressa com hierarquia de dados clara, tabelas que se leem de cima para baixo, e indicadores que têm nome, peso e evidência visíveis ao mesmo tempo. O digital acrescenta cálculo automático, diagnóstico e persistência. O instrumento permanece.

A paleta parte do verde da vegetação do Parque Nacional do Caparaó (o território original do instrumento), não de um verde-marca genérico. As quatro cores de dimensão (ambiental, econômica, social, IGQG) são funcionais, não decorativas: cada cor identifica exatamente uma dimensão em todos os contextos do sistema. A escala de classificação de cinco bandas (vermelho → verde) usa cores acessíveis — com tokens de texto de alta legibilidade derivados de cada matiz — garantindo que o resultado de uma avaliação seja legível em qualquer condição de luz de campo.

A densidade tipográfica segue a IBM Plex Sans: uma família técnica e humanista ao mesmo tempo, nem fria como a Roboto nem genérica como a Inter. Os pesos 400/600/700 criam hierarquia sólida em telas pequenas. Cantos arredondados em 12px nos cards e 8px nos botões transmitem acessibilidade sem infantilismo. A elevação é mínima: uma sombra suave nos cards é o único elemento de profundidade; o restante é plano.

**Key Characteristics:**
- Verde Caparaó como cor primária fixa em toda a navegação e ações primárias
- Quatro cores de dimensão semanticamente imutáveis (azul/laranja/roxo/verde-ambiental)
- Escala de cinco classificações com texto de alto contraste em cada banda
- IBM Plex Sans como única família tipográfica em todos os pesos e tamanhos
- Cantos arredondados generosos (12px cards, 8px botões) com elevação mínima
- Fundo levemente tintado de verde (#F1F8E9) como superfície de trabalho

## 2. Colors: A Paleta do Caparaó

A paleta tem três camadas: a marca (Verde Caparaó), os dados (4 dimensões + 5 classificações), e os neutros de campo. Cores de dado nunca aparecem em contexto de marca, e vice-versa.

### Primary

- **Verde Caparaó** (`#2E7D32`): Cor primária absoluta. Usado em todos os botões primários, itens de navegação ativos, barra de progresso e elementos de identidade. Referência: vegetação densa do Parque Nacional do Caparaó/MG-ES.
- **Verde Caparaó Claro** (`#4CAF50`): Estado hover e acento secundário de marca. Também serve como cor da dimensão Ambiental (dupla função intencional e documentada).
- **Verde Caparaó Escuro** (`#1B5E20`): Estado ativo/pressionado de botões primários. Usado em headings de cards de destaque.

### Secondary

- **Terracota Seco** (`#795548`): Cor secundária; aparecer em ícones de categoria, rótulos de campo e elementos que precisam de contraste orgânico com o verde. Referência: solo exposto de lavoura cafeeira.
- **Terracota Claro** (`#A1887F`): Variante hover do secundário.

### Tertiary — Cores de Dimensão ICSR

As cores de dimensão são tokens de dado, não de identidade. **Não se cruzam com a paleta de marca.** Cada cor pertence a exatamente uma dimensão do ICSR:

- **Verde Ambiental** (`#4CAF50` = Verde Caparaó Claro): Dimensão Ambiental (IA), peso 35%. A sobreposição com a cor de marca é intencional: a dimensão ambiental é a âncora do ICSR.
- **Azul Econômico** (`#2196F3`): Dimensão Econômica (IE), peso 30%.
- **Âmbar Social** (`#FF9800`): Dimensão Social (IS), peso 20%.
- **Violeta Governança** (`#9C27B0`): Dimensão Gestão, Qualidade e Governança (IGQG), peso 15%.

### Neutral

- **Fundo de Campo** (`#F1F8E9`): Superfície global da aplicação. Verde levemente tintado que ancora o sistema no domínio ambiental sem usar um verde saturado como fundo.
- **Superfície** (`#FFFFFF`): Fundo de cards, formulários, dialogs. Contrasta com o fundo de campo para criar profundidade tonal sem sombra.
- **Borda** (`#E0E0E0`): Bordas de inputs, separadores e bordas de outline em estados não-selecionados.
- **Texto Primário** (`#212121`): Corpo de texto principal, rótulos de campos, nomes de indicadores.
- **Texto Secundário** (`#757575`): Metadados, captions, labels secundários.
- **Texto Desativado** (`#BDBDBD`): Estados disabled, placeholders de empty state.

### Escala de Classificação ICSR

A classificação final de uma propriedade cobre cinco bandas. Cada banda tem cor de fundo **e** cor de texto de alta legibilidade (≥4.5:1 sobre branco) para exibição fora do badge colorido:

| Banda | Fundo | Texto legível |
|-------|-------|---------------|
| Muito Baixa | `#F44336` | `#B71C1C` |
| Baixa | `#FF9800` | `#E65100` |
| Moderada | `#FFC107` | `#8B6000` |
| Boa | `#8BC34A` | `#33691E` |
| Alta | `#4CAF50` | `#1B5E20` |

**A Regra do Texto Escuro em Fundo Claro.** Nunca renderize texto branco sobre `#FFC107` (Moderada) ou `#8BC34A` (Boa): o contraste branco/amarelo é 1,07:1 — ilegível em qualquer condição. Sempre use os tokens de texto derivados da escala.

**A Regra das Quatro Dimensões.** As quatro cores de dimensão (azul, laranja, roxo, verde-ambiental) são fixas e imutáveis. Nunca reordene, recolorie ou introduza uma quinta cor de dimensão. A consistência de cor-por-dimensão é a principal âncora de reconhecimento do sistema.

## 3. Typography

**Body Font:** IBM Plex Sans (com fallback Segoe UI, Helvetica, Arial, sans-serif)

**Character:** IBM Plex Sans é uma família técnica com inflexão humanista — o traço mono nos números e parênteses dá legibilidade a dados numéricos (notas de 0,00 a 1,00, percentuais de índice) sem a frieza da Roboto. Em pesos 400/600/700 cria contraste de hierarquia claro em telas de 360px de largura, com luminosidade de campo.

### Hierarchy

- **Headline** (700, 1.5rem/24px, line-height 1.2, letter-spacing -0.02em): Títulos de páginas (`variant="h5"` no MUI). Usado uma vez por página.
- **Title** (700, 1.25rem/20px, line-height 1.3, letter-spacing -0.01em): Cabeçalhos de card, títulos de seção (`variant="h6"`). Usado no cabeçalho de cada card e dimensão.
- **Body** (400, 1rem/16px, line-height 1.5): Texto de critérios descritivos, observações, copy de empty states. Máximo de 65–75ch.
- **Label** (600, 0.875rem/14px, line-height 1.4): Labels de botões, chips, badges de peso de indicador, headers de tabela.
- **Caption** (400, 0.72rem/11.5px, line-height 1.4): Metadados de cards (data, técnico, município), textos de evidência esperada, notas de rodapé de seção.

**A Regra do Peso Duplo.** A hierarquia visual depende exclusivamente de peso (400 vs 600 vs 700) e tamanho. Nunca use itálico para hierarquia. Nunca use all-caps em texto de corpo. O itálico aparece somente em dados de rodapé que o sistema original já usava.

**A Regra da Família Única.** Uma família tipográfica em todos os contextos. Não introduza fonte display separada, fonte de título ou fonte mono para código. IBM Plex Sans em múltiplos pesos é suficiente.

## 4. Elevation

O sistema é **plano por padrão** com uma camada única de elevação para cards e surface containers.

### Shadow Vocabulary

- **Sombra de Card** (`0 2px 12px rgba(0,0,0,0.08)`): Elevação padrão de todos os `<Card>` MUI. Difusa, baixa opacidade; comunica separação da superfície sem criar dramaticidade. Aplicada consistentemente via theme override.
- **Sombra de AppBar** (`0 2px 8px rgba(0,0,0,0.12)`): Levemente mais forte que a sombra de card para que a barra de navegação superior fique claramente à frente do conteúdo rolável.

O contraste de profundidade entre fundo (`#F1F8E9`) e superfície (`#FFFFFF`) complementa a elevação: cards brancos sobre fundo esverdeado criam separação tonal sem sombra adicional. Em componentes internos (IndicadorCard, chips), a separação é feita por borda (`#E0E0E0`) ou fundo tintado (`cor + '14'`), nunca por sombra adicional.

**A Regra Plano por Padrão.** Somente dois níveis de sombra existem no sistema: card e appbar. Qualquer componente que não seja card ou barra de topo deve ser plano. Sombras extras em tooltips, modais ou dropdowns seguem os defaults do MUI sem sobreposição.

## 5. Components

### Buttons

Botões são orgânicos e acessíveis: cantos arredondados em 8px, peso tipográfico 600, `text-transform: none` (nunca maiúsculas automáticas).

- **Shape:** Gently rounded (8px radius)
- **Primary:** Verde Caparaó (`#2E7D32`) com texto branco. Padding 6px 16px. Hover: Verde Caparaó Escuro (`#1B5E20`). `fontWeight: 600`, `textTransform: none`.
- **Outlined:** Borda 1px Verde Caparaó, fundo transparente, texto Verde Caparaó. Para ações secundárias de mesmo nível.
- **Ghost/text:** Sem borda nem fundo. Texto Secundário (`#757575`). Para ações terciárias (Voltar, Cancelar).
- **Destrutivo:** `color="error"` padrão MUI — vermelho `#F44336`. Apenas em ações de exclusão permanente.

### Chips

Dois tipos de chip com regras distintas:

- **Chip de Classificação:** Fundo sólido na cor da banda ICSR, texto no token de contraste derivado (ver Escala de Classificação). `fontWeight: 700`. Nunca use texto branco sobre Moderada ou Boa.
- **Chip de Estado (sync, status):** Fundo transparente (`variant="outlined"`), cor semântica MUI (success/warning/error). `fontWeight: 600`, `fontSize: 0.72rem`.
- **Chip de Peso de Indicador:** Fundo tintado da cor da dimensão (`cor + '1A'`), texto na própria cor da dimensão. `fontSize: 0.65rem`, `fontWeight: 700`. Visível dentro do `IndicadorCard`.

### Cards e Containers

- **Corner Style:** Gently rounded (12px), via theme override global.
- **Background:** Superfície branca (`#FFFFFF`) sobre fundo de campo (`#F1F8E9`).
- **Shadow:** Sombra de card padrão (`0 2px 12px rgba(0,0,0,0.08)`).
- **Border:** Nenhuma borda por padrão. Variante `borderTop: 3px solid {cor}` para cards de resultado semântico (comparativo, classificação).
- **Internal Padding:** 16px padrão (`CardContent`). 12px em componentes compactos (IndicadorCard dentro do wizard).

### IndicadorCard (Componente Assinatura)

O `IndicadorCard` é o componente central do sistema — o bloco de avaliação de um único indicador ICSR. Documenta-se separadamente por sua especificidade:

- **Default:** Card branco, borda `2px solid transparent`. Contém: ponto-indicador colorido (cor da dimensão), nome do indicador, badge de peso (ex: "peso 15%"), critério descritivo, e lista de 5 opções clicáveis (notas 0,00 a 1,00).
- **Opção não selecionada:** Fundo tintado leve (`cor + '18'`), texto no token acessível da nota (`COR_NOTA_TEXTO`). Border `1.5px solid #E0E0E0`.
- **Opção selecionada:** Fundo sólido na cor da nota (`COR_NOTA`), texto no token de badge selecionado (`COR_BADGE_SELECIONADO`). Border `1.5px solid {cor}`. Ícone de check visível.
- **Card inteiro selecionado (nota atribuída):** Borda `2px solid {COR_NOTA}55`.
- **Tooltip de glossário:** `FiInfo` aparece no nome do indicador sempre que existe definição no glossário (APP, RL, MIP, EPI, FPIC, Due Diligence, Stakeholders). Tooltip usa o texto do glossário.
- **Evidência:** `Chip` outlined com ícone `FiCheckSquare`. Texto de evidência esperada.
- **Observação:** Área colapsável com `TextField` multilinha para justificativa do avaliador.

### Inputs e Formulários

- **Style:** MUI outlined padrão. Borda `#E0E0E0`, label animada. Fundo branco.
- **Focus:** Borda Verde Caparaó (`#2E7D32`), label em Verde Caparaó.
- **Error:** Borda e label vermelho (`#F44336`) com helperText descritivo.
- **Disabled:** Fundo `rgba(0,0,0,0.04)`, borda `rgba(0,0,0,0.12)`, texto desativado.
- **Autocomplete de propriedade:** `renderOption` customizado com nome e localização.

### Navigation

- **Desktop Sidebar (260px):** Persistent drawer com fundo `#FFFFFF`. Item ativo: `bgcolor: verde-caparao, color: white`. Item hover: `bgcolor: action.hover`. Border-right 1px `rgba(0,0,0,0.08)`. Cada item tem ícone Feather (20px) + label em 0.9rem fontWeight 500/700.
- **Mobile Bottom Nav (64px):** Fixed, branco, border-top 1px divider. 5 itens com label + ícone (MUI BottomNavigation com `showLabel`). Label 0.65rem fontWeight 600. Ativo: Verde Caparaó.
- **AppBar:** Verde Caparaó Escuro (`#1B5E20`) background (MUI primary). Altura 64px desktop, 56px mobile. Shadow padrão appbar.

### EmptyState (Componente Utilitário)

Padrão uniforme de estado vazio em todo o sistema: ícone centralizado com opacidade 0.5, título em `text.secondary`, descrição em `text.disabled`, botão de ação primária. Dois tamanhos: `small` (py 3) e padrão (py 6).

## 6. Do's and Don'ts

### Do:

- **Do** usar Verde Caparaó (`#2E7D32`) e apenas este verde para ações primárias, navegação ativa e elementos de marca. O verde-ambiental da dimensão IA compartilha o mesmo hex (`#4CAF50` = claro) — essa sobreposição é intencional e documentada.
- **Do** usar os tokens `COR_NOTA_TEXTO` para qualquer texto sobre fundo branco que represente uma nota ICSR. Nunca o hex da nota direto como cor de texto.
- **Do** usar `borderTop: 3px solid {cor}` em vez de `borderLeft` para acentuar cards semanticamente. O side-stripe lateral é um anti-padrão abolido no sistema.
- **Do** incluir sempre nome, peso e evidência visíveis em cada indicador durante a avaliação. A transparência metodológica é funcionalidade, não decoração.
- **Do** respeitar a ordem das quatro dimensões: Ambiental (verde, 35%) → Econômica (azul, 30%) → Social (laranja, 20%) → IGQG (roxo, 15%). Essa ordem é canônica no ICSR e deve ser mantida em qualquer visualização.
- **Do** usar IBM Plex Sans em peso 600–700 para labels de critério e peso de indicador. A diferença de peso é a única hierarquia tipográfica nos cards de avaliação.
- **Do** aplicar `EmptyState` com título, descrição e ação primária sempre que uma lista ou seção estiver vazia. "Nenhum resultado" sem instrução é proibido.
- **Do** manter `text-transform: none` em todos os botões. Maiúsculas automáticas de botão são um resquício do Material Design v1.
- **Do** usar `friendlyError()` para toda mensagem de erro exibida ao usuário. Nunca exponha `err.message` da API diretamente.

### Don't:

- **Don't** usar `border-left` maior que 1px como acento colorido em cards, listas ou alertas. O side-stripe é o tell #1 de UI gerada por AI. Use `borderTop`, fundo tintado ou nada.
- **Don't** usar texto branco sobre `#FFC107` (Moderada) ou `#8BC34A` (Boa). O contraste é 1,07:1 e 2,6:1 respectivamente — ilegível. Use os tokens de texto derivados.
- **Don't** criar um hero card com gradiente escuro (`linear-gradient` sobre verde escuro). O hero-metric template com número grande, gradiente e badge centralizado é o anti-padrão principal deste sistema. O resultado da avaliação é apresentado com fundo branco, `borderTop` semântica e gauge radial.
- **Don't** parecer com um SaaS genérico (Notion, Linear): cards brancos minimalistas sem hierarquia de dados, paleta azul-acinzentada fria, tipografia sem peso. O sistema tem identidade de instrumento técnico institucional, não de ferramenta de produtividade.
- **Don't** parecer com um dashboard de BI corporativo (Power BI, Tableau): múltiplos gráficos empilhados, densidade de informação intimidadora, ausência de fluxo de avaliação. O sistema é um wizard de avaliação com resultado, não um painel analítico.
- **Don't** parecer com um app governamental antiquado: formulários sem hierarquia, ausência de feedback visual, estados de erro sem cor ou ícone. O sistema tem skeleton loaders, toasts amigáveis e estados semânticos.
- **Don't** parecer com um app agro estereotípico: ícones de trator, verde-escuro saturado em todo lugar, identidade visual de cooperativa. A paleta do sistema é contida; o verde serve como âncora metodológica, não como "tema de natureza".
- **Don't** introduzir uma quinta cor de dimensão. O sistema tem exatamente quatro dimensões ICSR com cores fixas. Uma dimensão adicional exigiria revisão metodológica completa do instrumento.
- **Don't** usar `gradient-text` (`background-clip: text`). Ênfase é feita via peso tipográfico e tamanho, nunca com gradiente decorativo.
- **Don't** adicionar um loading spinner centralizado como estado de carregamento de página. Use `<Skeleton>` components com o layout real como placeholder.
- **Don't** nomear a IGQG de "Gestão e Qualidade" ou "IGQ" em nenhum texto visível. O nome canônico pós-revisão é "Gestão, Qualidade e Governança" e a sigla é IGQG. O código interno usa `gestao_qualidade` por compatibilidade de banco, mas a UI usa sempre o nome completo.
