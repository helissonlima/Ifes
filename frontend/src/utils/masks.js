// ============================================================
// Utilitários de máscaras brasileiras — sem dependência externa
// ============================================================

/** Remove tudo que não for dígito */
export const apenasDigitos = (v = '') => v.replace(/\D/g, '');

// ── Telefone ─────────────────────────────────────────────────
/**
 * Máscara automática:
 *   10 dígitos → (XX) XXXX-XXXX  (fixo)
 *   11 dígitos → (XX) XXXXX-XXXX (celular)
 */
export function maskTelefone(valor = '') {
  const d = apenasDigitos(valor).slice(0, 11);
  if (d.length === 0) return '';
  if (d.length <= 2) return `(${d}`;
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) {
    // fixo: (XX) XXXX-XXXX
    return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  }
  // celular: (XX) XXXXX-XXXX
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

/** Retorna apenas os dígitos do telefone (para envio à API) */
export const rawTelefone = (v = '') => apenasDigitos(v);

// ── CPF ──────────────────────────────────────────────────────
/** XXX.XXX.XXX-XX */
export function maskCPF(valor = '') {
  const d = apenasDigitos(valor).slice(0, 11);
  if (d.length <= 3) return d;
  if (d.length <= 6) return `${d.slice(0, 3)}.${d.slice(3)}`;
  if (d.length <= 9) return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6)}`;
  return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}`;
}

export const rawCPF = (v = '') => apenasDigitos(v);

// ── CNPJ ─────────────────────────────────────────────────────
/** XX.XXX.XXX/XXXX-XX */
export function maskCNPJ(valor = '') {
  const d = apenasDigitos(valor).slice(0, 14);
  if (d.length <= 2) return d;
  if (d.length <= 5) return `${d.slice(0, 2)}.${d.slice(2)}`;
  if (d.length <= 8) return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5)}`;
  if (d.length <= 12) return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5, 8)}/${d.slice(8)}`;
  return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5, 8)}/${d.slice(8, 12)}-${d.slice(12)}`;
}

export const rawCNPJ = (v = '') => apenasDigitos(v);

// ── CEP ──────────────────────────────────────────────────────
/** XXXXX-XXX */
export function maskCEP(valor = '') {
  const d = apenasDigitos(valor).slice(0, 8);
  if (d.length <= 5) return d;
  return `${d.slice(0, 5)}-${d.slice(5)}`;
}

export const rawCEP = (v = '') => apenasDigitos(v);

// ── UF ───────────────────────────────────────────────────────
/** Força 2 letras maiúsculas */
export const maskUF = (v = '') => v.replace(/[^a-zA-Z]/g, '').toUpperCase().slice(0, 2);

// ── E-mail ───────────────────────────────────────────────────
const REGEX_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
export const isEmailValido = (v = '') => v === '' || REGEX_EMAIL.test(v.trim());
export const erroEmail = (v = '') =>
  v && !isEmailValido(v) ? 'E-mail inválido (ex.: nome@dominio.com.br)' : '';

// ── Área decimal ─────────────────────────────────────────────
/**
 * Permite apenas número decimal (vírgula ou ponto como separador).
 * Armazena internamente com ponto para compatibilidade com a API.
 */
export function maskDecimal(valor = '') {
  // Permite dígitos e até 1 separador (. ou ,)
  const cleaned = valor.replace(/[^0-9.,]/g, '').replace(',', '.');
  // Evita múltiplos pontos
  const parts = cleaned.split('.');
  if (parts.length > 2) return `${parts[0]}.${parts.slice(1).join('')}`;
  return cleaned;
}
