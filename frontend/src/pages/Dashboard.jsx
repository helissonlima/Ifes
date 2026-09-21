import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Grid, Card, CardContent, Typography, Box, Button,
  Divider, Alert, LinearProgress, Tooltip, Skeleton, Chip,
} from '@mui/material';
import { FiMap, FiClipboard, FiBarChart2, FiPlus, FiArrowRight, FiTarget, FiTrendingUp, FiWifiOff } from 'react-icons/fi';
import { MdOutlineEco } from 'react-icons/md';
import { avaliacoesAPI } from '../services/api';
import { friendlyError } from '../utils/errorMessages';
import { useMetodologia, getClassificacao } from '../utils/metodologia';
import { formatarData } from '../utils/formatarData';
import StatCard from '../components/Dashboard/StatCard';
import EmptyState from '../components/Common/EmptyState';
import IGSGauge from '../components/Dashboard/IGSGauge';
import DimensaoChart from '../components/Dashboard/DimensaoChart';
import IGSBadge from '../components/Common/IGSBadge';
import PageHeaderCard from '../components/Common/PageHeaderCard';
import CachedDataBanner from '../components/Common/CachedDataBanner';

// Nome do campo de cada dimensão na resposta de GET /avaliacoes/estatisticas
// (médias agregadas — convenção própria dessa API).
const CAMPO_STATS_POR_DIMENSAO = {
  economica: 'media_economica',
  ambiental: 'media_ambiental',
  social: 'media_social',
  gestao_qualidade: 'media_gestao',
};

