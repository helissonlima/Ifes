const jwt = require('jsonwebtoken');
const pool = require('../config/database');
const { requireSecret } = require('../config/secrets');

const JWT_SECRET = requireSecret('JWT_SECRET', 'dev-secret-change-me');

// Permissões "vivas": em vez de confiar apenas no que foi gravado no token
// (que só expira em JWT_EXPIRES_IN, hoje 12h), busca role/permissões/status
// atuais no banco a cada requisição, com um cache curto por usuário para não
// sobrecarregar o banco.
const PERM_CACHE_TTL_MS = 30 * 1000;
const permCache = new Map();

async function carregarPermissoesAtuais(userId) {
  const cached = permCache.get(userId);
  if (cached && Date.now() - cached.ts < PERM_CACHE_TTL_MS) {
    return cached.dados;
  }

  const result = await pool.query('SELECT role, permissoes, ativo FROM usuarios WHERE id = $1', [userId]);
  const row = result.rows[0];
  const dados = row ? { role: row.role, permissions: row.permissoes || {}, ativo: row.ativo } : null;

  permCache.set(userId, { dados, ts: Date.now() });
  return dados;
}

async function authRequired(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    if (!token) return res.status(401).json({ erro: 'Não autenticado' });

    const payload = jwt.verify(token, JWT_SECRET);

    const atual = await carregarPermissoesAtuais(payload.id);
    if (!atual || !atual.ativo) {
      return res.status(401).json({ erro: 'Sessão inválida ou expirada' });
    }

    req.user = { ...payload, role: atual.role, permissions: atual.permissions };
    return next();
  } catch (err) {
    return res.status(401).json({ erro: 'Sessão inválida ou expirada' });
  }
}

function requirePermission(permissionKey) {
  return (req, res, next) => {
    const user = req.user;
    if (!user) return res.status(401).json({ erro: 'Não autenticado' });
    if (user.role === 'admin') return next();

    const perms = user.permissions || {};
    if (!perms[permissionKey]) {
      return res.status(403).json({ erro: 'Sem permissão para esta funcionalidade' });
    }
    return next();
  };
}

function requireAdmin(req, res, next) {
  const user = req.user;
  if (!user) return res.status(401).json({ erro: 'Não autenticado' });
  if (user.role !== 'admin') {
    return res.status(403).json({ erro: 'Acesso restrito a administradores' });
  }
  return next();
}

module.exports = { authRequired, requirePermission, requireAdmin };
