import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import IndicadorCard from '../../src/components/Evaluation/IndicadorCard';

const indicador = {
  nome: 'Conservação do Solo',
  criterio: 'Uso de curvas de nível, cobertura e manejo conservacionista',
  peso: 0.15,
  evidencia_esperada: 'Visual: erosão, curvas de nível, cobertura vegetal',
  criterios: [
    { nota: 0, descricao: 'Ausência total; solo exposto em toda a área produtiva' },
    { nota: 0.25, descricao: 'Práticas insuficientes; curvas em menos de 30% da área' },
    { nota: 0.5, descricao: 'Conservação parcial; curvas em 30-60% da área' },
    { nota: 0.75, descricao: 'Boas práticas; curvas em mais de 60%' },
    { nota: 1, descricao: 'Sistema consolidado; 3+ práticas integradas' },
  ],
};

function renderCard(props = {}) {
  const onChange = vi.fn();
  const onObservacaoChange = vi.fn();
  const utils = render(
    <IndicadorCard
      indicador={indicador}
      nota={undefined}
      observacao=""
      onChange={onChange}
      onObservacaoChange={onObservacaoChange}
      corDimensao="#4CAF50"
      {...props}
    />
  );
  return { ...utils, onChange, onObservacaoChange };
}

describe('IndicadorCard', () => {
  it('renderiza nome, critério e as 5 opções de nota como um radiogroup acessível', () => {
    renderCard();
    expect(screen.getByText('Conservação do Solo')).toBeInTheDocument();
    expect(screen.getByRole('radiogroup', { name: /nota para conservação do solo/i })).toBeInTheDocument();
    expect(screen.getAllByRole('radio')).toHaveLength(5);
  });

  it('nenhuma opção marcada como aria-checked quando nota ainda não foi respondida', () => {
    renderCard();
    for (const radio of screen.getAllByRole('radio')) {
      expect(radio).toHaveAttribute('aria-checked', 'false');
    }
  });

  it('marca a opção correspondente como aria-checked quando nota já foi respondida', () => {
    renderCard({ nota: 0.75 });
    const radios = screen.getAllByRole('radio');
    expect(radios[3]).toHaveAttribute('aria-checked', 'true'); // índice 3 = nota 0.75
    expect(radios[0]).toHaveAttribute('aria-checked', 'false');
  });

  it('clicar numa opção chama onChange com a nota correspondente', async () => {
    const user = userEvent.setup();
    const { onChange } = renderCard();

    await user.click(screen.getByText(/Sistema consolidado/i));

    expect(onChange).toHaveBeenCalledWith(1);
  });

  it('roving tabindex: só a primeira opção é focável via Tab quando nada foi selecionado', () => {
    renderCard();
    const radios = screen.getAllByRole('radio');
    expect(radios[0]).toHaveAttribute('tabindex', '0');
    for (const radio of radios.slice(1)) {
      expect(radio).toHaveAttribute('tabindex', '-1');
    }
  });

  it('roving tabindex: a opção selecionada passa a ser a única focável', () => {
    renderCard({ nota: 0.5 });
    const radios = screen.getAllByRole('radio');
    expect(radios[2]).toHaveAttribute('tabindex', '0'); // índice 2 = nota 0.5
    expect(radios[0]).toHaveAttribute('tabindex', '-1');
  });

  it('seta para baixo move o foco e seleciona a próxima opção (navegação por teclado do M6)', async () => {
    const user = userEvent.setup();
    const { onChange } = renderCard({ nota: 0 });

    const radios = screen.getAllByRole('radio');
    radios[0].focus();
    await user.keyboard('{ArrowDown}');

    expect(onChange).toHaveBeenCalledWith(0.25);
  });

  it('seta para cima na primeira opção não seleciona nada fora do intervalo válido', async () => {
    const user = userEvent.setup();
    const { onChange } = renderCard({ nota: 0 });

    const radios = screen.getAllByRole('radio');
    radios[0].focus();
    await user.keyboard('{ArrowUp}');

    expect(onChange).not.toHaveBeenCalled();
  });

  it('Enter e Espaço confirmam a opção focada', async () => {
    const user = userEvent.setup();
    const { onChange } = renderCard();

    const radios = screen.getAllByRole('radio');
    radios[2].focus();
    await user.keyboard('{Enter}');

    expect(onChange).toHaveBeenCalledWith(0.5);
  });

  it('campo de observação fica oculto até o usuário clicar em "Observação" e chama onObservacaoChange ao digitar', async () => {
    const user = userEvent.setup();
    const { onObservacaoChange } = renderCard();

    expect(screen.queryByPlaceholderText(/justificativa da nota/i)).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /observação/i }));
    const campo = screen.getByPlaceholderText(/justificativa da nota/i);
    await user.type(campo, 'X');

    expect(onObservacaoChange).toHaveBeenCalledWith('X');
  });

  it('mostra a evidência esperada quando informada', () => {
    renderCard();
    expect(screen.getByText(/evidência:/i)).toBeInTheDocument();
  });
});
