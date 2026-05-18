const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/authController');
const { authRequired, requireAdmin } = require('../middleware/auth');

router.post('/login', ctrl.login);
router.get('/me', authRequired, ctrl.me);

// Gestão de usuários — somente administradores
router.get('/usuarios', authRequired, requireAdmin, ctrl.listarUsuarios);
router.post('/usuarios', authRequired, requireAdmin, ctrl.criarUsuario);
router.put('/usuarios/:id', authRequired, requireAdmin, ctrl.atualizarUsuario);
router.put('/usuarios/:id/permissoes', authRequired, requireAdmin, ctrl.atualizarPermissoes);
router.put('/usuarios/:id/senha', authRequired, requireAdmin, ctrl.redefinirSenha);
router.delete('/usuarios/:id', authRequired, requireAdmin, ctrl.excluirUsuario);

module.exports = router;
