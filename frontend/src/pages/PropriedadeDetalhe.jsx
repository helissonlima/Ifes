import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Typography, Card, CardContent, Grid, Button, Divider, CircularProgress,
  Alert, Chip, IconButton, Table, TableBody, TableCell, TableHead, TableRow,
  Select, MenuItem, FormControl, InputLabel, Paper, Tabs, Tab, LinearProgress,
  Tooltip, useMediaQuery, useTheme,
} from '@mui/material';
import {
  FiArrowLeft, FiClipboard, FiEye, FiMap, FiCalendar, FiUser, FiPhone, FiMail,
  FiTrendingUp, FiTrendingDown, FiMinus, FiBarChart2, FiActivity,
} from 'react-icons/fi';
import { MdOutlineEco } from 'react-icons/md';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RTooltip,
  ResponsiveContainer, Legend, BarChart, Bar, Cell,
} from 'recharts';
import { propriedadesAPI, avaliacoesAPI } from '../services/api';
import { useApp } from '../context/AppContext';
import IGSBadge from '../components/Common/IGSBadge';

const COR_NOTA = {
  0: '#f44336', 0.25: '#FF9800', 0.5: '#FFC107', 0.75: '#8BC34A', 1: '#4CAF50',
};
const DIM_INFO = {
  ambiental: { nome: 'Ambiental', cor: '#4CAF50', peso: 35 },
  economica: { nome: 'Econômica', cor: '#2196F3', peso: 30 },
  social: { nome: 'Social', cor: '#FF9800', peso: 20 },
  gestao_qualidade: { nome: 'Gestão e Qualidade', cor: '#9C27B0', peso: 15 },
};

const fmtData = (d) => new Date(d).toLocaleDateString('pt-BR');

