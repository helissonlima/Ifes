const CACHE_PREFIX = 'sustenta_get_cache:';
const DEFAULT_TTL_MS = 1000 * 60 * 30;

function buildKey(url, params) {
  const query = params ? JSON.stringify(params) : '';
  return `${CACHE_PREFIX}${url}::${query}`;
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
    // Cache indisponivel ou cheio: nao interrompe a experiencia principal.
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