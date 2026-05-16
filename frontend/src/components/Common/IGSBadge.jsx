import { Chip } from '@mui/material';

const COR_MAPA = {
  'Muito Baixa': '#f44336',
  'Baixa': '#FF9800',
  'Moderada': '#FFC107',
  'Boa': '#8BC34A',
  'Alta': '#4CAF50',
};

export default function IGSBadge({ classificacao, igs, size = 'medium' }) {
  if (!classificacao) return null;
  return (
    <Chip
      label={`${classificacao}${igs !== undefined ? ` (${(igs * 100).toFixed(1)}%)` : ''}`}
      size={size}
      sx={{
        bgcolor: COR_MAPA[classificacao] || '#9E9E9E',
        color: '#fff',
        fontWeight: 700,
      }}
    />
  );
}
