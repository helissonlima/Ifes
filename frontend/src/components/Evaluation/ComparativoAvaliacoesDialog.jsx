import { useEffect, useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button, Box, Typography,
  Grid, Divider, Alert, Skeleton, IconButton, Table, TableBody, TableCell,
  TableHead, TableRow, Chip,
} from '@mui/material';
import { FiX, FiTrendingUp, FiTrendingDown, FiMinus } from 'react-icons/fi';
import { avaliacoesAPI } from '../../services/api';
import { friendlyError } from '../../utils/errorMessages';
import { formatarDataCurta } from '../../utils/formatarData';
import IGSBadge from '../Common/IGSBadge';

function DeltaChip({ valor, sufixoPercentual = true }) {
  if (valor === null || valor === undefined) return <Typography variant="caption" color="text.disabled">—</Typography>;
  const positivo = valor > 0;
  const neutro = valor === 0;
  const cor = neutro ? 'text.secondary' : positivo ? '#2E7D32' : '#C62828';
  const Icone = neutro ? FiMinus : positivo ? FiTrendingUp : FiTrendingDown;
  const texto = sufixoPercentual ? `${positivo ? '+' : ''}${(valor * 100).toFixed(1)}%` : `${positivo ? '+' : ''}${valor}`;
  return (
    <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.4, color: cor, fontWeight: 700 }}>
      <Icone size={13} />
      <Typography component="span" variant="caption" sx={{ fontWeight: 700, color: 'inherit' }}>{texto}</Typography>
    </Box>
  );
}

/**
 * Compara duas avaliações concluídas via GET /avaliacoes/comparar (M10.1 —
 * o endpoint já existia, só faltava a tela). Recebe os ids diretamente
 * (idA/idB) em vez de objetos completos: o resumo (propriedade, data, IGS)
 * vem todo da própria resposta da comparação, sem precisar duplicar o que
 * a tela que abre o diálogo já tinha.
 */
export default function ComparativoAvaliacoesDialog({ open, onClose, idA, idB }) {
  const [dados, setDados] = useState(null);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState('');

  const buscar = () => {
    if (!idA || !idB) return;
    setCarregando(true);
    setErro('');
    avaliacoesAPI.comparar(idA, idB)
      .then((r) => setDados(r.data))
      .catch((e) => setErro(friendlyError(e)))
      .finally(() => setCarregando(false));
  };

  // Mesmo padrão de fetch-on-mount usado em todo o app (ver Resultado.jsx,
  // Historico.jsx etc.) — dispara react-hooks/set-state-in-effect, débito
  // pré-existente documentado como fora de escopo desde o M3.
  useEffect(() => {
    if (open) buscar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, idA, idB]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth scroll="paper">
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
        Comparativo entre avaliações
        <IconButton onClick={onClose} size="small" aria-label="Fechar comparativo">
          <FiX />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        {carregando && (
          <Box sx={{ display: 'grid', gap: 1.5 }}>
            <Skeleton variant="rectangular" height={80} sx={{ borderRadius: 2 }} />
            <Skeleton variant="rectangular" height={160} sx={{ borderRadius: 2 }} />
            <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 2 }} />
          </Box>
        )}

        {!carregando && erro && (
          <Alert
            severity="error"
            action={<Button color="inherit" size="small" onClick={buscar}>Tentar novamente</Button>}
          >
            {erro}
          </Alert>
        )}

        {!carregando && !erro && dados && (
          <Box>
            {/* Cabeçalho: as duas avaliações lado a lado */}
            <Grid container spacing={2} sx={{ mb: 2.5 }}>
              {[dados.a, dados.b].map((av, i) => (
                <Grid size={{ xs: 12, sm: 6 }} key={av.id}>
                  <Box sx={{ p: 1.5, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
                    <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 700 }}>
                      Avaliação {i === 0 ? 'A' : 'B'}
                    </Typography>
                    <Typography variant="subtitle2" fontWeight={700}>{av.propriedade_nome}</Typography>
                    <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1 }}>
                      {formatarDataCurta(av.data)} · {av.tecnico || 'Técnico não informado'}
                    </Typography>
                    <IGSBadge classificacao={av.classificacao} igs={av.igs} size="small" />
                  </Box>
                </Grid>
              ))}
            </Grid>

            {/* IGS geral */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1.5, mb: 2.5 }}>
              <Typography variant="body2" color="text.secondary">Variação do ICSR:</Typography>
              <DeltaChip valor={dados.delta_igs} />
            </Box>

            <Divider sx={{ mb: 2 }} />

            {/* Por dimensão */}
            <Typography variant="subtitle2" fontWeight={700} gutterBottom>Por dimensão</Typography>
            <Box sx={{ display: 'grid', gap: 1, mb: 2.5 }}>
              {dados.dimensoes.map((d) => (
                <Box key={d.codigo} sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: d.cor, flexShrink: 0 }} />
                  <Typography variant="body2" sx={{ flexGrow: 1, minWidth: 0 }} noWrap>{d.nome}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {(d.a * 100).toFixed(0)}% → {(d.b * 100).toFixed(0)}%
                  </Typography>
                  <DeltaChip valor={d.delta} />
                </Box>
              ))}
            </Box>

            <Divider sx={{ mb: 2 }} />

            {/* Resumo de indicadores */}
            <Box sx={{ display: 'flex', gap: 1, mb: 1.5, flexWrap: 'wrap' }}>
              <Chip size="small" color="success" variant="outlined" label={`${dados.resumo.melhoraram} melhoraram`} />
              <Chip size="small" color="error" variant="outlined" label={`${dados.resumo.pioraram} pioraram`} />
              <Chip size="small" variant="outlined" label={`${dados.resumo.estaveis} estáveis`} />
            </Box>

            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Indicador</TableCell>
                  <TableCell align="center">A</TableCell>
                  <TableCell align="center">B</TableCell>
                  <TableCell align="right">Variação</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {dados.indicadores.map((ind) => (
                  <TableRow key={ind.codigo}>
                    <TableCell>
                      <Typography variant="body2">{ind.indicador_nome}</Typography>
                      <Typography variant="caption" color="text.secondary">{ind.dimensao_nome}</Typography>
                    </TableCell>
                    <TableCell align="center">{ind.nota_a ?? '—'}</TableCell>
                    <TableCell align="center">{ind.nota_b ?? '—'}</TableCell>
                    <TableCell align="right"><DeltaChip valor={ind.delta} sufixoPercentual={false} /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Box>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Fechar</Button>
      </DialogActions>
    </Dialog>
  );
}
