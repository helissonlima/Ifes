const request = require('supertest');
const { app, limparBanco, criarUsuario, gerarToken } = require('./helpers');

let token;
let propriedadeId;

beforeEach(async () => {
  await limparBanco();
  const admin = await criarUsuario({ email: 'admin@teste.com', role: 'admin' });
  token = gerarToken(admin.id);

  const propriedade = await auth(request(app).post('/api/propriedades')).send({
    nome: 'Fazenda Teste', municipio: 'Venda Nova do Imigrante', proprietario: 'João Silva',
  });
  propriedadeId = propriedade.body.id;
});

function auth(req) {
  return req.set('Authorization', `Bearer ${token}`);
}

// Uma resposta por dimensão: como calcularIndiceDimensao() faz média
// ponderada só dos indicadores RESPONDIDOS, uma única resposta sempre resulta
// no índice da dimensão == a própria nota, independente do peso interno do
// indicador — isso torna o IGS esperado trivial de calcular à mão:
//   igs = nota_eco*0.30 + nota_amb*0.35 + nota_social*0.20 + nota_gq*0.15
// (pesos em models/indicadores.js: calcularIGS)
function respostasCompletas({ eco, amb, social, gq }) {
  return [
    { dimensao: 'economica', indicador_codigo: 'eco_produtividade', nota: eco },
    { dimensao: 'ambiental', indicador_codigo: 'amb_conservacao_solo', nota: amb },
    { dimensao: 'social', indicador_codigo: 'soc_capacitacao', nota: social },
    { dimensao: 'gestao_qualidade', indicador_codigo: 'gq_rastreabilidade', nota: gq },
  ];
}

describe('Avaliações — criação e conclusão', () => {
  it('cria avaliação como rascunho sem respostas', async () => {
    const res = await auth(request(app).post('/api/avaliacoes')).send({ propriedade_id: propriedadeId });
    expect(res.status).toBe(201);
    expect(res.body.status).toBe('rascunho');
    expect(res.body.igs).toBeNull();
  });

  it('rejeita propriedade_id que não é um UUID válido com 400', async () => {
    const res = await auth(request(app).post('/api/avaliacoes')).send({ propriedade_id: 'nao-e-um-uuid' });
    expect(res.status).toBe(400);
  });

  it('salva respostas, conclui a avaliação e calcula o IGS', async () => {
    const criada = await auth(request(app).post('/api/avaliacoes')).send({ propriedade_id: propriedadeId });

    const respostas = respostasCompletas({ eco: 1, amb: 1, social: 1, gq: 1 });
    const salva = await auth(request(app).put(`/api/avaliacoes/${criada.body.id}/respostas`)).send({
      respostas,
      concluir: true,
    });

    expect(salva.status).toBe(200);
    expect(salva.body.status).toBe('concluida');
    expect(Number(salva.body.igs)).toBe(1);
    expect(salva.body.classificacao).toBe('Alta');
  });

  it('mantém status "rascunho" quando concluir não é enviado', async () => {
    const criada = await auth(request(app).post('/api/avaliacoes')).send({ propriedade_id: propriedadeId });
    const salva = await auth(request(app).put(`/api/avaliacoes/${criada.body.id}/respostas`)).send({
      respostas: respostasCompletas({ eco: 0.5, amb: 0.5, social: 0.5, gq: 0.5 }),
    });
    expect(salva.body.status).toBe('rascunho');
  });
});

