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

  /**
   * Sincroniza o catálogo de culturas com o IBGE SIDRA PAM (Produção Agrícola Municipal).
   *
   * Nota: O INCAPER não possui API pública — os dados do SISPREÇO são acessíveis
   * apenas via formulário web com termo de uso. O IBGE SIDRA PAM é a fonte oficial
   * equivalente e pública, contendo as mesmas culturas reportadas pelos municípios
   * do ES, e é utilizado pelo próprio INCAPER para embasamento de políticas públicas.
   *
   * Endpoint IBGE utilizado: tabela 5457 (Lavouras temp. e permanentes)
   *   variável 214 (quantidade produzida), localidade N3[32] (Espírito Santo)
   */
  static async sincronizarIBGE(req, res) {
    try {
      const url =
        'https://servicodados.ibge.gov.br/api/v3/agregados/5457/periodos/2023|2024/variaveis/214' +
        '?localidades=N3[32]&classificacao=782[all]';

      const response = await fetch(url, {
        headers: { Accept: 'application/json' },
        signal: AbortSignal.timeout(20000),
      });

      if (!response.ok) throw new Error(`IBGE retornou HTTP ${response.status}`);

      const data = await response.json();
      const variavel = data.find((v) => String(v.id) === '214');
      if (!variavel?.resultados) throw new Error('Formato de resposta IBGE inesperado');

      // Extrai culturas com produção registrada no ES
      const culturas = [];
      for (const resultado of variavel.resultados) {
        const catObj = resultado.classificacoes?.[0]?.categoria;
        if (!catObj) continue;
        const [catId, nomeCompleto] = Object.entries(catObj)[0];
        if (!nomeCompleto || nomeCompleto === 'Total') continue;

        const serie = resultado.series?.[0]?.serie ?? {};
        const temDados = Object.values(serie).some((v) => v && v !== '...' && v !== '-');
        if (!temDados) continue; // Sem produção no ES

        // Gera código a partir do nome (ex: "Feijão (em grão)" → "FEIJAO")
        const codigo = nomeCompleto
          .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
          .toUpperCase()
          .replace(/\([^)]*\)/g, '')
          .replace(/[^A-Z0-9\s]/g, '')
          .trim()
          .replace(/\s+/g, '_')
          .replace(/_+/g, '_')
          .slice(0, 20);

        const anosDisponiveis = Object.entries(serie)
          .filter(([, v]) => v && v !== '...' && v !== '-')
          .map(([ano]) => ano)
          .sort()
          .join(', ');

        culturas.push({
          nome: nomeCompleto,
          codigo,
          descricao: `Fonte: IBGE PAM/ES (cat. ${catId}). Dados disponíveis: ${anosDisponiveis}.`,
        });
      }

      // Upsert no banco — ignora conflitos de nome/código já existentes
      let inseridos = 0;
      let ignorados = 0;
      for (const c of culturas) {
        try {
          const r = await db.query(
            `INSERT INTO graos (nome, codigo, descricao, ativo)
             VALUES ($1, $2, $3, TRUE)
             ON CONFLICT DO NOTHING
             RETURNING id`,
            [c.nome, c.codigo, c.descricao],
          );
          if (r.rows.length > 0) inseridos++;
          else ignorados++;
        } catch {
          ignorados++;
        }
      }

      res.json({
        mensagem: `Sincronização concluída: ${inseridos} cultura(s) importada(s) do IBGE PAM/ES.`,
        total_ibge: culturas.length,
        inseridos,
        ignorados,
        culturas,
      });
    } catch (error) {
      console.error('Erro ao sincronizar com IBGE:', error);
      res.status(500).json({ erro: 'Falha ao buscar dados do IBGE: ' + error.message });
    }
  }
}

module.exports = GraosController;
