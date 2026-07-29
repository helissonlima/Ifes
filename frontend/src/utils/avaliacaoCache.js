/**
 * Serviço de cache offline para avaliações em andamento.
 *
 * Cada técnico tem seu próprio rascunho identificado por userId.
 * Isso evita que dois usuários no mesmo dispositivo sobrescrevam
 * o rascunho um do outro.
 *
 * Estrutura salva:
 * {
 *   userId,
 *   timestamp,          // ISO string — quando foi salvo pela última vez
 *   step,               // etapa atual do wizard
 *   avaliacaoId,        // null quando ainda não foi enviado ao servidor
 *   info: { propriedade, tecnico, data, observacoes },
 *   respostas,          // { [codigo]: nota }
 *   respostasDetalhes,  // { [codigo]: { dimensao, nome, criterio } }
 *   observacoes,        // { [codigo]: texto }
 *   syncPendente,       // true quando há dados que ainda não foram ao servidor
 * }
 */

import { isQuotaExceededError, limparCacheGet } from './requestCache';

const PREFIXO = 'sustenta_rascunho_';

/** Chave no localStorage para o usuário informado */
const chave = (userId) => `${PREFIXO}${userId}`;

/**
 * Salva o estado atual da avaliação. Retorna true se salvou, false se não
 * conseguiu — o rascunho de campo é o dado mais importante do app (pode
 * representar uma visita inteira), então quem chama deve avisar o usuário
 * quando isso retornar false, em vez de assumir sucesso silenciosamente.
 */
export function salvarRascunhoLocal(userId, estado) {
  if (!userId) return false;
  const payload = {
    ...estado,
    userId,
    timestamp: new Date().toISOString(),
  };
  const serializado = JSON.stringify(payload);

  try {
    localStorage.setItem(chave(userId), serializado);
    return true;
  } catch (err) {
    if (!isQuotaExceededError(err)) return false;
    // Cota estourada: libera o cache de GET (dados de API, reconstituíveis)
    // e tenta salvar o rascunho de novo antes de desistir.
    limparCacheGet();
    try {
      localStorage.setItem(chave(userId), serializado);
      return true;
    } catch {
      return false;
    }
  }
}

/** Carrega o rascunho local do usuário, ou null se não existir */
export function carregarRascunhoLocal(userId) {
  if (!userId) return null;
  try {
    const raw = localStorage.getItem(chave(userId));
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

/** Remove o rascunho local (após concluir ou descartar) */
export function limparRascunhoLocal(userId) {
  if (!userId) return;
  localStorage.removeItem(chave(userId));
}

/** Atualiza apenas o status de sincronização pendente do rascunho local */
export function atualizarSyncPendenteLocal(userId, syncPendente) {
  if (!userId) return false;
  const draft = carregarRascunhoLocal(userId);
  if (!draft) return false;
  return salvarRascunhoLocal(userId, {
    ...draft,
    syncPendente: Boolean(syncPendente),
  });
}

/** Verifica se existe rascunho com dados preenchidos para o usuário */
export function temRascunhoLocal(userId) {
  if (!userId) return false;
  const draft = carregarRascunhoLocal(userId);
  if (!draft) return false;
  // Considera relevante se houver pelo menos 1 indicador respondido
  // ou a propriedade já estiver selecionada
  return (
    Object.keys(draft.respostas || {}).length > 0 ||
    draft.info?.propriedade != null
  );
}

/** Formata o timestamp do rascunho para exibição */
export function formatarDataRascunho(timestamp) {
  if (!timestamp) return '';
  try {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(timestamp));
  } catch {
    return timestamp;
  }
}
