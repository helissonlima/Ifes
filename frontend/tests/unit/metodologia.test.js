import { describe, it, expect } from 'vitest';
import { getClassificacao, calcularIndiceDimensao, calcularIGS, montarDimInfo } from '../../src/utils/metodologia';

const ESCALA = [
  { min: 0, max: 0.2, classificacao: 'Muito Baixa' },
  { min: 0.2, max: 0.4, classificacao: 'Baixa' },
  { min: 0.4, max: 0.6, classificacao: 'Moderada' },
  { min: 0.6, max: 0.8, classificacao: 'Boa' },
  { min: 0.8, max: 1, classificacao: 'Alta' },
];

describe('getClassificacao', () => {
  it('retorna null sem igs ou sem escala carregada (estado transitório de loading)', () => {
    expect(getClassificacao(null, ESCALA)).toBeNull();
    expect(getClassificacao(undefined, ESCALA)).toBeNull();
    expect(getClassificacao(0.5, null)).toBeNull();
    expect(getClassificacao(0.5, [])).toBeNull();
  });

  it('classifica corretamente um valor no meio de cada faixa', () => {
    expect(getClassificacao(0.1, ESCALA)).toBe('Muito Baixa');
    expect(getClassificacao(0.3, ESCALA)).toBe('Baixa');
    expect(getClassificacao(0.5, ESCALA)).toBe('Moderada');
    expect(getClassificacao(0.7, ESCALA)).toBe('Boa');
    expect(getClassificacao(0.9, ESCALA)).toBe('Alta');
  });

  it('nas bordas exatas, o valor pertence à faixa mais baixa (limite superior inclusivo)', () => {
    expect(getClassificacao(0.2, ESCALA)).toBe('Muito Baixa');
    expect(getClassificacao(0.4, ESCALA)).toBe('Baixa');
    expect(getClassificacao(0.6, ESCALA)).toBe('Moderada');
    expect(getClassificacao(0.8, ESCALA)).toBe('Boa');
  });

  it('no valor máximo da escala, cai na última faixa', () => {
    expect(getClassificacao(1, ESCALA)).toBe('Alta');
  });
});

describe('calcularIndiceDimensao', () => {
  const indicadores = [
    { codigo: 'a', peso: 0.5 },
    { codigo: 'b', peso: 0.3 },
    { codigo: 'c', peso: 0.2 },
  ];

  it('retorna null quando nenhum indicador da dimensão foi respondido', () => {
    expect(calcularIndiceDimensao(indicadores, {})).toBeNull();
    expect(calcularIndiceDimensao(indicadores, { outroIndicador: 1 })).toBeNull();
  });

  it('com um único indicador respondido, o índice é exatamente a nota dele', () => {
    expect(calcularIndiceDimensao(indicadores, { a: 0.75 })).toBe(0.75);
  });

  it('calcula média ponderada pelos pesos internos dos indicadores respondidos', () => {
    // a(peso .5)=1, b(peso .3)=0 → (1*.5 + 0*.3) / (.5+.3) = .5/.8 = 0.625
    expect(calcularIndiceDimensao(indicadores, { a: 1, b: 0 })).toBeCloseTo(0.625, 10);
  });

  it('considera só os indicadores efetivamente respondidos no denominador (peso parcial)', () => {
    // só "c" (peso .2) respondido, com nota 1 → soma_ponderada/soma_pesos = (1*.2)/.2 = 1
    expect(calcularIndiceDimensao(indicadores, { c: 1 })).toBe(1);
  });
});

describe('calcularIGS', () => {
  const metodologia = {
    dimensoes: [
      { codigo: 'economica', peso: 0.30 },
      { codigo: 'ambiental', peso: 0.35 },
      { codigo: 'social', peso: 0.20 },
      { codigo: 'gestao_qualidade', peso: 0.15 },
    ],
  };

  it('retorna 0 sem metodologia carregada', () => {
    expect(calcularIGS({}, null)).toBe(0);
    expect(calcularIGS({}, {})).toBe(0);
  });

  it('trata dimensão sem índice calculado ainda (null) como 0 na combinação', () => {
    const indices = { economica: 1, ambiental: null, social: null, gestao_qualidade: null };
    expect(calcularIGS(indices, metodologia)).toBeCloseTo(0.30, 10);
  });

  it('combina os 4 índices pelos pesos da metodologia (mesma fórmula do backend)', () => {
    const indices = { economica: 1, ambiental: 1, social: 1, gestao_qualidade: 1 };
    expect(calcularIGS(indices, metodologia)).toBeCloseTo(1, 10);
  });

  it('bate com um valor de borda conhecido (0.60) usado também nos testes de backend', () => {
    const indices = { economica: 0.5, ambiental: 0.5, social: 1, gestao_qualidade: 0.5 };
    expect(calcularIGS(indices, metodologia)).toBeCloseTo(0.6, 10);
  });
});

describe('montarDimInfo', () => {
  it('converte a lista de dimensões da API num mapa por código, com percentual arredondado', () => {
    const metodologia = {
      dimensoes: [
        { codigo: 'ambiental', nome: 'Ambiental', peso: 0.35, cor: '#4CAF50' },
        { codigo: 'economica', nome: 'Econômica', peso: 0.30, cor: '#2196F3' },
      ],
    };

    const info = montarDimInfo(metodologia);

    expect(Object.keys(info)).toEqual(['ambiental', 'economica']);
    expect(info.ambiental).toEqual({
      codigo: 'ambiental', nome: 'Ambiental', cor: '#4CAF50', peso: 0.35, pesoPercentual: 35,
    });
    expect(info.economica.pesoPercentual).toBe(30);
  });
});
