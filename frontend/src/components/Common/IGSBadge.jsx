import { Chip } from '@mui/material';

const COR_FUNDO = {
  'Muito Baixa': '#f44336',
  'Baixa':       '#FF9800',
  'Moderada':    '#FFC107',
  'Boa':         '#8BC34A',
  'Alta':        '#4CAF50',
};

// Texto escuro para fundos claros (#FFC107, #8BC34A não têm contraste com branco)
const COR_TEXTO = {
  'Muito Baixa': '#fff',
  'Baixa':       '#fff',
  'Moderada':    '#5D4000',
  'Boa':         '#1B3A00',
  'Alta':        '#fff',
};

export default function IGSBadge({ classificacao, igs, size = 'medium' }) {
  if (!classificacao) return null;
  return (
    <Chip
      label={`${classificacao}${igs !== undefined ? ` (${(igs * 100).toFixed(1)}%)` : ''}`}
      size={size}
      sx={{
        bgcolor: COR_FUNDO[classificacao] || '#9E9E9E',
        color: COR_TEXTO[classificacao] || '#fff',
        fontWeight: 700,
      }}
    />
  );
}
