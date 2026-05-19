import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Box, Typography, Stepper, Step, StepLabel, StepButton,
  Button, Card, CardContent, Grid, TextField, Autocomplete,
  CircularProgress, Alert, LinearProgress, Paper,
  useMediaQuery, useTheme, MobileStepper,
  Dialog, DialogTitle, DialogContent, DialogActions, Chip, Tooltip,
} from '@mui/material';
import { FiArrowLeft, FiArrowRight, FiCheck, FiSave, FiWifi, FiWifiOff, FiClock, FiTrash2 } from 'react-icons/fi';
import { MdOutlineEco } from 'react-icons/md';
import { propriedadesAPI, avaliacoesAPI, indicadoresAPI } from '../services/api';
import { useApp } from '../context/AppContext';
import DimensaoStep from '../components/Evaluation/DimensaoStep';
import { useNetworkStatus } from '../hooks/useNetworkStatus';
import {
  salvarRascunhoLocal,
  carregarRascunhoLocal,
  limparRascunhoLocal,
  temRascunhoLocal,
  formatarDataRascunho,
} from '../utils/avaliacaoCache';

const DIMENSOES_ORDEM = ['economica', 'ambiental', 'social', 'gestao_qualidade'];

const formatLocalizacao = (propriedade) => {
  const cidade = propriedade?.municipio?.trim?.() || '';
  const uf = propriedade?.estado?.trim?.() || '';
  return [cidade, uf].filter(Boolean).join('/') || 'Localização não informada';
};

const formatAreaCafe = (areaCafe) => {
  if (areaCafe === null || areaCafe === undefined || areaCafe === '') return 'Não informada';
  return `${areaCafe} ha`;
};

const formatPropriedadeOption = (propriedade) =>
  `${propriedade?.nome || 'Propriedade sem nome'} - ${formatLocalizacao(propriedade)}`;

