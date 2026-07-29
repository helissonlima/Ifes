import { describe, it, expect } from 'vitest';
import { friendlyError } from '../../src/utils/errorMessages';

describe('friendlyError', () => {
  it('retorna mensagem genérica para erro nulo/indefinido', () => {
    expect(friendlyError(null)).toMatch(/inesperado/i);
    expect(friendlyError(undefined)).toMatch(/inesperado/i);
  });

  it('traduz "Network Error" (erro de rede do axios) para mensagem de conexão', () => {
    expect(friendlyError(new Error('Network Error'))).toMatch(/sem conexão/i);
  });

  it('traduz códigos HTTP conhecidos', () => {
    expect(friendlyError(new Error('Request failed with status code 401'))).toMatch(/sessão expirada/i);
    expect(friendlyError(new Error('Request failed with status code 403'))).toMatch(/permissão/i);
    expect(friendlyError(new Error('Request failed with status code 404'))).toMatch(/não encontrado/i);
    expect(friendlyError(new Error('Request failed with status code 500'))).toMatch(/erro interno/i);
  });

  it('reconhece falha de DNS/conexão recusada mesmo sem estar no mapa fixo', () => {
    expect(friendlyError(new Error('connect ECONNREFUSED 127.0.0.1:3001'))).toMatch(/não foi possível conectar/i);
    expect(friendlyError(new Error('getaddrinfo ENOTFOUND api.exemplo.com'))).toMatch(/não foi possível conectar/i);
  });

  it('contextualiza erros de propriedade e avaliação quando não batem com o mapa fixo', () => {
    expect(friendlyError(new Error('Falha ao salvar propriedade'))).toMatch(/propriedade/i);
    expect(friendlyError(new Error('Falha ao concluir avaliação'))).toMatch(/avaliação/i);
  });

  it('esconde mensagens técnicas muito longas atrás de um texto genérico seguro', () => {
    const mensagemLonga = 'x'.repeat(200);
    const resultado = friendlyError(new Error(mensagemLonga));
    expect(resultado).not.toContain(mensagemLonga);
    expect(resultado).toMatch(/inesperado/i);
  });

  it('repassa mensagens curtas e já amigáveis do backend sem alteração', () => {
    expect(friendlyError(new Error('Já existe um usuário com este e-mail'))).toBe('Já existe um usuário com este e-mail');
  });
});
