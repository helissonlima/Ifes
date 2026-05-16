import { useEffect, useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Stack,
  TextField,
  Button,
  Grid,
  FormControlLabel,
  Checkbox,
  Divider,
  Switch,
} from '@mui/material';
import { authAPI } from '../services/api';
import { useApp } from '../context/AppContext';

const PERMISSION_KEYS = [
  { key: 'dashboard', label: 'Dashboard' },
  { key: 'propriedades', label: 'Propriedades' },
  { key: 'avaliacoes', label: 'Nova Avaliacao' },
  { key: 'historico', label: 'Historico' },
  { key: 'metodologia', label: 'Metodologia' },
  { key: 'usuarios', label: 'Gerenciar Usuarios' },
];

function emptyPermissions() {
  return {
    dashboard: true,
    propriedades: true,
    avaliacoes: true,
    historico: true,
    metodologia: true,
    usuarios: false,
  };
}

export default function Usuarios() {
  const { notify } = useApp();
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    nome: '',
    email: '',
    senha: '',
    foto_url: '',
    role: 'tecnico',
    permissions: emptyPermissions(),
  });

  const load = async () => {
    setLoading(true);
    try {
      const r = await authAPI.listarUsuarios();
      setUsuarios(r.data);
    } catch (e) {
      notify(e.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const createUser = async () => {
    try {
      await authAPI.criarUsuario(form);
      notify('Usuario criado com sucesso!', 'success');
      setForm({
        nome: '',
        email: '',
        senha: '',
        foto_url: '',
        role: 'tecnico',
        permissions: emptyPermissions(),
      });
      await load();
    } catch (e) {
      notify(e.message, 'error');
    }
  };

  const togglePermission = async (u, key, checked) => {
    try {
      await authAPI.atualizarPermissoes(u.id, {
        permissions: { [key]: checked },
      });
      notify('Permissao atualizada', 'success');
      await load();
    } catch (e) {
      notify(e.message, 'error');
    }
  };

  const toggleAtivo = async (u, checked) => {
    try {
      await authAPI.atualizarPermissoes(u.id, { ativo: checked });
      notify('Status atualizado', 'success');
      await load();
    } catch (e) {
      notify(e.message, 'error');
    }
  };

  return (
    <Stack spacing={3}>
      <Typography variant="h4" fontWeight={800}>Gestao de Usuarios</Typography>

      <Paper sx={{ p: 2.5, borderRadius: 3 }}>
        <Typography variant="h6" mb={2}>Novo usuario tecnico</Typography>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField label="Nome" value={form.nome} fullWidth onChange={(e) => setForm((f) => ({ ...f, nome: e.target.value }))} />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField label="E-mail" value={form.email} fullWidth onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField label="Senha" type="password" value={form.senha} fullWidth onChange={(e) => setForm((f) => ({ ...f, senha: e.target.value }))} />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField label="URL da Foto" value={form.foto_url} fullWidth onChange={(e) => setForm((f) => ({ ...f, foto_url: e.target.value }))} />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <Typography variant="subtitle2" mb={1}>Permissoes</Typography>
            <Stack direction="row" useFlexGap flexWrap="wrap" spacing={1}>
              {PERMISSION_KEYS.map((p) => (
                <FormControlLabel
                  key={p.key}
                  control={(
                    <Checkbox
                      checked={Boolean(form.permissions[p.key])}
                      onChange={(e) => setForm((f) => ({
                        ...f,
                        permissions: { ...f.permissions, [p.key]: e.target.checked },
                      }))}
                    />
                  )}
                  label={p.label}
                />
              ))}
            </Stack>
          </Grid>
          <Grid size={{ xs: 12 }}>
            <Button variant="contained" onClick={createUser}>Cadastrar usuario</Button>
          </Grid>
        </Grid>
      </Paper>

      <Paper sx={{ p: 2.5, borderRadius: 3 }}>
        <Typography variant="h6" mb={2}>Usuarios cadastrados</Typography>
        {loading ? <Typography>Carregando...</Typography> : (
          <Stack spacing={2}>
            {usuarios.map((u) => (
              <Box key={u.id} sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
                <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems={{ md: 'center' }} justifyContent="space-between">
                  <Box>
                    <Typography fontWeight={700}>{u.nome}</Typography>
                    <Typography variant="body2" color="text.secondary">{u.email} - {u.role}</Typography>
                  </Box>
                  <FormControlLabel
                    control={<Switch checked={Boolean(u.ativo)} onChange={(e) => toggleAtivo(u, e.target.checked)} />}
                    label={u.ativo ? 'Ativo' : 'Inativo'}
                  />
                </Stack>
                <Divider sx={{ my: 1.5 }} />
                <Stack direction="row" useFlexGap flexWrap="wrap" spacing={1}>
                  {PERMISSION_KEYS.map((p) => (
                    <FormControlLabel
                      key={`${u.id}-${p.key}`}
                      control={(
                        <Checkbox
                          checked={Boolean(u.permissions?.[p.key])}
                          onChange={(e) => togglePermission(u, p.key, e.target.checked)}
                          disabled={u.role === 'admin'}
                        />
                      )}
                      label={p.label}
                    />
                  ))}
                </Stack>
              </Box>
            ))}
          </Stack>
        )}
      </Paper>
    </Stack>
  );
}
