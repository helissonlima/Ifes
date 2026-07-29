const CACHE_PREFIX = 'sustenta_get_cache:';
const DEFAULT_TTL_MS = 1000 * 60 * 30;

function buildKey(url, params) {
  const query = params ? JSON.stringify(params) : '';
  return `${CACHE_PREFIX}${url}::${query}`;
}

// Reconhece QuotaExceededError entre navegadores (o "code"/"name" variam).
export function isQuotaExceededError(err) {
  return err instanceof DOMException && (
    err.code === 22 ||
    err.code === 1014 ||
    err.name === 'QuotaExceededError' ||
    err.name === 'NS_ERROR_DOM_QUOTA_REACHED'
  );
}

export function saveCachedGet(url, params, data, ttlMs = DEFAULT_TTL_MS) {
  try {
    const payload = {
      data,
      expiresAt: Date.now() + ttlMs,
      cachedAt: new Date().toISOString(),
    };
    localStorage.setItem(buildKey(url, params), JSON.stringify(payload));
  } catch {
    // Cache de dados de API (nao critico): se nao couber, so deixa de cachear
    // essa resposta — nao ha dado do usuario em risco aqui.
  }
}

// Remove todo o cache de respostas GET — usado para liberar espaço no
// localStorage quando uma escrita mais crítica (ex.: rascunho de avaliação
// em utils/avaliacaoCache.js) esbarra na cota do navegador.
export function limparCacheGet() {
  try {
    Object.keys(localStorage)
      .filter((k) => k.startsWith(CACHE_PREFIX))
      .forEach((k) => localStorage.removeItem(k));
  } catch {
    // localStorage indisponível — nada a liberar.
  }
}

// Remove as entradas de cache cujo caminho começa com urlPrefix (ex.:
// "/propriedades") — chamado após POST/PUT/DELETE bem-sucedido pra não
// deixar uma leitura futura (que caia no fallback de erro de rede) mostrar
// dado de antes da mutação como se fosse atual.
export function invalidateCachedGet(urlPrefix) {
  if (!urlPrefix) return;
  try {
    const alvo = `${CACHE_PREFIX}${urlPrefix}`;
    Object.keys(localStorage)
      .filter((k) => k.startsWith(alvo))
      .forEach((k) => localStorage.removeItem(k));
  } catch {
    // localStorage indisponível — nada a invalidar.
  }
}

export function readCachedGet(url, params) {
  try {
    const raw = localStorage.getItem(buildKey(url, params));
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed?.expiresAt || Date.now() > parsed.expiresAt) {
      localStorage.removeItem(buildKey(url, params));
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function isSafeToCache(method) {
  return String(method || 'get').toLowerCase() === 'get';
}