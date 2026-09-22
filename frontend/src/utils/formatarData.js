// Formatação de data no padrão pt-BR — fonte única (antes 8 chamadas
// ad-hoc a toLocaleDateString espalhadas pelas páginas).

// Data de avaliação é um dia civil, não um instante. A API entrega
// 'YYYY-MM-DD'; `new Date('2026-07-01')` seria interpretado como meia-noite
// UTC e exibido como 30/06 em UTC-3, então o dia civil é montado no fuso
// local. Instantes completos (ISO com hora) seguem o caminho normal.
function paraDataLocal(data) {
  if (data instanceof Date) return data;
  if (typeof data === 'string') {
    const soData = /^(\d{4})-(\d{2})-(\d{2})$/.exec(data);
    if (soData) {
      return new Date(Number(soData[1]), Number(soData[2]) - 1, Number(soData[3]));
    }
  }
  return new Date(data);
}

export function formatarData(data, opcoes) {
  if (!data) return '—';
  const d = paraDataLocal(data);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('pt-BR', opcoes);
}

// Formato curto usado em gráficos/timelines: "05 mar. 26"
export function formatarDataCurta(data) {
  return formatarData(data, { day: '2-digit', month: 'short', year: '2-digit' });
}

// Dia de hoje como 'YYYY-MM-DD' no fuso local, para <input type="date">.
// `toISOString()` usaria UTC e, à noite no Brasil, já devolveria amanhã.
export function hojeISO() {
  const agora = new Date();
  const mes = String(agora.getMonth() + 1).padStart(2, '0');
  const dia = String(agora.getDate()).padStart(2, '0');
  return `${agora.getFullYear()}-${mes}-${dia}`;
}
