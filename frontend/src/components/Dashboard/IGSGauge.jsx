import { Box, Typography } from '@mui/material';
import { RadialBarChart, RadialBar, ResponsiveContainer, PolarAngleAxis } from 'recharts';

const COR_MAPA = {
  'Muito Baixa': '#f44336',
  'Baixa': '#FF9800',
  'Moderada': '#FFC107',
  'Boa': '#8BC34A',
  'Alta': '#4CAF50',
};

export default function IGSGauge({ igs, classificacao, size = 200 }) {
  const pct = igs != null ? Math.round(igs * 100) : 0;
  const cor = COR_MAPA[classificacao] || '#9E9E9E';
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
        <Typography variant="h4" fontWeight={800} color={cor} sx={{ lineHeight: 1 }}>
          {pct}%
        </Typography>
        <Typography variant="caption" fontWeight={600} color="text.secondary">
          {classificacao || 'N/D'}
        </Typography>
      </Box>
    </Box>
  );
}
