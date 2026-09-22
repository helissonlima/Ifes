import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  FiArrowLeft, FiClipboard, FiEye, FiMap, FiCalendar, FiUser, FiPhone, FiMail,
  FiTrendingUp, FiTrendingDown, FiMinus, FiBarChart2, FiActivity, FiDatabase,
  FiRefreshCw,
} from 'react-icons/fi';
import { MdOutlineEco } from 'react-icons/md';
import MapPicker from '../components/Common/MapPicker';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RTooltip,
  ResponsiveContainer, Legend, BarChart, Bar,
} from 'recharts';
import { propriedadesAPI, avaliacoesAPI, producaoAPI } from '../services/api';
import { useApp } from '../context/AppContext';
import { friendlyError } from '../utils/errorMessages';
import { COR_NOTA, COR_CLASSIFICACAO } from '../utils/coresICSR';
import { useMetodologia } from '../utils/metodologia';
import { formatarData as fmtData, formatarDataCurta } from '../utils/formatarData';
import IGSBadge from '../components/Common/IGSBadge';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Alert from '../components/ui/Alert';
import Badge from '../components/ui/Badge';
import Skeleton from '../components/ui/Skeleton';
import Tooltip from '../components/ui/Tooltip';
import { cn } from '../utils/cn';
import { CAPARAO_700 } from '../utils/coresMarca';
import { formatarArea, formatarNumero, formatarPercentual } from '../utils/formatarNumero';
import IGSGauge from '../components/Dashboard/IGSGauge';

