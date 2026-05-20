-- Adiciona campos IBGE para cada grão, permitindo consulta dinâmica ao PAM
ALTER TABLE graos
  ADD COLUMN IF NOT EXISTS ibge_categoria VARCHAR(20),
  ADD COLUMN IF NOT EXISTS ibge_tabela    VARCHAR(10);

-- Café (em grão) Total: tabela 5457 (lavouras temp. e permanentes), classificação 782, categoria 40139
UPDATE graos
SET ibge_categoria = '40139',
    ibge_tabela    = '5457'
WHERE codigo = 'CAFE'
  AND ibge_categoria IS NULL;
