import { Box, Typography } from '@mui/material';
import { RadialBarChart, RadialBar, ResponsiveContainer, PolarAngleAxis } from 'recharts';

const COR_MAPA = {
  'Muito Baixa': '#f44336',
  'Baixa': '#FF9800',
  'Moderada': '#FFC107',
  'Boa': '#8BC34A',
  'Alta': '#4CAF50',
};

// Cores de texto acessíveis para cada classificação (mínimo 4.5:1 sobre branco)
const COR_TEXTO_MAPA = {
  'Muito Baixa': '#c62828',
  'Baixa':       '#e65100',
  'Moderada':    '#8B6000',
  'Boa':         '#33691e',
  'Alta':        '#2E7D32',
};

export default function IGSGauge({ igs, classificacao, size = 200 }) {
  const pct = igs != null ? Math.round(igs * 100) : 0;
  const cor = COR_MAPA[classificacao] || '#9E9E9E';
  const corTexto = COR_TEXTO_MAPA[classificacao] || '#424242';
  const data = [{ value: pct }];

  return (
    <Box sx={{ position: 'relative', width: size, height: size, mx: 'auto' }}>
      <ResponsiveContainer width={size} height={size}>
        <RadialBarChart
          cx="50%" cy="50%"
          innerRadius="60%" outerRadius="90%"
          barSize={18}
          data={data}
          startAngle={225} endAngle={-45}
        >
          <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
          <RadialBar
            background={{ fill: '#eee' }}
            dataKey="value"
            angleAxisId={0}
            fill={cor}
            cornerRadius={8}
          />
        </RadialBarChart>
      </ResponsiveContainer>
      <Box
        sx={{
          position: 'absolute', top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          textAlign: 'center',
        }}
      >
        <Typography variant="h4" fontWeight={800} sx={{ lineHeight: 1, color: corTexto }}>
          {pct}%
        </Typography>
        <Typography variant="caption" fontWeight={600} color="text.secondary">
          {classificacao || 'N/D'}
        </Typography>
      </Box>
    </Box>
  );
}
