-- =====================================================
-- Migração 004: ICSR Versão Revisada — Pesos Ponderados e IGQG
-- Revisão metodológica: referência metodológica regional
-- Adequação aos indicadores internacionais (CSDDD, GRI, ODS)
-- =====================================================
-- Esta migração documenta as alterações metodológicas implementadas
-- no modelo de indicadores (backend/src/models/indicadores.js).
-- Não há alterações estruturais no banco de dados, pois:
--   - O código da dimensão 'gestao_qualidade' é mantido para compatibilidade.
--   - Os dois novos indicadores (IGQG.8 e IGQG.9) são inseridos na mesma
--     dimensão com novos códigos e são registrados normalmente em
--     respostas_indicadores.
--   - Os pesos internos são derivados do modelo JS, não do banco.
--
-- Mudanças implementadas no modelo:
--   1. Dimensão 'Gestão e Qualidade' renomeada para
--      'Gestão, Qualidade e Governança' (IGQG).
--   2. Adicionados 2 novos indicadores:
--      - igqg_transparencia_due_diligence (peso 10%)  → compliance CSDDD/UE
--      - igqg_participacao_stakeholders  (peso  5%)  → FPIC, GRI 2-29, OIT 169
--   3. Adotada média ponderada em TODAS as dimensões (substituindo média simples).
--      Pesos por dimensão:
--        IA: 0.15, 0.15, 0.15, 0.10, 0.12, 0.10, 0.08, 0.08, 0.07
--        IE: 0.15, 0.15, 0.15, 0.15, 0.12, 0.15, 0.13
--        IS: 0.12, 0.18, 0.18, 0.15, 0.12, 0.12, 0.13
--        IGQG: 0.15, 0.15, 0.10, 0.15, 0.10, 0.10, 0.10, 0.10, 0.05
-- =====================================================

-- Atualiza a função SQL de cálculo para referência (o cálculo real é feito em Node.js)
CREATE OR REPLACE FUNCTION calcular_igs(
    p_ie DECIMAL, p_ia DECIMAL, p_is DECIMAL, p_igq DECIMAL
) RETURNS TABLE(igs DECIMAL, classificacao VARCHAR) AS $$
DECLARE
    v_igs DECIMAL;
BEGIN
    -- Fórmula ICSR: cada subíndice já chega como média ponderada interna
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

-- Adiciona comentário na coluna para documentar a mudança
COMMENT ON COLUMN avaliacoes.indice_gestao_qualidade IS
    'Índice de Gestão, Qualidade e Governança (IGQG) — média ponderada de 9 indicadores. '
    'Versão revisada inclui IGQG.8 (Transparência/Due Diligence) e IGQG.9 (Participação de Stakeholders).';
