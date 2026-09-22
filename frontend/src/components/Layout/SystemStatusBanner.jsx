import { FiCloudOff, FiWifiOff } from 'react-icons/fi';
import { useApp } from '../../context/AppContext';
import Alert from '../ui/Alert';
import Badge from '../ui/Badge';

/**
 * Faixa de estado do sistema. Só aparece quando há algo que muda o que o
 * técnico pode fazer agora: estar sem conexão.
 *
 * A volta da conexão é notificada por toast (ver AppContext) — é um evento
 * passageiro e não merece ocupar o topo de todas as telas.
 */
export default function SystemStatusBanner() {
  const { isOnline } = useApp();

  if (isOnline) return null;

  return (
    <Alert variant="warning" icon={<FiWifiOff className="h-5 w-5" />} className="no-print mb-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className="font-semibold text-amber-900">Sem conexão com o servidor.</span>
        <span className="text-amber-800">
          Leituras recentes podem ser servidas do cache local, alterações que dependem do servidor podem falhar.
        </span>
        <Badge variant="warning" size="sm" className="inline-flex items-center gap-1">
          <FiCloudOff size={12} />
          Modo resiliente
        </Badge>
      </div>
    </Alert>
  );
}
