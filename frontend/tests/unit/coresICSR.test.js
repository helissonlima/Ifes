import { describe, it, expect } from 'vitest';
import {
  COR_NOTA,
  COR_NOTA_TEXTO,
  COR_CLASSIFICACAO,
  COR_CLASSIFICACAO_TEXTO_SOBRE_FUNDO,
  COR_DIMENSAO_TEXTO,
  corTextoDimensao,
  estiloStatus,
} from '../../src/utils/coresICSR';

// Contraste WCAG entre duas cores hex (razão de luminância relativa).
function contraste(hexA, hexB) {
  const lum = (hex) => {
    const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
    const c = [r, g, b].map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
    return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
  };
  const [a, b] = [lum(hexA), lum(hexB)].sort((x, y) => y - x);
  return (a + 0.05) / (b + 0.05);
}

const BRANCO = '#FFFFFF';

describe('tokens de texto sobre fundo branco', () => {
  it('cada nota tem texto legível (≥4.5:1)', () => {
    Object.entries(COR_NOTA_TEXTO).forEach(([nota, cor]) => {
      expect(contraste(cor, BRANCO), `nota ${nota} (${cor})`).toBeGreaterThanOrEqual(4.5);
    });
  });

  it('cada dimensão tem texto legível (≥4.5:1)', () => {
    Object.entries(COR_DIMENSAO_TEXTO).forEach(([dim, cor]) => {
      expect(contraste(cor, BRANCO), `${dim} (${cor})`).toBeGreaterThanOrEqual(4.5);
    });
  });

  it('a cor crua da dimensão não serve como texto — por isso o token existe', () => {
    // #2196F3 (Econômica) sobre branco fica em ~3:1. O token escuro é o que
    // torna o número legível.
    expect(contraste('#2196F3', BRANCO)).toBeLessThan(4.5);
    expect(contraste(COR_DIMENSAO_TEXTO.economica, BRANCO)).toBeGreaterThanOrEqual(4.5);
  });

  it('corTextoDimensao tem fallback para código desconhecido', () => {
    expect(corTextoDimensao('ambiental')).toBe(COR_DIMENSAO_TEXTO.ambiental);
    expect(corTextoDimensao('inexistente')).toBe('#334155');
  });
});

describe('badges de classificação', () => {
  // A Regra do Texto Escuro em Fundo Claro: branco sobre Moderada (#FFC107)
  // dá 1,07:1 e sobre Boa (#8BC34A) dá 2,6:1 — ilegível.
  it('nunca usa texto branco sobre Moderada ou Boa', () => {
    expect(COR_CLASSIFICACAO_TEXTO_SOBRE_FUNDO.Moderada).not.toBe('#fff');
    expect(COR_CLASSIFICACAO_TEXTO_SOBRE_FUNDO.Boa).not.toBe('#fff');
  });

  it('cada banda tem contraste de badge sobre o próprio fundo (≥4.5:1)', () => {
    // Badges são 12px em negrito: não contam como "texto grande", então o
    // piso é 4.5:1 e não 3:1.
    Object.entries(COR_CLASSIFICACAO).forEach(([banda, fundo]) => {
      const texto = COR_CLASSIFICACAO_TEXTO_SOBRE_FUNDO[banda];
      const hex = texto === '#fff' ? '#FFFFFF' : texto;
      expect(contraste(hex, fundo), `${banda}: ${hex} sobre ${fundo}`).toBeGreaterThanOrEqual(4.5);
    });
  });

  it('nenhuma banda usa texto branco sobre a própria cor', () => {
    Object.values(COR_CLASSIFICACAO_TEXTO_SOBRE_FUNDO).forEach((c) => {
      expect(c.toLowerCase()).not.toBe('#fff');
      expect(c.toLowerCase()).not.toBe('#ffffff');
    });
  });

  it('cobre as cinco bandas do ICSR', () => {
    expect(Object.keys(COR_CLASSIFICACAO)).toEqual([
      'Muito Baixa', 'Baixa', 'Moderada', 'Boa', 'Alta',
    ]);
    expect(Object.keys(COR_NOTA).sort()).toEqual(['0', '0.25', '0.5', '0.75', '1'].sort());
  });
});

describe('estiloStatus', () => {
  // A cor da faixa vem do backend para preencher área; usá-la como cor de
  // texto deixava 'BOM' (#8BC34A) ilegível sobre o fundo tintado.
  it('dá par fundo/texto acessível para cada status', () => {
    ['CRÍTICO', 'ATENÇÃO', 'BOM', 'EXCELENTE'].forEach((status) => {
      const { texto, fundo } = estiloStatus(status);
      expect(contraste(texto, fundo), `${status}: ${texto} sobre ${fundo}`).toBeGreaterThanOrEqual(4.5);
    });
  });

  it('usa rótulo em caixa normal, não o grito do backend', () => {
    expect(estiloStatus('CRÍTICO').rotulo).toBe('Crítico');
    expect(estiloStatus('EXCELENTE').rotulo).toBe('Excelente');
  });

  it('tem fallback para status desconhecido', () => {
    const s = estiloStatus('INESPERADO');
    expect(s.rotulo).toBe('INESPERADO');
    expect(contraste(s.texto, s.fundo)).toBeGreaterThanOrEqual(4.5);
  });
});
