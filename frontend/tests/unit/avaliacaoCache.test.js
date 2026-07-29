import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  salvarRascunhoLocal, carregarRascunhoLocal, limparRascunhoLocal,
  atualizarSyncPendenteLocal, temRascunhoLocal, formatarDataRascunho,
} from '../../src/utils/avaliacaoCache';

beforeEach(() => {
  localStorage.clear();
});

describe('salvarRascunhoLocal / carregarRascunhoLocal', () => {
  it('salva e recupera o mesmo rascunho, com userId e timestamp preenchidos', () => {
    const salvou = salvarRascunhoLocal('user1', { step: 2, respostas: { amb_x: 1 } });
    expect(salvou).toBe(true);

    const carregado = carregarRascunhoLocal('user1');
    expect(carregado.step).toBe(2);
    expect(carregado.respostas).toEqual({ amb_x: 1 });
    expect(carregado.userId).toBe('user1');
    expect(carregado.timestamp).toBeTruthy();
  });

  it('mantém rascunhos de usuários diferentes isolados entre si', () => {
    salvarRascunhoLocal('user1', { step: 0, respostas: { a: 1 } });
    salvarRascunhoLocal('user2', { step: 3, respostas: { b: 1 } });

    expect(carregarRascunhoLocal('user1').step).toBe(0);
    expect(carregarRascunhoLocal('user2').step).toBe(3);
  });

  it('recusa salvar sem userId', () => {
    expect(salvarRascunhoLocal(null, { step: 0 })).toBe(false);
    expect(salvarRascunhoLocal(undefined, { step: 0 })).toBe(false);
  });

  it('retorna null ao carregar rascunho de usuário sem nada salvo', () => {
    expect(carregarRascunhoLocal('nunca-salvou')).toBeNull();
  });

  it('quando o localStorage estoura a cota, libera o cache de GET (não crítico) e tenta salvar de novo', () => {
    const setItemOriginal = Storage.prototype.setItem;
    let chamadas = 0;
    const spy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(function (chave, valor) {
      chamadas += 1;
      if (chamadas === 1) throw new DOMException('estourou', 'QuotaExceededError');
      return setItemOriginal.call(this, chave, valor);
    });

    const salvou = salvarRascunhoLocal('user1', { step: 1, respostas: {} });

    expect(salvou).toBe(true);
    expect(chamadas).toBe(2); // 1ª tentativa (falhou) + retry (sucesso) após limpar cache de GET
    expect(carregarRascunhoLocal('user1').step).toBe(1);

    spy.mockRestore();
  });

  it('retorna false quando mesmo depois de liberar espaço o salvamento continua falhando', () => {
    const spy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('sempre cheio', 'QuotaExceededError');
    });

    expect(salvarRascunhoLocal('user1', { step: 1, respostas: {} })).toBe(false);

    spy.mockRestore();
  });
});

describe('limparRascunhoLocal', () => {
  it('remove o rascunho do usuário', () => {
    salvarRascunhoLocal('user1', { step: 0, respostas: {} });
    limparRascunhoLocal('user1');
    expect(carregarRascunhoLocal('user1')).toBeNull();
  });
});

describe('atualizarSyncPendenteLocal', () => {
  it('atualiza só o campo syncPendente, preservando o resto do rascunho', () => {
    salvarRascunhoLocal('user1', { step: 3, respostas: { a: 1 }, syncPendente: true });
    const atualizou = atualizarSyncPendenteLocal('user1', false);

    expect(atualizou).toBe(true);
    const carregado = carregarRascunhoLocal('user1');
    expect(carregado.syncPendente).toBe(false);
    expect(carregado.step).toBe(3);
    expect(carregado.respostas).toEqual({ a: 1 });
  });

  it('retorna false quando não existe rascunho para atualizar', () => {
    expect(atualizarSyncPendenteLocal('sem-rascunho', true)).toBe(false);
  });
});

describe('temRascunhoLocal', () => {
  it('false quando não há rascunho salvo', () => {
    expect(temRascunhoLocal('user1')).toBe(false);
  });

  it('false quando o rascunho existe mas está vazio (sem respostas nem propriedade)', () => {
    salvarRascunhoLocal('user1', { step: 0, respostas: {}, info: {} });
    expect(temRascunhoLocal('user1')).toBe(false);
  });

  it('true quando há pelo menos uma resposta preenchida', () => {
    salvarRascunhoLocal('user1', { step: 1, respostas: { amb_x: 1 }, info: {} });
    expect(temRascunhoLocal('user1')).toBe(true);
  });

  it('true quando a propriedade já foi selecionada, mesmo sem respostas', () => {
    salvarRascunhoLocal('user1', { step: 0, respostas: {}, info: { propriedade: { id: 'p1' } } });
    expect(temRascunhoLocal('user1')).toBe(true);
  });
});

describe('formatarDataRascunho', () => {
  it('formata um timestamp ISO no padrão pt-BR (dd/mm/aaaa hh:mm)', () => {
    const formatado = formatarDataRascunho('2026-03-05T14:30:00Z');
    // vírgula antes da hora depende dos dados de ICU do ambiente — não é o
    // que este teste quer travar, só a ordem dd/mm/aaaa e a presença de hh:mm
    expect(formatado).toMatch(/^\d{2}\/\d{2}\/2026,? \d{2}:\d{2}$/);
  });

  it('retorna string vazia para timestamp ausente', () => {
    expect(formatarDataRascunho(null)).toBe('');
    expect(formatarDataRascunho(undefined)).toBe('');
  });

  it('devolve o valor original se não conseguir formatar', () => {
    expect(formatarDataRascunho('nao-e-uma-data')).toBe('nao-e-uma-data');
  });
});
