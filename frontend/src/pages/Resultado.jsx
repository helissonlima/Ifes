import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Typography, Card, CardContent, Grid, Button, Divider,
  CircularProgress, Alert, Chip, LinearProgress, Table,
  TableBody, TableCell, TableRow, Paper, Tabs, Tab,
} from '@mui/material';
import { FiArrowLeft, FiClipboard, FiPrinter } from 'react-icons/fi';
import { MdOutlineEco } from 'react-icons/md';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Cell, Legend,
} from 'recharts';
import { avaliacoesAPI } from '../services/api';
import IGSGauge from '../components/Dashboard/IGSGauge';
import DimensaoChart from '../components/Dashboard/DimensaoChart';
import IGSBadge from '../components/Common/IGSBadge';

const COR_NOTA = {
  0: '#f44336', 0.25: '#FF9800', 0.5: '#FFC107', 0.75: '#8BC34A', 1: '#4CAF50',
};
const DIM_INFO = {
  economica: { nome: 'Econômica', cor: '#2196F3', peso: 30 },
  ambiental: { nome: 'Ambiental', cor: '#4CAF50', peso: 35 },
  social: { nome: 'Social', cor: '#FF9800', peso: 20 },
  gestao_qualidade: { nome: 'Gestão e Qualidade', cor: '#9C27B0', peso: 15 },
};

