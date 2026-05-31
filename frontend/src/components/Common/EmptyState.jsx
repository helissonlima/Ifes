import { Box, Typography, Button } from '@mui/material';

/**
 * Componente padrão de empty state para todo o sistema.
 * Uso consistente em todas as páginas.
 */
export default function EmptyState({ icon, title, description, actionLabel, onAction, small = false }) {
  return (
    <Box sx={{
      textAlign: 'center',
      py: small ? 3 : 6,
      px: 2,
      color: 'text.disabled',
    }}>
      {icon && (
        <Box sx={{ mb: 1.5, opacity: 0.5, fontSize: small ? '2rem' : '3rem' }}>
          {icon}
        </Box>
      )}
      <Typography
        variant={small ? 'body2' : 'subtitle1'}
        fontWeight={700}
        color="text.secondary"
        gutterBottom
      >
        {title}
      </Typography>
      {description && (
        <Typography variant="body2" color="text.disabled" sx={{ maxWidth: 380, mx: 'auto', mb: actionLabel ? 2 : 0 }}>
          {description}
        </Typography>
      )}
      {actionLabel && onAction && (
        <Button variant="contained" size="small" onClick={onAction} sx={{ mt: 1 }}>
          {actionLabel}
        </Button>
      )}
    </Box>
  );
}
