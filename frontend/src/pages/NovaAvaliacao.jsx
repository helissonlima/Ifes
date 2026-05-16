import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Box, Typography, Stepper, Step, StepLabel, StepButton,
  Button, Card, CardContent, Grid, TextField, Autocomplete,
  CircularProgress, Alert, LinearProgress, Paper,
  useMediaQuery, useTheme, MobileStepper,
} from '@mui/material';
import { FiArrowLeft, FiArrowRight, FiCheck, FiSave } from 'react-icons/fi';
import { MdOutlineEco } from 'react-icons/md';
import { propriedadesAPI, avaliacoesAPI, indicadoresAPI } from '../services/api';
import { useApp } from '../context/AppContext';
import DimensaoStep from '../components/Evaluation/DimensaoStep';

const DIMENSOES_ORDEM = ['economica', 'ambiental', 'social', 'gestao_qualidade'];

export default function NovaAvaliacao() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { notify } = useApp();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [step, setStep] = useState(0); // 0=info, 1-4=dimensões, 5=revisão
  const [propriedades, setPropriedades] = useState([]);
  const [dimensoes, setDimensoes] = useState({});
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [avaliacaoId, setAvaliacaoId] = useState(null);
  const [erro, setErro] = useState('');

  // Dados do formulário
  const [info, setInfo] = useState({
    propriedade: null,
    tecnico: '',
    data: new Date().toISOString().split('T')[0],
    observacoes: '',
  });
  const [respostas, setRespostas] = useState({}); // { [indicadorCodigo]: nota }
  const [respostasDetalhes, setRespostasDetalhes] = useState({}); // { [codigo]: { criterio, nome } }

  useEffect(() => {
    Promise.all([
      propriedadesAPI.listar({ limit: 200 }),
      indicadoresAPI.listar(),
    ]).then(([p, ind]) => {
      setPropriedades(p.data.data);
      setDimensoes(ind.data.dimensoes);
      const propId = searchParams.get('propriedade');
      if (propId) {
        const prop = p.data.data.find((x) => x.id === propId);
        if (prop) setInfo((i) => ({ ...i, propriedade: prop }));
      }
    }).catch((e) => setErro(e.message))
    .finally(() => setCarregando(false));
  }, []);

  const dimensoesLista = DIMENSOES_ORDEM.map((d) => dimensoes[d]).filter(Boolean);
  const TOTAL_STEPS = 2 + dimensoesLista.length; // info + dimensões + revisão

  const handleRespostaChange = (dimensaoCodigo, indicadorCodigo, nota, nomeIndicador, criterio) => {
    setRespostas((r) => ({ ...r, [indicadorCodigo]: nota }));
    setRespostasDetalhes((d) => ({ ...d, [indicadorCodigo]: { dimensao: dimensaoCodigo, nome: nomeIndicador, criterio } }));
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

  const salvarRascunho = async () => {
    if (!info.propriedade) { notify('Selecione uma propriedade primeiro', 'warning'); return; }
    setSalvando(true);
    try {
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
        notify('Rascunho salvo!');
      } else {
        await avaliacoesAPI.salvarRespostas(avaliacaoId, { respostas: respostasArr });
        notify('Rascunho atualizado!');
      }
    } catch (e) { notify(e.message, 'error'); }
    finally { setSalvando(false); }
  };

  const concluir = async () => {
    if (!info.propriedade) { notify('Selecione uma propriedade', 'error'); return; }
    if (totalRespondidos < totalIndicadores) {
      const faltam = totalIndicadores - totalRespondidos;
      if (!window.confirm(`Ainda faltam ${faltam} indicador(es) para avaliar. Deseja concluir mesmo assim?`)) return;
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

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <Button startIcon={<FiArrowLeft />} onClick={() => navigate(-1)} size="small">Voltar</Button>
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="h5" fontWeight={800} color="primary.dark">Nova Avaliação</Typography>
          <Typography variant="body2" color="text.secondary">
            {totalRespondidos}/{totalIndicadores} indicadores avaliados
          </Typography>
        </Box>
        <Button
          variant="outlined" startIcon={<FiSave />}
          onClick={salvarRascunho} disabled={salvando || !info.propriedade}
          size="small"
        >
          {salvando ? <CircularProgress size={16} /> : 'Salvar rascunho'}
        </Button>
      </Box>

      {erro && <Alert severity="error" sx={{ mb: 2 }}>{erro}</Alert>}

      {/* Progresso global */}
      <LinearProgress
        variant="determinate"
        value={(totalRespondidos / Math.max(totalIndicadores, 1)) * 100}
        sx={{ height: 6, borderRadius: 3, mb: 2 }}
        color="primary"
      />

      {/* Stepper */}
      {!isMobile ? (
        <Stepper nonLinear activeStep={step} sx={{ mb: 3, overflowX: 'auto' }}>
          {STEP_LABELS.map((label, idx) => (
            <Step key={label} completed={idx < step}>
              <StepButton onClick={() => setStep(idx)}>
                <Typography variant="caption" fontWeight={600}>{label}</Typography>
              </StepButton>
            </Step>
          ))}
        </Stepper>
      ) : (
        <MobileStepper
          variant="text"
          steps={STEP_LABELS.length}
          position="static"
          activeStep={step}
          sx={{ mb: 2, bgcolor: 'transparent', p: 0 }}
          nextButton={<span />}
          backButton={<span />}
        />
      )}

      {/* Progresso do step atual */}
      <LinearProgress
        variant="determinate"
        value={progrStep}
        sx={{ height: 4, borderRadius: 2, mb: 2, bgcolor: '#eee', '& .MuiLinearProgress-bar': { bgcolor: step === 0 ? 'primary.main' : dimensoesLista[step - 1]?.cor } }}
      />

      {/* Conteúdo dos steps */}
      {step === 0 && (
        <Card>
          <CardContent>
            <Typography variant="h6" fontWeight={700} gutterBottom>Informações da Avaliação</Typography>
            <Grid container spacing={2}>
              <Grid size={12}>
                <Autocomplete
                  options={propriedades}
                  getOptionLabel={(o) => `${o.nome} — ${o.municipio}/${o.estado}`}
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
                  <Paper sx={{ p: 1.5, bgcolor: 'primary.50', borderRadius: 2 }} variant="outlined">
                    <Typography variant="caption" color="text.secondary">
                      Proprietário: {info.propriedade.proprietario} · Área café: {info.propriedade.area_cafe || '—'} ha
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
                  fullWidth multiline rows={3} value={info.observacoes}
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
          onChange={(codigo, nota, nome, criterio) =>
            handleRespostaChange(dimensoesLista[step - 1].codigo, codigo, nota, nome, criterio)
          }
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
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3, gap: 2 }}>
        <Button
          startIcon={<FiArrowLeft />}
          onClick={() => setStep((s) => s - 1)}
          disabled={step === 0}
          variant="outlined"
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
          >
            Próximo
          </Button>
        ) : (
          <Button
            startIcon={<FiCheck />}
            onClick={concluir}
            variant="contained"
            color="success"
            disabled={salvando}
            size="large"
          >
            {salvando ? <CircularProgress size={20} /> : 'Concluir Avaliação'}
          </Button>
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
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Typography variant="h6" fontWeight={700} gutterBottom>Resumo da Avaliação</Typography>
          <Grid container spacing={1}>
            <Grid size={6}><Typography variant="caption" color="text.secondary">Propriedade</Typography><br /><Typography variant="body2" fontWeight={600}>{info.propriedade?.nome || '—'}</Typography></Grid>
            <Grid size={6}><Typography variant="caption" color="text.secondary">Município</Typography><br /><Typography variant="body2" fontWeight={600}>{info.propriedade?.municipio || '—'}</Typography></Grid>
            <Grid size={6}><Typography variant="caption" color="text.secondary">Técnico</Typography><br /><Typography variant="body2">{info.tecnico || 'Não informado'}</Typography></Grid>
            <Grid size={6}><Typography variant="caption" color="text.secondary">Data</Typography><br /><Typography variant="body2">{new Date(info.data).toLocaleDateString('pt-BR')}</Typography></Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* IGS calculado */}
      <Card sx={{ mb: 2, border: `2px solid ${COR_CLASS[classificacao]}` }}>
        <CardContent sx={{ textAlign: 'center' }}>
          <MdOutlineEco size={36} color={COR_CLASS[classificacao]} />
          <Typography variant="h4" fontWeight={800} color={COR_CLASS[classificacao]} sx={{ mt: 1 }}>
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
        <CardContent>
          <Typography variant="subtitle1" fontWeight={700} gutterBottom>Índices por Dimensão</Typography>
          <Grid container spacing={1.5}>
            {dimensoesLista.map((d) => {
              const idx = calcularIndiceDimensao(d.codigo);
              return (
                <Grid size={6} key={d.codigo}>
                  <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: `${d.cor}11`, border: `1px solid ${d.cor}33` }}>
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
