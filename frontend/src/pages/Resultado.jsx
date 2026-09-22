import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiClipboard, FiPrinter, FiTrendingUp, FiAlertTriangle, FiCheckCircle, FiTarget, FiEdit3 } from 'react-icons/fi';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RTooltip, ResponsiveContainer,
  Cell, LineChart, Line, Legend,
} from 'recharts';
import { avaliacoesAPI } from '../services/api';
import { friendlyError } from '../utils/errorMessages';
import { COR_NOTA, COR_NOTA_TEXTO, COR_CLASSIFICACAO } from '../utils/coresICSR';
import { useMetodologia } from '../utils/metodologia';
import { formatarData, formatarDataCurta } from '../utils/formatarData';
import CachedDataBanner from '../components/Common/CachedDataBanner';
import IGSGauge from '../components/Dashboard/IGSGauge';
import DimensaoChart from '../components/Dashboard/DimensaoChart';
import IGSBadge from '../components/Common/IGSBadge';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Alert from '../components/ui/Alert';
import Badge from '../components/ui/Badge';
import Skeleton from '../components/ui/Skeleton';
import Tooltip from '../components/ui/Tooltip';
import { cn } from '../utils/cn';
import { formatarNumero, formatarPercentual } from '../utils/formatarNumero';
import { CAPARAO_700 } from '../utils/coresMarca';

