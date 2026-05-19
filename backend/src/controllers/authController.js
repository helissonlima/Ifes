const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/database');
const { readSecret } = require('../config/secrets');

const DEFAULT_PERMISSIONS = {
  dashboard: true,
  propriedades: true,
  avaliacoes: true,
  historico: true,
  metodologia: true,
  usuarios: false,
};

function sanitizeUser(row) {
  return {
    id: row.id,
    nome: row.nome,
    email: row.email,
    role: row.role,
    foto_url: row.foto_url,
    ativo: row.ativo,
    permissions: row.permissoes || {},
    criado_em: row.criado_em,
    atualizado_em: row.atualizado_em,
  };
}

function signToken(user) {
  const secret = readSecret('JWT_SECRET', 'dev-secret-change-me');
  return jwt.sign(
    {
      sub: user.id,
      id: user.id,
      nome: user.nome,
      email: user.email,
      role: user.role,
      foto_url: user.foto_url,
      permissions: user.permissions,
    },
    secret,
    { expiresIn: process.env.JWT_EXPIRES_IN || '12h' }
  );
}

const login = async (req, res) => {
  try {
    const { email, senha } = req.body;
    if (!email || !senha) return res.status(400).json({ erro: 'E-mail e senha são obrigatórios' });

    const result = await pool.query('SELECT * FROM usuarios WHERE email = $1', [email.toLowerCase()]);
    if (!result.rows.length) return res.status(401).json({ erro: 'Credenciais inválidas' });

    const row = result.rows[0];
    if (!row.ativo) return res.status(403).json({ erro: 'Usuário inativo' });

    const ok = await bcrypt.compare(senha, row.senha_hash);
    if (!ok) return res.status(401).json({ erro: 'Credenciais inválidas' });

    const user = sanitizeUser(row);
    const token = signToken(user);
    return res.json({ token, user });
  } catch (err) {
    return res.status(500).json({ erro: err.message });
  }
};

const me = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM usuarios WHERE id = $1', [req.user.id]);
    if (!result.rows.length) return res.status(404).json({ erro: 'Usuário não encontrado' });
    return res.json(sanitizeUser(result.rows[0]));
  } catch (err) {
    return res.status(500).json({ erro: err.message });
  }
};

