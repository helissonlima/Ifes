import { describe, it, expect, beforeEach } from 'vitest';
import {
  saveCachedGet, readCachedGet, limparCacheGet, invalidateCachedGet,
  isSafeToCache, isQuotaExceededError,
} from '../../src/utils/requestCache';

beforeEach(() => {
  localStorage.clear();
});

describe('saveCachedGet / readCachedGet', () => {
  it('salva e lê de volta os mesmos dados', () => {
    saveCachedGet('/propriedades', { limit: 50 }, { data: [1, 2, 3] });
    const lido = readCachedGet('/propriedades', { limit: 50 });
    expect(lido.data).toEqual({ data: [1, 2, 3] });
    expect(lido.cachedAt).toBeTruthy();
  });

  it('distingue entradas pela combinação de url + params', () => {
    saveCachedGet('/propriedades', { limit: 50 }, 'primeira-pagina');
    saveCachedGet('/propriedades', { limit: 100 }, 'segunda-pagina');
    expect(readCachedGet('/propriedades', { limit: 50 }).data).toBe('primeira-pagina');
    expect(readCachedGet('/propriedades', { limit: 100 }).data).toBe('segunda-pagina');
  });

  it('retorna null para chave nunca salva', () => {
    expect(readCachedGet('/nunca-salvo', {})).toBeNull();
  });

  it('expira e remove a entrada quando o TTL já passou', () => {
    saveCachedGet('/propriedades', {}, 'dado-antigo', -1000); // já nasce expirado
    expect(readCachedGet('/propriedades', {})).toBeNull();
    // a leitura que detectou a expiração também deve ter limpo a entrada
    expect(localStorage.getItem('sustenta_get_cache:/propriedades::{}')).toBeNull();
  });
});

describe('limparCacheGet', () => {
  it('remove todas as entradas de cache de GET, mas preserva outras chaves do localStorage', () => {
    saveCachedGet('/propriedades', {}, 'a');
    saveCachedGet('/avaliacoes', {}, 'b');
    localStorage.setItem('sustenta_token', 'nao-deve-ser-apagado');

    limparCacheGet();

    expect(readCachedGet('/propriedades', {})).toBeNull();
    expect(readCachedGet('/avaliacoes', {})).toBeNull();
    expect(localStorage.getItem('sustenta_token')).toBe('nao-deve-ser-apagado');
  });
});

describe('invalidateCachedGet', () => {
  it('remove só as entradas cujo caminho começa com o prefixo informado', () => {
    saveCachedGet('/propriedades', {}, 'lista');
    saveCachedGet('/propriedades/abc123', {}, 'detalhe');
    saveCachedGet('/avaliacoes', {}, 'nao-deve-ser-afetado');

    invalidateCachedGet('/propriedades');

    expect(readCachedGet('/propriedades', {})).toBeNull();
    expect(readCachedGet('/propriedades/abc123', {})).toBeNull();
    expect(readCachedGet('/avaliacoes', {}).data).toBe('nao-deve-ser-afetado');
  });

  it('não faz nada quando o prefixo é vazio/indefinido', () => {
    saveCachedGet('/propriedades', {}, 'lista');
    invalidateCachedGet('');
    invalidateCachedGet(undefined);
    expect(readCachedGet('/propriedades', {}).data).toBe('lista');
  });
});

describe('isSafeToCache', () => {
  it('só GET é considerado seguro para cache', () => {
    expect(isSafeToCache('get')).toBe(true);
    expect(isSafeToCache('GET')).toBe(true);
    expect(isSafeToCache(undefined)).toBe(true); // axios usa 'get' como default
    expect(isSafeToCache('post')).toBe(false);
    expect(isSafeToCache('PUT')).toBe(false);
    expect(isSafeToCache('delete')).toBe(false);
  });
});

describe('isQuotaExceededError', () => {
  it('reconhece QuotaExceededError pelo name padrão', () => {
    const err = new DOMException('estourou', 'QuotaExceededError');
    expect(isQuotaExceededError(err)).toBe(true);
  });

  it('não reconhece um erro comum como estouro de cota', () => {
    expect(isQuotaExceededError(new Error('erro qualquer'))).toBe(false);
    expect(isQuotaExceededError(null)).toBe(false);
  });
});