describe('Avaliações — cálculo do IGS com valores conhecidos (bordas da classificação)', () => {
  // Casos calculados à mão a partir da fórmula real (models/indicadores.js):
  //   igs = eco*0.30 + amb*0.35 + social*0.20 + gq*0.15
  // e da ESCALA_IGS (faixas contínuas, sem gap — corrigido no M2.11):
  //   [0,0.20] Muito Baixa · (0.20,0.40] Baixa · (0.40,0.60] Moderada ·
  //   (0.60,0.80] Boa · (0.80,1.00] Alta — com <= no limite superior de cada
  //   faixa, então o valor EXATO da borda pertence à faixa mais baixa.
  const casos = [
    { nome: 'mínimo absoluto', notas: { eco: 0, amb: 0, social: 0, gq: 0 }, igsEsperado: 0, classificacaoEsperada: 'Muito Baixa' },
    { nome: 'borda exata 0.20', notas: { eco: 0, amb: 0, social: 1, gq: 0 }, igsEsperado: 0.2, classificacaoEsperada: 'Muito Baixa' },
    { nome: 'borda exata 0.40', notas: { eco: 1, amb: 0, social: 0.5, gq: 0 }, igsEsperado: 0.4, classificacaoEsperada: 'Baixa' },
    { nome: 'borda exata 0.60', notas: { eco: 0.5, amb: 0.5, social: 1, gq: 0.5 }, igsEsperado: 0.6, classificacaoEsperada: 'Moderada' },
    { nome: 'borda exata 0.80', notas: { eco: 1, amb: 1, social: 0.75, gq: 0 }, igsEsperado: 0.8, classificacaoEsperada: 'Boa' },
    { nome: 'máximo absoluto', notas: { eco: 1, amb: 1, social: 1, gq: 1 }, igsEsperado: 1, classificacaoEsperada: 'Alta' },
  ];

  for (const caso of casos) {
    it(`${caso.nome}: igs=${caso.igsEsperado} → "${caso.classificacaoEsperada}"`, async () => {
      const res = await auth(request(app).post('/api/avaliacoes')).send({
        propriedade_id: propriedadeId,
        respostas: respostasCompletas(caso.notas),
      });

      expect(res.status).toBe(201);
      expect(Number(res.body.igs)).toBe(caso.igsEsperado);
      expect(res.body.classificacao).toBe(caso.classificacaoEsperada);
      expect(Number(res.body.indice_economico)).toBe(caso.notas.eco);
      expect(Number(res.body.indice_ambiental)).toBe(caso.notas.amb);
      expect(Number(res.body.indice_social)).toBe(caso.notas.social);
      expect(Number(res.body.indice_gestao_qualidade)).toBe(caso.notas.gq);
    });
  }
});

describe('Avaliações — validações de payload (M2)', () => {
  it('rejeita indicador_codigo que não pertence à dimensao informada com 400', async () => {
    const res = await auth(request(app).post('/api/avaliacoes')).send({
      propriedade_id: propriedadeId,
      respostas: [
        // eco_produtividade pertence a "economica", não a "ambiental"
        { dimensao: 'ambiental', indicador_codigo: 'eco_produtividade', nota: 1 },
      ],
    });
    expect(res.status).toBe(400);
  });

  it('rejeita nota fora do conjunto válido {0, 0.25, 0.5, 0.75, 1} com 400', async () => {
    const res = await auth(request(app).post('/api/avaliacoes')).send({
      propriedade_id: propriedadeId,
      respostas: [
        { dimensao: 'economica', indicador_codigo: 'eco_produtividade', nota: 0.33 },
      ],
    });
    expect(res.status).toBe(400);
  });

  it('rejeita dimensao fora do enum válido com 400', async () => {
    const res = await auth(request(app).post('/api/avaliacoes')).send({
      propriedade_id: propriedadeId,
      respostas: [
        { dimensao: 'financeira', indicador_codigo: 'eco_produtividade', nota: 1 },
      ],
    });
    expect(res.status).toBe(400);
  });

  it('rejeita indicador_codigo inexistente com 400', async () => {
    const res = await auth(request(app).post('/api/avaliacoes')).send({
      propriedade_id: propriedadeId,
      respostas: [
        { dimensao: 'economica', indicador_codigo: 'codigo_que_nao_existe', nota: 1 },
      ],
    });
    expect(res.status).toBe(400);
  });
});
