import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Alert from '../components/ui/Alert';
import Badge from '../components/ui/Badge';
import Progress from '../components/ui/Progress';
import Skeleton from '../components/ui/Skeleton';
import Tooltip from '../components/ui/Tooltip';

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

  if (loading || (!DIMENSOES && !erroMetodologia)) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-8 w-44" />
            <Skeleton className="h-4 w-72" />
          </div>
          <Skeleton className="h-10 w-36 rounded-lg" />
        </div>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <Card key={i} className="p-4">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="mt-3 h-8 w-16" />
              <Skeleton className="mt-2 h-3 w-32" />
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-12">
          <div className="md:col-span-5">
            <Card className="h-72 p-4">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="mt-4 h-48 w-full rounded-lg" />
            </Card>
          </div>
          <div className="md:col-span-4">
            <Card className="h-72 p-4">
              <Skeleton className="h-5 w-36" />
              <Skeleton className="mt-4 h-48 w-full rounded-lg" />
            </Card>
          </div>
          <div className="md:col-span-3">
            <Card className="h-72 p-4">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="mt-4 h-48 w-full rounded-lg" />
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // Sem a metodologia (pesos/escala) não dá pra montar o painel
  if (!DIMENSOES) {
    return (
      <div>
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
      </div>
    );
  }

  const classificacaoMedia = getClassificacao(stats?.media_igs, metodologia?.escala);
  const dimensaoPrioritaria = getDimensaoPrioritaria(stats, DIMENSOES);

  return (
    <div className="space-y-6">
      <PageHeaderCard
        title="Visão Geral"
        subtitle="ICSR — Índice Consolidado de Sustentabilidade Rural · referência metodológica regional"
        actions={
          <Button
            variant="primary"
            icon={<FiPlus />}
            onClick={() => navigate('/avaliacao/nova')}
          >
            Nova Avaliação
          </Button>
        }
      />

      {erro && (
        <Alert
          variant="error"
          action={
            <Button variant="secondary" size="sm" onClick={carregarDados}>
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

      {/* Banner Diagnóstico Operacional */}
      <Card className="border-slate-200/80 shadow-xs">
        <CardContent className="p-5 sm:p-6">
          <div className="grid grid-cols-1 items-center gap-6 md:grid-cols-12">
            <div className="md:col-span-8">
              <span className="block text-xs font-bold uppercase tracking-wider text-caparao-700">
                Diagnóstico Operacional do Território
              </span>
              <h2 className="mt-1 text-xl sm:text-2xl font-black tracking-tight text-slate-900">
                {classificacaoMedia ? `ICSR médio consolidado em ${classificacaoMedia}` : 'Ainda não há base suficiente para leitura consolidada'}
              </h2>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                {dimensaoPrioritaria
                  ? `A dimensão com menor desempenho relativo é ${dimensaoPrioritaria.label}. Recomenda-se priorizar as ações de assistência técnica nos indicadores dessa dimensão nas próximas visitas de campo.`
                  : 'Cadastre e conclua avaliações de propriedades rurais para transformar este painel em uma leitura estratégica do território.'}
              </p>
              <div className="mt-4 flex flex-wrap items-center gap-2">
                {classificacaoMedia && (
                  <IGSBadge classificacao={classificacaoMedia} igs={stats?.media_igs} size="medium" />
                )}
                {dimensaoPrioritaria && (
                  <Badge variant="outline" className="gap-1 text-slate-700">
                    <FiTarget size={13} />
                    Foco prioritário: {dimensaoPrioritaria.label}
                  </Badge>
                )}
                <Badge variant="primary" className="gap-1">
                  <FiTrendingUp size={13} />
                  {stats?.avaliacoes_concluidas ?? 0} avaliações concluídas
                </Badge>
              </div>
            </div>

            <div className="md:col-span-4">
              <div className="rounded-xl border border-caparao-100 bg-caparao-50/40 p-4 text-center">
                <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Índice Médio Consolidado
                </span>
                <IGSGauge
                  igs={stats?.media_igs ?? 0}
                  classificacao={classificacaoMedia}
                  size={160}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cards de estatísticas */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard
          title="Propriedades"
          value={stats?.total_propriedades ?? '—'}
          subtitle="cadastradas no sistema"
          icon={<FiMap size={18} />}
        />
        <StatCard
          title="Avaliações"
          value={stats?.total_avaliacoes ?? '—'}
          subtitle={`${stats?.avaliacoes_concluidas ?? 0} concluídas em campo`}
          icon={<FiClipboard size={18} />}
        />
        <StatCard
          title="ICSR Médio"
          value={stats?.media_igs ? `${(stats.media_igs * 100).toFixed(1)}%` : '—'}
          subtitle="desempenho territorial"
          icon={<MdOutlineEco size={18} />}
        />
        <StatCard
          title="Indicadores"
          value="32"
          subtitle="em 4 dimensões científicas"
          icon={<FiBarChart2 size={18} />}
        />
      </div>

      {/* Seção Principal de Conteúdo */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Avaliações Recentes */}
        <div className="lg:col-span-6">
          <Card className="h-full">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle className="text-base font-bold text-slate-900">
                  Avaliações Recentes
                </CardTitle>
                <p className="text-xs text-slate-500 mt-0.5">
                  Retome rapidamente a última conversa registrada em campo.
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                icon={<FiArrowRight />}
                onClick={() => navigate('/historico')}
              >
                Ver todas
              </Button>
            </CardHeader>
            <CardContent>
              {recentes.length === 0 ? (
                <EmptyState
                  icon={<FiClipboard size={28} />}
                  title="Nenhuma avaliação concluída"
                  description="Cadastre uma propriedade rural e inicie a primeira avaliação ICSR para ver os resultados aqui."
                  small
                />
              ) : (
                <div className="divide-y divide-slate-100">
                  {recentes.map((av) => (
                    <div
                      key={av.id}
                      onClick={() => navigate(`/avaliacao/${av.id}`)}
                      className="flex items-center justify-between gap-4 py-3 px-2 rounded-lg cursor-pointer hover:bg-slate-50 transition-colors"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-bold text-slate-800 truncate">
                          {av.propriedade_nome}
                        </p>
                        <p className="text-xs text-slate-500 truncate">
                          {av.municipio} · {formatarData(av.data_avaliacao)} · {av.tecnico_responsavel || 'Técnico'}
                        </p>
                      </div>
                      <IGSBadge classificacao={av.classificacao} igs={av.igs} size="small" />
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Desempenho por Dimensão */}
        <div className="lg:col-span-3">
          <Card className="h-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-bold text-slate-900">
                Desempenho por Dimensão
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-1">
              {DIMENSOES.map((d) => (
                <div key={d.key}>
                  <div className="flex justify-between items-center text-xs mb-1">
                    <span className="font-semibold text-slate-700">{d.label}</span>
                    <span className="text-slate-500 tabular-nums">
                      {stats?.[d.key] ? `${(stats[d.key] * 100).toFixed(1)}%` : '—'}{' '}
                      <span className="text-slate-400">({d.peso})</span>
                    </span>
                  </div>
                  <Tooltip content={`${d.label}: peso ${d.peso} no ICSR consolidado`}>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full transition-all duration-300"
                        style={{
                          width: `${stats?.[d.key] ? Math.min(stats[d.key] * 100, 100) : 0}%`,
                          backgroundColor: d.cor,
                        }}
                      />
                    </div>
                  </Tooltip>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Distribuição das Avaliações */}
        <div className="lg:col-span-3">
          <Card className="h-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-bold text-slate-900">
                Distribuição das Avaliações
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-1">
              {stats?.distribuicao_classificacao?.length > 0 ? (
                <div className="divide-y divide-slate-100">
                  {stats.distribuicao_classificacao.map((item) => (
                    <div
                      key={item.classificacao}
                      className="flex items-center justify-between py-2.5"
                    >
                      <IGSBadge classificacao={item.classificacao} size="small" />
                      <span className="text-sm font-bold text-slate-800 tabular-nums">
                        {item.quantidade}{' '}
                        <span className="font-normal text-xs text-slate-500">
                          {item.quantidade === 1 ? 'propriedade' : 'propriedades'}
                        </span>
                      </span>
                    </div>
                  ))}
                </div>
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
        </div>

        {/* Perfil de Sustentabilidade Geral */}
        <div className="lg:col-span-12">
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-bold text-slate-900">
                Perfil de Sustentabilidade
              </CardTitle>
            </CardHeader>
            <CardContent>
              <DimensaoChart
                economica={stats?.media_economica}
                ambiental={stats?.media_ambiental}
                social={stats?.media_social}
                gestao={stats?.media_gestao}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function getDimensaoPrioritaria(stats, dimensoes) {
  if (!stats || !dimensoes) return null;
  return dimensoes
    .map((d) => ({ ...d, valor: stats[d.key] }))
    .filter((d) => typeof d.valor === 'number')
    .sort((a, b) => a.valor - b.valor)[0] || null;
}
