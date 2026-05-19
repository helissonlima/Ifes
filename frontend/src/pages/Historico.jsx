import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, Card, CardContent, Grid, TextField, InputAdornment,
  Select, MenuItem, FormControl, InputLabel, Button, CircularProgress,
  Alert, Chip, IconButton, Divider, useMediaQuery, useTheme, LinearProgress,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
} from '@mui/material';
import { FiSearch, FiEye, FiTrash2, FiFilter, FiPlus } from 'react-icons/fi';
import { MdOutlineEco } from 'react-icons/md';
import { avaliacoesAPI } from '../services/api';
import { useApp } from '../context/AppContext';
import IGSBadge from '../components/Common/IGSBadge';

const COR_DIMS = {
  economico: '#2196F3', ambiental: '#4CAF50', social: '#FF9800', gestao: '#9C27B0',
};

export default function Historico() {
  const navigate = useNavigate();
  const { notify } = useApp();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [avaliacoes, setAvaliacoes] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('');
  const [filtroTecnico, setFiltroTecnico] = useState('');
  const [filtroLocalizacao, setFiltroLocalizacao] = useState('');
  const [search, setSearch] = useState('');
  const [excluindo, setExcluindo] = useState(null);

  const carregar = useCallback(() => {
    setLoading(true);
    avaliacoesAPI.listar({ status: filtroStatus || undefined, limit: 100 })
      .then((r) => { setAvaliacoes(r.data.data); setTotal(r.data.total); })
      .catch((e) => setErro(e.message))
      .finally(() => setLoading(false));
  }, [filtroStatus]);

  useEffect(() => { carregar(); }, [carregar]);

  const filtradas = avaliacoes.filter((a) => {
    // Filtro de status
    if (filtroStatus && a.status !== filtroStatus) return false;
    // Filtro de técnico
    if (filtroTecnico && a.tecnico_responsavel !== filtroTecnico) return false;
    // Filtro de localização (município/estado)
    if (filtroLocalizacao) {
      const [munic, estado] = filtroLocalizacao.split('/');
      if (a.municipio !== munic || a.estado !== estado) return false;
    }
    // Busca genérica
    if (!search) return true;
    return (
      a.propriedade_nome?.toLowerCase().includes(search.toLowerCase()) ||
      a.municipio?.toLowerCase().includes(search.toLowerCase()) ||
      a.proprietario?.toLowerCase().includes(search.toLowerCase()) ||
      a.tecnico_responsavel?.toLowerCase().includes(search.toLowerCase())
    );
  });

  // Extrai listas únicas para filtros
  const tecnicos = [...new Set(avaliacoes.map((a) => a.tecnico_responsavel).filter(Boolean))].sort();
  const localizacoes = [...new Set(avaliacoes.map((a) => `${a.municipio}/${a.estado}`).filter(Boolean))].sort();

  const excluir = async (id) => {
    if (!window.confirm('Excluir esta avaliação permanentemente?')) return;
    setExcluindo(id);
    try {
      await avaliacoesAPI.excluir(id);
      notify('Avaliação excluída.');
      carregar();
    } catch (e) { notify(e.message, 'error'); }
    finally { setExcluindo(null); }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h5" fontWeight={800} color="primary.dark">Histórico de Avaliações</Typography>
          <Typography variant="body2" color="text.secondary">{total} avaliação(ões) registrada(s)</Typography>
        </Box>
        <Button variant="contained" startIcon={<FiPlus />} onClick={() => navigate('/avaliacao/nova')}>
          Nova Avaliação
        </Button>
      </Box>

      {erro && <Alert severity="error" sx={{ mb: 2 }}>{erro}</Alert>}

      {/* Filtros */}
      <Card sx={{ mb: 2 }}>
        <CardContent sx={{ pb: '12px !important' }}>
          <Grid container spacing={1.5} sx={{ alignItems: 'center' }}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth size="small"
                placeholder="Buscar propriedade, município, proprietário..."
                value={search} onChange={(e) => setSearch(e.target.value)}
                slotProps={{ input: { startAdornment: <InputAdornment position="start"><FiSearch /></InputAdornment> } }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Chip
                icon={<FiFilter size={14} />}
                label={`${filtradas.length} resultado(s)`}
                color="primary" variant="outlined" size="small"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Status</InputLabel>
                <Select value={filtroStatus} label="Status" onChange={(e) => setFiltroStatus(e.target.value)}>
                  <MenuItem value="">Todos</MenuItem>
                  <MenuItem value="concluida">Concluídas</MenuItem>
                  <MenuItem value="rascunho">Rascunhos</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Técnico</InputLabel>
                <Select value={filtroTecnico} label="Técnico" onChange={(e) => setFiltroTecnico(e.target.value)}>
                  <MenuItem value="">Todos</MenuItem>
                  {tecnicos.map((t) => (
                    <MenuItem key={t} value={t}>{t}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Localização</InputLabel>
                <Select value={filtroLocalizacao} label="Localização" onChange={(e) => setFiltroLocalizacao(e.target.value)}>
                  <MenuItem value="">Todos</MenuItem>
                  {localizacoes.map((loc) => (
                    <MenuItem key={loc} value={loc}>{loc}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', pt: 6 }}><CircularProgress /></Box>
      ) : filtradas.length === 0 ? (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 6 }}>
            <MdOutlineEco size={48} color="#aaa" />
            <Typography variant="h6" color="text.secondary" mt={1}>
              {search || filtroStatus ? 'Nenhuma avaliação encontrada para este filtro.' : 'Nenhuma avaliação registrada.'}
            </Typography>
            <Button variant="contained" sx={{ mt: 2 }} onClick={() => navigate('/avaliacao/nova')} startIcon={<FiPlus />}>
              Criar primeira avaliação
            </Button>
          </CardContent>
        </Card>
      ) : isMobile ? (
        // Cards para mobile
        <Grid container spacing={2}>
          {filtradas.map((av) => (
            <Grid size={12} key={av.id}>
              <Card>
                <CardContent sx={{ pb: '12px !important' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                    <Box>
                      <Typography variant="subtitle2" fontWeight={700}>{av.propriedade_nome}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {av.municipio} · {new Date(av.data_avaliacao).toLocaleDateString('pt-BR')}
                      </Typography>
                    </Box>
                    <IGSBadge classificacao={av.classificacao} igs={av.igs} size="small" />
                  </Box>

                  {av.igs && (
                    <Box sx={{ mb: 1 }}>
                      <Grid container spacing={0.5}>
                        {[
                          { label: 'Ec', val: av.indice_economico, cor: COR_DIMS.economico },
                          { label: 'Am', val: av.indice_ambiental, cor: COR_DIMS.ambiental },
                          { label: 'So', val: av.indice_social, cor: COR_DIMS.social },
                          { label: 'G&Q', val: av.indice_gestao_qualidade, cor: COR_DIMS.gestao },
                        ].map((d) => (
                          <Grid size={3} key={d.label}>
                            <Typography variant="caption" color="text.secondary" display="block" sx={{ textAlign: 'center' }}>{d.label}</Typography>
                            <LinearProgress
                              variant="determinate"
                              value={(d.val || 0) * 100}
                              sx={{ height: 6, borderRadius: 3, bgcolor: `${d.cor}22`, '& .MuiLinearProgress-bar': { bgcolor: d.cor } }}
                            />
                            <Typography variant="caption" color={d.cor} fontWeight={700} display="block" sx={{ textAlign: 'center' }}>
                              {d.val ? `${(d.val * 100).toFixed(0)}%` : '—'}
                            </Typography>
                          </Grid>
                        ))}
                      </Grid>
                    </Box>
                  )}

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Chip
                      label={av.status === 'concluida' ? 'Concluída' : 'Rascunho'}
                      size="small"
                      color={av.status === 'concluida' ? 'success' : 'warning'}
                      variant="outlined"
                    />
                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                      <IconButton size="small" color="primary" onClick={() => navigate(`/avaliacao/${av.id}`)}>
                        <FiEye size={16} />
                      </IconButton>
                      <IconButton size="small" color="error" onClick={() => excluir(av.id)} disabled={excluindo === av.id}>
                        {excluindo === av.id ? <CircularProgress size={14} /> : <FiTrash2 size={16} />}
                      </IconButton>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : (
        // Tabela desktop
        <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: 2 }}>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: 'primary.main' }}>
                {['Propriedade', 'Município', 'Data', 'Técnico', 'Econômica', 'Ambiental', 'Social', 'G&Q', 'IGS', 'Status', 'Ações'].map((h) => (
                  <TableCell key={h} sx={{ color: 'white', fontWeight: 700, whiteSpace: 'nowrap' }}>{h}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {filtradas.map((av, i) => (
                <TableRow
                  key={av.id}
                  sx={{ bgcolor: i % 2 === 0 ? 'inherit' : 'action.hover', '&:hover': { bgcolor: 'primary.50', cursor: 'pointer' } }}
                  onClick={() => navigate(`/avaliacao/${av.id}`)}
                >
                  <TableCell><Typography variant="body2" fontWeight={600}>{av.propriedade_nome}</Typography></TableCell>
                  <TableCell><Typography variant="body2">{av.municipio}</Typography></TableCell>
                  <TableCell><Typography variant="body2">{new Date(av.data_avaliacao).toLocaleDateString('pt-BR')}</Typography></TableCell>
                  <TableCell><Typography variant="body2">{av.tecnico_responsavel || '—'}</Typography></TableCell>
                  {[
                    { val: av.indice_economico, cor: COR_DIMS.economico },
                    { val: av.indice_ambiental, cor: COR_DIMS.ambiental },
                    { val: av.indice_social, cor: COR_DIMS.social },
                    { val: av.indice_gestao_qualidade, cor: COR_DIMS.gestao },
                  ].map((d, j) => (
                    <TableCell key={j}>
                      <Typography variant="body2" fontWeight={700} color={d.cor}>
                        {d.val !== null && d.val !== undefined ? `${(d.val * 100).toFixed(0)}%` : '—'}
                      </Typography>
                    </TableCell>
                  ))}
                  <TableCell>
                    {av.classificacao ? (
                      <IGSBadge classificacao={av.classificacao} igs={av.igs} size="small" />
                    ) : <Typography variant="caption" color="text.disabled">—</Typography>}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={av.status === 'concluida' ? 'Concluída' : 'Rascunho'}
                      size="small"
                      color={av.status === 'concluida' ? 'success' : 'warning'}
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                      <IconButton size="small" color="primary" onClick={() => navigate(`/avaliacao/${av.id}`)}>
                        <FiEye size={16} />
                      </IconButton>
                      <IconButton size="small" color="error" onClick={() => excluir(av.id)} disabled={excluindo === av.id}>
                        {excluindo === av.id ? <CircularProgress size={14} /> : <FiTrash2 size={16} />}
                      </IconButton>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
}
