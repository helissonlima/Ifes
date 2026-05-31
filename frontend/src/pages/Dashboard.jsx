import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Grid, Card, CardContent, Typography, Box, Button,
  Divider, Alert, LinearProgress, Tooltip, Skeleton,
} from '@mui/material';
import { FiMap, FiClipboard, FiBarChart2, FiPlus, FiArrowRight } from 'react-icons/fi';
import { MdOutlineEco } from 'react-icons/md';
import { avaliacoesAPI } from '../services/api';
import { friendlyError } from '../utils/errorMessages';
import StatCard from '../components/Dashboard/StatCard';
import EmptyState from '../components/Common/EmptyState';
import IGSGauge from '../components/Dashboard/IGSGauge';
import DimensaoChart from '../components/Dashboard/DimensaoChart';
import IGSBadge from '../components/Common/IGSBadge';

const DIMENSOES = [
  { key: 'media_economica', label: 'Econômica', cor: '#2196F3', peso: '30%' },
  { key: 'media_ambiental', label: 'Ambiental', cor: '#4CAF50', peso: '35%' },
  { key: 'media_social', label: 'Social', cor: '#FF9800', peso: '20%' },
  { key: 'media_gestao', label: 'Gestão, Qualidade e Governança', cor: '#9C27B0', peso: '15%' },
];

