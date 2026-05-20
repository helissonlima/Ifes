import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Typography, Card, CardContent, Grid, Button, Divider,
  CircularProgress, Alert, Chip, LinearProgress, Table,
  TableBody, TableCell, TableRow, Paper, Tabs, Tab, TableHead, Tooltip,
} from '@mui/material';
import { FiArrowLeft, FiClipboard, FiPrinter, FiTrendingUp, FiAlertTriangle, FiCheckCircle, FiTarget } from 'react-icons/fi';
import { MdOutlineEco } from 'react-icons/md';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RTooltip, ResponsiveContainer,
  Cell, LineChart, Line, Legend,
} from 'recharts';
import { avaliacoesAPI } from '../services/api';
import IGSGauge from '../components/Dashboard/IGSGauge';
import DimensaoChart from '../components/Dashboard/DimensaoChart';
import IGSBadge from '../components/Common/IGSBadge';

const COR_NOTA = {
  0: '#f44336', 0.25: '#FF9800', 0.5: '#FFC107', 0.75: '#8BC34A', 1: '#4CAF50',
};
const DIM_INFO = {
  ambiental:       { nome: 'Ambiental',         cor: '#4CAF50', peso: 35, campo: 'indice_ambiental' },
  economica:       { nome: 'Econômica',          cor: '#2196F3', peso: 30, campo: 'indice_economico' },
  social:          { nome: 'Social',             cor: '#FF9800', peso: 20, campo: 'indice_social' },
  gestao_qualidade:{ nome: 'Gestão e Qualidade', cor: '#9C27B0', peso: 15, campo: 'indice_gestao_qualidade' },
};

const STATUS_ICON = {
  'CRÍTICO': <FiAlertTriangle size={14} />,
  'ATENÇÃO': <FiAlertTriangle size={14} />,
  'BOM': <FiCheckCircle size={14} />,
  'EXCELENTE': <FiCheckCircle size={14} />,
};