export default function NovaAvaliacao() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { notify, user } = useApp();
  const { isOnline, wasOffline, resetWasOffline } = useNetworkStatus();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isCompactStepper = useMediaQuery(theme.breakpoints.down('lg'));
  const isLargeDesktop = useMediaQuery(theme.breakpoints.up('xl'));

  const [step, setStep] = useState(0); // 0=info, 1-4=dimensões, 5=revisão
  const [propriedades, setPropriedades] = useState([]);
  const [dimensoes, setDimensoes] = useState({});
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [avaliacaoId, setAvaliacaoId] = useState(null);
  const [erro, setErro] = useState('');

  // Cache offline
  const [ultimoSalvoLocal, setUltimoSalvoLocal] = useState(null);
  const [syncPendente, setSyncPendente] = useState(false);
  const [dialogRascunho, setDialogRascunho] = useState({ open: false, draft: null });
  const autoSaveTimer = useRef(null);

  // Dados do formulário
  const [info, setInfo] = useState({
    propriedade: null,
    tecnico: '',
    data: new Date().toISOString().split('T')[0],
    observacoes: '',
  });
  const [respostas, setRespostas] = useState({}); // { [indicadorCodigo]: nota }
  const [respostasDetalhes, setRespostasDetalhes] = useState({}); // { [codigo]: { criterio, nome } }
  const [observacoes, setObservacoes] = useState({}); // { [indicadorCodigo]: texto }

  // ── Carregamento inicial de dados ─────────────────────────────────────────
  useEffect(() => {
    Promise.all([
      propriedadesAPI.listar({ limit: 200 }),
      indicadoresAPI.listar(),
    ]).then(([p, ind]) => {
      setPropriedades(p.data.data);
      setDimensoes(ind.data.dimensoes);

      // Verifica rascunho salvo ANTES de aplicar parâmetros da URL
      const userId = user?.id;
      if (userId && temRascunhoLocal(userId)) {
        const draft = carregarRascunhoLocal(userId);
        // Se vier parâmetro de URL e bater com o rascunho → restaura direto
        const propId = searchParams.get('propriedade');
        if (propId && draft?.info?.propriedade?.id === propId) {
          restaurarRascunho(draft, p.data.data);
        } else {
          setDialogRascunho({ open: true, draft });
        }
        return;
      }

      // Sem rascunho: aplica parâmetros da URL normalmente
      const propId = searchParams.get('propriedade');
      if (propId) {
        const prop = p.data.data.find((x) => x.id === propId);
        if (prop) setInfo((i) => ({ ...i, propriedade: prop }));
      }
    }).catch((e) => setErro(e.message))
    .finally(() => setCarregando(false));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Auto-save no localStorage (debounce 1,5s) ────────────────────────────
  useEffect(() => {
    const userId = user?.id;
    if (!userId) return;

    clearTimeout(autoSaveTimer.current);
    autoSaveTimer.current = setTimeout(() => {
      const estado = {
        step,
        avaliacaoId,
        info,
        respostas,
        respostasDetalhes,
        observacoes,
        syncPendente: true,
      };
      salvarRascunhoLocal(userId, estado);
      setUltimoSalvoLocal(new Date().toISOString());
      setSyncPendente(true);
    }, 1500);

    return () => clearTimeout(autoSaveTimer.current);
  }, [step, avaliacaoId, info, respostas, respostasDetalhes, observacoes, user?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Sincroniza com o servidor ao voltar online ────────────────────────────
  useEffect(() => {
    if (isOnline && wasOffline && syncPendente && info.propriedade) {
      resetWasOffline();
      notify('Conexão restaurada! Sincronizando com o servidor...', 'info');
      salvarRascunhoServidor().then(() => {
        setSyncPendente(false);
      }).catch(() => {
        // falha silenciosa — dados ainda estão no localStorage
      });
    }
  }, [isOnline, wasOffline]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Funções de rascunho ───────────────────────────────────────────────────
  const restaurarRascunho = (draft, listaPropriedades) => {
    if (!draft) return;
    // Reconecta o objeto propriedade à lista atualizada (pode ter mudado no servidor)
    const propAtualizada = listaPropriedades
      ? listaPropriedades.find((p) => p.id === draft.info?.propriedade?.id) ?? draft.info?.propriedade
      : draft.info?.propriedade;

    setInfo({ ...draft.info, propriedade: propAtualizada });
    setRespostas(draft.respostas || {});
    setRespostasDetalhes(draft.respostasDetalhes || {});
    setObservacoes(draft.observacoes || {});
    setStep(draft.step ?? 0);
    setAvaliacaoId(draft.avaliacaoId ?? null);
    setSyncPendente(draft.syncPendente ?? false);
    setUltimoSalvoLocal(draft.timestamp ?? null);
    setDialogRascunho({ open: false, draft: null });
    notify('Rascunho restaurado! Continue de onde parou.', 'success');
  };

  const descartarRascunho = () => {
    limparRascunhoLocal(user?.id);
    setDialogRascunho({ open: false, draft: null });
    // Aplica parâmetro URL se houver
    const propId = searchParams.get('propriedade');
    if (propId && propriedades.length > 0) {
      const prop = propriedades.find((x) => x.id === propId);
      if (prop) setInfo((i) => ({ ...i, propriedade: prop }));
    }
    notify('Rascunho descartado. Nova avaliação iniciada.');
  };

  const limparCacheAposEnvio = () => {
    limparRascunhoLocal(user?.id);
    setSyncPendente(false);
    setUltimoSalvoLocal(null);
  };

  const dimensoesLista = DIMENSOES_ORDEM.map((d) => dimensoes[d]).filter(Boolean);
  const clampProgress = (value) => {
    if (!Number.isFinite(value)) return 0;
    return Math.max(0, Math.min(100, value));
  };

  const handleRespostaChange = (dimensaoCodigo, indicadorCodigo, nota, nomeIndicador, criterio) => {
    setRespostas((r) => ({ ...r, [indicadorCodigo]: nota }));
    setRespostasDetalhes((d) => ({ ...d, [indicadorCodigo]: { dimensao: dimensaoCodigo, nome: nomeIndicador, criterio } }));
  };

  const handleObservacaoChange = (indicadorCodigo, texto) => {
    setObservacoes((o) => ({ ...o, [indicadorCodigo]: texto }));
  };

  // Calcula índices por dimensão
  const calcularIndiceDimensao = (dimCodigo) => {
    if (!dimensoes[dimCodigo]) return null;
    const inds = dimensoes[dimCodigo].indicadores;
    const respondidos = inds.filter((i) => respostas[i.codigo] !== undefined);
    if (respondidos.length === 0) return null;
    return respondidos.reduce((acc, i) => acc + respostas[i.codigo], 0) / respondidos.length;
  };

  const calcularIGS = () => {
    const ie = calcularIndiceDimensao('economica') ?? 0;
    const ia = calcularIndiceDimensao('ambiental') ?? 0;
    const is_ = calcularIndiceDimensao('social') ?? 0;
    const igq = calcularIndiceDimensao('gestao_qualidade') ?? 0;
    return (ie * 0.30) + (ia * 0.35) + (is_ * 0.20) + (igq * 0.15);
  };

  const getClassificacao = (igs) => {
    if (igs <= 0.20) return 'Muito Baixa';
    if (igs <= 0.40) return 'Baixa';
    if (igs <= 0.60) return 'Moderada';
    if (igs <= 0.80) return 'Boa';
    return 'Alta';
  };

  const totalRespondidos = Object.keys(respostas).length;
  const totalIndicadores = Object.values(dimensoes).reduce((acc, d) => acc + (d?.indicadores?.length || 0), 0);

  const salvarRascunhoServidor = async () => {
    if (!info.propriedade) return;
    const respostasArr = montarRespostasArray();
    if (!avaliacaoId) {
      const res = await avaliacoesAPI.criar({
        propriedade_id: info.propriedade.id,
        tecnico_responsavel: info.tecnico,
        data_avaliacao: info.data,
        observacoes: info.observacoes,
        respostas: respostasArr,
      });
      setAvaliacaoId(res.data.id);
    } else {
      await avaliacoesAPI.salvarRespostas(avaliacaoId, { respostas: respostasArr });
    }
  };

  const salvarRascunho = async () => {
    if (!info.propriedade) { notify('Selecione uma propriedade primeiro', 'warning'); return; }
    if (!isOnline) {
      notify('Sem conexão — dados salvos localmente no dispositivo.', 'info');
      return;
    }
    setSalvando(true);
    try {
      await salvarRascunhoServidor();
      setSyncPendente(false);
      notify('Rascunho salvo no servidor!');
    } catch (e) {
      notify('Falha ao salvar no servidor. Dados mantidos localmente.', 'warning');
    } finally {
      setSalvando(false);
    }
  };

  const concluir = async () => {
    if (!info.propriedade) { notify('Selecione uma propriedade', 'error'); return; }
    if (totalRespondidos < totalIndicadores) {
      const faltam = totalIndicadores - totalRespondidos;
      if (!window.confirm(`Ainda faltam ${faltam} indicador(es) para avaliar. Deseja concluir mesmo assim?`)) return;
    }
    if (!isOnline) {
      notify('Sem conexão. Conecte-se à internet para concluir a avaliação. Os dados estão salvos localmente.', 'warning');
      return;
    }
    setSalvando(true);
    try {
      const respostasArr = montarRespostasArray();
      let id = avaliacaoId;
      if (!id) {
        const res = await avaliacoesAPI.criar({
          propriedade_id: info.propriedade.id,
          tecnico_responsavel: info.tecnico,
          data_avaliacao: info.data,
          observacoes: info.observacoes,
        });
        id = res.data.id;
      }
      await avaliacoesAPI.salvarRespostas(id, { respostas: respostasArr, concluir: true });
      limparCacheAposEnvio();
      notify('Avaliação concluída com sucesso!', 'success');
      navigate(`/avaliacao/${id}`);
    } catch (e) { notify(e.message, 'error'); }
    finally { setSalvando(false); }
  };

  const montarRespostasArray = () =>
    Object.entries(respostas).map(([codigo, nota]) => {
      const det = respostasDetalhes[codigo] || {};
      return {
        dimensao: det.dimensao || 'economica',
        indicador_codigo: codigo,
        indicador_nome: det.nome || codigo,
        nota,
        criterio_selecionado: det.criterio || '',
        observacao: observacoes[codigo] || '',
      };
    });

  const progrStep = step === 0 ? (info.propriedade ? 100 : 0)
    : step <= dimensoesLista.length ? (() => {
        const dim = dimensoesLista[step - 1];
        const total_ = dim?.indicadores?.length || 1;
        const resp = dim?.indicadores?.filter((i) => respostas[i.codigo] !== undefined).length || 0;
        return (resp / total_) * 100;
      })()
    : 100;

  if (carregando) return <Box sx={{ display: 'flex', justifyContent: 'center', pt: 8 }}><CircularProgress /></Box>;

  const STEP_LABELS = ['Informações', ...dimensoesLista.map((d) => d.nome), 'Revisão'];
  const STEP_LABELS_STEPPER = STEP_LABELS.map((label) => {
    if (label === 'Informações') return 'Info';
    if (label === 'Gestão e Qualidade') return 'Gestão';
    return label;
  });
  const stepAtualLabel = STEP_LABELS[step] || 'Revisão';
  const progressoGlobal = clampProgress((totalRespondidos / Math.max(totalIndicadores, 1)) * 100);
  const progressoEtapa = clampProgress(progrStep);

  return (
    <Box>
      {/* ── Banner offline ── */}
      {!isOnline && (
        <Alert
          severity="warning"
          icon={<FiWifiOff />}
          sx={{ mb: 1.5, fontWeight: 600, borderRadius: 2 }}
        >
          <strong>Modo offline</strong> — sem conexão com a internet. Seus dados estão sendo
          salvos automaticamente no dispositivo. Ao reconectar, a sincronização ocorrerá automaticamente.
        </Alert>
      )}

      {/* ── Dialog: rascunho encontrado ── */}
      <Dialog open={dialogRascunho.open} maxWidth="xs" fullWidth>
        <DialogTitle fontWeight={700} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <FiClock color="#F57F17" />
          Rascunho encontrado
        </DialogTitle>
        <DialogContent>
          <Alert severity="info" sx={{ mb: 1.5 }}>
            Você tem uma avaliação em andamento salva neste dispositivo.
          </Alert>
          {dialogRascunho.draft && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
              <Typography variant="body2">
                <strong>Propriedade:</strong>{' '}
                {dialogRascunho.draft.info?.propriedade?.nome || 'Não selecionada'}
              </Typography>
              <Typography variant="body2">
                <strong>Indicadores respondidos:</strong>{' '}
                {Object.keys(dialogRascunho.draft.respostas || {}).length}
              </Typography>
              <Typography variant="body2">
                <strong>Último salvamento:</strong>{' '}
                {formatarDataRascunho(dialogRascunho.draft.timestamp)}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button
            startIcon={<FiTrash2 />}
            onClick={descartarRascunho}
            color="error"
          >
            Descartar
          </Button>
          <Button
            variant="contained"
            onClick={() => restaurarRascunho(dialogRascunho.draft, propriedades)}
          >
            Continuar de onde parou
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Cabeçalho ── */}
      <Box sx={{ display: 'flex', alignItems: { xs: 'stretch', sm: 'center' }, gap: 1.5, mb: 2, flexWrap: 'wrap' }}>
        <Button startIcon={<FiArrowLeft />} onClick={() => navigate(-1)} size="small">Voltar</Button>
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="h5" fontWeight={800} color="primary.dark">Nova Avaliação</Typography>
          <Typography variant="body2" color="text.secondary">
            {totalRespondidos}/{totalIndicadores} indicadores avaliados
          </Typography>
        </Box>

        {/* Status de rede + último salvamento */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
          <Tooltip title={isOnline ? 'Conectado ao servidor' : 'Offline — dados salvos localmente'}>
            <Chip
              size="small"
              icon={isOnline ? <FiWifi size={13} /> : <FiWifiOff size={13} />}
              label={isOnline ? (syncPendente ? 'Pendente sync' : 'Online') : 'Offline'}
              color={isOnline ? (syncPendente ? 'warning' : 'success') : 'error'}
              variant="outlined"
            />
          </Tooltip>
          {ultimoSalvoLocal && (
            <Tooltip title={`Salvo localmente em ${formatarDataRascunho(ultimoSalvoLocal)}`}>
              <Chip
                size="small"
                icon={<FiClock size={13} />}
                label="Salvo localmente"
                variant="outlined"
                color="default"
              />
            </Tooltip>
          )}
        </Box>

        <Button
          variant="outlined" startIcon={<FiSave />}
          onClick={salvarRascunho} disabled={salvando || !info.propriedade}
          size="small"
          sx={{ ml: { xs: 0, sm: 'auto' } }}
        >
          {salvando ? <CircularProgress size={16} /> : 'Salvar no servidor'}
        </Button>
      </Box>

      {erro && <Alert severity="error" sx={{ mb: 1.5 }}>{erro}</Alert>}

      {/* Progresso global */}
      <LinearProgress
        variant="determinate"
        value={progressoGlobal}
        sx={{ height: 5, borderRadius: 3, mb: 1.5 }}
        color="primary"
      />

      {/* Stepper */}
      {!isMobile ? (
        <Box sx={{ mb: 2, overflow: 'hidden' }}>
          <Stepper
            nonLinear
            alternativeLabel
            activeStep={step}
            sx={{
              width: '100%',
              '& .MuiStepConnector-alternativeLabel': {
                top: isLargeDesktop ? 16 : isCompactStepper ? 13 : 15,
                left: isLargeDesktop ? 'calc(-50% + 23px)' : isCompactStepper ? 'calc(-50% + 20px)' : 'calc(-50% + 22px)',
                right: isLargeDesktop ? 'calc(50% + 23px)' : isCompactStepper ? 'calc(50% + 20px)' : 'calc(50% + 22px)',
              },
              '& .MuiStepConnector-root': { zIndex: 0 },
              '& .MuiStepLabel-label': {
                fontSize: isLargeDesktop ? '0.94rem' : isCompactStepper ? '0.82rem' : '0.9rem',
                mt: 0.75,
                whiteSpace: 'nowrap',
              },
              '& .MuiStepButton-root': { px: isLargeDesktop ? 1.05 : isCompactStepper ? 0.5 : 0.8 },
              '& .MuiStepConnector-line': { borderTopWidth: 2 },
              '& .MuiStepLabel-iconContainer': {
                zIndex: 1,
                px: 0.5,
              },
              '& .MuiStepIcon-root': {
                fontSize: isLargeDesktop ? '1.95rem' : isCompactStepper ? '1.55rem' : '1.75rem',
                position: 'relative',
                zIndex: 1,
                borderRadius: '50%',
              },
            }}
          >
          {STEP_LABELS_STEPPER.map((label, idx) => (
            <Step key={label} completed={idx < step}>
              <StepButton onClick={() => setStep(idx)}>
                <Typography
                  variant="caption"
                  fontWeight={700}
                  noWrap
                  sx={{ fontSize: isLargeDesktop ? '0.92rem' : isCompactStepper ? '0.78rem' : '0.86rem' }}
                >
                  {label}
                </Typography>
              </StepButton>
            </Step>
          ))}
          </Stepper>
        </Box>
      ) : (
        <MobileStepper
          variant="text"
          steps={STEP_LABELS.length}
          position="static"
          activeStep={step}
          sx={{ mb: 1.5, bgcolor: 'transparent', p: 0 }}
          nextButton={<span />}
          backButton={<span />}
        />
      )}

      {/* Progresso do step atual */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.75 }}>
        <Typography variant="caption" color="text.secondary" fontWeight={600}>
          Etapa {Math.min(step + 1, STEP_LABELS.length)} de {STEP_LABELS.length}: {stepAtualLabel}
        </Typography>
        <Typography variant="caption" color="text.secondary" fontWeight={700}>
          {Math.round(progressoEtapa)}%
        </Typography>
      </Box>
      <LinearProgress
        variant="determinate"
        value={progressoEtapa}
        sx={{ height: 4, borderRadius: 2, mb: 1.5, bgcolor: '#eee', '& .MuiLinearProgress-bar': { bgcolor: step === 0 ? 'primary.main' : dimensoesLista[step - 1]?.cor } }}
      />

      {/* Conteúdo dos steps */}
      {step === 0 && (
        <Card>
          <CardContent sx={{ p: { xs: 2, sm: 2.5 } }}>
            <Typography variant="h6" fontWeight={700} gutterBottom>Informações da Avaliação</Typography>
            <Grid container spacing={1.5}>
              <Grid size={12}>
                <Autocomplete
                  options={propriedades}
                  getOptionLabel={formatPropriedadeOption}
                  value={info.propriedade}
                  onChange={(_, v) => setInfo((i) => ({ ...i, propriedade: v }))}
                  renderInput={(params) => (
                    <TextField {...params} label="Propriedade Rural *" placeholder="Selecione ou busque..." />
                  )}
                  noOptionsText="Nenhuma propriedade encontrada"
                />
                {propriedades.length === 0 && (
                  <Alert severity="warning" sx={{ mt: 1 }}>
                    Nenhuma propriedade cadastrada.{' '}
                    <Button size="small" onClick={() => navigate('/propriedades')}>Cadastrar agora</Button>
                  </Alert>
                )}
              </Grid>
              {info.propriedade && (
                <Grid size={12}>
                  <Paper sx={{ p: 1.25, bgcolor: 'primary.50', borderRadius: 2 }} variant="outlined">
                    <Typography variant="caption" color="text.secondary">
                      Proprietário: {info.propriedade.proprietario || 'Não informado'} · Área café: {formatAreaCafe(info.propriedade.area_cafe)}
                    </Typography>
                  </Paper>
                </Grid>
              )}
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  label="Técnico Responsável"
                  fullWidth value={info.tecnico}
                  onChange={(e) => setInfo((i) => ({ ...i, tecnico: e.target.value }))}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  label="Data da Avaliação"
                  type="date" fullWidth value={info.data}
                  onChange={(e) => setInfo((i) => ({ ...i, data: e.target.value }))}
                  slotProps={{ inputLabel: { shrink: true } }}
                />
              </Grid>
              <Grid size={12}>
                <TextField
                  label="Observações gerais"
                  fullWidth multiline rows={2} value={info.observacoes}
                  onChange={(e) => setInfo((i) => ({ ...i, observacoes: e.target.value }))}
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}

      {step >= 1 && step <= dimensoesLista.length && (
        <DimensaoStep
          dimensao={dimensoesLista[step - 1]}
          respostas={respostas}
          observacoes={observacoes}
          onChange={(codigo, nota, nome, criterio) =>
            handleRespostaChange(dimensoesLista[step - 1].codigo, codigo, nota, nome, criterio)
          }
          onObservacaoChange={handleObservacaoChange}
        />
      )}

      {step === STEP_LABELS.length - 1 && (
        <RevisaoFinal
          info={info}
          dimensoesLista={dimensoesLista}
          respostas={respostas}
          calcularIndiceDimensao={calcularIndiceDimensao}
          calcularIGS={calcularIGS}
          getClassificacao={getClassificacao}
          totalRespondidos={totalRespondidos}
          totalIndicadores={totalIndicadores}
        />
      )}

      {/* Botões de navegação */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2, gap: 1.5 }}>
        <Button
          startIcon={<FiArrowLeft />}
          onClick={() => setStep((s) => s - 1)}
          disabled={step === 0}
          variant="outlined"
          fullWidth={isMobile}
        >
          Anterior
        </Button>

        {step < STEP_LABELS.length - 1 ? (
          <Button
            endIcon={<FiArrowRight />}
            onClick={() => {
              if (step === 0 && !info.propriedade) {
                notify('Selecione uma propriedade', 'warning'); return;
              }
              setStep((s) => s + 1);
            }}
            variant="contained"
            fullWidth={isMobile}
          >
            Próximo
          </Button>
        ) : (
          <Tooltip title={!isOnline ? 'Conecte-se à internet para concluir. Os dados estão salvos localmente.' : ''}>
            <span>
              <Button
                startIcon={<FiCheck />}
                onClick={concluir}
                variant="contained"
                color="success"
                disabled={salvando || !isOnline}
                size="large"
                fullWidth={isMobile}
              >
                {salvando ? <CircularProgress size={20} /> : !isOnline ? 'Aguardando conexão…' : 'Concluir Avaliação'}
              </Button>
            </span>
          </Tooltip>
        )}
      </Box>
    </Box>
  );
}

function RevisaoFinal({ info, dimensoesLista, respostas, calcularIndiceDimensao, calcularIGS, getClassificacao, totalRespondidos, totalIndicadores }) {
  const igs = calcularIGS();
  const classificacao = getClassificacao(igs);
  const COR_CLASS = { 'Muito Baixa': '#f44336', 'Baixa': '#FF9800', 'Moderada': '#FFC107', 'Boa': '#8BC34A', 'Alta': '#4CAF50' };

  return (
    <Box>
      <Card sx={{ mb: 1.5 }}>
        <CardContent sx={{ p: { xs: 2, sm: 2.5 } }}>
          <Typography variant="h6" fontWeight={700} gutterBottom>Resumo da Avaliação</Typography>
          <Grid container spacing={1}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Typography variant="caption" color="text.secondary">Propriedade</Typography>
              <Typography variant="body2" fontWeight={600}>{info.propriedade?.nome || '—'}</Typography>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Typography variant="caption" color="text.secondary">Município/UF</Typography>
              <Typography variant="body2" fontWeight={600}>{formatLocalizacao(info.propriedade)}</Typography>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Typography variant="caption" color="text.secondary">Técnico</Typography>
              <Typography variant="body2">{info.tecnico || 'Não informado'}</Typography>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Typography variant="caption" color="text.secondary">Data</Typography>
              <Typography variant="body2">{new Date(info.data).toLocaleDateString('pt-BR')}</Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* IGS calculado */}
      <Card sx={{ mb: 1.5, border: `2px solid ${COR_CLASS[classificacao]}` }}>
        <CardContent sx={{ textAlign: 'center', p: { xs: 2, sm: 2.5 } }}>
          <MdOutlineEco size={36} color={COR_CLASS[classificacao]} />
          <Typography variant="h4" fontWeight={800} color={COR_CLASS[classificacao]} sx={{ mt: 0.75 }}>
            IGS: {(igs * 100).toFixed(1)}%
          </Typography>
          <Typography variant="h6" fontWeight={700} color={COR_CLASS[classificacao]}>
            {classificacao} Sustentabilidade
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {totalRespondidos}/{totalIndicadores} indicadores avaliados
          </Typography>
        </CardContent>
      </Card>

      {/* Índices por dimensão */}
      <Card>
        <CardContent sx={{ p: { xs: 2, sm: 2.5 } }}>
          <Typography variant="subtitle1" fontWeight={700} gutterBottom>Índices por Dimensão</Typography>
          <Grid container spacing={1.25}>
            {dimensoesLista.map((d) => {
              const idx = calcularIndiceDimensao(d.codigo);
              return (
                <Grid size={{ xs: 12, sm: 6 }} key={d.codigo}>
                  <Box sx={{ p: 1.25, borderRadius: 2, bgcolor: `${d.cor}11`, border: `1px solid ${d.cor}33` }}>
                    <Typography variant="caption" color="text.secondary" fontWeight={600}>{d.nome}</Typography>
                    <Typography variant="h5" fontWeight={800} color={d.cor}>
                      {idx !== null ? `${(idx * 100).toFixed(1)}%` : '—'}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      peso {Math.round(d.peso * 100)}%
                    </Typography>
                  </Box>
                </Grid>
              );
            })}
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
}
