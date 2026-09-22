import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Dialog from '../../src/components/ui/Dialog';
import ConfirmDialog from '../../src/components/Common/ConfirmDialog';

// Regressão da migração para Radix: o export default era o Root, que ignora
// title/footer/className e renderiza os filhos inline, sem overlay e sem as
// ações. Na prática, o formulário de propriedade aparecia solto no fim da
// página e não havia botão para confirmar exclusão, salvar ou restaurar.
describe('Dialog', () => {
  it('não renderiza nada enquanto está fechado', () => {
    render(
      <Dialog open={false} onOpenChange={() => {}} title="Nova Propriedade">
        <p>Formulário da propriedade</p>
      </Dialog>
    );
    expect(screen.queryByText('Formulário da propriedade')).toBeNull();
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('monta título, corpo e rodapé dentro de um diálogo de verdade', () => {
    render(
      <Dialog
        open
        onOpenChange={() => {}}
        title="Nova Propriedade"
        footer={<button type="button">Cadastrar</button>}
      >
        <p>Formulário da propriedade</p>
      </Dialog>
    );

    const dialog = screen.getByRole('dialog');
    expect(dialog).toBeInTheDocument();
    expect(screen.getByText('Nova Propriedade')).toBeInTheDocument();
    expect(screen.getByText('Formulário da propriedade')).toBeInTheDocument();
    // O botão de ação vive no footer e precisa existir — era exatamente o que
    // sumia, deixando os fluxos sem como concluir.
    expect(screen.getByRole('button', { name: 'Cadastrar' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Fechar' })).toBeInTheDocument();
  });

  it('avisa o chamador ao fechar pelo X', async () => {
    const onOpenChange = vi.fn();
    render(
      <Dialog open onOpenChange={onOpenChange} title="Editar">
        <p>conteúdo</p>
      </Dialog>
    );
    await userEvent.click(screen.getByRole('button', { name: 'Fechar' }));
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('aplica a classe de largura recebida', () => {
    render(
      <Dialog open onOpenChange={() => {}} title="Comparativo" className="max-w-2xl">
        <p>conteúdo</p>
      </Dialog>
    );
    expect(screen.getByRole('dialog').className).toContain('max-w-2xl');
  });
});

describe('ConfirmDialog', () => {
  it('mostra a mensagem e os dois botões de decisão', async () => {
    const onConfirm = vi.fn();
    const onCancel = vi.fn();
    render(
      <ConfirmDialog
        open
        title="Excluir propriedade"
        message={'Excluir "Sítio sonho" e todas as avaliações vinculadas?'}
        confirmLabel="Excluir"
        onConfirm={onConfirm}
        onCancel={onCancel}
      />
    );

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText(/Sítio sonho/)).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Excluir' }));
    expect(onConfirm).toHaveBeenCalledOnce();

    await userEvent.click(screen.getByRole('button', { name: 'Cancelar' }));
    expect(onCancel).toHaveBeenCalledOnce();
  });
});
