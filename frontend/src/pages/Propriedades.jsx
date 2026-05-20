import { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, Button, Card, CardContent, Grid, TextField,
  InputAdornment, Dialog, DialogTitle, DialogContent, DialogActions,
  IconButton, Chip, CircularProgress, Alert, Divider, Fab,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  Autocomplete, Tooltip,
  useMediaQuery, useTheme,
} from '@mui/material';
import { FiPlus, FiSearch, FiEdit2, FiTrash2, FiClipboard, FiMap, FiEye, FiX, FiTrendingUp } from 'react-icons/fi';
import { MdOutlineEco } from 'react-icons/md';
import { maskTelefone, maskUF, maskCEP, erroEmail } from '../utils/masks';
import { propriedadesAPI, graosAPI, producaoAPI } from '../services/api';
import { useApp } from '../context/AppContext';
import IGSBadge from '../components/Common/IGSBadge';
import MapPicker from '../components/Common/MapPicker';

const FORM_INICIAL = {
  nome: '', municipio: '', estado: 'ES', proprietario: '',
  area_total: '', area_cafe: '', telefone: '', email: '',
  rua: '', numero: '', complemento: '', bairro: '', cep: '',
  graos: [],
};

// Exibe um card compacto com dados de produção IBGE para um grão
function PreviewProducao({ info }) {
  if (!info) return null;
  if (info.loading) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 0.5, color: 'text.secondary' }}>
        <CircularProgress size={14} />
        <Typography variant="caption">Carregando dados IBGE…</Typography>
      </Box>
    );
  }
  if (info.erro) {
    return (
      <Typography variant="caption" color="text.disabled" sx={{ fontStyle: 'italic' }}>
        {info.erro}
      </Typography>
    );
  }
  const { rendimento_atual, rendimento_uf_atual, cultura } = info.data || {};
  if (!rendimento_atual && !rendimento_uf_atual) {
    return (
      <Typography variant="caption" color="text.disabled" sx={{ fontStyle: 'italic' }}>
        Sem dados IBGE para este município
      </Typography>
    );
  }
  return (
    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mt: 0.5 }}>
      {rendimento_atual && (
        <Tooltip title={`Rendimento médio do município (${rendimento_atual.ano})`}>
          <Chip
            icon={<FiTrendingUp size={12} />}
            label={`Município: ${rendimento_atual.valor.toLocaleString('pt-BR')} kg/ha`}
            size="small"
            color="success"
            variant="outlined"
          />
        </Tooltip>
      )}
      {rendimento_uf_atual && (
        <Tooltip title={`Rendimento médio do estado (${rendimento_uf_atual.ano})`}>
          <Chip
            label={`Estado: ${rendimento_uf_atual.valor.toLocaleString('pt-BR')} kg/ha`}
            size="small"
            variant="outlined"
          />
        </Tooltip>
      )}
    </Box>
  );
}

