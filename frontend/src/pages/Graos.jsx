import { useEffect, useState } from 'react';
import { FiPlus, FiSearch, FiEdit2, FiTrash2, FiCheck, FiX, FiRefreshCw, FiWifiOff } from 'react-icons/fi';
import { MdGrain } from 'react-icons/md';
import { graosAPI } from '../services/api';
import { useApp } from '../context/AppContext';
import { friendlyError } from '../utils/errorMessages';
import PageHeaderCard from '../components/Common/PageHeaderCard';
import ConfirmDialog from '../components/Common/ConfirmDialog';
import EmptyState from '../components/Common/EmptyState';
import { useMediaQuery } from '../hooks/useMediaQuery';
import { Card, CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Alert from '../components/ui/Alert';
import Badge from '../components/ui/Badge';
import Dialog from '../components/ui/Dialog';
import Switch from '../components/ui/Switch';
import { pluralizar } from '../utils/formatarNumero';

const FORM_INICIAL = { nome: '', codigo: '', descricao: '', ativo: true };

function FormGrao({ dados, onChange }) {
  const f = (field) => (e) => onChange({ ...dados, [field]: e.target.value });
  const handleAtivo = (checked) => onChange({ ...dados, ativo: checked });

  return (
    <div className="space-y-4 py-1 text-xs">
      <div>
        <label className="block font-bold text-slate-700 mb-1">Nome do Grão *</label>
        <input
          type="text"
          autoFocus
          value={dados.nome}
          onChange={f('nome')}
          className="w-full rounded-lg border border-slate-300 p-2 text-xs text-slate-800 shadow-xs focus:border-caparao-700 focus:outline-hidden"
        />
      </div>
      <div>
        <label className="block font-bold text-slate-700 mb-1">Código (Ex: MILHO, SOJA) *</label>
        <input
          type="text"
          maxLength={20}
          value={dados.codigo}
          onChange={f('codigo')}
          className="w-full rounded-lg border border-slate-300 p-2 text-xs text-slate-800 uppercase shadow-xs focus:border-caparao-700 focus:outline-hidden"
        />
      </div>
      <div>
        <label className="block font-bold text-slate-700 mb-1">Descrição (Nome científico, etc)</label>
        <textarea
          rows={2}
          value={dados.descricao}
          onChange={f('descricao')}
          className="w-full rounded-lg border border-slate-300 p-2 text-xs text-slate-800 shadow-xs focus:border-caparao-700 focus:outline-hidden"
        />
      </div>
      <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50/50 p-3">
        <div>
          <span className="font-bold text-slate-800 block">Disponível para seleção</span>
          <span className="text-xs text-slate-500">Permite associar este grão às propriedades cadastradas</span>
        </div>
        <Switch checked={dados.ativo} onCheckedChange={handleAtivo} />
      </div>
    </div>
  );
}

export default function Graos() {
  const { notify } = useApp();
  const isMobile = useMediaQuery('(max-width: 640px)');

  const [graos, setGraos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState('');
  const [search, setSearch] = useState('');
  const [dialog, setDialog] = useState({ open: false, editando: null });
  const [form, setForm] = useState(FORM_INICIAL);
  const [salvando, setSalvando] = useState(false);
  const [excluindo, setExcluindo] = useState(null);
  const [confirmExcluir, setConfirmExcluir] = useState(null);
  const [sincronizando, setSincronizando] = useState(false);

  const carregar = async () => {
    setLoading(true);
    setErro('');
    try {
      const res = await graosAPI.listarTodosAdmin();
      setGraos(res.data);
    } catch (e) {
      setErro(friendlyError(e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { carregar(); }, []);

  const graosFiltrados = graos.filter(g =>
    g.nome.toLowerCase().includes(search.toLowerCase()) ||
    g.codigo.toLowerCase().includes(search.toLowerCase())
  );

  const abrirNovo = () => { setForm(FORM_INICIAL); setDialog({ open: true, editando: null }); };
  const abrirEditar = (g) => { setForm({ ...g }); setDialog({ open: true, editando: g }); };
  const fecharDialog = () => setDialog({ open: false, editando: null });

  const salvar = async () => {
    if (!form.nome || !form.codigo) {
      notify('Nome e código são obrigatórios', 'error'); return;
    }
    setSalvando(true);
    try {
      if (dialog.editando) {
        await graosAPI.atualizar(dialog.editando.id, form);
        notify('Grão atualizado!');
      } else {
        await graosAPI.criar(form);
        notify('Grão criado!');
      }
      fecharDialog();
      carregar();
    } catch (e) {
      notify(friendlyError(e), 'error');
    } finally {
      setSalvando(false);
    }
  };

  const sincronizarIBGE = async () => {
    setSincronizando(true);
    try {
      const res = await graosAPI.sincronizarIBGE();
      notify(`${res.data.mensagem} (${res.data.total_ibge} culturas no ES, ${res.data.ignorados} já existiam)`, 'success');
      carregar();
    } catch (e) {
      notify(friendlyError(e), 'error');
    } finally {
      setSincronizando(false);
    }
  };

  const confirmarExclusao = async () => {
    const id = confirmExcluir.id;
    setExcluindo(id);
    try {
      await graosAPI.excluir(id);
      notify('Grão excluído.');
      setConfirmExcluir(null);
      carregar();
    } catch (e) {
      notify(friendlyError(e), 'error');
    } finally {
      setExcluindo(null);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeaderCard
        title="Gestão de Grãos"
        subtitle={pluralizar(graos.length, 'grão cadastrado', 'grãos cadastrados')}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              icon={<FiRefreshCw />}
              loading={sincronizando}
              onClick={sincronizarIBGE}
            >
              Sincronizar com IBGE
            </Button>
            <Button variant="primary" icon={<FiPlus />} onClick={abrirNovo}>
              Novo Grão
            </Button>
          </div>
        }
      />

      {erro && graos.length > 0 && <Alert variant="error">{erro}</Alert>}

      <div className="relative">
        <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
        <input
          type="text"
          placeholder="Buscar por nome ou código..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-10 pr-4 text-xs text-slate-800 shadow-xs focus:border-caparao-700 focus:outline-hidden"
        />
      </div>

      {loading ? (
        <div className="space-y-3">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-16 w-full rounded-xl bg-slate-200 animate-pulse" />
          ))}
        </div>
      ) : erro && graos.length === 0 ? (
        <Card>
          <CardContent>
            <EmptyState
              icon={<FiWifiOff size={40} />}
              title="Não foi possível carregar os grãos"
              description={erro}
              actionLabel="Tentar novamente"
              onAction={carregar}
            />
          </CardContent>
        </Card>
      ) : graosFiltrados.length === 0 ? (
        <Card>
          <CardContent>
            <EmptyState
              icon={<MdGrain size={40} />}
              title="Nenhum grão encontrado"
              description={search ? 'Nenhum grão corresponde a essa busca.' : 'Cadastre os grãos cultivados na região.'}
              actionLabel="Adicionar primeiro grão"
              onAction={abrirNovo}
            />
          </CardContent>
        </Card>
      ) : isMobile ? (
        <div className="space-y-3">
          {graosFiltrados.map((g) => (
            <Card key={g.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">{g.nome}</h3>
                    <Badge variant="outline" size="sm" className="mt-1">{g.codigo}</Badge>
                  </div>
                  <Badge variant={g.ativo ? 'success' : 'outline'} size="sm">
                    {g.ativo ? 'Ativo' : 'Inativo'}
                  </Badge>
                </div>
                {g.descricao && (
                  <p className="mt-2 text-xs text-slate-500">{g.descricao}</p>
                )}
                <div className="mt-3 flex gap-2 border-t border-slate-100 pt-2">
                  <Button size="sm" variant="ghost" icon={<FiEdit2 />} onClick={() => abrirEditar(g)} className="flex-1">
                    Editar
                  </Button>
                  <Button size="sm" variant="ghost" icon={<FiTrash2 />} onClick={() => setConfirmExcluir(g)} className="flex-1 text-red-600 hover:text-red-700">
                    Excluir
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200/80 bg-white shadow-xs">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 uppercase tracking-wider text-xs">
              <tr>
                <th className="py-3 px-4">Nome</th>
                <th className="py-3 px-4">Código</th>
                <th className="py-3 px-4">Descrição</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {graosFiltrados.map((g) => (
                <tr key={g.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-slate-900">{g.nome}</td>
                  <td className="py-3.5 px-4"><Badge variant="outline" size="sm">{g.codigo}</Badge></td>
                  <td className="py-3.5 px-4 text-slate-500 max-w-xs truncate">{g.descricao || '—'}</td>
                  <td className="py-3.5 px-4">
                    <Badge variant={g.ativo ? 'success' : 'outline'} size="sm">
                      {g.ativo ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => abrirEditar(g)}
                        aria-label={`Editar ${g.nome}`}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-caparao-700 focus-visible:ring-offset-1 disabled:opacity-50 disabled:pointer-events-none cursor-pointer text-slate-500 hover:bg-slate-100"
                      >
                        <FiEdit2 size={16} />
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmExcluir(g)}
                        disabled={excluindo === g.id}
                        aria-label={`Excluir ${g.nome}`}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-caparao-700 focus-visible:ring-offset-1 disabled:opacity-50 disabled:pointer-events-none cursor-pointer text-red-600 hover:bg-red-50"
                      >
                        <FiTrash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Dialog Formulário */}
      <Dialog
        open={dialog.open}
        onOpenChange={(open) => !open && !salvando && fecharDialog()}
        title={dialog.editando ? 'Editar Grão' : 'Novo Grão'}
        className="max-w-md"
        footer={
          <div className="flex w-full items-center justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={fecharDialog} disabled={salvando}>
              Cancelar
            </Button>
            <Button variant="primary" onClick={salvar} loading={salvando}>
              {dialog.editando ? 'Atualizar' : 'Criar'}
            </Button>
          </div>
        }
      >
        <FormGrao dados={form} onChange={setForm} />
      </Dialog>

      <ConfirmDialog
        open={!!confirmExcluir}
        title="Excluir grão"
        message={`Excluir "${confirmExcluir?.nome}"? Propriedades que o utilizam não serão afetadas.`}
        confirmLabel="Excluir"
        onConfirm={confirmarExclusao}
        onCancel={() => setConfirmExcluir(null)}
        loading={excluindo === confirmExcluir?.id}
      />
    </div>
  );
}
