import { useEffect, useState } from 'react';
import {
  Box, Typography, Button, Card, CardContent, Grid, TextField,
  InputAdornment, Dialog, DialogTitle, DialogContent, DialogActions,
  IconButton, Chip, CircularProgress, Alert, Divider,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  Switch, FormControlLabel, useMediaQuery, useTheme,
} from '@mui/material';
import { FiPlus, FiSearch, FiEdit2, FiTrash2, FiCheck, FiX, FiRefreshCw } from 'react-icons/fi';
import { MdGrain } from 'react-icons/md';
import { axiosInstance } from '../services/api';
import { useApp } from '../context/AppContext';

const FORM_INICIAL = { nome: '', codigo: '', descricao: '', ativo: true };

function FormGrao({ dados, onChange }) {
  const f = (field) => (e) => onChange({ ...dados, [field]: e.target.value });
  const handleAtivo = (e) => onChange({ ...dados, ativo: e.target.checked });

  return (
    <Grid container spacing={2} sx={{ pt: 1 }}>
      <Grid size={12}>
        <TextField autoFocus label="Nome do Grão *" fullWidth value={dados.nome} onChange={f('nome')} />
      </Grid>
      <Grid size={12}>
        <TextField label="Código (Ex: MILHO, SOJA) *" fullWidth value={dados.codigo} onChange={f('codigo')} slotProps={{ htmlInput: { maxLength: 20 } }} />
      </Grid>
      <Grid size={12}>
        <TextField label="Descrição (Nome científico, etc)" fullWidth value={dados.descricao} onChange={f('descricao')} multiline rows={2} />
      </Grid>
      <Grid size={12}>
        <FormControlLabel
          control={<Switch checked={dados.ativo} onChange={handleAtivo} />}
          label="Grão disponível para seleção"
        />
      </Grid>
    </Grid>
  );
}

