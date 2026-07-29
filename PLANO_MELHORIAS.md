# Plano de Melhorias — SustentaCafé (IFES)

> Plano modular gerado a partir de auditoria completa do código (frontend React 19 + MUI 9 + Vite, backend Node/Express + PostgreSQL 16, Docker).
> Cada módulo é autocontido e pode ser entregue a uma IA/dev para execução independente, **na ordem sugerida** (M1 → M10). Após cada módulo, rodar `npm run verify` na raiz e testar manualmente os fluxos afetados.

---

## M1 — Segurança do backend (CRÍTICO, fazer primeiro)

**Objetivo:** eliminar vulnerabilidades que permitem escalonamento de privilégio e forja de tokens.

1. **Proteger rotas admin de grãos** — `backend/src/routes/graos.js:8-12`: as rotas `/admin/*` (criar, atualizar, deletar, sincronizar-ibge) exigem apenas `authRequired`. Adicionar `requireAdmin` (importar de `src/middleware/auth.js`). Hoje qualquer usuário logado pode deletar o catálogo.
2. **Abortar sem JWT_SECRET** — `backend/src/middleware/auth.js:10` e `src/controllers/authController.js:30` usam fallback `'dev-secret-change-me'`. Em `NODE_ENV=production`, se o segredo não carregar, o processo deve `process.exit(1)` com erro claro (ajustar `src/config/secrets.js:13`, que hoje só faz `console.warn`).
3. **Admin bootstrap sem senha padrão** — `src/config/authBootstrap.js:42-43` cria admin `admin@example.com` / `change-me-now`. Em produção, exigir `ADMIN_EMAIL`/`ADMIN_PASSWORD` via env/secret (falhar se ausentes) e declará-los no `docker-compose.yml`.
4. **Parar de vazar `err.message`** — em `authController.js` (linhas 65, 76, 87, 121, 178, 215, 235, 260), `propriedadesController.js` e `avaliacoesController.js`: responder mensagem genérica ("Erro interno") e logar o detalhe no servidor. Aproveitar o error handler global de `server.js:64-67` chamando `next(err)`.
5. **Rate limiting + hardening** — adicionar `express-rate-limit` no `POST /api/auth/login` (ex.: 10 tentativas/15min por IP), `helmet`, e `express.json({ limit: '1mb' })` em `server.js:51`.
6. **Corrigir enumeração de conta** — `authController.js:55`: retornar sempre 401 "Credenciais inválidas" (verificar senha antes de revelar "usuário inativo", ou unificar a mensagem).
7. **Permissões vivas** — permissões vêm do JWT (`auth.js:25`); revogação só vale após 12h. Opções: consultar permissões no banco em `authRequired` (com cache curto) ou reduzir `expiresIn` + implementar refresh token (o `JWT_REFRESH_SECRET` já existe no compose mas nunca é usado — implementar ou remover).
8. **Segredos com 32 bytes** — `scripts/init-secrets.js:17`: gerar 32 bytes para HS256.

**Critério de aceite:** usuário não-admin recebe 403 em `/api/graos/admin/*`; backend não sobe em produção sem `JWT_SECRET`; login com senha errada nunca revela existência da conta; nenhuma resposta HTTP contém mensagem interna do Postgres.

---

## M2 — Validação e robustez do backend

**Objetivo:** nenhuma entrada malformada deve gerar 500 ou corromper estado.

