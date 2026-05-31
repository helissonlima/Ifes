import { useState, useEffect } from 'react';

const CACHE_KEY = 'sustenta_geo_localidade';
const CACHE_TTL_MS = 1000 * 60 * 60 * 24; // 24 horas

function getCached() {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const { value, ts } = JSON.parse(raw);
    if (Date.now() - ts > CACHE_TTL_MS) return null;
    return value;
  } catch {
    return null;
  }
}

function setCache(value) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ value, ts: Date.now() }));
  } catch {
    // ignora se localStorage indisponível
  }
}

/**
 * Retorna { localidade, carregando }
 * - localidade: string com "Cidade · Estado" ou null se indisponível
 * - carregando: true enquanto a geolocalização/geocodificação está em andamento
 */
export function useGeolocation() {
  const [localidade, setLocalidade] = useState(() => getCached());
  const [carregando, setCarregando] = useState(!getCached());

  useEffect(() => {
    const cached = getCached();
    if (cached) {
      setLocalidade(cached);
      setCarregando(false);
      return;
    }

    if (!navigator.geolocation) {
      setCarregando(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${coords.latitude}&lon=${coords.longitude}&format=json&accept-language=pt-BR`,
            { headers: { 'Accept-Language': 'pt-BR' } }
          );
          const data = await res.json();
          const cidade =
            data.address?.city ||
            data.address?.town ||
            data.address?.village ||
            data.address?.municipality ||
            '';
          const estado = data.address?.state || '';
          const texto = [cidade, estado].filter(Boolean).join(' · ');
          if (texto) {
            setLocalidade(texto);
            setCache(texto);
          }
        } catch {
          // sem internet ou erro de geocodificação — mantém null
        } finally {
          setCarregando(false);
        }
      },
      () => {
        // usuário negou permissão ou erro de geolocalização
        setCarregando(false);
      },
      { timeout: 8000, maximumAge: CACHE_TTL_MS }
    );
  }, []);

  return { localidade, carregando };
}
