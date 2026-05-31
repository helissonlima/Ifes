import axios from 'axios';
import { isSafeToCache, readCachedGet, saveCachedGet } from '../utils/requestCache';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001/api',
  timeout: 6000,
  headers: { 'Content-Type': 'application/json' },
});

export const axiosInstance = api;

api.interceptors.request.use((config) => {
  const nextConfig = { ...config };
  nextConfig.metadata = {
    startedAt: Date.now(),
    cacheable: isSafeToCache(config.method),
  };
  return nextConfig;
});

api.interceptors.response.use(
  (response) => {
    const { config } = response;
    if (config?.metadata?.cacheable) {
      saveCachedGet(config.url, config.params, response.data);
    }
    return response;
  },
  (error) => {
    const config = error.config || {};
    const cached = config.metadata?.cacheable ? readCachedGet(config.url, config.params) : null;

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

    const msg = error.response?.data?.erro || error.message || 'Erro de conexão com o servidor';
    return Promise.reject(new Error(msg));
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
};

// Grãos
export const graosAPI = {
  listarAtivos: () => api.get('/graos'),
};

// Produção regional (IBGE)
export const producaoAPI = {
  media: (municipio, estado, grao_id) =>
    api.get('/producao/media', { params: { municipio, estado, ...(grao_id ? { grao_id } : {}) } }),
};

export default api;