export default function PropriedadeDetalhe() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { notify } = useApp();

  const [propriedade, setPropriedade] = useState(null);
  const [timeline, setTimeline] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState('');
  const [tab, setTab] = useState(0);
  const { dimInfo } = useMetodologia();

  // Comparativo
  const [idA, setIdA] = useState('');
  const [idB, setIdB] = useState('');
  const [comparativo, setComparativo] = useState(null);
  const [carregandoComp, setCarregandoComp] = useState(false);

  // Produção regional (IBGE)
  const [producao, setProducao] = useState(null);
  const [carregandoProd, setCarregandoProd] = useState(false);
  const [erroProd, setErroProd] = useState('');

  const carregarDetalhe = () => {
    setLoading(true);
    setErro('');
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
      .catch((e) => setErro(friendlyError(e)))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    carregarDetalhe();
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (idA && idB && idA !== idB) {
      setCarregandoComp(true);
      avaliacoesAPI.comparar(idA, idB)
        .then((r) => setComparativo(r.data))
        .catch((e) => notify(friendlyError(e), 'error'))
        .finally(() => setCarregandoComp(false));
    } else {
      setComparativo(null);
    }
  }, [idA, idB, notify]);

  const carregarProducao = (prop) => {
    if (!prop?.municipio || !prop?.estado) return;
    setCarregandoProd(true);
    setErroProd('');
    producaoAPI.media(prop.municipio, prop.estado)
      .then((r) => setProducao(r.data))
      .catch((e) => setErroProd(friendlyError(e)))
      .finally(() => setCarregandoProd(false));
  };

  useEffect(() => {
    if (tab === 3 && propriedade && !producao && !carregandoProd) {
      carregarProducao(propriedade);
    }
  }, [tab, propriedade]); // eslint-disable-line react-hooks/exhaustive-deps

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Skeleton className="h-9 w-20" />
          <Skeleton className="h-7 w-64" />
        </div>
        <Skeleton className="h-36 w-full rounded-xl" />
        <Skeleton className="h-72 w-full rounded-xl" />
      </div>
    );
  }

  if (erro) {
    return (
      <Alert
        variant="error"
        action={
          <Button variant="secondary" size="sm" onClick={carregarDetalhe}>
            Tentar novamente
          </Button>
        }
      >
        {erro}
      </Alert>
    );
  }

  if (!propriedade) return null;

  const concluidas = timeline.filter((t) => t.status === 'concluida');
  const timelineData = concluidas.map((t) => ({
    data: formatarDataCurta(t.data_avaliacao),
    id: t.id,
    ICSR: Math.round((Number(t.igs) || 0) * 100),
    Ambiental: Math.round((Number(t.indice_ambiental) || 0) * 100),
    Econômica: Math.round((Number(t.indice_economico) || 0) * 100),
    Social: Math.round((Number(t.indice_social) || 0) * 100),
    'IGQG': Math.round((Number(t.indice_gestao_qualidade) || 0) * 100),
  }));

  const primeira = concluidas[0];
  const ultima = concluidas[concluidas.length - 1];
  const evolucaoIGS = ultima && primeira ? (Number(ultima.igs || 0) - Number(primeira.igs || 0)) : 0;

  const tabsInfo = [
    { id: 0, label: 'Histórico', icon: <FiClipboard size={16} />, disabled: false },
    {
      id: 1,
      label: 'Evolução',
      icon: <FiBarChart2 size={16} />,
      disabled: timelineData.length === 0,
      motivo: 'Disponível depois da primeira avaliação concluída',
    },
    {
      id: 2,
      label: 'Comparar avaliações',
      icon: <FiActivity size={16} />,
      disabled: concluidas.length < 2,
      motivo: `Requer 2 avaliações concluídas (esta propriedade tem ${concluidas.length})`,
    },
    { id: 3, label: 'Produção Regional', icon: <FiDatabase size={16} />, disabled: false },
    { id: 4, label: 'Localização', icon: <FiMap size={16} />, disabled: false },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            icon={<FiArrowLeft />}
            onClick={() => navigate('/propriedades')}
          >
            Voltar
          </Button>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900">
              {propriedade.nome}
            </h1>
            <p className="text-xs text-slate-500">
              {propriedade.municipio}/{propriedade.estado} · {propriedade.proprietario}
            </p>
          </div>
        </div>

        <Button
          variant="primary"
          icon={<FiClipboard />}
          onClick={() => navigate(`/avaliacao/nova?propriedade=${propriedade.id}`)}
        >
          Nova Avaliação
        </Button>
      </div>

      {/* Cards de informações + último IGS */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        <div className="md:col-span-7">
          <Card className="h-full">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <FiMap className="text-caparao-700" />
                <CardTitle className="text-base font-bold text-slate-900">
                  Dados da Propriedade
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <Info icon={<FiUser />} label="Proprietário" valor={propriedade.proprietario} />
                <Info icon={<FiMap />} label="Município/UF" valor={`${propriedade.municipio}/${propriedade.estado}`} />
                <Info icon={<MdOutlineEco />} label="Área total" valor={formatarArea(propriedade.area_total)} />
                <Info icon={<MdOutlineEco />} label="Área de café" valor={formatarArea(propriedade.area_cafe)} />
                <Info icon={<FiPhone />} label="Telefone" valor={propriedade.telefone || '—'} />
                <Info icon={<FiMail />} label="E-mail" valor={propriedade.email || '—'} />
                <Info icon={<FiCalendar />} label="Cadastrada em" valor={fmtData(propriedade.criado_em)} />
                <Info icon={<FiActivity />} label="Total de avaliações" valor={timeline.length} />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-5">
          {/* Fundo branco com acento no topo na cor da banda — o hero com
              gradiente escuro e número gigante é anti-padrão no sistema. */}
          <div
            className="flex h-full flex-col justify-center rounded-xl border border-slate-200/90 bg-white p-6 shadow-xs"
            style={{
              borderTop: `4px solid ${ultima ? (COR_CLASSIFICACAO[ultima.classificacao] || '#94A3B8') : '#CBD5E1'}`,
            }}
          >
            {ultima ? (
              <>
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Última avaliação concluída
                </span>
                <div className="mt-2 flex items-center gap-4">
                  <IGSGauge
                    igs={Number(ultima.igs)}
                    classificacao={ultima.classificacao}
                    size={96}
                  />
                  <div className="min-w-0">
                    <div className="text-2xl font-black tracking-tight tabular-nums text-slate-900">
                      ICSR {formatarPercentual(ultima.igs)}
                    </div>
                    <div className="mt-1.5">
                      <IGSBadge classificacao={ultima.classificacao} size="medium" />
                    </div>
                  </div>
                </div>
                <p className="mt-3 text-xs text-slate-500">
                  {fmtData(ultima.data_avaliacao)} · {ultima.tecnico_responsavel || 'Técnico não informado'}
                </p>

                {concluidas.length > 1 && (
                  <div className="mt-4 flex items-center gap-2 border-t border-slate-100 pt-3 text-xs font-semibold">
                    <span
                      className={cn(
                        'inline-flex items-center gap-1',
                        evolucaoIGS >= 0 ? 'text-emerald-700' : 'text-red-700'
                      )}
                    >
                      {evolucaoIGS >= 0 ? <FiTrendingUp /> : <FiTrendingDown />}
                      {evolucaoIGS >= 0 ? '+' : ''}{formatarNumero(evolucaoIGS * 100)} p.p.
                    </span>
                    <span className="font-normal text-slate-500">
                      desde a 1ª avaliação ({fmtData(primeira.data_avaliacao)})
                    </span>
                  </div>
                )}

                <Button
                  variant="outline"
                  size="sm"
                  className="mt-4 self-start"
                  icon={<FiEye size={14} />}
                  onClick={() => navigate(`/avaliacao/${ultima.id}`)}
                >
                  Ver resultado completo
                </Button>
              </>
            ) : (
              <div className="py-4 text-center">
                <MdOutlineEco size={40} className="mx-auto mb-2 text-slate-300" />
                <p className="text-sm font-semibold text-slate-700">Nenhuma avaliação concluída</p>
                <Button
                  variant="primary"
                  size="sm"
                  className="mt-3"
                  icon={<FiClipboard />}
                  onClick={() => navigate(`/avaliacao/nova?propriedade=${propriedade.id}`)}
                >
                  Iniciar primeira avaliação
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Abas com Conteúdo */}
      <Card>
        <CardHeader className="pb-3 border-b border-slate-100">
          <div className="flex gap-2 overflow-x-auto">
            {tabsInfo.map((t) => {
              const botao = (
                <button
                  key={t.id}
                  type="button"
                  disabled={t.disabled}
                  onClick={() => setTab(t.id)}
                  aria-current={tab === t.id ? 'true' : undefined}
                  className={cn(
                    'inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-caparao-700 focus-visible:ring-offset-1',
                    tab === t.id
                      ? 'bg-caparao-700 text-white shadow-xs'
                      : t.disabled
                      ? 'text-slate-400 cursor-not-allowed'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  )}
                >
                  {t.icon}
                  <span>{t.label}</span>
                </button>
              );

              // Aba indisponível diz o porquê; cinza mudo não explica nada.
              if (t.disabled && t.motivo) {
                return (
                  <Tooltip key={t.id} content={t.motivo}>
                    <span className="inline-flex">{botao}</span>
                  </Tooltip>
                );
              }
              return botao;
            })}
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          {/* TAB 0 — Histórico */}
          {tab === 0 && (
            <div>
              {timeline.length === 0 ? (
                <Alert variant="info">
                  Nenhuma avaliação registrada para esta propriedade ainda.
                </Alert>
              ) : (
                <div className="overflow-x-auto rounded-lg border border-slate-200">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 uppercase tracking-wider text-xs">
                      <tr>
                        <th className="py-2.5 px-3">Data</th>
                        <th className="py-2.5 px-3">Técnico</th>
                        <th className="py-2.5 px-3">Ambiental</th>
                        <th className="py-2.5 px-3">Econômica</th>
                        <th className="py-2.5 px-3">Social</th>
                        <th className="py-2.5 px-3">IGQG</th>
                        <th className="py-2.5 px-3">ICSR</th>
                        <th className="py-2.5 px-3">Status</th>
                        <th className="py-2.5 px-3 text-right">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {timeline.map((av) => (
                        <tr
                          key={av.id}
                          onClick={() => navigate(`/avaliacao/${av.id}`)}
                          className="hover:bg-slate-50/80 cursor-pointer transition-colors"
                        >
                          <td className="py-2.5 px-3 font-semibold text-slate-800">{fmtData(av.data_avaliacao)}</td>
                          <td className="py-2.5 px-3 text-slate-600">{av.tecnico_responsavel || '—'}</td>
                          {[
                            ['indice_ambiental', '#2E7D32'],
                            ['indice_economico', '#0284C7'],
                            ['indice_social', '#D97706'],
                            ['indice_gestao_qualidade', '#7C3AED'],
                          ].map(([k, c]) => (
                            <td key={k} className="py-2.5 px-3 font-bold tabular-nums" style={{ color: c }}>
                              {av[k] !== null && av[k] !== undefined ? `${(Number(av[k]) * 100).toFixed(0)}%` : '—'}
                            </td>
                          ))}
                          <td className="py-2.5 px-3">
                            {av.classificacao ? (
                              <IGSBadge classificacao={av.classificacao} igs={av.igs} size="small" />
                            ) : (
                              <span className="text-slate-400">—</span>
                            )}
                          </td>
                          <td className="py-2.5 px-3">
                            <Badge variant={av.status === 'concluida' ? 'success' : 'warning'} size="sm">
                              {av.status === 'concluida' ? 'Concluída' : 'Rascunho'}
                            </Badge>
                          </td>
                          <td className="py-2.5 px-3 text-right" onClick={(e) => e.stopPropagation()}>
                            <button
                              type="button"
                              onClick={() => navigate(`/avaliacao/${av.id}`)}
                              className="rounded-md p-1 text-slate-500 hover:bg-slate-100 hover:text-slate-800"
                            >
                              <FiEye size={15} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 1 — Evolução */}
          {tab === 1 && timelineData.length > 0 && (
            <div className="space-y-3">
              <p className="text-xs text-slate-500">
                Evolução dos índices ao longo das {timelineData.length} avaliação(ões) concluída(s).
              </p>
              <div className="h-80 w-full">
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
            </div>
          )}

          {/* TAB 2 — Comparar */}
          {tab === 2 && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Avaliação A (antes)
                  </label>
                  <select
                    value={idA}
                    onChange={(e) => setIdA(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 p-2 text-xs text-slate-800 shadow-xs focus:border-caparao-700 focus-visible:outline-none"
                  >
                    {concluidas.map((a) => (
                      <option key={a.id} value={a.id} disabled={a.id === idB}>
                        {fmtData(a.data_avaliacao)} — ICSR {(Number(a.igs) * 100).toFixed(1)}%
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Avaliação B (depois)
                  </label>
                  <select
                    value={idB}
                    onChange={(e) => setIdB(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 p-2 text-xs text-slate-800 shadow-xs focus:border-caparao-700 focus-visible:outline-none"
                  >
                    {concluidas.map((a) => (
                      <option key={a.id} value={a.id} disabled={a.id === idA}>
                        {fmtData(a.data_avaliacao)} — ICSR {(Number(a.igs) * 100).toFixed(1)}%
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {carregandoComp && (
                <div className="flex justify-center py-6">
                  <span className="h-6 w-6 animate-spin rounded-full border-2 border-caparao-700 border-t-transparent" />
                </div>
              )}

              {comparativo && !carregandoComp && (
                <Comparativo comp={comparativo} dimInfo={dimInfo} />
              )}
            </div>
          )}

          {/* TAB 3 — Produção Regional */}
          {tab === 3 && (
            <ProducaoRegional
              propriedade={propriedade}
              dados={producao}
              carregando={carregandoProd}
              erro={erroProd}
              onRecarregar={() => {
                setProducao(null);
                carregarProducao(propriedade);
              }}
            />
          )}

          {/* TAB 4 — Localização */}
          {tab === 4 && (
            <LocalizacaoTab propriedade={propriedade} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function Info({ icon, label, valor }) {
  return (
    <div className="flex items-start gap-2">
      <span className="mt-0.5 text-slate-400">{icon}</span>
      <div>
        <span className="block text-xs text-slate-400 uppercase tracking-wider">{label}</span>
        <span className="block font-semibold text-slate-800">{valor}</span>
      </div>
    </div>
  );
}

function Trend({ delta, hidePct = false }) {
  if (delta === null || delta === undefined) return <span className="text-slate-400">—</span>;
  if (Math.abs(delta) < 0.005) {
    return (
      <Badge variant="outline" size="sm">
        <FiMinus size={11} className="mr-1 inline" /> estável
      </Badge>
    );
  }
  const up = delta > 0;
  return (
    <Badge variant={up ? 'success' : 'danger'} size="sm">
      {up ? <FiTrendingUp size={11} className="mr-1 inline" /> : <FiTrendingDown size={11} className="mr-1 inline" />}
      {up ? '+' : ''}{(delta * 100).toFixed(hidePct ? 0 : 1)}{hidePct ? ' pts' : '%'}
    </Badge>
  );
}

function Comparativo({ comp, dimInfo }) {
  const navigate = useNavigate();
  const barChartData = comp.dimensoes.map((d) => ({
    nome: d.nome, cor: d.cor,
    A: Math.round(d.a * 100),
    B: Math.round(d.b * 100),
  }));

  return (
    <div className="space-y-4">
      {/* Cabeçalho IGS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="rounded-xl border border-slate-200 bg-white p-4 text-center border-t-4 border-t-slate-400">
          <span className="block text-xs text-slate-500">Avaliação A</span>
          <span className="block text-xs text-slate-400">{fmtData(comp.a.data)}</span>
          <div className="text-3xl font-black text-slate-800 tabular-nums my-1">
            {(comp.a.igs * 100).toFixed(1)}%
          </div>
          <IGSBadge classificacao={comp.a.classificacao} size="small" />
          <button
            type="button"
            onClick={() => navigate(`/avaliacao/${comp.a.id}`)}
            className="mt-2 block mx-auto text-xs font-semibold text-caparao-700 hover:underline"
          >
            Ver
          </button>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 text-center border-t-4 border-t-caparao-700">
          <span className="block text-xs text-slate-500">Variação do ICSR</span>
          <div className="my-2 flex items-center justify-center gap-1">
            {comp.delta_igs >= 0 ? (
              <FiTrendingUp size={24} className="text-emerald-700" />
            ) : (
              <FiTrendingDown size={24} className="text-rose-700" />
            )}
            <span
              className={cn(
                'text-3xl font-black tabular-nums',
                comp.delta_igs >= 0 ? 'text-emerald-700' : 'text-rose-700'
              )}
            >
              {comp.delta_igs >= 0 ? '+' : ''}{(comp.delta_igs * 100).toFixed(1)}%
            </span>
          </div>
          <div className="flex flex-wrap justify-center gap-1 mt-2">
            <Badge variant="success" size="sm">{comp.resumo.melhoraram} melhoraram</Badge>
            <Badge variant="danger" size="sm">{comp.resumo.pioraram} pioraram</Badge>
            <Badge variant="outline" size="sm">{comp.resumo.estaveis} estáveis</Badge>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 text-center border-t-4 border-t-caparao-800">
          <span className="block text-xs text-slate-500">Avaliação B</span>
          <span className="block text-xs text-slate-400">{fmtData(comp.b.data)}</span>
          <div className="text-3xl font-black text-slate-800 tabular-nums my-1">
            {(comp.b.igs * 100).toFixed(1)}%
          </div>
          <IGSBadge classificacao={comp.b.classificacao} size="small" />
          <button
            type="button"
            onClick={() => navigate(`/avaliacao/${comp.b.id}`)}
            className="mt-2 block mx-auto text-xs font-semibold text-caparao-700 hover:underline"
          >
            Ver
          </button>
        </div>
      </div>

      {/* Comparativo dimensões */}
      <div className="rounded-xl border border-slate-200 bg-white p-4">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
          Variação por Dimensão
        </h4>
        <div className="h-56 w-full mb-3">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barChartData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="nome" tick={{ fontSize: 11, fill: '#64748b' }} />
              <YAxis domain={[0, 100]} unit="%" tick={{ fontSize: 11, fill: '#64748b' }} />
              <RTooltip />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="A" fill="#94A3B8" name="Antes" radius={[4, 4, 0, 0]} />
              <Bar dataKey="B" fill={CAPARAO_700} name="Depois" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
            <tr>
              <th className="py-2 px-3">Dimensão</th>
              <th className="py-2 px-3 w-28">Antes</th>
              <th className="py-2 px-3 w-28">Depois</th>
              <th className="py-2 px-3 w-28">Δ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {comp.dimensoes.map((d) => (
              <tr key={d.codigo}>
                <td className="py-2.5 px-3">
                  <span className="font-bold block" style={{ color: d.cor }}>{d.nome}</span>
                  <span className="text-xs text-slate-400">peso {Math.round(d.peso * 100)}%</span>
                </td>
                <td className="py-2.5 px-3 tabular-nums font-semibold text-slate-700">{(d.a * 100).toFixed(1)}%</td>
                <td className="py-2.5 px-3 tabular-nums font-semibold text-slate-700">{(d.b * 100).toFixed(1)}%</td>
                <td className="py-2.5 px-3"><Trend delta={d.delta} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Detalhamento por indicador */}
      <div className="rounded-xl border border-slate-200 bg-white p-4">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
          Indicadores que mais mudaram
        </h4>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs min-w-[600px]">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-2 px-3">Indicador</th>
                <th className="py-2 px-3 w-32">Dimensão</th>
                <th className="py-2 px-3 w-20">Antes</th>
                <th className="py-2 px-3 w-20">Depois</th>
                <th className="py-2 px-3 w-24">Variação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {comp.indicadores.map((it) => {
                const dim = dimInfo?.[it.dimensao] || {};
                return (
                  <tr key={it.codigo} className="hover:bg-slate-50/70">
                    <td className="py-2 px-3 font-semibold text-slate-800">{it.indicador_nome}</td>
                    <td className="py-2 px-3">
                      <span
                        className="rounded-md px-2 py-0.5 text-xs font-bold"
                        style={{
                          backgroundColor: `${dim.cor || '#999'}22`,
                          color: dim.cor || '#444',
                        }}
                      >
                        {dim.nome || it.dimensao_nome || it.dimensao}
                      </span>
                    </td>
                    <td className="py-2 px-3"><NotaCell nota={it.nota_a} /></td>
                    <td className="py-2 px-3"><NotaCell nota={it.nota_b} /></td>
                    <td className="py-2 px-3"><Trend delta={it.delta} hidePct /></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function ProducaoRegional({ propriedade, dados, carregando, erro, onRecarregar }) {
  if (carregando) {
    return (
      <div className="flex flex-col items-center justify-center py-10 gap-2">
        <span className="h-6 w-6 animate-spin rounded-full border-2 border-caparao-700 border-t-transparent" />
        <span className="text-xs text-slate-500">Consultando IBGE — Produção Agrícola Municipal…</span>
      </div>
    );
  }

  if (erro) {
    return (
      <Alert
        variant="warning"
        action={
          <Button variant="secondary" size="sm" icon={<FiRefreshCw />} onClick={onRecarregar}>
            Tentar novamente
          </Button>
        }
      >
        {erro}
      </Alert>
    );
  }

  if (!dados) return null;

  const rendAtual = dados.rendimento_atual;
  const rendUFAtual = dados.rendimento_uf_atual;
  const areaCafe = parseFloat(propriedade?.area_cafe) || null;
  const producaoEstimada = rendAtual && areaCafe ? (rendAtual.valor * areaCafe) / 1000 : null;

  const anosMap = {};
  dados.rendimento_municipio.forEach((d) => {
    anosMap[d.ano] = { ano: d.ano, municipio: d.valor };
  });
  dados.rendimento_uf.forEach((d) => {
    anosMap[d.ano] = { ...(anosMap[d.ano] || { ano: d.ano }), uf: d.valor };
  });
  const chartData = Object.values(anosMap).sort((a, b) => a.ano - b.ano);
  const fmtKg = (v) => v != null ? `${v.toLocaleString('pt-BR')} kg/ha` : '—';

  return (
    <div className="space-y-4">
      {/* Cards de resumo */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="rounded-xl border border-slate-200 bg-white p-4 text-center border-t-4 border-t-emerald-700">
          <span className="block text-xs text-slate-500">Rendimento médio — {dados.municipio}</span>
          <div className="text-3xl font-black text-emerald-800 tabular-nums my-1">
            {rendAtual ? rendAtual.valor.toLocaleString('pt-BR') : '—'}
          </div>
          <span className="block text-xs text-slate-400">kg/ha {rendAtual ? `(${rendAtual.ano})` : ''}</span>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 text-center border-t-4 border-t-sky-700">
          <span className="block text-xs text-slate-500">Rendimento médio — {dados.uf}</span>
          <div className="text-3xl font-black text-sky-800 tabular-nums my-1">
            {rendUFAtual ? rendUFAtual.valor.toLocaleString('pt-BR') : '—'}
          </div>
          <span className="block text-xs text-slate-400">kg/ha {rendUFAtual ? `(${rendUFAtual.ano})` : ''}</span>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 text-center border-t-4 border-t-purple-700">
          <span className="block text-xs text-slate-500">Produção estimada (propriedade)</span>
          <div className="text-3xl font-black text-purple-800 tabular-nums my-1">
            {producaoEstimada ? producaoEstimada.toLocaleString('pt-BR', { maximumFractionDigits: 1 }) : '—'}
          </div>
          <span className="block text-xs text-slate-400">
            {producaoEstimada ? `toneladas · ${areaCafe} ha` : 'Informe a área de café na propriedade'}
          </span>
        </div>
      </div>

      {rendAtual && rendUFAtual && (
        <Alert variant={rendAtual.valor >= rendUFAtual.valor ? 'success' : 'warning'}>
          O município <strong>{dados.municipio}</strong> apresenta rendimento médio de{' '}
          <strong>{fmtKg(rendAtual.valor)}</strong>{' '}
          {rendAtual.valor >= rendUFAtual.valor ? (
            <>acima da média estadual ({fmtKg(rendUFAtual.valor)}).</>
          ) : (
            <>abaixo da média estadual ({fmtKg(rendUFAtual.valor)}) — diferença de{' '}
              <strong>{fmtKg(rendUFAtual.valor - rendAtual.valor)}</strong>.</>
          )}
        </Alert>
      )}

      {/* Gráfico de evolução do rendimento */}
      {chartData.length > 1 && (
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
            Evolução do Rendimento Médio (kg/ha) — Café
          </h4>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="ano" tick={{ fontSize: 12, fill: '#64748b' }} />
                <YAxis unit=" kg" tick={{ fontSize: 11, fill: '#64748b' }} />
                <RTooltip formatter={(v, name) => [`${v?.toLocaleString('pt-BR')} kg/ha`, name]} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="municipio" name={`Município (${dados.municipio})`} fill={CAPARAO_700} radius={[4, 4, 0, 0]} />
                <Bar dataKey="uf" name={`Estado (${dados.uf})`} fill="#0284C7" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Tabela de histórico */}
      <div className="rounded-xl border border-slate-200 bg-white p-4">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
          Dados Históricos — Município de {dados.municipio}
        </h4>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3">Ano</th>
                <th className="py-2.5 px-3">Rendimento médio (kg/ha)</th>
                <th className="py-2.5 px-3">Quantidade produzida (t)</th>
                <th className="py-2.5 px-3">Área colhida (ha)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {dados.rendimento_municipio.slice().reverse().map((r) => {
                const prod = dados.producao_municipio.find((p) => p.ano === r.ano);
                const area = dados.area_colhida_municipio.find((a) => a.ano === r.ano);
                const isLatest = r.ano === rendAtual?.ano;
                return (
                  <tr key={r.ano} className={isLatest ? 'bg-emerald-50/50' : 'hover:bg-slate-50/50'}>
                    <td className="py-2 px-3 font-semibold text-slate-800">
                      {r.ano} {isLatest && <Badge variant="success" size="sm" className="ml-1">mais recente</Badge>}
                    </td>
                    <td className="py-2 px-3 font-bold text-slate-900 tabular-nums">
                      {r.valor.toLocaleString('pt-BR')}
                    </td>
                    <td className="py-2 px-3 text-slate-600">{prod ? prod.valor.toLocaleString('pt-BR') : '—'}</td>
                    <td className="py-2 px-3 text-slate-600">{area ? area.valor.toLocaleString('pt-BR') : '—'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className="mt-2 text-xs text-slate-400">
          Fonte: {dados.fonte} · Cultura: {dados.cultura}
        </p>
      </div>
    </div>
  );
}

function LocalizacaoTab({ propriedade }) {
  const hasCoords = propriedade.latitude != null && propriedade.longitude != null;
  const enderecoCompleto = [
    propriedade.rua,
    propriedade.numero ? `nº ${propriedade.numero}` : null,
    propriedade.complemento,
    propriedade.bairro,
    `${propriedade.municipio}/${propriedade.estado}`,
    'Brasil',
  ].filter(Boolean).join(', ');

  return (
    <div className="space-y-4">
      {!hasCoords && (
        <Alert variant="info">
          Nenhuma coordenada registrada para esta propriedade. Edite a propriedade e use o mapa para definir a localização.
        </Alert>
      )}

      {enderecoCompleto && (
        <div className="flex items-center gap-2 text-xs text-slate-600">
          <FiMap className="text-slate-400 shrink-0" size={16} />
          <span>{enderecoCompleto}</span>
        </div>
      )}

      <MapPicker
        lat={propriedade.latitude}
        lng={propriedade.longitude}
        onChange={() => {}}
        readOnly
        height={380}
      />
    </div>
  );
}

function NotaCell({ nota }) {
  if (nota === null || nota === undefined) return <span className="text-slate-400">—</span>;
  return (
    <div className="flex items-center gap-1.5 font-bold tabular-nums">
      <span className="h-2 w-2 rounded-full" style={{ backgroundColor: COR_NOTA[nota] || '#999' }} />
      <span>{(nota * 100).toFixed(0)}%</span>
    </div>
  );
}