export default function Graos() {
  const { notify } = useApp();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [graos, setGraos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState('');
  const [search, setSearch] = useState('');
  const [dialog, setDialog] = useState({ open: false, editando: null });
  const [form, setForm] = useState(FORM_INICIAL);
  const [salvando, setSalvando] = useState(false);
  const [excluindo, setExcluindo] = useState(null);
  const [sincronizando, setSincronizando] = useState(false);

  const carregar = async () => {
    setLoading(true);
    setErro('');
    try {
      const res = await axiosInstance.get('/graos/admin/todos');
      setGraos(res.data);
    } catch (e) {
      setErro('Erro ao carregar grãos: ' + (e.response?.data?.erro || e.message));
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
        await axiosInstance.put(`/graos/admin/${dialog.editando.id}/atualizar`, form);
        notify('Grão atualizado!');
      } else {
        await axiosInstance.post('/graos/admin/criar', form);
        notify('Grão criado!');
      }
      fecharDialog();
      carregar();
    } catch (e) {
      notify(e.response?.data?.erro || e.message, 'error');
    } finally {
      setSalvando(false);
    }
  };

  const sincronizarIBGE = async () => {
    setSincronizando(true);
    try {
      const res = await axiosInstance.post('/graos/admin/sincronizar-ibge');
      notify(`${res.data.mensagem} (${res.data.total_ibge} culturas no ES, ${res.data.ignorados} já existiam)`, 'success');
      carregar();
    } catch (e) {
      notify(e.response?.data?.erro || e.message, 'error');
    } finally {
      setSincronizando(false);
    }
  };

  const excluir = async (id) => {
    if (!window.confirm('Excluir este grão? Propriedades que o utilizam não serão afetadas.')) return;
    setExcluindo(id);
    try {
      await axiosInstance.delete(`/graos/admin/${id}/deletar`);
      notify('Grão excluído.');
      carregar();
    } catch (e) {
      notify(e.response?.data?.erro || e.message, 'error');
    } finally {
      setExcluindo(null);
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h5" fontWeight={800} color="primary.dark">Gestão de Grãos</Typography>
          <Typography variant="body2" color="text.secondary">{graos.length} grão(s) cadastrado(s)</Typography>
        </Box>
        {!isMobile && (
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="outlined"
              startIcon={sincronizando ? <CircularProgress size={16} /> : <FiRefreshCw />}
              onClick={sincronizarIBGE}
              disabled={sincronizando}
              title="Importa culturas com produção registrada no Espírito Santo via IBGE PAM"
            >
              {sincronizando ? 'Sincronizando…' : 'Sincronizar com IBGE'}
            </Button>
            <Button variant="contained" startIcon={<FiPlus />} onClick={abrirNovo}>Novo Grão</Button>
          </Box>
        )}
      </Box>

      {erro && <Alert severity="error" sx={{ mb: 2 }}>{erro}</Alert>}

      <TextField
        fullWidth placeholder="Buscar por nome ou código..."
        value={search} onChange={(e) => setSearch(e.target.value)}
        slotProps={{ input: { startAdornment: <InputAdornment position="start"><FiSearch /></InputAdornment> } }}
        sx={{ mb: 2 }}
      />

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', pt: 6 }}><CircularProgress /></Box>
      ) : graosFiltrados.length === 0 ? (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 6 }}>
            <MdGrain size={48} color="#aaa" />
            <Typography variant="h6" color="text.secondary" mt={1}>Nenhum grão encontrado</Typography>
            <Button variant="contained" sx={{ mt: 2 }} onClick={abrirNovo} startIcon={<FiPlus />}>
              Adicionar primeiro grão
            </Button>
          </CardContent>
        </Card>
      ) : isMobile ? (
        <Grid container spacing={2}>
          {graosFiltrados.map((g) => (
            <Grid size={12} key={g.id}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 1 }}>
                    <Box>
                      <Typography variant="subtitle2" fontWeight={700}>{g.nome}</Typography>
                      <Typography variant="caption" color="text.secondary">{g.codigo}</Typography>
                    </Box>
                    <Chip
                      icon={g.ativo ? <FiCheck size={14} /> : <FiX size={14} />}
                      label={g.ativo ? 'Ativo' : 'Inativo'}
                      color={g.ativo ? 'success' : 'default'}
                      size="small"
                    />
                  </Box>
                  {g.descricao && <Typography variant="caption" color="text.secondary" sx={{ display: 'block', my: 1 }}>{g.descricao}</Typography>}
                  <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                    <Button size="small" variant="outlined" startIcon={<FiEdit2 />} onClick={() => abrirEditar(g)} fullWidth>
                      Editar
                    </Button>
                    <Button size="small" variant="outlined" color="error" startIcon={<FiTrash2 />} onClick={() => excluir(g.id)} disabled={excluindo === g.id} fullWidth>
                      {excluindo === g.id ? <CircularProgress size={20} /> : 'Deletar'}
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>Nome</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Código</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Descrição</TableCell>
                <TableCell sx={{ fontWeight: 700, width: 80 }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 700, width: 120 }}>Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {graosFiltrados.map((g) => (
                <TableRow key={g.id} hover>
                  <TableCell>{g.nome}</TableCell>
                  <TableCell><Chip label={g.codigo} size="small" variant="outlined" /></TableCell>
                  <TableCell sx={{ maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {g.descricao || '—'}
                  </TableCell>
                  <TableCell>
                    <Chip
                      icon={g.ativo ? <FiCheck size={14} /> : <FiX size={14} />}
                      label={g.ativo ? 'Ativo' : 'Inativo'}
                      color={g.ativo ? 'success' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                      <IconButton size="small" onClick={() => abrirEditar(g)} title="Editar">
                        <FiEdit2 size={18} />
                      </IconButton>
                      <IconButton size="small" color="error" onClick={() => excluir(g.id)} disabled={excluindo === g.id} title="Deletar">
                        {excluindo === g.id ? <CircularProgress size={18} /> : <FiTrash2 size={18} />}
                      </IconButton>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Dialog de Formulário */}
      <Dialog open={dialog.open} onClose={fecharDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {dialog.editando ? 'Editar Grão' : 'Novo Grão'}
        </DialogTitle>
        <DialogContent dividers>
          <FormGrao dados={form} onChange={setForm} />
        </DialogContent>
        <DialogActions>
          <Button onClick={fecharDialog}>Cancelar</Button>
          <Button
            variant="contained"
            onClick={salvar}
            disabled={salvando || !form.nome || !form.codigo}
          >
            {salvando ? <CircularProgress size={24} /> : dialog.editando ? 'Atualizar' : 'Criar'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
