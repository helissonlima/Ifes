const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/avaliacoesController');

router.get('/estatisticas', ctrl.estatisticas);
router.get('/', ctrl.listar);
router.get('/:id', ctrl.buscarPorId);
router.post('/', ctrl.criar);
router.put('/:id/respostas', ctrl.salvarRespostas);
router.delete('/:id', ctrl.excluir);

module.exports = router;
