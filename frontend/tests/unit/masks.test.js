import { describe, it, expect } from 'vitest';
import {
  apenasDigitos, maskTelefone, maskCPF, maskCNPJ, maskCEP, maskUF,
  isEmailValido, erroEmail, maskDecimal,
} from '../../src/utils/masks';

describe('apenasDigitos', () => {
  it('remove tudo que não é dígito', () => {
    expect(apenasDigitos('(27) 99999-9999')).toBe('27999999999');
    expect(apenasDigitos('abc123def456')).toBe('123456');
    expect(apenasDigitos('')).toBe('');
  });
});

describe('maskTelefone', () => {
  it('formata progressivamente enquanto o usuário digita', () => {
    expect(maskTelefone('2')).toBe('(2');
    expect(maskTelefone('27')).toBe('(27');
    expect(maskTelefone('2799')).toBe('(27) 99');
  });

  it('formata como fixo com 10 dígitos', () => {
    expect(maskTelefone('2733334444')).toBe('(27) 3333-4444');
  });

  it('formata como celular com 11 dígitos', () => {
    expect(maskTelefone('27999998888')).toBe('(27) 99999-8888');
  });

  it('trunca em 11 dígitos, ignorando excedente', () => {
    expect(maskTelefone('279999988889999')).toBe('(27) 99999-8888');
  });
});

describe('maskCPF', () => {
  it('formata progressivamente até XXX.XXX.XXX-XX', () => {
    expect(maskCPF('123')).toBe('123');
    expect(maskCPF('123456')).toBe('123.456');
    expect(maskCPF('12345678901')).toBe('123.456.789-01');
  });

  it('trunca em 11 dígitos', () => {
    expect(maskCPF('1234567890199999')).toBe('123.456.789-01');
  });
});

describe('maskCNPJ', () => {
  it('formata como XX.XXX.XXX/XXXX-XX', () => {
    expect(maskCNPJ('12345678000199')).toBe('12.345.678/0001-99');
  });
});

describe('maskCEP', () => {
  it('formata como XXXXX-XXX', () => {
    expect(maskCEP('29500000')).toBe('29500-000');
  });

  it('não insere hífen antes do 6º dígito', () => {
    expect(maskCEP('29500')).toBe('29500');
  });
});

describe('maskUF', () => {
  it('força 2 letras maiúsculas e remove não-letras', () => {
    expect(maskUF('es')).toBe('ES');
    expect(maskUF('e5s')).toBe('ES');
    expect(maskUF('espirito')).toBe('ES');
  });
});

describe('isEmailValido / erroEmail', () => {
  it('aceita string vazia como válida (campo opcional em vários formulários)', () => {
    expect(isEmailValido('')).toBe(true);
    expect(erroEmail('')).toBe('');
  });

  it('aceita e-mail bem formado', () => {
    expect(isEmailValido('tecnico@sustentacafe.com.br')).toBe(true);
  });

  it('rejeita e-mail sem @ ou sem domínio', () => {
    expect(isEmailValido('tecnico-sem-arroba')).toBe(false);
    expect(isEmailValido('tecnico@')).toBe(false);
    expect(erroEmail('tecnico-sem-arroba')).toContain('inválido');
  });
});

describe('maskDecimal', () => {
  it('converte vírgula em ponto', () => {
    expect(maskDecimal('12,5')).toBe('12.5');
  });

  it('remove caracteres não numéricos', () => {
    expect(maskDecimal('12ha5')).toBe('125');
  });

  it('impede um segundo separador decimal', () => {
    expect(maskDecimal('12.5.3')).toBe('12.53');
  });
});
