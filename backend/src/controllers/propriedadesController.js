const pool = require('../config/database');

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
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
};

const criar = async (req, res) => {
  try {
    const { nome, municipio, estado, proprietario, area_total, area_cafe, latitude, longitude, telefone, email } = req.body;
    if (!nome || !municipio || !proprietario) {
      return res.status(400).json({ erro: 'Nome, município e proprietário são obrigatórios' });
    }
    const result = await pool.query(
      `INSERT INTO propriedades (nome, municipio, estado, proprietario, area_total, area_cafe, latitude, longitude, telefone, email)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *`,
      [nome, municipio, estado || 'ES', proprietario, area_total, area_cafe, latitude, longitude, telefone, email]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
};

const atualizar = async (req, res) => {
  try {
    const { id } = req.params;
    const { nome, municipio, estado, proprietario, area_total, area_cafe, latitude, longitude, telefone, email } = req.body;
    const result = await pool.query(
      `UPDATE propriedades SET nome=$1, municipio=$2, estado=$3, proprietario=$4,
       area_total=$5, area_cafe=$6, latitude=$7, longitude=$8, telefone=$9, email=$10
       WHERE id=$11 RETURNING *`,
      [nome, municipio, estado, proprietario, area_total, area_cafe, latitude, longitude, telefone, email, id]
    );
    if (result.rows.length === 0) return res.status(404).json({ erro: 'Propriedade não encontrada' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ erro: err.message });
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
