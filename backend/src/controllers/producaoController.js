const CACHE = new Map();
const TTL_MS = 12 * 60 * 60 * 1000; // 12 horas

async function ibge(url) {
  const res = await fetch(url, {
    headers: { Accept: 'application/json' },
    signal: AbortSignal.timeout(12000),
  });
  if (!res.ok) throw new Error(`IBGE retornou HTTP ${res.status}`);
  return res.json();
}

function parseSerie(variavel) {
  const serie = variavel?.resultados?.[0]?.series?.[0]?.serie;
  if (!serie) return [];
  return Object.entries(serie)
    .map(([ano, val]) => ({
      ano: parseInt(ano, 10),
      valor: val === '...' || val === '-' || val === null ? null : parseFloat(val),
    }))
    .filter((s) => s.valor !== null)
    .sort((a, b) => a.ano - b.ano);
}

async function getMediaProducao(req, res) {
  const { municipio, estado } = req.query;
  if (!municipio || !estado) {
    return res.status(400).json({ erro: 'municipio e estado são obrigatórios' });
  }

  const key = `${municipio.toLowerCase()}|${estado.toUpperCase()}`;
  const cached = CACHE.get(key);
  if (cached && Date.now() - cached.ts < TTL_MS) return res.json(cached.data);

  try {
    // 1. Localiza o município pelo nome + UF
    const lista = await ibge(
      `https://servicodados.ibge.gov.br/api/v1/localidades/municipios?nome=${encodeURIComponent(municipio)}`,
    );
    const match = lista.find(
      (m) => m.microrregiao?.mesorregiao?.UF?.sigla?.toUpperCase() === estado.toUpperCase(),
    );
    if (!match) {
      return res.status(404).json({
        erro: `Município "${municipio}/${estado}" não localizado no IBGE. Verifique o nome e a UF.`,
      });
    }

    const munId = match.id;
    const ufId = match.microrregiao?.mesorregiao?.UF?.id;
    const ufSigla = match.microrregiao?.mesorregiao?.UF?.sigla;

    // 2. PAM tabela 1612: lavouras permanentes — café (em grão) total (código 2693)
    //    variáveis: 112=rendimento médio (kg/ha), 214=quantidade produzida (t), 215=área colhida (ha)
    //    "last7" retorna os 7 períodos mais recentes disponíveis no IBGE,
    //    independente do ano calendário — sempre pega o dado mais atual publicado.
    const [dadosMun, dadosUF] = await Promise.all([
      ibge(
        `https://servicodados.ibge.gov.br/api/v3/agregados/1612/periodos/last7/variaveis/112|214|215?localidades=N6[${munId}]&classificacao=782[2693]`,
      ),
      ibge(
        `https://servicodados.ibge.gov.br/api/v3/agregados/1612/periodos/last7/variaveis/112?localidades=N3[${ufId}]&classificacao=782[2693]`,
      ),
    ]);

    const rendMun = parseSerie(dadosMun.find((v) => v.id === '112'));
    const qtdMun = parseSerie(dadosMun.find((v) => v.id === '214'));
    const areaMun = parseSerie(dadosMun.find((v) => v.id === '215'));
    const rendUF = parseSerie(dadosUF.find((v) => v.id === '112'));

    const data = {
      municipio: match.nome,
      municipio_id: munId,
      uf: ufSigla,
      uf_id: ufId,
      cultura: 'Café (em grão) Total',
      rendimento_municipio: rendMun,
      rendimento_uf: rendUF,
      producao_municipio: qtdMun,
      area_colhida_municipio: areaMun,
      rendimento_atual: rendMun.at(-1) ?? null,
      rendimento_uf_atual: rendUF.at(-1) ?? null,
      fonte: 'IBGE — Produção Agrícola Municipal (PAM)',
    };

    CACHE.set(key, { data, ts: Date.now() });
    return res.json(data);
  } catch (err) {
    return res.status(502).json({ erro: 'Falha ao consultar IBGE', detalhes: err.message });
  }
}

module.exports = { getMediaProducao };
