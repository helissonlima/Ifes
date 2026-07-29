const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/avaliacoesController');
const { requirePermission } = require('../middleware/auth');
const { validate, validateQuery } = require('../middleware/validate');
const { criarAvaliacaoSchema, salvarRespostasSchema, paginacaoSchema } = require('../validation/schemas');

router.get('/estatisticas', requirePermission('dashboard'), ctrl.estatisticas);
router.get('/comparar', requirePermission('historico'), ctrl.comparar);
router.get('/timeline/:propriedade_id', requirePermission('historico'), ctrl.timelinePropriedade);
router.get('/', requirePermission('historico'), validateQuery(paginacaoSchema), ctrl.listar);
router.get('/:id', requirePermission('historico'), ctrl.buscarPorId);
router.get('/:id/diagnostico', requirePermission('historico'), ctrl.diagnostico);
router.post('/', requirePermission('avaliacoes'), validate(criarAvaliacaoSchema), ctrl.criar);
router.put('/:id/respostas', requirePermission('avaliacoes'), validate(salvarRespostasSchema), ctrl.salvarRespostas);
router.delete('/:id', requirePermission('historico'), ctrl.excluir);

module.exports = router;
