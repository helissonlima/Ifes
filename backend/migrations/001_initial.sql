-- =====================================================
-- Sistema de Avaliação de Sustentabilidade Rural
-- ISA-EPAMIG / INCAPER - Migração Inicial
-- =====================================================

-- Extensões
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabela de propriedades rurais
CREATE TABLE IF NOT EXISTS propriedades (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nome VARCHAR(200) NOT NULL,
    municipio VARCHAR(100) NOT NULL,
    estado VARCHAR(2) NOT NULL DEFAULT 'ES',
    proprietario VARCHAR(200) NOT NULL,
    area_total DECIMAL(10,2),
    area_cafe DECIMAL(10,2),
    latitude DECIMAL(10,8),
    longitude DECIMAL(11,8),
    telefone VARCHAR(20),
    email VARCHAR(150),
    criado_em TIMESTAMP DEFAULT NOW(),
    atualizado_em TIMESTAMP DEFAULT NOW()
);

-- Tabela de avaliações
CREATE TABLE IF NOT EXISTS avaliacoes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    propriedade_id UUID NOT NULL REFERENCES propriedades(id) ON DELETE CASCADE,
    tecnico_responsavel VARCHAR(200),
    data_avaliacao DATE NOT NULL DEFAULT CURRENT_DATE,
    observacoes TEXT,
    -- Índices por dimensão (0 a 1)
    indice_economico DECIMAL(5,4),
    indice_ambiental DECIMAL(5,4),
    indice_social DECIMAL(5,4),
    indice_gestao_qualidade DECIMAL(5,4),
    -- Índice Geral de Sustentabilidade
    igs DECIMAL(5,4),
    -- Classificação final
    classificacao VARCHAR(50),
    status VARCHAR(20) DEFAULT 'rascunho', -- rascunho, concluida
    criado_em TIMESTAMP DEFAULT NOW(),
    atualizado_em TIMESTAMP DEFAULT NOW()
);

-- Tabela de respostas dos indicadores
CREATE TABLE IF NOT EXISTS respostas_indicadores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    avaliacao_id UUID NOT NULL REFERENCES avaliacoes(id) ON DELETE CASCADE,
    dimensao VARCHAR(30) NOT NULL,       -- economica, ambiental, social, gestao_qualidade
    indicador_codigo VARCHAR(50) NOT NULL,
    indicador_nome VARCHAR(200) NOT NULL,
    nota DECIMAL(4,2) NOT NULL CHECK (nota >= 0 AND nota <= 1),
    criterio_selecionado VARCHAR(300),
    observacao TEXT,
    criado_em TIMESTAMP DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_avaliacoes_propriedade ON avaliacoes(propriedade_id);
CREATE INDEX IF NOT EXISTS idx_respostas_avaliacao ON respostas_indicadores(avaliacao_id);
CREATE INDEX IF NOT EXISTS idx_respostas_dimensao ON respostas_indicadores(dimensao);
CREATE INDEX IF NOT EXISTS idx_avaliacoes_data ON avaliacoes(data_avaliacao DESC);

-- Trigger para atualizar o campo atualizado_em
CREATE OR REPLACE FUNCTION atualizar_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.atualizado_em = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_propriedades_updated
    BEFORE UPDATE ON propriedades
    FOR EACH ROW EXECUTE FUNCTION atualizar_timestamp();

CREATE TRIGGER trg_avaliacoes_updated
    BEFORE UPDATE ON avaliacoes
    FOR EACH ROW EXECUTE FUNCTION atualizar_timestamp();

-- Função para calcular o IGS e classificação
CREATE OR REPLACE FUNCTION calcular_igs(
    p_ie DECIMAL, p_ia DECIMAL, p_is DECIMAL, p_igq DECIMAL
) RETURNS TABLE(igs DECIMAL, classificacao VARCHAR) AS $$
DECLARE
    v_igs DECIMAL;
BEGIN
    v_igs := (p_ie * 0.30) + (p_ia * 0.35) + (p_is * 0.20) + (p_igq * 0.15);
    RETURN QUERY SELECT
        ROUND(v_igs, 4),
        CASE
            WHEN v_igs <= 0.20 THEN 'Muito Baixa'
            WHEN v_igs <= 0.40 THEN 'Baixa'
            WHEN v_igs <= 0.60 THEN 'Moderada'
            WHEN v_igs <= 0.80 THEN 'Boa'
            ELSE 'Alta'
        END::VARCHAR;
END;
$$ LANGUAGE plpgsql;