1. **Adotar `zod`** (ou `express-validator`) e criar middleware de validação por rota.
2. `avaliacoesController.js:90-96,124-130` — validar que `respostas` é array e que cada item tem `dimensao` (uma das 4 válidas), `indicador_codigo` existente e `nota` ∈ {0, 0.25, 0.5, 0.75, 1}.
3. `propriedadesController.js:119-131` — no `atualizar`, validar obrigatórios como no `criar`; ignorar campos `undefined` em vez de sobrescrever com NULL.
4. `propriedadesController.js:8-9` — sanitizar `page`/`limit` (inteiros positivos, limite máximo).
5. **Bug de campo**: `graosController.js:121` lê `areaplantada`, mas o padrão do projeto é `area_plantada` — a área nunca é gravada. Corrigir.
6. **Transações**: `avaliacoesController.js:78` e `:120` fazem `return res.status(...)` sem `ROLLBACK` — a conexão volta ao pool com transação aberta. Garantir `ROLLBACK` em todo caminho de saída antecipada; envolver o `ROLLBACK` do catch em try/catch (`propriedadesController.js:112-113`).
7. `producaoController.js:35` — validar UF (2 letras) e limitar o cache `Map` in-memory (ex.: LRU com máx. 500 entradas).
8. `graosController.js:251` — `ON CONFLICT DO NOTHING` sem alvo: especificar o constraint alvo para não ignorar culturas silenciosamente.
9. **Consolidar migrations**: remover `migrations/run.js` (legado, conflita com `src/config/migrations.js`) e apontar `npm run migrate` para o runner oficial; mover a criação da tabela `usuarios` de `authBootstrap.js` para uma migration `005_usuarios.sql`.
10. `src/models/graos.js` — `listarTodos`/`obterPorId` devem retornar `ibge_categoria`/`ibge_tabela` (a tela admin não vê esses campos hoje).
11. `src/models/indicadores.js:513-517` — corrigir gaps da `ESCALA_IGS` (ex.: `max: 0.20` seguido de `min: 0.21` deixa 0.205 ambíguo); usar faixas contínuas com comparação `< max`.

**Critério de aceite:** requisições com payloads inválidos retornam 400 com mensagem clara (nunca 500); `npm run verify` passa.

---

## M3 — Correção do fluxo de erro/autenticação no frontend

**Objetivo:** o usuário nunca vê tela branca, dados obsoletos disfarçados de atuais, nem fica preso com sessão expirada.

1. **Interceptor 401** — em `frontend/src/services/api.js`: ao receber 401 em qualquer chamada, limpar token (`setAuthToken(null)`), limpar usuário no contexto e redirecionar para `/login` com aviso "Sessão expirada".
2. **Cache não pode mascarar 401/403** — `services/api.js:29-44` devolve cache do localStorage para *qualquer* erro em GET. Restringir o fallback de cache a erros de rede/timeout (sem `error.response`); erros HTTP devem propagar.
3. **ErrorBoundary global** — criar `components/Common/ErrorBoundary.jsx` com tela amigável + botão "Recarregar", envolvendo as rotas em `App.jsx`.
4. **Padronizar `friendlyError`** — usar `utils/errorMessages.js` em TODOS os catch de página: `Propriedades.jsx:415,426`, `Usuarios.jsx:81`, `PropriedadeDetalhe.jsx`, `Graos.jsx`. Remover leituras mortas de `e.response?.data?.erro` (`Graos.jsx:64,97,110,124`, `errorMessages.js:17` — o interceptor já converte em `Error` simples).
5. **Não engolir erros** — `Propriedades.jsx:385` (`catch {}`) e `:341` (`.catch(() => {})`): notificar o usuário via `notify`.
6. **Retry decente** — padronizar componente de erro com botão "Tentar novamente" que refaz o fetch (substituir o `window.location.reload()` de `Resultado.jsx:87`).
7. **Graos.jsx via camada de serviços** — mover as chamadas cruas de `axiosInstance` (`Graos.jsx:61,88,91,106,120`) para `graosAPI` em `services/api.js`.
8. **Fix de hooks** — `hooks/useKeyboardShortcuts.js:27` recria listener a cada render (objeto literal nas deps em `MainLayout.jsx:21-26`): usar `useRef`/`useCallback`. Revisar os `eslint-disable react-hooks/exhaustive-deps` de `NovaAvaliacao.jsx` (o efeito de boot re-dispara em oscilação de rede por depender de `isOnline` — linhas 100-140).

**Critério de aceite:** com token expirado, qualquer ação leva ao login com aviso; derrubar o backend no meio do uso mostra erro claro com retry, não dados velhos sem aviso; nenhum `catch` vazio no `src/`.

---

## M4 — Fonte única de verdade da metodologia ICSR (coerência frontend ↔ backend)

**Objetivo:** pesos, faixas e classificações definidos em UM lugar.

