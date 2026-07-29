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

// Resumo leve da metodologia (pesos por dimensão + escala de classificação),
// sem a árvore completa de indicadores/critérios — para telas que só
// precisam calcular/exibir classificação (Dashboard, Resultado, etc.).
// Sem requirePermission('metodologia'): não expõe conteúdo sensível (só os
// números usados para classificar resultados que o próprio usuário já vê),
// e outras telas dependem disso mesmo sem acesso à página de Metodologia.
router.get('/metodologia', (req, res) => {
  res.json({
    dimensoes: Object.values(DIMENSOES).map((d) => ({ codigo: d.codigo, nome: d.nome, peso: d.peso, cor: d.cor })),
    escala: ESCALA_IGS,
  });
});

module.exports = router;
