import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, Card, CardContent, Grid, TextField, InputAdornment,
  Select, MenuItem, FormControl, InputLabel, Button, CircularProgress,
  Alert, Chip, IconButton, Divider, useMediaQuery, useTheme, LinearProgress, Skeleton,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Pagination,
  Checkbox, Tooltip,
} from '@mui/material';
import { FiSearch, FiEye, FiTrash2, FiFilter, FiPlus, FiWifiOff, FiGitPullRequest, FiX } from 'react-icons/fi';
import { MdOutlineEco } from 'react-icons/md';
import { avaliacoesAPI } from '../services/api';
import { useApp } from '../context/AppContext';
import IGSBadge from '../components/Common/IGSBadge';
import EmptyState from '../components/Common/EmptyState';
import { friendlyError } from '../utils/errorMessages';
import { formatarData } from '../utils/formatarData';
import PageHeaderCard from '../components/Common/PageHeaderCard';
import ConfirmDialog from '../components/Common/ConfirmDialog';
import CachedDataBanner from '../components/Common/CachedDataBanner';
import ComparativoAvaliacoesDialog from '../components/Evaluation/ComparativoAvaliacoesDialog';

const COR_DIMS = {
  economico: '#2196F3', ambiental: '#4CAF50', social: '#FF9800', gestao: '#9C27B0',
};

// Paginado no servidor (M10.5) — antes buscava sempre limit:100 e truncava
// silenciosamente qualquer avaliação além da centésima, sem forma de ver o
// resto. Os filtros de técnico/localização/busca continuam client-side,
// dentro da página carregada (ver PLANO_MELHORIAS.md M10.5).
const ITENS_POR_PAGINA = 20;