export default function PropriedadeDetalhe() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { notify } = useApp();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [propriedade, setPropriedade] = useState(null);
  const [timeline, setTimeline] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState('');
  const [tab, setTab] = useState(0);

  // Comparativo
  const [idA, setIdA] = useState('');
  const [idB, setIdB] = useState('');
  const [comparativo, setComparativo] = useState(null);
  const [carregandoComp, setCarregandoComp] = useState(false);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      propriedadesAPI.buscar(id),
      avaliacoesAPI.timeline(id),
    ])
      .then(([p, t]) => {
        setPropriedade(p.data);
        const avs = t.data.avaliacoes || [];
        setTimeline(avs);
        if (avs.length >= 2) {
          setIdA(avs[avs.length - 2].id);
          setIdB(avs[avs.length - 1].id);
        }
      })
      .catch((e) => setErro(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (idA && idB && idA !== idB) {
      setCarregandoComp(true);
      avaliacoesAPI.comparar(idA, idB)
        .then((r) => setComparativo(r.data))
        .catch((e) => notify(e.message, 'error'))
        .finally(() => setCarregandoComp(false));
    } else {
      setComparativo(null);
    }
  }, [idA, idB, notify]);

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', pt: 8 }}><CircularProgress /></Box>;
  if (erro) return <Alert severity="error">{erro}</Alert>;
  if (!propriedade) return null;

  const concluidas = timeline.filter((t) => t.status === 'concluida');
  const timelineData = concluidas.map((t) => ({
    data: new Date(t.data_avaliacao).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: '2-digit' }),
    id: t.id,
    IGS: Math.round((Number(t.igs) || 0) * 100),
    Ambiental: Math.round((Number(t.indice_ambiental) || 0) * 100),
    Econômica: Math.round((Number(t.indice_economico) || 0) * 100),
    Social: Math.round((Number(t.indice_social) || 0) * 100),
    'Gestão e Qualidade': Math.round((Number(t.indice_gestao_qualidade) || 0) * 100),
  }));

  const primeira = concluidas[0];
  const ultima = concluidas[concluidas.length - 1];
  const evolucaoIGS = ultima && primeira ? (Number(ultima.igs || 0) - Number(primeira.igs || 0)) : 0;

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <Button startIcon={<FiArrowLeft />} onClick={() => navigate('/propriedades')} size="small">Voltar</Button>
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="h5" fontWeight={800} color="primary.dark">{propriedade.nome}</Typography>
          <Typography variant="body2" color="text.secondary">
            {propriedade.municipio}/{propriedade.estado} · {propriedade.proprietario}
          </Typography>
        </Box>
        <Button
          variant="contained" startIcon={<FiClipboard />}
          onClick={() => navigate(`/avaliacao/nova?propriedade=${propriedade.id}`)}
        >
          Nova Avaliação
        </Button>
      </Box>

      {/* Card de informações + último IGS */}
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid size={{ xs: 12, md: 7 }}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                <FiMap color="#1B5E20" />
                <Typography variant="h6" fontWeight={700}>Dados da Propriedade</Typography>
              </Box>
              <Grid container spacing={1.5}>
                <Info icon={<FiUser />} label="Proprietário" valor={propriedade.proprietario} />
                <Info icon={<FiMap />} label="Município/UF" valor={`${propriedade.municipio}/${propriedade.estado}`} />
                <Info icon={<MdOutlineEco />} label="Área total" valor={propriedade.area_total ? `${propriedade.area_total} ha` : '—'} />
                <Info icon={<MdOutlineEco />} label="Área de café" valor={propriedade.area_cafe ? `${propriedade.area_cafe} ha` : '—'} />
                <Info icon={<FiPhone />} label="Telefone" valor={propriedade.telefone || '—'} />
                <Info icon={<FiMail />} label="E-mail" valor={propriedade.email || '—'} />
                <Info icon={<FiCalendar />} label="Cadastrada em" valor={fmtData(propriedade.criado_em)} />
                <Info icon={<FiActivity />} label="Total de avaliações" valor={timeline.length} />
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 5 }}>
          <Card
            sx={{
              height: '100%',
              background: ultima
                ? 'linear-gradient(135deg, #1B5E20 0%, #2E7D32 100%)'
                : 'linear-gradient(135deg, #757575 0%, #9E9E9E 100%)',
              color: 'white',
            }}
          >
            <CardContent sx={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'center' }}>
              {ultima ? (
                <>
                  <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.85)' }}>Última avaliação concluída</Typography>
                  <Typography variant="h3" fontWeight={900} sx={{ lineHeight: 1.05 }}>
                    {(Number(ultima.igs) * 100).toFixed(1)}%
                  </Typography>
                  <Box sx={{ mt: 0.5 }}>
                    <IGSBadge classificacao={ultima.classificacao} size="medium" />
                  </Box>
                  <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.75)', display: 'block', mt: 0.5 }}>
                    {fmtData(ultima.data_avaliacao)} · {ultima.tecnico_responsavel || 'Técnico não informado'}
                  </Typography>

                  {concluidas.length > 1 && (
                    <>
                      <Divider sx={{ my: 1.5, borderColor: 'rgba(255,255,255,0.2)' }} />
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {evolucaoIGS >= 0 ? <FiTrendingUp /> : <FiTrendingDown />}
                        <Typography variant="body2" fontWeight={700}>
                          {evolucaoIGS >= 0 ? '+' : ''}{(evolucaoIGS * 100).toFixed(1)}%
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.85)' }}>
                          desde a 1ª avaliação ({fmtData(primeira.data_avaliacao)})
                        </Typography>
                      </Box>
                    </>
                  )}
                  <Button
                    variant="contained"
                    sx={{ mt: 1.5, bgcolor: 'rgba(255,255,255,0.15)', '&:hover': { bgcolor: 'rgba(255,255,255,0.25)' } }}
                    startIcon={<FiEye />}
                    onClick={() => navigate(`/avaliacao/${ultima.id}`)}
                  >
                    Ver resultado completo
                  </Button>
                </>
              ) : (
                <Box sx={{ textAlign: 'center', py: 2 }}>
                  <MdOutlineEco size={40} />
                  <Typography variant="body2" sx={{ mt: 1 }}>Nenhuma avaliação concluída</Typography>
                  <Button
                    variant="contained" color="warning" sx={{ mt: 1.5 }}
                    startIcon={<FiClipboard />}
                    onClick={() => navigate(`/avaliacao/nova?propriedade=${propriedade.id}`)}
                  >
                    Iniciar primeira avaliação
                  </Button>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Abas: Histórico / Evolução / Comparativo */}
      <Card>
        <CardContent>
          <Tabs value={tab} onChange={(_, v) => setTab(v)} variant="scrollable" scrollButtons="auto" sx={{ mb: 2 }}>
            <Tab icon={<FiClipboard size={16} />} iconPosition="start" label="Histórico" sx={{ fontWeight: 600, minHeight: 44 }} />
            <Tab icon={<FiBarChart2 size={16} />} iconPosition="start" label="Evolução" sx={{ fontWeight: 600, minHeight: 44 }} disabled={timelineData.length === 0} />
            <Tab icon={<FiActivity size={16} />} iconPosition="start" label="Comparar avaliações" sx={{ fontWeight: 600, minHeight: 44 }} disabled={concluidas.length < 2} />
          </Tabs>

          {/* TAB 0 — Histórico */}
          {tab === 0 && (
            <Box>
              {timeline.length === 0 ? (
                <Alert severity="info">Nenhuma avaliação registrada para esta propriedade ainda.</Alert>
              ) : isMobile ? (
                <Grid container spacing={1.5}>
                  {timeline.map((av) => (
                    <Grid size={12} key={av.id}>
                      <Paper variant="outlined" sx={{ p: 1.5 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                          <Typography variant="subtitle2" fontWeight={700}>{fmtData(av.data_avaliacao)}</Typography>
                          {av.classificacao
                            ? <IGSBadge classificacao={av.classificacao} igs={av.igs} size="small" />
                            : <Chip label="Rascunho" size="small" color="warning" variant="outlined" />}
                        </Box>
                        <Typography variant="caption" color="text.secondary" display="block">
                          {av.tecnico_responsavel || 'Técnico não informado'}
                        </Typography>
                        <Button
                          size="small" startIcon={<FiEye />} sx={{ mt: 0.5 }}
                          onClick={() => navigate(`/avaliacao/${av.id}`)}
                        >
                          Abrir
                        </Button>
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              ) : (
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ bgcolor: 'primary.main' }}>
                      {['Data', 'Técnico', 'Ambiental', 'Econômica', 'Social', 'G&Q', 'IGS', 'Status', 'Ações'].map((h) => (
                        <TableCell key={h} sx={{ color: '#fff', fontWeight: 700 }}>{h}</TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {timeline.map((av, i) => (
                      <TableRow
                        key={av.id}
                        hover
                        sx={{ cursor: 'pointer', bgcolor: i % 2 === 0 ? 'inherit' : 'action.hover' }}
                        onClick={() => navigate(`/avaliacao/${av.id}`)}
                      >
                        <TableCell sx={{ fontWeight: 600 }}>{fmtData(av.data_avaliacao)}</TableCell>
                        <TableCell>{av.tecnico_responsavel || '—'}</TableCell>
                        {[
                          ['indice_ambiental', '#4CAF50'],
                          ['indice_economico', '#2196F3'],
                          ['indice_social', '#FF9800'],
                          ['indice_gestao_qualidade', '#9C27B0'],
                        ].map(([k, c]) => (
                          <TableCell key={k}>
                            <Typography variant="body2" fontWeight={700} color={c}>
                              {av[k] !== null && av[k] !== undefined ? `${(Number(av[k]) * 100).toFixed(0)}%` : '—'}
                            </Typography>
                          </TableCell>
                        ))}
                        <TableCell>
                          {av.classificacao
                            ? <IGSBadge classificacao={av.classificacao} igs={av.igs} size="small" />
                            : <Typography variant="caption" color="text.disabled">—</Typography>}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={av.status === 'concluida' ? 'Concluída' : 'Rascunho'} size="small"
                            color={av.status === 'concluida' ? 'success' : 'warning'} variant="outlined"
                          />
                        </TableCell>
                        <TableCell onClick={(e) => e.stopPropagation()}>
                          <IconButton size="small" color="primary" onClick={() => navigate(`/avaliacao/${av.id}`)}>
                            <FiEye size={16} />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </Box>
          )}

          {/* TAB 1 — Evolução */}
          {tab === 1 && timelineData.length > 0 && (
            <Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
                Evolução dos índices ao longo das {timelineData.length} avaliação(ões) concluída(s).
              </Typography>
              <ResponsiveContainer width="100%" height={320}>
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
            </Box>
          )}

          {/* TAB 2 — Comparar */}
          {tab === 2 && (
            <Box>
              <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Avaliação A (antes)</InputLabel>
                    <Select value={idA} label="Avaliação A (antes)" onChange={(e) => setIdA(e.target.value)}>
                      {concluidas.map((a) => (
                        <MenuItem key={a.id} value={a.id} disabled={a.id === idB}>
                          {fmtData(a.data_avaliacao)} — IGS {(Number(a.igs) * 100).toFixed(1)}%
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Avaliação B (depois)</InputLabel>
                    <Select value={idB} label="Avaliação B (depois)" onChange={(e) => setIdB(e.target.value)}>
                      {concluidas.map((a) => (
                        <MenuItem key={a.id} value={a.id} disabled={a.id === idA}>
                          {fmtData(a.data_avaliacao)} — IGS {(Number(a.igs) * 100).toFixed(1)}%
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>

              {carregandoComp && <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}><CircularProgress /></Box>}

              {comparativo && !carregandoComp && (
                <Comparativo comp={comparativo} />
              )}
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}

function Info({ icon, label, valor }) {
  return (
    <Grid size={{ xs: 12, sm: 6 }}>
      <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
        <Box sx={{ mt: 0.5, color: 'text.secondary' }}>{icon}</Box>
        <Box>
          <Typography variant="caption" color="text.secondary" display="block">{label}</Typography>
          <Typography variant="body2" fontWeight={600}>{valor}</Typography>
        </Box>
      </Box>
    </Grid>
  );
}

function Trend({ delta, hidePct = false }) {
  if (delta === null || delta === undefined) return <Chip size="small" label="—" variant="outlined" />;
  if (Math.abs(delta) < 0.005) {
    return (
      <Chip
        icon={<FiMinus size={12} />}
        size="small" label="estável"
        sx={{ bgcolor: '#ECEFF1', color: '#455A64', fontWeight: 700, fontSize: '0.7rem' }}
      />
    );
  }
  const up = delta > 0;
  const cor = up ? '#2E7D32' : '#C62828';
  const bg = up ? '#E8F5E9' : '#FFEBEE';
  return (
    <Chip
      icon={up ? <FiTrendingUp size={12} /> : <FiTrendingDown size={12} />}
      size="small"
      label={`${up ? '+' : ''}${(delta * 100).toFixed(hidePct ? 0 : 1)}${hidePct ? ' pts' : '%'}`}
      sx={{ bgcolor: bg, color: cor, fontWeight: 700, fontSize: '0.7rem' }}
    />
  );
}

function Comparativo({ comp }) {
  const navigate = useNavigate();
  const barChartData = comp.dimensoes.map((d) => ({
    nome: d.nome, cor: d.cor,
    A: Math.round(d.a * 100),
    B: Math.round(d.b * 100),
  }));

  return (
    <Box>
      {/* Cabeçalho IGS */}
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid size={{ xs: 12, sm: 4 }}>
          <Paper variant="outlined" sx={{ p: 2, textAlign: 'center', borderLeft: '4px solid #90A4AE' }}>
            <Typography variant="caption" color="text.secondary" display="block">Avaliação A</Typography>
            <Typography variant="caption" color="text.secondary">{fmtData(comp.a.data)}</Typography>
            <Typography variant="h4" fontWeight={900} sx={{ mt: 0.5 }}>
              {(comp.a.igs * 100).toFixed(1)}%
            </Typography>
            <IGSBadge classificacao={comp.a.classificacao} size="small" />
            <Button size="small" sx={{ mt: 1 }} onClick={() => navigate(`/avaliacao/${comp.a.id}`)}>Ver</Button>
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <Paper variant="outlined" sx={{ p: 2, textAlign: 'center', borderLeft: `4px solid ${comp.delta_igs >= 0 ? '#2E7D32' : '#C62828'}` }}>
            <Typography variant="caption" color="text.secondary" display="block">Variação do IGS</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mt: 1 }}>
              {comp.delta_igs >= 0 ? <FiTrendingUp size={26} color="#2E7D32" /> : <FiTrendingDown size={26} color="#C62828" />}
              <Typography variant="h4" fontWeight={900} color={comp.delta_igs >= 0 ? '#2E7D32' : '#C62828'}>
                {comp.delta_igs >= 0 ? '+' : ''}{(comp.delta_igs * 100).toFixed(1)}%
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 0.5, mt: 1, flexWrap: 'wrap' }}>
              <Chip size="small" label={`${comp.resumo.melhoraram} melhoraram`} sx={{ bgcolor: '#E8F5E9', color: '#2E7D32', fontWeight: 700 }} />
              <Chip size="small" label={`${comp.resumo.pioraram} pioraram`} sx={{ bgcolor: '#FFEBEE', color: '#C62828', fontWeight: 700 }} />
              <Chip size="small" label={`${comp.resumo.estaveis} estáveis`} sx={{ bgcolor: '#ECEFF1', color: '#455A64', fontWeight: 700 }} />
            </Box>
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <Paper variant="outlined" sx={{ p: 2, textAlign: 'center', borderLeft: '4px solid #2E7D32' }}>
            <Typography variant="caption" color="text.secondary" display="block">Avaliação B</Typography>
            <Typography variant="caption" color="text.secondary">{fmtData(comp.b.data)}</Typography>
            <Typography variant="h4" fontWeight={900} sx={{ mt: 0.5 }}>
              {(comp.b.igs * 100).toFixed(1)}%
            </Typography>
            <IGSBadge classificacao={comp.b.classificacao} size="small" />
            <Button size="small" sx={{ mt: 1 }} onClick={() => navigate(`/avaliacao/${comp.b.id}`)}>Ver</Button>
          </Paper>
        </Grid>
      </Grid>

      {/* Comparativo dimensões */}
      <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
        <Typography variant="subtitle2" fontWeight={700} gutterBottom>Variação por Dimensão</Typography>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={barChartData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
            <XAxis dataKey="nome" tick={{ fontSize: 11 }} />
            <YAxis domain={[0, 100]} unit="%" tick={{ fontSize: 11 }} />
            <RTooltip />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Bar dataKey="A" fill="#90A4AE" name="Antes" radius={[4, 4, 0, 0]} />
            <Bar dataKey="B" fill="#2E7D32" name="Depois" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
        <Table size="small" sx={{ mt: 1 }}>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 700 }}>Dimensão</TableCell>
              <TableCell sx={{ fontWeight: 700, width: 110 }}>Antes</TableCell>
              <TableCell sx={{ fontWeight: 700, width: 110 }}>Depois</TableCell>
              <TableCell sx={{ fontWeight: 700, width: 110 }}>Δ</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {comp.dimensoes.map((d) => (
              <TableRow key={d.codigo}>
                <TableCell>
                  <Typography variant="body2" fontWeight={700} color={d.cor}>{d.nome}</Typography>
                  <Typography variant="caption" color="text.secondary">peso {Math.round(d.peso * 100)}%</Typography>
                </TableCell>
                <TableCell>{(d.a * 100).toFixed(1)}%</TableCell>
                <TableCell>{(d.b * 100).toFixed(1)}%</TableCell>
                <TableCell><Trend delta={d.delta} /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>

      {/* Detalhamento por indicador */}
      <Paper variant="outlined" sx={{ p: 2 }}>
        <Typography variant="subtitle2" fontWeight={700} gutterBottom>
          Indicadores que mais mudaram
        </Typography>
        <Box sx={{ overflowX: 'auto' }}>
          <Table size="small" sx={{ minWidth: 640 }}>
            <TableHead>
              <TableRow sx={{ bgcolor: 'action.hover' }}>
                <TableCell sx={{ fontWeight: 700 }}>Indicador</TableCell>
                <TableCell sx={{ fontWeight: 700, width: 120 }}>Dimensão</TableCell>
                <TableCell sx={{ fontWeight: 700, width: 80 }}>Antes</TableCell>
                <TableCell sx={{ fontWeight: 700, width: 80 }}>Depois</TableCell>
                <TableCell sx={{ fontWeight: 700, width: 100 }}>Variação</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {comp.indicadores.map((it) => {
                const dim = DIM_INFO[it.dimensao] || {};
                return (
                  <TableRow key={it.codigo} hover>
                    <TableCell>
                      <Typography variant="body2" fontWeight={600}>{it.indicador_nome}</Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={dim.nome || it.dimensao_nome || it.dimensao}
                        size="small"
                        sx={{ bgcolor: (dim.cor || '#999') + '22', color: dim.cor || '#444', fontWeight: 700, fontSize: '0.7rem' }}
                      />
                    </TableCell>
                    <TableCell>
                      <NotaCell nota={it.nota_a} />
                    </TableCell>
                    <TableCell>
                      <NotaCell nota={it.nota_b} />
                    </TableCell>
                    <TableCell><Trend delta={it.delta} hidePct /></TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Box>
      </Paper>
    </Box>
  );
}

function NotaCell({ nota }) {
  if (nota === null || nota === undefined) return <Typography variant="caption" color="text.disabled">—</Typography>;
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
      <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: COR_NOTA[nota] || '#999' }} />
      <Typography variant="body2" fontWeight={700}>{(nota * 100).toFixed(0)}%</Typography>
    </Box>
  );
}