function FormPropriedade({ dados, onChange, graosDisponiveis, previewProducao }) {
  const [graoInput, setGraoInput] = useState('');
  const f = (field) => (e) => onChange({ ...dados, [field]: e.target.value });

  const handleTelefone = (e) => onChange({ ...dados, telefone: maskTelefone(e.target.value) });
  const handleUF = (e) => onChange({ ...dados, estado: maskUF(e.target.value) });
  const handleCEP = (e) => onChange({ ...dados, cep: maskCEP(e.target.value) });

  const handleMapChange = (lat, lng) => onChange({ ...dados, latitude: lat, longitude: lng });

  // Monta query de geocodificação a partir dos campos preenchidos
  const addressQuery = [dados.rua, dados.numero, dados.bairro, dados.municipio, dados.estado, 'Brasil']
    .filter(Boolean).join(', ');

  const emailErro = erroEmail(dados.email);

  const graosJaSelecionados = new Set((dados.graos || []).map((g) => g.id));

  const adicionarGrao = (grao) => {
    if (!grao || graosJaSelecionados.has(grao.id)) return;
    onChange({ ...dados, graos: [...(dados.graos || []), { id: grao.id, nome: grao.nome, codigo: grao.codigo, ibge_categoria: grao.ibge_categoria, area_plantada: '' }] });
  };

  const removerGrao = (id) => {
    onChange({ ...dados, graos: (dados.graos || []).filter((g) => g.id !== id) });
  };

  const atualizarArea = (id, area) => {
    onChange({ ...dados, graos: (dados.graos || []).map((g) => g.id === id ? { ...g, area_plantada: area } : g) });
  };

  return (
    <Grid container spacing={2} sx={{ pt: 1 }}>
      <Grid size={12}>
        <Typography variant="subtitle2" fontWeight={700} color="primary">Informações Básicas</Typography>
      </Grid>
      <Grid size={12}>
        <TextField autoFocus label="Nome da Propriedade *" fullWidth value={dados.nome} onChange={f('nome')} />
      </Grid>
      <Grid size={6}>
        <TextField label="Município *" fullWidth value={dados.municipio} onChange={f('municipio')} />
      </Grid>
      <Grid size={6}>
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

      <Grid size={12}>
        <Divider sx={{ my: 1 }} />
        <Typography variant="subtitle2" fontWeight={700} color="primary">Endereço Completo</Typography>
      </Grid>
      <Grid size={12}>
        <TextField label="Rua/Via" fullWidth value={dados.rua} onChange={f('rua')} />
      </Grid>
      <Grid size={6}>
        <TextField label="Número" fullWidth value={dados.numero} onChange={f('numero')} />
      </Grid>
      <Grid size={6}>
        <TextField label="Complemento" fullWidth value={dados.complemento} onChange={f('complemento')} placeholder="Apto., casa, lote..." />
      </Grid>
      <Grid size={6}>
        <TextField label="Bairro" fullWidth value={dados.bairro} onChange={f('bairro')} />
      </Grid>
      <Grid size={6}>
        <TextField
          label="CEP"
          fullWidth
          value={dados.cep}
          onChange={handleCEP}
          placeholder="XXXXX-XXX"
          slotProps={{ htmlInput: { inputMode: 'numeric', maxLength: 9 } }}
        />
      </Grid>

      <Grid size={12}>
        <Divider sx={{ my: 1 }} />
        <Typography variant="subtitle2" fontWeight={700} color="primary">Áreas de Cultivo</Typography>
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

      {/* Localização no mapa */}
      <Grid size={12}>
        <Divider sx={{ my: 1 }} />
        <Typography variant="subtitle2" fontWeight={700} color="primary" sx={{ mb: 1.5 }}>
          Localização no Mapa
        </Typography>
        <MapPicker
          lat={dados.latitude}
          lng={dados.longitude}
          onChange={handleMapChange}
          addressQuery={addressQuery}
          height={280}
        />
      </Grid>

      {/* Seleção de grãos cultivados */}
      <Grid size={12}>
        <Divider sx={{ my: 1 }} />
        <Typography variant="subtitle2" fontWeight={700} color="primary" sx={{ mb: 1 }}>
          Grãos Cultivados
        </Typography>
        <Autocomplete
          options={graosDisponiveis.filter((g) => !graosJaSelecionados.has(g.id))}
          getOptionLabel={(g) => `${g.nome} (${g.codigo})`}
          isOptionEqualToValue={(opt, val) => opt.id === val.id}
          value={null}
          inputValue={graoInput}
          onInputChange={(_, v, reason) => { if (reason !== 'reset') setGraoInput(v); }}
          onChange={(_, value) => { adicionarGrao(value); setGraoInput(''); }}
          renderInput={(params) => (
            <TextField {...params} label="Adicionar grão cultivado" placeholder="Digite para buscar um grão..." size="small" />
          )}
          noOptionsText="Nenhum grão encontrado"
          blurOnSelect
        />
      </Grid>

      {/* Lista de grãos selecionados com área e preview IBGE */}
      {(dados.graos || []).length > 0 && (
        <Grid size={12}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            {(dados.graos || []).map((g) => {
              const preview = previewProducao[g.id];
              const temIBGE = !!g.ibge_categoria;
              return (
                <Paper key={g.id} variant="outlined" sx={{ p: 1.5, borderRadius: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: temIBGE ? 1 : 0 }}>
                    <Chip label={g.codigo} size="small" color="primary" variant="outlined" />
                    <Typography variant="body2" fontWeight={600} sx={{ flexGrow: 1 }}>{g.nome}</Typography>
                    <TextField
                      label="Área plantada (ha)"
                      size="small"
                      type="number"
                      value={g.area_plantada || ''}
                      onChange={(e) => atualizarArea(g.id, e.target.value)}
                      slotProps={{ htmlInput: { min: 0, step: '0.01', style: { width: 110 } } }}
                      sx={{ width: 150 }}
                    />
                    <IconButton size="small" onClick={() => removerGrao(g.id)} title="Remover">
                      <FiX size={16} />
                    </IconButton>
                  </Box>
                  {temIBGE && dados.municipio && dados.estado && (
                    <Box sx={{ pl: 0.5 }}>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                        Média IBGE PAM — {dados.municipio}/{dados.estado}:
                      </Typography>
                      <PreviewProducao info={preview} />
                    </Box>
                  )}
                  {!temIBGE && (
                    <Typography variant="caption" color="text.disabled" sx={{ pl: 0.5, fontStyle: 'italic' }}>
                      Dados IBGE não configurados para este grão
                    </Typography>
                  )}
                </Paper>
              );
            })}
          </Box>
        </Grid>
      )}

      <Grid size={12}>
        <Divider sx={{ my: 1 }} />
        <Typography variant="subtitle2" fontWeight={700} color="primary">Contato</Typography>
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
  const [graosDisponiveis, setGraosDisponiveis] = useState([]);
  const [previewProducao, setPreviewProducao] = useState({});
  const debounceRef = useRef(null);

  const carregar = useCallback(() => {
    setLoading(true);
    propriedadesAPI.listar({ search, limit: 50 })
      .then((r) => { setPropriedades(r.data.data); setTotal(r.data.total); })
      .catch((e) => setErro(e.message))
      .finally(() => setLoading(false));
  }, [search]);

  useEffect(() => { carregar(); }, [carregar]);

  useEffect(() => {
    graosAPI.listarAtivos()
      .then((r) => setGraosDisponiveis(r.data))
      .catch(() => {});
  }, []);

  // Busca dados IBGE para cada grão selecionado quando municipio/estado/graos mudam
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
            const msg = e.response?.data?.erro || e.message || 'Sem dados disponíveis';
            setPreviewProducao((prev) => ({ ...prev, [g.id]: { erro: msg } }));
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
    // Busca propriedade completa com grãos
    let graos = [];
    try {
      const r = await propriedadesAPI.buscar(p.id);
      graos = (r.data.graos || []).map((g) => ({
        id: g.id, nome: g.nome, codigo: g.codigo,
        ibge_categoria: g.ibge_categoria, area_plantada: g.area_plantada || '',
      }));
    } catch {}
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

      {isMobile && (
        <Fab color="primary" sx={{ position: 'fixed', bottom: 80, right: 24 }} onClick={abrirNovo}>
          <FiPlus size={24} />
        </Fab>
      )}

      <Dialog open={dialog.open} onClose={fecharDialog} fullWidth maxWidth="sm" fullScreen={isMobile}>
        <DialogTitle fontWeight={700}>
          {dialog.editando ? 'Editar Propriedade' : 'Nova Propriedade'}
        </DialogTitle>
        <DialogContent>
          <FormPropriedade
            dados={form}
            onChange={setForm}
            graosDisponiveis={graosDisponiveis}
            previewProducao={previewProducao}
          />
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
