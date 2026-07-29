import { useState, useRef } from 'react';
import {
  Card, CardContent, Typography, Box, Collapse, TextField, Button, Chip, Tooltip, IconButton,
} from '@mui/material';
import { FiCheckSquare, FiEdit3, FiChevronDown, FiChevronUp, FiCheck, FiInfo } from 'react-icons/fi';
import { getDefinicao } from '../../utils/glossario';
import { COR_NOTA, COR_NOTA_TEXTO, COR_NOTA_BADGE_SELECIONADO } from '../../utils/coresICSR';

const LABEL_NOTA = { 0: '0,00', 0.25: '0,25', 0.5: '0,50', 0.75: '0,75', 1: '1,00' };
const NIVEL = {
  0: 'Crítico', 0.25: 'Insuficiente', 0.5: 'Regular', 0.75: 'Bom', 1: 'Excelente',
};

export default function IndicadorCard({ indicador, nota, observacao, onChange, onObservacaoChange, corDimensao }) {
  const [obsExpanded, setObsExpanded] = useState(false);
  const [glossarioAberto, setGlossarioAberto] = useState(false);
  const glossario = getDefinicao(indicador.nome) || getDefinicao(indicador.criterio);
  const itemRefs = useRef([]);

  const moverEselecionar = (novoIndex) => {
    const alvo = indicador.criterios[novoIndex];
    if (!alvo) return;
    onChange(alvo.nota);
    itemRefs.current[novoIndex]?.focus();
  };

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
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, flexWrap: 'wrap' }}>
              <Typography variant="subtitle2" fontWeight={700}>{indicador.nome}</Typography>
              {indicador.peso !== undefined && (
                <Box sx={{
                  px: 0.75, py: 0.1, borderRadius: 1,
                  bgcolor: corDimensao + '1A', color: corDimensao,
                  fontSize: '0.65rem', fontWeight: 700, lineHeight: 1.8,
                }}>
                  peso {Math.round(indicador.peso * 100)}%
                </Box>
              )}
              {glossario && (
                <Tooltip
                  title={<span><strong>{glossario.termo}:</strong> {glossario.def}</span>}
                  placement="top"
                  arrow
                  enterDelay={300}
                  open={glossarioAberto}
                  onOpen={() => setGlossarioAberto(true)}
                  onClose={() => setGlossarioAberto(false)}
                >
                  <IconButton
                    size="small"
                    aria-label={`O que significa ${glossario.termo}`}
                    onClick={() => setGlossarioAberto((v) => !v)}
                    sx={{ p: 0.25, color: 'text.disabled', '&:hover': { color: corDimensao, bgcolor: 'transparent' } }}
                  >
                    <FiInfo size={13} />
                  </IconButton>
                </Tooltip>
              )}
            </Box>
            <Typography variant="caption" color="text.secondary">{indicador.criterio}</Typography>
          </Box>
          {nota !== undefined && (
            <Box sx={{
              px: 1, py: 0.25, borderRadius: 1,
              bgcolor: COR_NOTA[nota] + '22', color: COR_NOTA_TEXTO[nota],
              fontWeight: 800, fontSize: '0.72rem', whiteSpace: 'nowrap',
            }}>
              {NIVEL[nota]} · {LABEL_NOTA[nota]}
            </Box>
          )}
        </Box>

        {/* Selectable criteria list — grupo de opções únicas (equivalente a um radiogroup) */}
        <Box
          role="radiogroup"
          aria-label={`Nota para ${indicador.nome}`}
          sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}
        >
          {indicador.criterios.map((c, idx) => {
            const selected = nota === c.nota;
            const cor = COR_NOTA[c.nota];
            // Roving tabindex: só a opção selecionada (ou a primeira, se nada
            // selecionado ainda) fica no tab order — setas movem o foco entre as demais.
            const podeReceberFoco = selected || (nota === undefined && idx === 0);
            return (
              <Box
                key={c.nota}
                ref={(el) => { itemRefs.current[idx] = el; }}
                role="radio"
                aria-checked={selected}
                tabIndex={podeReceberFoco ? 0 : -1}
                onClick={() => onChange(c.nota)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onChange(c.nota);
                  } else if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
                    e.preventDefault();
                    moverEselecionar(idx + 1);
                  } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
                    e.preventDefault();
                    moverEselecionar(idx - 1);
                  }
                }}
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
                  '&:focus-visible': { outline: `2px solid ${cor}`, outlineOffset: '2px' },
                }}
              >
                {/* Score badge */}
                <Box sx={{
                  minWidth: 36,
                  textAlign: 'center',
                  px: 0.5,
                  py: 0.2,
                  borderRadius: 1,
                  bgcolor: selected ? cor : cor + '18',
                  color: selected ? COR_NOTA_BADGE_SELECIONADO[c.nota] : COR_NOTA_TEXTO[c.nota],
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
                  <Typography component="span" sx={{ fontSize: '0.74rem', fontWeight: 700, color: COR_NOTA_TEXTO[c.nota], mr: 0.5 }}>
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
