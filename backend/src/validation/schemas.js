const { z } = require('zod');
const { localizarIndicador } = require('../models/indicadores');

const DIMENSOES_VALIDAS = ['ambiental', 'economica', 'social', 'gestao_qualidade'];
const NOTAS_VALIDAS = [0, 0.25, 0.5, 0.75, 1];

// --- Paginação (page/limit) ---------------------------------------------
const paginacaoSchema = z
  .object({
    page: z.coerce.number().int().positive().max(1_000_000).default(1),
    limit: z.coerce.number().int().positive().max(500).default(20),
  })
  .passthrough();

// --- Propriedades ---------------------------------------------------------
const numeroOuVazio = z.union([z.coerce.number(), z.literal(''), z.null()]).optional();

const propriedadeGraoSchema = z.object({
  id: z.string().min(1),
  area_plantada: numeroOuVazio,
});

const propriedadeSchema = z.object({
  nome: z.string().trim().min(1, 'Nome é obrigatório').max(200),
  municipio: z.string().trim().min(1, 'Município é obrigatório').max(100),
  // Aceita vazio (o controller aplica o padrão 'ES') ou exatamente 2 letras.
  estado: z.union([z.literal(''), z.string().trim().length(2, 'estado deve ter 2 letras (UF)')]).optional(),
  proprietario: z.string().trim().min(1, 'Proprietário é obrigatório').max(200),
  area_total: numeroOuVazio,
  area_cafe: numeroOuVazio,
  latitude: numeroOuVazio,
  longitude: numeroOuVazio,
  telefone: z.string().optional().nullable(),
  email: z.string().optional().nullable(),
  rua: z.string().optional().nullable(),
  numero: z.string().optional().nullable(),
  complemento: z.string().optional().nullable(),
  bairro: z.string().optional().nullable(),
  cep: z.string().optional().nullable(),
  graos: z.array(propriedadeGraoSchema).optional(),
});

const criarPropriedadeSchema = propriedadeSchema;
// Atualização é parcial: campos omitidos ficam undefined e o controller
// mantém o valor atual em vez de sobrescrever com NULL.
const atualizarPropriedadeSchema = propriedadeSchema.partial();

// --- Avaliações -------------------------------------------------------
const respostaSchema = z
  .object({
    dimensao: z.enum(DIMENSOES_VALIDAS),
    indicador_codigo: z.string().min(1),
    indicador_nome: z.string().optional(),
    nota: z.number().refine((n) => NOTAS_VALIDAS.includes(n), {
      message: 'nota deve ser 0, 0.25, 0.5, 0.75 ou 1',
    }),
    criterio_selecionado: z.string().optional().nullable(),
    observacao: z.string().optional().nullable(),
  })
  .refine(
    (r) => {
      const def = localizarIndicador(r.indicador_codigo);
      return !!def && def.dimensao === r.dimensao;
    },
    { message: 'indicador_codigo desconhecido ou não pertence à dimensao informada' }
  );

const respostasArraySchema = z.array(respostaSchema);

const criarAvaliacaoSchema = z.object({
  propriedade_id: z.string().uuid('propriedade_id inválido'),
  tecnico_responsavel: z.string().optional().nullable(),
  data_avaliacao: z.coerce.date().optional(),
  observacoes: z.string().optional().nullable(),
  respostas: respostasArraySchema.optional(),
});

const salvarRespostasSchema = z.object({
  respostas: respostasArraySchema,
  concluir: z.boolean().optional(),
});

// --- Produção (consulta IBGE) ------------------------------------------
const producaoQuerySchema = z
  .object({
    municipio: z.string().trim().min(1, 'municipio é obrigatório'),
    estado: z.string().trim().regex(/^[A-Za-z]{2}$/, 'estado deve ter 2 letras (UF)'),
    grao_id: z.string().optional(),
  })
  .passthrough();

module.exports = {
  paginacaoSchema,
  criarPropriedadeSchema,
  atualizarPropriedadeSchema,
  respostasArraySchema,
  criarAvaliacaoSchema,
  salvarRespostasSchema,
  producaoQuerySchema,
};