// Nome do campo de índice de cada dimensão na resposta de GET /avaliacoes/:id
const CAMPO_POR_DIMENSAO = {
  ambiental: 'indice_ambiental',
  economica: 'indice_economico',
  social: 'indice_social',
  gestao_qualidade: 'indice_gestao_qualidade',
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
  const [dadosEmCache, setDadosEmCache] = useState(false);
  const { dimInfo, carregando: carregandoMetodologia } = useMetodologia();
  const DIM_INFO = dimInfo && Object.fromEntries(
    Object.entries(dimInfo).map(([codigo, info]) => [codigo, { ...info, campo: CAMPO_POR_DIMENSAO[codigo] }])
  );

  const carregar = useCallback(() => {
    setLoading(true);
    setErro('');
    avaliacoesAPI.buscar(id)
      .then(async (r) => {
        setAvaliacao(r.data);
        const [diag, tl] = await Promise.allSettled([
          avaliacoesAPI.diagnostico(id),
          avaliacoesAPI.timeline(r.data.propriedade_id),
        ]);
        if (diag.status === 'fulfilled') setDiagnostico(diag.value.data);
        if (tl.status === 'fulfilled') setTimeline(tl.value.data.avaliacoes || []);
        setDadosEmCache(Boolean(r.fromCache || (diag.status === 'fulfilled' && diag.value.fromCache) || (tl.status === 'fulfilled' && tl.value.fromCache)));
      })
      .catch((e) => setErro(friendlyError(e)))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => { carregar(); }, [carregar]);

  if (loading || carregandoMetodologia) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Skeleton className="h-9 w-20" />
          <div className="space-y-1">
            <Skeleton className="h-7 w-60" />
            <Skeleton className="h-4 w-40" />
          </div>
        </div>
        <Skeleton className="h-44 w-full rounded-xl" />
        <Skeleton className="h-32 w-full rounded-xl" />
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          <div className="md:col-span-7"><Skeleton className="h-72 w-full rounded-xl" /></div>
          <div className="md:col-span-5"><Skeleton className="h-72 w-full rounded-xl" /></div>
        </div>
      </div>
    );
  }

  if (erro) {
    return (
      <Alert
        variant="error"
        action={
          <Button variant="secondary" size="sm" onClick={carregar}>
            Tentar novamente
          </Button>
        }
      >
        {erro}
      </Alert>
    );
  }

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
    data: formatarDataCurta(t.data_avaliacao),
    ICSR: Math.round((Number(t.igs) || 0) * 100),
    Ambiental: Math.round((Number(t.indice_ambiental) || 0) * 100),
    Econômica: Math.round((Number(t.indice_economico) || 0) * 100),
    Social: Math.round((Number(t.indice_social) || 0) * 100),
    'IGQG': Math.round((Number(t.indice_gestao_qualidade) || 0) * 100),
  }));

  const dimensaoCritica = getDimensaoCritica(avaliacao, DIM_INFO);
  const prioridadePrincipal = diagnostico?.plano_acao_top5?.[0] || null;

  return (
    <div className="space-y-6 print-resultado">
      {/* Barra de Ações Superior */}
      <div className="no-print flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            size="sm"
            icon={<FiArrowLeft />}
            onClick={() => navigate(-1)}
          >
            Voltar
          </Button>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900">
              Laudo da Avaliação
            </h1>
            <p className="text-xs text-slate-500">
              {avaliacao.propriedade_nome} · {avaliacao.municipio}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            icon={<FiClipboard />}
            onClick={() => navigate(`/avaliacao/nova?propriedade=${avaliacao.propriedade_id}`)}
          >
            Nova Avaliação
          </Button>
          <Button
            variant="primary"
            size="sm"
            icon={<FiPrinter />}
            onClick={() => window.print()}
          >
            Imprimir / PDF
          </Button>
        </div>
      </div>

      {dadosEmCache && (
        <CachedDataBanner mensagem="Este resultado está sendo exibido com apoio do cache local. Confirme os dados novamente quando a conexão estabilizar." />
      )}

      {/* ICSR Principal */}
      <Card
        className="overflow-hidden border-slate-200/80 shadow-xs"
        style={{ borderTop: `4px solid ${COR_CLASSIFICACAO[avaliacao.classificacao] || '#9E9E9E'}` }}
      >
        <CardContent className="p-6">
          <div className="grid grid-cols-1 items-center gap-6 sm:grid-cols-12">
            <div className="sm:col-span-4 lg:col-span-3 text-center">
              <IGSGauge igs={avaliacao.igs || 0} classificacao={avaliacao.classificacao} size={160} />
            </div>
            <div className="sm:col-span-8 lg:col-span-9">
              <div className="flex flex-wrap items-start justify-between gap-2 mb-3">
                <div>
                  <span className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                    ICSR — Índice Consolidado de Sustentabilidade Rural
                  </span>
                  <div className="text-4xl font-black tracking-tight text-slate-900 tabular-nums leading-tight mt-0.5">
                    {avaliacao.igs ? `${(avaliacao.igs * 100).toFixed(1)}%` : '—'}
                  </div>
                </div>
                <IGSBadge classificacao={avaliacao.classificacao} size="medium" />
              </div>

              <div className="grid grid-cols-2 gap-4 border-t border-slate-100 pt-3 sm:grid-cols-4">
                <div>
                  <span className="block text-xs text-slate-500">Propriedade</span>
                  <span className="block text-sm font-bold text-slate-800">{avaliacao.propriedade_nome}</span>
                </div>
                <div>
                  <span className="block text-xs text-slate-500">Município</span>
                  <span className="block text-sm font-semibold text-slate-800">{avaliacao.municipio}</span>
                </div>
                <div>
                  <span className="block text-xs text-slate-500">Técnico</span>
                  <span className="block text-sm font-semibold text-slate-800">{avaliacao.tecnico_responsavel || '—'}</span>
                </div>
                <div>
                  <span className="block text-xs text-slate-500">Data</span>
                  <span className="block text-sm font-semibold text-slate-800">{formatarData(avaliacao.data_avaliacao)}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Leitura para a Próxima Conversa */}
      <Card className="border-slate-200/80 shadow-xs">
        <CardContent className="p-5 sm:p-6">
          <div className="grid grid-cols-1 items-start gap-4 md:grid-cols-12">
            <div className="md:col-span-8">
              <span className="block text-xs font-bold uppercase tracking-wider text-caparao-700 mb-1">
                Leitura para a próxima conversa
              </span>
              <h2 className="text-lg font-bold text-slate-900 mb-2">
                {prioridadePrincipal
                  ? `Comece por ${prioridadePrincipal.indicador_nome}`
                  : 'Use os índices por dimensão para orientar a próxima conversa em campo'}
              </h2>
              <p className="text-sm text-slate-600 leading-relaxed">
                {prioridadePrincipal
                  ? `Este indicador está na dimensão ${prioridadePrincipal.dimensao_nome} e oferece o maior ganho potencial imediato no ICSR. Foque evidências concretas, alinhamento de prazo e ação verificável para a próxima visita.`
                  : 'O resultado já mostra a situação geral da propriedade. Selecione a dimensão mais baixa e conduza a conversa a partir dela, não a partir do número final isolado.'}
              </p>
            </div>
            <div className="md:col-span-4 flex flex-wrap gap-2 pt-2">
              {dimensaoCritica && (
                <Badge variant="outline" className="text-slate-800">
                  Dimensão mais frágil: {dimensaoCritica.nome}
                </Badge>
              )}
              {prioridadePrincipal && (
                <Badge variant="warning">
                  Prazo sugerido: {prioridadePrincipal.prazo_sugerido}
                </Badge>
              )}
              <Badge variant="success">
                Classificação: {avaliacao.classificacao}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Índices por Dimensão + Radar */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-12">
        <div className="md:col-span-7">
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="text-base font-bold text-slate-900">
                Índices por Dimensão
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.entries(DIM_INFO).map(([cod, info]) => {
                const valor = avaliacao[info.campo] || 0;
                return (
                  <div key={cod}>
                    <div className="flex justify-between items-center text-xs mb-1">
                      <div>
                        <span className="font-bold text-slate-800 text-sm">{info.nome}</span>
                        <span className="block text-xs text-slate-500">
                          Peso: {Math.round(info.peso * 100)}% · Contribuição:{' '}
                          {formatarNumero(valor * info.peso * 100)} p.p. do ICSR
                        </span>
                      </div>
                      <span className="text-base font-extrabold tabular-nums" style={{ color: info.cor }}>
                        {formatarPercentual(valor)}
                      </span>
                    </div>
                    <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full transition-all duration-300"
                        style={{
                          width: `${Math.min(valor * 100, 100)}%`,
                          backgroundColor: info.cor,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
              <div className="mt-4 rounded-lg bg-caparao-50/50 p-3 text-center border border-caparao-100">
                <p className="text-xs font-medium text-caparao-800">
                  ICSR = (Amb. × 35%) + (Econ. × 30%) + (Soc. × 20%) + (IGQG × 15%) — Médias ponderadas
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-5">
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="text-base font-bold text-slate-900">
                Perfil de Sustentabilidade
              </CardTitle>
            </CardHeader>
            <CardContent>
              <DimensaoChart
                economica={avaliacao.indice_economico}
                ambiental={avaliacao.indice_ambiental}
                social={avaliacao.indice_social}
                gestao={avaliacao.indice_gestao_qualidade}
              />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Gráfico de barras comparativo */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-bold text-slate-900">
            Comparativo por Dimensão
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dadosBarChart} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="nome" tick={{ fontSize: 12, fill: '#64748b' }} />
                <YAxis domain={[0, 100]} unit="%" tick={{ fontSize: 12, fill: '#64748b' }} />
                <RTooltip formatter={(v) => [`${v}%`, 'Índice']} />
                <Bar dataKey="valor" radius={[6, 6, 0, 0]}>
                  {dadosBarChart.map((entry) => <Cell key={entry.nome} fill={entry.cor} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Diagnóstico Automático */}
      {diagnostico && (
        <Card className="border-t-4 border-t-caparao-700">
          <CardHeader>
            <div className="flex items-center gap-2">
              <FiTarget className="h-5 w-5 text-caparao-700" />
              <CardTitle className="text-base font-bold text-slate-900">
                Diagnóstico Automático
              </CardTitle>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Análise de fortalezas, fragilidades e recomendações priorizadas por impacto no ICSR.
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Plano de Ação Top-5 */}
            <div className="rounded-xl border border-caparao-200 bg-caparao-50/40 p-4">
              <div className="flex items-center gap-2 mb-3">
                <FiTrendingUp className="h-4 w-4 text-caparao-700" />
                <span className="text-sm font-bold text-caparao-900">
                  Plano de Ação Prioritário — Top 5 indicadores
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-caparao-100/60 text-slate-700 font-semibold border-b border-caparao-200">
                    <tr>
                      <th className="py-2 px-3 w-10">#</th>
                      <th className="py-2 px-3">Indicador</th>
                      <th className="py-2 px-3 w-20">Nota</th>
                      <th className="py-2 px-3 w-28">Status</th>
                      <th className="py-2 px-3 hidden md:table-cell w-28">Impacto ICSR</th>
                      <th className="py-2 px-3 hidden sm:table-cell">Prazo sugerido</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-caparao-100">
                    {diagnostico.plano_acao_top5.map((it, i) => (
                      <tr key={it.indicador_codigo} className="hover:bg-white/60">
                        <td className="py-2.5 px-3 font-bold text-caparao-800">{i + 1}</td>
                        <td className="py-2.5 px-3">
                          <p className="font-semibold text-slate-800">{it.indicador_nome}</p>
                          <p className="text-xs text-slate-500">{it.dimensao_nome}</p>
                        </td>
                        <td className="py-2.5 px-3">
                          <span
                            className="inline-flex rounded-md px-2 py-0.5 text-xs font-bold"
                            style={{
                              backgroundColor: COR_NOTA[it.nota] || '#9E9E9E',
                              color: COR_NOTA_TEXTO[it.nota] || '#616161',
                            }}
                          >
                            {(it.nota * 100).toFixed(0)}%
                          </span>
                        </td>
                        <td className="py-2.5 px-3">
                          <span
                            className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-bold"
                            style={{
                              backgroundColor: `${it.status_cor}22`,
                              color: it.status_cor,
                            }}
                          >
                            {STATUS_ICON[it.status]}
                            {it.status}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 font-bold text-slate-800 hidden md:table-cell">
                          +{(it.impacto_igs * 100).toFixed(2)}%
                        </td>
                        <td className="py-2.5 px-3 text-slate-600 hidden sm:table-cell">
                          {it.prazo_sugerido}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="mt-2 text-xs text-slate-500">
                * Impacto ICSR = potencial de ganho no índice consolidado se este indicador atingir nota 1,00.
              </p>
            </div>

            {/* Detalhamento por dimensão (Tabs) */}
            <div>
              <h3 className="text-sm font-bold text-slate-800 mb-2">
                Detalhamento por Dimensão
              </h3>
              <div className="no-print flex gap-2 overflow-x-auto border-b border-slate-200 pb-2 mb-4">
                {diagnostico.diagnostico_por_dimensao.map((d, i) => (
                  <button
                    key={d.dimensao}
                    type="button"
                    onClick={() => setTabDiag(i)}
                    className={cn(
                      'rounded-lg px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition-colors',
                      tabDiag === i
                        ? 'bg-caparao-700 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    )}
                  >
                    {d.nome}
                  </button>
                ))}
              </div>

              {diagnostico.diagnostico_por_dimensao.map((dimensao, indice) => (
                <div
                  key={dimensao.dimensao}
                  className={cn(
                    'overflow-x-auto rounded-lg border border-slate-200',
                    // Em tela mostra só a aba ativa; no papel, todas as
                    // dimensões saem em sequência, cada uma com seu título.
                    indice === tabDiag ? '' : 'hidden print:block',
                    indice > 0 && 'print:mt-4'
                  )}
                >
                  <p className="hidden print:block px-3 pt-3 text-sm font-bold text-slate-800">
                    {dimensao.nome}
                  </p>
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                      <tr>
                        <th className="py-2.5 px-3">Indicador</th>
                        <th className="py-2.5 px-3 w-20">Nota</th>
                        <th className="py-2.5 px-3 w-28">Status</th>
                        <th className="py-2.5 px-3 hidden md:table-cell">Recomendação</th>
                        <th className="py-2.5 px-3 hidden sm:table-cell w-28">Prazo</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {dimensao.itens.map((it) => (
                        <tr key={it.indicador_codigo} className="hover:bg-slate-50/70">
                          <td className="py-2.5 px-3">
                            <p className="font-semibold text-slate-800">{it.indicador_nome}</p>
                            {it.evidencia_esperada && (
                              <p className="text-xs text-slate-500 mt-0.5">
                                Evidência: {it.evidencia_esperada}
                              </p>
                            )}
                          </td>
                          <td className="py-2.5 px-3 font-bold" style={{ color: COR_NOTA_TEXTO[it.nota] || '#616161' }}>
                            {(it.nota * 100).toFixed(0)}%
                          </td>
                          <td className="py-2.5 px-3">
                            <span
                              className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-bold"
                              style={{
                                backgroundColor: `${it.status_cor}22`,
                                color: it.status_cor,
                              }}
                            >
                              {STATUS_ICON[it.status]}
                              {it.status}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-slate-600 hidden md:table-cell">
                            {it.recomendacao}
                          </td>
                          <td className="py-2.5 px-3 text-slate-500 hidden sm:table-cell">
                            {it.prazo_sugerido}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Evolução Temporal */}
      {timelineData.length > 1 && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <FiTrendingUp className="h-5 w-5 text-caparao-700" />
              <CardTitle className="text-base font-bold text-slate-900">
                Evolução da Sustentabilidade
              </CardTitle>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {timelineData.length} avaliações concluídas desta propriedade.
            </p>
          </CardHeader>
          <CardContent>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={timelineData} margin={{ top: 8, right: 16, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="data" tick={{ fontSize: 11, fill: '#64748b' }} />
                  <YAxis domain={[0, 100]} unit="%" tick={{ fontSize: 11, fill: '#64748b' }} />
                  <RTooltip />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Line type="monotone" dataKey="ICSR" stroke={CAPARAO_700} strokeWidth={3} dot={{ r: 4 }} />
                  <Line type="monotone" dataKey="Ambiental" stroke="#4CAF50" strokeWidth={2} dot={{ r: 3 }} />
                  <Line type="monotone" dataKey="Econômica" stroke="#0284C7" strokeWidth={2} dot={{ r: 3 }} />
                  <Line type="monotone" dataKey="Social" stroke="#F59E0B" strokeWidth={2} dot={{ r: 3 }} />
                  <Line type="monotone" dataKey="IGQG" stroke="#8B5CF6" strokeWidth={2} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Detalhamento por Indicador */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <FiClipboard className="h-5 w-5 text-caparao-700" />
            <CardTitle className="text-base font-bold text-slate-900">
              Notas por Indicador
            </CardTitle>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Selecione uma dimensão para ver as notas individuais e critérios selecionados.
          </p>
        </CardHeader>
        <CardContent>
          <div className="no-print flex gap-2 overflow-x-auto border-b border-slate-200 pb-2 mb-4">
            {Object.entries(DIM_INFO).map(([cod, info], i) => (
              <button
                key={cod}
                type="button"
                onClick={() => setTabAtiva(i)}
                className={cn(
                  'rounded-lg px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition-colors',
                  tabAtiva === i
                    ? 'bg-caparao-700 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                )}
              >
                {info.nome}
              </button>
            ))}
          </div>

          {Object.entries(DIM_INFO).map(([cod, info], i) => (
            (
              <div
                key={cod}
                className={cn(
                  i === tabAtiva ? '' : 'hidden print:block',
                  i > 0 && 'print:mt-4'
                )}
              >
                <p className="hidden print:block mb-2 text-sm font-bold text-slate-800">
                  {info.nome}
                </p>
                {(respostasPorDimensao[cod] || []).length === 0 ? (
                  <Alert variant="info">Nenhum indicador avaliado nesta dimensão.</Alert>
                ) : (
                  <div className="overflow-x-auto rounded-lg border border-slate-200">
                    <table className="w-full text-left text-sm">
                      <tbody className="divide-y divide-slate-100">
                        {(respostasPorDimensao[cod] || []).map((r) => (
                          <tr key={r.id} className="hover:bg-slate-50">
                            <td className="py-3 px-3">
                              <p className="font-semibold text-slate-800 text-sm">
                                {r.indicador_nome}
                              </p>
                              {r.observacao && (
                                <Tooltip content={r.observacao}>
                                  <span className="mt-1 inline-flex items-center gap-1 text-xs text-slate-500 italic max-w-sm truncate">
                                    <FiEdit3 size={11} className="shrink-0" />
                                    {r.observacao}
                                  </span>
                                </Tooltip>
                              )}
                            </td>
                            <td className="py-3 px-3 w-48">
                              <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                                <div
                                  className="h-full rounded-full transition-all duration-300"
                                  style={{
                                    width: `${r.nota * 100}%`,
                                    backgroundColor: COR_NOTA[r.nota] || info.cor,
                                  }}
                                />
                              </div>
                            </td>
                            <td
                              className="py-3 px-3 w-16 text-right font-extrabold tabular-nums"
                              style={{ color: COR_NOTA[r.nota] }}
                            >
                              {(r.nota * 100).toFixed(0)}%
                            </td>
                            <td className="py-3 px-3 text-slate-600 hidden md:table-cell text-sm">
                              {r.criterio_selecionado || '—'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )
          ))}
        </CardContent>
      </Card>

      {/* Observações Gerais */}
      {avaliacao.observacoes && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-bold text-slate-900">
              Observações Gerais
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-600 whitespace-pre-line leading-relaxed">
              {avaliacao.observacoes}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function getDimensaoCritica(avaliacao, dimInfo) {
  if (!avaliacao || !dimInfo) return null;
  return Object.values(dimInfo)
    .map((info) => ({ ...info, valor: Number(avaliacao[info.campo] || 0) }))
    .sort((a, b) => a.valor - b.valor)[0] || null;
}
