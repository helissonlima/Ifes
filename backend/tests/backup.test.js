const request = require('supertest');
const { app, pool, limparBanco, criarUsuario, gerarToken } = require('./helpers');

describe('Backup e restauração', () => {
  let admin;
  let tokenAdmin;

  beforeEach(async () => {
    await limparBanco();
    admin = await criarUsuario({ email: 'admin@teste.com', role: 'admin' });
    tokenAdmin = gerarToken(admin.id);
  });

  describe('GET /api/admin/backup', () => {
    it('exporta todas as tabelas com os totais', async () => {
      await pool.query(
        "INSERT INTO propriedades (nome, municipio, estado, proprietario) VALUES ('Sítio A', 'Venda Nova', 'ES', 'João')"
      );

      const res = await request(app)
        .get('/api/admin/backup')
        .set('Authorization', `Bearer ${tokenAdmin}`);

      expect(res.status).toBe(200);
      expect(res.body.formato).toBe('sustentacafe-backup');
      expect(res.body.totais.propriedades).toBe(1);
      expect(res.body.totais.usuarios).toBe(1);
      expect(res.body.dados.propriedades[0].nome).toBe('Sítio A');
    });

    it('nega acesso a quem não é admin', async () => {
      const tecnico = await criarUsuario({ email: 'tecnico@teste.com', role: 'tecnico' });

      const res = await request(app)
        .get('/api/admin/backup')
        .set('Authorization', `Bearer ${gerarToken(tecnico.id)}`);

      expect(res.status).toBe(403);
    });

    it('exige autenticação', async () => {
      const res = await request(app).get('/api/admin/backup');
      expect(res.status).toBe(401);
    });
  });

  describe('POST /api/admin/backup/restaurar', () => {
    it('substitui os dados atuais pelos do backup', async () => {
      await pool.query(
        "INSERT INTO propriedades (nome, municipio, estado, proprietario) VALUES ('Antes do backup', 'Vitória', 'ES', 'Maria')"
      );
      const backup = (await request(app)
        .get('/api/admin/backup')
        .set('Authorization', `Bearer ${tokenAdmin}`)).body;

      // Dado criado DEPOIS do backup: deve desaparecer na restauração.
      await pool.query(
        "INSERT INTO propriedades (nome, municipio, estado, proprietario) VALUES ('Depois do backup', 'Vitória', 'ES', 'José')"
      );

      const res = await request(app)
        .post('/api/admin/backup/restaurar')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send(backup);

      expect(res.status).toBe(200);
      expect(res.body.totais.propriedades).toBe(1);

      const { rows } = await pool.query('SELECT nome FROM propriedades');
      expect(rows).toHaveLength(1);
      expect(rows[0].nome).toBe('Antes do backup');
    });

    it('recusa arquivo que não é um backup do sistema', async () => {
      const res = await request(app)
        .post('/api/admin/backup/restaurar')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({ formato: 'outra-coisa', versao: 1, dados: {} });

      expect(res.status).toBe(400);
      expect(res.body.erro).toMatch(/não é um backup/i);
    });

    it('recusa backup sem nenhum administrador ativo (evita trancar o sistema)', async () => {
      const backup = (await request(app)
        .get('/api/admin/backup')
        .set('Authorization', `Bearer ${tokenAdmin}`)).body;
      backup.dados.usuarios = backup.dados.usuarios.map((u) => ({ ...u, role: 'tecnico' }));

      const res = await request(app)
        .post('/api/admin/backup/restaurar')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send(backup);

      expect(res.status).toBe(400);
      expect(res.body.erro).toMatch(/administrador ativo/i);
    });

    it('não deixa dados pela metade quando o backup é inválido no meio do caminho', async () => {
      const backup = (await request(app)
        .get('/api/admin/backup')
        .set('Authorization', `Bearer ${tokenAdmin}`)).body;
      // Avaliação apontando pra uma propriedade inexistente: viola a FK.
      backup.dados.avaliacoes = [{
        id: '00000000-0000-0000-0000-000000000001',
        propriedade_id: '00000000-0000-0000-0000-0000000000ff',
        data_avaliacao: '2026-01-01',
      }];

      const res = await request(app)
        .post('/api/admin/backup/restaurar')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send(backup);

      expect(res.status).toBe(400);
      // Rollback: o admin original continua no banco.
      const { rows } = await pool.query('SELECT id FROM usuarios WHERE id = $1', [admin.id]);
      expect(rows).toHaveLength(1);
    });

    it('nega restauração a quem não é admin', async () => {
      const tecnico = await criarUsuario({ email: 'tecnico@teste.com', role: 'tecnico' });

      const res = await request(app)
        .post('/api/admin/backup/restaurar')
        .set('Authorization', `Bearer ${gerarToken(tecnico.id)}`)
        .send({ formato: 'sustentacafe-backup', versao: 1, dados: {} });

      expect(res.status).toBe(403);
    });
  });
});
