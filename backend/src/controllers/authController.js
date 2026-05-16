const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/database');

function sanitizeUser(row) {
  return {
    id: row.id,
    nome: row.nome,
    email: row.email,
    role: row.role,
    foto_url: row.foto_url,
    ativo: row.ativo,
    permissions: row.permissoes || {},
  };
}

function signToken(user) {
  const secret = process.env.JWT_SECRET || 'dev-secret-change-me';
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
      'SELECT id, nome, email, role, foto_url, ativo, permissoes, criado_em FROM usuarios ORDER BY criado_em DESC'
    );
    return res.json(result.rows.map((r) => ({ ...r, permissions: r.permissoes })));
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

    const senhaHash = await bcrypt.hash(senha, 10);
    const defaults = {
      dashboard: true,
      propriedades: true,
      avaliacoes: true,
      historico: true,
      metodologia: true,
      usuarios: false,
    };
    const mergedPermissions = { ...defaults, ...permissions };

    const result = await pool.query(
      `INSERT INTO usuarios (nome, email, senha_hash, role, foto_url, permissoes)
       VALUES ($1, $2, $3, $4, $5, $6::jsonb)
       RETURNING id, nome, email, role, foto_url, ativo, permissoes, criado_em`,
      [nome, email.toLowerCase(), senhaHash, role, foto_url, JSON.stringify(mergedPermissions)]
    );

    return res.status(201).json({ ...result.rows[0], permissions: result.rows[0].permissoes });
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ erro: 'Já existe usuário com este e-mail' });
    }
    return res.status(500).json({ erro: err.message });
  }
};

const atualizarPermissoes = async (req, res) => {
  try {
    const { id } = req.params;
    const { permissions = {}, ativo } = req.body;
    const current = await pool.query('SELECT permissoes, ativo FROM usuarios WHERE id = $1', [id]);
    if (!current.rows.length) return res.status(404).json({ erro: 'Usuário não encontrado' });

    const merged = { ...(current.rows[0].permissoes || {}), ...permissions };
    const nextAtivo = typeof ativo === 'boolean' ? ativo : current.rows[0].ativo;

    const result = await pool.query(
      `UPDATE usuarios
       SET permissoes = $1::jsonb, ativo = $2
       WHERE id = $3
       RETURNING id, nome, email, role, foto_url, ativo, permissoes`,
      [JSON.stringify(merged), nextAtivo, id]
    );

    return res.json({ ...result.rows[0], permissions: result.rows[0].permissoes });
  } catch (err) {
    return res.status(500).json({ erro: err.message });
  }
};

module.exports = {
  login,
  me,
  listarUsuarios,
  criarUsuario,
  atualizarPermissoes,
};