const listarUsuarios = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, nome, email, role, foto_url, ativo, permissoes, criado_em, atualizado_em
       FROM usuarios ORDER BY criado_em DESC`
    );
    return res.json(result.rows.map(sanitizeUser));
  } catch (err) {
    return res.status(500).json({ erro: err.message });
  }
};

const criarUsuario = async (req, res) => {
  try {
    const { nome, email, senha, role = 'tecnico', foto_url = '', permissions = {} } = req.body;
    if (!nome || !email || !senha) {
      return res.status(400).json({ erro: 'Nome, e-mail e senha são obrigatórios' });
    }
    if (senha.length < 6) {
      return res.status(400).json({ erro: 'A senha deve ter pelo menos 6 caracteres' });
    }
    if (!['admin', 'tecnico', 'visualizador'].includes(role)) {
      return res.status(400).json({ erro: 'Função inválida' });
    }

    const senhaHash = await bcrypt.hash(senha, 10);
    const mergedPermissions = role === 'admin'
      ? { ...DEFAULT_PERMISSIONS, dashboard: true, propriedades: true, avaliacoes: true, historico: true, metodologia: true, usuarios: true }
      : { ...DEFAULT_PERMISSIONS, ...permissions };

    const result = await pool.query(
      `INSERT INTO usuarios (nome, email, senha_hash, role, foto_url, permissoes)
       VALUES ($1, $2, $3, $4, $5, $6::jsonb)
       RETURNING id, nome, email, role, foto_url, ativo, permissoes, criado_em, atualizado_em`,
      [nome, email.toLowerCase(), senhaHash, role, foto_url || null, JSON.stringify(mergedPermissions)]
    );

    return res.status(201).json(sanitizeUser(result.rows[0]));
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ erro: 'Já existe um usuário com este e-mail' });
    }
    return res.status(500).json({ erro: err.message });
  }
};

const atualizarUsuario = async (req, res) => {
  try {
    const { id } = req.params;
    const { nome, email, foto_url, role } = req.body;

    const current = await pool.query('SELECT * FROM usuarios WHERE id = $1', [id]);
    if (!current.rows.length) return res.status(404).json({ erro: 'Usuário não encontrado' });
    const atual = current.rows[0];

    // Proteção: não permitir despromover o próprio admin logado
    if (req.user.id === id && role && role !== 'admin') {
      return res.status(400).json({ erro: 'Você não pode remover seu próprio papel de administrador' });
    }

    // Proteção: não pode remover o último admin do sistema
    if (atual.role === 'admin' && role && role !== 'admin') {
      const totalAdmins = await pool.query("SELECT COUNT(*) FROM usuarios WHERE role = 'admin' AND ativo = TRUE");
      if (parseInt(totalAdmins.rows[0].count, 10) <= 1) {
        return res.status(400).json({ erro: 'Não é possível alterar o papel do último administrador ativo' });
      }
    }

    if (role && !['admin', 'tecnico', 'visualizador'].includes(role)) {
      return res.status(400).json({ erro: 'Função inválida' });
    }

    const novoNome = nome ?? atual.nome;
    const novoEmail = (email ?? atual.email).toLowerCase();
    const novaFoto = foto_url !== undefined ? (foto_url || null) : atual.foto_url;
    const novoRole = role ?? atual.role;

    // Se virou admin, garantir todas as permissões
    let novasPermissoes = atual.permissoes;
    if (novoRole === 'admin' && atual.role !== 'admin') {
      novasPermissoes = {
        dashboard: true, propriedades: true, avaliacoes: true,
        historico: true, metodologia: true, usuarios: true,
      };
    }

    const result = await pool.query(
      `UPDATE usuarios
       SET nome = $1, email = $2, foto_url = $3, role = $4, permissoes = $5::jsonb
       WHERE id = $6
       RETURNING id, nome, email, role, foto_url, ativo, permissoes, criado_em, atualizado_em`,
      [novoNome, novoEmail, novaFoto, novoRole, JSON.stringify(novasPermissoes), id]
    );

    return res.json(sanitizeUser(result.rows[0]));
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ erro: 'Já existe um usuário com este e-mail' });
    }
    return res.status(500).json({ erro: err.message });
  }
};

const atualizarPermissoes = async (req, res) => {
  try {
    const { id } = req.params;
    const { permissions = {}, ativo } = req.body;
    const current = await pool.query('SELECT permissoes, ativo, role FROM usuarios WHERE id = $1', [id]);
    if (!current.rows.length) return res.status(404).json({ erro: 'Usuário não encontrado' });

    // Proteção: não pode desativar a si mesmo
    if (req.user.id === id && ativo === false) {
      return res.status(400).json({ erro: 'Você não pode desativar sua própria conta' });
    }

    // Proteção: não desativar o último admin ativo
    if (ativo === false && current.rows[0].role === 'admin') {
      const totalAdmins = await pool.query("SELECT COUNT(*) FROM usuarios WHERE role = 'admin' AND ativo = TRUE");
      if (parseInt(totalAdmins.rows[0].count, 10) <= 1) {
        return res.status(400).json({ erro: 'Não é possível desativar o último administrador' });
      }
    }

    const merged = { ...(current.rows[0].permissoes || {}), ...permissions };
    const nextAtivo = typeof ativo === 'boolean' ? ativo : current.rows[0].ativo;

    const result = await pool.query(
      `UPDATE usuarios
       SET permissoes = $1::jsonb, ativo = $2
       WHERE id = $3
       RETURNING id, nome, email, role, foto_url, ativo, permissoes, criado_em, atualizado_em`,
      [JSON.stringify(merged), nextAtivo, id]
    );

    return res.json(sanitizeUser(result.rows[0]));
  } catch (err) {
    return res.status(500).json({ erro: err.message });
  }
};

const redefinirSenha = async (req, res) => {
  try {
    const { id } = req.params;
    const { senha } = req.body;
    if (!senha || senha.length < 6) {
      return res.status(400).json({ erro: 'A nova senha deve ter pelo menos 6 caracteres' });
    }
    const senhaHash = await bcrypt.hash(senha, 10);
    const result = await pool.query(
      `UPDATE usuarios SET senha_hash = $1 WHERE id = $2 RETURNING id`,
      [senhaHash, id]
    );
    if (!result.rows.length) return res.status(404).json({ erro: 'Usuário não encontrado' });
    return res.json({ mensagem: 'Senha redefinida com sucesso' });
  } catch (err) {
    return res.status(500).json({ erro: err.message });
  }
};

const excluirUsuario = async (req, res) => {
  try {
    const { id } = req.params;

    if (req.user.id === id) {
      return res.status(400).json({ erro: 'Você não pode excluir sua própria conta' });
    }

    const current = await pool.query('SELECT role FROM usuarios WHERE id = $1', [id]);
    if (!current.rows.length) return res.status(404).json({ erro: 'Usuário não encontrado' });

    if (current.rows[0].role === 'admin') {
      const totalAdmins = await pool.query("SELECT COUNT(*) FROM usuarios WHERE role = 'admin'");
      if (parseInt(totalAdmins.rows[0].count, 10) <= 1) {
        return res.status(400).json({ erro: 'Não é possível excluir o último administrador' });
      }
    }

    await pool.query('DELETE FROM usuarios WHERE id = $1', [id]);
    return res.json({ mensagem: 'Usuário excluído com sucesso' });
  } catch (err) {
    return res.status(500).json({ erro: err.message });
  }
};

module.exports = {
  login,
  me,
  listarUsuarios,
  criarUsuario,
  atualizarUsuario,
  atualizarPermissoes,
  redefinirSenha,
  excluirUsuario,
};
