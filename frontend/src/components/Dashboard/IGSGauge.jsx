import { Box, Typography } from '@mui/material';
import { RadialBarChart, RadialBar, ResponsiveContainer, PolarAngleAxis } from 'recharts';
import { COR_CLASSIFICACAO, COR_CLASSIFICACAO_TEXTO } from '../../utils/coresICSR';

export default function IGSGauge({ igs, classificacao, size = 200 }) {
  const pct = igs != null ? Math.round(igs * 100) : 0;
  const cor = COR_CLASSIFICACAO[classificacao] || '#9E9E9E';
  const corTexto = COR_CLASSIFICACAO_TEXTO[classificacao] || '#424242';
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
            background={{ fill: '#F1F5F9' }}
            dataKey="value"
            angleAxisId={0}
            fill={cor}
            cornerRadius={6}
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
        <Typography
          variant="h4"
          sx={{
            fontWeight: 800,
            lineHeight: 1,
            color: corTexto,
            letterSpacing: '-0.03em',
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          {pct}%
        </Typography>
        <Typography
          variant="caption"
          sx={{
            fontWeight: 700,
            color: '#64748B',
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
            fontSize: '0.68rem',
            mt: 0.5,
            display: 'block',
          }}
        >
          {classificacao || 'N/D'}
        </Typography>
      </Box>
    </Box>
  );
}