export default function Resultado() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [avaliacao, setAvaliacao] = useState(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState('');
  const [tabAtiva, setTabAtiva] = useState(0);

  useEffect(() => {
    avaliacoesAPI.buscar(id)
      .then((r) => setAvaliacao(r.data))
      .catch((e) => setErro(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', pt: 8 }}><CircularProgress /></Box>;
  if (erro) return <Alert severity="error">{erro}</Alert>;
  if (!avaliacao) return null;

  const respostasPorDimensao = (avaliacao.respostas || []).reduce((acc, r) => {
    if (!acc[r.dimensao]) acc[r.dimensao] = [];
    acc[r.dimensao].push(r);
    return acc;
  }, {});

  const dadosBarChart = Object.entries(DIM_INFO).map(([cod, info]) => ({
    nome: info.nome,
    cor: info.cor,
    peso: info.peso,
    valor: Math.round((avaliacao[`indice_${cod === 'gestao_qualidade' ? 'gestao_qualidade' : cod}`] || 0) * 100),
  }));

  // Dados para o gráfico de indicadores
  const dadosIndicadores = (avaliacao.respostas || []).map((r) => ({
    nome: r.indicador_nome.length > 20 ? r.indicador_nome.substring(0, 18) + '...' : r.indicador_nome,
    nomeCompleto: r.indicador_nome,
    valor: Math.round(r.nota * 100),
    cor: COR_NOTA[r.nota] || '#9E9E9E',
    dimensao: DIM_INFO[r.dimensao]?.nome || r.dimensao,
  }));

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <Button startIcon={<FiArrowLeft />} onClick={() => navigate(-1)} size="small">Voltar</Button>
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="h5" fontWeight={800} color="primary.dark">Resultado da Avaliação</Typography>
          <Typography variant="body2" color="text.secondary">
            {avaliacao.propriedade_nome} · {avaliacao.municipio}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button startIcon={<FiClipboard />} variant="outlined" size="small"
            onClick={() => navigate(`/avaliacao/nova?propriedade=${avaliacao.propriedade_id}`)}>
            Nova Avaliação
          </Button>
          <Button startIcon={<FiPrinter />} variant="outlined" size="small" onClick={() => window.print()}>
            Imprimir
          </Button>
        </Box>
      </Box>

      {/* IGS Principal */}
      <Card sx={{ mb: 2, background: 'linear-gradient(135deg, #1B5E20 0%, #2E7D32 100%)', color: 'white' }}>
        <CardContent>
          <Grid container spacing={2} sx={{ alignItems: 'center' }}>
            <Grid size={{ xs: 12, sm: 4 }} sx={{ textAlign: 'center' }}>
              <IGSGauge igs={avaliacao.igs || 0} classificacao={avaliacao.classificacao} size={180} />
            </Grid>
            <Grid size={{ xs: 12, sm: 8 }}>
              <Typography variant="h6" fontWeight={700} sx={{ color: 'rgba(255,255,255,0.85)', mb: 1 }}>
                Índice Geral de Sustentabilidade
              </Typography>
              <Typography variant="h3" fontWeight={900} sx={{ color: 'white', lineHeight: 1 }}>
                {avaliacao.igs ? `${(avaliacao.igs * 100).toFixed(1)}%` : '—'}
              </Typography>
              <IGSBadge classificacao={avaliacao.classificacao} size="medium" />
              <Divider sx={{ my: 1.5, borderColor: 'rgba(255,255,255,0.2)' }} />
              <Grid container spacing={1}>
                <Grid size={6}><Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)' }}>Propriedade</Typography><br /><Typography variant="body2" fontWeight={700} color="white">{avaliacao.propriedade_nome}</Typography></Grid>
                <Grid size={6}><Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)' }}>Técnico</Typography><br /><Typography variant="body2" fontWeight={700} color="white">{avaliacao.tecnico_responsavel || '—'}</Typography></Grid>
                <Grid size={6}><Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)' }}>Data</Typography><br /><Typography variant="body2" fontWeight={700} color="white">{new Date(avaliacao.data_avaliacao).toLocaleDateString('pt-BR')}</Typography></Grid>
                <Grid size={6}><Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)' }}>Status</Typography><br /><Chip label={avaliacao.status === 'concluida' ? 'Concluída' : 'Rascunho'} size="small" sx={{ bgcolor: avaliacao.status === 'concluida' ? '#4CAF50' : '#FF9800', color: 'white', fontWeight: 700 }} /></Grid>
              </Grid>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Índices por Dimensão + Radar */}
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid size={{ xs: 12, md: 7 }}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" fontWeight={700} gutterBottom>Índices por Dimensão</Typography>
              {Object.entries(DIM_INFO).map(([cod, info]) => {
                const campo = `indice_${cod}`;
                const valor = avaliacao[campo] || 0;
                return (
                  <Box key={cod} sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                      <Box>
                        <Typography variant="body2" fontWeight={700}>{info.nome}</Typography>
                        <Typography variant="caption" color="text.secondary">Peso: {info.peso}%</Typography>
                      </Box>
                      <Typography variant="h6" fontWeight={800} color={info.cor}>
                        {(valor * 100).toFixed(1)}%
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={Math.min(valor * 100, 100)}
                      sx={{
                        height: 10, borderRadius: 5,
                        bgcolor: `${info.cor}22`,
                        '& .MuiLinearProgress-bar': { bgcolor: info.cor, borderRadius: 5 },
                      }}
                    />
                  </Box>
                );
              })}
              <Divider sx={{ my: 1.5 }} />
              <Box sx={{ p: 1.5, bgcolor: 'primary.50', borderRadius: 2, textAlign: 'center' }}>
                <Typography variant="caption" color="text.secondary" fontWeight={600}>
                  IGS = (Econ. × 30%) + (Amb. × 35%) + (Soc. × 20%) + (G&Q × 15%)
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 5 }}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" fontWeight={700} gutterBottom>Perfil de Sustentabilidade</Typography>
              <DimensaoChart
                economica={avaliacao.indice_economico}
                ambiental={avaliacao.indice_ambiental}
                social={avaliacao.indice_social}
                gestao={avaliacao.indice_gestao_qualidade}
              />
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Gráfico de barras */}
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Typography variant="h6" fontWeight={700} gutterBottom>Comparativo por Dimensão</Typography>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={dadosBarChart} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
              <XAxis dataKey="nome" tick={{ fontSize: 12 }} />
              <YAxis domain={[0, 100]} unit="%" tick={{ fontSize: 12 }} />
              <Tooltip formatter={(v) => [`${v}%`, 'Índice']} />
              <Bar dataKey="valor" radius={[6, 6, 0, 0]}>
                {dadosBarChart.map((entry) => <Cell key={entry.nome} fill={entry.cor} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Detalhamento por dimensão */}
      <Card>
        <CardContent>
          <Typography variant="h6" fontWeight={700} gutterBottom>Detalhamento dos Indicadores</Typography>
          <Tabs value={tabAtiva} onChange={(_, v) => setTabAtiva(v)} variant="scrollable" scrollButtons="auto" sx={{ mb: 2 }}>
            {Object.entries(DIM_INFO).map(([cod, info], i) => (
              <Tab key={cod} label={info.nome} sx={{ fontWeight: 600, minWidth: 100 }} />
            ))}
          </Tabs>

          {Object.entries(DIM_INFO).map(([cod, info], i) => (
            tabAtiva === i && (
              <Box key={cod}>
                {(respostasPorDimensao[cod] || []).length === 0 ? (
                  <Alert severity="info">Nenhum indicador avaliado nesta dimensão.</Alert>
                ) : (
                  <Table size="small">
                    <TableBody>
                      {(respostasPorDimensao[cod] || []).map((r) => (
                        <TableRow key={r.id} sx={{ '&:hover': { bgcolor: 'action.hover' } }}>
                          <TableCell sx={{ fontWeight: 600, fontSize: '0.85rem' }}>{r.indicador_nome}</TableCell>
                          <TableCell sx={{ width: 200 }}>
                            <LinearProgress
                              variant="determinate"
                              value={r.nota * 100}
                              sx={{
                                height: 8, borderRadius: 4,
                                bgcolor: '#eee',
                                '& .MuiLinearProgress-bar': { bgcolor: COR_NOTA[r.nota] || info.cor },
                              }}
                            />
                          </TableCell>
                          <TableCell sx={{ width: 60, fontWeight: 800, color: COR_NOTA[r.nota] }}>
                            {(r.nota * 100).toFixed(0)}%
                          </TableCell>
                          <TableCell sx={{ fontSize: '0.75rem', color: 'text.secondary', display: { xs: 'none', md: 'table-cell' } }}>
                            {r.criterio_selecionado || '—'}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </Box>
            )
          ))}
        </CardContent>
      </Card>

      {/* Observações */}
      {avaliacao.observacoes && (
        <Card sx={{ mt: 2 }}>
          <CardContent>
            <Typography variant="subtitle2" fontWeight={700} gutterBottom>Observações</Typography>
            <Typography variant="body2" color="text.secondary">{avaliacao.observacoes}</Typography>
          </CardContent>
        </Card>
      )}
    </Box>
  );
}