1. **Expor a metodologia via API** — o backend já tem tudo em `src/models/indicadores.js` (pesos 0,30/0,35/0,20/0,15, `ESCALA_IGS`). Incluir pesos e escala de classificação na resposta de `GET /indicadores/dimensoes` (ou novo `GET /indicadores/metodologia`).
2. **Remover duplicações no cliente** — hoje hardcoded em `NovaAvaliacao.jsx:270-284`, `Dashboard.jsx:331`, `PropriedadeDetalhe.jsx:27-32`, `Resultado.jsx:27-32`. Criar `frontend/src/utils/metodologia.js` que consome a API (com cache) e centraliza `getClassificacao`, pesos e `DIM_INFO`.
3. **Centralizar mapas de cores** — criar `frontend/src/utils/coresICSR.js` com `COR_NOTA` (hoje 4 cópias: `IndicadorCard.jsx:10-19`, `Resultado.jsx:20-26`, `PropriedadeDetalhe.jsx:24-26`, `NovaAvaliacao.jsx:1003`) e `COR_CLASSIFICACAO` (3 cópias: `IGSBadge.jsx:3-18`, `IGSGauge.jsx:4-19`, `Metodologia.jsx:35-38`). Idealmente integrar ao `theme.js` (já existe `palette.dimensao`).
4. **Unificar cálculo de média ponderada** — `DimensaoStep.jsx:10-15` e `NovaAvaliacao.jsx:257-267` duplicam a conta; extrair para `utils/metodologia.js`.
5. **Utilitário de data** — criar `utils/formatarData.js` e substituir os 8 usos ad-hoc de `toLocaleDateString('pt-BR')`.
6. **Decidir sobre `calcular_igs` SQL** — a função existe (migration 004) mas nunca é chamada; ou usá-la como fonte de verdade, ou removê-la e documentar que o cálculo é em Node (`avaliacoesController.js:150-168`). Não manter duas implementações.

**Critério de aceite:** buscar por `0.30`/`0.35`/`Excelente`/hex de cores no `frontend/src/pages` não encontra valores de metodologia hardcoded; preview do wizard bate exatamente com o resultado salvo pelo backend.

---

## M5 — Consistência visual e componentes padronizados

**Objetivo:** todas as telas com os mesmos padrões de loading, erro, vazio, confirmação e identidade.

1. **Loading único** — padronizar Skeletons (padrão já usado em `Dashboard`, `Resultado`, `NovaAvaliacao`) também em `Historico.jsx:163`, `Propriedades.jsx:455`, `Graos.jsx:161`, `PropriedadeDetalhe.jsx:108` (substituir `CircularProgress`).
2. **`EmptyState` em todo lugar** — `Historico`, `Graos` e `Usuarios` têm markup próprio de lista vazia; usar `components/Common/EmptyState.jsx`.
3. **`ConfirmDialog` reutilizável** — substituir `window.confirm` em `Historico.jsx:78`, `NovaAvaliacao.jsx:347`, `Propriedades.jsx:420`, `Graos.jsx:117` por um Dialog MUI padrão (modelo já existe em `Usuarios.jsx`).
4. **Bloco "dados em cache"** — extrair componente único (hoje repetido em `Dashboard.jsx:121`, `Propriedades.jsx:441`, `Historico.jsx:101`, `Resultado.jsx:140`).
5. **Corrigir a fonte** — `theme.js:34` e `index.css:8` declaram "IBM Plex Sans", mas o app instala e importa **Inter** (`main.jsx:3-6`). Trocar a declaração para Inter (ou instalar IBM Plex — escolher um).
6. **Limpar resíduos do template Vite** — deletar `App.css` (morto), `src/assets/react.svg`, `src/assets/vite.svg`; trocar `public/favicon.svg` (logo roxo do Vite) pela marca SustentaCafé; reescrever `frontend/README.md`.
7. **Localidade configurável** — remover o hardcode `'Caparaó · Minas Gerais / ES'` de `Sidebar.jsx:78` (mover para config/env ou derivar do usuário).
8. **Dark mode (opcional, avaliar esforço)** — o tema é só light; se implementar, usar `useMediaQuery('(prefers-color-scheme: dark)')` + toggle persistido.

**Critério de aceite:** navegar por todas as páginas mostra os mesmos padrões de loading/vazio/erro/confirmação; nenhum arquivo morto do template Vite no repositório.

---

## M6 — Acessibilidade (WCAG AA)

**Objetivo:** app operável por teclado e leitor de tela — crítico por ser app de campo.