export default function Resultado() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [avaliacao, setAvaliacao] = useState(null);
  const [diagnostico, setDiagnostico] = useState(null);
  const [timeline, setTimeline] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState('');
  const [tabAtiva, setTabAtiva] = useState(0);
  const [tabDiag, setTabDiag] = useState(0);

  useEffect(() => {
    setLoading(true);
    avaliacoesAPI.buscar(id)
      .then(async (r) => {
        setAvaliacao(r.data);
        const [diag, tl] = await Promise.allSettled([
          avaliacoesAPI.diagnostico(id),
          avaliacoesAPI.timeline(r.data.propriedade_id),
        ]);
        if (diag.status === 'fulfilled') setDiagnostico(diag.value.data);
        if (tl.status === 'fulfilled') setTimeline(tl.value.data.avaliacoes || []);
      })
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

  const dadosBarChart = Object.entries(DIM_INFO).map(([, info]) => ({
    nome: info.nome,
    cor: info.cor,
    peso: info.peso,
    valor: Math.round((avaliacao[info.campo] || 0) * 100),
  }));

  const timelineData = timeline.map((t) => ({
    data: new Date(t.data_avaliacao).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: '2-digit' }),
    IGS: Math.round((Number(t.igs) || 0) * 100),
    Ambiental: Math.round((Number(t.indice_ambiental) || 0) * 100),
    Econômica: Math.round((Number(t.indice_economico) || 0) * 100),
    Social: Math.round((Number(t.indice_social) || 0) * 100),
    'Gestão e Qualidade': Math.round((Number(t.indice_gestao_qualidade) || 0) * 100),
  }));

  return (
    <Box className="print-resultado">
      {/* Header */}
      <Box className="no-print" sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3, flexWrap: 'wrap' }}>
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
            Imprimir / PDF
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
                const valor = avaliacao[info.campo] || 0;
                return (
                  <Box key={cod} sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                      <Box>
                        <Typography variant="body2" fontWeight={700}>{info.nome}</Typography>
                        <Typography variant="caption" color="text.secondary">Peso: {info.peso}% · Contribuição: {((valor * info.peso) / 100 * 100).toFixed(1)}%</Typography>
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
                  IGS = (Amb. × 35%) + (Econ. × 30%) + (Soc. × 20%) + (G&Q × 15%)
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
              <RTooltip formatter={(v) => [`${v}%`, 'Índice']} />
              <Bar dataKey="valor" radius={[6, 6, 0, 0]}>
                {dadosBarChart.map((entry) => <Cell key={entry.nome} fill={entry.cor} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* DIAGNÓSTICO AUTOMÁTICO */}
      {diagnostico && (
        <Card sx={{ mb: 2, borderTop: '4px solid #2E7D32' }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
              <FiTarget size={22} color="#2E7D32" />
              <Typography variant="h6" fontWeight={800}>Diagnóstico Automático</Typography>
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Análise de fortalezas, fragilidades e recomendações priorizadas por impacto no IGS.
            </Typography>

            {/* Plano de ação top-5 */}
            <Paper variant="outlined" sx={{ p: 1.5, mb: 2, borderColor: '#2E7D3266', bgcolor: '#F1F8E9' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <FiTrendingUp size={16} color="#2E7D32" />
                <Typography variant="subtitle2" fontWeight={800} color="#1B5E20">
                  Plano de Ação Prioritário — Top 5 indicadores
                </Typography>
              </Box>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: 'rgba(46,125,50,0.08)' }}>
                    <TableCell sx={{ fontWeight: 700, width: 40 }}>#</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Indicador</TableCell>
                    <TableCell sx={{ fontWeight: 700, width: 80 }}>Nota</TableCell>
                    <TableCell sx={{ fontWeight: 700, width: 110 }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 700, width: 110, display: { xs: 'none', md: 'table-cell' } }}>Impacto IGS</TableCell>
                    <TableCell sx={{ fontWeight: 700, display: { xs: 'none', sm: 'table-cell' } }}>Prazo sugerido</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {diagnostico.plano_acao_top5.map((it, i) => (
                    <TableRow key={it.indicador_codigo} hover>
                      <TableCell sx={{ fontWeight: 800, color: '#2E7D32' }}>{i + 1}</TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight={700}>{it.indicador_nome}</Typography>
                        <Typography variant="caption" color="text.secondary">{it.dimensao_nome}</Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={(it.nota * 100).toFixed(0) + '%'}
                          size="small"
                          sx={{ bgcolor: COR_NOTA[it.nota] || '#9E9E9E', color: '#fff', fontWeight: 700 }}
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          icon={STATUS_ICON[it.status]}
                          label={it.status}
                          size="small"
                          sx={{ bgcolor: it.status_cor + '22', color: it.status_cor, fontWeight: 700, fontSize: '0.7rem' }}
                        />
                      </TableCell>
                      <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>
                        <Typography variant="body2" fontWeight={700}>+{(it.impacto_igs * 100).toFixed(2)}%</Typography>
                      </TableCell>
                      <TableCell sx={{ fontSize: '0.78rem', color: 'text.secondary', display: { xs: 'none', sm: 'table-cell' } }}>
                        {it.prazo_sugerido}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                * Impacto IGS = potencial de ganho no índice geral se este indicador atingir nota 1,00.
              </Typography>
            </Paper>

            {/* Diagnóstico por dimensão */}
            <Tabs value={tabDiag} onChange={(_, v) => setTabDiag(v)} variant="scrollable" scrollButtons="auto" sx={{ mb: 1.5 }}>
              {diagnostico.diagnostico_por_dimensao.map((d) => (
                <Tab key={d.dimensao} label={d.nome} sx={{ fontWeight: 600, minWidth: 100 }} />
              ))}
            </Tabs>
            {diagnostico.diagnostico_por_dimensao.map((d, i) => (
              tabDiag === i && (
                <Box key={d.dimensao}>
                  <Table size="small">
                    <TableHead>
                      <TableRow sx={{ bgcolor: 'action.hover' }}>
                        <TableCell sx={{ fontWeight: 700 }}>Indicador</TableCell>
                        <TableCell sx={{ fontWeight: 700, width: 80 }}>Nota</TableCell>
                        <TableCell sx={{ fontWeight: 700, width: 110 }}>Status</TableCell>
                        <TableCell sx={{ fontWeight: 700, display: { xs: 'none', md: 'table-cell' } }}>Recomendação</TableCell>
                        <TableCell sx={{ fontWeight: 700, width: 110, display: { xs: 'none', sm: 'table-cell' } }}>Prazo</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {d.itens.map((it) => (
                        <TableRow key={it.indicador_codigo} hover>
                          <TableCell>
                            <Typography variant="body2" fontWeight={700}>{it.indicador_nome}</Typography>
                            {it.evidencia_esperada && (
                              <Typography variant="caption" color="text.secondary" display="block">
                                Evidência: {it.evidencia_esperada}
                              </Typography>
                            )}
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" fontWeight={800} color={COR_NOTA[it.nota] || '#9E9E9E'}>
                              {(it.nota * 100).toFixed(0)}%
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip
                              icon={STATUS_ICON[it.status]}
                              label={it.status}
                              size="small"
                              sx={{ bgcolor: it.status_cor + '22', color: it.status_cor, fontWeight: 700, fontSize: '0.7rem' }}
                            />
                          </TableCell>
                          <TableCell sx={{ fontSize: '0.8rem', display: { xs: 'none', md: 'table-cell' } }}>
                            {it.recomendacao}
                          </TableCell>
                          <TableCell sx={{ fontSize: '0.78rem', color: 'text.secondary', display: { xs: 'none', sm: 'table-cell' } }}>
                            {it.prazo_sugerido}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Box>
              )
            ))}
          </CardContent>
        </Card>
      )}

      {/* EVOLUÇÃO TEMPORAL */}
      {timelineData.length > 1 && (
        <Card sx={{ mb: 2 }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <FiTrendingUp size={20} color="#1B5E20" />
              <Typography variant="h6" fontWeight={700}>Evolução da Sustentabilidade</Typography>
            </Box>
            <Typography variant="caption" color="text.secondary" sx={{ mb: 1.5, display: 'block' }}>
              {timelineData.length} avaliações concluídas desta propriedade.
            </Typography>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={timelineData} margin={{ top: 8, right: 16, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                <XAxis dataKey="data" tick={{ fontSize: 11 }} />
                <YAxis domain={[0, 100]} unit="%" tick={{ fontSize: 11 }} />
                <RTooltip />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Line type="monotone" dataKey="IGS" stroke="#1B5E20" strokeWidth={3} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="Ambiental" stroke="#4CAF50" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="Econômica" stroke="#2196F3" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="Social" stroke="#FF9800" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="Gestão e Qualidade" stroke="#9C27B0" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Detalhamento por dimensão */}
      <Card>
        <CardContent>
          <Typography variant="h6" fontWeight={700} gutterBottom>Detalhamento dos Indicadores</Typography>
          <Tabs value={tabAtiva} onChange={(_, v) => setTabAtiva(v)} variant="scrollable" scrollButtons="auto" sx={{ mb: 2 }}>
            {Object.entries(DIM_INFO).map(([cod, info]) => (
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
                          <TableCell sx={{ fontWeight: 600, fontSize: '0.85rem' }}>
                            {r.indicador_nome}
                            {r.observacao && (
                              <Tooltip title={r.observacao} placement="top" arrow>
                                <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.25, fontStyle: 'italic', maxWidth: 320, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                  ✎ {r.observacao}
                                </Typography>
                              </Tooltip>
                            )}
                          </TableCell>
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

      {/* Observações gerais */}
      {avaliacao.observacoes && (
        <Card sx={{ mt: 2 }}>
          <CardContent>
            <Typography variant="subtitle2" fontWeight={700} gutterBottom>Observações Gerais</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'pre-line' }}>{avaliacao.observacoes}</Typography>
          </CardContent>
        </Card>
      )}
    </Box>
  );
}
