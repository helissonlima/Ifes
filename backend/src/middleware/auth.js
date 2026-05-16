const jwt = require('jsonwebtoken');

function authRequired(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    if (!token) return res.status(401).json({ erro: 'Não autenticado' });

    const secret = process.env.JWT_SECRET || 'dev-secret-change-me';
    const payload = jwt.verify(token, secret);
    req.user = payload;
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

module.exports = { authRequired, requirePermission };
