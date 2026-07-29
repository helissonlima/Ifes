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
  0: '#b71c1c', 0.25: '#e65100', 0.5: '#8B6000', 0.75: '#33691e', 1: '#1B5E20',
};

// Texto legível sobre o próprio fundo colorido da nota (badge selecionado)
export const COR_NOTA_BADGE_SELECIONADO = {
  0: '#fff', 0.25: '#3E1F00', 0.5: '#5D4000', 0.75: '#1B3A00', 1: '#1B5E20',
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
export const COR_CLASSIFICACAO_TEXTO_SOBRE_FUNDO = {
  'Muito Baixa': '#fff',
  'Baixa': '#fff',
  'Moderada': '#5D4000',
  'Boa': '#1B3A00',
  'Alta': '#fff',
};

// Texto colorido sobre fundo branco (títulos, números — não em badges)
export const COR_CLASSIFICACAO_TEXTO = {
  'Muito Baixa': '#c62828',
  'Baixa': '#e65100',
  'Moderada': '#8B6000',
  'Boa': '#33691e',
  'Alta': '#2E7D32',
};
