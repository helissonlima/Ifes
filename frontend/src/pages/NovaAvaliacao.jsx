import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Box, Typography, Stepper, Step, StepButton,
  Button, Card, CardContent, Grid, TextField, Autocomplete,
  CircularProgress, Alert, LinearProgress, Paper, Skeleton,
  useMediaQuery, useTheme,
  Dialog, DialogTitle, DialogContent, DialogActions, Tooltip,
} from '@mui/material';
import { FiArrowLeft, FiArrowRight, FiCheck, FiSave, FiWifiOff, FiClock, FiTrash2, FiHelpCircle, FiX } from 'react-icons/fi';
import { MdOutlineEco } from 'react-icons/md';
import { propriedadesAPI, avaliacoesAPI, indicadoresAPI } from '../services/api';
import { useApp } from '../context/AppContext';
import DimensaoStep from '../components/Evaluation/DimensaoStep';
import PageHeaderCard from '../components/Common/PageHeaderCard';
import { useNetworkStatus } from '../hooks/useNetworkStatus';
import { useEvaluationKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';
import {
  salvarRascunhoLocal,
  carregarRascunhoLocal,
  limparRascunhoLocal,
  atualizarSyncPendenteLocal,
  temRascunhoLocal,
  formatarDataRascunho,
} from '../utils/avaliacaoCache';
import { friendlyError } from '../utils/errorMessages';
import ConfirmDialog from '../components/Common/ConfirmDialog';
import { useMetodologia, calcularIndiceDimensao as calcularIndiceDimensaoUtil, calcularIGS as calcularIGSUtil, getClassificacao as getClassificacaoUtil } from '../utils/metodologia';
import { COR_CLASSIFICACAO } from '../utils/coresICSR';
import { formatarData } from '../utils/formatarData';

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
  const { metodologia } = useMetodologia();
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
  const [confirmConcluirPendente, setConfirmConcluirPendente] = useState(false);

  // Cache offline
  const [ultimoSalvoLocal, setUltimoSalvoLocal] = useState(null);
  const [syncPendente, setSyncPendente] = useState(false);
  const [dialogRascunho, setDialogRascunho] = useState({ open: false, draft: null });
  const autoSaveTimer = useRef(null);
  const sincronizandoAutoRef = useRef(false);

  // ── Tutorial campo a campo ────────────────────────────────────────────────
  const [tutorialAtivo, setTutorialAtivo] = useState(false);
  const [passoTutorial, setPassoTutorial] = useState(0);
  const refCabecalho = useRef(null);
  const refProgressoCard = useRef(null);
  const refConteudoStep = useRef(null);
  const refNavegacao = useRef(null);

  const abrirDialogRascunho = useCallback((draft) => {
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
    setDialogRascunho({ open: true, draft });
  }, []);

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

  // Cálculos que dependem do estado (usados em useEffects)
  const totalRespondidos = Object.keys(respostas).length;
  const totalIndicadores = Object.values(dimensoes).reduce((acc, d) => acc + (d?.indicadores?.length || 0), 0);

  // ── Carregamento inicial de dados ─────────────────────────────────────────
  useEffect(() => {
    Promise.all([
      propriedadesAPI.listar({ limit: 200 }),
      indicadoresAPI.listar(),
    ]).then(([p, ind]) => {
      setPropriedades(p.data.data);
      setDimensoes(ind.data.dimensoes);

      // Preenche técnico responsável com o nome do usuário logado
      if (user?.nome) {
        setInfo((i) => ({ ...i, tecnico: user.nome }));
      }

      // Verifica rascunho salvo ANTES de aplicar parâmetros da URL
      const userId = user?.id;
      if (userId && temRascunhoLocal(userId)) {
        const draft = carregarRascunhoLocal(userId);
        // Se houver pendência e conexão, restaura direto para disparar sincronização automática.
        if (isOnline && draft?.syncPendente && draft?.info?.propriedade) {
          restaurarRascunho(draft, p.data.data);
          return;
        }
        // Se vier parâmetro de URL e bater com o rascunho → restaura direto
        const propId = searchParams.get('propriedade');
        if (propId && draft?.info?.propriedade?.id === propId) {
          restaurarRascunho(draft, p.data.data);
        } else {
          abrirDialogRascunho(draft);
        }
        return;
      }

      // Sem rascunho: aplica parâmetros da URL normalmente
      const propId = searchParams.get('propriedade');
      if (propId) {
        const prop = p.data.data.find((x) => x.id === propId);
        if (prop) setInfo((i) => ({ ...i, propriedade: prop }));
      }
    }).catch((e) => setErro(friendlyError(e)))
    .finally(() => setCarregando(false));
  // Roda só uma vez, na montagem: propositalmente NÃO depende de isOnline
  // (nem de user/searchParams) para não re-buscar dados nem reabrir o diálogo
  // de rascunho a cada oscilação de rede — a checagem de "está online" usa o
  // valor do momento em que a página abriu, e é só isso que importa aqui.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  // ── beforeunload: avisa se há dados não sincronizados ────────────────────
  useEffect(() => {
    const handler = (e) => {
      if (syncPendente && totalRespondidos > 0) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [syncPendente, totalRespondidos]);

  // ── Atalhos de teclado para navegação no wizard ───────────────────────────
  useEvaluationKeyboardShortcuts({
    onNext: () => {
      if (step < STEP_LABELS.length - 1) setStep((s) => s + 1);
    },
    onPrev: () => {
      if (step > 0) setStep((s) => s - 1);
    },
    onSave: () => salvarRascunho(),
  }, !carregando);

  // ── Sincroniza com o servidor ao voltar online ────────────────────────────
  useEffect(() => {
    if (isOnline && wasOffline && syncPendente && info.propriedade) {
      resetWasOffline();
      sincronizarAutomaticamente();
    }
  }, [isOnline, wasOffline, syncPendente, info.propriedade]); // eslint-disable-line react-hooks/exhaustive-deps

  // Se abrir a tela já com internet e houver pendência local, sincroniza em segundo plano.
  useEffect(() => {
    if (!isOnline || !syncPendente || !info.propriedade || carregando) return;
    sincronizarAutomaticamente({ silencioso: true });
  }, [isOnline, syncPendente, info.propriedade, carregando]); // eslint-disable-line react-hooks/exhaustive-deps

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

  // Média ponderada por dimensão (pesos internos dos indicadores) e IGS final
  // (pesos por dimensão) — mesma fórmula do backend, centralizada em
  // utils/metodologia.js para não divergir entre preview e resultado salvo.
  const calcularIndiceDimensao = (dimCodigo) => {
    if (!dimensoes[dimCodigo]) return null;
    return calcularIndiceDimensaoUtil(dimensoes[dimCodigo].indicadores, respostas);
  };

  const calcularIGS = () => calcularIGSUtil({
    economica: calcularIndiceDimensao('economica'),
    ambiental: calcularIndiceDimensao('ambiental'),
    social: calcularIndiceDimensao('social'),
    gestao_qualidade: calcularIndiceDimensao('gestao_qualidade'),
  }, metodologia);

  const getClassificacao = (igs) => getClassificacaoUtil(igs, metodologia?.escala);

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

  const sincronizarAutomaticamente = async ({ silencioso = false } = {}) => {
    if (!isOnline || !syncPendente || !info.propriedade) return false;
    if (sincronizandoAutoRef.current) return false;

    sincronizandoAutoRef.current = true;
    if (!silencioso) notify('Conexão restaurada! Sincronizando automaticamente...', 'info');

    try {
      await salvarRascunhoServidor();
      setSyncPendente(false);
      atualizarSyncPendenteLocal(user?.id, false);
      if (!silencioso) notify('Sincronização automática concluída com sucesso.', 'success');
      return true;
    } catch {
      atualizarSyncPendenteLocal(user?.id, true);
      return false;
    } finally {
      sincronizandoAutoRef.current = false;
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
      atualizarSyncPendenteLocal(user?.id, false);
      notify('Rascunho salvo no servidor!');
    } catch (e) {
      atualizarSyncPendenteLocal(user?.id, true);
      notify('Falha ao salvar no servidor. Dados mantidos localmente.', 'warning');
    } finally {
      setSalvando(false);
    }
  };

  const concluir = () => {
    if (!info.propriedade) { notify('Selecione uma propriedade', 'error'); return; }
    if (totalRespondidos < totalIndicadores) {
      setConfirmConcluirPendente(true);
      return;
    }
    executarConclusao();
  };

  const executarConclusao = async () => {
    setConfirmConcluirPendente(false);
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
    } catch (e) { notify(friendlyError(e), 'error'); }
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

  // ── Passos do tutorial (contextuais ao wizard step) ───────────────────────
  // ATENÇÃO: este useCallback DEVE ficar antes de qualquer early return para
  // não violar as Rules of Hooks.
  const getTutorialSteps = useCallback(() => {
    const base = [
      {
        ref: refCabecalho,
        titulo: '📋 Cabeçalho da avaliação',
        descricao: 'Aqui fica o título e os controles principais. Use o botão Voltar para sair sem perder dados (o rascunho fica salvo). O botão Salvar guarda o progresso no servidor a qualquer momento.',
      },
      {
        ref: refProgressoCard,
        titulo: '📊 Progresso e etapas',
        descricao: 'Acompanhe o progresso geral (todos os indicadores) e o da etapa atual. Clique em qualquer etapa no stepper para navegar diretamente entre elas sem precisar usar os botões.',
      },
    ];
    if (step === 0) {
      return [
        ...base,
        {
          ref: refConteudoStep,
          titulo: '📝 Informações da avaliação',
          descricao: 'Preencha os dados básicos:\n• Propriedade Rural (obrigatório) — busque digitando o nome.\n• Técnico Responsável — preenchido automaticamente com seu cadastro.\n• Data da Avaliação — data em que a visita está ocorrendo.\n• Observações — campo livre para anotações sobre a visita.',
        },
        {
          ref: refNavegacao,
          titulo: '➡️ Navegação entre etapas',
          descricao: 'Use o botão Próximo para avançar para a primeira dimensão de avaliação. Você pode voltar a qualquer etapa anterior sem perder as respostas já preenchidas.',
        },
      ];
    }
    if (step >= 1 && step <= dimensoesLista.length) {
      const dim = dimensoesLista[step - 1];
      return [
        ...base,
        {
          ref: refConteudoStep,
          titulo: `🌱 Dimensão: ${dim?.nome}`,
          descricao: `Esta dimensão possui ${dim?.indicadores?.length || 0} indicadores e representa ${Math.round((dim?.peso || 0) * 100)}% do Índice Geral de Sustentabilidade.\n\nPara cada indicador, leia o enunciado e selecione o critério que melhor descreve a realidade da propriedade. Uma nota de 0 a 1 é atribuída automaticamente. Você pode adicionar observações individuais em cada indicador.`,
        },
        {
          ref: refNavegacao,
          titulo: '➡️ Navegação entre etapas',
          descricao: 'Avance para a próxima dimensão ao concluir. Não é obrigatório responder todos os indicadores para continuar, mas o cálculo do IGS será parcial se houver indicadores sem resposta.',
        },
      ];
    }
    return [
      ...base,
      {
        ref: refConteudoStep,
        titulo: '🔍 Revisão e resultado',
        descricao: 'Confira o resumo com os índices calculados por dimensão e o ICSR (Índice de Sustentabilidade) preliminar. Se precisar corrigir algo, use o Stepper acima para voltar a qualquer etapa.',
      },
      {
        ref: refNavegacao,
        titulo: '✅ Concluir avaliação',
        descricao: 'Clique em Concluir Avaliação para finalizar e enviar os dados ao servidor. Você precisa estar conectado à internet para concluir. Os dados ficam salvos localmente até você se conectar.',
      },
    ];
  }, [step, dimensoesLista]); // eslint-disable-line react-hooks/exhaustive-deps

  // Scroll + highlight quando muda o passo do tutorial
  useEffect(() => {
    if (!tutorialAtivo) return;
    const steps = getTutorialSteps();
    const el = steps[Math.min(passoTutorial, steps.length - 1)]?.ref?.current;
    if (!el) return;
    document.querySelectorAll('[data-tutorial-hl]').forEach((e) => {
      e.style.outline = '';
      e.style.outlineOffset = '';
      e.removeAttribute('data-tutorial-hl');
    });
    el.setAttribute('data-tutorial-hl', '1');
    el.style.outline = '3px solid #2E7D32';
    el.style.outlineOffset = '4px';
    el.style.borderRadius = '12px';
    el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    return () => {
      el.style.outline = '';
      el.style.outlineOffset = '';
      el.removeAttribute('data-tutorial-hl');
    };
  }, [tutorialAtivo, passoTutorial, getTutorialSteps]);

  // Fecha e limpa highlights ao desativar tutorial
  useEffect(() => {
    if (!tutorialAtivo) {
      document.querySelectorAll('[data-tutorial-hl]').forEach((e) => {
        e.style.outline = '';
        e.style.outlineOffset = '';
        e.removeAttribute('data-tutorial-hl');
      });
    }
  }, [tutorialAtivo]);

  if (carregando) return (
    <Box>
      <Skeleton variant="rectangular" height={88} sx={{ borderRadius: 2, mb: 1.5 }} />
      <Skeleton variant="rectangular" height={120} sx={{ borderRadius: 2, mb: 2 }} />
      <Skeleton variant="rectangular" height={320} sx={{ borderRadius: 2 }} />
    </Box>
  );

  const STEP_LABELS = ['Informações', ...dimensoesLista.map((d) => d.nome), 'Revisão'];

  const STEP_LABELS_STEPPER = STEP_LABELS.map((label) => {
    if (label === 'Informações') return 'Info';
    if (label === 'Gestão, Qualidade e Governança') return 'IGQG';
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
            autoFocus
            variant="contained"
            onClick={() => restaurarRascunho(dialogRascunho.draft, propriedades)}
          >
            Continuar de onde parou
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Cabeçalho ── */}
      <Box ref={refCabecalho}>
      <PageHeaderCard
        title="Nova Avaliação ICSR"
        subtitle="Preencha os indicadores de cada dimensão. Seus dados são salvos automaticamente."
        actions={(
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
            <Button startIcon={<FiArrowLeft />} onClick={() => navigate(-1)} size="small">
              Voltar
            </Button>
            <Tooltip title={tutorialAtivo ? 'Fechar o tutorial' : 'Tutorial interativo: explicação campo a campo desta página'}>
              <Button
                size="small"
                startIcon={tutorialAtivo ? <FiX size={14} /> : <FiHelpCircle size={14} />}
                variant={tutorialAtivo ? 'contained' : 'outlined'}
                color={tutorialAtivo ? 'primary' : 'inherit'}
                onClick={() => { setTutorialAtivo((a) => !a); setPassoTutorial(0); }}
                sx={tutorialAtivo ? {} : { color: 'text.secondary', borderColor: 'divider' }}
              >
                {tutorialAtivo ? 'Fechar guia' : 'Guia'}
              </Button>
            </Tooltip>
            <Tooltip title="Atalhos: Ctrl+→ próxima etapa · Ctrl+← etapa anterior · Ctrl+S salvar">
              <span>
                <Button
                  variant="outlined"
                  startIcon={<FiSave />}
                  onClick={salvarRascunho}
                  disabled={salvando || !info.propriedade}
                  size="small"
                >
                  {salvando ? <CircularProgress size={16} /> : 'Salvar'}
                </Button>
              </span>
            </Tooltip>
          </Box>
        )}
      />
      </Box>

      {erro && <Alert severity="error" sx={{ mb: 1.5 }}>{erro}</Alert>}

      <Card ref={refProgressoCard} sx={{ mb: 1.5 }}>
        <CardContent sx={{ p: { xs: 2, sm: 2.5 } }}>
          {/* Progresso global */}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.75, gap: 1 }}>
            <Typography variant="caption" color="text.secondary" fontWeight={700}>
              Progresso global da avaliação
            </Typography>
            <Typography variant="caption" color="text.secondary" fontWeight={700}>
              {totalRespondidos}/{totalIndicadores} ({Math.round(progressoGlobal)}%)
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={progressoGlobal}
            sx={{ height: 6, borderRadius: 3, mb: 2 }}
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
            /* Mobile: indicador de dimensão proeminente */
            <Box sx={{ mb: 1.5 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {step >= 1 && step <= dimensoesLista.length && (
                    <Box sx={{
                      width: 10, height: 10, borderRadius: '50%',
                      bgcolor: dimensoesLista[step - 1]?.cor,
                      flexShrink: 0,
                    }} />
                  )}
                  <Typography variant="body2" fontWeight={800} color={
                    step >= 1 && step <= dimensoesLista.length
                      ? dimensoesLista[step - 1]?.cor
                      : 'primary.dark'
                  }>
                    {stepAtualLabel}
                  </Typography>
                </Box>
                <Typography variant="caption" color="text.secondary" fontWeight={600}>
                  {Math.min(step + 1, STEP_LABELS.length)}/{STEP_LABELS.length}
                </Typography>
              </Box>
              {/* Trilho de dots compacto */}
              <Box sx={{ display: 'flex', gap: 0.5 }}>
                {STEP_LABELS.map((_, idx) => {
                  const dimCor = idx >= 1 && idx <= dimensoesLista.length
                    ? dimensoesLista[idx - 1]?.cor
                    : '#2E7D32';
                  return (
                    <Box
                      key={idx}
                      sx={{
                        height: 4,
                        borderRadius: 2,
                        flexGrow: 1,
                        bgcolor: idx < step ? dimCor : idx === step ? dimCor : '#e0e0e0',
                        opacity: idx < step ? 0.45 : 1,
                        transition: 'background-color 0.2s',
                      }}
                    />
                  );
                })}
              </Box>
            </Box>
          )}

          {/* Progresso do step atual */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.75 }}>
            <Typography variant="caption" color="text.secondary" fontWeight={600}>
              {step >= 1 && step <= dimensoesLista.length
                ? `${dimensoesLista[step - 1]?.indicadores?.length || 0} indicadores · peso ${Math.round((dimensoesLista[step - 1]?.peso || 0) * 100)}%`
                : `Etapa ${Math.min(step + 1, STEP_LABELS.length)} de ${STEP_LABELS.length}`}
            </Typography>
            <Typography variant="caption" color="text.secondary" fontWeight={700}>
              {Math.round(progressoEtapa)}%
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={progressoEtapa}
            sx={{ height: 4, borderRadius: 2, bgcolor: '#eee', '& .MuiLinearProgress-bar': { bgcolor: step === 0 ? 'primary.main' : dimensoesLista[step - 1]?.cor } }}
          />
        </CardContent>
      </Card>

      {/* Conteúdo dos steps */}
      <Box ref={refConteudoStep}>
      {step === 0 && (
        <Card sx={{ mb: 2.5 }}>
          <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
            <Typography variant="h6" fontWeight={700} gutterBottom sx={{ mb: 2.5 }}>Informações da Avaliação</Typography>
            <Grid container spacing={2.5}>
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
                  <Alert severity="info" sx={{ mt: 1 }}>
                    Nenhuma propriedade cadastrada. Cadastre pelo menos uma propriedade rural antes de iniciar uma avaliação.{' '}
                    <Button size="small" onClick={() => navigate('/propriedades')}>Cadastrar propriedade</Button>
                  </Alert>
                )}
              </Grid>
              {info.propriedade && (
                <Grid size={12}>
                  <Paper sx={{ p: 1.25, bgcolor: '#F1F8E9', borderRadius: 2 }} variant="outlined">
                    <Typography variant="caption" color="text.secondary">
                      Proprietário: {info.propriedade.proprietario || 'Não informado'} · Área café: {formatAreaCafe(info.propriedade.area_cafe)}
                    </Typography>
                  </Paper>
                </Grid>
              )}
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  label="Técnico Responsável"
                  fullWidth
                  value={info.tecnico}
                  disabled
                  helperText="Preenchido automaticamente com seu nome de usuário"
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
      </Box>

      {/* Botões de navegação */}
      <Card ref={refNavegacao} sx={{ mt: 3.5 }}>
        <CardContent sx={{ p: { xs: 2, sm: 2.5 } }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2 }}>
            <Button
              startIcon={<FiArrowLeft />}
              onClick={() => setStep((s) => s - 1)}
              disabled={step === 0}
              variant="outlined"
              fullWidth={isMobile}
              size="large"
              sx={{ minWidth: isMobile ? 'auto' : 140 }}
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
                size="large"
                sx={{ minWidth: isMobile ? 'auto' : 140 }}
              >
                Próximo
              </Button>
            ) : (
              <Tooltip title={!isOnline ? 'Conecte-se à internet para concluir. Os dados estão salvos localmente.' : ''}>
                <span style={{ flex: 1 }}>
                  <Button
                    startIcon={<FiCheck />}
                    onClick={concluir}
                    variant="contained"
                    color="success"
                    disabled={salvando || !isOnline}
                    size="large"
                    fullWidth={isMobile}
                    sx={{ minWidth: isMobile ? 'auto' : 180 }}
                  >
                    {salvando ? <CircularProgress size={20} /> : !isOnline ? 'Aguardando conexão…' : 'Concluir Avaliação'}
                  </Button>
                </span>
              </Tooltip>
            )}
          </Box>
        </CardContent>
      </Card>

      {/* ── Painel de Tutorial ── */}
      {tutorialAtivo && (() => {
        const tutorialSteps = getTutorialSteps();
        const passo = Math.min(passoTutorial, tutorialSteps.length - 1);
        const atual = tutorialSteps[passo];
        return (
          <Paper
            elevation={12}
            sx={{
              position: 'fixed',
              bottom: isMobile ? 64 : 20,
              left: '50%',
              transform: 'translateX(-50%)',
              width: { xs: 'calc(100% - 32px)', sm: 480 },
              zIndex: 1400,
              borderRadius: 3,
              p: 2.5,
              border: '2px solid',
              borderColor: 'primary.main',
              bgcolor: 'background.paper',
            }}
          >
            {/* Header */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
              <Box>
                <Typography variant="caption" color="text.secondary" fontWeight={600}>
                  Tutorial · Passo {passo + 1} de {tutorialSteps.length}
                </Typography>
                <Typography variant="subtitle2" fontWeight={800} color="primary.main" sx={{ mt: 0.25 }}>
                  {atual.titulo}
                </Typography>
              </Box>
              <Tooltip title="Fechar tutorial">
                <span>
                  <Button
                    size="small"
                    onClick={() => setTutorialAtivo(false)}
                    sx={{ minWidth: 0, p: 0.5, color: 'text.secondary' }}
                  >
                    <FiX size={16} />
                  </Button>
                </span>
              </Tooltip>
            </Box>

            {/* Conteúdo */}
            <Typography
              variant="body2"
              sx={{ mb: 2, lineHeight: 1.7, whiteSpace: 'pre-line', color: 'text.primary' }}
            >
              {atual.descricao}
            </Typography>

            {/* Dots */}
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 0.75, mb: 1.5 }}>
              {tutorialSteps.map((_, idx) => (
                <Box
                  key={idx}
                  onClick={() => setPassoTutorial(idx)}
                  sx={{
                    width: idx === passo ? 20 : 8,
                    height: 8,
                    borderRadius: 4,
                    bgcolor: idx === passo ? 'primary.main' : '#ddd',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                />
              ))}
            </Box>

            {/* Navegação */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 1 }}>
              <Button
                size="small"
                startIcon={<FiArrowLeft />}
                onClick={() => setPassoTutorial((p) => p - 1)}
                disabled={passo === 0}
                variant="outlined"
              >
                Anterior
              </Button>
              {passo < tutorialSteps.length - 1 ? (
                <Button
                  size="small"
                  variant="contained"
                  endIcon={<FiArrowRight />}
                  onClick={() => setPassoTutorial((p) => p + 1)}
                >
                  Próximo
                </Button>
              ) : (
                <Button
                  size="small"
                  variant="contained"
                  color="success"
                  startIcon={<FiCheck />}
                  onClick={() => setTutorialAtivo(false)}
                >
                  Entendi!
                </Button>
              )}
            </Box>
          </Paper>
        );
      })()}

      <ConfirmDialog
        open={confirmConcluirPendente}
        title="Concluir avaliação"
        message={`Ainda faltam ${totalIndicadores - totalRespondidos} indicador(es) para avaliar. Deseja concluir mesmo assim?`}
        confirmLabel="Concluir mesmo assim"
        severity="warning"
        onConfirm={executarConclusao}
        onCancel={() => setConfirmConcluirPendente(false)}
        loading={salvando}
      />
    </Box>
  );
}

function RevisaoFinal({ info, dimensoesLista, respostas, calcularIndiceDimensao, calcularIGS, getClassificacao, totalRespondidos, totalIndicadores }) {
  const igs = calcularIGS();
  const classificacao = getClassificacao(igs);

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
              <Typography variant="body2">{formatarData(info.data)}</Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* IGS calculado */}
      <Card sx={{ mb: 1.5, border: `2px solid ${COR_CLASSIFICACAO[classificacao]}` }}>
        <CardContent sx={{ textAlign: 'center', p: { xs: 2, sm: 2.5 } }}>
          <MdOutlineEco size={36} color={COR_CLASSIFICACAO[classificacao]} />
          <Typography variant="h4" fontWeight={800} color={COR_CLASSIFICACAO[classificacao]} sx={{ mt: 0.75 }}>
            ICSR: {(igs * 100).toFixed(1)}%
          </Typography>
          <Typography variant="h6" fontWeight={700} color={COR_CLASSIFICACAO[classificacao]}>
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
