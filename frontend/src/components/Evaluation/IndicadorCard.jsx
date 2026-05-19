import { useState } from 'react';
import {
  Card, CardContent, Typography, Box, Collapse, TextField, Button, Chip,
} from '@mui/material';
import { FiCheckSquare, FiEdit3, FiChevronDown, FiChevronUp, FiCheck } from 'react-icons/fi';

const LABEL_NOTA = { 0: '0,00', 0.25: '0,25', 0.5: '0,50', 0.75: '0,75', 1: '1,00' };
const COR_NOTA = {
  0: '#f44336', 0.25: '#FF9800', 0.5: '#FFC107', 0.75: '#8BC34A', 1: '#4CAF50',
};
const NIVEL = {
  0: 'Crítico', 0.25: 'Insuficiente', 0.5: 'Regular', 0.75: 'Bom', 1: 'Excelente',
};

export default function IndicadorCard({ indicador, nota, observacao, onChange, onObservacaoChange, corDimensao }) {
  const [obsExpanded, setObsExpanded] = useState(false);

  return (
    <Card
      sx={{
        mb: 2,
        border: nota !== undefined ? `2px solid ${COR_NOTA[nota]}55` : '2px solid transparent',
        transition: 'border-color 0.2s',
      }}
    >
      <CardContent sx={{ pb: '12px !important' }}>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, mb: 1.5 }}>
          <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: corDimensao, mt: 0.8, flexShrink: 0 }} />
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="subtitle2" fontWeight={700}>{indicador.nome}</Typography>
            <Typography variant="caption" color="text.secondary">{indicador.criterio}</Typography>
          </Box>
          {nota !== undefined && (
            <Box sx={{
              px: 1, py: 0.25, borderRadius: 1,
              bgcolor: COR_NOTA[nota] + '22', color: COR_NOTA[nota],
              fontWeight: 800, fontSize: '0.72rem', whiteSpace: 'nowrap',
            }}>
              {NIVEL[nota]} · {LABEL_NOTA[nota]}
            </Box>
          )}
        </Box>

        {/* Selectable criteria list */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
          {indicador.criterios.map((c) => {
            const selected = nota === c.nota;
            const cor = COR_NOTA[c.nota];
            return (
              <Box
                key={c.nota}
                onClick={() => onChange(c.nota)}
                sx={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 1.25,
                  p: '9px 12px',
                  borderRadius: 2,
                  border: `1.5px solid ${selected ? cor : '#e0e0e0'}`,
                  bgcolor: selected ? cor + '14' : 'background.paper',
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                  userSelect: 'none',
                  '&:hover': { bgcolor: cor + '0E', borderColor: cor + '99' },
                }}
              >
                {/* Score badge */}
                <Box sx={{
                  minWidth: 36,
                  textAlign: 'center',
                  px: 0.5,
                  py: 0.2,
                  borderRadius: 1,
                  bgcolor: selected ? cor : cor + '2A',
                  color: selected ? '#fff' : cor,
                  fontSize: '0.68rem',
                  fontWeight: 800,
                  flexShrink: 0,
                  lineHeight: 1.6,
                  transition: 'all 0.15s',
                }}>
                  {LABEL_NOTA[c.nota]}
                </Box>

                {/* Level label + description */}
                <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                  <Typography component="span" sx={{ fontSize: '0.74rem', fontWeight: 700, color: cor, mr: 0.5 }}>
                    {NIVEL[c.nota]}:
                  </Typography>
                  <Typography component="span" sx={{
                    fontSize: '0.74rem',
                    color: selected ? 'text.primary' : 'text.secondary',
                    fontWeight: selected ? 600 : 400,
                    lineHeight: 1.45,
                  }}>
                    {c.descricao}
                  </Typography>
                </Box>

                {/* Checkmark */}
                <Box sx={{ flexShrink: 0, color: cor, opacity: selected ? 1 : 0, transition: 'opacity 0.15s' }}>
                  <FiCheck size={14} />
                </Box>
              </Box>
            );
          })}
        </Box>

        {/* Evidence chip + observation toggle */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1.5, gap: 1, flexWrap: 'wrap' }}>
          {indicador.evidencia_esperada && (
            <Chip
              icon={<FiCheckSquare size={12} />}
              label={`Evidência: ${indicador.evidencia_esperada}`}
              size="small"
              variant="outlined"
              sx={{
                maxWidth: '100%',
                height: 'auto',
                '& .MuiChip-label': { whiteSpace: 'normal', py: 0.4, fontSize: '0.72rem' },
                borderColor: `${corDimensao}66`,
                color: 'text.secondary',
              }}
            />
          )}
          <Button
            size="small"
            startIcon={obsExpanded ? <FiChevronUp size={13} /> : <FiChevronDown size={13} />}
            onClick={() => setObsExpanded((v) => !v)}
            sx={{ ml: 'auto', textTransform: 'none', fontSize: '0.72rem', flexShrink: 0 }}
            color="inherit"
          >
            {observacao ? 'Editar observação' : 'Observação'}
          </Button>
        </Box>

        <Collapse in={obsExpanded} timeout="auto" unmountOnExit>
          <TextField
            fullWidth
            multiline
            minRows={2}
            placeholder="Justificativa da nota, evidências verificadas (fotos, documentos, depoimentos)."
            value={observacao || ''}
            onChange={(e) => onObservacaoChange?.(e.target.value)}
            sx={{ mt: 1.25 }}
            slotProps={{
              input: {
                sx: { fontSize: '0.85rem' },
                startAdornment: <FiEdit3 style={{ marginRight: 6, marginTop: 4, opacity: 0.5 }} />,
              },
            }}
          />
        </Collapse>
      </CardContent>
    </Card>
  );
}
