import { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiPlus, FiSearch, FiEdit2, FiTrash2, FiClipboard, FiMap, FiX, FiTrendingUp, FiWifiOff } from 'react-icons/fi';
import { maskTelefone, maskUF, maskCEP, erroEmail } from '../utils/masks';
import { propriedadesAPI, graosAPI, producaoAPI } from '../services/api';
import { useApp } from '../context/AppContext';
import EmptyState from '../components/Common/EmptyState';
import { friendlyError } from '../utils/errorMessages';
import IGSBadge from '../components/Common/IGSBadge';
import MapPicker from '../components/Common/MapPicker';
import PageHeaderCard from '../components/Common/PageHeaderCard';
import ConfirmDialog from '../components/Common/ConfirmDialog';
import CachedDataBanner from '../components/Common/CachedDataBanner';
import { useMediaQuery } from '../hooks/useMediaQuery';
import Button from '../components/ui/Button';
import Dialog from '../components/ui/Dialog';
import Alert from '../components/ui/Alert';
import Badge from '../components/ui/Badge';
import Skeleton from '../components/ui/Skeleton';
import Tooltip from '../components/ui/Tooltip';
import { Card, CardContent } from '../components/ui/Card';

const FORM_INICIAL = {
  nome: '', municipio: '', estado: 'ES', proprietario: '',
  area_total: '', area_cafe: '', telefone: '', email: '',
  rua: '', numero: '', complemento: '', bairro: '', cep: '',
  graos: [],
};

function PreviewProducao({ info }) {
  if (!info) return null;
  if (info.loading) {
    return (
      <div className="flex items-center gap-1.5 py-1 text-xs text-slate-500">
        <span className="h-3 w-3 animate-spin rounded-full border-2 border-slate-400 border-t-transparent" />
        <span>Carregando dados IBGE…</span>
      </div>
    );
  }
  if (info.erro) {
    return (
      <span className="text-xs text-slate-400 italic">
        {info.erro}
      </span>
    );
  }
  const { rendimento_atual, rendimento_uf_atual } = info.data || {};
  if (!rendimento_atual && !rendimento_uf_atual) {
    return (
      <span className="text-xs text-slate-400 italic">
        Sem dados IBGE para este município
      </span>
    );
  }
  return (
    <div className="flex flex-wrap gap-2 mt-1">
      {rendimento_atual && (
        <Tooltip content={`Rendimento médio do município (${rendimento_atual.ano})`}>
          <span className="inline-flex items-center gap-1 rounded-md border border-emerald-300 bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-800">
            <FiTrendingUp size={11} />
            Município: {rendimento_atual.valor.toLocaleString('pt-BR')} kg/ha
          </span>
        </Tooltip>
      )}
      {rendimento_uf_atual && (
        <Tooltip content={`Rendimento médio do estado (${rendimento_uf_atual.ano})`}>
          <span className="inline-flex items-center gap-1 rounded-md border border-slate-300 bg-slate-50 px-2 py-0.5 text-[11px] font-semibold text-slate-700">
            Estado: {rendimento_uf_atual.valor.toLocaleString('pt-BR')} kg/ha
          </span>
        </Tooltip>
      )}
    </div>
  );
}

