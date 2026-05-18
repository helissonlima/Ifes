const pool = require('../config/database');
const {
  DIMENSOES,
  calcularIGS,
  calcularIndiceDimensao,
  avaliarStatusIndicador,
  localizarIndicador,
  calcularImpactoIGS,
} = require('../models/indicadores');

const listar = async (req, res) => {
  try {
    const { propriedade_id, status, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;
    const params = [];
    let where = [];

    if (propriedade_id) { params.push(propriedade_id); where.push(`a.propriedade_id = $${params.length}`); }
    if (status) { params.push(status); where.push(`a.status = $${params.length}`); }

    const whereClause = where.length ? 'WHERE ' + where.join(' AND ') : '';

    const query = `
      SELECT a.*, p.nome AS propriedade_nome, p.municipio, p.proprietario
      FROM avaliacoes a
      JOIN propriedades p ON p.id = a.propriedade_id
      ${whereClause}
      ORDER BY a.data_avaliacao DESC
      LIMIT $${params.length + 1} OFFSET $${params.length + 2}
    `;
    params.push(limit, offset);

    const result = await pool.query(query, params);
    const countParams = where.length ? params.slice(0, params.length - 2) : [];
    const countResult = await pool.query(
      `SELECT COUNT(*) FROM avaliacoes a ${whereClause}`,
      countParams
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
    const avalResult = await pool.query(
      `SELECT a.*, p.nome AS propriedade_nome, p.municipio, p.proprietario, p.area_total, p.area_cafe
       FROM avaliacoes a JOIN propriedades p ON p.id = a.propriedade_id WHERE a.id = $1`,
      [id]
    );
    if (avalResult.rows.length === 0) return res.status(404).json({ erro: 'Avaliação não encontrada' });

    const respostasResult = await pool.query(
      `SELECT * FROM respostas_indicadores WHERE avaliacao_id = $1 ORDER BY dimensao, indicador_codigo`,
      [id]
    );

    res.json({ ...avalResult.rows[0], respostas: respostasResult.rows });
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
};

const criar = async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const { propriedade_id, tecnico_responsavel, data_avaliacao, observacoes, respostas } = req.body;
    if (!propriedade_id) return res.status(400).json({ erro: 'propriedade_id é obrigatório' });

    // Criar avaliação inicial como rascunho
    const avalResult = await client.query(
      `INSERT INTO avaliacoes (propriedade_id, tecnico_responsavel, data_avaliacao, observacoes, status)
       VALUES ($1, $2, $3, $4, 'rascunho') RETURNING *`,
      [propriedade_id, tecnico_responsavel, data_avaliacao || new Date(), observacoes]
    );
    const avaliacao = avalResult.rows[0];

    // Inserir respostas se fornecidas
    if (respostas && respostas.length > 0) {
      for (const r of respostas) {
        await client.query(
          `INSERT INTO respostas_indicadores (avaliacao_id, dimensao, indicador_codigo, indicador_nome, nota, criterio_selecionado, observacao)
           VALUES ($1,$2,$3,$4,$5,$6,$7)`,
          [avaliacao.id, r.dimensao, r.indicador_codigo, r.indicador_nome, r.nota, r.criterio_selecionado, r.observacao]
        );
      }
      // Calcular e persistir índices
      await calcularEPersistirIndices(client, avaliacao.id, respostas);
    }

    await client.query('COMMIT');
    res.status(201).json(avaliacao);
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ erro: err.message });
  } finally {
    client.release();
  }
};

const salvarRespostas = async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { id } = req.params;
    const { respostas, concluir = false } = req.body;

    // Verificar que a avaliação existe
    const avalCheck = await client.query('SELECT id FROM avaliacoes WHERE id = $1', [id]);
    if (avalCheck.rows.length === 0) return res.status(404).json({ erro: 'Avaliação não encontrada' });

    // Limpar respostas existentes e reinserir
    await client.query('DELETE FROM respostas_indicadores WHERE avaliacao_id = $1', [id]);
    for (const r of respostas) {
      await client.query(
        `INSERT INTO respostas_indicadores (avaliacao_id, dimensao, indicador_codigo, indicador_nome, nota, criterio_selecionado, observacao)
         VALUES ($1,$2,$3,$4,$5,$6,$7)`,
        [id, r.dimensao, r.indicador_codigo, r.indicador_nome, r.nota, r.criterio_selecionado, r.observacao]
      );
    }

    await calcularEPersistirIndices(client, id, respostas);

    if (concluir) {
      await client.query(`UPDATE avaliacoes SET status = 'concluida' WHERE id = $1`, [id]);
    }

    await client.query('COMMIT');

    const result = await pool.query('SELECT * FROM avaliacoes WHERE id = $1', [id]);
    res.json(result.rows[0]);
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ erro: err.message });
  } finally {
    client.release();
  }
};

async function calcularEPersistirIndices(client, avaliacaoId, respostas) {
  const porDimensao = {};
  for (const r of respostas) {
    if (!porDimensao[r.dimensao]) porDimensao[r.dimensao] = [];
    porDimensao[r.dimensao].push(r);
  }

  const ie = calcularIndiceDimensao(porDimensao['economica'] || []);
  const ia = calcularIndiceDimensao(porDimensao['ambiental'] || []);
  const is_ = calcularIndiceDimensao(porDimensao['social'] || []);
  const igq = calcularIndiceDimensao(porDimensao['gestao_qualidade'] || []);
  const { igs, classificacao } = calcularIGS(ie, ia, is_, igq);

  await client.query(
    `UPDATE avaliacoes SET indice_economico=$1, indice_ambiental=$2, indice_social=$3,
     indice_gestao_qualidade=$4, igs=$5, classificacao=$6 WHERE id=$7`,
    [ie, ia, is_, igq, igs, classificacao, avaliacaoId]
  );
}

