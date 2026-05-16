const bcrypt = require('bcryptjs');
const pool = require('./database');

async function bootstrapAuth() {
  await pool.query(`
    CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

    CREATE TABLE IF NOT EXISTS usuarios (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      nome VARCHAR(200) NOT NULL,
      email VARCHAR(150) UNIQUE NOT NULL,
      senha_hash VARCHAR(255) NOT NULL,
      role VARCHAR(20) NOT NULL DEFAULT 'tecnico',
      foto_url TEXT,
      ativo BOOLEAN NOT NULL DEFAULT TRUE,
      permissoes JSONB NOT NULL DEFAULT '{
        "dashboard": true,
        "propriedades": true,
        "avaliacoes": true,
        "historico": true,
        "metodologia": true,
        "usuarios": false
      }'::jsonb,
      criado_em TIMESTAMP DEFAULT NOW(),
      atualizado_em TIMESTAMP DEFAULT NOW()
    );

    CREATE OR REPLACE FUNCTION atualizar_timestamp_usuarios()
    RETURNS TRIGGER AS $$
    BEGIN
      NEW.atualizado_em = NOW();
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;

    DROP TRIGGER IF EXISTS trg_usuarios_updated ON usuarios;
    CREATE TRIGGER trg_usuarios_updated
      BEFORE UPDATE ON usuarios
      FOR EACH ROW EXECUTE FUNCTION atualizar_timestamp_usuarios();
  `);

  const adminEmail = 'helisson@outlook.com';
  const adminPassword = 'Lima7662';
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
