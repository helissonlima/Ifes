import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, Button, Card, CardContent, Grid, TextField,
  InputAdornment, Dialog, DialogTitle, DialogContent, DialogActions,
  IconButton, Chip, CircularProgress, Alert, Divider, Fab,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  useMediaQuery, useTheme,
} from '@mui/material';
import { FiPlus, FiSearch, FiEdit2, FiTrash2, FiClipboard, FiMap, FiEye } from 'react-icons/fi';
import { MdOutlineEco } from 'react-icons/md';
import { maskTelefone, maskUF, erroEmail } from '../utils/masks';
import { propriedadesAPI } from '../services/api';
import { useApp } from '../context/AppContext';
import IGSBadge from '../components/Common/IGSBadge';

const FORM_INICIAL = {
  nome: '', municipio: '', estado: 'ES', proprietario: '',
  area_total: '', area_cafe: '', telefone: '', email: '',
};

function FormPropriedade({ dados, onChange, autoFocus }) {
  const f = (field) => (e) => onChange({ ...dados, [field]: e.target.value });

  const handleTelefone = (e) => {
    onChange({ ...dados, telefone: maskTelefone(e.target.value) });
  };

  const handleUF = (e) => {
    onChange({ ...dados, estado: maskUF(e.target.value) });
  };

  const emailErro = erroEmail(dados.email);

  return (
    <Grid container spacing={2} sx={{ pt: 1 }}>
      <Grid size={12}>
        <TextField autoFocus={autoFocus} label="Nome da Propriedade *" fullWidth value={dados.nome} onChange={f('nome')} />
      </Grid>
      <Grid size={8}>
        <TextField label="Município *" fullWidth value={dados.municipio} onChange={f('municipio')} />
      </Grid>
      <Grid size={4}>
        <TextField
          label="UF"
          fullWidth
          value={dados.estado}
          onChange={handleUF}
          slotProps={{ htmlInput: { maxLength: 2 } }}
          helperText="Ex.: ES, MG"
        />
      </Grid>
      <Grid size={12}>
        <TextField label="Nome do Proprietário *" fullWidth value={dados.proprietario} onChange={f('proprietario')} />
      </Grid>
      <Grid size={6}>
        <TextField
          label="Área Total (ha)"
          fullWidth
          value={dados.area_total}
          onChange={f('area_total')}
          slotProps={{ htmlInput: { inputMode: 'decimal', min: 0, step: '0.01' } }}
          type="number"
        />
      </Grid>
      <Grid size={6}>
        <TextField
          label="Área de Café (ha)"
          fullWidth
          value={dados.area_cafe}
          onChange={f('area_cafe')}
          slotProps={{ htmlInput: { inputMode: 'decimal', min: 0, step: '0.01' } }}
          type="number"
        />
      </Grid>
      <Grid size={6}>
        <TextField
          label="Telefone"
          fullWidth
          value={dados.telefone}
          onChange={handleTelefone}
          placeholder="(XX) XXXXX-XXXX"
          slotProps={{ htmlInput: { inputMode: 'tel', maxLength: 15 } }}
          helperText="DDD + número (celular ou fixo)"
        />
      </Grid>
      <Grid size={6}>
        <TextField
          label="E-mail"
          fullWidth
          value={dados.email}
          onChange={f('email')}
          type="email"
          placeholder="nome@dominio.com.br"
          error={!!emailErro}
          helperText={emailErro || 'Ex.: produtor@email.com.br'}
          slotProps={{ htmlInput: { inputMode: 'email' } }}
        />
      </Grid>
    </Grid>
  );
}

