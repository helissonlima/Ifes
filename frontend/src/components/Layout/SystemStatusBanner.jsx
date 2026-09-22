import { FiCloudOff, FiCloudRain, FiWifi, FiWifiOff } from 'react-icons/fi';
import { useApp } from '../../context/AppContext';
import Alert from '../ui/Alert';
import Badge from '../ui/Badge';

export default function SystemStatusBanner() {
  const { isOnline, networkRecoveredAt } = useApp();

  if (!isOnline) {
    return (
      <Alert
        variant="warning"
        icon={<FiWifiOff className="h-5 w-5" />}
        className="no-print mb-4"
      >
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-semibold text-amber-900">
            Sem conexão com o servidor.
          </span>
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

  if (!networkRecoveredAt) return null;

  return (
    <Alert
      variant="success"
      icon={<FiWifi className="h-5 w-5" />}
      className="no-print mb-4"
    >
      <div className="flex flex-wrap items-center gap-2">
        <span className="font-semibold text-emerald-900">
          Conexão restabelecida.
        </span>
        <span className="text-emerald-800">
          O sistema voltou a operar online e as próximas leituras virão do servidor quando disponíveis.
        </span>
        <Badge variant="success" size="sm" className="inline-flex items-center gap-1">
          <FiCloudRain size={12} />
          Online
        </Badge>
      </div>
    </Alert>
  );
}