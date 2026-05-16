const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/propriedadesController');
const { requirePermission } = require('../middleware/auth');

router.get('/', requirePermission('propriedades'), ctrl.listar);
router.get('/:id', requirePermission('propriedades'), ctrl.buscarPorId);
router.post('/', requirePermission('propriedades'), ctrl.criar);
router.put('/:id', requirePermission('propriedades'), ctrl.atualizar);
router.delete('/:id', requirePermission('propriedades'), ctrl.excluir);

module.exports = router;
