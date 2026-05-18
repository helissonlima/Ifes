import { useEffect, useMemo, useState, useCallback } from 'react';
import { erroEmail } from '../utils/masks';
import {
  Box, Typography, Card, CardContent, Grid, Button, TextField, InputAdornment,
  Select, MenuItem, FormControl, InputLabel, Chip, IconButton, Dialog,
  DialogTitle, DialogContent, DialogActions, FormControlLabel, Checkbox, Switch,
  Avatar, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Tooltip, CircularProgress, Alert, Divider, useMediaQuery, useTheme, Fab,
} from '@mui/material';
import {
  FiUserPlus, FiSearch, FiEdit2, FiTrash2, FiKey, FiShield, FiUsers,
  FiUserCheck, FiUserX, FiEye, FiEyeOff, FiPlus,
} from 'react-icons/fi';
import { authAPI } from '../services/api';
import { useApp } from '../context/AppContext';

const PERMISSION_KEYS = [
  { key: 'dashboard', label: 'Dashboard' },
  { key: 'propriedades', label: 'Propriedades' },
  { key: 'avaliacoes', label: 'Nova Avaliação' },
  { key: 'historico', label: 'Histórico' },
  { key: 'metodologia', label: 'Metodologia' },
];

const ROLES = [
  { value: 'admin', label: 'Administrador', cor: '#1B5E20', desc: 'Acesso total + gerência de usuários' },
  { value: 'tecnico', label: 'Técnico', cor: '#1565C0', desc: 'Cadastra propriedades e realiza avaliações' },
  { value: 'visualizador', label: 'Visualizador', cor: '#6A1B9A', desc: 'Apenas consulta dashboards e históricos' },
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

const corPapel = (role) => ROLES.find((r) => r.value === role)?.cor || '#666';
const labelPapel = (role) => ROLES.find((r) => r.value === role)?.label || role;

const iniciais = (nome = '') =>
  nome.trim().split(/\s+/).slice(0, 2).map((p) => p[0]?.toUpperCase() || '').join('') || '?';

export default function Usuarios() {
  const { notify, user: usuarioLogado } = useApp();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

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
      setErro(e.message);
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
      if (filtroStatus === 'inativo' && u.ativo) return false;
      if (search) {
        const q = search.toLowerCase();
        return u.nome.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
      }
      return true;
    });
  }, [usuarios, search, filtroRole, filtroStatus]);

  // ====== Form (Criar / Editar) ======
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
  const fecharForm = () => { setDialogForm({ open: false, editando: null }); setForm(FORM_VAZIO); };

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
        // Atualiza dados básicos
        await authAPI.atualizarUsuario(dialogForm.editando.id, {
          nome: form.nome,
          email: form.email,
          foto_url: form.foto_url,
          role: form.role,
        });
        // Atualiza permissões (independente de role)
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
      notify(e.message, 'error');
    } finally {
      setSalvando(false);
    }
  };

  // ====== Toggle ativo direto na tabela ======
  const toggleAtivo = async (u) => {
    try {
      await authAPI.atualizarPermissoes(u.id, { ativo: !u.ativo });
      notify(u.ativo ? 'Usuário desativado' : 'Usuário ativado');
      carregar();
    } catch (e) { notify(e.message, 'error'); }
  };

  // ====== Reset senha ======
  const abrirResetSenha = (u) => { setNovaSenha(''); setDialogSenha({ open: true, usuario: u }); };
  const fecharResetSenha = () => { setDialogSenha({ open: false, usuario: null }); setNovaSenha(''); };
  const confirmarResetSenha = async () => {
    if (novaSenha.length < 6) { notify('A senha deve ter pelo menos 6 caracteres', 'error'); return; }
    setResetando(true);
    try {
      await authAPI.redefinirSenha(dialogSenha.usuario.id, novaSenha);
      notify('Senha redefinida com sucesso!');
      fecharResetSenha();
    } catch (e) { notify(e.message, 'error'); }
    finally { setResetando(false); }
  };

  // ====== Excluir ======
  const abrirExcluir = (u) => setDialogExcluir({ open: true, usuario: u });
  const fecharExcluir = () => setDialogExcluir({ open: false, usuario: null });
  const confirmarExcluir = async () => {
    setExcluindo(true);
    try {
      await authAPI.excluirUsuario(dialogExcluir.usuario.id);
      notify('Usuário excluído com sucesso!');
      fecharExcluir();
      carregar();
    } catch (e) { notify(e.message, 'error'); }
    finally { setExcluindo(false); }
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <FiShield size={22} color="#1B5E20" />
            <Typography variant="h5" fontWeight={800} color="primary.dark">Administração</Typography>
            <Chip label="Acesso restrito" size="small" sx={{ bgcolor: '#FFEBEE', color: '#C62828', fontWeight: 700 }} />
          </Box>
          <Typography variant="body2" color="text.secondary">
            Gestão de usuários, papéis e permissões do sistema.
          </Typography>
        </Box>
        {!isMobile && (
          <Button variant="contained" startIcon={<FiUserPlus />} onClick={abrirNovo}>
            Novo Usuário
          </Button>
        )}
      </Box>

      {erro && <Alert severity="error" sx={{ mb: 2 }}>{erro}</Alert>}

      {/* Stats */}
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <StatBox icon={<FiUsers />} label="Total" value={stats.total} cor="#1B5E20" />
        <StatBox icon={<FiUserCheck />} label="Ativos" value={stats.ativos} cor="#2E7D32" />
        <StatBox icon={<FiUserX />} label="Inativos" value={stats.inativos} cor="#C62828" />
        <StatBox icon={<FiShield />} label="Admins" value={stats.admins} cor="#6A1B9A" />
      </Grid>

      {/* Filtros */}
      <Card sx={{ mb: 2 }}>
        <CardContent sx={{ pb: '12px !important' }}>
          <Grid container spacing={1.5} alignItems="center">
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth size="small"
                placeholder="Buscar por nome ou e-mail..."
                value={search} onChange={(e) => setSearch(e.target.value)}
                slotProps={{ input: { startAdornment: <InputAdornment position="start"><FiSearch /></InputAdornment> } }}
              />
            </Grid>
            <Grid size={{ xs: 6, sm: 3 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Papel</InputLabel>
                <Select value={filtroRole} label="Papel" onChange={(e) => setFiltroRole(e.target.value)}>
                  <MenuItem value="">Todos</MenuItem>
                  {ROLES.map((r) => <MenuItem key={r.value} value={r.value}>{r.label}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 6, sm: 3 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Status</InputLabel>
                <Select value={filtroStatus} label="Status" onChange={(e) => setFiltroStatus(e.target.value)}>
                  <MenuItem value="">Todos</MenuItem>
                  <MenuItem value="ativo">Ativos</MenuItem>
                  <MenuItem value="inativo">Inativos</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}><CircularProgress /></Box>
      ) : usuariosFiltrados.length === 0 ? (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 6 }}>
            <FiUsers size={48} color="#aaa" />
            <Typography color="text.secondary" mt={1}>Nenhum usuário encontrado.</Typography>
          </CardContent>
        </Card>
      ) : isMobile ? (
        <Grid container spacing={1.5}>
          {usuariosFiltrados.map((u) => (
            <Grid size={12} key={u.id}>
              <UsuarioCard
                u={u}
                isSelf={u.id === usuarioLogado?.id}
                onEdit={() => abrirEditar(u)}
                onResetSenha={() => abrirResetSenha(u)}
                onExcluir={() => abrirExcluir(u)}
                onToggleAtivo={() => toggleAtivo(u)}
              />
            </Grid>
          ))}
        </Grid>
      ) : (
        <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: 2 }}>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: 'primary.main' }}>
                {['Usuário', 'E-mail', 'Papel', 'Status', 'Permissões', 'Ações'].map((h) => (
                  <TableCell key={h} sx={{ color: '#fff', fontWeight: 700 }}>{h}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {usuariosFiltrados.map((u, i) => {
                const isSelf = u.id === usuarioLogado?.id;
                const permsAtivas = PERMISSION_KEYS.filter((p) => u.permissions?.[p.key]).length;
                return (
                  <TableRow key={u.id} sx={{ bgcolor: i % 2 === 0 ? 'inherit' : 'action.hover', '&:hover': { bgcolor: 'primary.50' } }}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Avatar src={u.foto_url || undefined} sx={{ bgcolor: corPapel(u.role), width: 38, height: 38 }}>
                          {iniciais(u.nome)}
                        </Avatar>
                        <Box>
                          <Typography variant="body2" fontWeight={700}>
                            {u.nome}
                            {isSelf && <Chip label="você" size="small" sx={{ ml: 1, height: 18, fontSize: '0.65rem' }} />}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            cadastrado em {new Date(u.criado_em).toLocaleDateString('pt-BR')}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell><Typography variant="body2">{u.email}</Typography></TableCell>
                    <TableCell>
                      <Chip
                        icon={u.role === 'admin' ? <FiShield size={12} /> : undefined}
                        label={labelPapel(u.role)} size="small"
                        sx={{ bgcolor: corPapel(u.role) + '22', color: corPapel(u.role), fontWeight: 700 }}
                      />
                    </TableCell>
                    <TableCell>
                      <Tooltip title={u.ativo ? 'Clique para desativar' : 'Clique para ativar'}>
                        <span>
                          <Switch
                            checked={u.ativo} size="small"
                            disabled={isSelf}
                            onChange={() => toggleAtivo(u)}
                          />
                        </span>
                      </Tooltip>
                    </TableCell>
                    <TableCell>
                      <Chip label={`${u.role === 'admin' ? 'Total' : `${permsAtivas}/${PERMISSION_KEYS.length}`}`} size="small" variant="outlined" />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 0.5 }}>
                        <Tooltip title="Editar">
                          <IconButton size="small" onClick={() => abrirEditar(u)}>
                            <FiEdit2 size={16} />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Redefinir senha">
                          <IconButton size="small" color="warning" onClick={() => abrirResetSenha(u)}>
                            <FiKey size={16} />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title={isSelf ? 'Você não pode se excluir' : 'Excluir'}>
                          <span>
                            <IconButton size="small" color="error" disabled={isSelf} onClick={() => abrirExcluir(u)}>
                              <FiTrash2 size={16} />
                            </IconButton>
                          </span>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* FAB mobile */}
      {isMobile && (
        <Fab color="primary" sx={{ position: 'fixed', bottom: 80, right: 24 }} onClick={abrirNovo}>
          <FiPlus size={24} />
        </Fab>
      )}

      {/* ========= Dialog Criar/Editar ========= */}
      <Dialog open={dialogForm.open} onClose={fecharForm} fullWidth maxWidth="md" fullScreen={isMobile}>
        <DialogTitle fontWeight={700}>
          {dialogForm.editando ? 'Editar Usuário' : 'Novo Usuário'}
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField label="Nome completo *" fullWidth value={form.nome}
                onChange={(e) => setForm((f) => ({ ...f, nome: e.target.value }))} />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                label="E-mail *"
                type="email"
                fullWidth
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                placeholder="usuario@dominio.com.br"
                error={!!erroEmail(form.email)}
                helperText={erroEmail(form.email) || 'Ex.: tecnico@empresa.com.br'}
                slotProps={{ htmlInput: { inputMode: 'email' } }}
              />
            </Grid>
            {!dialogForm.editando && (
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  label="Senha inicial *"
                  type={showSenha ? 'text' : 'password'} fullWidth value={form.senha}
                  onChange={(e) => setForm((f) => ({ ...f, senha: e.target.value }))}
                  error={form.senha.length > 0 && form.senha.length < 6}
                  helperText={
                    form.senha.length > 0 && form.senha.length < 6
                      ? `Muito curta: ${form.senha.length}/6 caracteres mínimos`
                      : 'Mínimo 6 caracteres. O usuário pode alterar depois.'
                  }
                  slotProps={{
                    input: {
                      endAdornment: (
                        <IconButton size="small" onClick={() => setShowSenha((v) => !v)}>
                          {showSenha ? <FiEyeOff /> : <FiEye />}
                        </IconButton>
                      ),
                    },
                  }}
                />
              </Grid>
            )}
            <Grid size={{ xs: 12, md: dialogForm.editando ? 6 : 6 }}>
              <TextField
                label="URL da Foto (opcional)"
                fullWidth
                value={form.foto_url}
                onChange={(e) => setForm((f) => ({ ...f, foto_url: e.target.value }))}
                placeholder="https://exemplo.com/foto.jpg"
                error={!!form.foto_url && !/^https?:\/\/.+/.test(form.foto_url)}
                helperText={
                  form.foto_url && !/^https?:\/\/.+/.test(form.foto_url)
                    ? 'URL inválida. Deve começar com http:// ou https://'
                    : 'URL pública de imagem (opcional)'
                }
                slotProps={{ htmlInput: { inputMode: 'url' } }}
              />
            </Grid>

            <Grid size={12}>
              <Divider sx={{ my: 1 }} />
              <Typography variant="subtitle2" fontWeight={700} gutterBottom>Papel no sistema</Typography>
              <Grid container spacing={1}>
                {ROLES.map((r) => {
                  const selecionado = form.role === r.value;
                  return (
                    <Grid size={{ xs: 12, sm: 4 }} key={r.value}>
                      <Paper
                        variant="outlined"
                        sx={{
                          p: 1.25, cursor: 'pointer',
                          borderColor: selecionado ? r.cor : undefined,
                          borderWidth: selecionado ? 2 : 1,
                          bgcolor: selecionado ? r.cor + '11' : 'transparent',
                        }}
                        onClick={() => aplicarPresetRole(r.value)}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <FiShield color={r.cor} />
                          <Typography variant="subtitle2" fontWeight={700} color={r.cor}>{r.label}</Typography>
                        </Box>
                        <Typography variant="caption" color="text.secondary">{r.desc}</Typography>
                      </Paper>
                    </Grid>
                  );
                })}
              </Grid>
            </Grid>

            {form.role !== 'admin' && (
              <Grid size={12}>
                <Divider sx={{ my: 1 }} />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
                  <Typography variant="subtitle2" fontWeight={700}>Permissões de acesso</Typography>
                  <Box sx={{ display: 'flex', gap: 0.5 }}>
                    <Button size="small" onClick={() => setForm((f) => ({ ...f, permissions: PERMISSION_KEYS.reduce((a, p) => ({ ...a, [p.key]: true }), {}) }))}>
                      Marcar todas
                    </Button>
                    <Button size="small" onClick={() => setForm((f) => ({ ...f, permissions: PERMISSION_KEYS.reduce((a, p) => ({ ...a, [p.key]: false }), {}) }))}>
                      Limpar
                    </Button>
                  </Box>
                </Box>
                <Grid container spacing={1} sx={{ mt: 0.5 }}>
                  {PERMISSION_KEYS.map((p) => (
                    <Grid size={{ xs: 12, sm: 6 }} key={p.key}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={Boolean(form.permissions[p.key])}
                            onChange={(e) => setForm((f) => ({
                              ...f,
                              permissions: { ...f.permissions, [p.key]: e.target.checked },
                            }))}
                          />
                        }
                        label={p.label}
                      />
                    </Grid>
                  ))}
                </Grid>
              </Grid>
            )}

            {form.role === 'admin' && (
              <Grid size={12}>
                <Alert severity="info">
                  Administradores têm acesso a todas as funcionalidades, incluindo a gestão de usuários.
                </Alert>
              </Grid>
            )}
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button onClick={fecharForm} disabled={salvando}>Cancelar</Button>
          <Button variant="contained" onClick={salvarForm} disabled={salvando}>
            {salvando ? <CircularProgress size={20} /> : (dialogForm.editando ? 'Salvar alterações' : 'Cadastrar usuário')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ========= Dialog Redefinir Senha ========= */}
      <Dialog open={dialogSenha.open} onClose={fecharResetSenha} fullWidth maxWidth="xs">
        <DialogTitle fontWeight={700}>Redefinir senha</DialogTitle>
        <DialogContent dividers>
          <Typography variant="body2" sx={{ mb: 2 }} color="text.secondary">
            Defina uma nova senha para <strong>{dialogSenha.usuario?.nome}</strong>.
            O usuário deve alterá-la no primeiro acesso.
          </Typography>
          <TextField
            autoFocus fullWidth label="Nova senha"
            type={showSenha ? 'text' : 'password'}
            value={novaSenha} onChange={(e) => setNovaSenha(e.target.value)}
            error={novaSenha.length > 0 && novaSenha.length < 6}
            helperText={
              novaSenha.length > 0 && novaSenha.length < 6
                ? `Muito curta: ${novaSenha.length}/6 caracteres mínimos`
                : 'Mínimo 6 caracteres.'
            }
            slotProps={{
              input: {
                endAdornment: (
                  <IconButton size="small" onClick={() => setShowSenha((v) => !v)}>
                    {showSenha ? <FiEyeOff /> : <FiEye />}
                  </IconButton>
                ),
              },
            }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button onClick={fecharResetSenha} disabled={resetando}>Cancelar</Button>
          <Button variant="contained" color="warning" onClick={confirmarResetSenha} disabled={resetando}>
            {resetando ? <CircularProgress size={20} /> : 'Redefinir senha'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ========= Dialog Excluir ========= */}
      <Dialog open={dialogExcluir.open} onClose={fecharExcluir} fullWidth maxWidth="xs">
        <DialogTitle fontWeight={700} color="error">Excluir usuário</DialogTitle>
        <DialogContent dividers>
          <Typography variant="body2">
            Tem certeza que deseja excluir <strong>{dialogExcluir.usuario?.nome}</strong> ({dialogExcluir.usuario?.email})?
          </Typography>
          <Alert severity="warning" sx={{ mt: 2 }}>
            Esta ação é permanente. O histórico das avaliações já realizadas será preservado,
            mas o usuário perderá o acesso ao sistema.
          </Alert>
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button onClick={fecharExcluir} disabled={excluindo}>Cancelar</Button>
          <Button variant="contained" color="error" onClick={confirmarExcluir} disabled={excluindo}>
            {excluindo ? <CircularProgress size={20} /> : 'Excluir definitivamente'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

function StatBox({ icon, label, value, cor }) {
  return (
    <Grid size={{ xs: 6, md: 3 }}>
      <Paper variant="outlined" sx={{ p: 1.5, borderLeft: `4px solid ${cor}` }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{ color: cor }}>{icon}</Box>
          <Typography variant="caption" color="text.secondary" fontWeight={600}>{label}</Typography>
        </Box>
        <Typography variant="h4" fontWeight={900} color={cor}>{value}</Typography>
      </Paper>
    </Grid>
  );
}

function UsuarioCard({ u, isSelf, onEdit, onResetSenha, onExcluir, onToggleAtivo }) {
  const permsAtivas = PERMISSION_KEYS.filter((p) => u.permissions?.[p.key]).length;
  return (
    <Card>
      <CardContent sx={{ pb: '12px !important' }}>
        <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center', mb: 1 }}>
          <Avatar src={u.foto_url || undefined} sx={{ bgcolor: corPapel(u.role), width: 44, height: 44 }}>
            {iniciais(u.nome)}
          </Avatar>
          <Box sx={{ flexGrow: 1, minWidth: 0 }}>
            <Typography variant="subtitle1" fontWeight={700} noWrap>
              {u.nome}
              {isSelf && <Chip label="você" size="small" sx={{ ml: 1, height: 18, fontSize: '0.65rem' }} />}
            </Typography>
            <Typography variant="caption" color="text.secondary" noWrap display="block">{u.email}</Typography>
          </Box>
          <Switch checked={u.ativo} size="small" disabled={isSelf} onChange={onToggleAtivo} />
        </Box>
        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mb: 1 }}>
          <Chip
            icon={u.role === 'admin' ? <FiShield size={12} /> : undefined}
            label={labelPapel(u.role)} size="small"
            sx={{ bgcolor: corPapel(u.role) + '22', color: corPapel(u.role), fontWeight: 700 }}
          />
          <Chip label={u.role === 'admin' ? 'Acesso total' : `${permsAtivas}/${PERMISSION_KEYS.length} permissões`} size="small" variant="outlined" />
          <Chip label={u.ativo ? 'Ativo' : 'Inativo'} size="small"
            color={u.ativo ? 'success' : 'default'} variant="outlined" />
        </Box>
        <Divider sx={{ my: 1 }} />
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          <Button size="small" startIcon={<FiEdit2 />} onClick={onEdit}>Editar</Button>
          <Button size="small" color="warning" startIcon={<FiKey />} onClick={onResetSenha}>Senha</Button>
          <Button size="small" color="error" startIcon={<FiTrash2 />} onClick={onExcluir} disabled={isSelf}>Excluir</Button>
        </Box>
      </CardContent>
    </Card>
  );
}
