import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, Tooltip } from 'recharts';

export default function DimensaoChart({ economica, ambiental, social, gestao }) {
  const data = [
    { dimensao: 'Econômica', valor: Math.round((economica || 0) * 100) },
    { dimensao: 'Ambiental', valor: Math.round((ambiental || 0) * 100) },
    { dimensao: 'Social', valor: Math.round((social || 0) * 100) },
    { dimensao: 'Gestão', valor: Math.round((gestao || 0) * 100) },
  ];

  return (
    <div className="w-full h-72">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={data} margin={{ top: 10, right: 30, bottom: 10, left: 30 }}>
          <PolarGrid stroke="#e2e8f0" />
          <PolarAngleAxis
            dataKey="dimensao"
            tick={{ fontSize: 12, fontWeight: 600, fill: '#475569' }}
          />
          <Radar
            name="ICSR"
            dataKey="valor"
            stroke="#1B4D24"
            fill="#2E7D32"
            fillOpacity={0.3}
            strokeWidth={2}
          />
          <Tooltip
            formatter={(v) => [`${v}%`, 'Índice']}
            contentStyle={{
              backgroundColor: '#ffffff',
              borderRadius: '0.5rem',
              border: '1px solid #e2e8f0',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              fontSize: '0.85rem',
            }}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
