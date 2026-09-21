import Dialog from '../ui/Dialog';
import Button from '../ui/Button';
import Alert from '../ui/Alert';

/**
 * Dialog de confirmação padrão do sistema (substitui window.confirm).
 * severity: 'error' (ação destrutiva, ex.: excluir) ou 'warning' (aviso, ex.: prosseguir com pendências).
 */
export default function ConfirmDialog({
  open,
  title,
  message,
  warning,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  onConfirm,
  onCancel,
  loading = false,
  severity = 'error',
}) {
  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen && !loading) onCancel();
      }}
      title={title}
      className="max-w-md"
      footer={
        <div className="flex w-full items-center justify-end gap-3 pt-2">
          <Button
            variant="secondary"
            onClick={onCancel}
            disabled={loading}
          >
            {cancelLabel}
          </Button>
          <Button
            variant={severity === 'error' ? 'danger' : 'primary'}
            onClick={onConfirm}
            loading={loading}
            disabled={loading}
          >
            {confirmLabel}
          </Button>
        </div>
      }
    >
      <div className="space-y-3 py-1">
        <p className="text-sm text-slate-600 leading-relaxed">{message}</p>
        {warning && (
          <Alert variant="warning" className="text-xs">
            {warning}
          </Alert>
        )}
      </div>
    </Dialog>
  );
}
