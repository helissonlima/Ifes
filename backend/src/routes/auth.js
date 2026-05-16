const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/authController');
const { authRequired, requirePermission } = require('../middleware/auth');

router.post('/login', ctrl.login);
router.get('/me', authRequired, ctrl.me);

router.get('/usuarios', authRequired, requirePermission('usuarios'), ctrl.listarUsuarios);
router.post('/usuarios', authRequired, requirePermission('usuarios'), ctrl.criarUsuario);
router.put('/usuarios/:id/permissoes', authRequired, requirePermission('usuarios'), ctrl.atualizarPermissoes);

module.exports = router;