export default function Propriedades() {
  const navigate = useNavigate();
  const { notify } = useApp();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [propriedades, setPropriedades] = useState([]);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState('');
  const [dialog, setDialog] = useState({ open: false, editando: null });
  const [form, setForm] = useState(FORM_INICIAL);
  const [salvando, setSalvando] = useState(false);
  const [excluindo, setExcluindo] = useState(null);

  const carregar = useCallback(() => {
    setLoading(true);
    propriedadesAPI.listar({ search, limit: 50 })
      .then((r) => { setPropriedades(r.data.data); setTotal(r.data.total); })
      .catch((e) => setErro(e.message))
      .finally(() => setLoading(false));
  }, [search]);

  useEffect(() => { carregar(); }, [carregar]);

  const abrirNovo = () => { setForm(FORM_INICIAL); setDialog({ open: true, editando: null }); };
  const abrirEditar = (p) => { setForm({ ...p, area_total: p.area_total || '', area_cafe: p.area_cafe || '' }); setDialog({ open: true, editando: p }); };
  const fecharDialog = () => setDialog({ open: false, editando: null });

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
    } catch (e) { notify(e.message, 'error'); }
    finally { setSalvando(false); }
  };

  const excluir = async (id) => {
    if (!window.confirm('Excluir esta propriedade e todas as avaliações vinculadas?')) return;
    setExcluindo(id);
    try {
      await propriedadesAPI.excluir(id);
      notify('Propriedade excluída.');
      carregar();
    } catch (e) { notify(e.message, 'error'); }
    finally { setExcluindo(null); }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h5" fontWeight={800} color="primary.dark">Propriedades</Typography>
          <Typography variant="body2" color="text.secondary">{total} propriedade(s) cadastrada(s)</Typography>
        </Box>
        {!isMobile && (
          <Button variant="contained" startIcon={<FiPlus />} onClick={abrirNovo}>Nova Propriedade</Button>
        )}
      </Box>

      {erro && <Alert severity="error" sx={{ mb: 2 }}>{erro}</Alert>}

      <TextField
        fullWidth placeholder="Buscar por nome, município ou proprietário..."
        value={search} onChange={(e) => setSearch(e.target.value)}
        slotProps={{ input: { startAdornment: <InputAdornment position="start"><FiSearch /></InputAdornment> } }}
        sx={{ mb: 2 }}
      />

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', pt: 6 }}><CircularProgress /></Box>
      ) : propriedades.length === 0 ? (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 6 }}>
            <FiMap size={48} color="#aaa" />
            <Typography variant="h6" color="text.secondary" mt={1}>Nenhuma propriedade encontrada</Typography>
            <Button variant="contained" sx={{ mt: 2 }} onClick={abrirNovo} startIcon={<FiPlus />}>
              Cadastrar primeira propriedade
            </Button>
          </CardContent>
        </Card>
      ) : isMobile ? (
        // Cards para mobile
        <Grid container spacing={2}>
          {propriedades.map((p) => (
            <Grid size={12} key={p.id}>
              <Card sx={{ cursor: 'pointer', '&:hover': { boxShadow: 4 } }} onClick={() => navigate(`/propriedades/${p.id}`)}>
                <CardContent sx={{ pb: '12px !important' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="subtitle1" fontWeight={700}>{p.nome}</Typography>
                      <Typography variant="caption" color="text.secondary">{p.municipio}/{p.estado} · {p.proprietario}</Typography>
                    </Box>
                    {p.ultima_classificacao && (
                      <IGSBadge classificacao={p.ultima_classificacao} igs={p.ultimo_igs} size="small" />
                    )}
                  </Box>
                  <Box sx={{ display: 'flex', gap: 1, mt: 1, flexWrap: 'wrap' }}>
                    {p.area_cafe && <Chip label={`${p.area_cafe} ha café`} size="small" variant="outlined" />}
                    <Chip label={`${p.total_avaliacoes} avaliação(ões)`} size="small" color="primary" variant="outlined" />
                  </Box>
                  <Divider sx={{ my: 1 }} />
                  <Box sx={{ display: 'flex', gap: 1 }} onClick={(e) => e.stopPropagation()}>
                    <Button size="small" startIcon={<FiEye />} onClick={() => navigate(`/propriedades/${p.id}`)}>
                      Detalhes
                    </Button>
                    <Button size="small" startIcon={<FiClipboard />} onClick={() => navigate(`/avaliacao/nova?propriedade=${p.id}`)}>
                      Avaliar
                    </Button>
                    <IconButton size="small" onClick={() => abrirEditar(p)}><FiEdit2 size={16} /></IconButton>
                    <IconButton size="small" color="error" onClick={() => excluir(p.id)} disabled={excluindo === p.id}>
                      <FiTrash2 size={16} />
                    </IconButton>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : (
        // Tabela para desktop
        <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: 2 }}>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: 'primary.main' }}>
                {['Propriedade', 'Município/UF', 'Proprietário', 'Área Café', 'Avaliações', 'Último IGS', 'Ações'].map((h) => (
                  <TableCell key={h} sx={{ color: 'white', fontWeight: 700 }}>{h}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {propriedades.map((p, i) => (
                <TableRow
                  key={p.id}
                  sx={{ cursor: 'pointer', bgcolor: i % 2 === 0 ? 'inherit' : 'action.hover', '&:hover': { bgcolor: 'primary.50' } }}
                  onClick={() => navigate(`/propriedades/${p.id}`)}
                >
                  <TableCell>
                    <Typography variant="body2" fontWeight={600}>{p.nome}</Typography>
                  </TableCell>
                  <TableCell><Typography variant="body2">{p.municipio}/{p.estado}</Typography></TableCell>
                  <TableCell><Typography variant="body2">{p.proprietario}</Typography></TableCell>
                  <TableCell><Typography variant="body2">{p.area_cafe ? `${p.area_cafe} ha` : '—'}</Typography></TableCell>
                  <TableCell><Chip label={p.total_avaliacoes} size="small" color="primary" variant="outlined" /></TableCell>
                  <TableCell>
                    {p.ultima_classificacao ? (
                      <IGSBadge classificacao={p.ultima_classificacao} igs={p.ultimo_igs} size="small" />
                    ) : <Typography variant="caption" color="text.disabled">—</Typography>}
                  </TableCell>
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                      <IconButton size="small" color="primary" title="Ver detalhe / histórico"
                        onClick={() => navigate(`/propriedades/${p.id}`)}>
                        <FiEye size={16} />
                      </IconButton>
                      <IconButton size="small" color="primary" title="Nova Avaliação"
                        onClick={() => navigate(`/avaliacao/nova?propriedade=${p.id}`)}>
                        <FiClipboard size={16} />
                      </IconButton>
                      <IconButton size="small" onClick={() => abrirEditar(p)} title="Editar">
                        <FiEdit2 size={16} />
                      </IconButton>
                      <IconButton size="small" color="error" onClick={() => excluir(p.id)}
                        disabled={excluindo === p.id} title="Excluir">
                        {excluindo === p.id ? <CircularProgress size={14} /> : <FiTrash2 size={16} />}
                      </IconButton>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
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

      {/* Dialog de cadastro/edição */}
      <Dialog open={dialog.open} onClose={fecharDialog} fullWidth maxWidth="sm" fullScreen={isMobile}>
        <DialogTitle fontWeight={700}>
          {dialog.editando ? 'Editar Propriedade' : 'Nova Propriedade'}
        </DialogTitle>
        <DialogContent>
          <FormPropriedade dados={form} onChange={setForm} autoFocus />
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button onClick={fecharDialog} disabled={salvando}>Cancelar</Button>
          <Button variant="contained" onClick={salvar} disabled={salvando}>
            {salvando ? <CircularProgress size={20} /> : (dialog.editando ? 'Salvar' : 'Cadastrar')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
