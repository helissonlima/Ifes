// Formatação de data no padrão pt-BR — fonte única (antes 8 chamadas
// ad-hoc a toLocaleDateString espalhadas pelas páginas).

export function formatarData(data, opcoes) {
  if (!data) return '—';
  return new Date(data).toLocaleDateString('pt-BR', opcoes);
}

// Formato curto usado em gráficos/timelines: "05 mar. 26"
export function formatarDataCurta(data) {
  return formatarData(data, { day: '2-digit', month: 'short', year: '2-digit' });
}
