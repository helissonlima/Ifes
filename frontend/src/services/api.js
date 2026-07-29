import axios from 'axios';
import { isSafeToCache, readCachedGet, saveCachedGet, invalidateCachedGet } from '../utils/requestCache';

// Primeiro segmento do caminho (ex.: "/propriedades/abc123" -> "/propriedades")
// — usado pra invalidar de uma vez todo o cache GET de um recurso quando uma
// mutação (POST/PUT/DELETE) nele é bem-sucedida.
function recursoBase(url) {
  if (!url) return '';
  const primeiroSegmento = url.split('?')[0].split('/').filter(Boolean)[0];
  return primeiroSegmento ? `/${primeiroSegmento}` : '';
}

export const TOKEN_KEY = 'sustenta_token';

// Sem VITE_API_URL definida: em build de produção cai pra "/api" (mesma
// origem, o caminho que o nginx.conf deste projeto já sabe proxiar) — nunca
// pra localhost:3001, que não existe fora da máquina de quem fez o build e
// deixaria todo o app fora do ar em silêncio. Em dev, localhost:3001 continua
// sendo o padrão de conveniência (backend local sem precisar de .env).
const API_BASE_URL = import.meta.env.VITE_API_URL
  || (import.meta.env.PROD ? '/api' : 'http://localhost:3001/api');

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 6000,
  headers: { 'Content-Type': 'application/json' },
});

export const axiosInstance = api;

api.interceptors.request.use((config) => {
  const nextConfig = { ...config };
  nextConfig.metadata = {
    startedAt: Date.now(),
    // `noCache` permite a uma chamada específica ficar fora do cache local
    // (ex.: o dump de backup, que é enorme e contém hashes de senha —
    // nada disso tem por que ficar no localStorage).
    cacheable: !config.noCache && isSafeToCache(config.method),
  };
  return nextConfig;
});

// Registrado pelo AppContext (fora deste módulo, que não tem acesso a hooks/estado
// React) para limpar o usuário da sessão quando o backend recusa o token.
let unauthorizedHandler = null;
export function onUnauthorized(handler) {
  unauthorizedHandler = handler;
}

api.interceptors.response.use(
  (response) => {
    const { config } = response;
    if (config?.metadata?.cacheable) {
      saveCachedGet(config.url, config.params, response.data);
    } else {
      // Mutação (POST/PUT/DELETE) bem-sucedida: o cache GET desse recurso
      // ficou desatualizado — remove pra não ressurgir como fallback de
      // erro de rede numa leitura futura.
      invalidateCachedGet(recursoBase(config?.url));
    }
    return response;
  },
  (error) => {
    const config = error.config || {};
    // Cache local só cobre falha de rede/timeout (sem resposta do servidor).
    // Um erro HTTP (401/403/404/500...) tem que propagar — nunca ser mascarado
    // por um dado potencialmente desatualizado/inválido do cache.
    const isNetworkError = !error.response;
    if (isNetworkError && config.metadata?.cacheable) {
      const cached = readCachedGet(config.url, config.params);
      if (cached) {
        return Promise.resolve({
          data: cached.data,
          status: 200,
          statusText: 'OK',
          headers: {},
          config,
          request: error.request,
          fromCache: true,
          cachedAt: cached.cachedAt,
        });
      }
    }

    if (error.response?.status === 401) {
      localStorage.removeItem(TOKEN_KEY);
      setAuthToken(null);
      unauthorizedHandler?.();
    }

    const msg = error.response?.data?.erro || error.message || 'Erro de conexão com o servidor';
    const rejeicao = new Error(msg);
    // Sinaliza "sem conexão" (em vez do servidor ter recusado a requisição)
    // pra quem chama poder reagir diferente — ex.: AppContext não desloga o
    // técnico em campo só porque /auth/me não pôde ser confirmado agora.
    rejeicao.isOffline = isNetworkError;
    return Promise.reject(rejeicao);
  }
);

export function setAuthToken(token) {
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common.Authorization;
  }
}

export const authAPI = {
  login: (email, senha) => api.post('/auth/login', { email, senha }),
  me: () => api.get('/auth/me'),
  listarUsuarios: () => api.get('/auth/usuarios'),
  criarUsuario: (data) => api.post('/auth/usuarios', data),
  atualizarUsuario: (id, data) => api.put(`/auth/usuarios/${id}`, data),
  atualizarPermissoes: (id, data) => api.put(`/auth/usuarios/${id}/permissoes`, data),
  redefinirSenha: (id, senha) => api.put(`/auth/usuarios/${id}/senha`, { senha }),
  excluirUsuario: (id) => api.delete(`/auth/usuarios/${id}`),
};

// Backup e restauração (somente admin) — timeout maior: dump/restauração
// completos do banco não cabem nos 6s padrão.
export const backupAPI = {
  exportar: () => api.get('/admin/backup', { timeout: 120000, noCache: true }),
  restaurar: (conteudo) => api.post('/admin/backup/restaurar', conteudo, { timeout: 300000 }),
};

// Propriedades
export const propriedadesAPI = {
  listar: (params) => api.get('/propriedades', { params }),
  buscar: (id) => api.get(`/propriedades/${id}`),
  criar: (data) => api.post('/propriedades', data),
  atualizar: (id, data) => api.put(`/propriedades/${id}`, data),
  excluir: (id) => api.delete(`/propriedades/${id}`),
};

// Avaliações
export const avaliacoesAPI = {
  listar: (params) => api.get('/avaliacoes', { params }),
  buscar: (id) => api.get(`/avaliacoes/${id}`),
  criar: (data) => api.post('/avaliacoes', data),
  salvarRespostas: (id, data) => api.put(`/avaliacoes/${id}/respostas`, data),
  excluir: (id) => api.delete(`/avaliacoes/${id}`),
  estatisticas: () => api.get('/avaliacoes/estatisticas'),
  diagnostico: (id) => api.get(`/avaliacoes/${id}/diagnostico`),
  timeline: (propriedadeId) => api.get(`/avaliacoes/timeline/${propriedadeId}`),
  comparar: (a, b) => api.get('/avaliacoes/comparar', { params: { a, b } }),
};

// Indicadores
export const indicadoresAPI = {
  listar: () => api.get('/indicadores'),
  dimensoes: () => api.get('/indicadores/dimensoes'),
  metodologia: () => api.get('/indicadores/metodologia'),
};

// Grãos
export const graosAPI = {
  listarAtivos: () => api.get('/graos'),
  listarTodosAdmin: () => api.get('/graos/admin/todos'),
  criar: (data) => api.post('/graos/admin/criar', data),
  atualizar: (id, data) => api.put(`/graos/admin/${id}/atualizar`, data),
  excluir: (id) => api.delete(`/graos/admin/${id}/deletar`),
  sincronizarIBGE: () => api.post('/graos/admin/sincronizar-ibge'),
};

// Produção regional (IBGE)
export const producaoAPI = {
  media: (municipio, estado, grao_id) =>
    api.get('/producao/media', { params: { municipio, estado, ...(grao_id ? { grao_id } : {}) } }),
};

export default api;
