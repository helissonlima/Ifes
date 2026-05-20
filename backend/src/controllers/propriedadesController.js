const pool = require('../config/database');

// Converte string vazia / undefined em null para colunas numéricas do Postgres
const numOrNull = (v) => (v === '' || v === undefined || v === null ? null : v);

const listar = async (req, res) => {
  try {
    const { search, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;
    let query = `
      SELECT p.*, COUNT(a.id) AS total_avaliacoes,
             MAX(a.data_avaliacao) AS ultima_avaliacao,
             (SELECT a2.igs FROM avaliacoes a2
              WHERE a2.propriedade_id = p.id AND a2.status = 'concluida'
              ORDER BY a2.data_avaliacao DESC LIMIT 1) AS ultimo_igs,
             (SELECT a2.classificacao FROM avaliacoes a2
              WHERE a2.propriedade_id = p.id AND a2.status = 'concluida'
              ORDER BY a2.data_avaliacao DESC LIMIT 1) AS ultima_classificacao
      FROM propriedades p
      LEFT JOIN avaliacoes a ON a.propriedade_id = p.id
    `;
    const params = [];
    if (search) {
      params.push(`%${search}%`);
      query += ` WHERE p.nome ILIKE $${params.length} OR p.municipio ILIKE $${params.length} OR p.proprietario ILIKE $${params.length}`;
    }
    query += ` GROUP BY p.id ORDER BY p.criado_em DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);

    const result = await pool.query(query, params);
    const countResult = await pool.query(
      `SELECT COUNT(*) FROM propriedades ${search ? 'WHERE nome ILIKE $1 OR municipio ILIKE $1 OR proprietario ILIKE $1' : ''}`,
      search ? [`%${search}%`] : []
    );

    res.json({
      data: result.rows,
      total: parseInt(countResult.rows[0].count),
      page: parseInt(page),
      limit: parseInt(limit),
    });
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
};

const buscarPorId = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM propriedades WHERE id = $1', [id]);
    if (result.rows.length === 0) return res.status(404).json({ erro: 'Propriedade não encontrada' });

    const propriedade = result.rows[0];

    const graosResult = await pool.query(
      `SELECT g.id, g.nome, g.codigo, g.ibge_categoria, g.ibge_tabela, pg.area_plantada
       FROM graos g
       JOIN propriedades_graos pg ON g.id = pg.grao_id
       WHERE pg.propriedade_id = $1
       ORDER BY g.nome`,
      [id],
    );
    propriedade.graos = graosResult.rows;

    res.json(propriedade);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
};

async function sincronizarGraos(client, propriedadeId, graos) {
  if (!Array.isArray(graos)) return;
  await client.query('DELETE FROM propriedades_graos WHERE propriedade_id = $1', [propriedadeId]);
  for (const g of graos) {
    if (!g.id) continue;
    await client.query(
      `INSERT INTO propriedades_graos (propriedade_id, grao_id, area_plantada)
       VALUES ($1, $2, $3)
       ON CONFLICT (propriedade_id, grao_id) DO UPDATE SET area_plantada = EXCLUDED.area_plantada`,
      [propriedadeId, g.id, g.area_plantada || null],
    );
  }
}

const criar = async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { nome, municipio, estado, proprietario, area_total, area_cafe, latitude, longitude, telefone, email, rua, numero, complemento, bairro, cep, graos } = req.body;
    if (!nome || !municipio || !proprietario) {
      await client.query('ROLLBACK');
      return res.status(400).json({ erro: 'Nome, município e proprietário são obrigatórios' });
    }
    const result = await client.query(
      `INSERT INTO propriedades (nome, municipio, estado, proprietario, area_total, area_cafe, latitude, longitude, telefone, email, rua, numero, complemento, bairro, cep)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15) RETURNING *`,
      [nome, municipio, estado || 'ES', proprietario, numOrNull(area_total), numOrNull(area_cafe), numOrNull(latitude), numOrNull(longitude), telefone, email, rua, numero, complemento, bairro, cep]
    );
    const propriedade = result.rows[0];
    await sincronizarGraos(client, propriedade.id, graos);
    await client.query('COMMIT');

    const graosResult = await pool.query(
      `SELECT g.id, g.nome, g.codigo, g.ibge_categoria, g.ibge_tabela, pg.area_plantada
       FROM graos g JOIN propriedades_graos pg ON g.id = pg.grao_id
       WHERE pg.propriedade_id = $1 ORDER BY g.nome`,
      [propriedade.id],
    );
    propriedade.graos = graosResult.rows;
    res.status(201).json(propriedade);
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ erro: err.message });
  } finally {
    client.release();
  }
};

const atualizar = async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { id } = req.params;
    const { nome, municipio, estado, proprietario, area_total, area_cafe, latitude, longitude, telefone, email, rua, numero, complemento, bairro, cep, graos } = req.body;
    const result = await client.query(
      `UPDATE propriedades SET nome=$1, municipio=$2, estado=$3, proprietario=$4,
       area_total=$5, area_cafe=$6, latitude=$7, longitude=$8, telefone=$9, email=$10,
       rua=$11, numero=$12, complemento=$13, bairro=$14, cep=$15
       WHERE id=$16 RETURNING *`,
      [nome, municipio, estado, proprietario, numOrNull(area_total), numOrNull(area_cafe), numOrNull(latitude), numOrNull(longitude), telefone, email, rua, numero, complemento, bairro, cep, id]
    );
    if (result.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ erro: 'Propriedade não encontrada' });
    }
    const propriedade = result.rows[0];
    await sincronizarGraos(client, id, graos);
    await client.query('COMMIT');

    const graosResult = await pool.query(
      `SELECT g.id, g.nome, g.codigo, g.ibge_categoria, g.ibge_tabela, pg.area_plantada
       FROM graos g JOIN propriedades_graos pg ON g.id = pg.grao_id
       WHERE pg.propriedade_id = $1 ORDER BY g.nome`,
      [id],
    );
    propriedade.graos = graosResult.rows;
    res.json(propriedade);
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ erro: err.message });
  } finally {
    client.release();
  }
};

const excluir = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM propriedades WHERE id = $1 RETURNING id', [id]);
    if (result.rows.length === 0) return res.status(404).json({ erro: 'Propriedade não encontrada' });
    res.json({ mensagem: 'Propriedade excluída com sucesso' });
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
};

module.exports = { listar, buscarPorId, criar, atualizar, excluir };
