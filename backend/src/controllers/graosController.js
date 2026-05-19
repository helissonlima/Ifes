const db = require('../config/database');
const Graos = require('../models/graos');

class GraosController {
  // Listar grãos ativos (para uso geral)
  static async listar(req, res) {
    try {
      const graos = await Graos.listarAtivos();
      res.json(graos);
    } catch (error) {
      console.error('Erro ao listar grãos:', error);
      res.status(500).json({ erro: 'Erro ao listar grãos' });
    }
  }

  // Listar todos os grãos (admin)
  static async listarTodos(req, res) {
    try {
      const graos = await Graos.listarTodos();
      res.json(graos);
    } catch (error) {
      console.error('Erro ao listar grãos:', error);
      res.status(500).json({ erro: 'Erro ao listar grãos' });
    }
  }

  // Obter grao por ID
  static async obter(req, res) {
    try {
      const { id } = req.params;
      const grao = await Graos.obterPorId(id);
      if (!grao) {
        return res.status(404).json({ erro: 'Grão não encontrado' });
      }
      res.json(grao);
    } catch (error) {
      console.error('Erro ao obter grão:', error);
      res.status(500).json({ erro: 'Erro ao obter grão' });
    }
  }

  // Criar novo grão (admin)
  static async criar(req, res) {
    try {
      const { nome, codigo, descricao } = req.body;
      
      if (!nome || !codigo) {
        return res.status(400).json({ erro: 'Nome e código são obrigatórios' });
      }

      const grao = await Graos.criar(nome, codigo, descricao);
      res.status(201).json(grao);
    } catch (error) {
      if (error.code === '23505') {
        return res.status(400).json({ erro: 'Grão com este nome ou código já existe' });
      }
      console.error('Erro ao criar grão:', error);
      res.status(500).json({ erro: 'Erro ao criar grão' });
    }
  }

  // Atualizar grão (admin)
  static async atualizar(req, res) {
    try {
      const { id } = req.params;
      const { nome, codigo, descricao, ativo } = req.body;

      const grao = await Graos.obterPorId(id);
      if (!grao) {
        return res.status(404).json({ erro: 'Grão não encontrado' });
      }

      const atualizado = await Graos.atualizar(id, { nome, codigo, descricao, ativo });
      res.json(atualizado);
    } catch (error) {
      if (error.code === '23505') {
        return res.status(400).json({ erro: 'Nome ou código já existe' });
      }
      console.error('Erro ao atualizar grão:', error);
      res.status(500).json({ erro: 'Erro ao atualizar grão' });
    }
  }

  // Deletar grão (admin)
  static async deletar(req, res) {
    try {
      const { id } = req.params;

      const grao = await Graos.obterPorId(id);
      if (!grao) {
        return res.status(404).json({ erro: 'Grão não encontrado' });
      }

      await Graos.deletar(id);
      res.json({ mensagem: 'Grão deletado com sucesso' });
    } catch (error) {
      if (error.code === '23503') {
        return res.status(400).json({ erro: 'Não é possível deletar este grão, pois está associado a propriedades' });
      }
      console.error('Erro ao deletar grão:', error);
      res.status(500).json({ erro: 'Erro ao deletar grão' });
    }
  }

  // Listar grãos de uma propriedade
  static async listarPorPropriedade(req, res) {
    try {
      const { propriedadeId } = req.params;
      const graos = await Graos.listarPorPropriedade(propriedadeId);
      res.json(graos);
    } catch (error) {
      console.error('Erro ao listar grãos:', error);
      res.status(500).json({ erro: 'Erro ao listar grãos' });
    }
  }

  // Associar grão a propriedade
  static async adicionarAPropriedade(req, res) {
    try {
      const { propriedadeId } = req.params;
      const { graoId, areaplantada } = req.body;

      if (!graoId) {
        return res.status(400).json({ erro: 'ID do grão é obrigatório' });
      }

      // Verificar se propriedade existe
      const propResult = await db.query('SELECT id FROM propriedades WHERE id = $1', [propriedadeId]);
      if (propResult.rows.length === 0) {
        return res.status(404).json({ erro: 'Propriedade não encontrada' });
      }

      // Verificar se grão existe
      const graoResult = await db.query('SELECT id FROM graos WHERE id = $1', [graoId]);
      if (graoResult.rows.length === 0) {
        return res.status(404).json({ erro: 'Grão não encontrado' });
      }

      const query = `
        INSERT INTO propriedades_graos (propriedade_id, grao_id, area_plantada)
        VALUES ($1, $2, $3)
        ON CONFLICT (propriedade_id, grao_id)
        DO UPDATE SET area_plantada = EXCLUDED.area_plantada
        RETURNING propriedade_id, grao_id, area_plantada
      `;
      const result = await db.query(query, [propriedadeId, graoId, areaplantada || null]);
      res.status(201).json(result.rows[0]);
    } catch (error) {
      console.error('Erro ao adicionar grão à propriedade:', error);
      res.status(500).json({ erro: 'Erro ao adicionar grão' });
    }
  }

  // Remover grão de propriedade
  static async removerDePropriedade(req, res) {
    try {
      const { propriedadeId, graoId } = req.params;

      const query = `
        DELETE FROM propriedades_graos
        WHERE propriedade_id = $1 AND grao_id = $2
        RETURNING propriedade_id, grao_id
      `;
      const result = await db.query(query, [propriedadeId, graoId]);

      if (result.rows.length === 0) {
        return res.status(404).json({ erro: 'Associação não encontrada' });
      }

      res.json({ mensagem: 'Grão removido da propriedade' });
    } catch (error) {
      console.error('Erro ao remover grão:', error);
      res.status(500).json({ erro: 'Erro ao remover grão' });
    }
  }
}

module.exports = GraosController;
