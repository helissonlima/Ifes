import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiSearch, FiEye, FiTrash2, FiFilter, FiPlus, FiWifiOff, FiGitPullRequest, FiX, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
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
import { useMediaQuery } from '../hooks/useMediaQuery';
import { Card, CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Alert from '../components/ui/Alert';
import Badge from '../components/ui/Badge';
import Skeleton from '../components/ui/Skeleton';
import Tooltip from '../components/ui/Tooltip';
import { cn } from '../utils/cn';
import { formatarPercentual, pluralizar } from '../utils/formatarNumero';
import { COR_DIMENSAO_TEXTO } from '../utils/coresICSR';

// Números de dimensão sobre fundo branco usam o token de texto acessível —
// antes esta tela tinha uma paleta própria, divergente do backend e do tema.
const COR_DIMS = {
  economico: COR_DIMENSAO_TEXTO.economica,
  ambiental: COR_DIMENSAO_TEXTO.ambiental,
  social: COR_DIMENSAO_TEXTO.social,
  gestao: COR_DIMENSAO_TEXTO.gestao_qualidade,
};

const ITENS_POR_PAGINA = 20;

export default function Historico() {
  const navigate = useNavigate();
  const { notify } = useApp();
  const isMobile = useMediaQuery('(max-width: 768px)');

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
  const [confirmExcluir, setConfirmExcluir] = useState(null);

  // Comparativo entre 2 avaliações
  const [modoComparar, setModoComparar] = useState(false);
  const [selecionadas, setSelecionadas] = useState([]);
  const [comparativoAberto, setComparativoAberto] = useState(false);

  const alternarSelecao = (av) => {
    setSelecionadas((atual) => {
      if (atual.some((s) => s.id === av.id)) return atual.filter((s) => s.id !== av.id);
      if (atual.length >= 2) return atual;
      return [...atual, { id: av.id, nome: av.propriedade_nome }];
    });
  };

  const sairDoModoComparar = () => {
    setModoComparar(false);
    setSelecionadas([]);
  };

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
    if (filtroStatus && a.status !== filtroStatus) return false;
    if (filtroTecnico && a.tecnico_responsavel !== filtroTecnico) return false;
    if (filtroLocalizacao) {
      const [munic, estado] = filtroLocalizacao.split('/');
      if (a.municipio !== munic || a.estado !== estado) return false;
    }
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      a.propriedade_nome?.toLowerCase().includes(q) ||
      a.municipio?.toLowerCase().includes(q) ||
      a.proprietario?.toLowerCase().includes(q) ||
      a.tecnico_responsavel?.toLowerCase().includes(q)
    );
  });

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

  const totalPaginas = Math.ceil(total / ITENS_POR_PAGINA);

  return (
    <div className="space-y-6">
      <PageHeaderCard
        title="Histórico de Avaliações"
        subtitle={pluralizar(total, 'avaliação registrada', 'avaliações registradas')}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant={modoComparar ? 'secondary' : 'outline'}
              icon={modoComparar ? <FiX /> : <FiGitPullRequest />}
              onClick={() => (modoComparar ? sairDoModoComparar() : setModoComparar(true))}
            >
              {modoComparar ? 'Cancelar comparação' : 'Comparar'}
            </Button>
            <Button
              variant="primary"
              icon={<FiPlus />}
              onClick={() => navigate('/avaliacao/nova')}
            >
              Nova Avaliação
            </Button>
          </div>
        }
      />

      {erro && avaliacoes.length > 0 && <Alert variant="error">{erro}</Alert>}
      {dadosEmCache && !erro && (
        <CachedDataBanner mensagem="Histórico exibido a partir do cache local. Os registros podem não refletir alterações mais recentes do servidor." />
      )}

      {modoComparar && (
        <Alert
          variant="info"
          action={
            selecionadas.length === 2 && (
              <Button
                variant="primary"
                size="sm"
                onClick={() => setComparativoAberto(true)}
              >
                Comparar selecionadas
              </Button>
            )
          }
        >
          {selecionadas.length === 0 && 'Selecione 2 avaliações concluídas para comparar.'}
          {selecionadas.length === 1 && `"${selecionadas[0].nome}" selecionada — escolha mais uma.`}
          {selecionadas.length === 2 && `Pronto: "${selecionadas[0].nome}" e "${selecionadas[1].nome}".`}
        </Alert>
      )}

      {/* Filtros */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-12 gap-3 items-center">
            <div className="sm:col-span-2 md:col-span-6 relative">
              <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
              <input
                type="text"
                placeholder="Buscar propriedade, município, proprietário..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white py-2 pl-9 pr-3 text-xs text-slate-800 shadow-xs focus:border-caparao-700 focus:outline-hidden"
              />
            </div>
            <div className="sm:col-span-2 md:col-span-6 flex items-center justify-between gap-2">
              <Badge variant="outline" size="sm" className="gap-1">
                <FiFilter size={12} />
                {filtradas.length} resultado(s)
              </Badge>
            </div>

            <div className="md:col-span-4">
              <label className="block text-xs font-bold text-slate-600 mb-1">Status</label>
              <select
                value={filtroStatus}
                onChange={(e) => mudarFiltroStatus(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white p-2 text-xs text-slate-800 shadow-xs focus:border-caparao-700 focus:outline-hidden"
              >
                <option value="">Todos os status</option>
                <option value="concluida">Concluídas</option>
                <option value="rascunho">Rascunhos</option>
              </select>
            </div>

            <div className="md:col-span-4">
              <label className="block text-xs font-bold text-slate-600 mb-1">Técnico</label>
              <select
                value={filtroTecnico}
                onChange={(e) => setFiltroTecnico(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white p-2 text-xs text-slate-800 shadow-xs focus:border-caparao-700 focus:outline-hidden"
              >
                <option value="">Todos os técnicos</option>
                {tecnicos.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            <div className="md:col-span-4">
              <label className="block text-xs font-bold text-slate-600 mb-1">Localização</label>
              <select
                value={filtroLocalizacao}
                onChange={(e) => setFiltroLocalizacao(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white p-2 text-xs text-slate-800 shadow-xs focus:border-caparao-700 focus:outline-hidden"
              >
                <option value="">Todas as localizações</option>
                {localizacoes.map((loc) => (
                  <option key={loc} value={loc}>{loc}</option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <div className="space-y-3">
          {[0, 1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-16 w-full rounded-xl" />
          ))}
        </div>
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
        /* Visualização Mobile */
        <div className="space-y-3">
          {filtradas.map((av) => {
            const podeComparar = av.status === 'concluida';
            const selecionada = selecionadas.some((s) => s.id === av.id);
            return (
              <Card
                key={av.id}
                className={cn(
                  'transition-all',
                  modoComparar && selecionada && 'border-2 border-caparao-700 bg-caparao-50/20'
                )}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-start gap-2">
                      {modoComparar && (
                        <input
                          type="checkbox"
                          checked={selecionada}
                          disabled={!podeComparar || (!selecionada && selecionadas.length >= 2)}
                          onChange={() => alternarSelecao(av)}
                          aria-label={`Selecionar avaliação de ${av.propriedade_nome}`}
                          className="mt-1 h-4 w-4 rounded border-slate-300 text-caparao-700 focus:ring-caparao-700"
                        />
                      )}
                      <div>
                        <h3 className="text-sm font-bold text-slate-900">{av.propriedade_nome}</h3>
                        <p className="text-xs text-slate-500">{av.municipio} · {formatarData(av.data_avaliacao)}</p>
                      </div>
                    </div>
                    <IGSBadge classificacao={av.classificacao} igs={av.igs} size="small" />
                  </div>

                  {av.igs && (
                    <div className="grid grid-cols-4 gap-2 border-y border-slate-100 py-2.5 my-2 text-center">
                      {[
                        { label: 'Amb', val: av.indice_ambiental, cor: COR_DIMS.ambiental },
                        { label: 'Econ', val: av.indice_economico, cor: COR_DIMS.economico },
                        { label: 'Soc', val: av.indice_social, cor: COR_DIMS.social },
                        { label: 'IGQG', val: av.indice_gestao_qualidade, cor: COR_DIMS.gestao },
                      ].map((d) => (
                        <div key={d.label}>
                          <span className="block text-xs text-slate-400 font-bold">{d.label}</span>
                          <span className="block text-xs font-black tabular-nums" style={{ color: d.cor }}>
                            {d.val ? formatarPercentual(d.val, 0) : '—'}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-1">
                    <Badge variant={av.status === 'concluida' ? 'success' : 'warning'} size="sm">
                      {av.status === 'concluida' ? 'Concluída' : 'Rascunho'}
                    </Badge>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => navigate(`/avaliacao/${av.id}`)}
                        aria-label={`Ver avaliação de ${av.propriedade_nome}`}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-caparao-700 focus-visible:ring-offset-1 disabled:opacity-50 disabled:pointer-events-none cursor-pointer text-caparao-700 hover:bg-caparao-50"
                      >
                        <FiEye size={16} />
                      </button>
                      <button
                        type="button"
                        onClick={() => pedirExclusao(av.id, av.propriedade_nome)}
                        disabled={excluindo === av.id}
                        aria-label={`Excluir avaliação de ${av.propriedade_nome}`}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-caparao-700 focus-visible:ring-offset-1 disabled:opacity-50 disabled:pointer-events-none cursor-pointer text-red-500 hover:bg-red-50"
                      >
                        <FiTrash2 size={16} />
                      </button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        /* Visualização Desktop */
        <div className="overflow-x-auto rounded-xl border border-slate-200/80 bg-white shadow-xs">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 uppercase tracking-wider text-xs">
              <tr>
                {modoComparar && <th className="py-3 px-3 w-10"></th>}
                <th className="py-3 px-4">Propriedade</th>
                <th className="py-3 px-3">Município</th>
                <th className="py-3 px-3">Data</th>
                <th className="py-3 px-3">Técnico</th>
                <th className="py-3 px-3 text-center">Ambiental</th>
                <th className="py-3 px-3 text-center">Econômica</th>
                <th className="py-3 px-3 text-center">Social</th>
                <th className="py-3 px-3 text-center">IGQG</th>
                <th className="py-3 px-3">ICSR</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtradas.map((av) => {
                const podeComparar = av.status === 'concluida';
                const selecionada = selecionadas.some((s) => s.id === av.id);
                return (
                  <tr
                    key={av.id}
                    onClick={() => navigate(`/avaliacao/${av.id}`)}
                    className={cn(
                      'hover:bg-slate-50/80 cursor-pointer transition-colors',
                      modoComparar && selecionada && 'bg-caparao-50/30'
                    )}
                  >
                    {modoComparar && (
                      <td className="py-3 px-3 text-center" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={selecionada}
                          disabled={!podeComparar || (!selecionada && selecionadas.length >= 2)}
                          onChange={() => alternarSelecao(av)}
                          aria-label={`Selecionar avaliação de ${av.propriedade_nome}`}
                          className="h-4 w-4 rounded border-slate-300 text-caparao-700 focus:ring-caparao-700"
                        />
                      </td>
                    )}
                    <td className="py-3 px-4 font-bold text-slate-900">{av.propriedade_nome}</td>
                    <td className="py-3 px-3 text-slate-600">{av.municipio}</td>
                    <td className="py-3 px-3 text-slate-600">{formatarData(av.data_avaliacao)}</td>
                    <td className="py-3 px-3 text-slate-600">{av.tecnico_responsavel || '—'}</td>
                    {[
                      { val: av.indice_ambiental, cor: COR_DIMS.ambiental },
                      { val: av.indice_economico, cor: COR_DIMS.economico },
                      { val: av.indice_social, cor: COR_DIMS.social },
                      { val: av.indice_gestao_qualidade, cor: COR_DIMS.gestao },
                    ].map((d, j) => (
                      <td key={j} className="py-3 px-3 text-center font-extrabold tabular-nums" style={{ color: d.cor }}>
                        {d.val !== null && d.val !== undefined ? formatarPercentual(d.val, 0) : '—'}
                      </td>
                    ))}
                    <td className="py-3 px-3">
                      {av.classificacao ? (
                        <IGSBadge classificacao={av.classificacao} igs={av.igs} size="small" />
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                    <td className="py-3 px-3">
                      <Badge variant={av.status === 'concluida' ? 'success' : 'warning'} size="sm">
                        {av.status === 'concluida' ? 'Concluída' : 'Rascunho'}
                      </Badge>
                    </td>
                    <td className="py-3 px-3 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => navigate(`/avaliacao/${av.id}`)}
                          className="inline-flex h-9 w-9 items-center justify-center rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-caparao-700 focus-visible:ring-offset-1 disabled:opacity-50 disabled:pointer-events-none cursor-pointer text-caparao-700 hover:bg-caparao-50"
                          title="Ver avaliação"
                        >
                          <FiEye size={16} />
                        </button>
                        <button
                          type="button"
                          onClick={() => pedirExclusao(av.id, av.propriedade_nome)}
                          disabled={excluindo === av.id}
                          className="inline-flex h-9 w-9 items-center justify-center rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-caparao-700 focus-visible:ring-offset-1 disabled:opacity-50 disabled:pointer-events-none cursor-pointer text-red-500 hover:bg-red-50"
                          title="Excluir avaliação"
                        >
                          <FiTrash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Paginação */}
      {!loading && !erro && totalPaginas > 1 && (
        <div className="flex items-center justify-center gap-2 pt-2">
          <Button
            variant="secondary"
            size="sm"
            disabled={pagina <= 1}
            onClick={() => setPagina((p) => p - 1)}
            icon={<FiChevronLeft />}
          >
            Anterior
          </Button>
          <span className="text-xs font-semibold text-slate-600 px-2">
            Página {pagina} de {totalPaginas}
          </span>
          <Button
            variant="secondary"
            size="sm"
            disabled={pagina >= totalPaginas}
            onClick={() => setPagina((p) => p + 1)}
            icon={<FiChevronRight />}
          >
            Próxima
          </Button>
        </div>
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
    </div>
  );
}
