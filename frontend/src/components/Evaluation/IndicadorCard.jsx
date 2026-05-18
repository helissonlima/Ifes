import { useState } from 'react';
import {
  Card, CardContent, Typography, Box, ToggleButtonGroup, ToggleButton, Tooltip,
  Collapse, TextField, Button, Chip,
} from '@mui/material';
import { FiCheckSquare, FiEdit3, FiChevronDown, FiChevronUp } from 'react-icons/fi';

const LABEL_NOTA = { 0: '0', 0.25: '0,25', 0.5: '0,50', 0.75: '0,75', 1: '1,00' };
const COR_NOTA = {
  0: '#f44336', 0.25: '#FF9800', 0.5: '#FFC107', 0.75: '#8BC34A', 1: '#4CAF50',
};

export default function IndicadorCard({ indicador, nota, observacao, onChange, onObservacaoChange, corDimensao }) {
  const [expanded, setExpanded] = useState(false);
  const criterioSelecionado = indicador.criterios.find((c) => c.nota === nota);

  return (
    <Card
      sx={{
        mb: 2,
        border: nota !== undefined ? `2px solid ${COR_NOTA[nota]}44` : '2px solid transparent',
        transition: 'border-color 0.2s',
      }}
    >
      <CardContent sx={{ pb: '12px !important' }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, mb: 1.5 }}>
          <Box
            sx={{
              width: 8, height: 8, borderRadius: '50%', bgcolor: corDimensao,
              mt: 0.8, flexShrink: 0,
            }}
          />
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="subtitle2" fontWeight={700}>{indicador.nome}</Typography>
            <Typography variant="caption" color="text.secondary">{indicador.criterio}</Typography>
          </Box>
          {nota !== undefined && (
            <Box
              sx={{
                px: 1, py: 0.25, borderRadius: 1,
                bgcolor: COR_NOTA[nota] + '22',
                color: COR_NOTA[nota],
                fontWeight: 800, fontSize: '0.75rem',
              }}
            >
              {LABEL_NOTA[nota]}
            </Box>
          )}
        </Box>

        <ToggleButtonGroup
          value={nota}
          exclusive
          onChange={(_, v) => v !== null && onChange(v)}
          size="small"
          fullWidth
          sx={{ flexWrap: 'wrap', gap: 0.5 }}
        >
          {indicador.criterios.map((c) => (
            <Tooltip key={c.nota} title={c.descricao} arrow placement="top">
              <ToggleButton
                value={c.nota}
                sx={{
                  flex: '1 1 auto',
                  minWidth: 56,
                  borderRadius: '6px !important',
                  border: '1px solid #ddd !important',
                  fontSize: '0.7rem',
                  fontWeight: 600,
                  py: 0.5,
                  '&.Mui-selected': {
                    bgcolor: COR_NOTA[c.nota],
                    color: '#fff',
                    borderColor: `${COR_NOTA[c.nota]} !important`,
                    '&:hover': { bgcolor: COR_NOTA[c.nota] },
                  },
                }}
              >
                {LABEL_NOTA[c.nota]}
              </ToggleButton>
            </Tooltip>
          ))}
        </ToggleButtonGroup>

        {criterioSelecionado && (
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block', fontStyle: 'italic' }}>
            ✓ {criterioSelecionado.descricao}
          </Typography>
        )}

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1.25, gap: 1, flexWrap: 'wrap' }}>
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
            startIcon={expanded ? <FiChevronUp /> : <FiChevronDown />}
            onClick={() => setExpanded((v) => !v)}
            sx={{ ml: 'auto', textTransform: 'none', fontSize: '0.72rem' }}
            color="inherit"
          >
            {observacao ? 'Editar observação' : 'Adicionar observação'}
          </Button>
        </Box>

        <Collapse in={expanded} timeout="auto" unmountOnExit>
          <TextField
            fullWidth
            multiline
            minRows={2}
            placeholder="Registre a justificativa da nota e evidências verificadas (fotos, documentos, depoimentos)."
            value={observacao || ''}
            onChange={(e) => onObservacaoChange?.(e.target.value)}
            sx={{ mt: 1.5 }}
            slotProps={{ input: { sx: { fontSize: '0.85rem' } } }}
            InputProps={{
              startAdornment: <FiEdit3 style={{ marginRight: 6, marginTop: 4, opacity: 0.5 }} />,
            }}
          />
        </Collapse>
      </CardContent>
    </Card>
  );
}
