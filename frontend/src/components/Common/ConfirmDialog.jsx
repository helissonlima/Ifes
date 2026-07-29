import { Dialog, DialogTitle, DialogContent, DialogActions, Typography, Button, Alert, CircularProgress } from '@mui/material';

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
    <Dialog open={open} onClose={onCancel} fullWidth maxWidth="xs">
      <DialogTitle fontWeight={700} color={severity === 'error' ? 'error' : undefined}>
        {title}
      </DialogTitle>
      <DialogContent dividers>
        <Typography variant="body2">{message}</Typography>
        {warning && <Alert severity="warning" sx={{ mt: 2 }}>{warning}</Alert>}
      </DialogContent>
      <DialogActions sx={{ p: 2, gap: 1 }}>
        <Button autoFocus onClick={onCancel} disabled={loading}>{cancelLabel}</Button>
        <Button variant="contained" color={severity} onClick={onConfirm} disabled={loading}>
          {loading ? <CircularProgress size={20} /> : confirmLabel}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
