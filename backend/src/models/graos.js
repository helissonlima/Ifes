const db = require('../config/database');

class Graos {
  static async listarAtivos() {
    const query = `
      SELECT id, nome, codigo, descricao, ativo, ibge_categoria, ibge_tabela, criado_em
      FROM graos
      WHERE ativo = TRUE
      ORDER BY nome
    `;
    const result = await db.query(query);
    return result.rows;
  }

  static async listarTodos() {
    const query = `
      SELECT id, nome, codigo, descricao, ativo, criado_em, atualizado_em
      FROM graos
      ORDER BY nome
    `;
    const result = await db.query(query);
    return result.rows;
  }

  static async obterPorId(id) {
    const query = `
      SELECT id, nome, codigo, descricao, ativo, criado_em, atualizado_em
      FROM graos
      WHERE id = $1
    `;
    const result = await db.query(query, [id]);
    return result.rows[0];
  }

  static async criar(nome, codigo, descricao = null) {
    const query = `
      INSERT INTO graos (nome, codigo, descricao, ativo)
      VALUES ($1, $2, $3, TRUE)
      RETURNING id, nome, codigo, descricao, ativo, criado_em
    `;
    const result = await db.query(query, [nome, codigo, descricao]);
    return result.rows[0];
  }

  static async atualizar(id, { nome, codigo, descricao, ativo }) {
    const query = `
      UPDATE graos
      SET nome = COALESCE($2, nome),
          codigo = COALESCE($3, codigo),
          descricao = COALESCE($4, descricao),
          ativo = COALESCE($5, ativo)
      WHERE id = $1
      RETURNING id, nome, codigo, descricao, ativo, criado_em, atualizado_em
    `;
    const result = await db.query(query, [id, nome, codigo, descricao, ativo]);
    return result.rows[0];
  }

  static async deletar(id) {
    const query = `
      DELETE FROM graos
      WHERE id = $1
      RETURNING id
    `;
    const result = await db.query(query, [id]);
    return result.rows[0];
  }

  static async listarPorPropriedade(propriedadeId) {
    const query = `
      SELECT g.id, g.nome, g.codigo, pg.area_plantada
      FROM graos g
      JOIN propriedades_graos pg ON g.id = pg.grao_id
      WHERE pg.propriedade_id = $1
      ORDER BY g.nome
    `;
    const result = await db.query(query, [propriedadeId]);
    return result.rows;
  }
}

module.exports = Graos;