export default function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [recentes, setRecentes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState('');
  const [dadosEmCache, setDadosEmCache] = useState(false);
  const { metodologia, dimInfo, erro: erroMetodologia, recarregar: recarregarMetodologia } = useMetodologia();
  const DIMENSOES = dimInfo && Object.values(dimInfo).map((info) => ({
    key: CAMPO_STATS_POR_DIMENSAO[info.codigo],
    label: info.nome,
    cor: info.cor,
    peso: `${info.pesoPercentual}%`,
  }));

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
        setDadosEmCache(Boolean(s.fromCache || r.fromCache));
      })
      .catch((e) => setErro(friendlyError(e)))
      .finally(() => setLoading(false));
  };

  useEffect(() => { carregarDados(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (loading || (!DIMENSOES && !erroMetodologia)) return (
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

  // Sem a metodologia (pesos/escala) não dá pra montar o painel — em vez de
  // ficar preso no skeleton pra sempre (ex.: 1º acesso offline, sem cache
  // ainda salvo), mostra um estado claro com opção de tentar de novo.
  if (!DIMENSOES) return (
    <Box>
      <PageHeaderCard
        title="Visão Geral"
        subtitle="ICSR — Índice Consolidado de Sustentabilidade Rural · referência metodológica regional"
      />
      <Card>
        <CardContent>
          <EmptyState
            icon={<FiWifiOff size={40} />}
            title="Não foi possível carregar o painel"
            description={friendlyError(erroMetodologia)}
            actionLabel="Tentar novamente"
            onAction={() => { recarregarMetodologia(); carregarDados(); }}
          />
        </CardContent>
      </Card>
    </Box>
  );

  const classificacaoMedia = getClassificacao(stats?.media_igs, metodologia?.escala);
  const dimensaoPrioritaria = getDimensaoPrioritaria(stats, DIMENSOES);

  return (
    <Box>
      <PageHeaderCard
        title="Visão Geral"
        subtitle="ICSR — Índice Consolidado de Sustentabilidade Rural · referência metodológica regional"
        actions={(
          <Button
            variant="contained"
            startIcon={<FiPlus />}
            onClick={() => navigate('/avaliacao/nova')}
            sx={{ borderRadius: 2 }}
          >
            Nova Avaliação
          </Button>
        )}
      />

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

      {dadosEmCache && !erro && (
        <CachedDataBanner mensagem="Painel carregado do cache local. Use este resumo como referência rápida e atualize novamente quando a conexão estabilizar." />
      )}

      <Card
        sx={{
          mb: 3,
          bgcolor: '#FFFFFF',
          border: '1px solid rgba(15, 23, 42, 0.08)',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.04)',
        }}
      >
        <CardContent sx={{ p: { xs: 2.5, md: 3 } }}>
          <Grid container spacing={3} alignItems="center">
            <Grid size={{ xs: 12, md: 8 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <Typography
                  variant="caption"
                  sx={{
                    fontWeight: 700,
                    color: '#1B4D24',
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    fontSize: '0.72rem',
                  }}
                >
                  Diagnóstico Operacional do Território
                </Typography>
              </Box>
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 800,
                  color: '#0F172A',
                  letterSpacing: '-0.02em',
                  mb: 1.25,
                }}
              >
                {classificacaoMedia ? `ICSR médio consolidado em ${classificacaoMedia}` : 'Ainda não há base suficiente para leitura consolidada'}
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  color: '#475569',
                  lineHeight: 1.6,
                  mb: 2.5,
                  fontSize: '0.92rem',
                }}
              >
                {dimensaoPrioritaria
                  ? `A dimensão com menor desempenho relativo é ${dimensaoPrioritaria.label}. Recomenda-se priorizar as ações de assistência técnica nos indicadores dessa dimensão nas próximas visitas de campo.`
                  : 'Cadastre e conclua avaliações de propriedades rurais para transformar este painel em uma leitura estratégica do território.'}
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {classificacaoMedia && <IGSBadge classificacao={classificacaoMedia} igs={stats?.media_igs} size="medium" />}
                {dimensaoPrioritaria && (
                  <Chip
                    icon={<FiTarget size={13} />}
                    label={`Foco prioritário: ${dimensaoPrioritaria.label}`}
                    variant="outlined"
                    sx={{
                      borderColor: 'rgba(15, 23, 42, 0.18)',
                      fontWeight: 600,
                      color: '#334155',
                      fontSize: '0.78rem',
                    }}
                  />
                )}
                <Chip
                  icon={<FiTrendingUp size={13} />}
                  label={`${stats?.avaliacoes_concluidas ?? 0} avaliações concluídas`}
                  variant="outlined"
                  sx={{
                    borderColor: 'rgba(27, 77, 36, 0.25)',
                    bgcolor: 'rgba(27, 77, 36, 0.04)',
                    fontWeight: 600,
                    color: '#1B4D24',
                    fontSize: '0.78rem',
                  }}
                />
              </Box>
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <Box
                sx={{
                  p: 2.5,
                  borderRadius: 2,
                  bgcolor: 'rgba(27, 77, 36, 0.03)',
                  border: '1px solid rgba(27, 77, 36, 0.08)',
                  textAlign: 'center',
                }}
              >
                <Typography
                  variant="caption"
                  sx={{
                    fontWeight: 700,
                    color: '#64748B',
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                    fontSize: '0.7rem',
                    display: 'block',
                    mb: 1,
                  }}
                >
                  Índice Médio Consolidado
                </Typography>
                <IGSGauge
                  igs={stats?.media_igs ?? 0}
                  classificacao={classificacaoMedia}
                  size={160}
                />
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Cards de estatísticas */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 6, md: 3 }}>
          <StatCard
            title="Propriedades"
            value={stats?.total_propriedades ?? '—'}
            subtitle="cadastradas no sistema"
            icon={<FiMap size={18} />}
            color="primary.main"
          />
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <StatCard
            title="Avaliações"
            value={stats?.total_avaliacoes ?? '—'}
            subtitle={`${stats?.avaliacoes_concluidas ?? 0} concluídas em campo`}
            icon={<FiClipboard size={18} />}
            color="info.main"
          />
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <StatCard
            title="ICSR Médio"
            value={stats?.media_igs ? `${(stats.media_igs * 100).toFixed(1)}%` : '—'}
            subtitle="desempenho territorial"
            icon={<MdOutlineEco size={18} />}
            color="success.main"
          />
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <StatCard
            title="Indicadores"
            value="32"
            subtitle="em 4 dimensões científicas"
            icon={<FiBarChart2 size={18} />}
            color="secondary.main"
          />
        </Grid>
      </Grid>

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, lg: 6 }}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, gap: 2, flexWrap: 'wrap' }}>
                <Box>
                  <Typography variant="h6" fontWeight={700}>Avaliações Recentes</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Use este bloco para retomar rapidamente a última conversa registrada em campo.
                  </Typography>
                </Box>
                <Button size="small" endIcon={<FiArrowRight />} onClick={() => navigate('/historico')}>
                  Ver todas
                </Button>
              </Box>
              {recentes.length === 0 ? (
                <EmptyState
                  icon={<FiClipboard size={28} />}
                  title="Nenhuma avaliação concluída"
                  description="Cadastre uma propriedade rural e inicie a primeira avaliação ICSR para ver os resultados aqui."
                  small
                />
              ) : (
                recentes.map((av, i) => (
                  <Box key={av.id}>
                    {i > 0 && <Divider sx={{ my: 1 }} />}
                    <Box
                      sx={{ display: 'flex', alignItems: 'center', gap: 2, cursor: 'pointer', py: 1.25, borderRadius: 1, px: 1, '&:hover': { bgcolor: 'action.hover' } }}
                      onClick={() => navigate(`/avaliacao/${av.id}`)}
                    >
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="subtitle2" fontWeight={700}>{av.propriedade_nome}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {av.municipio} · {formatarData(av.data_avaliacao)} · {av.tecnico_responsavel || 'Técnico'}
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

        <Grid size={{ xs: 12, md: 6, lg: 3 }}>
          <Card sx={{ height: '100%', bgcolor: '#FFFFFF' }}>
            <CardContent sx={{ p: 2.5 }}>
              <Typography variant="h6" fontWeight={700} sx={{ fontSize: '1rem', mb: 2 }}>
                Desempenho por Dimensão
              </Typography>
              {DIMENSOES.map((d) => (
                <Box key={d.key} sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.6 }}>
                    <Typography variant="caption" fontWeight={700} sx={{ color: '#334155' }}>
                      {d.label}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#64748B', fontVariantNumeric: 'tabular-nums' }}>
                      {stats?.[d.key] ? `${(stats[d.key] * 100).toFixed(1)}%` : '—'} <Box component="span" sx={{ color: '#94A3B8' }}>(peso {d.peso})</Box>
                    </Typography>
                  </Box>
                  <Tooltip title={`${d.label}: peso ${d.peso} no ICSR consolidado`}>
                    <LinearProgress
                      variant="determinate"
                      value={stats?.[d.key] ? Math.min(stats[d.key] * 100, 100) : 0}
                      sx={{
                        height: 7,
                        borderRadius: 3.5,
                        bgcolor: 'rgba(15, 23, 42, 0.06)',
                        '& .MuiLinearProgress-bar': { bgcolor: d.cor, borderRadius: 3.5 },
                      }}
                    />
                  </Tooltip>
                </Box>
              ))}
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 6, lg: 3 }}>
          <Card sx={{ height: '100%', bgcolor: '#FFFFFF' }}>
            <CardContent sx={{ p: 2.5 }}>
              <Typography variant="h6" fontWeight={700} sx={{ fontSize: '1rem', mb: 2 }}>
                Distribuição das Avaliações
              </Typography>
              {stats?.distribuicao_classificacao?.length > 0 ? (
                stats.distribuicao_classificacao.map((item) => (
                  <Box
                    key={item.classificacao}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      py: 1,
                      borderBottom: '1px solid rgba(15, 23, 42, 0.05)',
                      '&:last-child': { borderBottom: 'none' },
                    }}
                  >
                    <IGSBadge classificacao={item.classificacao} size="small" />
                    <Typography
                      variant="body2"
                      fontWeight={700}
                      sx={{ color: '#0F172A', fontVariantNumeric: 'tabular-nums' }}
                    >
                      {item.quantidade} <Box component="span" sx={{ fontWeight: 400, color: '#64748B', fontSize: '0.78rem' }}>propriedades</Box>
                    </Typography>
                  </Box>
                ))
              ) : (
                <EmptyState
                  icon={<MdOutlineEco size={32} />}
                  title="Sem avaliações concluídas"
                  description="Conclua a primeira avaliação para visualizar a distribuição territorial por nível de sustentabilidade."
                  small
                />
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12 }}>
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
      </Grid>
    </Box>
  );
}

function getDimensaoPrioritaria(stats, dimensoes) {
  if (!stats || !dimensoes) return null;
  return dimensoes
    .map((d) => ({ ...d, valor: stats[d.key] }))
    .filter((d) => typeof d.valor === 'number')
    .sort((a, b) => a.valor - b.valor)[0] || null;
}
