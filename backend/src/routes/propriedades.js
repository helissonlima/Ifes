const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/propriedadesController');
const { requirePermission } = require('../middleware/auth');
const { validate, validateQuery } = require('../middleware/validate');
const { criarPropriedadeSchema, atualizarPropriedadeSchema, paginacaoSchema } = require('../validation/schemas');

router.get('/', requirePermission('propriedades'), validateQuery(paginacaoSchema), ctrl.listar);
router.get('/:id', requirePermission('propriedades'), ctrl.buscarPorId);
router.post('/', requirePermission('propriedades'), validate(criarPropriedadeSchema), ctrl.criar);
router.put('/:id', requirePermission('propriedades'), validate(atualizarPropriedadeSchema), ctrl.atualizar);
router.delete('/:id', requirePermission('propriedades'), ctrl.excluir);

module.exports = router;
