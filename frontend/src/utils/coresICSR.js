// Cores compartilhadas do ICSR — fonte única (ver PLANO_MELHORIAS.md M4.3).
// Antes duplicadas em IndicadorCard/Resultado/PropriedadeDetalhe/NovaAvaliacao
// (COR_NOTA) e IGSBadge/IGSGauge/Metodologia (cores de classificação).
// Todas os valores abaixo já foram validados para contraste ≥4.5:1 nos
// componentes originais antes da centralização.

// Cor base por nota (0 / 0,25 / 0,5 / 0,75 / 1)
export const COR_NOTA = {
  0: '#f44336', 0.25: '#FF9800', 0.5: '#FFC107', 0.75: '#8BC34A', 1: '#4CAF50',
};

// Texto legível sobre fundo branco/claro
export const COR_NOTA_TEXTO = {
  0: '#b71c1c', 0.25: '#BF360C', 0.5: '#8B6000', 0.75: '#33691e', 1: '#1B5E20',
};

// Texto legível sobre o próprio fundo colorido da nota (badge selecionado)
export const COR_NOTA_BADGE_SELECIONADO = {
  0: '#3B0A08', 0.25: '#3E1F00', 0.5: '#5D4000', 0.75: '#1B3A00', 1: '#1B5E20',
};

// Cor base por classificação do IGS (Muito Baixa..Alta)
export const COR_CLASSIFICACAO = {
  'Muito Baixa': '#f44336',
  'Baixa': '#FF9800',
  'Moderada': '#FFC107',
  'Boa': '#8BC34A',
  'Alta': '#4CAF50',
};

// Texto sobre o próprio fundo colorido da classificação (badges/chips)
// Texto sobre o próprio fundo colorido da classificação (badges/chips).
// As cinco bandas usam texto ESCURO: branco sobre Muito Baixa dá 3,7:1 e
// sobre Alta dá 2,8:1 — abaixo do mínimo para um badge de 12px em negrito.
// A regra valia para Moderada e Boa, mas o mesmo defeito existia nas outras.
export const COR_CLASSIFICACAO_TEXTO_SOBRE_FUNDO = {
  'Muito Baixa': '#3B0A08',
  'Baixa': '#4E2600',
  'Moderada': '#5D4000',
  'Boa': '#1B3A00',
  'Alta': '#0B2D0F',
};

// Texto colorido sobre fundo branco (títulos, números — não em badges)
export const COR_CLASSIFICACAO_TEXTO = {
  'Muito Baixa': '#c62828',
  'Baixa': '#BF360C',
  'Moderada': '#8B6000',
  'Boa': '#33691e',
  'Alta': '#2E7D32',
};

// Status do diagnóstico (vem do backend em caixa alta, com a cor da faixa).
// A cor da faixa serve de fundo, não de texto: '#8BC34A' (BOM) sobre o próprio
// fundo tintado fica abaixo de 4.5:1. Aqui cada status ganha o par
// fundo/texto já validado e um rótulo em caixa normal.
export const STATUS_DIAGNOSTICO = {
  'CRÍTICO':   { rotulo: 'Crítico',   texto: '#B71C1C', fundo: '#FEECEB' },
  'ATENÇÃO':   { rotulo: 'Atenção',   texto: '#BF360C', fundo: '#FFF3E0' },
  'BOM':       { rotulo: 'Bom',       texto: '#33691E', fundo: '#F1F8E9' },
  'EXCELENTE': { rotulo: 'Excelente', texto: '#1B5E20', fundo: '#E8F5E9' },
};

export function estiloStatus(status) {
  return STATUS_DIAGNOSTICO[status] || { rotulo: status, texto: '#334155', fundo: '#F1F5F9' };
}

// Texto acessível por dimensão (≥4.5:1 sobre branco). As cores de dimensão
// são pensadas para preencher área — barra, ponto, fatia — e não alcançam
// contraste como texto: #2196F3 sobre branco fica em ~3:1.
export const COR_DIMENSAO_TEXTO = {
  ambiental: '#1B5E20',
  economica: '#0D47A1',
  social: '#BF360C',
  gestao_qualidade: '#6A1B9A',
};

export function corTextoDimensao(codigo) {
  return COR_DIMENSAO_TEXTO[codigo] || '#334155';
}
