import { Box, Typography, LinearProgress, Chip, Alert } from '@mui/material';
import IndicadorCard from './IndicadorCard';

export default function DimensaoStep({ dimensao, respostas, onChange }) {
  const total = dimensao.indicadores.length;
  const respondidos = dimensao.indicadores.filter((ind) => respostas[ind.codigo] !== undefined).length;
  const progresso = (respondidos / total) * 100;

  const media = respondidos > 0
    ? dimensao.indicadores
        .filter((ind) => respostas[ind.codigo] !== undefined)
        .reduce((acc, ind) => acc + respostas[ind.codigo], 0) / respondidos
    : null;

  return (
    <Box>
      {/* Cabeçalho da dimensão */}
      <Box
        sx={{
          p: 2, mb: 2, borderRadius: 2,
          background: `linear-gradient(135deg, ${dimensao.cor}22 0%, ${dimensao.cor}11 100%)`,
          border: `1px solid ${dimensao.cor}44`,
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Box>
            <Typography variant="h6" fontWeight={800} color={dimensao.cor}>
              {dimensao.nome}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Peso no IGS: {Math.round(dimensao.peso * 100)}% · {total} indicadores
            </Typography>
          </Box>
          <Box sx={{ textAlign: 'right' }}>
            <Chip
              label={`${respondidos}/${total}`}
              size="small"
              sx={{ bgcolor: dimensao.cor, color: '#fff', fontWeight: 700, mb: 0.5 }}
            />
            {media !== null && (
              <Typography variant="caption" color="text.secondary" display="block">
                Índice parcial: {(media * 100).toFixed(0)}%
              </Typography>
            )}
          </Box>
        </Box>
        <LinearProgress
          variant="determinate"
          value={progresso}
          sx={{
            height: 6, borderRadius: 3,
            bgcolor: `${dimensao.cor}22`,
            '& .MuiLinearProgress-bar': { bgcolor: dimensao.cor },
          }}
        />
      </Box>

      {respondidos < total && (
        <Alert severity="info" sx={{ mb: 2 }}>
          Avalie todos os {total} indicadores para calcular o índice desta dimensão.
        </Alert>
      )}

      {/* Lista de indicadores */}
      {dimensao.indicadores.map((ind) => (
        <IndicadorCard
          key={ind.codigo}
          indicador={ind}
          nota={respostas[ind.codigo]}
          onChange={(nota) => onChange(ind.codigo, nota, ind.nome, ind.criterios.find(c => c.nota === nota)?.descricao)}
          corDimensao={dimensao.cor}
        />
      ))}
    </Box>
  );
}
