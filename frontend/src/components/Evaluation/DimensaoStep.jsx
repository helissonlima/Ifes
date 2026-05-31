import { Box, Typography, LinearProgress, Chip, Alert, Tooltip } from '@mui/material';
import { FiInfo } from 'react-icons/fi';
import IndicadorCard from './IndicadorCard';

export default function DimensaoStep({ dimensao, respostas, observacoes, onChange, onObservacaoChange }) {
  const total = dimensao.indicadores.length;
  const respondidosArr = dimensao.indicadores.filter((ind) => respostas[ind.codigo] !== undefined);
  const respondidos = respondidosArr.length;
  const progresso = (respondidos / total) * 100;
  const somaPesos = respondidosArr.reduce((acc, ind) => acc + (ind.peso || 0), 0);
  const media = respondidosArr.length > 0
    ? somaPesos > 0
      ? respondidosArr.reduce((acc, ind) => acc + respostas[ind.codigo] * (ind.peso || 0), 0) / somaPesos
      : respondidosArr.reduce((acc, ind) => acc + respostas[ind.codigo], 0) / respondidosArr.length
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
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
              <Typography variant="h6" fontWeight={800} color={dimensao.cor}>
                {dimensao.nome}
              </Typography>
              <Tooltip
                title="Atribua notas de 0,00 a 1,00 para cada indicador conforme os critérios descritivos. Valores intermediários (ex: 0,35; 0,60) são permitidos. Registre justificativa na observação para notas extremas."
                placement="right"
                arrow
              >
                <Box component="span" sx={{ color: dimensao.cor, opacity: 0.6, cursor: 'help', display: 'inline-flex' }}>
                  <FiInfo size={14} />
                </Box>
              </Tooltip>
            </Box>
            <Typography variant="caption" color="text.secondary">
              Peso no ICSR: {Math.round(dimensao.peso * 100)}% · {total} indicadores · média ponderada
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
          observacao={observacoes?.[ind.codigo]}
          onChange={(nota) => onChange(ind.codigo, nota, ind.nome, ind.criterios.find(c => c.nota === nota)?.descricao)}
          onObservacaoChange={(texto) => onObservacaoChange?.(ind.codigo, texto)}
          corDimensao={dimensao.cor}
        />
      ))}
    </Box>
  );
}