function FormPropriedade({ dados, onChange, graosDisponiveis, previewProducao }) {
  const [graoBusca, setGraoBusca] = useState('');
  const [seletorGraoAberto, setSeletorGraoAberto] = useState(false);
  const f = (field) => (e) => onChange({ ...dados, [field]: e.target.value });

  const handleTelefone = (e) => onChange({ ...dados, telefone: maskTelefone(e.target.value) });
  const handleUF = (e) => onChange({ ...dados, estado: maskUF(e.target.value) });
  const handleCEP = (e) => onChange({ ...dados, cep: maskCEP(e.target.value) });

  const handleMapChange = (lat, lng) => onChange({ ...dados, latitude: lat, longitude: lng });

  const addressQuery = [dados.rua, dados.numero, dados.bairro, dados.municipio, dados.estado, 'Brasil']
    .filter(Boolean).join(', ');

  const emailErro = erroEmail(dados.email);
  const graosJaSelecionados = new Set((dados.graos || []).map((g) => g.id));

  const adicionarGrao = (grao) => {
    if (!grao || graosJaSelecionados.has(grao.id)) return;
    onChange({ ...dados, graos: [...(dados.graos || []), { id: grao.id, nome: grao.nome, codigo: grao.codigo, ibge_categoria: grao.ibge_categoria, area_plantada: '' }] });
    setSeletorGraoAberto(false);
    setGraoBusca('');
  };

  const removerGrao = (id) => {
    onChange({ ...dados, graos: (dados.graos || []).filter((g) => g.id !== id) });
  };

  const atualizarArea = (id, area) => {
    onChange({ ...dados, graos: (dados.graos || []).map((g) => g.id === id ? { ...g, area_plantada: area } : g) });
  };

  const graosFiltrados = graosDisponiveis
    .filter((g) => !graosJaSelecionados.has(g.id))
    .filter((g) => !graoBusca || g.nome.toLowerCase().includes(graoBusca.toLowerCase()) || g.codigo.toLowerCase().includes(graoBusca.toLowerCase()));

  return (
    <div className="space-y-4 text-xs">
      <div>
        <h4 className="font-bold text-caparao-800 uppercase tracking-wider text-[11px] mb-2">
          Informações Básicas
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="sm:col-span-2">
            <label className="block font-semibold text-slate-700 mb-1">Nome da Propriedade *</label>
            <input
              type="text"
              autoFocus
              className="w-full rounded-lg border border-slate-300 p-2 text-xs text-slate-800 shadow-xs focus:border-caparao-700 focus:outline-hidden"
              value={dados.nome}
              onChange={f('nome')}
            />
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Município *</label>
            <input
              type="text"
              className="w-full rounded-lg border border-slate-300 p-2 text-xs text-slate-800 shadow-xs focus:border-caparao-700 focus:outline-hidden"
              value={dados.municipio}
              onChange={f('municipio')}
            />
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">UF (Ex.: ES, MG)</label>
            <input
              type="text"
              maxLength={2}
              className="w-full rounded-lg border border-slate-300 p-2 text-xs text-slate-800 uppercase shadow-xs focus:border-caparao-700 focus:outline-hidden"
              value={dados.estado}
              onChange={handleUF}
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block font-semibold text-slate-700 mb-1">Nome do Proprietário *</label>
            <input
              type="text"
              className="w-full rounded-lg border border-slate-300 p-2 text-xs text-slate-800 shadow-xs focus:border-caparao-700 focus:outline-hidden"
              value={dados.proprietario}
              onChange={f('proprietario')}
            />
          </div>
        </div>
      </div>

      <div className="border-t border-slate-100 pt-3">
        <h4 className="font-bold text-caparao-800 uppercase tracking-wider text-[11px] mb-2">
          Endereço Completo
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="sm:col-span-2">
            <label className="block font-semibold text-slate-700 mb-1">Rua / Via</label>
            <input
              type="text"
              className="w-full rounded-lg border border-slate-300 p-2 text-xs text-slate-800 shadow-xs focus:border-caparao-700 focus:outline-hidden"
              value={dados.rua}
              onChange={f('rua')}
            />
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Número</label>
            <input
              type="text"
              className="w-full rounded-lg border border-slate-300 p-2 text-xs text-slate-800 shadow-xs focus:border-caparao-700 focus:outline-hidden"
              value={dados.numero}
              onChange={f('numero')}
            />
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Complemento</label>
            <input
              type="text"
              placeholder="Apto., lote..."
              className="w-full rounded-lg border border-slate-300 p-2 text-xs text-slate-800 shadow-xs focus:border-caparao-700 focus:outline-hidden"
              value={dados.complemento}
              onChange={f('complemento')}
            />
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Bairro</label>
            <input
              type="text"
              className="w-full rounded-lg border border-slate-300 p-2 text-xs text-slate-800 shadow-xs focus:border-caparao-700 focus:outline-hidden"
              value={dados.bairro}
              onChange={f('bairro')}
            />
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">CEP</label>
            <input
              type="text"
              placeholder="XXXXX-XXX"
              className="w-full rounded-lg border border-slate-300 p-2 text-xs text-slate-800 shadow-xs focus:border-caparao-700 focus:outline-hidden"
              value={dados.cep}
              onChange={handleCEP}
            />
          </div>
        </div>
      </div>

      <div className="border-t border-slate-100 pt-3">
        <h4 className="font-bold text-caparao-800 uppercase tracking-wider text-[11px] mb-2">
          Áreas de Cultivo
        </h4>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Área Total (ha)</label>
            <input
              type="number"
              step="0.01"
              min="0"
              className="w-full rounded-lg border border-slate-300 p-2 text-xs text-slate-800 shadow-xs focus:border-caparao-700 focus:outline-hidden"
              value={dados.area_total}
              onChange={f('area_total')}
            />
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Área de Café (ha)</label>
            <input
              type="number"
              step="0.01"
              min="0"
              className="w-full rounded-lg border border-slate-300 p-2 text-xs text-slate-800 shadow-xs focus:border-caparao-700 focus:outline-hidden"
              value={dados.area_cafe}
              onChange={f('area_cafe')}
            />
          </div>
        </div>
      </div>

      {/* Localização no mapa */}
      <div className="border-t border-slate-100 pt-3">
        <h4 className="font-bold text-caparao-800 uppercase tracking-wider text-[11px] mb-2">
          Localização no Mapa
        </h4>
        <MapPicker
          lat={dados.latitude}
          lng={dados.longitude}
          onChange={handleMapChange}
          addressQuery={addressQuery}
          height={260}
        />
      </div>

      {/* Grãos Cultivados */}
      <div className="border-t border-slate-100 pt-3">
        <h4 className="font-bold text-caparao-800 uppercase tracking-wider text-[11px] mb-2">
          Grãos Cultivados
        </h4>
        <div className="relative">
          <input
            type="text"
            value={graoBusca}
            onChange={(e) => {
              setGraoBusca(e.target.value);
              setSeletorGraoAberto(true);
            }}
            onFocus={() => setSeletorGraoAberto(true)}
            placeholder="Digite para buscar e adicionar um grão..."
            className="w-full rounded-lg border border-slate-300 p-2 text-xs text-slate-800 shadow-xs focus:border-caparao-700 focus:outline-hidden"
          />

          {seletorGraoAberto && graosFiltrados.length > 0 && (
            <div className="absolute left-0 right-0 top-full z-10 mt-1 max-h-48 overflow-y-auto rounded-lg border border-slate-200 bg-white p-1 shadow-lg">
              {graosFiltrados.map((g) => (
                <div
                  key={g.id}
                  onClick={() => adicionarGrao(g)}
                  className="flex cursor-pointer items-center justify-between p-2 rounded-md hover:bg-slate-50"
                >
                  <span className="font-semibold text-slate-800">{g.nome}</span>
                  <span className="text-[11px] text-slate-400">{g.codigo}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Lista de grãos selecionados */}
        {(dados.graos || []).length > 0 && (
          <div className="mt-3 space-y-2">
            {(dados.graos || []).map((g) => {
              const preview = previewProducao[g.id];
              const temIBGE = !!g.ibge_categoria;
              return (
                <div key={g.id} className="rounded-xl border border-slate-200 bg-slate-50/60 p-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="rounded-md bg-caparao-50 px-2 py-0.5 text-xs font-bold text-caparao-800 border border-caparao-200">
                      {g.codigo}
                    </span>
                    <span className="flex-1 font-bold text-slate-800">{g.nome}</span>
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        placeholder="Área (ha)"
                        value={g.area_plantada || ''}
                        onChange={(e) => atualizarArea(g.id, e.target.value)}
                        className="w-24 rounded-lg border border-slate-300 bg-white p-1 text-xs text-slate-800 shadow-xs"
                      />
                      <button
                        type="button"
                        onClick={() => removerGrao(g.id)}
                        className="rounded-md p-1 text-slate-400 hover:text-red-600"
                        title="Remover"
                      >
                        <FiX size={16} />
                      </button>
                    </div>
                  </div>
                  {temIBGE && dados.municipio && dados.estado && (
                    <div className="mt-2 pt-2 border-t border-slate-200/60">
                      <span className="block text-[11px] text-slate-500 mb-1">
                        Média IBGE PAM — {dados.municipio}/{dados.estado}:
                      </span>
                      <PreviewProducao info={preview} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="border-t border-slate-100 pt-3">
        <h4 className="font-bold text-caparao-800 uppercase tracking-wider text-[11px] mb-2">
          Contato
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Telefone</label>
            <input
              type="tel"
              placeholder="(XX) XXXXX-XXXX"
              className="w-full rounded-lg border border-slate-300 p-2 text-xs text-slate-800 shadow-xs focus:border-caparao-700 focus:outline-hidden"
              value={dados.telefone}
              onChange={handleTelefone}
            />
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">E-mail</label>
            <input
              type="email"
              placeholder="produtor@email.com"
              className="w-full rounded-lg border border-slate-300 p-2 text-xs text-slate-800 shadow-xs focus:border-caparao-700 focus:outline-hidden"
              value={dados.email}
              onChange={f('email')}
            />
            {emailErro && <span className="block mt-1 text-[11px] text-red-600">{emailErro}</span>}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Propriedades() {
  const navigate = useNavigate();
  const { notify } = useApp();
  const isMobile = useMediaQuery('(max-width: 640px)');

  const [propriedades, setPropriedades] = useState([]);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState('');
  const [dadosEmCache, setDadosEmCache] = useState(false);
  const [dialog, setDialog] = useState({ open: false, editando: null });
  const [form, setForm] = useState(FORM_INICIAL);
  const [salvando, setSalvando] = useState(false);
  const [excluindo, setExcluindo] = useState(null);
  const [confirmExcluir, setConfirmExcluir] = useState(null);
  const [graosDisponiveis, setGraosDisponiveis] = useState([]);
  const [previewProducao, setPreviewProducao] = useState({});
  const debounceRef = useRef(null);

  const carregar = useCallback(() => {
    setLoading(true);
    setErro('');
    propriedadesAPI.listar({ search, limit: 50 })
      .then((r) => {
        setPropriedades(r.data.data);
        setTotal(r.data.total);
        setDadosEmCache(Boolean(r.fromCache));
      })
      .catch((e) => setErro(friendlyError(e)))
      .finally(() => setLoading(false));
  }, [search]);

  useEffect(() => { carregar(); }, [carregar]);

  useEffect(() => {
    graosAPI.listarAtivos()
      .then((r) => setGraosDisponiveis(r.data))
      .catch((e) => notify(friendlyError(e), 'error'));
  }, [notify]);

  useEffect(() => {
    if (!dialog.open) return;
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      const { municipio, estado, graos } = form;
      if (!municipio || !estado || estado.length < 2) return;

      const graosComIBGE = (graos || []).filter((g) => g.ibge_categoria);
      if (graosComIBGE.length === 0) return;

      graosComIBGE.forEach((g) => {
        setPreviewProducao((prev) => ({ ...prev, [g.id]: { loading: true } }));
        producaoAPI.media(municipio, estado, g.id)
          .then((r) => setPreviewProducao((prev) => ({ ...prev, [g.id]: { data: r.data } })))
          .catch((e) => {
            setPreviewProducao((prev) => ({ ...prev, [g.id]: { erro: e.message || 'Sem dados disponíveis' } }));
          });
      });
    }, 800);

    return () => clearTimeout(debounceRef.current);
  }, [form.municipio, form.estado, form.graos, dialog.open]);

  const abrirNovo = () => {
    setForm(FORM_INICIAL);
    setPreviewProducao({});
    setDialog({ open: true, editando: null });
  };

  const abrirEditar = async (p) => {
    setPreviewProducao({});
    let graos = [];
    try {
      const r = await propriedadesAPI.buscar(p.id);
      graos = (r.data.graos || []).map((g) => ({
        id: g.id, nome: g.nome, codigo: g.codigo,
        ibge_categoria: g.ibge_categoria, area_plantada: g.area_plantada || '',
      }));
    } catch (e) {
      notify(`Não foi possível carregar os grãos desta propriedade: ${friendlyError(e)}`, 'error');
    }
    setForm({
      ...p,
      area_total: p.area_total || '',
      area_cafe: p.area_cafe || '',
      graos,
    });
    setDialog({ open: true, editando: p });
  };

  const fecharDialog = () => {
    setDialog({ open: false, editando: null });
    setPreviewProducao({});
  };

  const salvar = async () => {
    if (!form.nome || !form.municipio || !form.proprietario) {
      notify('Preencha os campos obrigatórios (*)', 'error'); return;
    }
    setSalvando(true);
    try {
      if (dialog.editando) {
        await propriedadesAPI.atualizar(dialog.editando.id, form);
        notify('Propriedade atualizada!');
      } else {
        await propriedadesAPI.criar(form);
        notify('Propriedade cadastrada!');
      }
      fecharDialog();
      carregar();
    } catch (e) { notify(friendlyError(e), 'error'); }
    finally { setSalvando(false); }
  };

  const confirmarExclusao = async () => {
    const id = confirmExcluir.id;
    setExcluindo(id);
    try {
      await propriedadesAPI.excluir(id);
      notify('Propriedade excluída.');
      setConfirmExcluir(null);
      carregar();
    } catch (e) { notify(friendlyError(e), 'error'); }
    finally { setExcluindo(null); }
  };

  return (
    <div className="space-y-6">
      <PageHeaderCard
        title="Propriedades"
        subtitle={`${total} propriedade(s) cadastrada(s)`}
        actions={
          <Button variant="primary" icon={<FiPlus />} onClick={abrirNovo}>
            Nova Propriedade
          </Button>
        }
      />

      {erro && propriedades.length > 0 && <Alert variant="error">{erro}</Alert>}
      {dadosEmCache && !erro && (
        <CachedDataBanner mensagem="Lista carregada do cache local. Novas propriedades ou edições recentes podem aparecer somente após reconexão." />
      )}

      {/* Campo de Busca */}
      <div className="relative">
        <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
        <input
          type="text"
          placeholder="Buscar por nome, município ou proprietário..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-800 placeholder-slate-400 shadow-xs focus:border-caparao-700 focus:outline-hidden"
        />
      </div>

      {loading ? (
        <div className="space-y-3">
          {[0, 1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-16 w-full rounded-xl" />
          ))}
        </div>
      ) : erro && propriedades.length === 0 ? (
        <Card>
          <CardContent>
            <EmptyState
              icon={<FiWifiOff size={40} />}
              title="Não foi possível carregar as propriedades"
              description={erro}
              actionLabel="Tentar novamente"
              onAction={carregar}
            />
          </CardContent>
        </Card>
      ) : propriedades.length === 0 ? (
        <Card>
          <CardContent>
            <EmptyState
              icon={<FiMap size={40} />}
              title="Nenhuma propriedade cadastrada"
              description="Cadastre as propriedades rurais antes de iniciar as avaliações ICSR. Cada propriedade terá seu histórico e evolução de sustentabilidade."
              actionLabel="Cadastrar propriedade"
              onAction={abrirNovo}
            />
          </CardContent>
        </Card>
      ) : isMobile ? (
        <div className="space-y-3">
          {propriedades.map((p) => (
            <Card
              key={p.id}
              onClick={() => navigate(`/propriedades/${p.id}`)}
              className="cursor-pointer hover:border-caparao-700/40 transition-colors shadow-xs"
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-base font-bold text-slate-900">{p.nome}</h3>
                    <p className="text-xs text-slate-500">{p.municipio}/{p.estado} · {p.proprietario}</p>
                  </div>
                  {p.ultima_classificacao && (
                    <IGSBadge classificacao={p.ultima_classificacao} igs={p.ultimo_igs} size="small" />
                  )}
                </div>

                <div className="mt-2 flex flex-wrap gap-1.5">
                  {p.area_cafe && <Badge variant="outline">{p.area_cafe} ha café</Badge>}
                  <Badge variant="primary">{p.total_avaliacoes} avaliação(ões)</Badge>
                </div>

                <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3" onClick={(e) => e.stopPropagation()}>
                  <Button
                    size="sm"
                    variant="ghost"
                    icon={<FiClipboard />}
                    onClick={() => navigate(`/avaliacao/nova?propriedade=${p.id}`)}
                  >
                    Avaliar
                  </Button>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => abrirEditar(p)}
                      aria-label={`Editar ${p.nome}`}
                      className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-800"
                    >
                      <FiEdit2 size={16} />
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmExcluir(p)}
                      disabled={excluindo === p.id}
                      aria-label={`Excluir ${p.nome}`}
                      className="rounded-lg p-1.5 text-red-500 hover:bg-red-50 hover:text-red-700"
                    >
                      <FiTrash2 size={16} />
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200/80 bg-white shadow-xs">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4">Propriedade</th>
                <th className="py-3 px-4">Município / UF</th>
                <th className="py-3 px-4">Proprietário</th>
                <th className="py-3 px-4">Área Café</th>
                <th className="py-3 px-4">Avaliações</th>
                <th className="py-3 px-4">Último ICSR</th>
                <th className="py-3 px-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {propriedades.map((p) => (
                <tr
                  key={p.id}
                  onClick={() => navigate(`/propriedades/${p.id}`)}
                  className="hover:bg-slate-50/80 cursor-pointer transition-colors"
                >
                  <td className="py-3.5 px-4 font-bold text-slate-900 text-sm">{p.nome}</td>
                  <td className="py-3.5 px-4 text-slate-600">{p.municipio}/{p.estado}</td>
                  <td className="py-3.5 px-4 text-slate-600">{p.proprietario}</td>
                  <td className="py-3.5 px-4 text-slate-600 tabular-nums">
                    {p.area_cafe ? `${p.area_cafe} ha` : '—'}
                  </td>
                  <td className="py-3.5 px-4">
                    <Badge variant="primary" size="sm">
                      {p.total_avaliacoes} aval.
                    </Badge>
                  </td>
                  <td className="py-3.5 px-4">
                    {p.ultima_classificacao ? (
                      <IGSBadge classificacao={p.ultima_classificacao} igs={p.ultimo_igs} size="small" />
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-1">
                      <Tooltip content="Nova Avaliação">
                        <button
                          type="button"
                          aria-label={`Nova avaliação para ${p.nome}`}
                          onClick={() => navigate(`/avaliacao/nova?propriedade=${p.id}`)}
                          className="rounded-lg p-1.5 text-caparao-700 hover:bg-caparao-50"
                        >
                          <FiClipboard size={16} />
                        </button>
                      </Tooltip>
                      <Tooltip content="Editar propriedade">
                        <button
                          type="button"
                          onClick={() => abrirEditar(p)}
                          aria-label={`Editar ${p.nome}`}
                          className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-800"
                        >
                          <FiEdit2 size={16} />
                        </button>
                      </Tooltip>
                      <Tooltip content="Excluir propriedade">
                        <button
                          type="button"
                          onClick={() => setConfirmExcluir(p)}
                          disabled={excluindo === p.id}
                          aria-label={`Excluir ${p.nome}`}
                          className="rounded-lg p-1.5 text-red-500 hover:bg-red-50 hover:text-red-700"
                        >
                          <FiTrash2 size={16} />
                        </button>
                      </Tooltip>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal de Criação/Edição */}
      <Dialog
        open={dialog.open}
        onOpenChange={(open) => !open && !salvando && fecharDialog()}
        title={dialog.editando ? 'Editar Propriedade' : 'Nova Propriedade'}
        className="max-w-2xl max-h-[90vh] overflow-y-auto"
        footer={
          <div className="flex w-full items-center justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={fecharDialog} disabled={salvando}>
              Cancelar
            </Button>
            <Button variant="primary" onClick={salvar} loading={salvando}>
              {dialog.editando ? 'Salvar' : 'Cadastrar'}
            </Button>
          </div>
        }
      >
        <div className="py-2">
          <FormPropriedade
            dados={form}
            onChange={setForm}
            graosDisponiveis={graosDisponiveis}
            previewProducao={previewProducao}
          />
        </div>
      </Dialog>

      <ConfirmDialog
        open={!!confirmExcluir}
        title="Excluir propriedade"
        message={`Excluir "${confirmExcluir?.nome}" e todas as avaliações vinculadas? Esta ação não pode ser desfeita.`}
        confirmLabel="Excluir"
        onConfirm={confirmarExclusao}
        onCancel={() => setConfirmExcluir(null)}
        loading={excluindo === confirmExcluir?.id}
      />
    </div>
  );
}
