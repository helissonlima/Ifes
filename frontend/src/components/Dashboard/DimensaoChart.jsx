import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { Box, Typography } from '@mui/material';

export default function DimensaoChart({ economica, ambiental, social, gestao }) {
  const data = [
    { dimensao: 'Econômica', valor: Math.round((economica || 0) * 100) },
    { dimensao: 'Ambiental', valor: Math.round((ambiental || 0) * 100) },
    { dimensao: 'Social', valor: Math.round((social || 0) * 100) },
    { dimensao: 'Gestão', valor: Math.round((gestao || 0) * 100) },
  ];

  return (
    <Box sx={{ width: '100%', height: 280 }}>
      <ResponsiveContainer width="100%" height={280}>
        <RadarChart data={data} margin={{ top: 10, right: 30, bottom: 10, left: 30 }}>
          <PolarGrid stroke="#e0e0e0" />
          <PolarAngleAxis
            dataKey="dimensao"
            tick={{ fontSize: 12, fontWeight: 600, fill: '#555' }}
          />
          <Radar
            name="IGS"
            dataKey="valor"
            stroke="#2E7D32"
            fill="#4CAF50"
            fillOpacity={0.35}
            strokeWidth={2}
          />
          <Tooltip
            formatter={(v) => [`${v}%`, 'Índice']}
            contentStyle={{ borderRadius: 8, border: '1px solid #eee' }}
          />
        </RadarChart>
      </ResponsiveContainer>
    </Box>
  );
}
