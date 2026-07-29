-- =====================================================
-- Migração 005: Usuários e autenticação
-- Antes criada diretamente em src/config/authBootstrap.js a cada boot;
-- movida para migration para ficar sob o mesmo controle de versão/aplicação
-- única das demais tabelas.
-- =====================================================

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
