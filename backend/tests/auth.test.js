const request = require('supertest');
const { app, limparBanco, criarUsuario, gerarToken } = require('./helpers');

describe('Autenticação', () => {
  beforeEach(async () => {
    await limparBanco();
  });

  describe('POST /api/auth/login', () => {
    it('autentica com credenciais corretas e retorna token + usuário', async () => {
      await criarUsuario({ email: 'admin@teste.com', senha: 'senha-correta', role: 'admin' });

      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'admin@teste.com', senha: 'senha-correta' });

      expect(res.status).toBe(200);
      expect(res.body.token).toBeTruthy();
      expect(res.body.user.email).toBe('admin@teste.com');
      expect(res.body.user.role).toBe('admin');
      // senha_hash nunca deve vazar na resposta
      expect(res.body.user.senha_hash).toBeUndefined();
    });

    it('recusa senha incorreta com 401', async () => {
      await criarUsuario({ email: 'admin@teste.com', senha: 'senha-correta' });

      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'admin@teste.com', senha: 'senha-errada' });

      expect(res.status).toBe(401);
      expect(res.body.erro).toBe('Credenciais inválidas');
    });

    it('recusa e-mail inexistente com a MESMA mensagem de senha incorreta (evita enumeração de conta)', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'nao-existe@teste.com', senha: 'qualquer-coisa' });

      expect(res.status).toBe(401);
      expect(res.body.erro).toBe('Credenciais inválidas');
    });

    it('recusa usuário inativo mesmo com senha correta', async () => {
      await criarUsuario({ email: 'inativo@teste.com', senha: 'senha-correta', ativo: false });

      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'inativo@teste.com', senha: 'senha-correta' });

      expect(res.status).toBe(401);
    });

    it('rejeita corpo sem e-mail ou senha com 400', async () => {
      const res = await request(app).post('/api/auth/login').send({ email: 'sem-senha@teste.com' });
      expect(res.status).toBe(400);
    });
  });

  describe('Middleware authRequired', () => {
    it('recusa requisição sem header Authorization com 401', async () => {
      const res = await request(app).get('/api/propriedades');
      expect(res.status).toBe(401);
      expect(res.body.erro).toBe('Não autenticado');
    });

    it('recusa token inválido/corrompido com 401', async () => {
      const res = await request(app)
        .get('/api/propriedades')
        .set('Authorization', 'Bearer token-invalido-e-corrompido');
      expect(res.status).toBe(401);
    });

    it('exige autenticação em /api/graos (M10.6 — antes era público)', async () => {
      const res = await request(app).get('/api/graos');
      expect(res.status).toBe(401);
    });

    it('recusa token de usuário que foi desativado depois de emitido (permissão "viva")', async () => {
      const user = await criarUsuario({ email: 'vai-desativar@teste.com', permissions: { propriedades: true } });
      const token = gerarToken(user.id);
      await require('./helpers').pool.query('UPDATE usuarios SET ativo = FALSE WHERE id = $1', [user.id]);

      const res = await request(app)
        .get('/api/propriedades')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(401);
    });
  });

  describe('Permissões (dado um token já válido)', () => {
    it('bloqueia acesso a rota admin-only para técnico com 403', async () => {
      const tecnico = await criarUsuario({ email: 'tecnico@teste.com', role: 'tecnico' });

      const res = await request(app)
        .get('/api/auth/usuarios')
        .set('Authorization', `Bearer ${gerarToken(tecnico.id)}`);

      expect(res.status).toBe(403);
    });

    it('permite acesso a rota admin-only para admin', async () => {
      const admin = await criarUsuario({ email: 'admin2@teste.com', role: 'admin' });

      const res = await request(app)
        .get('/api/auth/usuarios')
        .set('Authorization', `Bearer ${gerarToken(admin.id)}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });

    it('bloqueia recurso sem a permissão específica concedida, mesmo autenticado', async () => {
      const tecnico = await criarUsuario({
        email: 'sem-permissao@teste.com',
        role: 'tecnico',
        permissions: { propriedades: false },
      });

      const res = await request(app)
        .get('/api/propriedades')
        .set('Authorization', `Bearer ${gerarToken(tecnico.id)}`);

      expect(res.status).toBe(403);
    });

    it('permite recurso quando a permissão específica foi concedida', async () => {
      const tecnico = await criarUsuario({
        email: 'com-permissao@teste.com',
        role: 'tecnico',
        permissions: { propriedades: true },
      });

      const res = await request(app)
        .get('/api/propriedades')
        .set('Authorization', `Bearer ${gerarToken(tecnico.id)}`);

      expect(res.status).toBe(200);
    });

    it('admin tem acesso a qualquer permissão mesmo sem ela estar explicitamente concedida', async () => {
      const admin = await criarUsuario({ email: 'admin3@teste.com', role: 'admin', permissions: {} });

      const res = await request(app)
        .get('/api/propriedades')
        .set('Authorization', `Bearer ${gerarToken(admin.id)}`);

      expect(res.status).toBe(200);
    });
  });
});
