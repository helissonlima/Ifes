---
target: sistema-icsr-completo
total_score: 23
p0_count: 0
p1_count: 3
timestamp: 2026-05-31T15-26-46Z
slug: sistema-icsr-completo
---
## Design Health Score

| # | Heurística | Score | Problema Central |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 3 | Spinners centrados ao invés de skeletons; boa cobertura de sync/offline |
| 2 | Match System / Real World | 2 | IGS vs ICSR em todo o sistema; "Dashboard" como heading genérico; siglas sem contexto inline |
| 3 | User Control and Freedom | 3 | Recuperação de rascunho excelente; stepper não-linear; avaliação deletável |
| 4 | Consistency and Standards | 2 | 30 hardcoded (agora 32); #FFC107 como texto E estado; IGS/ICSR em conflito |
| 5 | Error Prevention | 3 | Modo offline, autosave, confirmações. Formulário permite concluir incompleto, mas avisa |
| 6 | Recognition Rather Than Recall | 2 | MobileStepper sem nome de dimensão; 4 tabs de diagnóstico exigem memória |
| 7 | Flexibility and Efficiency | 1 | Zero atalhos. Zero lote. Sem duplicar avaliação. |
| 8 | Aesthetic and Minimalist Design | 2 | Side-tabs em 8 lugares; hero-card gradiente; cacofonia de 14+ cores simultâneas |
| 9 | Error Recovery | 2 | err.message exposto; sem retry; sem ação sugerida |
| 10 | Help and Documentation | 3 | Metodologia e Guia existem. Sem tooltip inline na avaliação |
| Total | | 23/40 | Aceitável — melhorias significativas necessárias |

## Anti-Patterns Verdict
LLM: hero-metric template em Resultado, idêntico-card grid em todas as páginas, conflito semântico verde.
Detector: 1x overused-font (Inter, index.css:8), 8x side-tab (Metodologia.jsx:74,92,181,312; PropriedadeDetalhe.jsx:465,476,492; Usuarios.jsx:604).

## Priority Issues
[P1] #FFC107 como cor de texto falha contraste (1.07:1 em IGSBadge, 1.74:1 em IGSGauge)
[P1] IGS vs ICSR nomenclatura em conflito em todo o sistema
[P1] Mobile step wizard sem identificação de dimensão
[P2] 8 side-tab borders — tell #1 de UI AI-generated
[P2] StatCard "Indicadores: 30" hardcoded e desatualizado (agora 32)
