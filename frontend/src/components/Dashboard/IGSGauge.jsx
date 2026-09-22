import { RadialBarChart, RadialBar, ResponsiveContainer, PolarAngleAxis } from 'recharts';
import { COR_CLASSIFICACAO, COR_CLASSIFICACAO_TEXTO } from '../../utils/coresICSR';

export default function IGSGauge({ igs, classificacao, size = 200 }) {
  const pct = igs != null ? Math.round(igs * 100) : 0;
  const cor = COR_CLASSIFICACAO[classificacao] || '#9E9E9E';
  const corTexto = COR_CLASSIFICACAO_TEXTO[classificacao] || '#424242';
  const data = [{ value: pct }];

  return (
    <div className="relative mx-auto flex items-center justify-center" style={{ width: size, height: size }}>
      <ResponsiveContainer width={size} height={size}>
        <RadialBarChart
          cx="50%"
          cy="50%"
          innerRadius="60%"
          outerRadius="90%"
          barSize={18}
          data={data}
          startAngle={225}
          endAngle={-45}
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
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center select-none pointer-events-none">
        <span
          className="block text-3xl sm:text-4xl font-black tracking-tight tabular-nums leading-none"
          style={{ color: corTexto }}
        >
          {pct}%
        </span>
        <span className="mt-1 block text-xs font-bold uppercase tracking-wider text-slate-500">
          {classificacao || 'N/D'}
        </span>
      </div>
    </div>
  );
}
