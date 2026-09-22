// Formatação numérica pt-BR — separador decimal é vírgula.

const fmt = (casas) =>
  new Intl.NumberFormat('pt-BR', { minimumFractionDigits: casas, maximumFractionDigits: casas });

/** Número solto: 57.9 -> "57,9" */
export function formatarNumero(valor, casas = 1) {
  const n = Number(valor);
  if (!Number.isFinite(n)) return '—';
  return fmt(casas).format(n);
}

/** Fração 0..1 como percentual: 0.579 -> "57,9%" */
export function formatarPercentual(fracao, casas = 1) {
  const n = Number(fracao);
  if (!Number.isFinite(n)) return '—';
  return `${fmt(casas).format(n * 100)}%`;
}

/** Valor já em escala 0..100: 57.9 -> "57,9%" */
export function formatarPercentualDireto(valor, casas = 1) {
  const n = Number(valor);
  if (!Number.isFinite(n)) return '—';
  return `${fmt(casas).format(n)}%`;
}

/** Área em hectares: 4.8 -> "4,80 ha"; vazio/zero -> "—" */
export function formatarArea(valor) {
  const n = Number(valor);
  if (!Number.isFinite(n) || n <= 0) return '—';
  return `${fmt(2).format(n)} ha`;
}

/** Plural simples: (1,'avaliação','avaliações') -> "1 avaliação" */
export function pluralizar(quantidade, singular, plural) {
  const n = Number(quantidade) || 0;
  return `${n} ${n === 1 ? singular : plural}`;
}
