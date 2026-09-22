import { describe, it, expect } from 'vitest';
import { formatarData, formatarDataCurta, hojeISO } from '../../src/utils/formatarData';
import {
  formatarNumero,
  formatarPercentual,
  formatarPercentualDireto,
  formatarArea,
  pluralizar,
} from '../../src/utils/formatarNumero';

describe('formatarData', () => {
  // Regressão: a API entrega 'YYYY-MM-DD'. new Date('2026-07-01') é meia-noite
  // UTC, que em UTC-3 vira 30/06 — toda data de avaliação aparecia um dia
  // antes. O dia civil tem de ser montado no fuso local.
  it('não desloca o dia ao formatar uma data pura (bug de fuso)', () => {
    expect(formatarData('2026-07-01')).toBe('01/07/2026');
    expect(formatarData('2026-01-01')).toBe('01/01/2026');
    expect(formatarData('2026-12-31')).toBe('31/12/2026');
  });

  it('formata data curta sem deslocar o dia', () => {
    expect(formatarDataCurta('2026-03-05')).toMatch(/^05 de mar\.? de 26$|^05 mar\.? 26$/);
  });

  it('devolve travessão para valor ausente ou inválido', () => {
    expect(formatarData(null)).toBe('—');
    expect(formatarData('')).toBe('—');
    expect(formatarData('não é data')).toBe('—');
  });

  it('aceita instante ISO completo', () => {
    const d = new Date(2026, 6, 1, 15, 30);
    expect(formatarData(d.toISOString())).toBe('01/07/2026');
  });
});

describe('hojeISO', () => {
  // Regressão: usava toISOString(), que é UTC — depois das 21h no Brasil o
  // campo de data já vinha preenchido com o dia seguinte.
  it('devolve o dia local em YYYY-MM-DD', () => {
    const agora = new Date();
    const esperado = [
      agora.getFullYear(),
      String(agora.getMonth() + 1).padStart(2, '0'),
      String(agora.getDate()).padStart(2, '0'),
    ].join('-');
    expect(hojeISO()).toBe(esperado);
  });

  it('é aceito de volta por formatarData sem deslocar o dia', () => {
    const hoje = new Date();
    expect(formatarData(hojeISO())).toBe(hoje.toLocaleDateString('pt-BR'));
  });
});

describe('formatação numérica pt-BR', () => {
  it('usa vírgula como separador decimal', () => {
    expect(formatarNumero(57.9)).toBe('57,9');
    expect(formatarNumero(23.75, 2)).toBe('23,75');
    expect(formatarNumero(0)).toBe('0,0');
  });

  it('converte fração em percentual', () => {
    expect(formatarPercentual(0.579)).toBe('57,9%');
    expect(formatarPercentual(1)).toBe('100,0%');
    expect(formatarPercentual(0.25, 0)).toBe('25%');
  });

  it('formata percentual já em escala 0-100', () => {
    expect(formatarPercentualDireto(57.9)).toBe('57,9%');
  });

  it('trata área vazia e zero do mesmo jeito', () => {
    // Antes a lista mostrava "0.00 ha" numa coluna e "—" em outra para o
    // mesmo caso de área não informada.
    expect(formatarArea(0)).toBe('—');
    expect(formatarArea(null)).toBe('—');
    expect(formatarArea(undefined)).toBe('—');
    expect(formatarArea('')).toBe('—');
    expect(formatarArea(4.8)).toBe('4,80 ha');
  });

  it('aceita número vindo como string (NUMERIC do Postgres)', () => {
    expect(formatarPercentual('0.579')).toBe('57,9%');
    expect(formatarArea('10.00')).toBe('10,00 ha');
  });

  it('pluraliza de verdade', () => {
    expect(pluralizar(1, 'avaliação', 'avaliações')).toBe('1 avaliação');
    expect(pluralizar(0, 'avaliação', 'avaliações')).toBe('0 avaliações');
    expect(pluralizar(17, 'propriedade', 'propriedades')).toBe('17 propriedades');
  });

  it('devolve travessão para valor não numérico', () => {
    expect(formatarNumero('abc')).toBe('—');
    expect(formatarPercentual(undefined)).toBe('—');
  });
});
