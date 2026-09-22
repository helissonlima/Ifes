import { useEffect, useMemo, useState, useCallback } from 'react';
import { erroEmail } from '../utils/masks';
import {
  FiUserPlus, FiSearch, FiEdit2, FiTrash2, FiKey, FiShield, FiUsers,
  FiUserCheck, FiUserX, FiEye, FiEyeOff, FiPlus, FiWifiOff,
} from 'react-icons/fi';
import { authAPI } from '../services/api';
import { useApp } from '../context/AppContext';
import { friendlyError } from '../utils/errorMessages';
import { formatarData } from '../utils/formatarData';
import PageHeaderCard from '../components/Common/PageHeaderCard';
import EmptyState from '../components/Common/EmptyState';
import BackupCard from '../components/Admin/BackupCard';
import { useMediaQuery } from '../hooks/useMediaQuery';
import { Card, CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Alert from '../components/ui/Alert';
import Badge from '../components/ui/Badge';
import Dialog from '../components/ui/Dialog';
import Switch from '../components/ui/Switch';
import Tooltip from '../components/ui/Tooltip';
import { cn } from '../utils/cn';

const PERMISSION_KEYS = [
  { key: 'dashboard', label: 'Dashboard' },
  { key: 'propriedades', label: 'Propriedades' },
  { key: 'avaliacoes', label: 'Nova Avaliação' },
  { key: 'historico', label: 'Histórico' },
  { key: 'metodologia', label: 'Metodologia' },
];

const ROLES = [
  { value: 'admin', label: 'Administrador', cor: '#1B4D24', desc: 'Acesso total + gerência de usuários' },
  { value: 'tecnico', label: 'Técnico', cor: '#0284C7', desc: 'Cadastra propriedades e realiza avaliações' },
  { value: 'visualizador', label: 'Visualizador', cor: '#7C3AED', desc: 'Apenas consulta dashboards e históricos' },
];

const PRESETS_PERMISSAO = {
  admin: { dashboard: true, propriedades: true, avaliacoes: true, historico: true, metodologia: true },
  tecnico: { dashboard: true, propriedades: true, avaliacoes: true, historico: true, metodologia: true },
  visualizador: { dashboard: true, propriedades: false, avaliacoes: false, historico: true, metodologia: true },
};

const FORM_VAZIO = {
  nome: '', email: '', senha: '', foto_url: '', role: 'tecnico',
  permissions: { ...PRESETS_PERMISSAO.tecnico },
};

const corPapel = (role) => ROLES.find((r) => r.value === role)?.cor || '#64748B';
const labelPapel = (role) => ROLES.find((r) => r.value === role)?.label || role;

const iniciais = (nome = '') =>
  nome.trim().split(/\s+/).slice(0, 2).map((p) => p[0]?.toUpperCase() || '').join('') || '?';

export default function Usuarios() {
  const { notify, user: usuarioLogado } = useApp();
  const isMobile = useMediaQuery('(max-width: 768px)');

  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState('');
  const [search, setSearch] = useState('');
  const [filtroRole, setFiltroRole] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('');

  // Dialogs
  const [dialogForm, setDialogForm] = useState({ open: false, editando: null });
  const [form, setForm] = useState(FORM_VAZIO);
  const [showSenha, setShowSenha] = useState(false);
  const [salvando, setSalvando] = useState(false);

  const [dialogSenha, setDialogSenha] = useState({ open: false, usuario: null });
  const [novaSenha, setNovaSenha] = useState('');
  const [resetando, setResetando] = useState(false);

  const [dialogExcluir, setDialogExcluir] = useState({ open: false, usuario: null });
  const [excluindo, setExcluindo] = useState(false);

  const carregar = useCallback(async () => {
    setLoading(true);
    try {
      const r = await authAPI.listarUsuarios();
      setUsuarios(r.data);
      setErro('');
    } catch (e) {
      setErro(friendlyError(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { carregar(); }, [carregar]);

  const stats = useMemo(() => ({
    total: usuarios.length,
    ativos: usuarios.filter((u) => u.ativo).length,
    inativos: usuarios.filter((u) => !u.ativo).length,
    admins: usuarios.filter((u) => u.role === 'admin').length,
  }), [usuarios]);

  const usuariosFiltrados = useMemo(() => {
    return usuarios.filter((u) => {
      if (filtroRole && u.role !== filtroRole) return false;
      if (filtroStatus === 'ativo' && !u.ativo) return false;
      if (filtroStatus === 'inativo' && !u.ativo === false) return false;
      if (search) {
        const q = search.toLowerCase();
        return u.nome.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
      }
      return true;
    });
  }, [usuarios, search, filtroRole, filtroStatus]);

  const abrirNovo = () => {
    setForm({ ...FORM_VAZIO });
    setShowSenha(false);
    setDialogForm({ open: true, editando: null });
  };

  const abrirEditar = (u) => {
    setForm({
      nome: u.nome,
      email: u.email,
      senha: '',
      foto_url: u.foto_url || '',
      role: u.role,
      permissions: { ...PRESETS_PERMISSAO[u.role] || PRESETS_PERMISSAO.tecnico, ...(u.permissions || {}) },
    });
    setShowSenha(false);
    setDialogForm({ open: true, editando: u });
  };

  const fecharForm = () => {
    setDialogForm({ open: false, editando: null });
    setForm(FORM_VAZIO);
  };

  const aplicarPresetRole = (role) => {
    setForm((f) => ({ ...f, role, permissions: { ...PRESETS_PERMISSAO[role] } }));
  };

  const salvarForm = async () => {
    if (!form.nome || !form.email) {
      notify('Nome e e-mail são obrigatórios', 'error'); return;
    }
    if (!dialogForm.editando && (!form.senha || form.senha.length < 6)) {
      notify('A senha deve ter pelo menos 6 caracteres', 'error'); return;
    }

    setSalvando(true);
    try {
      if (dialogForm.editando) {
        await authAPI.atualizarUsuario(dialogForm.editando.id, {
          nome: form.nome,
          email: form.email,
          foto_url: form.foto_url,
          role: form.role,
        });
        await authAPI.atualizarPermissoes(dialogForm.editando.id, {
          permissions: form.permissions,
        });
        notify('Usuário atualizado com sucesso!');
      } else {
        await authAPI.criarUsuario({
          nome: form.nome,
          email: form.email,
          senha: form.senha,
          foto_url: form.foto_url,
          role: form.role,
          permissions: form.permissions,
        });
        notify('Usuário criado com sucesso!');
      }
      fecharForm();
      carregar();
    } catch (e) {
      notify(friendlyError(e), 'error');
    } finally {
      setSalvando(false);
    }
  };

  const toggleAtivo = async (u) => {
    try {
      await authAPI.atualizarPermissoes(u.id, { ativo: !u.ativo });
      notify(u.ativo ? 'Usuário desativado' : 'Usuário ativado');
      carregar();
    } catch (e) { notify(friendlyError(e), 'error'); }
  };

  const abrirResetSenha = (u) => { setNovaSenha(''); setDialogSenha({ open: true, usuario: u }); };
  const fecharResetSenha = () => { setDialogSenha({ open: false, usuario: null }); setNovaSenha(''); };
  const confirmarResetSenha = async () => {
    if (novaSenha.length < 6) { notify('A senha deve ter pelo menos 6 caracteres', 'error'); return; }
    setResetando(true);
    try {
      await authAPI.redefinirSenha(dialogSenha.usuario.id, novaSenha);
      notify('Senha redefinida com sucesso!');
      fecharResetSenha();
    } catch (e) { notify(friendlyError(e), 'error'); }
    finally { setResetando(false); }
  };

  const abrirExcluir = (u) => setDialogExcluir({ open: true, usuario: u });
  const fecharExcluir = () => setDialogExcluir({ open: false, usuario: null });
  const confirmarExcluir = async () => {
    setExcluindo(true);
    try {
      await authAPI.excluirUsuario(dialogExcluir.usuario.id);
      notify('Usuário excluído com sucesso!');
      fecharExcluir();
      carregar();
    } catch (e) { notify(friendlyError(e), 'error'); }
    finally { setExcluindo(false); }
  };

  return (
    <div className="space-y-6">
      <PageHeaderCard
        title="Administração"
        subtitle="Gestão de usuários, papéis e permissões do sistema."
        icon={<FiShield size={20} />}
        titleAdornment={<Badge variant="danger" size="sm">Acesso restrito</Badge>}
        actions={
          <Button variant="primary" icon={<FiUserPlus />} onClick={abrirNovo}>
            Novo Usuário
          </Button>
        }
      />

      {erro && usuarios.length > 0 && <Alert variant="error">{erro}</Alert>}

      {/* Cards de Métricas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatBox icon={<FiUsers />} label="Total" value={stats.total} cor="#1B4D24" />
        <StatBox icon={<FiUserCheck />} label="Ativos" value={stats.ativos} cor="#16A34A" />
        <StatBox icon={<FiUserX />} label="Inativos" value={stats.inativos} cor="#DC2626" />
        <StatBox icon={<FiShield />} label="Admins" value={stats.admins} cor="#7C3AED" />
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
            <div className="sm:col-span-6 relative">
              <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
              <input
                type="text"
                placeholder="Buscar por nome ou e-mail..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white py-2 pl-9 pr-3 text-xs text-slate-800 shadow-xs focus:border-caparao-700 focus:outline-hidden"
              />
            </div>
            <div className="sm:col-span-3">
              <select
                value={filtroRole}
                onChange={(e) => setFiltroRole(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white p-2 text-xs text-slate-800 shadow-xs focus:border-caparao-700 focus:outline-hidden"
              >
                <option value="">Todos os papéis</option>
                {ROLES.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
              </select>
            </div>
            <div className="sm:col-span-3">
              <select
                value={filtroStatus}
                onChange={(e) => setFiltroStatus(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white p-2 text-xs text-slate-800 shadow-xs focus:border-caparao-700 focus:outline-hidden"
              >
                <option value="">Todos os status</option>
                <option value="ativo">Ativos</option>
                <option value="inativo">Inativos</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <div className="space-y-3">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-16 w-full rounded-xl bg-slate-200 animate-pulse" />
          ))}
        </div>
      ) : erro && usuarios.length === 0 ? (
        <Card>
          <CardContent>
            <EmptyState
              icon={<FiWifiOff size={40} />}
              title="Não foi possível carregar os usuários"
              description={erro}
              actionLabel="Tentar novamente"
              onAction={carregar}
            />
          </CardContent>
        </Card>
      ) : usuariosFiltrados.length === 0 ? (
        <Card>
          <CardContent>
            <EmptyState
              icon={<FiUsers size={40} />}
              title="Nenhum usuário encontrado"
              description="Ajuste os filtros ou cadastre um novo usuário."
            />
          </CardContent>
        </Card>
      ) : isMobile ? (
        /* Mobile Cards */
        <div className="space-y-3">
          {usuariosFiltrados.map((u) => {
            const isSelf = u.id === usuarioLogado?.id;
            const permsAtivas = PERMISSION_KEYS.filter((p) => u.permissions?.[p.key]).length;
            return (
              <Card key={u.id}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-2">
                    {u.foto_url ? (
                      <img src={u.foto_url} alt={u.nome} className="h-10 w-10 rounded-full object-cover" />
                    ) : (
                      <div
                        className="flex h-10 w-10 items-center justify-center rounded-full text-xs font-bold text-white"
                        style={{ backgroundColor: corPapel(u.role) }}
                      >
                        {iniciais(u.nome)}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-sm text-slate-900 truncate">{u.nome}</span>
                        {isSelf && <Badge variant="outline" size="sm">você</Badge>}
                      </div>
                      <span className="block text-xs text-slate-500 truncate">{u.email}</span>
                    </div>
                    <Switch
                      checked={u.ativo}
                      disabled={isSelf}
                      onCheckedChange={() => toggleAtivo(u)}
                    />
                  </div>

                  <div className="flex flex-wrap gap-1.5 my-2">
                    <Badge variant="outline" size="sm" style={{ color: corPapel(u.role) }}>
                      {labelPapel(u.role)}
                    </Badge>
                    <Badge variant="outline" size="sm">
                      {u.role === 'admin' ? 'Total' : `${permsAtivas}/${PERMISSION_KEYS.length} permissões`}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between border-t border-slate-100 pt-2 mt-2">
                    <Button variant="ghost" size="sm" icon={<FiEdit2 />} onClick={() => abrirEditar(u)}>
                      Editar
                    </Button>
                    <Button variant="ghost" size="sm" icon={<FiKey />} onClick={() => abrirResetSenha(u)}>
                      Senha
                    </Button>
                    <Button variant="ghost" size="sm" icon={<FiTrash2 />} onClick={() => abrirExcluir(u)} disabled={isSelf} className="text-red-600 hover:text-red-700">
                      Excluir
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        /* Desktop Table */
        <div className="overflow-x-auto rounded-xl border border-slate-200/80 bg-white shadow-xs">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4">Usuário</th>
                <th className="py-3 px-4">E-mail</th>
                <th className="py-3 px-4">Papel</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Permissões</th>
                <th className="py-3 px-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {usuariosFiltrados.map((u) => {
                const isSelf = u.id === usuarioLogado?.id;
                const permsAtivas = PERMISSION_KEYS.filter((p) => u.permissions?.[p.key]).length;
                return (
                  <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        {u.foto_url ? (
                          <img src={u.foto_url} alt={u.nome} className="h-9 w-9 rounded-full object-cover" />
                        ) : (
                          <div
                            className="flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold text-white shrink-0"
                            style={{ backgroundColor: corPapel(u.role) }}
                          >
                            {iniciais(u.nome)}
                          </div>
                        )}
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-slate-900 text-sm">{u.nome}</span>
                            {isSelf && <Badge variant="outline" size="sm">você</Badge>}
                          </div>
                          <span className="text-[11px] text-slate-400">
                            cadastrado em {formatarData(u.criado_em)}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-600">{u.email}</td>
                    <td className="py-3 px-4">
                      <span
                        className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-bold"
                        style={{
                          backgroundColor: `${corPapel(u.role)}18`,
                          color: corPapel(u.role),
                        }}
                      >
                        {u.role === 'admin' && <FiShield size={12} />}
                        {labelPapel(u.role)}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <Tooltip content={u.ativo ? 'Clique para desativar' : 'Clique para ativar'}>
                        <Switch
                          checked={u.ativo}
                          disabled={isSelf}
                          onCheckedChange={() => toggleAtivo(u)}
                        />
                      </Tooltip>
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant="outline" size="sm">
                        {u.role === 'admin' ? 'Total' : `${permsAtivas}/${PERMISSION_KEYS.length}`}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Tooltip content="Editar">
                          <button
                            type="button"
                            onClick={() => abrirEditar(u)}
                            aria-label={`Editar ${u.nome}`}
                            className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-800"
                          >
                            <FiEdit2 size={16} />
                          </button>
                        </Tooltip>
                        <Tooltip content="Redefinir senha">
                          <button
                            type="button"
                            onClick={() => abrirResetSenha(u)}
                            aria-label={`Redefinir senha de ${u.nome}`}
                            className="rounded-lg p-1.5 text-amber-600 hover:bg-amber-50"
                          >
                            <FiKey size={16} />
                          </button>
                        </Tooltip>
                        <Tooltip content={isSelf ? 'Você não pode se excluir' : 'Excluir'}>
                          <button
                            type="button"
                            disabled={isSelf}
                            onClick={() => abrirExcluir(u)}
                            aria-label={`Excluir ${u.nome}`}
                            className="rounded-lg p-1.5 text-red-600 hover:bg-red-50 disabled:opacity-30 disabled:cursor-not-allowed"
                          >
                            <FiTrash2 size={16} />
                          </button>
                        </Tooltip>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Backup e restauração */}
      <BackupCard onRestaurado={carregar} />

      {/* Dialog Criar/Editar */}
      <Dialog
        open={dialogForm.open}
        onOpenChange={(open) => !open && !salvando && fecharForm()}
        title={dialogForm.editando ? 'Editar Usuário' : 'Novo Usuário'}
        className="max-w-xl"
        footer={
          <div className="flex w-full items-center justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={fecharForm} disabled={salvando}>
              Cancelar
            </Button>
            <Button variant="primary" onClick={salvarForm} loading={salvando}>
              {dialogForm.editando ? 'Salvar alterações' : 'Cadastrar usuário'}
            </Button>
          </div>
        }
      >
        <div className="space-y-4 py-1 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Nome completo *</label>
              <input
                type="text"
                autoFocus
                value={form.nome}
                onChange={(e) => setForm((f) => ({ ...f, nome: e.target.value }))}
                className="w-full rounded-lg border border-slate-300 p-2 text-xs text-slate-800 shadow-xs focus:border-caparao-700 focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">E-mail *</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                placeholder="usuario@dominio.com.br"
                className="w-full rounded-lg border border-slate-300 p-2 text-xs text-slate-800 shadow-xs focus:border-caparao-700 focus:outline-hidden"
              />
              {erroEmail(form.email) && <span className="block mt-1 text-red-600">{erroEmail(form.email)}</span>}
            </div>

            {!dialogForm.editando && (
              <div>
                <label className="block font-bold text-slate-700 mb-1">Senha inicial *</label>
                <div className="relative">
                  <input
                    type={showSenha ? 'text' : 'password'}
                    value={form.senha}
                    onChange={(e) => setForm((f) => ({ ...f, senha: e.target.value }))}
                    className="w-full rounded-lg border border-slate-300 p-2 pr-8 text-xs text-slate-800 shadow-xs focus:border-caparao-700 focus:outline-hidden"
                  />
                  <button
                    type="button"
                    onClick={() => setShowSenha((v) => !v)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showSenha ? <FiEyeOff size={14} /> : <FiEye size={14} />}
                  </button>
                </div>
                <span className="block mt-1 text-[11px] text-slate-500">Mínimo 6 caracteres</span>
              </div>
            )}

            <div>
              <label className="block font-bold text-slate-700 mb-1">URL da Foto (opcional)</label>
              <input
                type="url"
                value={form.foto_url}
                onChange={(e) => setForm((f) => ({ ...f, foto_url: e.target.value }))}
                placeholder="https://exemplo.com/foto.jpg"
                className="w-full rounded-lg border border-slate-300 p-2 text-xs text-slate-800 shadow-xs focus:border-caparao-700 focus:outline-hidden"
              />
            </div>
          </div>

          <div className="border-t border-slate-100 pt-3">
            <label className="block font-bold text-slate-700 mb-2">Papel no sistema</label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {ROLES.map((r) => {
                const selecionado = form.role === r.value;
                return (
                  <div
                    key={r.value}
                    onClick={() => aplicarPresetRole(r.value)}
                    className={cn(
                      'cursor-pointer rounded-xl border p-3 transition-all',
                      selecionado ? 'border-caparao-700 bg-caparao-50/50 shadow-xs' : 'border-slate-200 hover:bg-slate-50'
                    )}
                  >
                    <div className="flex items-center gap-1.5 font-bold" style={{ color: r.cor }}>
                      <FiShield size={14} />
                      <span>{r.label}</span>
                    </div>
                    <p className="mt-1 text-[11px] text-slate-500 leading-snug">{r.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {form.role !== 'admin' && (
            <div className="border-t border-slate-100 pt-3">
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-slate-700">Permissões de acesso</span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, permissions: PERMISSION_KEYS.reduce((a, p) => ({ ...a, [p.key]: true }), {}) }))}
                    className="text-[11px] font-semibold text-caparao-700 hover:underline"
                  >
                    Marcar todas
                  </button>
                  <button
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, permissions: PERMISSION_KEYS.reduce((a, p) => ({ ...a, [p.key]: false }), {}) }))}
                    className="text-[11px] font-semibold text-slate-500 hover:underline"
                  >
                    Limpar
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {PERMISSION_KEYS.map((p) => (
                  <label key={p.key} className="flex items-center gap-2 cursor-pointer p-1.5 rounded-lg hover:bg-slate-50">
                    <input
                      type="checkbox"
                      checked={Boolean(form.permissions[p.key])}
                      onChange={(e) => setForm((f) => ({
                        ...f,
                        permissions: { ...f.permissions, [p.key]: e.target.checked },
                      }))}
                      className="h-4 w-4 rounded border-slate-300 text-caparao-700 focus:ring-caparao-700"
                    />
                    <span className="text-xs text-slate-800">{p.label}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {form.role === 'admin' && (
            <Alert variant="info">
              Administradores têm acesso a todas as funcionalidades do sistema.
            </Alert>
          )}
        </div>
      </Dialog>

      {/* Dialog Redefinir Senha */}
      <Dialog
        open={dialogSenha.open}
        onOpenChange={(open) => !open && !resetando && fecharResetSenha()}
        title="Redefinir senha"
        className="max-w-sm"
        footer={
          <div className="flex w-full items-center justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={fecharResetSenha} disabled={resetando}>
              Cancelar
            </Button>
            <Button variant="primary" onClick={confirmarResetSenha} loading={resetando}>
              Redefinir senha
            </Button>
          </div>
        }
      >
        <div className="space-y-3 py-1 text-xs">
          <p className="text-slate-600">
            Defina uma nova senha para <strong>{dialogSenha.usuario?.nome}</strong>.
          </p>
          <div>
            <label className="block font-bold text-slate-700 mb-1">Nova senha</label>
            <div className="relative">
              <input
                type={showSenha ? 'text' : 'password'}
                value={novaSenha}
                onChange={(e) => setNovaSenha(e.target.value)}
                className="w-full rounded-lg border border-slate-300 p-2 pr-8 text-xs text-slate-800 shadow-xs focus:border-caparao-700 focus:outline-hidden"
                autoFocus
              />
              <button
                type="button"
                onClick={() => setShowSenha((v) => !v)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showSenha ? <FiEyeOff size={14} /> : <FiEye size={14} />}
              </button>
            </div>
            <span className="block mt-1 text-[11px] text-slate-500">Mínimo 6 caracteres</span>
          </div>
        </div>
      </Dialog>

      {/* Dialog Excluir */}
      <Dialog
        open={dialogExcluir.open}
        onOpenChange={(open) => !open && !excluindo && fecharExcluir()}
        title="Excluir usuário"
        className="max-w-sm"
        footer={
          <div className="flex w-full items-center justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={fecharExcluir} disabled={excluindo}>
              Cancelar
            </Button>
            <Button variant="danger" onClick={confirmarExcluir} loading={excluindo}>
              Excluir definitivamente
            </Button>
          </div>
        }
      >
        <div className="space-y-3 py-1 text-xs">
          <p className="text-slate-700">
            Tem certeza que deseja excluir <strong>{dialogExcluir.usuario?.nome}</strong> ({dialogExcluir.usuario?.email})?
          </p>
          <Alert variant="warning">
            Esta ação é permanente. O histórico das avaliações já realizadas será preservado.
          </Alert>
        </div>
      </Dialog>
    </div>
  );
}

function StatBox({ icon, label, value, cor }) {
  return (
    <div
      className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs"
      style={{ borderTop: `3px solid ${cor}` }}
    >
      <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 mb-1">
        <span style={{ color: cor }}>{icon}</span>
        <span>{label}</span>
      </div>
      <div className="text-2xl font-black tabular-nums" style={{ color: cor }}>
        {value}
      </div>
    </div>
  );
}
