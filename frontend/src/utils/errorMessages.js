const MAP = {
  'Network Error': 'Sem conexão com o servidor. Verifique sua internet e tente novamente.',
  'Request failed with status code 401': 'Sessão expirada. Faça login novamente.',
  'Request failed with status code 403': 'Você não tem permissão para realizar esta ação.',
  'Request failed with status code 404': 'Recurso não encontrado. Pode ter sido removido.',
  'Request failed with status code 409': 'Conflito de dados. Atualize a página e tente novamente.',
  'Request failed with status code 500': 'Erro interno no servidor. Tente novamente em instantes.',
  'Request failed with status code 503': 'Serviço temporariamente indisponível. Aguarde alguns minutos.',
  'timeout': 'A operação demorou demais. Verifique sua conexão e tente novamente.',
};

/**
 * Converte erros técnicos em mensagens legíveis para o usuário.
 */
export function friendlyError(err) {
  if (!err) return 'Ocorreu um erro inesperado. Tente novamente.';
  // O interceptor axios (services/api.js) já converte qualquer erro em um
  // Error simples com a mensagem do backend — err.response nunca chega aqui.
  const msg = err?.message || String(err);
  for (const [key, friendly] of Object.entries(MAP)) {
    if (msg.includes(key)) return friendly;
  }
  if (msg.toLowerCase().includes('econnrefused') || msg.toLowerCase().includes('enotfound')) {
    return 'Não foi possível conectar ao servidor. Verifique sua rede.';
  }
  if (msg.toLowerCase().includes('propriedade')) return `Erro ao processar propriedade: ${msg}`;
  if (msg.toLowerCase().includes('avaliação') || msg.toLowerCase().includes('avaliacao')) return `Erro na avaliação: ${msg}`;
  // Fallback seguro — não expõe stack traces
  if (msg.length > 120) return 'Ocorreu um erro inesperado. Tente novamente ou contate o suporte.';
  return msg;
}
