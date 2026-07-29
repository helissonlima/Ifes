const express = require('express');
const rateLimit = require('express-rate-limit');
const router = express.Router();
const ctrl = require('../controllers/authController');
const { authRequired, requireAdmin } = require('../middleware/auth');

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { erro: 'Muitas tentativas de login. Tente novamente em alguns minutos.' },
});

router.post('/login', loginLimiter, ctrl.login);
router.get('/me', authRequired, ctrl.me);

// Gestão de usuários — somente administradores
router.get('/usuarios', authRequired, requireAdmin, ctrl.listarUsuarios);
router.post('/usuarios', authRequired, requireAdmin, ctrl.criarUsuario);
router.put('/usuarios/:id', authRequired, requireAdmin, ctrl.atualizarUsuario);
router.put('/usuarios/:id/permissoes', authRequired, requireAdmin, ctrl.atualizarPermissoes);
router.put('/usuarios/:id/senha', authRequired, requireAdmin, ctrl.redefinirSenha);
router.delete('/usuarios/:id', authRequired, requireAdmin, ctrl.excluirUsuario);

module.exports = router;