1. **Permitir zoom** — remover `maximum-scale=1.0` do viewport em `frontend/index.html:6` (falha WCAG 1.4.4).
2. **Critérios do indicador acessíveis** — `components/Evaluation/IndicadorCard.jsx:85-101`: os `<Box onClick>` de nota devem virar `role="radiogroup"`/`role="radio"` com `tabIndex`, navegação por setas e `aria-checked` (ou usar `ToggleButtonGroup` do MUI). É o núcleo do formulário e hoje é inacessível.
3. **`aria-label` em todos os IconButtons** — `Navbar.jsx:19-27` (menu), `MapPicker.jsx:222`, e os de `Propriedades`, `Historico`, `Usuarios`, `Graos`.
4. **Tooltips acessíveis** — glossário (`IndicadorCard.jsx:54-63`) e ajuda (`DimensaoStep.jsx:33-41`) usam `<Box component="span">` não focável: trocar por elemento focável (`IconButton`) e garantir que a informação também exista em texto/clique (tooltip não funciona em toque).
5. **Contraste** — `IndicadorCard.jsx:71` usa `COR_NOTA` puro (ex.: `#FFC107`) como cor de texto sobre fundo claro: usar as variantes escuras já documentadas nos comentários (≥4.5:1).
6. **Tutorial sem sequestrar o DOM** — `NovaAvaliacao.jsx:260-291` manipula `el.style.outline` via `querySelectorAll`; ao destacar um passo, mover o foco para o elemento e usar `aria-live` para anunciar.
7. **Adicionar `eslint-plugin-jsx-a11y`** ao `eslint.config.js` e corrigir o que apontar.

**Critério de aceite:** fluxo completo de Nova Avaliação executável só com teclado; `eslint` com jsx-a11y sem erros; Lighthouse Accessibility ≥ 90 nas páginas principais.

---

## M7 — PWA e offline coerentes

**Objetivo:** instalabilidade real e comportamento offline previsível.

1. **Ícones PNG do manifest** — `vite.config.js:26-38` declara um único SVG como 192/512/maskable. Gerar PNGs 192×192 e 512×512 + versão maskable com safe-zone (ferramenta: `@vite-pwa/assets-generator`).
2. **UI de atualização do SW** — trocar `autoUpdate` cego por `registerType: 'prompt'` + `useRegisterSW` com Snackbar "Nova versão disponível — Atualizar", para não recarregar no meio de um rascunho.
3. **Unificar camadas de cache** — hoje Workbox e `utils/requestCache.js` coexistem com TTLs conflitantes (30min vs 7/30 dias) e sem invalidação pós-mutação. Definir: Workbox para assets, `requestCache` só para dados de API, e **invalidar as chaves relevantes após POST/PUT/DELETE** (ex.: mutação em propriedades limpa cache de `/propriedades*`).
4. **Controle de cota do localStorage** — `requestCache.js:9-19` e `avaliacaoCache.js:37-39` falham em silêncio ao estourar cota (pode perder rascunho!). Detectar `QuotaExceededError`, limpar caches menos importantes primeiro e avisar o usuário se o rascunho não puder ser salvo.
5. **Leaflet 100% local** — `MapPicker.jsx:14-16` carrega ícones do unpkg CDN (quebra offline): importar do pacote `leaflet` local (`leaflet/dist/images/...`).
6. **Nominatim com respeito à política** — `MapPicker.jsx:90` e `useGeolocation.js:52`: adicionar debounce (≥1s), tratar falha graciosamente. Avaliar proxy via backend para incluir User-Agent adequado.
7. **Fallback offline** — página/estado offline dedicado quando não há cache disponível.

**Critério de aceite:** Lighthouse PWA instalável; com rede desligada, mapa e telas com cache funcionam e as demais mostram estado offline claro; atualização do app só ocorre com consentimento.

---

## M8 — Configuração, Docker e ambiente

**Objetivo:** deploy reprodutível e sem armadilhas.

