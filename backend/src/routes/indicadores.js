const express = require('express');
const router = express.Router();
const { DIMENSOES, ESCALA_IGS } = require('../models/indicadores');
const { requirePermission } = require('../middleware/auth');

// Retorna toda a estrutura de indicadores para o frontend
router.get('/', requirePermission('metodologia'), (req, res) => {
  res.json({ dimensoes: DIMENSOES, escala: ESCALA_IGS });
});

router.get('/dimensoes', requirePermission('metodologia'), (req, res) => {
  res.json(Object.values(DIMENSOES).map(d => ({
    codigo: d.codigo,
    nome: d.nome,
    peso: d.peso,
    cor: d.cor,
    total_indicadores: d.indicadores.length,
  })));
});

module.exports = router;
