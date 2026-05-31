import { Alert, Box, Chip, Typography } from '@mui/material';
import { FiCloudOff, FiCloudRain, FiWifi, FiWifiOff } from 'react-icons/fi';
import { useApp } from '../../context/AppContext';

export default function SystemStatusBanner() {
  const { isOnline, networkRecoveredAt } = useApp();

  if (!isOnline) {
    return (
      <Alert
        severity="warning"
        icon={<FiWifiOff />}
        sx={{ mb: 2, borderRadius: 2, alignItems: 'center' }}
      >
        <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 1 }}>
          <Typography variant="body2" fontWeight={700}>
            Sem conexão com o servidor.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Leituras recentes podem ser servidas do cache local, alterações que dependem do servidor podem falhar.
          </Typography>
          <Chip size="small" icon={<FiCloudOff size={13} />} label="Modo resiliente" variant="outlined" />
        </Box>
      </Alert>
    );
  }

  if (!networkRecoveredAt) return null;

  return (
    <Alert
      severity="success"
      icon={<FiWifi />}
      sx={{ mb: 2, borderRadius: 2, alignItems: 'center' }}
    >
      <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 1 }}>
        <Typography variant="body2" fontWeight={700}>
          Conexão restabelecida.
        </Typography>
        <Typography variant="body2" color="text.secondary">
          O sistema voltou a operar online e as próximas leituras virão do servidor quando disponíveis.
        </Typography>
        <Chip size="small" icon={<FiCloudRain size={13} />} label="Online" color="success" variant="outlined" />
      </Box>
    </Alert>
  );
}