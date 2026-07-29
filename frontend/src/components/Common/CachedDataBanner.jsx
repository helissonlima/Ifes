import { Alert } from '@mui/material';

/**
 * Aviso padrão de "dados exibidos a partir do cache local" — mesma
 * aparência em todo o sistema, mensagem customizável por contexto.
 */
export default function CachedDataBanner({
  mensagem = 'Dados exibidos a partir do cache local. Atualize novamente quando a conexão estabilizar.',
  sx,
}) {
  return (
    <Alert severity="info" sx={{ mb: 2, ...sx }}>
      {mensagem}
    </Alert>
  );
}
