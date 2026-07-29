const pool = require('../config/database');
const { limparCachePermissoes } = require('../middleware/auth');

// Ordem de dependência (pais antes dos filhos). Restauração insere nesta
// ordem e limpa na ordem inversa, respeitando as foreign keys.
const TABELAS = [
  'usuarios',
  'propriedades',
  'graos',
  'propriedades_graos',
  'avaliacoes',
  'respostas_indicadores',
];

const FORMATO = 'sustentacafe-backup';
const VERSAO = 1;

async function colunasDe(client, tabela) {
  const { rows } = await client.query(
    `SELECT column_name FROM information_schema.columns
     WHERE table_schema = 'public' AND table_name = $1
     ORDER BY ordinal_position`,
    [tabela]
  );
  return rows.map((r) => r.column_name);
}

// GET /api/admin/backup — dump completo do sistema em JSON.
async function exportar(req, res, next) {
  const client = await pool.connect();
  try {
    const dados = {};
    for (const tabela of TABELAS) {
      const { rows } = await client.query(`SELECT * FROM ${tabela}`);
      dados[tabela] = rows;
    }

    const { rows: migracoes } = await client.query(
      'SELECT version FROM schema_migrations ORDER BY version'
    );

    res.json({
      formato: FORMATO,
      versao: VERSAO,
      gerado_em: new Date().toISOString(),
      gerado_por: req.user?.email || null,
      migracoes: migracoes.map((m) => m.version),
      totais: Object.fromEntries(TABELAS.map((t) => [t, dados[t].length])),
      dados,
    });
  } catch (err) {
    next(err);
  } finally {
    client.release();
  }
}

function validarArquivo(body) {
  if (!body || typeof body !== 'object') return 'Arquivo de backup inválido.';
  if (body.formato !== FORMATO) return 'Este arquivo não é um backup do SustentaCafé.';
  if (body.versao !== VERSAO) return `Versão de backup não suportada (${body.versao}).`;
  if (!body.dados || typeof body.dados !== 'object') return 'Backup sem a seção de dados.';
  for (const tabela of TABELAS) {
    if (!Array.isArray(body.dados[tabela])) {
      return `Backup incompleto: faltam os registros de "${tabela}".`;
    }
  }
  // Restaurar um backup sem nenhum admin ativo trancaria todo mundo pra fora
  // do sistema, sem caminho de volta pela interface.
  const temAdmin = body.dados.usuarios.some((u) => u.role === 'admin' && u.ativo !== false);
  if (!temAdmin) return 'O backup não contém nenhum administrador ativo — restaurá-lo deixaria o sistema inacessível.';
  return null;
}

// POST /api/admin/backup/restaurar — SUBSTITUI todos os dados atuais.
async function restaurar(req, res, next) {
  const erroValidacao = validarArquivo(req.body);
  if (erroValidacao) return res.status(400).json({ erro: erroValidacao });

  const { dados } = req.body;
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // TRUNCATE em bloco resolve as dependências circulares/cascata de uma vez.
    await client.query(`TRUNCATE TABLE ${TABELAS.join(', ')} CASCADE`);

    const totais = {};
    for (const tabela of TABELAS) {
      const colunasTabela = await colunasDe(client, tabela);
      const linhas = dados[tabela];
      let inseridas = 0;

      for (const linha of linhas) {
        // Só colunas que existem hoje: um backup de um schema levemente
        // diferente ainda restaura o que for compatível.
        const colunas = Object.keys(linha).filter((c) => colunasTabela.includes(c));
        if (colunas.length === 0) continue;

        const placeholders = colunas.map((_, i) => `$${i + 1}`);
        const valores = colunas.map((c) => (
          linha[c] !== null && typeof linha[c] === 'object' ? JSON.stringify(linha[c]) : linha[c]
        ));
        await client.query(
          `INSERT INTO ${tabela} (${colunas.map((c) => `"${c}"`).join(', ')}) VALUES (${placeholders.join(', ')})`,
          valores
        );
        inseridas += 1;
      }
      totais[tabela] = inseridas;
    }

    await client.query('COMMIT');
    // Papéis/permissões podem ter mudado com a restauração: o cache de 30s do
    // middleware de auth ficaria servindo os dados antigos.
    limparCachePermissoes();

    res.json({ mensagem: 'Backup restaurado com sucesso.', totais });
  } catch (err) {
    await client.query('ROLLBACK').catch(() => {});
    res.status(400).json({ erro: `Falha ao restaurar o backup: ${err.message}` });
  } finally {
    client.release();
  }
}

module.exports = { exportar, restaurar, TABELAS, FORMATO, VERSAO };