const excluir = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM avaliacoes WHERE id=$1 RETURNING id', [id]);
    if (result.rows.length === 0) return res.status(404).json({ erro: 'Avaliação não encontrada' });
    res.json({ mensagem: 'Avaliação excluída com sucesso' });
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
};

const estatisticas = async (req, res) => {
  try {
    const stats = await pool.query(`
      SELECT
        COUNT(DISTINCT p.id) AS total_propriedades,
        COUNT(a.id) AS total_avaliacoes,
        COUNT(a.id) FILTER (WHERE a.status = 'concluida') AS avaliacoes_concluidas,
        ROUND(AVG(a.igs) FILTER (WHERE a.status = 'concluida'), 4) AS media_igs,
        ROUND(AVG(a.indice_economico) FILTER (WHERE a.status = 'concluida'), 4) AS media_economica,
        ROUND(AVG(a.indice_ambiental) FILTER (WHERE a.status = 'concluida'), 4) AS media_ambiental,
        ROUND(AVG(a.indice_social) FILTER (WHERE a.status = 'concluida'), 4) AS media_social,
        ROUND(AVG(a.indice_gestao_qualidade) FILTER (WHERE a.status = 'concluida'), 4) AS media_gestao
      FROM propriedades p
      LEFT JOIN avaliacoes a ON a.propriedade_id = p.id
    `);

    const distribuicao = await pool.query(`
      SELECT classificacao, COUNT(*) AS quantidade
      FROM avaliacoes WHERE status = 'concluida' AND classificacao IS NOT NULL
      GROUP BY classificacao ORDER BY quantidade DESC
    `);

    res.json({
      ...stats.rows[0],
      distribuicao_classificacao: distribuicao.rows,
    });
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
};

// Diagnóstico automático: status, recomendações e plano de ação top-5 por impacto no IGS
const diagnostico = async (req, res) => {
  try {
    const { id } = req.params;
    const avalResult = await pool.query(
      `SELECT a.*, p.nome AS propriedade_nome, p.municipio, p.proprietario
       FROM avaliacoes a JOIN propriedades p ON p.id = a.propriedade_id WHERE a.id = $1`,
      [id]
    );
    if (avalResult.rows.length === 0) return res.status(404).json({ erro: 'Avaliação não encontrada' });
    const avaliacao = avalResult.rows[0];

    const respostas = (await pool.query(
      `SELECT * FROM respostas_indicadores WHERE avaliacao_id = $1 ORDER BY dimensao, indicador_codigo`,
      [id]
    )).rows;

    const itens = respostas.map((r) => {
      const def = localizarIndicador(r.indicador_codigo) || {};
      const status = avaliarStatusIndicador(r.nota);
      const impacto = calcularImpactoIGS(r.indicador_codigo, r.nota);
      return {
        dimensao: r.dimensao,
        dimensao_nome: def.dimensao_nome || r.dimensao,
        indicador_codigo: r.indicador_codigo,
        indicador_nome: r.indicador_nome,
        nota: parseFloat(r.nota),
        criterio_selecionado: r.criterio_selecionado,
        observacao: r.observacao,
        evidencia_esperada: def.evidencia_esperada || '',
        status: status.status,
        status_cor: status.cor,
        prazo_sugerido: status.prazo,
        recomendacao: status.recomendacao,
        impacto_igs: impacto,
      };
    });

    const porDimensao = {};
    for (const it of itens) {
      if (!porDimensao[it.dimensao]) porDimensao[it.dimensao] = { dimensao: it.dimensao, nome: it.dimensao_nome, itens: [] };
      porDimensao[it.dimensao].itens.push(it);
    }

    // Plano top-5: maior impacto potencial no IGS
    const topAcoes = [...itens].sort((a, b) => b.impacto_igs - a.impacto_igs).slice(0, 5);

    // Resumo de dimensões com status
    const resumoDimensoes = Object.values(DIMENSOES).map((d) => {
      const valor = parseFloat(avaliacao[`indice_${d.codigo}`] || 0);
      const status = avaliarStatusIndicador(valor);
      return {
        codigo: d.codigo,
        nome: d.nome,
        peso: d.peso,
        cor: d.cor,
        indice: valor,
        contribuicao: parseFloat((valor * d.peso).toFixed(4)),
        status: status.status,
        status_cor: status.cor,
      };
    });

    res.json({
      avaliacao_id: id,
      propriedade_nome: avaliacao.propriedade_nome,
      municipio: avaliacao.municipio,
      igs: parseFloat(avaliacao.igs || 0),
      classificacao: avaliacao.classificacao,
      resumo_dimensoes: resumoDimensoes,
      diagnostico_por_dimensao: Object.values(porDimensao),
      plano_acao_top5: topAcoes,
    });
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
};

// Evolução temporal de uma propriedade
const timelinePropriedade = async (req, res) => {
  try {
    const { propriedade_id } = req.params;
    const result = await pool.query(
      `SELECT id, data_avaliacao, igs, classificacao,
              indice_ambiental, indice_economico, indice_social, indice_gestao_qualidade,
              tecnico_responsavel, status
       FROM avaliacoes
       WHERE propriedade_id = $1 AND status = 'concluida'
       ORDER BY data_avaliacao ASC`,
      [propriedade_id]
    );
    res.json({ propriedade_id, total: result.rows.length, avaliacoes: result.rows });
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
};

module.exports = {
  listar, buscarPorId, criar, salvarRespostas, excluir, estatisticas,
  diagnostico, timelinePropriedade,
};