export default function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [recentes, setRecentes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState('');

  const carregarDados = () => {
    setLoading(true);
    setErro('');
    Promise.all([
      avaliacoesAPI.estatisticas(),
      avaliacoesAPI.listar({ status: 'concluida', limit: 5 }),
    ])
      .then(([s, r]) => {
        setStats(s.data);
        setRecentes(r.data.data);
      })
      .catch((e) => setErro(friendlyError(e)))
      .finally(() => setLoading(false));
  };

  useEffect(() => { carregarDados(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (loading) return (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box><Skeleton width={160} height={32} /><Skeleton width={280} height={20} sx={{ mt: 0.5 }} /></Box>
        <Skeleton width={120} height={38} sx={{ borderRadius: 2 }} />
      </Box>
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {[0,1,2,3].map((i) => (
          <Grid size={{ xs: 6, md: 3 }} key={i}>
            <Card><CardContent sx={{ p: 2 }}>
              <Skeleton width="60%" height={18} />
              <Skeleton width="40%" height={40} sx={{ mt: 0.5 }} />
              <Skeleton width="80%" height={16} sx={{ mt: 0.5 }} />
            </CardContent></Card>
          </Grid>
        ))}
      </Grid>
      <Grid container spacing={2}>
        {[0,1,2].map((i) => (
          <Grid size={{ xs: 12, md: i === 0 ? 5 : i === 1 ? 4 : 3 }} key={i}>
            <Card sx={{ height: 280 }}><CardContent>
              <Skeleton width="50%" height={24} />
              <Skeleton variant="rectangular" height={220} sx={{ mt: 1, borderRadius: 1 }} />
            </CardContent></Card>
          </Grid>
        ))}
        <Grid size={12}>
          <Card><CardContent>
            <Skeleton width="30%" height={24} sx={{ mb: 1 }} />
            {[0,1,2].map((i) => <Skeleton key={i} height={48} sx={{ mb: 0.5 }} />)}
          </CardContent></Card>
        </Grid>
      </Grid>
    </Box>
  );

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h5" fontWeight={800} color="primary.dark">
            Visão Geral
          </Typography>
          <Typography variant="body2" color="text.secondary">
            ICSR — Índice Consolidado de Sustentabilidade Rural · ISA-EPAMIG / INCAPER
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<FiPlus />}
          onClick={() => navigate('/avaliacao/nova')}
          sx={{ borderRadius: 2 }}
        >
          Nova Avaliação
        </Button>
      </Box>

      {erro && (
        <Alert
          severity="error"
          sx={{ mb: 2 }}
          action={
            <Button color="inherit" size="small" onClick={carregarDados}>
              Tentar novamente
            </Button>
          }
        >
          {erro}
        </Alert>
      )}

      {/* Cards de estatísticas */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 6, md: 3 }}>
          <StatCard
            title="Propriedades"
            value={stats?.total_propriedades ?? '—'}
            subtitle="cadastradas"
            icon={<FiMap size={22} />}
            color="primary.main"
          />
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <StatCard
            title="Avaliações"
            value={stats?.total_avaliacoes ?? '—'}
            subtitle={`${stats?.avaliacoes_concluidas ?? 0} concluídas`}
            icon={<FiClipboard size={22} />}
            color="info.main"
          />
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <StatCard
            title="ICSR Médio"
            value={stats?.media_igs ? `${(stats.media_igs * 100).toFixed(1)}%` : '—'}
            subtitle="média geral"
            icon={<MdOutlineEco size={22} />}
            color="success.main"
          />
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <StatCard
            title="Indicadores"
            value="32"
            subtitle="em 4 dimensões"
            icon={<FiBarChart2 size={22} />}
            color="secondary.main"
          />
        </Grid>
      </Grid>

      <Grid container spacing={2}>
        {/* Gauge + Radar */}
        <Grid size={{ xs: 12, md: 5 }}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" fontWeight={700} gutterBottom>
                ICSR Médio Geral
              </Typography>
              <IGSGauge
                igs={stats?.media_igs ?? 0}
                classificacao={getClassificacao(stats?.media_igs)}
              />
              <Divider sx={{ my: 2 }} />
              <Typography variant="subtitle2" fontWeight={700} gutterBottom>
                Por Dimensão
              </Typography>
              {DIMENSOES.map((d) => (
                <Box key={d.key} sx={{ mb: 1.5 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="caption" fontWeight={600}>{d.label}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {stats?.[d.key] ? `${(stats[d.key] * 100).toFixed(1)}%` : '—'} · peso {d.peso}
                    </Typography>
                  </Box>
                  <Tooltip title={`${d.label}: ${d.peso} do IGS`}>
                    <LinearProgress
                      variant="determinate"
                      value={stats?.[d.key] ? Math.min(stats[d.key] * 100, 100) : 0}
                      sx={{
                        height: 8, borderRadius: 4,
                        bgcolor: `${d.cor}22`,
                        '& .MuiLinearProgress-bar': { bgcolor: d.cor },
                      }}
                    />
                  </Tooltip>
                </Box>
              ))}
            </CardContent>
          </Card>
        </Grid>

        {/* Radar */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" fontWeight={700} gutterBottom>
                Perfil de Sustentabilidade
              </Typography>
              <DimensaoChart
                economica={stats?.media_economica}
                ambiental={stats?.media_ambiental}
                social={stats?.media_social}
                gestao={stats?.media_gestao}
              />
            </CardContent>
          </Card>
        </Grid>

        {/* Distribuição por classificação */}
        <Grid size={{ xs: 12, md: 3 }}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" fontWeight={700} gutterBottom>
                Distribuição
              </Typography>
              {stats?.distribuicao_classificacao?.length > 0 ? (
                stats.distribuicao_classificacao.map((item) => (
                  <Box key={item.classificacao} sx={{ mb: 1.5 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <IGSBadge classificacao={item.classificacao} size="small" />
                      <Typography variant="body2" fontWeight={700}>{item.quantidade}</Typography>
                    </Box>
                  </Box>
                ))
              ) : (
                <EmptyState
                  icon={<MdOutlineEco size={36} />}
                  title="Nenhuma avaliação concluída"
                  description="Conclua a primeira avaliação para ver a distribuição por classificação de sustentabilidade."
                  actionLabel="Nova avaliação"
                  onAction={() => navigate('/avaliacao/nova')}
                  small
                />
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Avaliações recentes */}
        <Grid size={12}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" fontWeight={700}>Avaliações Recentes</Typography>
                <Button size="small" endIcon={<FiArrowRight />} onClick={() => navigate('/historico')}>
                  Ver todas
                </Button>
              </Box>
              {recentes.length === 0 ? (
                <EmptyState
                  icon={<FiClipboard size={28} />}
                  title="Nenhuma avaliação concluída"
                  description="Cadastre uma propriedade rural e inicie a primeira avaliação ICSR para ver os resultados aqui."
                  actionLabel="Criar primeira avaliação"
                  onAction={() => navigate('/avaliacao/nova')}
                  small
                />
              ) : (
                recentes.map((av, i) => (
                  <Box key={av.id}>
                    {i > 0 && <Divider sx={{ my: 1 }} />}
                    <Box
                      sx={{ display: 'flex', alignItems: 'center', gap: 2, cursor: 'pointer', py: 1, borderRadius: 1, px: 1, '&:hover': { bgcolor: 'action.hover' } }}
                      onClick={() => navigate(`/avaliacao/${av.id}`)}
                    >
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="subtitle2" fontWeight={700}>{av.propriedade_nome}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {av.municipio} · {new Date(av.data_avaliacao).toLocaleDateString('pt-BR')} · {av.tecnico_responsavel || 'Técnico'}
                        </Typography>
                      </Box>
                      <IGSBadge classificacao={av.classificacao} igs={av.igs} size="small" />
                    </Box>
                  </Box>
                ))
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}

function getClassificacao(igs) {
  if (!igs) return null;
  if (igs <= 0.20) return 'Muito Baixa';
  if (igs <= 0.40) return 'Baixa';
  if (igs <= 0.60) return 'Moderada';
  if (igs <= 0.80) return 'Boa';
  return 'Alta';
}
