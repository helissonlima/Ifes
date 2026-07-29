import { useEffect, useState } from 'react';
import { indicadoresAPI } from '../services/api';

// Fonte única da metodologia ICSR no frontend (ver PLANO_MELHORIAS.md M4).
// Pesos e escala de classificação vêm da API (src/models/indicadores.js no
// backend) em vez de hardcoded em cada tela — antes duplicados e já
// divergentes entre si (ex.: faixas com gap decimal, cor da faixa
// "Moderada" diferente em cada cópia).

const CACHE_TTL_MS = 1000 * 60 * 60 * 24; // 24h — pesos/escala mudam raramente
const CACHE_KEY = 'sustenta_metodologia_cache_v1';

// Cache em memória do processo: evita refazer a requisição a cada página
// dentro da mesma sessão do app, mesmo que o localStorage esteja indisponível.
let memoria = null;

function lerCacheLocal() {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed?.expiresAt || Date.now() > parsed.expiresAt) return null;
    return parsed.data;
  } catch {
    return null;
  }
}

function salvarCacheLocal(data) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ data, expiresAt: Date.now() + CACHE_TTL_MS }));
  } catch {
    // localStorage indisponível/cheio — segue só com o cache em memória.
  }
}

async function buscarMetodologia() {
  if (memoria) return memoria;
  const doCache = lerCacheLocal();
  if (doCache) {
    memoria = doCache;
    return memoria;
  }
  const { data } = await indicadoresAPI.metodologia();
  memoria = data;
  salvarCacheLocal(data);
  return data;
}

/**
 * Hook: carrega { dimensoes, escala } uma vez e mantém em cache entre
 * navegações. Enquanto carrega (só acontece na primeira vez na sessão),
 * metodologia vem null — telas devem tratar esse estado transitório.
 */
export function useMetodologia() {
  const [metodologia, setMetodologia] = useState(memoria);
  const [carregando, setCarregando] = useState(!memoria);

  useEffect(() => {
    // Não pula com base em `memoria` aqui: sob Strict Mode (efeito roda,
    // limpa, roda de novo), a 1a chamada já deixa `memoria` setada de forma
    // síncrona antes da 2a rodar — se a 2a pulasse por causa disso, o
    // componente que sobrevive (a 2a) nunca chamaria setCarregando/
    // setMetodologia, e a tela ficaria presa no skeleton pra sempre. Sempre
    // chamar buscarMetodologia() é seguro e barato: ela mesma já retorna
    // memoria/cache na hora quando disponível.
    let ativo = true;
    buscarMetodologia()
      .then((data) => { if (ativo) setMetodologia(data); })
      .finally(() => { if (ativo) setCarregando(false); });
    return () => { ativo = false; };
  }, []);

  return { metodologia, carregando, dimInfo: metodologia ? montarDimInfo(metodologia) : null };
}

/**
 * DIM_INFO no formato usado pelas telas: { [codigo]: { codigo, nome, cor,
 * peso (0-1), pesoPercentual } }. Cada tela mapeia `codigo` para o nome do
 * campo que ela própria consome (ex.: indice_ambiental vs media_ambiental —
 * convenções diferentes entre a resposta de uma avaliação e a de estatísticas
 * agregadas), por isso esse mapeamento fica com a tela, não aqui.
 */
export function montarDimInfo(metodologia) {
  const info = {};
  for (const d of metodologia.dimensoes) {
    info[d.codigo] = {
      codigo: d.codigo,
      nome: d.nome,
      cor: d.cor,
      peso: d.peso,
      pesoPercentual: Math.round(d.peso * 100),
    };
  }
  return info;
}

/**
 * Classifica um IGS (0-1) segundo a escala vinda da API. `escala` é o array
 * retornado por GET /indicadores/metodologia (ou /indicadores). Sem
 * metodologia carregada ainda, retorna null — quem chama decide o que
 * mostrar nesse meio tempo (ex.: nada, ou um Skeleton).
 */
export function getClassificacao(igs, escala) {
  if (igs === null || igs === undefined || !escala?.length) return null;
  const faixa = escala.find((e) => igs <= e.max);
  return (faixa || escala[escala.length - 1]).classificacao;
}

/**
 * Média ponderada dos indicadores de uma dimensão pelo peso interno de cada
 * indicador — mesma fórmula do backend (calcularIndiceDimensao em
 * src/models/indicadores.js). `indicadores` é a lista de indicadores da
 * dimensão (cada um com `codigo` e `peso`); `respostas` é { [codigo]: nota }.
 * Retorna null se nenhum indicador da dimensão foi respondido ainda.
 */
export function calcularIndiceDimensao(indicadores, respostas) {
  const respondidos = (indicadores || []).filter((ind) => respostas[ind.codigo] !== undefined);
  if (respondidos.length === 0) return null;

  const somaPesos = respondidos.reduce((acc, ind) => acc + (ind.peso || 0), 0);
  if (somaPesos === 0) {
    return respondidos.reduce((acc, ind) => acc + respostas[ind.codigo], 0) / respondidos.length;
  }
  return respondidos.reduce((acc, ind) => acc + respostas[ind.codigo] * (ind.peso || 0), 0) / somaPesos;
}

/**
 * Combina os 4 índices de dimensão (0-1 cada) no IGS final, usando os pesos
 * vindos da API. `indices` é { [codigoDimensao]: valor|null }.
 */
export function calcularIGS(indices, metodologia) {
  if (!metodologia?.dimensoes) return 0;
  return metodologia.dimensoes.reduce(
    (acc, d) => acc + (indices[d.codigo] ?? 0) * d.peso,
    0
  );
}
