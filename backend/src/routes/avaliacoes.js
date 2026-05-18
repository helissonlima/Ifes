const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/avaliacoesController');
const { requirePermission } = require('../middleware/auth');

router.get('/estatisticas', requirePermission('dashboard'), ctrl.estatisticas);
router.get('/timeline/:propriedade_id', requirePermission('historico'), ctrl.timelinePropriedade);
router.get('/', requirePermission('historico'), ctrl.listar);
router.get('/:id', requirePermission('historico'), ctrl.buscarPorId);
router.get('/:id/diagnostico', requirePermission('historico'), ctrl.diagnostico);
router.post('/', requirePermission('avaliacoes'), ctrl.criar);
router.put('/:id/respostas', requirePermission('avaliacoes'), ctrl.salvarRespostas);
router.delete('/:id', requirePermission('historico'), ctrl.excluir);

module.exports = router;
