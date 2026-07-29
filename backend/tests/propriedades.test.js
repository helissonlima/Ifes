const request = require('supertest');
const { app, limparBanco, criarUsuario, gerarToken } = require('./helpers');

let token;

beforeEach(async () => {
  await limparBanco();
  const admin = await criarUsuario({ email: 'admin@teste.com', role: 'admin' });
  token = gerarToken(admin.id);
});

const auth = (req) => req.set('Authorization', `Bearer ${token}`);

describe('Propriedades — CRUD', () => {
  it('cria propriedade com campos obrigatórios e aplica estado padrão ES quando omitido', async () => {
    const res = await auth(request(app).post('/api/propriedades')).send({
      nome: 'Fazenda Teste',
      municipio: 'Venda Nova do Imigrante',
      proprietario: 'João Silva',
    });

    expect(res.status).toBe(201);
    expect(res.body.id).toBeTruthy();
    expect(res.body.nome).toBe('Fazenda Teste');
    expect(res.body.estado).toBe('ES');
    expect(res.body.graos).toEqual([]);
  });

  it('rejeita criação sem nome com 400', async () => {
    const res = await auth(request(app).post('/api/propriedades')).send({
      municipio: 'Venda Nova do Imigrante',
      proprietario: 'João Silva',
    });
    expect(res.status).toBe(400);
  });

  it('rejeita UF com mais de 2 letras com 400', async () => {
    const res = await auth(request(app).post('/api/propriedades')).send({
      nome: 'Fazenda Teste', municipio: 'X', proprietario: 'Y', estado: 'ESP',
    });
    expect(res.status).toBe(400);
  });

  it('lista propriedades cadastradas com total correto', async () => {
    await auth(request(app).post('/api/propriedades')).send({ nome: 'A', municipio: 'M', proprietario: 'P' });
    await auth(request(app).post('/api/propriedades')).send({ nome: 'B', municipio: 'M', proprietario: 'P' });

    const res = await auth(request(app).get('/api/propriedades'));

    expect(res.status).toBe(200);
    expect(res.body.total).toBe(2);
    expect(res.body.data).toHaveLength(2);
  });

  it('busca por id retorna 404 para propriedade inexistente', async () => {
    const res = await auth(request(app).get('/api/propriedades/00000000-0000-0000-0000-000000000000'));
    expect(res.status).toBe(404);
  });

  it('atualização parcial mantém campos omitidos em vez de zerá-los (merge, não substituição total)', async () => {
    const criada = await auth(request(app).post('/api/propriedades')).send({
      nome: 'Fazenda Original',
      municipio: 'Venda Nova do Imigrante',
      proprietario: 'João Silva',
      area_total: 50,
      telefone: '27999999999',
    });

    // Só envia "nome" — município, proprietário, área e telefone são omitidos
    const atualizada = await auth(request(app).put(`/api/propriedades/${criada.body.id}`)).send({
      nome: 'Fazenda Renomeada',
    });

    expect(atualizada.status).toBe(200);
    expect(atualizada.body.nome).toBe('Fazenda Renomeada');
    expect(atualizada.body.municipio).toBe('Venda Nova do Imigrante');
    expect(atualizada.body.proprietario).toBe('João Silva');
    expect(Number(atualizada.body.area_total)).toBe(50);
    expect(atualizada.body.telefone).toBe('27999999999');
  });

  it('atualização retorna 404 para propriedade inexistente', async () => {
    const res = await auth(request(app).put('/api/propriedades/00000000-0000-0000-0000-000000000000')).send({
      nome: 'X',
    });
    expect(res.status).toBe(404);
  });

  it('exclui propriedade e passa a retornar 404 nas buscas seguintes', async () => {
    const criada = await auth(request(app).post('/api/propriedades')).send({
      nome: 'Fazenda a Excluir', municipio: 'M', proprietario: 'P',
    });

    const exclusao = await auth(request(app).delete(`/api/propriedades/${criada.body.id}`));
    expect(exclusao.status).toBe(200);

    const busca = await auth(request(app).get(`/api/propriedades/${criada.body.id}`));
    expect(busca.status).toBe(404);
  });
});
