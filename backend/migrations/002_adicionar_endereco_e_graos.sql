-- =====================================================
-- Migração 002: Adicionar endereço completo e grãos
-- =====================================================

-- Adicionar colunas de endereço completo à tabela propriedades
ALTER TABLE propriedades ADD COLUMN IF NOT EXISTS rua VARCHAR(200);
ALTER TABLE propriedades ADD COLUMN IF NOT EXISTS numero VARCHAR(10);
ALTER TABLE propriedades ADD COLUMN IF NOT EXISTS complemento VARCHAR(100);
ALTER TABLE propriedades ADD COLUMN IF NOT EXISTS bairro VARCHAR(100);
ALTER TABLE propriedades ADD COLUMN IF NOT EXISTS cep VARCHAR(10);

-- Tabela de grãos disponíveis no sistema
CREATE TABLE IF NOT EXISTS graos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nome VARCHAR(100) NOT NULL UNIQUE,
    codigo VARCHAR(20) NOT NULL UNIQUE,
    descricao TEXT,
    ativo BOOLEAN DEFAULT TRUE,
    criado_em TIMESTAMP DEFAULT NOW(),
    atualizado_em TIMESTAMP DEFAULT NOW()
);

-- Tabela de relação entre propriedades e grãos que produzem
CREATE TABLE IF NOT EXISTS propriedades_graos (
    propriedade_id UUID NOT NULL REFERENCES propriedades(id) ON DELETE CASCADE,
    grao_id UUID NOT NULL REFERENCES graos(id) ON DELETE CASCADE,
    area_plantada DECIMAL(10,2),
    criado_em TIMESTAMP DEFAULT NOW(),
    atualizado_em TIMESTAMP DEFAULT NOW(),
    PRIMARY KEY (propriedade_id, grao_id)
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_propriedades_graos_propriedade ON propriedades_graos(propriedade_id);
CREATE INDEX IF NOT EXISTS idx_propriedades_graos_grao ON propriedades_graos(grao_id);
CREATE INDEX IF NOT EXISTS idx_graos_ativo ON graos(ativo);

-- Trigger para atualizar timestamps de grãos
CREATE TRIGGER trg_graos_updated
    BEFORE UPDATE ON graos
    FOR EACH ROW EXECUTE FUNCTION atualizar_timestamp();

CREATE TRIGGER trg_propriedades_graos_updated
    BEFORE UPDATE ON propriedades_graos
    FOR EACH ROW EXECUTE FUNCTION atualizar_timestamp();

-- Inserir grãos comuns brasileiros
INSERT INTO graos (nome, codigo, descricao, ativo) VALUES
    ('Milho', 'MILHO', 'Milho (Zea mays)', TRUE),
    ('Soja', 'SOJA', 'Soja (Glycine max)', TRUE),
    ('Trigo', 'TRIGO', 'Trigo (Triticum aestivum)', TRUE),
    ('Arroz', 'ARROZ', 'Arroz (Oryza sativa)', TRUE),
    ('Feijão', 'FEIJAO', 'Feijão (Phaseolus vulgaris)', TRUE),
    ('Café', 'CAFE', 'Café (Coffea arabica/robusta)', TRUE),
    ('Cana-de-açúcar', 'CANA', 'Cana-de-açúcar (Saccharum officinarum)', TRUE),
    ('Algodão', 'ALGODAO', 'Algodão (Gossypium hirsutum)', TRUE),
    ('Girassol', 'GIRASSOL', 'Girassol (Helianthus annuus)', TRUE),
    ('Amendoim', 'AMENDOIM', 'Amendoim (Arachis hypogaea)', TRUE),
    ('Cevada', 'CEVADA', 'Cevada (Hordeum vulgare)', TRUE),
    ('Sorgo', 'SORGO', 'Sorgo (Sorghum bicolor)', TRUE),
    ('Aveia', 'AVEIA', 'Aveia (Avena sativa)', TRUE),
    ('Centeio', 'CENTEIO', 'Centeio (Secale cereale)', TRUE),
    ('Mandioca', 'MANDIOCA', 'Mandioca (Manihot esculenta)', TRUE),
    ('Batata', 'BATATA', 'Batata (Solanum tuberosum)', TRUE),
    ('Melancia', 'MELANCIA', 'Melancia (Citrullus lanatus)', TRUE),
    ('Melão', 'MELAO', 'Melão (Cucumis melo)', TRUE),
    ('Abacaxi', 'ABACAXI', 'Abacaxi (Ananas comosus)', TRUE),
    ('Banana', 'BANANA', 'Banana (Musa sp.)', TRUE),
    ('Maçã', 'MACA', 'Maçã (Malus domestica)', TRUE),
    ('Laranja', 'LARANJA', 'Laranja (Citrus sinensis)', TRUE),
    ('Limão', 'LIMAO', 'Limão (Citrus limon)', TRUE),
    ('Goiaba', 'GOIABA', 'Goiaba (Psidium guajava)', TRUE),
    ('Manga', 'MANGA', 'Manga (Mangifera indica)', TRUE),
    ('Coco', 'COCO', 'Coco (Cocos nucifera)', TRUE),
    ('Dendê', 'DENDE', 'Dendê (Elaeis guineensis)', TRUE),
    ('Alho', 'ALHO', 'Alho (Allium sativum)', TRUE),
    ('Cebola', 'CEBOLA', 'Cebola (Allium cepa)', TRUE),
    ('Tomate', 'TOMATE', 'Tomate (Solanum lycopersicum)', TRUE),
    ('Alface', 'ALFACE', 'Alface (Lactuca sativa)', TRUE),
    ('Brócolis', 'BROCOLIS', 'Brócolis (Brassica oleracea)', TRUE),
    ('Cenoura', 'CENOURA', 'Cenoura (Daucus carota)', TRUE),
    ('Abóbora', 'ABOBORA', 'Abóbora (Cucurbita sp.)', TRUE),
    ('Berinjela', 'BERINJELA', 'Berinjela (Solanum melongena)', TRUE),
    ('Pimenta', 'PIMENTA', 'Pimenta (Capsicum sp.)', TRUE),
    ('Chia', 'CHIA', 'Chia (Salvia hispanica)', TRUE),
    ('Linhaça', 'LINHACA', 'Linhaça (Linum usitatissimum)', TRUE),
    ('Açaí', 'ACAI', 'Açaí (Euterpe oleracea)', TRUE),
    ('Guaraná', 'GUARANA', 'Guaraná (Paullinia cupana)', TRUE),
    ('Cacau', 'CACAU', 'Cacau (Theobroma cacao)', TRUE),
    ('Chá', 'CHA', 'Chá (Camellia sinensis)', TRUE),
    ('Pinhão', 'PINHAO', 'Pinhão (Araucaria angustifolia)', TRUE),
    ('Castanha-do-pará', 'CASTANHA_PARA', 'Castanha-do-pará (Bertholletia excelsa)', TRUE),
    ('Pistache', 'PISTACHE', 'Pistache (Pistacia lentiscus)', TRUE),
    ('Erva-mate', 'ERVMATE', 'Erva-mate (Ilex paraguariensis)', TRUE),
    ('Tabaco', 'TABACO', 'Tabaco (Nicotiana tabacum)', TRUE),
    ('Henequém', 'HENEQUEM', 'Henequém (Agave sisalana)', TRUE),
    ('Juta', 'JUTA', 'Juta (Corchorus capsularis)', TRUE),
    ('Fibra de coco', 'FIBRA_COCO', 'Fibra de coco (Cocos nucifera - fibra)', TRUE)
ON CONFLICT (codigo) DO NOTHING;
