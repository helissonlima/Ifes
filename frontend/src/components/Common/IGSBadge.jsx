import { Chip } from '@mui/material';
import { COR_CLASSIFICACAO, COR_CLASSIFICACAO_TEXTO_SOBRE_FUNDO } from '../../utils/coresICSR';

export default function IGSBadge({ classificacao, igs, size = 'medium' }) {
  if (!classificacao) return null;
  return (
    <Chip
      label={`${classificacao}${igs !== undefined ? ` (${(igs * 100).toFixed(1)}%)` : ''}`}
      size={size}
      sx={{
        bgcolor: COR_CLASSIFICACAO[classificacao] || '#9E9E9E',
        color: COR_CLASSIFICACAO_TEXTO_SOBRE_FUNDO[classificacao] || '#fff',
        fontWeight: 700,
      }}
    />
  );
}
