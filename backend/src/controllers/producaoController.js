const pool = require('../config/database');

const CACHE = new Map();
const TTL_MS = 12 * 60 * 60 * 1000; // 12 horas

const normalizar = (s) =>
  (s || '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim();

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
  const { municipio, estado, grao_id } = req.query;
  if (!municipio || !estado) {
    return res.status(400).json({ erro: 'municipio e estado são obrigatórios' });
  }

  // Resolve qual tabela e categoria IBGE usar.
  // Tabela 5457 (lavouras temporárias e permanentes), classificação 782.
  let ibgeTabela = '5457';
  let ibgeCategoria = '40139'; // padrão: café (em grão) total
  let culturaNome = 'Café (em grão) Total';

  if (grao_id) {
    try {
      const graoRes = await pool.query(
        'SELECT nome, ibge_categoria, ibge_tabela FROM graos WHERE id = $1',
        [grao_id],
      );
      const grao = graoRes.rows[0];
      if (!grao) return res.status(404).json({ erro: 'Grão não encontrado' });
      if (!grao.ibge_categoria) {
        return res.status(404).json({
          erro: `Dados IBGE não configurados para "${grao.nome}". Contacte o administrador.`,
        });
      }
      ibgeTabela = grao.ibge_tabela || '5457';
      ibgeCategoria = grao.ibge_categoria;
      culturaNome = grao.nome;
    } catch (e) {
      return res.status(500).json({ erro: 'Erro ao consultar grão: ' + e.message });
    }
  }

  const key = `${municipio.toLowerCase()}|${estado.toUpperCase()}|${ibgeCategoria}`;
  const cached = CACHE.get(key);
  if (cached && Date.now() - cached.ts < TTL_MS) return res.json(cached.data);

  try {
    // 1. Localiza o município dentro da UF informada e casa pelo nome normalizado.
    //    (O parâmetro ?nome= da API do IBGE deixou de filtrar — por isso buscamos
    //     todos os municípios da UF e comparamos os nomes sem acento.)
    const lista = await ibge(
      `https://servicodados.ibge.gov.br/api/v1/localidades/estados/${estado.toUpperCase()}/municipios`,
    );
    if (!Array.isArray(lista) || lista.length === 0) {
      return res.status(404).json({ erro: `UF "${estado}" inválida ou sem municípios no IBGE.` });
    }

    const alvo = normalizar(municipio);
    const match =
      lista.find((m) => normalizar(m.nome) === alvo) ||
      lista.find((m) => normalizar(m.nome).startsWith(alvo));
    if (!match) {
      return res.status(404).json({
        erro: `Município "${municipio}/${estado}" não localizado no IBGE. Verifique o nome e a UF.`,
      });
    }

    const munId = match.id;
    const ufObj = match.microrregiao?.mesorregiao?.UF;
    const ufId = ufObj?.id;
    const ufSigla = ufObj?.sigla || estado.toUpperCase();

    // 2. PAM — variáveis: 112=rendimento médio (kg/ha), 214=quantidade produzida (t), 216=área colhida (ha)
    const [dadosMun, dadosUF] = await Promise.all([
      ibge(
        `https://servicodados.ibge.gov.br/api/v3/agregados/${ibgeTabela}/periodos/last7/variaveis/112|214|216?localidades=N6[${munId}]&classificacao=782[${ibgeCategoria}]`,
      ),
      ibge(
        `https://servicodados.ibge.gov.br/api/v3/agregados/${ibgeTabela}/periodos/last7/variaveis/112?localidades=N3[${ufId}]&classificacao=782[${ibgeCategoria}]`,
      ),
    ]);

    const rendMun = parseSerie(dadosMun.find((v) => v.id === '112'));
    const qtdMun  = parseSerie(dadosMun.find((v) => v.id === '214'));
    const areaMun = parseSerie(dadosMun.find((v) => v.id === '216'));
    const rendUF  = parseSerie(dadosUF.find((v) => v.id === '112'));

    const data = {
      municipio: match.nome,
      municipio_id: munId,
      uf: ufSigla,
      uf_id: ufId,
      cultura: culturaNome,
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