1. **`.env.example` da raiz** — remover a duplicação de `FRONTEND_URL` (linhas 23-24, valores conflitantes http/https — a segunda vence e quebra o CORS em HTTPS). Documentar TODAS as variáveis: `VITE_API_URL`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `JWT_EXPIRES_IN`, `APP_PORT`.
2. **`backend/.env.example`** — alinhar ao modelo `_FILE` (Docker secrets) usado em produção (hoje instrui `DB_PASSWORD=sua_senha_aqui`).
3. **Dockerfile do backend** — adicionar `USER node`, e ampliar `.dockerignore` (`.git`, `migrations/run.js` se removido, docs).
4. **Healthcheck do frontend** no compose.
5. **Remover `JWT_REFRESH_SECRET_FILE`** do compose se M1 decidir não implementar refresh token (ou implementar).
6. **Frontend sem fallback localhost em produção** — `services/api.js:5`: em build de produção, exigir `VITE_API_URL` (falhar o build ou default `/api`, nunca `http://localhost:3001`).
7. **CORS** — revisar `server.js:41-50`: em produção, considerar rejeitar `!origin` ou documentar por que é aceito.

**Critério de aceite:** `docker compose up` do zero funciona seguindo apenas o `.env.example`; nenhum valor conflitante ou variável não documentada.

---

## M9 — Testes automatizados

**Objetivo:** sair de zero testes para uma base que protege a lógica crítica.

1. **Backend (vitest + supertest)**: testes de integração para auth (login, 401, permissões, admin-only), CRUD de propriedades, criação/conclusão de avaliação com cálculo de IGS (validar pesos e classificação contra `indicadores.js`), validações do M2 (payload inválido → 400). Usar Postgres via `docker compose` ou testcontainers.
2. **Frontend (vitest + @testing-library/react)**: unit para `utils/masks.js`, `utils/errorMessages.js`, `utils/requestCache.js`, `utils/avaliacaoCache.js`, `utils/metodologia.js` (do M4); componente para `IndicadorCard` (seleção de nota, acessibilidade por teclado do M6) e guardas de rota de `App.jsx`.
3. **Scripts**: `npm test` na raiz rodando ambos; incluir no `verify:strict`.
4. **CI (opcional)**: GitHub Actions rodando `verify:strict` + testes em PR.

**Critério de aceite:** `npm test` verde; cálculo de IGS coberto por casos com valores conhecidos (incluindo bordas das faixas de classificação corrigidas no M2.11).

---

## M10 — Polimento funcional e UX (após os anteriores)

**Objetivo:** melhorias de produto sobre a base já sólida.

1. **Comparação de avaliações** — conferir contrato de `avaliacoesAPI.comparar` (`api.js:89`, params `a`/`b`) com o controller e criar UI de comparação no Histórico (endpoint existe, tela não).
2. **Timeline da propriedade** — `GET /avaliacoes/timeline/:propriedadeId` existe; exibir gráfico de evolução do IGS em `PropriedadeDetalhe`.
3. **Exportação/relatório** — botão de impressão já tem CSS (`index.css:18-56`); considerar exportar PDF do Resultado.
4. **Feedback de sync offline** — indicador persistente de "N avaliações pendentes de sincronização" na Navbar.
5. **Paginação real no Histórico** — hoje usa `limit` fixo; usar `page`/`limit` do backend (após sanitização do M2.4).
6. **Coerência de permissões** — rotas `/api/graos` públicas e `/api/producao` só com `authRequired` são consumidas por telas autenticadas; alinhar exposição (provavelmente tudo atrás de auth, exceto `/api/health`).

**Critério de aceite:** funcionalidades novas seguem os padrões visuais do M5 e de acessibilidade do M6.

---

## Ordem e dependências

```
M1 (segurança) → M2 (validação) → M3 (erros frontend) → M4 (fonte única ICSR)
      └──────────────────────────────→ M8 (config/Docker) — pode ser paralelo a M3–M7
M4 → M5 (visual) → M6 (a11y) → M7 (PWA)
M2+M4 → M9 (testes) → M10 (UX/produto)
```

## Como pedir a execução de um módulo a outra IA

Prompt sugerido:

> "Execute o módulo **MX** do arquivo `PLANO_MELHORIAS.md` na raiz do projeto. Siga cada item na ordem, verifique os caminhos/linhas citados (podem ter mudado), rode `npm run verify` ao final e confirme o critério de aceite antes de commitar. Mensagens de commit em pt-BR seguindo Conventional Commits."
