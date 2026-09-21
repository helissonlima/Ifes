import Alert from '../ui/Alert';

/**
 * Aviso padrão de "dados exibidos a partir do cache local" — mesma
 * aparência em todo o sistema, mensagem customizável por contexto.
 */
export default function CachedDataBanner({
  mensagem = 'Dados exibidos a partir do cache local. Atualize novamente quando a conexão estabilizar.',
  className,
}) {
  return (
    <Alert variant="info" className={`mb-4 ${className || ''}`}>
      {mensagem}
    </Alert>
  );
}
