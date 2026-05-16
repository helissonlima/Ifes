import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001/api',
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const msg = error.response?.data?.erro || error.message || 'Erro de conexão com o servidor';
    return Promise.reject(new Error(msg));
  }
);

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
};

// Indicadores
export const indicadoresAPI = {
  listar: () => api.get('/indicadores'),
  dimensoes: () => api.get('/indicadores/dimensoes'),
};

export default api;