export default function Historico() {
  const navigate = useNavigate();
  const { notify } = useApp();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [avaliacoes, setAvaliacoes] = useState([]);
  const [total, setTotal] = useState(0);
  const [pagina, setPagina] = useState(1);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState('');
  const [dadosEmCache, setDadosEmCache] = useState(false);
  const [filtroStatus, setFiltroStatus] = useState('');
  const [filtroTecnico, setFiltroTecnico] = useState('');
  const [filtroLocalizacao, setFiltroLocalizacao] = useState('');
  const [search, setSearch] = useState('');
  const [excluindo, setExcluindo] = useState(null);
  const [confirmExcluir, setConfirmExcluir] = useState(null); // { id, nome } | null

  // Comparativo entre 2 avaliações (M10.1)
  const [modoComparar, setModoComparar] = useState(false);
  const [selecionadas, setSelecionadas] = useState([]); // até 2: [{ id, nome }]
  const [comparativoAberto, setComparativoAberto] = useState(false);

  const alternarSelecao = (av) => {
    setSelecionadas((atual) => {
      if (atual.some((s) => s.id === av.id)) return atual.filter((s) => s.id !== av.id);
      if (atual.length >= 2) return atual; // já tem 2 — ignora até desmarcar uma
      return [...atual, { id: av.id, nome: av.propriedade_nome }];
    });
  };

  const sairDoModoComparar = () => {
    setModoComparar(false);
    setSelecionadas([]);
  };

  // Muda o filtro de status (server-side): volta pra 1ª página, senão a
  // página atual pode simplesmente não existir mais no resultado filtrado.
  const mudarFiltroStatus = (valor) => {
    setFiltroStatus(valor);
    setPagina(1);
  };

  const carregar = useCallback(() => {
    setLoading(true);
    setErro('');
    avaliacoesAPI.listar({ status: filtroStatus || undefined, page: pagina, limit: ITENS_POR_PAGINA })
      .then((r) => {
        setAvaliacoes(r.data.data);
        setTotal(r.data.total);
        setDadosEmCache(Boolean(r.fromCache));
      })
      .catch((e) => setErro(friendlyError(e)))
      .finally(() => setLoading(false));
  }, [filtroStatus, pagina]);

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

  const pedirExclusao = (id, nomePropriedade) => setConfirmExcluir({ id, nome: nomePropriedade });

  const confirmarExclusao = async () => {
    const { id, nome } = confirmExcluir;
    setExcluindo(id);
    try {
      await avaliacoesAPI.excluir(id);
      notify(`Avaliação de "${nome || 'propriedade'}" excluída com sucesso.`, 'success');
      setConfirmExcluir(null);
      carregar();
    } catch (e) { notify(friendlyError(e), 'error'); }
    finally { setExcluindo(null); }
  };

  return (
    <Box>
      <PageHeaderCard
        title="Histórico de Avaliações"
        subtitle={`${total} avaliação(ões) registrada(s)`}
        actions={(
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant={modoComparar ? 'contained' : 'outlined'}
              color={modoComparar ? 'secondary' : 'primary'}
              startIcon={modoComparar ? <FiX /> : <FiGitPullRequest />}
              onClick={() => (modoComparar ? sairDoModoComparar() : setModoComparar(true))}
            >
              {modoComparar ? 'Cancelar comparação' : 'Comparar'}
            </Button>
            <Button variant="contained" startIcon={<FiPlus />} onClick={() => navigate('/avaliacao/nova')}>
              Nova Avaliação
            </Button>
          </Box>
        )}
      />

      {erro && avaliacoes.length > 0 && <Alert severity="error" sx={{ mb: 2 }}>{erro}</Alert>}
      {dadosEmCache && !erro && (
        <CachedDataBanner mensagem="Histórico exibido a partir do cache local. Os registros podem não refletir alterações mais recentes do servidor." />
      )}

      {modoComparar && (
        <Alert
          severity="info"
          variant="outlined"
          sx={{ mb: 2 }}
          action={selecionadas.length === 2 && (
            <Button color="inherit" size="small" variant="outlined" onClick={() => setComparativoAberto(true)}>
              Comparar selecionadas
            </Button>
          )}
        >
          {selecionadas.length === 0 && 'Selecione 2 avaliações concluídas para comparar.'}
          {selecionadas.length === 1 && `"${selecionadas[0].nome}" selecionada — escolha mais uma.`}
          {selecionadas.length === 2 && `Pronto: "${selecionadas[0].nome}" e "${selecionadas[1].nome}".`}
        </Alert>
      )}

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
                <Select value={filtroStatus} label="Status" onChange={(e) => mudarFiltroStatus(e.target.value)}>
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
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          {[0, 1, 2, 3, 4].map((i) => (
            <Skeleton key={i} variant="rectangular" height={56} sx={{ borderRadius: 2 }} />
          ))}
        </Box>
      ) : erro && avaliacoes.length === 0 ? (
        <Card>
          <CardContent>
            <EmptyState
              icon={<FiWifiOff size={40} />}
              title="Não foi possível carregar o histórico"
              description={erro}
              actionLabel="Tentar novamente"
              onAction={carregar}
            />
          </CardContent>
        </Card>
      ) : filtradas.length === 0 ? (
        <Card>
          <CardContent>
            <EmptyState
              icon={<MdOutlineEco size={40} />}
              title={search || filtroStatus ? 'Nenhuma avaliação encontrada' : 'Nenhuma avaliação registrada'}
              description={search || filtroStatus ? 'Ajuste os filtros ou o termo de busca.' : 'Cadastre uma propriedade e inicie a primeira avaliação ICSR.'}
            />
          </CardContent>
        </Card>
      ) : isMobile ? (
        // Cards para mobile
        <Grid container spacing={2}>
          {filtradas.map((av) => {
            const podeComparar = av.status === 'concluida';
            const selecionada = selecionadas.some((s) => s.id === av.id);
            return (
            <Grid size={12} key={av.id}>
              <Card sx={modoComparar && selecionada ? { border: '2px solid', borderColor: 'primary.main' } : undefined}>
                <CardContent sx={{ pb: '12px !important' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 0.5 }}>
                      {modoComparar && (
                        <Tooltip title={podeComparar ? 'Selecionar para comparar' : 'Só avaliações concluídas podem ser comparadas'}>
                          <span>
                            <Checkbox
                              size="small"
                              checked={selecionada}
                              disabled={!podeComparar || (!selecionada && selecionadas.length >= 2)}
                              onChange={() => alternarSelecao(av)}
                              slotProps={{ input: { 'aria-label': `Selecionar avaliação de ${av.propriedade_nome} para comparar` } }}
                              sx={{ mt: -0.5, ml: -1 }}
                            />
                          </span>
                        </Tooltip>
                      )}
                      <Box>
                        <Typography variant="subtitle2" fontWeight={700}>{av.propriedade_nome}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {av.municipio} · {formatarData(av.data_avaliacao)}
                        </Typography>
                      </Box>
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
                          { label: 'IGQG', val: av.indice_gestao_qualidade, cor: COR_DIMS.gestao },
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
                      <IconButton size="small" color="primary" onClick={() => navigate(`/avaliacao/${av.id}`)} aria-label={`Ver avaliação de ${av.propriedade_nome}`}>
                        <FiEye size={16} />
                      </IconButton>
                      <IconButton size="small" color="error" onClick={() => pedirExclusao(av.id, av.propriedade_nome)} disabled={excluindo === av.id} aria-label={`Excluir avaliação de ${av.propriedade_nome}`}>
                        {excluindo === av.id ? <CircularProgress size={14} /> : <FiTrash2 size={16} />}
                      </IconButton>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            );
          })}
        </Grid>
      ) : (
        // Tabela desktop
        <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: 2 }}>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: 'primary.main' }}>
                {modoComparar && <TableCell sx={{ color: 'white', width: 48 }} />}
                {['Propriedade', 'Município', 'Data', 'Técnico', 'Econômica', 'Ambiental', 'Social', 'IGQG', 'ICSR', 'Status', 'Ações'].map((h) => (
                  <TableCell key={h} sx={{ color: 'white', fontWeight: 700, whiteSpace: 'nowrap' }}>{h}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {filtradas.map((av, i) => {
                const podeComparar = av.status === 'concluida';
                const selecionada = selecionadas.some((s) => s.id === av.id);
                return (
                <TableRow
                  key={av.id}
                  sx={{
                    bgcolor: modoComparar && selecionada ? 'primary.50' : i % 2 === 0 ? 'inherit' : 'action.hover',
                    '&:hover': { bgcolor: 'primary.50', cursor: 'pointer' },
                  }}
                  onClick={() => navigate(`/avaliacao/${av.id}`)}
                >
                  {modoComparar && (
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <Tooltip title={podeComparar ? 'Selecionar para comparar' : 'Só avaliações concluídas podem ser comparadas'}>
                        <span>
                          <Checkbox
                            size="small"
                            checked={selecionada}
                            disabled={!podeComparar || (!selecionada && selecionadas.length >= 2)}
                            onChange={() => alternarSelecao(av)}
                            slotProps={{ input: { 'aria-label': `Selecionar avaliação de ${av.propriedade_nome} para comparar` } }}
                          />
                        </span>
                      </Tooltip>
                    </TableCell>
                  )}
                  <TableCell><Typography variant="body2" fontWeight={600}>{av.propriedade_nome}</Typography></TableCell>
                  <TableCell><Typography variant="body2">{av.municipio}</Typography></TableCell>
                  <TableCell><Typography variant="body2">{formatarData(av.data_avaliacao)}</Typography></TableCell>
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
                      <IconButton size="small" color="error" onClick={() => pedirExclusao(av.id, av.propriedade_nome)} disabled={excluindo === av.id} aria-label={`Excluir avaliação de ${av.propriedade_nome}`}>
                        {excluindo === av.id ? <CircularProgress size={14} /> : <FiTrash2 size={16} />}
                      </IconButton>
                    </Box>
                  </TableCell>
                </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {!loading && !erro && total > ITENS_POR_PAGINA && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2.5 }}>
          <Pagination
            count={Math.ceil(total / ITENS_POR_PAGINA)}
            page={pagina}
            onChange={(_, p) => setPagina(p)}
            color="primary"
            shape="rounded"
            siblingCount={isMobile ? 0 : 1}
          />
        </Box>
      )}

      <ConfirmDialog
        open={!!confirmExcluir}
        title="Excluir avaliação"
        message={`Excluir a avaliação de "${confirmExcluir?.nome || 'esta propriedade'}" permanentemente? Esta ação não pode ser desfeita.`}
        confirmLabel="Excluir"
        onConfirm={confirmarExclusao}
        onCancel={() => setConfirmExcluir(null)}
        loading={excluindo === confirmExcluir?.id}
      />

      <ComparativoAvaliacoesDialog
        open={comparativoAberto}
        onClose={() => setComparativoAberto(false)}
        idA={selecionadas[0]?.id}
        idB={selecionadas[1]?.id}
      />
    </Box>
  );
}
