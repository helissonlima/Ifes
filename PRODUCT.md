# Product

## Register

product

## Users

Técnicos de campo vinculados a órgãos de extensão rural (EMATER, instituição regional, EPAMIG) e pesquisadores do IFES. Usam o sistema em visitas a propriedades rurais — frequentemente com conectividade instável ou ausente — para registrar avaliações do ICSR. Contexto: campo, sol, tela pequena, pressa. Nível de letramento digital variado; muitos operam o sistema esporadicamente entre visitas.

## Product Purpose

Instrumento digital de avaliação de sustentabilidade rural baseado no ICSR (Índice Consolidado de Sustentabilidade Rural), integração referência metodológica regional. Substitui planilhas e formulários físicos, calcula automaticamente os subíndices ponderados e o ICSR final, gera diagnóstico e recomendações por propriedade. Sucesso: técnico conclui uma avaliação completa em campo em ≤ 7h, com ou sem internet, e o resultado é imediatamente compreensível pelo produtor.

## Brand Personality

Institucional, robusto, transparente. Voz de instrumento científico de extensão rural — não de startup, não de governo burocrático. Confiança derivada de precisão metodológica visível, não de ornamento.

## Anti-references

- SaaS genérico minimalista (Notion, Linear): cards brancos, tipografia fria cinza-azulada, sem substância técnica
- Dashboard BI corporativo (Power BI, Tableau): denso de gráficos empilhados, intimidador, voltado a analistas
- App governamental antiquado: formulários sem hierarquia, interface anos 2000, ausência de feedback visual
- App agro estereotípico: verde-escuro com folhas, ícones de trator, identidade de cooperativa — clichê do setor sem rigor de instrumento científico

## Design Principles

1. **A ferramenta serve o campo** — cada tela deve funcionar com uma mão ocupando o celular, sol na tela e conexão irregular. Prioritize legibilidade, toque, e estados offline sobre riqueza visual.
2. **Rigor visível** — pesos, fórmulas e critérios devem estar acessíveis na interface; o técnico precisa justificar cada nota ao produtor. Transparência metodológica é funcionalidade, não decoração.
3. **Resultado como conversa** — o laudo final não é só um número; é o início de um diálogo entre técnico e produtor. A apresentação do resultado deve comunicar contexto e direção, não só score.
4. **Institucional sem ser pesado** — credibilidade governamental/científica sem a aridez burocrática. Hierarquia clara, espaçamento generoso, paleta controlada.
5. **Coerência de estado** — avaliação parcial, offline, concluída e erro são estados distintos que o usuário precisa ler de relance. Nunca ambíguos.

## Accessibility & Inclusion

WCAG AA como piso (contraste 4.5:1 em texto de corpo). Suporte a `prefers-reduced-motion`. Interface utilizável com conexão instável (cache local, feedback de sync). Textos de critérios e recomendações legíveis em fonte mínima 14px em telas de 360px de largura.
