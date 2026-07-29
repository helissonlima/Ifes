const bcrypt = require('bcryptjs');
const pool = require('./database');
const { requireEnv } = require('./secrets');

// A tabela usuarios é criada pela migration 005_usuarios.sql (aplicada por
// runMigrations() antes desta função rodar). Aqui só cuidamos da semente do
// usuário admin inicial.
async function bootstrapAuth() {
  const adminEmail = requireEnv('ADMIN_EMAIL', 'admin@example.com');
  const adminPassword = requireEnv('ADMIN_PASSWORD', 'change-me-now');
  const result = await pool.query('SELECT id FROM usuarios WHERE email = $1', [adminEmail]);

  await pool.query(
    `UPDATE usuarios SET foto_url = NULL
     WHERE email = $1 AND foto_url ILIKE 'https://i.pravatar.cc/%'`,
    [adminEmail]
  );

  if (result.rows.length === 0) {
    const senhaHash = await bcrypt.hash(adminPassword, 10);
    await pool.query(
      `INSERT INTO usuarios (nome, email, senha_hash, role, foto_url, permissoes)
       VALUES ($1, $2, $3, 'admin', $4, $5::jsonb)`,
      [
        'Helisson Lima',
        adminEmail,
        senhaHash,
        null,
        JSON.stringify({
          dashboard: true,
          propriedades: true,
          avaliacoes: true,
          historico: true,
          metodologia: true,
          usuarios: true,
        }),
      ]
    );
    console.log('✅ Usuário admin inicial criado.');
  }
}

module.exports = { bootstrapAuth };
