// Helpers compartilhados pelos testes de integração. Cada arquivo de teste
// importa `app` daqui (nunca de src/app diretamente) para garantir que as
// variáveis de ambiente de teste (vitest.config.js) já estejam aplicadas
// antes do módulo criar o pool de conexão com o banco.
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../src/config/database');
const app = require('../src/app');

async function limparBanco() {
  await pool.query(
    'TRUNCATE usuarios, propriedades, avaliacoes, respostas_indicadores, graos, propriedades_graos RESTART IDENTITY CASCADE'
  );
}

// Cria um usuário direto no banco (sem passar pela API) — mais rápido e não
// consome as 10 tentativas/15min do rate limiter de login.
async function criarUsuario({
  nome = 'Usuário de Teste',
  email,
  senha = 'senha-teste-123',
  role = 'tecnico',
  permissions = {},
  ativo = true,
} = {}) {
  const senhaHash = await bcrypt.hash(senha, 4); // custo baixo — só teste, não produção
  const result = await pool.query(
    `INSERT INTO usuarios (nome, email, senha_hash, role, foto_url, ativo, permissoes)
     VALUES ($1, $2, $3, $4, NULL, $5, $6::jsonb)
     RETURNING id, nome, email, role, ativo, permissoes`,
    [nome, email.toLowerCase(), senhaHash, role, ativo, JSON.stringify(permissions)]
  );
  return { ...result.rows[0], senha };
}

// Gera um token válido sem passar pelo endpoint /auth/login — o middleware
// authRequired busca role/permissões atuais no banco a partir de payload.id
// (permissões "vivas", ver middleware/auth.js), então só o id importa aqui.
// Usado pelos testes que verificam AUTORIZAÇÃO (dado um token válido, o
// acesso é concedido/negado corretamente), não o LOGIN em si — evita gastar
// as 10 tentativas/15min do rate limiter do /auth/login em testes que não
// são sobre login.
function gerarToken(userId) {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '1h',
  });
}

async function fecharPool() {
  await pool.end();
}

module.exports = { app, pool, limparBanco, criarUsuario, gerarToken, fecharPool };
