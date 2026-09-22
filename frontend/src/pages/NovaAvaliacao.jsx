import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { FiArrowLeft, FiArrowRight, FiCheck, FiSave, FiWifiOff, FiClock, FiTrash2, FiHelpCircle, FiX, FiSearch } from 'react-icons/fi';
import { MdOutlineEco } from 'react-icons/md';
import { propriedadesAPI, avaliacoesAPI, indicadoresAPI } from '../services/api';
import { useApp } from '../context/AppContext';
import DimensaoStep from '../components/Evaluation/DimensaoStep';
import PageHeaderCard from '../components/Common/PageHeaderCard';
import { useNetworkStatus } from '../hooks/useNetworkStatus';
import { useEvaluationKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';
import { useMediaQuery } from '../hooks/useMediaQuery';
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
import { formatarData, hojeISO } from '../utils/formatarData';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Alert from '../components/ui/Alert';
import Skeleton from '../components/ui/Skeleton';
import Tooltip from '../components/ui/Tooltip';
import Dialog from '../components/ui/Dialog';
import { cn } from '../utils/cn';

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

export default function NovaAvaliacao() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { notify, user } = useApp();
  const { isOnline, wasOffline, resetWasOffline } = useNetworkStatus();
  const { metodologia } = useMetodologia();
  const isMobile = useMediaQuery('(max-width: 768px)');

  const [step, setStep] = useState(0); // 0=info, 1-4=dimensões, 5=revisão
  const [propriedades, setPropriedades] = useState([]);
  const [dimensoes, setDimensoes] = useState({});
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [avaliacaoId, setAvaliacaoId] = useState(null);
  const [erro, setErro] = useState('');
  const [confirmConcluirPendente, setConfirmConcluirPendente] = useState(false);

  // Busca de propriedades
  const [buscaPropriedade, setBuscaPropriedade] = useState('');
  const [seletorPropAberto, setSeletorPropAberto] = useState(false);

  // Cache offline
  const [ultimoSalvoLocal, setUltimoSalvoLocal] = useState(null);
  const [syncPendente, setSyncPendente] = useState(false);
  const [dialogRascunho, setDialogRascunho] = useState({ open: false, draft: null });
  const autoSaveTimer = useRef(null);
  const sincronizandoAutoRef = useRef(false);
  const avisoQuotaMostradoRef = useRef(false);

  // ── Tutorial campo a campo ────────────────────────────────────────────────
  const [tutorialAtivo, setTutorialAtivo] = useState(false);
  const [passoTutorial, setPassoTutorial] = useState(0);
  const refAnuncioTutorial = useRef(null);
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
    data: hojeISO(),
    observacoes: '',
  });
  const [respostas, setRespostas] = useState({});
  const [respostasDetalhes, setRespostasDetalhes] = useState({});
  const [observacoes, setObservacoes] = useState({});

  // Cálculos que dependem do estado
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

      if (user?.nome) {
        setInfo((i) => ({ ...i, tecnico: user.nome }));
      }

      const userId = user?.id;
      if (userId && temRascunhoLocal(userId)) {
        const draft = carregarRascunhoLocal(userId);
        if (isOnline && draft?.syncPendente && draft?.info?.propriedade) {
          restaurarRascunho(draft, p.data.data);
          return;
        }
        const propId = searchParams.get('propriedade');
        if (propId && draft?.info?.propriedade?.id === propId) {
          restaurarRascunho(draft, p.data.data);
        } else {
          abrirDialogRascunho(draft);
        }
        return;
      }

      const propId = searchParams.get('propriedade');
      if (propId) {
        const prop = p.data.data.find((x) => x.id === propId);
        if (prop) setInfo((i) => ({ ...i, propriedade: prop }));
      }
    }).catch((e) => setErro(friendlyError(e)))
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
      const salvou = salvarRascunhoLocal(userId, estado);
      if (salvou) {
        avisoQuotaMostradoRef.current = false;
        setUltimoSalvoLocal(new Date().toISOString());
      } else if (!avisoQuotaMostradoRef.current) {
        avisoQuotaMostradoRef.current = true;
        notify('Não foi possível salvar o rascunho localmente (armazenamento cheio). Conclua ou sincronize esta avaliação com conexão à internet o quanto antes.', 'error');
      }
      setSyncPendente(true);
    }, 1500);

    return () => clearTimeout(autoSaveTimer.current);
  }, [step, avaliacaoId, info, respostas, respostasDetalhes, observacoes, user?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── beforeunload ──────────────────────────────────────────────────────────
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

  // ── Atalhos de teclado ───────────────────────────────────────────────────
  useEvaluationKeyboardShortcuts({
    onNext: () => {
      if (step < STEP_LABELS.length - 1) setStep((s) => s + 1);
    },
    onPrev: () => {
      if (step > 0) setStep((s) => s - 1);
    },
    onSave: () => salvarRascunho(),
  }, !carregando);

  // ── Sincroniza ao voltar online ──────────────────────────────────────────
  useEffect(() => {
    if (isOnline && wasOffline && syncPendente && info.propriedade) {
      resetWasOffline();
      sincronizarAutomaticamente();
    }
  }, [isOnline, wasOffline, syncPendente, info.propriedade]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!isOnline || !syncPendente || !info.propriedade || carregando) return;
    sincronizarAutomaticamente({ silencioso: true });
  }, [isOnline, syncPendente, info.propriedade, carregando]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Funções de rascunho ───────────────────────────────────────────────────
  const restaurarRascunho = (draft, listaPropriedades) => {
    if (!draft) return;
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
    } catch {
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
        descricao: 'Acompanhe o progresso geral (todos os indicadores) e o da etapa atual. Clique em qualquer etapa para navegar diretamente sem precisar usar os botões.',
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
          descricao: `Esta dimensão possui ${dim?.indicadores?.length || 0} indicadores e representa ${Math.round((dim?.peso || 0) * 100)}% do ICSR.\n\nPara cada indicador, selecione o critério correspondente. Você pode adicionar observações individuais em cada indicador.`,
        },
        {
          ref: refNavegacao,
          titulo: '➡️ Navegação entre etapas',
          descricao: 'Avance para a próxima dimensão ao concluir. O salvamento local é instantâneo a cada resposta.',
        },
      ];
    }
    return [
      ...base,
      {
        ref: refConteudoStep,
        titulo: '🔍 Revisão e resultado',
        descricao: 'Confira o resumo com os índices calculados por dimensão e o ICSR preliminar. Se precisar corrigir algo, volte a qualquer etapa anterior.',
      },
      {
        ref: refNavegacao,
        titulo: '✅ Concluir avaliação',
        descricao: 'Clique em Concluir Avaliação para finalizar e gerar o laudo técnico definitivo.',
      },
    ];
  }, [step, dimensoesLista]);

  useEffect(() => {
    if (!tutorialAtivo) return;
    const steps = getTutorialSteps();
    const idx = Math.min(passoTutorial, steps.length - 1);
    const passoAtual = steps[idx];
    const el = passoAtual?.ref?.current;
    if (!el) return;
    document.querySelectorAll('[data-tutorial-hl]').forEach((e) => {
      e.style.outline = '';
      e.removeAttribute('data-tutorial-hl');
    });
    el.setAttribute('data-tutorial-hl', '1');
    el.style.outline = '3px solid #1B4D24';
    el.style.outlineOffset = '4px';
    el.style.borderRadius = '12px';
    el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    if (refAnuncioTutorial.current) {
      refAnuncioTutorial.current.textContent = `Passo ${idx + 1} de ${steps.length}: ${passoAtual.titulo}. ${passoAtual.descricao}`;
    }
    return () => {
      el.style.outline = '';
      el.removeAttribute('data-tutorial-hl');
    };
  }, [tutorialAtivo, passoTutorial, getTutorialSteps]);

  useEffect(() => {
    if (!tutorialAtivo) {
      document.querySelectorAll('[data-tutorial-hl]').forEach((e) => {
        e.style.outline = '';
        e.removeAttribute('data-tutorial-hl');
      });
      if (refAnuncioTutorial.current) refAnuncioTutorial.current.textContent = '';
    }
  }, [tutorialAtivo]);

  if (carregando) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-20 w-full rounded-xl" />
        <Skeleton className="h-28 w-full rounded-xl" />
        <Skeleton className="h-80 w-full rounded-xl" />
      </div>
    );
  }

  const STEP_LABELS = ['Informações', ...dimensoesLista.map((d) => d.nome), 'Revisão'];
  const STEP_LABELS_STEPPER = STEP_LABELS.map((label) => {
    if (label === 'Informações') return 'Info';
    if (label === 'Gestão, Qualidade e Governança') return 'IGQG';
    return label;
  });
  const stepAtualLabel = STEP_LABELS[step] || 'Revisão';
  const progressoGlobal = clampProgress((totalRespondidos / Math.max(totalIndicadores, 1)) * 100);
  const progressoEtapa = clampProgress(progrStep);

  const propriedadesFiltradas = propriedades.filter((p) => {
    if (!buscaPropriedade.trim()) return true;
    const q = buscaPropriedade.toLowerCase();
    return (
      p.nome?.toLowerCase().includes(q) ||
      p.municipio?.toLowerCase().includes(q) ||
      p.proprietario?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Banner offline */}
      {!isOnline && (
        <Alert
          variant="warning"
          icon={<FiWifiOff className="h-5 w-5" />}
        >
          <strong>Modo offline</strong> — sem conexão com a internet. Seus dados estão sendo
          salvos automaticamente no dispositivo. Ao reconectar, a sincronização ocorrerá automaticamente.
        </Alert>
      )}

      {/* Dialog: rascunho encontrado */}
      <Dialog
        open={dialogRascunho.open}
        onOpenChange={() => {}}
        title="Rascunho encontrado"
        className="max-w-md"
        footer={
          <div className="flex w-full items-center justify-between gap-3 pt-2">
            <Button
              variant="dangerOutline"
              icon={<FiTrash2 />}
              onClick={descartarRascunho}
            >
              Descartar
            </Button>
            <Button
              variant="primary"
              onClick={() => restaurarRascunho(dialogRascunho.draft, propriedades)}
            >
              Continuar de onde parou
            </Button>
          </div>
        }
      >
        <div className="space-y-3">
          <Alert variant="info" className="text-xs">
            Você tem uma avaliação em andamento salva neste dispositivo.
          </Alert>
          {dialogRascunho.draft && (
            <div className="rounded-lg border border-slate-100 bg-slate-50 p-3 space-y-1.5 text-xs text-slate-700">
              <p>
                <strong className="text-slate-900">Propriedade:</strong>{' '}
                {dialogRascunho.draft.info?.propriedade?.nome || 'Não selecionada'}
              </p>
              <p>
                <strong className="text-slate-900">Indicadores respondidos:</strong>{' '}
                {Object.keys(dialogRascunho.draft.respostas || {}).length}
              </p>
              <p>
                <strong className="text-slate-900">Último salvamento:</strong>{' '}
                {formatarDataRascunho(dialogRascunho.draft.timestamp)}
              </p>
            </div>
          )}
        </div>
      </Dialog>

      {/* Cabeçalho */}
      <div ref={refCabecalho} tabIndex={-1} className="outline-hidden">
        <PageHeaderCard
          title="Nova Avaliação ICSR"
          subtitle="Preencha os indicadores de cada dimensão. Seus dados são salvos automaticamente."
          actions={
            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                icon={<FiArrowLeft />}
                onClick={() => navigate(-1)}
              >
                Voltar
              </Button>
              <Tooltip content={tutorialAtivo ? 'Fechar o tutorial' : 'Tutorial interativo: explicação desta página'}>
                <Button
                  size="sm"
                  variant={tutorialAtivo ? 'primary' : 'secondary'}
                  icon={tutorialAtivo ? <FiX /> : <FiHelpCircle />}
                  onClick={() => { setTutorialAtivo((a) => !a); setPassoTutorial(0); }}
                >
                  {tutorialAtivo ? 'Fechar guia' : 'Guia'}
                </Button>
              </Tooltip>
              <Tooltip content="Atalhos: Ctrl+→ próxima etapa · Ctrl+← etapa anterior · Ctrl+S salvar">
                <Button
                  variant="secondary"
                  size="sm"
                  icon={<FiSave />}
                  loading={salvando}
                  disabled={salvando || !info.propriedade}
                  onClick={salvarRascunho}
                >
                  Salvar
                </Button>
              </Tooltip>
            </div>
          }
        />
      </div>

      {erro && <Alert variant="error">{erro}</Alert>}

      {/* Card de Progresso e Stepper */}
      <div ref={refProgressoCard} tabIndex={-1} className="outline-hidden">
        <Card>
          <CardContent className="p-4 sm:p-5">
            {/* Progresso global */}
            <div className="flex items-center justify-between text-xs font-semibold text-slate-500 mb-1.5">
              <span>Progresso global da avaliação</span>
              <span>{totalRespondidos}/{totalIndicadores} ({Math.round(progressoGlobal)}%)</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 mb-4">
              <div
                className="h-full rounded-full bg-caparao-700 transition-all duration-300"
                style={{ width: `${progressoGlobal}%` }}
              />
            </div>

            {/* Stepper no Desktop */}
            {!isMobile ? (
              <div className="mb-4 flex items-center justify-between border-y border-slate-100 py-3">
                {STEP_LABELS_STEPPER.map((label, idx) => {
                  const active = idx === step;
                  const completed = idx < step;
                  return (
                    <button
                      key={label}
                      type="button"
                      onClick={() => setStep(idx)}
                      className={cn(
                        'flex flex-1 flex-col items-center gap-1 transition-all focus:outline-hidden text-center group',
                        active ? 'text-caparao-800 font-bold' : completed ? 'text-slate-700' : 'text-slate-400'
                      )}
                    >
                      <div
                        className={cn(
                          'flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition-all',
                          active
                            ? 'bg-caparao-700 text-white ring-4 ring-caparao-100'
                            : completed
                            ? 'bg-caparao-100 text-caparao-800'
                            : 'bg-slate-100 text-slate-500 group-hover:bg-slate-200'
                        )}
                      >
                        {completed ? <FiCheck size={14} /> : idx + 1}
                      </div>
                      <span className="text-[11px] font-medium leading-tight">{label}</span>
                    </button>
                  );
                })}
              </div>
            ) : (
              /* Mobile Stepper */
              <div className="mb-3">
                <div className="flex items-center justify-between mb-1 text-xs">
                  <span className="font-bold text-caparao-800">{stepAtualLabel}</span>
                  <span className="text-slate-500">{Math.min(step + 1, STEP_LABELS.length)}/{STEP_LABELS.length}</span>
                </div>
                <div className="flex gap-1">
                  {STEP_LABELS.map((_, idx) => (
                    <div
                      key={idx}
                      className={cn(
                        'h-1 flex-1 rounded-full transition-all',
                        idx < step ? 'bg-caparao-700 opacity-50' : idx === step ? 'bg-caparao-700' : 'bg-slate-200'
                      )}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Progresso do step atual */}
            <div className="flex justify-between items-center text-xs text-slate-500 font-medium mb-1">
              <span>
                {step >= 1 && step <= dimensoesLista.length
                  ? `${dimensoesLista[step - 1]?.indicadores?.length || 0} indicadores · peso ${Math.round((dimensoesLista[step - 1]?.peso || 0) * 100)}%`
                  : `Etapa ${Math.min(step + 1, STEP_LABELS.length)} de ${STEP_LABELS.length}`}
              </span>
              <span className="font-bold">{Math.round(progressoEtapa)}%</span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{
                  width: `${progressoEtapa}%`,
                  backgroundColor: step === 0 ? '#1B4D24' : dimensoesLista[step - 1]?.cor || '#1B4D24',
                }}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Conteúdo dos steps */}
      <div ref={refConteudoStep} tabIndex={-1} className="outline-hidden">
        {step === 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-bold text-slate-900">
                Informações da Avaliação
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Seleção de Propriedade */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  Propriedade Rural *
                </label>
                <div className="relative">
                  <div
                    onClick={() => setSeletorPropAberto((v) => !v)}
                    className="flex min-h-[42px] cursor-pointer items-center justify-between rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 shadow-xs hover:border-slate-400"
                  >
                    <span>
                      {info.propriedade
                        ? `${info.propriedade.nome} — ${formatLocalizacao(info.propriedade)}`
                        : 'Selecione ou busque uma propriedade...'}
                    </span>
                    <FiSearch className="text-slate-400" />
                  </div>

                  {seletorPropAberto && (
                    <div className="absolute left-0 right-0 top-full z-20 mt-1 max-h-60 overflow-y-auto rounded-xl border border-slate-200 bg-white p-2 shadow-xl">
                      <input
                        type="text"
                        value={buscaPropriedade}
                        onChange={(e) => setBuscaPropriedade(e.target.value)}
                        placeholder="Buscar por nome, município..."
                        className="w-full rounded-lg border border-slate-200 p-2 text-xs text-slate-800 focus:border-caparao-700 focus:outline-hidden mb-2"
                        autoFocus
                      />
                      <div className="divide-y divide-slate-100">
                        {propriedadesFiltradas.length === 0 ? (
                          <div className="p-3 text-center text-xs text-slate-500">
                            Nenhuma propriedade encontrada
                          </div>
                        ) : (
                          propriedadesFiltradas.map((p) => (
                            <div
                              key={p.id}
                              onClick={() => {
                                setInfo((i) => ({ ...i, propriedade: p }));
                                setSeletorPropAberto(false);
                              }}
                              className="flex cursor-pointer items-center justify-between p-2.5 rounded-lg text-xs hover:bg-slate-50"
                            >
                              <div>
                                <p className="font-bold text-slate-800">{p.nome}</p>
                                <p className="text-[11px] text-slate-500">{formatLocalizacao(p)} · {p.proprietario}</p>
                              </div>
                              {info.propriedade?.id === p.id && (
                                <FiCheck className="text-caparao-700" size={16} />
                              )}
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {propriedades.length === 0 && (
                  <Alert variant="info" className="text-xs">
                    Nenhuma propriedade cadastrada.{' '}
                    <button
                      type="button"
                      onClick={() => navigate('/propriedades')}
                      className="font-bold underline"
                    >
                      Cadastrar propriedade
                    </button>
                  </Alert>
                )}
              </div>

              {info.propriedade && (
                <div className="rounded-lg border border-caparao-200 bg-caparao-50/50 p-3 text-xs text-caparao-900">
                  <p>
                    <strong>Proprietário:</strong> {info.propriedade.proprietario || 'Não informado'} ·{' '}
                    <strong>Área café:</strong> {formatAreaCafe(info.propriedade.area_cafe)}
                  </p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Técnico Responsável
                  </label>
                  <input
                    type="text"
                    value={info.tecnico}
                    disabled
                    className="w-full rounded-lg border border-slate-200 bg-slate-100 p-2.5 text-xs text-slate-600 shadow-xs cursor-not-allowed"
                  />
                  <span className="block mt-1 text-[11px] text-slate-500">
                    Preenchido automaticamente com seu nome
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Data da Avaliação
                  </label>
                  <input
                    type="date"
                    value={info.data}
                    onChange={(e) => setInfo((i) => ({ ...i, data: e.target.value }))}
                    className="w-full rounded-lg border border-slate-300 bg-white p-2.5 text-xs text-slate-800 shadow-xs focus:border-caparao-700 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Observações gerais
                </label>
                <textarea
                  rows={3}
                  value={info.observacoes}
                  onChange={(e) => setInfo((i) => ({ ...i, observacoes: e.target.value }))}
                  placeholder="Anotações gerais sobre a visita técnica ou condições climáticas da propriedade..."
                  className="w-full rounded-lg border border-slate-300 bg-white p-2.5 text-xs text-slate-800 shadow-xs focus:border-caparao-700 focus:outline-hidden"
                />
              </div>
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
      </div>

      {/* Botões de navegação */}
      <div ref={refNavegacao} tabIndex={-1} className="outline-hidden">
        <Card>
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center justify-between gap-3">
              <Button
                variant="secondary"
                size="lg"
                icon={<FiArrowLeft />}
                disabled={step === 0}
                onClick={() => setStep((s) => s - 1)}
                className={isMobile ? 'flex-1' : 'min-w-[140px]'}
              >
                Anterior
              </Button>

              {step < STEP_LABELS.length - 1 ? (
                <Button
                  variant="primary"
                  size="lg"
                  icon={<FiArrowRight />}
                  onClick={() => {
                    if (step === 0 && !info.propriedade) {
                      notify('Selecione uma propriedade primeiro', 'warning');
                      return;
                    }
                    setStep((s) => s + 1);
                  }}
                  className={isMobile ? 'flex-1' : 'min-w-[140px]'}
                >
                  Próximo
                </Button>
              ) : (
                <Button
                  variant="primary"
                  size="lg"
                  icon={<FiCheck />}
                  loading={salvando}
                  disabled={salvando || !isOnline}
                  onClick={concluir}
                  className={isMobile ? 'flex-1' : 'min-w-[180px]'}
                >
                  {salvando ? 'Salvando...' : !isOnline ? 'Aguardando conexão…' : 'Concluir Avaliação'}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Painel de Tutorial */}
      {tutorialAtivo && (() => {
        const tutorialSteps = getTutorialSteps();
        const passo = Math.min(passoTutorial, tutorialSteps.length - 1);
        const atual = tutorialSteps[passo];
        return (
          <div className="fixed bottom-16 sm:bottom-6 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-32px)] sm:w-[480px] rounded-2xl border-2 border-caparao-700 bg-white p-5 shadow-2xl">
            <div className="flex items-start justify-between mb-2">
              <div>
                <span className="text-xs font-semibold text-slate-500">
                  Tutorial · Passo {passo + 1} de {tutorialSteps.length}
                </span>
                <h4 className="text-sm font-bold text-caparao-800">{atual.titulo}</h4>
              </div>
              <button
                type="button"
                onClick={() => setTutorialAtivo(false)}
                className="rounded-md p-1 text-slate-400 hover:text-slate-700"
              >
                <FiX size={16} />
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line mb-4">
              {atual.descricao}
            </p>

            {/* Dots */}
            <div className="flex justify-center gap-1 mb-4">
              {tutorialSteps.map((_, idx) => (
                <div
                  key={idx}
                  onClick={() => setPassoTutorial(idx)}
                  className={cn(
                    'h-1.5 rounded-full cursor-pointer transition-all',
                    idx === passo ? 'w-5 bg-caparao-700' : 'w-2 bg-slate-200'
                  )}
                />
              ))}
            </div>

            <div className="flex justify-between gap-2">
              <Button
                variant="secondary"
                size="sm"
                icon={<FiArrowLeft />}
                disabled={passo === 0}
                onClick={() => setPassoTutorial((p) => p - 1)}
              >
                Anterior
              </Button>
              {passo < tutorialSteps.length - 1 ? (
                <Button
                  variant="primary"
                  size="sm"
                  icon={<FiArrowRight />}
                  onClick={() => setPassoTutorial((p) => p + 1)}
                >
                  Próximo
                </Button>
              ) : (
                <Button
                  variant="primary"
                  size="sm"
                  icon={<FiCheck />}
                  onClick={() => setTutorialAtivo(false)}
                >
                  Entendi!
                </Button>
              )}
            </div>
          </div>
        );
      })()}

      <div
        ref={refAnuncioTutorial}
        aria-live="polite"
        role="status"
        className="sr-only"
      />

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
    </div>
  );
}

function RevisaoFinal({ info, dimensoesLista, respostas, calcularIndiceDimensao, calcularIGS, getClassificacao, totalRespondidos, totalIndicadores }) {
  const igs = calcularIGS();
  const classificacao = getClassificacao(igs);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-bold text-slate-900">
            Resumo da Avaliação
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <span className="block text-slate-500">Propriedade</span>
              <span className="block text-sm font-bold text-slate-900">{info.propriedade?.nome || '—'}</span>
            </div>
            <div>
              <span className="block text-slate-500">Município/UF</span>
              <span className="block text-sm font-semibold text-slate-800">{formatLocalizacao(info.propriedade)}</span>
            </div>
            <div>
              <span className="block text-slate-500">Técnico</span>
              <span className="block text-sm font-semibold text-slate-800">{info.tecnico || 'Não informado'}</span>
            </div>
            <div>
              <span className="block text-slate-500">Data</span>
              <span className="block text-sm font-semibold text-slate-800">{formatarData(info.data)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ICSR calculado */}
      <Card
        className="text-center border-2"
        style={{ borderColor: COR_CLASSIFICACAO[classificacao] || '#9E9E9E' }}
      >
        <CardContent className="p-6">
          <MdOutlineEco
            size={40}
            className="mx-auto"
            style={{ color: COR_CLASSIFICACAO[classificacao] || '#9E9E9E' }}
          />
          <div
            className="mt-2 text-3xl font-black tabular-nums tracking-tight"
            style={{ color: COR_CLASSIFICACAO[classificacao] || '#9E9E9E' }}
          >
            ICSR: {(igs * 100).toFixed(1)}%
          </div>
          <h3
            className="text-base font-bold"
            style={{ color: COR_CLASSIFICACAO[classificacao] || '#9E9E9E' }}
          >
            {classificacao} Sustentabilidade
          </h3>
          <p className="mt-1 text-xs text-slate-500">
            {totalRespondidos}/{totalIndicadores} indicadores avaliados
          </p>
        </CardContent>
      </Card>

      {/* Índices por dimensão */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-bold text-slate-900">
            Índices por Dimensão
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {dimensoesLista.map((d) => {
              const idx = calcularIndiceDimensao(d.codigo);
              return (
                <div
                  key={d.codigo}
                  className="rounded-xl border p-4"
                  style={{
                    backgroundColor: `${d.cor}0A`,
                    borderColor: `${d.cor}33`,
                  }}
                >
                  <span className="block text-xs font-semibold text-slate-600">{d.nome}</span>
                  <span
                    className="block text-2xl font-black tabular-nums mt-0.5"
                    style={{ color: d.cor }}
                  >
                    {idx !== null ? `${(idx * 100).toFixed(1)}%` : '—'}
                  </span>
                  <span className="block text-[11px] text-slate-500 mt-0.5">
                    peso {Math.round(d.peso * 100)}%
                  </span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
